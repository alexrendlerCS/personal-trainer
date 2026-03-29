-- Add "Intro to VT Sessions" training type to sessions and packages tables
-- This is a new 30-minute session type that can only be added by trainers

-- Update sessions table constraint to include new type
ALTER TABLE sessions 
DROP CONSTRAINT IF EXISTS sessions_type_check;

ALTER TABLE sessions 
ADD CONSTRAINT sessions_type_check 
CHECK (type IN (
  'In-Person Training', 
  'Virtual Training', 
  'Partner Training', 
  'Posing Package',
  'Intro to VT Sessions'
));

-- Update packages table constraint to include new type
ALTER TABLE packages 
DROP CONSTRAINT IF EXISTS packages_package_type_check;

ALTER TABLE packages 
ADD CONSTRAINT packages_package_type_check 
CHECK (package_type IN (
  'In-Person Training', 
  'Virtual Training', 
  'Partner Training', 
  'Posing Package',
  'Intro to VT Sessions'
));

-- Add comment explaining the new type
COMMENT ON CONSTRAINT sessions_type_check ON sessions IS 
'Allowed session types: In-Person Training (60min), Virtual Training (60min), Partner Training (60min), Posing Package (60min), Intro to VT Sessions (30min trainer-only)';

COMMENT ON CONSTRAINT packages_package_type_check ON packages IS 
'Allowed package types: In-Person Training, Virtual Training, Partner Training, Posing Package, Intro to VT Sessions (30min trainer-only, no purchase flow)';
