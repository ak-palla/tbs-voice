-- Add user_id column to zapier_webhooks table
ALTER TABLE zapier_webhooks
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update RLS policy to include user_id
DROP POLICY "Allow read access to all users" ON zapier_webhooks;
DROP POLICY "Allow insert access for authenticated users" ON zapier_webhooks;

CREATE POLICY "Allow read access to user's own webhooks" ON zapier_webhooks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow insert access for authenticated users" ON zapier_webhooks FOR INSERT WITH CHECK (auth.uid() = user_id); 