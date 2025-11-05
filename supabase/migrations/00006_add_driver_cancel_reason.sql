ALTER TABLE public.booking_requests
ADD COLUMN IF NOT EXISTS driver_cancel_reason TEXT;

ALTER TABLE public.booking_requests
ADD COLUMN IF NOT EXISTS rider_cancel_reason TEXT;
