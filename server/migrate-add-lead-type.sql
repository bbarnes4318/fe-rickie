-- Add lead_type column to distinguish prospects from applications
-- Run with: node server/run-migration-lead-type.js

ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS lead_type VARCHAR(20) DEFAULT 'application';

-- Update index for lead_type filtering
CREATE INDEX IF NOT EXISTS idx_applications_lead_type ON applications(lead_type);
