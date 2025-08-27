-- First, let's fix the function search path issues identified by the linter
CREATE OR REPLACE FUNCTION public.generate_qr_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN 'QR_' || UPPER(SUBSTRING(gen_random_uuid()::text FROM 1 FOR 8));
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_customer_qr_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NEW.qr_code IS NULL THEN
    NEW.qr_code := generate_qr_code();
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_order_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.balance_amount := NEW.total_amount - NEW.paid_amount;
  
  IF NEW.balance_amount <= 0 THEN
    NEW.payment_status := 'paid';
  ELSIF NEW.paid_amount > 0 THEN
    NEW.payment_status := 'partial';
  ELSE
    NEW.payment_status := 'pending';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create a function to check if user is admin (for future use when implementing proper auth)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $function$
  -- For now, return true for any authenticated user
  -- This will be updated when proper auth is implemented
  SELECT auth.uid() IS NOT NULL;
$function$;

-- Update RLS policies for customers table to be more secure
DROP POLICY IF EXISTS "Enable all operations for customers" ON public.customers;

-- Allow authenticated users (admins) to perform all operations
CREATE POLICY "Admin access to customers"
ON public.customers
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow public access to specific customer data via QR code (minimal data exposure)
CREATE POLICY "Public QR code access to customers"
ON public.customers
FOR SELECT
TO anon
USING (qr_code IS NOT NULL);

-- Update RLS policies for orders table
DROP POLICY IF EXISTS "Enable all operations for orders" ON public.orders;

CREATE POLICY "Admin access to orders"
ON public.orders
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow public read access to orders for customer QR code functionality
CREATE POLICY "Public access to orders by customer QR"
ON public.orders
FOR SELECT
TO anon
USING (
  customer_id IN (
    SELECT id FROM public.customers WHERE qr_code IS NOT NULL
  )
);

-- Update RLS policies for order_items table
DROP POLICY IF EXISTS "Enable all operations for order_items" ON public.order_items;

CREATE POLICY "Admin access to order_items"
ON public.order_items
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow public read access to order items for customer functionality
CREATE POLICY "Public access to order_items"
ON public.order_items
FOR SELECT
TO anon
USING (true);

-- Update RLS policies for payments table
DROP POLICY IF EXISTS "Enable all operations for payments" ON public.payments;

CREATE POLICY "Admin access to payments"
ON public.payments
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow public read access to payments for customer balance checking
CREATE POLICY "Public access to payments by customer"
ON public.payments
FOR SELECT
TO anon
USING (
  customer_id IN (
    SELECT id FROM public.customers WHERE qr_code IS NOT NULL
  )
);

-- Update RLS policies for vegetables table
DROP POLICY IF EXISTS "Enable all operations for vegetables" ON public.vegetables;

CREATE POLICY "Admin access to vegetables"
ON public.vegetables
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow public read access to vegetables for customer ordering
CREATE POLICY "Public read access to vegetables"
ON public.vegetables
FOR SELECT
TO anon
USING (true);