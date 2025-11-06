-- Allow riders to view rides they have booking requests for
-- This is needed so message_threads can join with rides table successfully
-- Without this policy, the message_threads query fails because riders can't see ride data

-- Create a security definer function to check if user has booking request
-- This breaks the circular dependency in RLS policies (rides -> booking_requests -> rides)
CREATE OR REPLACE FUNCTION user_has_booking_for_ride(ride_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM booking_requests
    WHERE ride_id = ride_uuid
    AND rider_id = auth.uid()
  );
$$;

-- Now create the policy using the function
CREATE POLICY "Riders can view rides they requested" ON public.rides
    FOR SELECT USING (
        user_has_booking_for_ride(id)
    );
