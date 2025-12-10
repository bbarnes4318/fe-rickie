// Type definitions for screen pop functionality
// Converted from TypeScript interfaces in callpop.tsx

export const POST_FIELD_DEFINITIONS = [
  { name: 'lead_token', label: 'Lead Token', type: 'string', required: true },
  { name: 'caller_id', label: 'Caller ID', type: 'string', required: true },
  { name: 'first_name', label: 'First Name', type: 'string', required: true },
  { name: 'last_name', label: 'Last Name', type: 'string', required: true },
  { name: 'email', label: 'Email', type: 'string', required: false },
  { name: 'address', label: 'Address', type: 'string', required: false },
  { name: 'city', label: 'City', type: 'string', required: false },
  { name: 'state', label: 'State', type: 'string', required: false },
  { name: 'zip', label: 'ZIP Code', type: 'string', required: false },
  { name: 'dob', label: 'Date of Birth (YYYY-MM-DD)', type: 'date', required: false },
  { name: 'age', label: 'Age', type: 'number', required: false },
  { name: 'jornaya_leadid', label: 'Jornaya LeadID', type: 'string', required: false },
  { name: 'trusted_form_cert_url', label: 'TrustedForm Certificate URL', type: 'string', required: false },
  { name: 'tcpa_opt_in', label: 'TCPA Opt-In', type: 'boolean', required: false },
  { name: 'tcpa_optin_consent_language', label: 'TCPA Consent Language', type: 'string', required: false },
  { name: 'beneficiary', label: 'Beneficiary', type: 'string', required: false },
  { name: 'coverage_amount', label: 'Coverage Amount', type: 'number', required: false },
  { name: 'bank_account', label: 'Bank Account', type: 'boolean', required: false },
  { name: 'power_of_attorney', label: 'Power of Attorney', type: 'boolean', required: false },
  { name: 'nursing_home', label: 'Nursing Home', type: 'boolean', required: false },
  { name: 'dementia', label: 'Dementia', type: 'boolean', required: false }
];

export const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 
  'Wisconsin', 'Wyoming'
];

export const BUFFER_TIMES = [30, 60, 90, 120, 180, 240];
export const BILLING_CYCLES = ['Daily', 'Weekly', 'Weekly Net 7', 'Weekly Net 10', 'Net 15', 'Net 30'];
