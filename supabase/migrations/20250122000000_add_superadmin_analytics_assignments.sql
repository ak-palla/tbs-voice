-- Create table for superadmin Google Analytics assignments
CREATE TABLE IF NOT EXISTS superadmin_analytics_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    superadmin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    property_id TEXT NOT NULL,
    property_name TEXT,
    account_name TEXT,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Add constraint to ensure only one active assignment per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_assignment 
ON superadmin_analytics_assignments (assigned_user_id) 
WHERE is_active = true;

-- Create table for superadmin Google Analytics tokens (separate from user tokens)
CREATE TABLE IF NOT EXISTS superadmin_google_analytics_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    superadmin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_type TEXT DEFAULT 'Bearer',
    expires_at TIMESTAMP WITH TIME ZONE,
    scope TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Only one token per superadmin
    UNIQUE(superadmin_user_id)
);

-- Enable RLS
ALTER TABLE superadmin_analytics_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE superadmin_google_analytics_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for superadmin_analytics_assignments
CREATE POLICY "Superadmins can manage all assignments" ON superadmin_analytics_assignments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM business_info 
            WHERE user_id = auth.uid() 
            AND role = 'super_admin'
        )
    );

CREATE POLICY "Users can view their own assignments" ON superadmin_analytics_assignments
    FOR SELECT USING (assigned_user_id = auth.uid());

-- RLS Policies for superadmin_google_analytics_tokens  
CREATE POLICY "Superadmins can manage their own tokens" ON superadmin_google_analytics_tokens
    FOR ALL USING (superadmin_user_id = auth.uid());

-- Trigger to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_superadmin_google_analytics_tokens_updated_at 
    BEFORE UPDATE ON superadmin_google_analytics_tokens 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 