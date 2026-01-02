// Webhook Integration Specifications for Call Pop Platform
// This file defines the exact API specs and data structure

// ==================== WEBHOOK ENDPOINT SPECIFICATIONS ====================

/**
 * WEBHOOK ENDPOINT URL FORMAT
 * POST https://your-domain.com/api/callpop/webhook
 * 
 * Headers:
 * Content-Type: application/json
 * Authorization: Bearer YOUR_API_KEY (optional)
 * X-Webhook-Source: trackdrive|webhook|iframe
 */

// ==================== REQUIRED DATA STRUCTURE ====================

const WEBHOOK_PAYLOAD_SPEC = {
  // REQUIRED FIELDS - Must be present in every webhook
  lead_token: "string",           // Unique identifier for the lead
  caller_id: "string",           // Phone number of the caller
  first_name: "string",          // Customer's first name
  last_name: "string",           // Customer's last name
  
  // OPTIONAL CUSTOMER DATA
  email: "string",               // Customer email address
  address: "string",            // Street address
  city: "string",               // City name
  state: "string",              // State name
  zip: "string",                // ZIP code
  dob: "string",                // Date of birth (YYYY-MM-DD format)
  age: "number",                // Age in years
  
  // COMPLIANCE & VERIFICATION
  jornaya_leadid: "string",     // Jornaya lead verification ID
  trusted_form_cert_url: "string", // TrustedForm certificate URL
  tcpa_opt_in: "boolean",       // TCPA consent status
  tcpa_optin_consent_language: "string", // TCPA consent text
  
  // INSURANCE-SPECIFIC FIELDS
  beneficiary: "string",         // Beneficiary name
  coverage_amount: "number",     // Coverage amount requested
  bank_account: "boolean",      // Has bank account
  power_of_attorney: "boolean", // Has power of attorney
  nursing_home: "boolean",      // Lives in nursing home
  dementia: "boolean",          // Has dementia diagnosis
  
  // SYSTEM FIELDS
  call_time: "string",          // ISO timestamp of call
  campaign_id: "string",         // Campaign identifier
  source: "string",             // Lead source (trackdrive, webhook, etc.)
  timestamp: "string"           // ISO timestamp of webhook
};

// ==================== EXAMPLE WEBHOOK PAYLOAD ====================

const EXAMPLE_WEBHOOK_PAYLOAD = {
  // Required fields (webhook format)
  lead_token: "LT-1234567890",
  caller_id: "(555) 123-4567",
  first_name: "John",
  last_name: "Smith",
  
  // Application format fields (for integration)
  firstName: "John",
  middleName: "Robert",
  lastName: "Smith",
  phone: "(555) 123-4567",
  
  // Policy & Carrier
  carrier: "TransAmerica",
  planType: "Level",
  faceAmount: 25000,
  monthlyPremium: "89.50",
  
  // Customer data
  email: "john.smith@example.com",
  address: "123 Main Street",
  city: "Chicago",
  state: "Illinois",
  zip: "60601",
  dob: "05/15/1970",
  age: 55,
  gender: "Male",
  height: "5'10\"",
  weight: 185,
  tobacco: false,
  ssn: "XXX-XX-1234",
  stateOfBirth: "Illinois",
  
  // Beneficiaries
  primaryBenName: "Jane Smith",
  primaryBenRel: "Spouse",
  contingentBenName: "Michael Smith",
  contingentBenRel: "Son",
  beneficiary: "Jane Smith",
  
  // Health indicators
  bank_account: true,
  power_of_attorney: false,
  nursing_home: false,
  dementia: false,
  
  // Compliance
  jornaya_leadid: "JRN-ABC123XYZ",
  trusted_form_cert_url: "https://cert.trustedform.com/abc123",
  tcpa_opt_in: true,
  tcpa_optin_consent_language: "I agree to be contacted via phone for insurance quotes",
  
  // System fields
  call_time: "2024-01-15T14:30:00Z",
  campaign_id: "CAMP-001",
  source: "Customer Application",
  timestamp: "2024-01-15T14:30:05Z"
};

// ==================== WEBHOOK RESPONSE SPECIFICATIONS ====================

/**
 * SUCCESS RESPONSE (200 OK)
 * {
 *   "status": "success",
 *   "message": "Screen pop notification created",
 *   "notification_id": "pop-1234567890",
 *   "timestamp": "2024-01-15T14:30:05Z"
 * }
 */

/**
 * ERROR RESPONSE (400 Bad Request)
 * {
 *   "status": "error",
 *   "message": "Missing required field: lead_token",
 *   "code": "MISSING_REQUIRED_FIELD",
 *   "timestamp": "2024-01-15T14:30:05Z"
 * }
 */

// ==================== INTEGRATION METHODS ====================

const INTEGRATION_METHODS = {
  trackdrive: {
    description: "TrackDrive form capture integration",
    setup: "Configure TrackDrive to POST to your webhook URL",
    fields: ["lead_token", "caller_id", "first_name", "last_name", "email", "city", "state", "jornaya_leadid", "tcpa_opt_in"],
    timing: "Data sent immediately after form submission"
  },
  
  webhook: {
    description: "Direct webhook integration",
    setup: "Configure your system to POST directly to webhook URL",
    fields: "All available fields can be sent",
    timing: "Data sent when call is initiated"
  },
  
  iframe_postmessage: {
    description: "iFrame PostMessage integration",
    setup: "Use PostMessage API to send data",
    fields: "All available fields can be sent",
    timing: "Data sent via PostMessage API"
  }
};

// ==================== IMPLEMENTATION CHECKLIST ====================

const IMPLEMENTATION_CHECKLIST = [
  "✅ Create webhook endpoint server",
  "✅ Set up HTTPS endpoint (required for production)",
  "✅ Implement data validation for required fields",
  "✅ Add authentication/security measures",
  "✅ Create screen pop notification system",
  "✅ Set up real-time WebSocket or Server-Sent Events",
  "✅ Implement notification persistence",
  "✅ Add error handling and logging",
  "✅ Test with sample webhook payloads",
  "✅ Configure CORS for cross-origin requests"
];

export {
  WEBHOOK_PAYLOAD_SPEC,
  EXAMPLE_WEBHOOK_PAYLOAD,
  INTEGRATION_METHODS,
  IMPLEMENTATION_CHECKLIST
};
