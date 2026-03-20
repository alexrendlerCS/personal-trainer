-- Migration: Add phone, first_name, and last_name fields to users table
-- Date: 2026-03-19
-- Purpose: Support split name fields and phone number for better client management
--          Keeps full_name for backward compatibility

-- Add phone number field (optional)
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Add first_name and last_name fields (optional to support existing data)
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(255);

-- Add comments for clarity
COMMENT ON COLUMN users.phone IS 'Optional phone number for client contact';
COMMENT ON COLUMN users.first_name IS 'First name of the user (new signups will populate this)';
COMMENT ON COLUMN users.last_name IS 'Last name of the user (new signups will populate this)';

-- Note: full_name column is kept for backward compatibility
-- New sign-ups will populate both first_name/last_name AND full_name
-- Existing users will continue to work with just full_name
