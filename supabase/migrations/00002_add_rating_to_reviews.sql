ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating BETWEEN 1 AND 5) DEFAULT 5;

UPDATE public.reviews
SET rating = COALESCE(rating, 5);
