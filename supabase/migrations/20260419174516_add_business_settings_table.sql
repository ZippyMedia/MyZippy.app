/*
  # Add Business Settings Table

  ## Summary
  Creates a persistent store for all settings that previously lived only in React state.

  ## New Tables
  - `business_settings`
    - `id` (uuid, primary key)
    - `user_id` (uuid, nullable — single-row per user, or global row if no auth)
    - `business_name` (text)
    - `email` (text)
    - `phone` (text)
    - `website` (text)
    - `address` (text)
    - `city` (text)
    - `state` (text)
    - `industry` (text)
    - `bio` (text)
    - `notification_new_message` (boolean)
    - `notification_new_appointment` (boolean)
    - `notification_appointment_reminder` (boolean)
    - `notification_ai_auto_reply` (boolean)
    - `notification_weekly_report` (boolean)
    - `notification_marketing_tips` (boolean)
    - `ai_auto_reply_enabled` (boolean)
    - `ai_response_delay` (integer seconds)
    - `ai_tone` (text)
    - `ai_language` (text)
    - `ai_sign_off` (text)
    - `ai_greeting_enabled` (boolean)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ## Security
  - RLS enabled
  - Authenticated users can only read/write their own row
  - Unauthenticated users can read/write the single anonymous row (user_id IS NULL)
    so the app works without mandatory auth
*/

CREATE TABLE IF NOT EXISTS business_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text NOT NULL DEFAULT 'My Business',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  website text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  state text NOT NULL DEFAULT '',
  industry text NOT NULL DEFAULT 'Beauty & Wellness',
  bio text NOT NULL DEFAULT '',
  notification_new_message boolean NOT NULL DEFAULT true,
  notification_new_appointment boolean NOT NULL DEFAULT true,
  notification_appointment_reminder boolean NOT NULL DEFAULT true,
  notification_ai_auto_reply boolean NOT NULL DEFAULT true,
  notification_weekly_report boolean NOT NULL DEFAULT false,
  notification_marketing_tips boolean NOT NULL DEFAULT false,
  ai_auto_reply_enabled boolean NOT NULL DEFAULT true,
  ai_response_delay integer NOT NULL DEFAULT 30,
  ai_tone text NOT NULL DEFAULT 'friendly',
  ai_language text NOT NULL DEFAULT 'english',
  ai_sign_off text NOT NULL DEFAULT 'The Team',
  ai_greeting_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users manage own settings"
  ON business_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users insert own settings"
  ON business_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users update own settings"
  ON business_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anon users can read null-user settings"
  ON business_settings FOR SELECT
  TO anon
  USING (user_id IS NULL);

CREATE POLICY "Anon users can insert null-user settings"
  ON business_settings FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

CREATE POLICY "Anon users can update null-user settings"
  ON business_settings FOR UPDATE
  TO anon
  USING (user_id IS NULL)
  WITH CHECK (user_id IS NULL);
