-- Migration script to add agent phone tracking columns
-- Run this on the existing database to add new columns without losing data

ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS annual_premium DECIMAL(10,2);

ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS last_call_date TIMESTAMP;

ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS last_disposition VARCHAR(100);

ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS call_notes TEXT;

-- Verify the migration
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'applications' 
AND column_name IN ('annual_premium', 'last_call_date', 'last_disposition', 'call_notes');
