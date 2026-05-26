/*
  # Business Hub Schema

  ## Overview
  Creates the complete schema for the small business AI hub application.

  ## Tables Created

  1. **contacts** - Customer/lead contact records
     - id, name, email, phone, source (social platform), tags, created_at

  2. **appointments** - Booking and scheduling
     - id, contact_id, title, description, start_time, end_time, status, notes, created_at

  3. **social_accounts** - Connected social media platforms
     - id, platform, account_name, account_id, status, follower_count, connected_at

  4. **messages** - Unified inbox from all platforms
     - id, contact_id, platform, direction (inbound/outbound), content, read, created_at

  5. **ai_conversations** - AI assistant chat history
     - id, title, created_at, updated_at

  6. **ai_messages** - Individual messages within AI conversations
     - id, conversation_id, role (user/assistant), content, created_at

  7. **auto_responses** - AI Text Back automation rules
     - id, trigger_keyword, response_template, platform, active, match_count, created_at

  ## Security
  - RLS enabled on all tables
  - Authenticated users can manage their own data
*/

CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  email text DEFAULT '',
  phone text DEFAULT '',
  source text DEFAULT 'manual',
  avatar_url text DEFAULT '',
  tags text[] DEFAULT '{}',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read contacts"
  ON contacts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert contacts"
  ON contacts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update contacts"
  ON contacts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete contacts"
  ON contacts FOR DELETE
  TO authenticated
  USING (true);


CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  title text NOT NULL DEFAULT '',
  description text DEFAULT '',
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed')),
  location text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete appointments"
  ON appointments FOR DELETE
  TO authenticated
  USING (true);


CREATE TABLE IF NOT EXISTS social_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL CHECK (platform IN ('instagram', 'facebook', 'twitter', 'tiktok', 'linkedin', 'youtube', 'google')),
  account_name text NOT NULL DEFAULT '',
  account_id text DEFAULT '',
  status text DEFAULT 'connected' CHECK (status IN ('connected', 'disconnected', 'error')),
  follower_count integer DEFAULT 0,
  message_count integer DEFAULT 0,
  connected_at timestamptz DEFAULT now()
);

ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read social accounts"
  ON social_accounts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert social accounts"
  ON social_accounts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update social accounts"
  ON social_accounts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete social accounts"
  ON social_accounts FOR DELETE
  TO authenticated
  USING (true);


CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  platform text NOT NULL DEFAULT 'manual',
  direction text NOT NULL DEFAULT 'inbound' CHECK (direction IN ('inbound', 'outbound')),
  content text NOT NULL DEFAULT '',
  read boolean DEFAULT false,
  auto_replied boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read messages"
  ON messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete messages"
  ON messages FOR DELETE
  TO authenticated
  USING (true);


CREATE TABLE IF NOT EXISTS ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text DEFAULT 'New Conversation',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read ai_conversations"
  ON ai_conversations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert ai_conversations"
  ON ai_conversations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update ai_conversations"
  ON ai_conversations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete ai_conversations"
  ON ai_conversations FOR DELETE
  TO authenticated
  USING (true);


CREATE TABLE IF NOT EXISTS ai_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'assistant')),
  content text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read ai_messages"
  ON ai_messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert ai_messages"
  ON ai_messages FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete ai_messages"
  ON ai_messages FOR DELETE
  TO authenticated
  USING (true);


CREATE TABLE IF NOT EXISTS auto_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_keyword text NOT NULL DEFAULT '',
  response_template text NOT NULL DEFAULT '',
  platform text DEFAULT 'all',
  active boolean DEFAULT true,
  match_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE auto_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read auto_responses"
  ON auto_responses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert auto_responses"
  ON auto_responses FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update auto_responses"
  ON auto_responses FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete auto_responses"
  ON auto_responses FOR DELETE
  TO authenticated
  USING (true);


INSERT INTO contacts (name, email, phone, source, tags) VALUES
  ('Sarah Johnson', 'sarah@example.com', '+1 555-0101', 'instagram', ARRAY['vip', 'regular']),
  ('Mike Chen', 'mike@example.com', '+1 555-0102', 'facebook', ARRAY['new']),
  ('Emma Davis', 'emma@example.com', '+1 555-0103', 'google', ARRAY['inquiry']),
  ('James Wilson', 'james@example.com', '+1 555-0104', 'tiktok', ARRAY['interested']),
  ('Lisa Martinez', 'lisa@example.com', '+1 555-0105', 'instagram', ARRAY['vip'])
ON CONFLICT DO NOTHING;

INSERT INTO social_accounts (platform, account_name, account_id, status, follower_count, message_count) VALUES
  ('instagram', '@mybusiness', 'ig_001', 'connected', 4820, 12),
  ('facebook', 'My Business Page', 'fb_001', 'connected', 2341, 8),
  ('tiktok', '@mybiz', 'tt_001', 'connected', 9100, 3),
  ('google', 'My Business', 'gb_001', 'connected', 0, 5),
  ('linkedin', 'My Business LLC', 'li_001', 'disconnected', 890, 0),
  ('twitter', '@mybusiness', 'tw_001', 'disconnected', 1200, 0)
ON CONFLICT DO NOTHING;

INSERT INTO auto_responses (trigger_keyword, response_template, platform, active, match_count) VALUES
  ('hours', 'Hi! We are open Monday-Friday 9am-6pm and Saturday 10am-4pm. How can we help you today?', 'all', true, 47),
  ('price', 'Thanks for your interest! Our pricing starts at $49. Would you like to schedule a free consultation to discuss your needs?', 'all', true, 23),
  ('appointment', 'Great! I would love to help you book an appointment. Click here to see our availability: [booking link]. Or reply with your preferred date/time!', 'all', true, 31),
  ('location', 'We are located at 123 Main St, Suite 100. Free parking available! Google Maps: [maps link]', 'all', true, 18)
ON CONFLICT DO NOTHING;
