-- Grant admin access to yasinbyl@gmail.com
UPDATE users
SET
  is_admin = TRUE,
  admin_role = 'super_admin',
  admin_verified_at = NOW(),
  updated_at = NOW()
WHERE email = 'yasinbyl@gmail.com';

-- Verify the update
SELECT
  id,
  email,
  first_name,
  last_name,
  is_admin,
  admin_role,
  admin_verified_at
FROM users
WHERE email = 'yasinbyl@gmail.com';
