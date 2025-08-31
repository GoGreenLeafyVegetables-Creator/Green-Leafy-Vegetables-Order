
-- Add INSERT policy for payments table to allow creating old balance payments
CREATE POLICY "Allow insert payments for customers with QR codes" 
  ON public.payments 
  FOR INSERT 
  WITH CHECK (customer_id IN ( 
    SELECT customers.id
    FROM customers
    WHERE (customers.qr_code IS NOT NULL)
  ));

-- Also add UPDATE and DELETE policies for completeness
CREATE POLICY "Allow update payments for customers with QR codes" 
  ON public.payments 
  FOR UPDATE 
  USING (customer_id IN ( 
    SELECT customers.id
    FROM customers
    WHERE (customers.qr_code IS NOT NULL)
  ));

CREATE POLICY "Allow delete payments for customers with QR codes" 
  ON public.payments 
  FOR DELETE 
  USING (customer_id IN ( 
    SELECT customers.id
    FROM customers
    WHERE (customers.qr_code IS NOT NULL)
  ));
