-- Create innovation documents table
CREATE TABLE IF NOT EXISTS innovation_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    upload_status TEXT NOT NULL DEFAULT 'processing' CHECK (upload_status IN ('uploading', 'processing', 'completed', 'error')),
    extracted_content TEXT,
    file_url TEXT,
    extraction_metadata JSONB,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS innovation_documents_user_id_idx ON innovation_documents(user_id);
CREATE INDEX IF NOT EXISTS innovation_documents_user_active_idx ON innovation_documents(user_id, is_active);
CREATE INDEX IF NOT EXISTS innovation_documents_status_idx ON innovation_documents(upload_status);
CREATE INDEX IF NOT EXISTS innovation_documents_created_at_idx ON innovation_documents(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE innovation_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own documents" ON innovation_documents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents" ON innovation_documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" ON innovation_documents
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" ON innovation_documents
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_innovation_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_innovation_documents_updated_at
    BEFORE UPDATE ON innovation_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_innovation_documents_updated_at(); 