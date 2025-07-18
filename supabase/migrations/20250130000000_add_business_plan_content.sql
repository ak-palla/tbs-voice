-- Add business_plan_content field to battle_plan table
ALTER TABLE public.battle_plan 
ADD COLUMN business_plan_content text DEFAULT '';

-- Add comment to explain the field
COMMENT ON COLUMN public.battle_plan.business_plan_content IS 'Rich text content for the business plan document'; 