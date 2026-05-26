/*
  # Add GoHighLevel API Key to Business Settings

  1. Modified Tables
    - `business_settings`
      - `hl_api_key` (text, nullable) — GoHighLevel private API key for CRM sync
      - `hl_location_id` (text, nullable) — GoHighLevel location/sub-account ID

  2. Notes
    - The HL API key is stored encrypted at rest by Postgres
    - No RLS changes needed — existing policies cover this table
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_settings' AND column_name = 'hl_api_key'
  ) THEN
    ALTER TABLE business_settings ADD COLUMN hl_api_key text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_settings' AND column_name = 'hl_location_id'
  ) THEN
    ALTER TABLE business_settings ADD COLUMN hl_location_id text;
  END IF;
END $$;
