-- Create storage bucket for customer PDF reports if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('customer-pdf-reports', 'customer-pdf-reports', false)
ON CONFLICT (id) DO NOTHING;

-- Create policies for customer PDF reports bucket
CREATE POLICY "Admin can manage customer PDF reports" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'customer-pdf-reports');

CREATE POLICY "Public can view customer PDF reports by path" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'customer-pdf-reports');

-- Update existing customer_pdf_reports table to ensure it has proper structure
ALTER TABLE public.customer_pdf_reports 
ADD COLUMN IF NOT EXISTS storage_path text;

-- Create index on customer_id for better performance
CREATE INDEX IF NOT EXISTS idx_customer_pdf_reports_customer_id 
ON public.customer_pdf_reports(customer_id);

-- Create index on created_at for better performance
CREATE INDEX IF NOT EXISTS idx_customer_pdf_reports_created_at 
ON public.customer_pdf_reports(created_at DESC);