
-- Add photo columns to customers table
ALTER TABLE public.customers 
ADD COLUMN photo_url TEXT;

-- Add photo columns to vegetables table  
ALTER TABLE public.vegetables
ADD COLUMN photo_url TEXT;

-- Create storage bucket for customer photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('customer-photos', 'customer-photos', true);

-- Create storage bucket for vegetable photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('vegetable-photos', 'vegetable-photos', true);

-- Create RLS policies for customer photos bucket
CREATE POLICY "Allow public read access on customer photos" ON storage.objects
FOR SELECT USING (bucket_id = 'customer-photos');

CREATE POLICY "Allow authenticated users to upload customer photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'customer-photos');

CREATE POLICY "Allow authenticated users to update customer photos" ON storage.objects
FOR UPDATE USING (bucket_id = 'customer-photos');

CREATE POLICY "Allow authenticated users to delete customer photos" ON storage.objects
FOR DELETE USING (bucket_id = 'customer-photos');

-- Create RLS policies for vegetable photos bucket
CREATE POLICY "Allow public read access on vegetable photos" ON storage.objects
FOR SELECT USING (bucket_id = 'vegetable-photos');

CREATE POLICY "Allow authenticated users to upload vegetable photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'vegetable-photos');

CREATE POLICY "Allow authenticated users to update vegetable photos" ON storage.objects
FOR UPDATE USING (bucket_id = 'vegetable-photos');

CREATE POLICY "Allow authenticated users to delete vegetable photos" ON storage.objects
FOR DELETE USING (bucket_id = 'vegetable-photos');
