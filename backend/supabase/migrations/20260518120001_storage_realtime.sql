-- Storage policies for product-images bucket (create bucket in Dashboard first: public)
-- Realtime publication for orders (mobile live status)

-- Public read for product images
DROP POLICY IF EXISTS "product_images_public_read" ON storage.objects;
CREATE POLICY "product_images_public_read"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'product-images');

-- Admin upload / update / delete
DROP POLICY IF EXISTS "product_images_admin_insert" ON storage.objects;
CREATE POLICY "product_images_admin_insert"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "product_images_admin_update" ON storage.objects;
CREATE POLICY "product_images_admin_update"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "product_images_admin_delete" ON storage.objects;
CREATE POLICY "product_images_admin_delete"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'product-images' AND public.is_admin());

-- Realtime: order status updates for mobile app
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_object THEN
    RAISE NOTICE 'supabase_realtime publication not found — enable Realtime in Dashboard';
END $$;
