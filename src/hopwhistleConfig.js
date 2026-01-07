/**
 * HopWhistle Configuration
 * Connection settings for the HopWhistle telephony platform
 */

export const HOPWHISTLE_CONFIG = {
  // API endpoint - HopWhistle API via Nginx SSL proxy on droplet
  // Use HTTPS directly to the droplet (vs. local proxy) since Nginx now SSL terminates
  apiUrl: 'https://107-170-36-116.sslip.io',
  
  // WebSocket endpoint for real-time API events (call notifications, etc.)
  // Nginx on 443 proxies to HopWhistle API (port 3001) with WebSocket upgrade support
  wsUrl: 'wss://107-170-36-116.sslip.io',
  
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
