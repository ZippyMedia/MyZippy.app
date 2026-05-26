/*
  # Add Broadcast Posts Table

  ## Overview
  Adds a table for storing social media broadcast posts — messages composed once
  and sent to multiple social media platforms simultaneously.

  ## New Tables

  1. **broadcast_posts** - Stores broadcast messages and their delivery status per platform
     - `id` (uuid, primary key)
     - `content` (text) — the message body
     - `image_url` (text) — optional image attachment URL
     - `platforms` (text[]) — list of target platform names
     - `status` (text) — draft | scheduled | sent | failed
     - `scheduled_at` (timestamptz) — optional future send time
     - `sent_at` (timestamptz) — when actually sent
     - `platform_results` (jsonb) — per-platform success/error details
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

  ## Security
  - RLS enabled with authenticated-user access policies (select, insert, update, delete)
*/

CREATE TABLE IF NOT EXISTS broadcast_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL DEFAULT '',
  image_url text DEFAULT '',
  platforms text[] DEFAULT '{}',
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent', 'failed')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  platform_results jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE broadcast_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read broadcast_posts"
  ON broadcast_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert broadcast_posts"
  ON broadcast_posts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update broadcast_posts"
  ON broadcast_posts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete broadcast_posts"
  ON broadcast_posts FOR DELETE
  TO authenticated
  USING (true);
