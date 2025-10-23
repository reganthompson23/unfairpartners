-- Add country column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country text NOT NULL DEFAULT '';

-- Update the column to be NOT NULL with empty string default for existing rows
-- New rows will be required to provide a country

