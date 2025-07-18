-- Enable RLS on the machines table
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own machines
CREATE POLICY "Users can view their own machines"
ON public.machines
FOR SELECT
USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own machines
CREATE POLICY "Users can insert their own machines"
ON public.machines
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own machines
CREATE POLICY "Users can update their own machines"
ON public.machines
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to delete their own machines
CREATE POLICY "Users can delete their own machines"
ON public.machines
FOR DELETE
USING (auth.uid() = user_id); 