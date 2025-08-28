
-- Create storage bucket for customer PDF reports
INSERT INTO storage.buckets (id, name, public) 
VALUES ('customer-reports', 'customer-reports', false);

-- Create RLS policies for customer reports bucket
CREATE POLICY "Admin can upload customer reports" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'customer-reports' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Admin can view customer reports" ON storage.objects
FOR SELECT USING (
  bucket_id = 'customer-reports' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Admin can update customer reports" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'customer-reports' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Admin can delete customer reports" ON storage.objects
FOR DELETE USING (
  bucket_id = 'customer-reports' AND
  auth.uid() IS NOT NULL
);
