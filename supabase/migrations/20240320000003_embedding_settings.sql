-- Enable the http extension for making HTTP requests
CREATE EXTENSION IF NOT EXISTS http;

-- Create a schema for app settings if it doesn't exist
CREATE SCHEMA IF NOT EXISTS app;

-- Create a settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS app.settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Insert or update the required settings
INSERT INTO app.settings (key, value, description)
VALUES 
  ('edge_function_url', 'https://YOUR_PROJECT_REF.supabase.co/functions/v1', 'Base URL for Edge Functions'),
  ('service_role_key', current_setting('app.settings.service_role_key', true), 'Service role key for Edge Function authentication')
ON CONFLICT (key) DO UPDATE
SET 
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = now();

-- Create a function to update settings
CREATE OR REPLACE FUNCTION app.update_setting(key text, value text, description text DEFAULT NULL)
RETURNS void AS $$
BEGIN
  INSERT INTO app.settings (key, value, description)
  VALUES (key, value, description)
  ON CONFLICT (key) DO UPDATE
  SET 
    value = EXCLUDED.value,
    description = COALESCE(EXCLUDED.description, app.settings.description),
    updated_at = now();
END;
$$ LANGUAGE plpgsql; 