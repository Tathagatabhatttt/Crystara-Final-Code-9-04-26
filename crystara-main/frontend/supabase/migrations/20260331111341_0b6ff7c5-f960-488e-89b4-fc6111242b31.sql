ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS photos text[] DEFAULT '{}';

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('review-photos', 'review-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "review_photos_select" ON storage.objects FOR SELECT TO public USING (bucket_id = 'review-photos');
CREATE POLICY "review_photos_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'review-photos');
CREATE POLICY "review_photos_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'review-photos' AND public.has_role(auth.uid(), 'admin'));