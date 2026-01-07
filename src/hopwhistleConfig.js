/**
 * HopWhistle Configuration
 * Connection settings for the HopWhistle telephony platform
 */

export const HOPWHISTLE_CONFIG = {
// API endpoint - HopWhistle API server via local proxy
  // Use relative path so it hits the same origin (HTTPS)
  apiUrl: '/api/hopwhistle',
  
  // WebSocket endpoint - Needs to be WSS. 
  // FreeSWITCH Verto (Audio/Signaling) is on 8082
  // API Events are on 3001 (but no SSL there yet). 
  // If this config is for API events, it should be 3001.
  // If it's for Softphone, softphoneService overrides it.
  // We'll set it to the SSL domain on 8082 for now as a placeholder 
  // or 3001 if we proxy it.
  wsUrl: 'wss://107-170-36-116.sslip.io:8082',
  
  // API Key for authentication
  apiKey: 'a1b2c3d4e5f67890',
  
  // Tenant ID (multi-tenant support)
  tenantId: 'f8b6b7cb-a030-47eb-a0b0-6b578a9030c8',
};

// Event types emitted by HopWhistle
export const HOPWHISTLE_EVENTS = {
  // Call events
  CALL_INITIATED: 'call.initiated',
  CALL_RINGING: 'call.ringing',
  CALL_ANSWERED: 'call.answered',
  CALL_ENDED: 'call.ended',
  CALL_HOLD: 'call.hold',
  CALL_TRANSFERRED: 'call.transferred',
  
  // Agent events
  AGENT_CALL_INCOMING: 'agent.call.incoming',
  AGENT_STATUS_CHANGED: 'agent.status.changed',
};

// Agent status values
export const AGENT_STATUS = {
  AVAILABLE: 'available',
  AWAY: 'away',
  DND: 'dnd',
  OFFLINE: 'offline',
  ON_CALL: 'on-call',
};

export default HOPWHISTLE_CONFIG;
