-- Ensure luggage_capacity default matches luggage_size[] enum type
ALTER TABLE public.vehicles
  ALTER COLUMN luggage_capacity
  SET DEFAULT ARRAY[
    'small'::luggage_size,
    'carry_on'::luggage_size
  ];
