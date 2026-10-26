/*
# Create blog-images storage bucket

1. Storage
  - Creates a public bucket `blog-images` for storing blog post images
  - Images are publicly accessible via URL (no auth required to view)
  - Upload/delete restricted to anon + authenticated (admin dashboard uses anon key)

2. Policies
  - Public SELECT: anyone can view/download images
  - Anon/authenticated INSERT: admin can upload images
  - Anon/authenticated UPDATE: admin can replace images
  - Anon/authenticated DELETE: admin can remove images

3. Important Notes
  - The bucket is public so images can be served directly in blog posts
  - File size limit is handled client-side
  - Images are organized by slug: blog-images/{post-slug}/{filename}
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-images',
  'blog-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read blog images" ON storage.objects;
CREATE POLICY "Public read blog images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'blog-images');

DROP POLICY IF EXISTS "Upload blog images" ON storage.objects;
CREATE POLICY "Upload blog images"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'blog-images');

DROP POLICY IF EXISTS "Update blog images" ON storage.objects;
CREATE POLICY "Update blog images"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'blog-images')
WITH CHECK (bucket_id = 'blog-images');

DROP POLICY IF EXISTS "Delete blog images" ON storage.objects;
CREATE POLICY "Delete blog images"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'blog-images');
