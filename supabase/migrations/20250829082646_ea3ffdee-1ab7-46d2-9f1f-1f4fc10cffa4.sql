
-- Add customer_code column to customers table
ALTER TABLE public.customers 
ADD COLUMN customer_code TEXT UNIQUE;

-- Add old_balance column to customers table  
ALTER TABLE public.customers 
ADD COLUMN old_balance NUMERIC DEFAULT 0;

-- Create a function to generate customer codes
CREATE OR REPLACE FUNCTION public.generate_customer_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  next_number INTEGER;
  customer_code TEXT;
BEGIN
  -- Get the highest existing customer number
  SELECT COALESCE(MAX(CAST(SUBSTRING(customer_code FROM 8) AS INTEGER)), 0) + 1
  INTO next_number
  FROM customers 
  WHERE customer_code LIKE 'SGLV-%';
  
  -- Format the customer code
  customer_code := 'SGLV-' || LPAD(next_number::TEXT, 4, '0');
  
  RETURN customer_code;
END;
$$;

-- Create trigger to auto-generate customer codes for new customers
CREATE OR REPLACE FUNCTION public.set_customer_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.customer_code IS NULL THEN
    NEW.customer_code := generate_customer_code();
  END IF;
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_set_customer_code ON public.customers;
CREATE TRIGGER trigger_set_customer_code
  BEFORE INSERT ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION set_customer_code();

-- Update existing customers with customer codes
DO $$
DECLARE
    customer_record RECORD;
    counter INTEGER := 1;
BEGIN
    FOR customer_record IN 
        SELECT id FROM customers WHERE customer_code IS NULL ORDER BY created_at
    LOOP
        UPDATE customers 
        SET customer_code = 'SGLV-' || LPAD(counter::TEXT, 4, '0')
        WHERE id = customer_record.id;
        counter := counter + 1;
    END LOOP;
END $$;

-- Create function to reset customer orders and payments only (keep customer record)
CREATE OR REPLACE FUNCTION public.reset_customer_billing_data(customer_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Delete order items first (due to foreign key constraints)
  DELETE FROM order_items WHERE order_id IN (
    SELECT id FROM orders WHERE customer_id = customer_uuid
  );
  
  -- Delete orders
  DELETE FROM orders WHERE customer_id = customer_uuid;
  
  -- Delete payments
  DELETE FROM payments WHERE customer_id = customer_uuid;
  
  -- Reset old_balance to 0
  UPDATE customers SET old_balance = 0 WHERE id = customer_uuid;
END;
$$;
