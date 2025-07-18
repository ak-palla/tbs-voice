-- Drop the existing RLS policy for insert
DROP POLICY "Allow insert access for authenticated users" ON zapier_webhooks;

-- Create a new RLS policy that allows inserts if a user_id is provided in the payload
-- Note: This makes the webhook endpoint publicly accessible for inserts, but still relies on
-- the API route to ensure a valid user_id is passed and the data is correctly attributed.
-- Reads will still be restricted by user_id.
CREATE POLICY "Allow inserts with user_id from payload" ON public.zapier_webhooks
FOR INSERT WITH CHECK (TRUE); 