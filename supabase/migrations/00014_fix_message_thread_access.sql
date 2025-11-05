-- Fix message thread and message access policies
-- Allow any user with a booking request (regardless of status) to access chat

DROP POLICY IF EXISTS "Users can view messages for their rides" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages in their threads" ON public.messages;
DROP POLICY IF EXISTS "Users can update messages in their threads" ON public.messages;
DROP POLICY IF EXISTS "Users can view their message threads" ON public.message_threads;

-- Allow viewing messages if user is driver OR has any booking request for the ride
CREATE POLICY "Users can view messages for their rides" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM message_threads mt
            JOIN rides r ON mt.ride_id = r.id
            WHERE mt.id = thread_id
            AND (
                auth.uid() = r.driver_id OR
                EXISTS (
                    SELECT 1 FROM booking_requests br
                    WHERE br.ride_id = r.id
                    AND br.rider_id = auth.uid()
                )
            )
        )
    );

-- Allow sending messages if user is driver OR has pending/approved booking request
CREATE POLICY "Users can send messages in their threads" ON public.messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM message_threads mt
            JOIN rides r ON mt.ride_id = r.id
            WHERE mt.id = thread_id
            AND (
                auth.uid() = r.driver_id OR
                EXISTS (
                    SELECT 1 FROM booking_requests br
                    WHERE br.ride_id = r.id
                    AND br.rider_id = auth.uid()
                    AND br.status IN ('approved', 'pending')
                )
            )
        )
    );

-- Allow updating messages (mark as read) if user is driver OR has any booking request
CREATE POLICY "Users can update messages in their threads" ON public.messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM message_threads mt
            JOIN rides r ON mt.ride_id = r.id
            WHERE mt.id = thread_id
            AND (
                auth.uid() = r.driver_id OR
                EXISTS (
                    SELECT 1 FROM booking_requests br
                    WHERE br.ride_id = r.id
                    AND br.rider_id = auth.uid()
                )
            )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM message_threads mt
            JOIN rides r ON mt.ride_id = r.id
            WHERE mt.id = thread_id
            AND (
                auth.uid() = r.driver_id OR
                EXISTS (
                    SELECT 1 FROM booking_requests br
                    WHERE br.ride_id = r.id
                    AND br.rider_id = auth.uid()
                )
            )
        )
    );

-- Allow viewing message threads if user is driver OR has any booking request for the ride
CREATE POLICY "Users can view their message threads" ON public.message_threads
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM rides r
            WHERE r.id = message_threads.ride_id
            AND (
                r.driver_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM booking_requests br
                    WHERE br.ride_id = message_threads.ride_id
                    AND br.rider_id = auth.uid()
                )
            )
        )
    );
