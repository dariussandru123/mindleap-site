/*
# Create contact_submissions and resource_leads tables

1. New Tables
  - `contact_submissions`
    - `id` (uuid, primary key)
    - `name` (text, not null)
    - `email` (text, not null)
    - `phone` (text, nullable)
    - `message` (text, not null)
    - `status` (text, default 'new')
    - `created_at` (timestamptz)
  - `resource_leads`
    - `id` (uuid, primary key)
    - `name` (text, not null)
    - `email` (text, not null)
    - `resource_id` (text, not null)
    - `resource_title` (text, not null)
    - `resource_type` (text, nullable)
    - `resource_file` (text, nullable)
    - `status` (text, default 'new')
    - `created_at` (timestamptz)

2. Security
  - Enable RLS on both tables.
  - Allow anon + authenticated full CRUD (single-tenant admin app, no user auth).
    Data is written by public form submissions and read by the admin dashboard.

3. Notes
  - These tables store leads from the public website contact form and resource download forms.
  - The admin dashboard reads all entries; public visitors insert new entries.
*/

CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_contact_submissions" ON contact_submissions;
CREATE POLICY "anon_select_contact_submissions" ON contact_submissions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_contact_submissions" ON contact_submissions;
CREATE POLICY "anon_insert_contact_submissions" ON contact_submissions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_contact_submissions" ON contact_submissions;
CREATE POLICY "anon_update_contact_submissions" ON contact_submissions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_contact_submissions" ON contact_submissions;
CREATE POLICY "anon_delete_contact_submissions" ON contact_submissions FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS resource_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  resource_id text NOT NULL,
  resource_title text NOT NULL,
  resource_type text,
  resource_file text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE resource_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_resource_leads" ON resource_leads;
CREATE POLICY "anon_select_resource_leads" ON resource_leads FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_resource_leads" ON resource_leads;
CREATE POLICY "anon_insert_resource_leads" ON resource_leads FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_resource_leads" ON resource_leads;
CREATE POLICY "anon_update_resource_leads" ON resource_leads FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_resource_leads" ON resource_leads;
CREATE POLICY "anon_delete_resource_leads" ON resource_leads FOR DELETE
  TO anon, authenticated USING (true);
