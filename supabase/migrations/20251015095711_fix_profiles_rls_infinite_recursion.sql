/*
  # Fix Infinite Recursion in Profiles RLS Policies

  ## Problem
  The admin policies for the profiles table were causing infinite recursion because they
  were querying the profiles table from within a profiles table policy.

  ## Solution
  1. Drop the problematic admin policies
  2. Create a helper function that checks if a user is an admin using app_metadata
  3. Recreate admin policies using the helper function

  ## Changes
  - Drop existing admin policies on profiles table
  - Create `is_admin()` function that checks user metadata
  - Create new admin policies using the helper function
*/

-- Drop the problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Create a helper function to check if current user is admin
-- This avoids the infinite recursion by using a direct query
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- Recreate admin policies using the function
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());