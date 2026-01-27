-- Add target_user_id to announcements
ALTER TABLE public.announcements 
ADD COLUMN IF NOT EXISTS target_user_id UUID REFERENCES auth.users(id);

-- Update RLS Policy for filtering
-- Assuming existing policy is "Enable read access for all users"
DROP POLICY IF EXISTS "Enable read access for all users" ON public.announcements;

CREATE POLICY "Enable read access for all users" ON public.announcements
FOR SELECT USING (
    is_active = true AND (
        target_user_id IS NULL OR 
        target_user_id = auth.uid()
    )
);

-- Admin policy should already allow all access, likely defined as:
-- CREATE POLICY "Enable all access for admins" ON public.announcements 
-- FOR ALL USING ( ... check admin role ... );
-- If not, ensure admins can see all messages.
