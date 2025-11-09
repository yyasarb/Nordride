-- Add female_only column to rides table
-- This allows drivers to mark rides as female-only for safety and comfort

ALTER TABLE rides
ADD COLUMN female_only BOOLEAN NOT NULL DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN rides.female_only IS 'Indicates if this ride is restricted to female passengers only. When true, only female-identified users can request to join.';

-- Create index for faster filtering on female-only rides
CREATE INDEX idx_rides_female_only ON rides(female_only) WHERE female_only = true;

-- Add comment on index
COMMENT ON INDEX idx_rides_female_only IS 'Partial index for efficient filtering of female-only rides in search queries';
