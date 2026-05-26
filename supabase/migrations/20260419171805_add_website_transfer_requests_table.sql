
/*
  # Create website_transfer_requests table

  ## Purpose
  Stores customer requests to have their existing business website
  transferred/replicated as an AI-powered website by Zippy Media.

  ## New Tables
  - `website_transfer_requests`
    - `id` (uuid, primary key)
    - `user_id` (uuid, references auth.users)
    - `business_name` (text) - name of the customer's business
    - `existing_website_url` (text) - URL of their current website to migrate
    - `additional_notes` (text) - any extra info or preferences
    - `status` (text) - pending | in_progress | completed | cancelled
    - `submitted_at` (timestamptz)
    - `updated_at` (timestamptz)

  ## Security
  - RLS enabled
  - Authenticated users can insert and read their own requests
  - Authenticated users can update their own pending requests
*/

CREATE TABLE IF NOT EXISTS website_transfer_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text NOT NULL DEFAULT '',
  existing_website_url text NOT NULL DEFAULT '',
  additional_notes text DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  submitted_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE website_transfer_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own website requests"
  ON website_transfer_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own website requests"
  ON website_transfer_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own pending website requests"
  ON website_transfer_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);
