/**
 * HopWhistle Configuration
 * Connection settings for the HopWhistle telephony platform
 */

export const HOPWHISTLE_CONFIG = {
  // API endpoint - HopWhistle API server
  apiUrl: import.meta.env.VITE_HOPWHISTLE_API_URL || 'https://api.hopwhistle.com',
  
  // WebSocket endpoint for real-time events
  wsUrl: import.meta.env.VITE_HOPWHISTLE_WS_URL || 'wss://api.hopwhistle.com',
  
  // API Key for authentication (set in .env)
  apiKey: import.meta.env.VITE_HOPWHISTLE_API_KEY || '',
  
  // Tenant ID (multi-tenant support)
  tenantId: import.meta.env.VITE_HOPWHISTLE_TENANT_ID || '',
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
