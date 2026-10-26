/*
# Secure RLS policies for admin authentication

## Summary
Tightens Row Level Security policies across all tables to require authentication
for admin operations (read submissions, manage blog posts) while keeping anonymous
insert access for public form submissions.

## Changes

### contact_submissions
- SELECT: restricted to authenticated users only (admin reads submissions)
- INSERT: anon + authenticated (public form submissions)
- UPDATE: authenticated only (admin marks status)
- DELETE: authenticated only (admin cleanup)

### resource_leads
- SELECT: restricted to authenticated users only (admin reads leads)
- INSERT: anon + authenticated (public form submissions)
- UPDATE: authenticated only (admin marks status)
- DELETE: authenticated only (admin cleanup)

### blog_posts
- SELECT: anon can read published posts only; authenticated can read all
- INSERT: authenticated only (admin creates posts)
- UPDATE: authenticated only (admin edits posts)
- DELETE: authenticated only (admin deletes posts)

### storage.objects (blog-images bucket)
- SELECT: public (images served on site)
- INSERT: authenticated only
- UPDATE: authenticated only
- DELETE: authenticated only

## Security
- Anonymous users can only submit forms and read published blog posts
- All admin operations require Supabase email/password authentication
- No data is lost; only policy access levels are changed
*/

-- ═══════════════════════════════════════════════════════
-- contact_submissions: public insert, admin-only read/update/delete
-- ═══════════════════════════════════════════════════════

DROP POLICY IF EXISTS "anon_select_contact_submissions" ON contact_submissions;
CREATE POLICY "authenticated_select_contact_submissions" ON contact_submissions FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_contact_submissions" ON contact_submissions;
CREATE POLICY "public_insert_contact_submissions" ON contact_submissions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_contact_submissions" ON contact_submissions;
CREATE POLICY "authenticated_update_contact_submissions" ON contact_submissions FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_contact_submissions" ON contact_submissions;
CREATE POLICY "authenticated_delete_contact_submissions" ON contact_submissions FOR DELETE
  TO authenticated USING (true);

-- ═══════════════════════════════════════════════════════
-- resource_leads: public insert, admin-only read/update/delete
-- ═══════════════════════════════════════════════════════

DROP POLICY IF EXISTS "anon_select_resource_leads" ON resource_leads;
CREATE POLICY "authenticated_select_resource_leads" ON resource_leads FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_resource_leads" ON resource_leads;
CREATE POLICY "public_insert_resource_leads" ON resource_leads FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_resource_leads" ON resource_leads;
CREATE POLICY "authenticated_update_resource_leads" ON resource_leads FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_resource_leads" ON resource_leads;
CREATE POLICY "authenticated_delete_resource_leads" ON resource_leads FOR DELETE
  TO authenticated USING (true);

-- ═══════════════════════════════════════════════════════
-- blog_posts: public reads published only, admin full CRUD
-- ═══════════════════════════════════════════════════════

DROP POLICY IF EXISTS "anon_select_blog_posts" ON blog_posts;
CREATE POLICY "public_select_published_blog_posts" ON blog_posts FOR SELECT
  TO anon USING (published = true);

DROP POLICY IF EXISTS "authenticated_select_blog_posts" ON blog_posts;
CREATE POLICY "authenticated_select_all_blog_posts" ON blog_posts FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_blog_posts" ON blog_posts;
CREATE POLICY "authenticated_insert_blog_posts" ON blog_posts FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_blog_posts" ON blog_posts;
CREATE POLICY "authenticated_update_blog_posts" ON blog_posts FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_blog_posts" ON blog_posts;
CREATE POLICY "authenticated_delete_blog_posts" ON blog_posts FOR DELETE
  TO authenticated USING (true);

-- ═══════════════════════════════════════════════════════
-- storage: blog-images - public read, authenticated write
-- ═══════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Public read blog images" ON storage.objects;
CREATE POLICY "Public read blog images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'blog-images');

DROP POLICY IF EXISTS "Upload blog images" ON storage.objects;
CREATE POLICY "Upload blog images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog-images');

DROP POLICY IF EXISTS "Update blog images" ON storage.objects;
CREATE POLICY "Update blog images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'blog-images')
WITH CHECK (bucket_id = 'blog-images');

DROP POLICY IF EXISTS "Delete blog images" ON storage.objects;
CREATE POLICY "Delete blog images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'blog-images');
