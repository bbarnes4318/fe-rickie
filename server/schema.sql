-- Drop and recreate applications table with all fields from additions.txt
DROP TABLE IF EXISTS applications;

CREATE TABLE applications (
  id SERIAL PRIMARY KEY,
  app_id VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending',
  date DATE DEFAULT CURRENT_DATE,
  
  -- Carrier & Policy
  carrier VARCHAR(100),
  plan_type VARCHAR(100),
  monthly_premium DECIMAL(10,2),
  face_amount INTEGER,
  willing_to_accept BOOLEAN DEFAULT FALSE,
  
  -- Personal
  first_name VARCHAR(100),
  middle_name VARCHAR(100),
  last_name VARCHAR(100),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(10),
  zip VARCHAR(20),
  state_of_birth VARCHAR(10),
  dob DATE,
  age INTEGER,
  ssn VARCHAR(20),
  gender VARCHAR(20),
  height VARCHAR(20),
  weight INTEGER,
  tobacco BOOLEAN,
  
  -- Owner (if different from insured)
  owner_name VARCHAR(200),
  owner_rel VARCHAR(100),
  owner_ssn VARCHAR(20),
  owner_address TEXT,
  
  -- Beneficiaries
  primary_ben_name VARCHAR(200),
  primary_ben_rel VARCHAR(100),
  contingent_ben_name VARCHAR(200),
  contingent_ben_rel VARCHAR(100),
  
  -- Riders
  grandchild_rider BOOLEAN DEFAULT FALSE,
  grandchild_count INTEGER DEFAULT 0,
  grandchild_units INTEGER DEFAULT 0,
  
  -- Existing Insurance
  has_existing BOOLEAN,
  will_replace BOOLEAN,
  
  -- Physician
  physician_name VARCHAR(200),
  
  -- Health Questions (all booleans)
  q1 BOOLEAN,
  q2 BOOLEAN,
  q3 BOOLEAN,
  q4 BOOLEAN,
  q5 BOOLEAN,
  q6 BOOLEAN,
  q7a BOOLEAN,
  q7b BOOLEAN,
  q7c BOOLEAN,
  q7d BOOLEAN,
  q8a BOOLEAN,
  q8b BOOLEAN,
  q8c BOOLEAN,
  
  -- Banking
  account_name VARCHAR(200),
  account_type VARCHAR(50) DEFAULT 'checking',
  bank_name VARCHAR(200),
  bank_address TEXT,
  routing VARCHAR(50),
  account_num VARCHAR(50),
  draft_schedule VARCHAR(50),
  draft_date VARCHAR(50),
  
  -- Metadata
  risk_score INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_date ON applications(date);
CREATE INDEX IF NOT EXISTS idx_applications_carrier ON applications(carrier);
