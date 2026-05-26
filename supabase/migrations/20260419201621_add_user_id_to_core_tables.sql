/*
  # Add user_id to all core tables for proper multi-user data isolation

  ## Summary
  Adds a user_id column to every core business data table so that each authenticated
  user only sees and manages their own records. Also replaces the overly-permissive
  "USING (true)" RLS policies with proper ownership checks.

  ## Tables Modified
  - contacts — add user_id, update RLS to filter by auth.uid()
  - appointments — add user_id, update RLS
  - social_accounts — add user_id, update RLS
  - messages — add user_id, update RLS
  - ai_conversations — add user_id, update RLS
  - ai_messages — inherits isolation via conversation FK (no direct user_id needed)
  - auto_responses — add user_id, update RLS
  - broadcast_posts — add user_id, update RLS (if table exists)
  - business_settings — already has user_id column, fix policy
  - website_transfer_requests — already has user_id column, no changes needed

  ## Security Changes
  - Drop all "USING (true)" policies
  - Replace with "USING (auth.uid() = user_id)" ownership checks
  - Edge functions (auto-reply, ai-chat) use service-role key and bypass RLS,
    so they can still write assistant messages on behalf of any user

  ## Important Notes
  1. Existing rows get user_id = NULL (graceful — they are unauthenticated seed data)
  2. New INSERT policies require auth.uid() to match user_id, preventing cross-user writes
  3. anon role retains SELECT on subscriptions (needed for trial/paywall flow)
*/

-- ==================== CONTACTS ====================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE contacts ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DROP POLICY IF EXISTS "Authenticated users can read contacts" ON contacts;
DROP POLICY IF EXISTS "Authenticated users can insert contacts" ON contacts;
DROP POLICY IF EXISTS "Authenticated users can update contacts" ON contacts;
DROP POLICY IF EXISTS "Authenticated users can delete contacts" ON contacts;

CREATE POLICY "Users can read own contacts"
  ON contacts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contacts"
  ON contacts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contacts"
  ON contacts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own contacts"
  ON contacts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS contacts_user_id_idx ON contacts(user_id);


-- ==================== APPOINTMENTS ====================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE appointments ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DROP POLICY IF EXISTS "Authenticated users can read appointments" ON appointments;
DROP POLICY IF EXISTS "Authenticated users can insert appointments" ON appointments;
DROP POLICY IF EXISTS "Authenticated users can update appointments" ON appointments;
DROP POLICY IF EXISTS "Authenticated users can delete appointments" ON appointments;

CREATE POLICY "Users can read own appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own appointments"
  ON appointments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS appointments_user_id_idx ON appointments(user_id);


-- ==================== SOCIAL ACCOUNTS ====================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'social_accounts' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE social_accounts ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DROP POLICY IF EXISTS "Authenticated users can read social accounts" ON social_accounts;
DROP POLICY IF EXISTS "Authenticated users can insert social accounts" ON social_accounts;
DROP POLICY IF EXISTS "Authenticated users can update social accounts" ON social_accounts;
DROP POLICY IF EXISTS "Authenticated users can delete social accounts" ON social_accounts;

CREATE POLICY "Users can read own social accounts"
  ON social_accounts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own social accounts"
  ON social_accounts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own social accounts"
  ON social_accounts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own social accounts"
  ON social_accounts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS social_accounts_user_id_idx ON social_accounts(user_id);


-- ==================== MESSAGES ====================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE messages ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DROP POLICY IF EXISTS "Authenticated users can read messages" ON messages;
DROP POLICY IF EXISTS "Authenticated users can insert messages" ON messages;
DROP POLICY IF EXISTS "Authenticated users can update messages" ON messages;
DROP POLICY IF EXISTS "Authenticated users can delete messages" ON messages;

CREATE POLICY "Users can read own messages"
  ON messages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages"
  ON messages FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS messages_user_id_idx ON messages(user_id);


-- ==================== AI CONVERSATIONS ====================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_conversations' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE ai_conversations ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DROP POLICY IF EXISTS "Authenticated users can read ai_conversations" ON ai_conversations;
DROP POLICY IF EXISTS "Authenticated users can insert ai_conversations" ON ai_conversations;
DROP POLICY IF EXISTS "Authenticated users can update ai_conversations" ON ai_conversations;
DROP POLICY IF EXISTS "Authenticated users can delete ai_conversations" ON ai_conversations;

CREATE POLICY "Users can read own ai_conversations"
  ON ai_conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ai_conversations"
  ON ai_conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ai_conversations"
  ON ai_conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own ai_conversations"
  ON ai_conversations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS ai_conversations_user_id_idx ON ai_conversations(user_id);


-- ==================== AI MESSAGES ====================
-- ai_messages inherit isolation through ai_conversations FK + ON DELETE CASCADE
-- RLS: user can access messages only for conversations they own
DROP POLICY IF EXISTS "Authenticated users can read ai_messages" ON ai_messages;
DROP POLICY IF EXISTS "Authenticated users can insert ai_messages" ON ai_messages;
DROP POLICY IF EXISTS "Authenticated users can delete ai_messages" ON ai_messages;

CREATE POLICY "Users can read own ai_messages"
  ON ai_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ai_conversations
      WHERE ai_conversations.id = ai_messages.conversation_id
      AND ai_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own ai_messages"
  ON ai_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ai_conversations
      WHERE ai_conversations.id = ai_messages.conversation_id
      AND ai_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own ai_messages"
  ON ai_messages FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ai_conversations
      WHERE ai_conversations.id = ai_messages.conversation_id
      AND ai_conversations.user_id = auth.uid()
    )
  );


-- ==================== AUTO RESPONSES ====================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'auto_responses' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE auto_responses ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DROP POLICY IF EXISTS "Authenticated users can read auto_responses" ON auto_responses;
DROP POLICY IF EXISTS "Authenticated users can insert auto_responses" ON auto_responses;
DROP POLICY IF EXISTS "Authenticated users can update auto_responses" ON auto_responses;
DROP POLICY IF EXISTS "Authenticated users can delete auto_responses" ON auto_responses;

CREATE POLICY "Users can read own auto_responses"
  ON auto_responses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own auto_responses"
  ON auto_responses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own auto_responses"
  ON auto_responses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own auto_responses"
  ON auto_responses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS auto_responses_user_id_idx ON auto_responses(user_id);


-- ==================== BROADCAST POSTS (if exists) ====================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'broadcast_posts') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'broadcast_posts' AND column_name = 'user_id'
    ) THEN
      ALTER TABLE broadcast_posts ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- Drop old policies
    BEGIN DROP POLICY IF EXISTS "Authenticated users can read broadcast_posts" ON broadcast_posts; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN DROP POLICY IF EXISTS "Authenticated users can insert broadcast_posts" ON broadcast_posts; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN DROP POLICY IF EXISTS "Authenticated users can update broadcast_posts" ON broadcast_posts; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN DROP POLICY IF EXISTS "Authenticated users can delete broadcast_posts" ON broadcast_posts; EXCEPTION WHEN OTHERS THEN NULL; END;

    BEGIN
      CREATE POLICY "Users can read own broadcast_posts"
        ON broadcast_posts FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
      CREATE POLICY "Users can insert own broadcast_posts"
        ON broadcast_posts FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = user_id);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
      CREATE POLICY "Users can update own broadcast_posts"
        ON broadcast_posts FOR UPDATE
        TO authenticated
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
      CREATE POLICY "Users can delete own broadcast_posts"
        ON broadcast_posts FOR DELETE
        TO authenticated
        USING (auth.uid() = user_id);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;


-- ==================== BUSINESS SETTINGS ====================
-- Already has user_id. Fix overly permissive policies.
DROP POLICY IF EXISTS "Authenticated users can manage own business settings" ON business_settings;
DROP POLICY IF EXISTS "Anon users can manage single settings row" ON business_settings;
DROP POLICY IF EXISTS "Users can select own settings" ON business_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON business_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON business_settings;

CREATE POLICY "Authenticated users can select own settings"
  ON business_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert own settings"
  ON business_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own settings"
  ON business_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ==================== SUBSCRIPTIONS ====================
-- Add user_id link for when users authenticate
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Keep the existing anon policies for user_identifier-based trial tracking
-- but also add a policy for authenticated users to read their own subscription
DROP POLICY IF EXISTS "Authenticated users can read own subscription" ON subscriptions;
CREATE POLICY "Authenticated users can read own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_identifier IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update own subscription" ON subscriptions;
CREATE POLICY "Authenticated users can update own subscription"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
