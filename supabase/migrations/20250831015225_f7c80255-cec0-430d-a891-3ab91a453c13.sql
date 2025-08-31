
-- Create table to store PDF reports
CREATE TABLE public.customer_pdf_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL DEFAULT 'customer_report',
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for PDF reports
ALTER TABLE public.customer_pdf_reports ENABLE ROW LEVEL SECURITY;

-- Admin access to all PDF reports
CREATE POLICY "Admin access to customer_pdf_reports" 
  ON public.customer_pdf_reports 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Public read access for customers with QR codes
CREATE POLICY "Public access to customer PDF reports" 
  ON public.customer_pdf_reports 
  FOR SELECT 
  USING (customer_id IN ( 
    SELECT customers.id
    FROM customers
    WHERE (customers.qr_code IS NOT NULL)
  ));

-- Create storage bucket for customer PDF reports if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'customer-pdf-reports',
  'customer-pdf-reports',
  false,
  52428800, -- 50MB limit
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Add RLS policies for the storage bucket
CREATE POLICY "Admin access to customer PDF reports storage"
  ON storage.objects FOR ALL
  USING (bucket_id = 'customer-pdf-reports')
  WITH CHECK (bucket_id = 'customer-pdf-reports');

CREATE POLICY "Public read access to customer PDF reports storage"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'customer-pdf-reports' AND
    (storage.foldername(name))[1] IN (
      SELECT customers.qr_code
      FROM public.customers
      WHERE customers.qr_code IS NOT NULL
    )
  );
