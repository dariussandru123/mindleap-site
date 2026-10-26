/*
# Create blog_posts table (single-tenant, no auth)

1. New Tables
  - `blog_posts`
    - `id` (text, primary key) - matches the blog post identifier/slug
    - `slug` (text, unique, not null) - URL slug for the post
    - `title` (text, not null) - post title
    - `excerpt` (text) - short description/summary
    - `content` (text) - full HTML body content of the article
    - `read_time` (text) - estimated reading time (e.g. "12 min")
    - `date_label` (text) - human-readable date label (e.g. "6 feb. 2026")
    - `date_published` (text) - ISO date string for sorting/SEO
    - `author` (text) - author name
    - `icon` (text) - tabler icon class
    - `cover_image` (text) - path to cover image
    - `cover_image_alt` (text) - alt text for cover image
    - `published` (boolean, default false) - whether the post is visible on the public site
    - `created_at` (timestamptz) - row creation time
    - `updated_at` (timestamptz) - last modification time

2. Security
  - Enable RLS on `blog_posts`.
  - Allow anon + authenticated full CRUD (single-tenant admin app, no user auth).
    Data is read at build time by the Astro static site and managed via the admin dashboard.

3. Important Notes
  - The `content` field stores the full HTML body that gets rendered on the public blog page.
  - Posts with `published = false` are drafts and won't appear on the public site.
  - The `id` and `slug` fields are identical by convention for this project.
*/

CREATE TABLE IF NOT EXISTS blog_posts (
  id text PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text,
  content text,
  read_time text,
  date_label text,
  date_published text,
  author text,
  icon text,
  cover_image text,
  cover_image_alt text,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_blog_posts" ON blog_posts;
CREATE POLICY "anon_select_blog_posts" ON blog_posts FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_blog_posts" ON blog_posts;
CREATE POLICY "anon_insert_blog_posts" ON blog_posts FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_blog_posts" ON blog_posts;
CREATE POLICY "anon_update_blog_posts" ON blog_posts FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_blog_posts" ON blog_posts;
CREATE POLICY "anon_delete_blog_posts" ON blog_posts FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts (published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_date ON blog_posts (date_published DESC);
