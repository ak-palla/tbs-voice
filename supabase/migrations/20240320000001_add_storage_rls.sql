-- Create policy to allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'machines' AND
  (storage.foldername(name))[1] = 'growth_machines' OR
  (storage.foldername(name))[1] = 'fulfillment_machines'
);

-- Create policy to allow users to read their own files
CREATE POLICY "Users can read their own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'machines' AND
  (
    (storage.foldername(name))[1] = 'growth_machines' OR
    (storage.foldername(name))[1] = 'fulfillment_machines'
  )
);

-- Create policy to allow users to update their own files
CREATE POLICY "Users can update their own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'machines' AND
  (
    (storage.foldername(name))[1] = 'growth_machines' OR
    (storage.foldername(name))[1] = 'fulfillment_machines'
  )
)
WITH CHECK (
  bucket_id = 'machines' AND
  (
    (storage.foldername(name))[1] = 'growth_machines' OR
    (storage.foldername(name))[1] = 'fulfillment_machines'
  )
);

-- Create policy to allow users to delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'machines' AND
  (
    (storage.foldername(name))[1] = 'growth_machines' OR
    (storage.foldername(name))[1] = 'fulfillment_machines'
  )
); 