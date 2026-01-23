-- Fix RLS policies for announcements table
-- Run this in Supabase SQL Editor

-- 1. Enable RLS if not already enabled
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Admins can insert announcements" ON announcements;
DROP POLICY IF EXISTS "Admins can update announcements" ON announcements;
DROP POLICY IF EXISTS "Admins can delete announcements" ON announcements;
DROP POLICY IF EXISTS "Anyone can view active announcements" ON announcements;
DROP POLICY IF EXISTS "Admins can view all announcements" ON announcements;

-- 3. Create policy: Anyone can view active announcements
CREATE POLICY "Anyone can view active announcements"
ON announcements FOR SELECT
USING (is_active = true);

-- 4. Create policy: Admins can view ALL announcements (including inactive)
CREATE POLICY "Admins can view all announcements"
ON announcements FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- 5. Create policy: Admins can INSERT announcements
CREATE POLICY "Admins can insert announcements"
ON announcements FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- 6. Create policy: Admins can UPDATE announcements
CREATE POLICY "Admins can update announcements"
ON announcements FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- 7. Create policy: Admins can DELETE announcements
CREATE POLICY "Admins can delete announcements"
ON announcements FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);
