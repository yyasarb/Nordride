-- =====================================================
-- ADMIN SYSTEM MIGRATION
-- =====================================================
-- Creates admin roles, permissions, and audit logging
-- for the Nordride admin panel
-- =====================================================

-- 1. Create admin_roles enum
CREATE TYPE admin_role AS ENUM ('super_admin', 'moderator', 'support');

-- 2. Add admin fields to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS admin_role admin_role,
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS admin_verified_at TIMESTAMPTZ;

-- 3. Create admin_audit_log table for tracking admin actions
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'user_suspend', 'user_unsuspend', 'ride_cancel', 'report_resolve', etc.
  target_type TEXT NOT NULL, -- 'user', 'ride', 'report', 'review', etc.
  target_id UUID NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create indexes for performance
CREATE INDEX idx_admin_audit_log_admin_id ON admin_audit_log(admin_id);
CREATE INDEX idx_admin_audit_log_created_at ON admin_audit_log(created_at DESC);
CREATE INDEX idx_admin_audit_log_action_type ON admin_audit_log(action_type);
CREATE INDEX idx_admin_audit_log_target ON admin_audit_log(target_type, target_id);
CREATE INDEX idx_users_is_admin ON users(is_admin) WHERE is_admin = TRUE;

-- 5. Create admin statistics view
CREATE OR REPLACE VIEW admin_stats AS
SELECT
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_30d,
  (SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '7 days') as new_users_7d,
  (SELECT COUNT(*) FROM users WHERE is_blocked = TRUE) as blocked_users,
  (SELECT COUNT(*) FROM rides) as total_rides,
  (SELECT COUNT(*) FROM rides WHERE created_at >= NOW() - INTERVAL '30 days') as new_rides_30d,
  (SELECT COUNT(*) FROM rides WHERE status = 'published') as active_rides,
  (SELECT COUNT(*) FROM rides WHERE completed = TRUE) as completed_rides,
  (SELECT COUNT(*) FROM booking_requests) as total_bookings,
  (SELECT COUNT(*) FROM booking_requests WHERE status = 'approved') as approved_bookings,
  (SELECT COUNT(*) FROM reports WHERE status = 'pending') as pending_reports,
  (SELECT COUNT(*) FROM reports WHERE status = 'reviewing') as reviewing_reports,
  (SELECT COUNT(*) FROM reviews) as total_reviews,
  (SELECT COUNT(*) FROM message_threads) as total_conversations;

-- 6. Create RLS policies for admin tables
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON admin_audit_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = TRUE
    )
  );

-- Only admins can insert audit logs
CREATE POLICY "Admins can insert audit logs"
  ON admin_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = TRUE
    )
  );

-- 7. Create helper function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
  p_action_type TEXT,
  p_target_type TEXT,
  p_target_id UUID,
  p_details JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_id UUID;
  v_log_id UUID;
BEGIN
  -- Get current user ID
  v_admin_id := auth.uid();

  -- Verify user is admin
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = v_admin_id AND is_admin = TRUE) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can perform this action';
  END IF;

  -- Insert audit log
  INSERT INTO admin_audit_log (admin_id, action_type, target_type, target_id, details)
  VALUES (v_admin_id, p_action_type, p_target_type, p_target_id, p_details)
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

-- 8. Create function to suspend user
CREATE OR REPLACE FUNCTION admin_suspend_user(
  p_user_id UUID,
  p_duration_hours INTEGER,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_blocked_until TIMESTAMPTZ;
  v_result JSONB;
BEGIN
  -- Calculate blocked_until timestamp
  v_blocked_until := NOW() + (p_duration_hours || ' hours')::INTERVAL;

  -- Update user
  UPDATE users
  SET
    is_blocked = TRUE,
    blocked_until = v_blocked_until,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Log action
  PERFORM log_admin_action(
    'user_suspend',
    'user',
    p_user_id,
    jsonb_build_object(
      'duration_hours', p_duration_hours,
      'reason', p_reason,
      'blocked_until', v_blocked_until
    )
  );

  v_result := jsonb_build_object(
    'success', TRUE,
    'user_id', p_user_id,
    'blocked_until', v_blocked_until
  );

  RETURN v_result;
END;
$$;

-- 9. Create function to unsuspend user
CREATE OR REPLACE FUNCTION admin_unsuspend_user(
  p_user_id UUID,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Update user
  UPDATE users
  SET
    is_blocked = FALSE,
    blocked_until = NULL,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Log action
  PERFORM log_admin_action(
    'user_unsuspend',
    'user',
    p_user_id,
    jsonb_build_object('reason', p_reason)
  );

  v_result := jsonb_build_object(
    'success', TRUE,
    'user_id', p_user_id
  );

  RETURN v_result;
END;
$$;

-- 10. Create function to force cancel ride
CREATE OR REPLACE FUNCTION admin_cancel_ride(
  p_ride_id UUID,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Update ride
  UPDATE rides
  SET
    status = 'cancelled',
    cancelled_at = NOW(),
    updated_at = NOW()
  WHERE id = p_ride_id;

  -- Cancel all pending bookings
  UPDATE booking_requests
  SET
    status = 'cancelled',
    cancelled_at = NOW(),
    updated_at = NOW()
  WHERE ride_id = p_ride_id
    AND status IN ('pending', 'approved');

  -- Log action
  PERFORM log_admin_action(
    'ride_cancel',
    'ride',
    p_ride_id,
    jsonb_build_object('reason', p_reason)
  );

  v_result := jsonb_build_object(
    'success', TRUE,
    'ride_id', p_ride_id
  );

  RETURN v_result;
END;
$$;

-- 11. Create function to resolve report
CREATE OR REPLACE FUNCTION admin_resolve_report(
  p_report_id UUID,
  p_action_taken TEXT,
  p_admin_notes TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Update report
  UPDATE reports
  SET
    status = 'resolved',
    action_taken = p_action_taken,
    admin_notes = p_admin_notes,
    resolved_at = NOW()
  WHERE id = p_report_id;

  -- Log action
  PERFORM log_admin_action(
    'report_resolve',
    'report',
    p_report_id,
    jsonb_build_object(
      'action_taken', p_action_taken,
      'admin_notes', p_admin_notes
    )
  );

  v_result := jsonb_build_object(
    'success', TRUE,
    'report_id', p_report_id
  );

  RETURN v_result;
END;
$$;

-- 12. Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION log_admin_action TO authenticated;
GRANT EXECUTE ON FUNCTION admin_suspend_user TO authenticated;
GRANT EXECUTE ON FUNCTION admin_unsuspend_user TO authenticated;
GRANT EXECUTE ON FUNCTION admin_cancel_ride TO authenticated;
GRANT EXECUTE ON FUNCTION admin_resolve_report TO authenticated;

-- 13. Comment on tables and columns
COMMENT ON TABLE admin_audit_log IS 'Audit log for all admin actions performed in the system';
COMMENT ON COLUMN users.is_admin IS 'Whether the user has admin access to the admin panel';
COMMENT ON COLUMN users.admin_role IS 'Admin role level: super_admin, moderator, or support';
COMMENT ON COLUMN users.admin_notes IS 'Internal notes about the admin user';
COMMENT ON COLUMN users.admin_verified_at IS 'When the admin account was verified/approved';
