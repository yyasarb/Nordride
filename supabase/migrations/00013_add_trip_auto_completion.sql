-- Add arrival_time column to rides table
ALTER TABLE public.rides
ADD COLUMN IF NOT EXISTS arrival_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;

-- Create index for faster querying of non-completed rides
CREATE INDEX IF NOT EXISTS idx_rides_auto_complete ON public.rides (arrival_time, completed)
WHERE completed = false AND arrival_time IS NOT NULL;

-- Function to auto-complete trips based on time or manual completion
CREATE OR REPLACE FUNCTION auto_complete_trips()
RETURNS void AS $$
BEGIN
    -- Auto-complete trips where 5+ hours have passed since arrival_time
    UPDATE public.rides
    SET
        completed = true,
        completed_at = NOW(),
        status = 'completed'
    WHERE
        completed = false
        AND arrival_time IS NOT NULL
        AND arrival_time + INTERVAL '5 hours' < NOW()
        AND status IN ('confirmed', 'departed');

    -- Make reviews visible for completed trips
    UPDATE public.reviews r
    SET is_visible = true
    WHERE r.ride_id IN (
        SELECT id FROM public.rides WHERE completed = true
    )
    AND is_visible = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if all participants marked trip as complete
CREATE OR REPLACE FUNCTION check_manual_completion()
RETURNS TRIGGER AS $$
DECLARE
    driver_marked BOOLEAN;
    all_riders_marked BOOLEAN;
    total_approved_riders INTEGER;
    riders_marked_count INTEGER;
BEGIN
    -- Get the driver_id for this ride
    SELECT EXISTS (
        SELECT 1 FROM trip_completions tc
        JOIN rides r ON tc.ride_id = r.id
        WHERE tc.ride_id = NEW.ride_id
        AND tc.rider_id = r.driver_id
        AND tc.marked_by = 'driver'
    ) INTO driver_marked;

    -- Count total approved riders
    SELECT COUNT(*) INTO total_approved_riders
    FROM booking_requests
    WHERE ride_id = NEW.ride_id
    AND status = 'approved';

    -- Count how many riders have marked complete
    SELECT COUNT(*) INTO riders_marked_count
    FROM trip_completions
    WHERE ride_id = NEW.ride_id
    AND marked_by = 'rider';

    -- Check if all riders marked (only if there are riders)
    IF total_approved_riders > 0 THEN
        all_riders_marked := (riders_marked_count >= total_approved_riders);
    ELSE
        all_riders_marked := true; -- No riders, so consider as "all marked"
    END IF;

    -- If driver and all riders have marked, complete the trip
    IF driver_marked AND all_riders_marked THEN
        UPDATE rides
        SET
            completed = true,
            completed_at = NOW(),
            status = 'completed'
        WHERE id = NEW.ride_id
        AND completed = false;

        -- Make reviews visible
        UPDATE reviews
        SET is_visible = true
        WHERE ride_id = NEW.ride_id
        AND is_visible = false;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check manual completion when trip_completions are inserted
DROP TRIGGER IF EXISTS check_manual_completion_trigger ON public.trip_completions;
CREATE TRIGGER check_manual_completion_trigger
    AFTER INSERT ON public.trip_completions
    FOR EACH ROW
    EXECUTE FUNCTION check_manual_completion();

-- Grant execute permission
GRANT EXECUTE ON FUNCTION auto_complete_trips() TO authenticated;
GRANT EXECUTE ON FUNCTION check_manual_completion() TO authenticated;

-- Note: To schedule this function to run every 30-60 minutes, you need to:
-- 1. Enable pg_cron extension in Supabase dashboard
-- 2. Run this in SQL editor:
--    SELECT cron.schedule(
--      'auto-complete-trips',
--      '*/30 * * * *', -- Every 30 minutes
--      $$ SELECT auto_complete_trips(); $$
--    );
