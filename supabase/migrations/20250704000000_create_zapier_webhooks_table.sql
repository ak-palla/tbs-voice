-- Create the zapier_webhooks table
CREATE TABLE zapier_webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    source_app TEXT,
    event_type TEXT,
    raw_payload JSONB NOT NULL,
    field1 TEXT,
    field2 TEXT,
    field3 TEXT,
    field4 TEXT,
    field5 TEXT,
    field6 TEXT
);

-- Add RLS to the zapier_webhooks table
ALTER TABLE zapier_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to all users" ON zapier_webhooks FOR SELECT USING (TRUE);
CREATE POLICY "Allow insert access for authenticated users" ON zapier_webhooks FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Optional: Add an index to created_at for faster queries if needed
CREATE INDEX idx_zapier_webhooks_created_at ON zapier_webhooks (created_at); 