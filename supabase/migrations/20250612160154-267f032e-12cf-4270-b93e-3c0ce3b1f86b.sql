
-- Add payment_method column to orders table
ALTER TABLE public.orders 
ADD COLUMN payment_method text DEFAULT 'cash';

-- Update existing orders to have a default payment method
UPDATE public.orders 
SET payment_method = 'cash' 
WHERE payment_method IS NULL;
