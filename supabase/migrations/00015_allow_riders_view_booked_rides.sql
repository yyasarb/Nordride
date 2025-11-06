-- Allow riders to view rides they have booking requests for
-- This is needed so message_threads can join with rides table successfully
-- Without this policy, the message_threads query fails because riders can't see ride data

CREATE POLICY "Riders can view rides they requested" ON public.rides
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM booking_requests br
            WHERE br.ride_id = rides.id
            AND br.rider_id = auth.uid()
        )
    );
