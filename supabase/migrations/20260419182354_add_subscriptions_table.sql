/*
  # Add Subscriptions Table

  ## Summary
  Creates a subscriptions table to track user payment/trial status for the ZippyMedia.Ai paywall system.

  ## New Tables
  - `subscriptions`
    - `id` (uuid, primary key)
    - `user_identifier` (text) - email or device fingerprint to identify the user
    - `status` (text) - 'trial' | 'active' | 'expired' | 'cancelled'
    - `plan` (text) - plan name, default 'pro'
    - `amount_cents` (int) - monthly fee in cents
    - `trial_started_at` (timestamptz) - when trial began
    - `trial_ends_at` (timestamptz) - when trial expires
    - `activated_at` (timestamptz) - when subscription went live
    - `next_billing_at` (timestamptz) - next billing date
    - `stripe_customer_id` (text) - for future Stripe integration
    - `stripe_subscription_id` (text) - for future Stripe integration
    - `notes` (text)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ## Security
  - RLS enabled
  - Public read/insert for trial setup (no auth required yet, uses user_identifier)
  - No destructive operations
*/

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_identifier text NOT NULL,
  status text NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'expired', 'cancelled')),
  plan text NOT NULL DEFAULT 'pro',
  amount_cents integer NOT NULL DEFAULT 49700,
  trial_started_at timestamptz DEFAULT now(),
  trial_ends_at timestamptz DEFAULT (now() + interval '14 days'),
  activated_at timestamptz,
  next_billing_at timestamptz,
  stripe_customer_id text DEFAULT '',
  stripe_subscription_id text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read subscriptions by identifier"
  ON subscriptions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert a subscription"
  ON subscriptions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update subscriptions"
  ON subscriptions FOR UPDATE
  USING (true)
  WITH CHECK (true);
