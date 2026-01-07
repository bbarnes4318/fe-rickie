/**
 * HopWhistle Service
 * Centralized service for all HopWhistle API interactions
 * Handles: agent status, call control, WebSocket events, screen pop data
 */

import { HOPWHISTLE_CONFIG, HOPWHISTLE_EVENTS, AGENT_STATUS } from './hopwhistleConfig';

// ============================================================================
// STATE
// ============================================================================
let wsConnection = null;
let eventCallbacks = [];
let reconnectAttempts = 0;
let isConnected = false;
let currentAgentStatus = AGENT_STATUS.OFFLINE;

// ============================================================================
// API CLIENT
// ============================================================================

/**
 * Make authenticated API request to HopWhistle
 */
async function apiRequest(method, path, body = null) {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (HOPWHISTLE_CONFIG.apiKey) {
    headers['X-API-Key'] = HOPWHISTLE_CONFIG.apiKey;
  }
  
  if (HOPWHISTLE_CONFIG.tenantId) {
    headers['X-Demo-Tenant-Id'] = HOPWHISTLE_CONFIG.tenantId;
  }
  
  const response = await fetch(`${HOPWHISTLE_CONFIG.apiUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: { code: 'HTTP_ERROR', message: `HTTP ${response.status}` }
    }));
    throw error;
  }
  
  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }
  
  return response.json();
}

// ============================================================================
// AGENT STATUS
// ============================================================================

/**
 * Get current agent status from HopWhistle
 */
export async function getAgentStatus() {
  try {
    const result = await apiRequest('GET', '/api/v1/agent/status');
    currentAgentStatus = result.status;
    return result;
  } catch (error) {
    console.error('[HopWhistle] Failed to get agent status:', error);
    throw error;
  }
}

/**
 * Update agent status (available, away, dnd, offline)
 */
export async function updateAgentStatus(status) {
  try {
    const result = await apiRequest('PUT', '/api/v1/agent/status', { status });
    currentAgentStatus = status;
    console.log('[HopWhistle] Agent status updated to:', status);
    return result;
  } catch (error) {
    console.error('[HopWhistle] Failed to update agent status:', error);
    throw error;
  }
}

// ============================================================================
// CALL CONTROL
// ============================================================================

/**
 * Initiate an outbound call
 */
export async function originateCall(phoneNumber, callerId = null, campaignId = null) {
  try {
    const result = await apiRequest('POST', '/api/v1/agent/call/originate', {
      phoneNumber,
      callerId,
      campaignId,
    });
    console.log('[HopWhistle] Call originated:', result.callId);
    return result;
  } catch (error) {
    console.error('[HopWhistle] Failed to originate call:', error);
    throw error;
  }
}

/**
 * Answer an incoming call
 */
export async function answerCall(callId) {
  try {
    const result = await apiRequest('POST', `/api/v1/agent/call/${callId}/answer`);
    console.log('[HopWhistle] Call answered:', callId);
    return result;
  } catch (error) {
    console.error('[HopWhistle] Failed to answer call:', error);
    throw error;
  }
}

/**
 * Hang up a call
 */
export async function hangupCall(callId) {
  try {
    const result = await apiRequest('POST', `/api/v1/agent/call/${callId}/hangup`);
    console.log('[HopWhistle] Call ended:', callId);
    return result;
  } catch (error) {
    console.error('[HopWhistle] Failed to hangup call:', error);
    throw error;
  }
}

/**
 * Toggle call hold
 */
export async function holdCall(callId) {
  try {
    const result = await apiRequest('POST', `/api/v1/agent/call/${callId}/hold`);
    console.log('[HopWhistle] Call hold toggled:', result.isOnHold);
    return result;
  } catch (error) {
    console.error('[HopWhistle] Failed to toggle hold:', error);
    throw error;
  }
}

/**
 * Mute call (client-side, just acknowledgement)
 */
export async function muteCall(callId) {
  try {
    const result = await apiRequest('POST', `/api/v1/agent/call/${callId}/mute`);
    return result;
  } catch (error) {
    console.error('[HopWhistle] Failed to mute call:', error);
    throw error;
  }
}

/**
 * Transfer call (blind or warm)
 */
export async function transferCall(callId, destination, type = 'blind') {
  try {
    const result = await apiRequest('POST', `/api/v1/agent/call/${callId}/transfer`, {
      destination,
      type,
    });
    console.log('[HopWhistle] Call transferred:', result);
    return result;
  } catch (error) {
    console.error('[HopWhistle] Failed to transfer call:', error);
    throw error;
  }
}

/**
 * Send DTMF tone
 */
export async function sendDTMF(callId, digit) {
  try {
    const result = await apiRequest('POST', `/api/v1/agent/call/${callId}/dtmf`, { digit });
    return result;
  } catch (error) {
    console.error('[HopWhistle] Failed to send DTMF:', error);
    throw error;
  }
}

// ============================================================================
// SCREEN POP & LEAD DATA
// ============================================================================

/**
 * Get screen pop data for a call
 */
export async function getScreenPopData(callId) {
  try {
    const result = await apiRequest('GET', `/api/v1/agent/call/${callId}/screenpop`);
    return result.data || {};
  } catch (error) {
    console.error('[HopWhistle] Failed to get screen pop data:', error);
    return {};
  }
}

/**
 * Lookup lead by phone number
 */
export async function lookupLead(phoneNumber) {
  try {
    const result = await apiRequest('GET', `/api/v1/agent/lead/lookup?phoneNumber=${encodeURIComponent(phoneNumber)}`);
    return result;
  } catch (error) {
    console.error('[HopWhistle] Failed to lookup lead:', error);
    return null;
  }
}

// ============================================================================
// CALL HISTORY
// ============================================================================

/**
 * Get agent's call history
 */
export async function getCallHistory(limit = 50, offset = 0) {
  try {
    const result = await apiRequest('GET', `/api/v1/agent/calls?limit=${limit}&offset=${offset}`);
    return result;
  } catch (error) {
    console.error('[HopWhistle] Failed to get call history:', error);
    throw error;
  }
}

// ============================================================================
// WEBRTC CREDENTIALS
// ============================================================================

/**
 * Get WebRTC credentials for browser-based calling
 */
export async function getWebRTCCredentials() {
  try {
    const result = await apiRequest('GET', '/api/v1/agent/webrtc/credentials');
    return result;
  } catch (error) {
    console.error('[HopWhistle] Failed to get WebRTC credentials:', error);
    throw error;
  }
}

// ============================================================================
// WEBSOCKET REAL-TIME EVENTS
// ============================================================================

/**
 * Connect to HopWhistle WebSocket for real-time events
 */
export function connectWebSocket() {
  if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
    console.log('[HopWhistle] WebSocket already connected');
    return;
  }
  // WebSocket endpoint is /ws/events with API key in query params
  const apiKey = HOPWHISTLE_CONFIG.apiKey;
  const wsUrl = `${HOPWHISTLE_CONFIG.wsUrl}/ws/events?apiKey=${encodeURIComponent(apiKey)}`;
  console.log('[HopWhistle] Connecting to WebSocket:', wsUrl);
  
  try {
    wsConnection = new WebSocket(wsUrl);
    
    wsConnection.onopen = () => {
      console.log('[HopWhistle] WebSocket connected');
      isConnected = true;
      reconnectAttempts = 0;
      
      // Authenticate if we have an API key
      if (HOPWHISTLE_CONFIG.apiKey) {
        wsConnection.send(JSON.stringify({
          type: 'auth',
          apiKey: HOPWHISTLE_CONFIG.apiKey,
          tenantId: HOPWHISTLE_CONFIG.tenantId,
        }));
      }
      
      // Notify callbacks of connection
      emitEvent({ event: 'websocket.connected' });
    };
    
    wsConnection.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[HopWhistle] WebSocket message:', data.event);
        emitEvent(data);
      } catch (e) {
        console.error('[HopWhistle] Failed to parse WebSocket message:', e);
      }
    };
    
    wsConnection.onclose = () => {
      console.log('[HopWhistle] WebSocket disconnected');
      isConnected = false;
      emitEvent({ event: 'websocket.disconnected' });
      
      // Attempt reconnection with exponential backoff
      if (reconnectAttempts < 5) {
        const delay = Math.pow(2, reconnectAttempts) * 1000;
        console.log(`[HopWhistle] Reconnecting in ${delay}ms...`);
        setTimeout(() => {
          reconnectAttempts++;
          connectWebSocket();
        }, delay);
      }
    };
    
    wsConnection.onerror = (error) => {
      console.error('[HopWhistle] WebSocket error:', error);
      emitEvent({ event: 'websocket.error', data: { error } });
    };
  } catch (error) {
    console.error('[HopWhistle] Failed to connect WebSocket:', error);
  }
}

/**
 * Disconnect WebSocket
 */
export function disconnectWebSocket() {
  if (wsConnection) {
    wsConnection.close();
    wsConnection = null;
    isConnected = false;
  }
}

/**
 * Subscribe to HopWhistle events
 */
export function subscribeToEvents(callback) {
  if (typeof callback === 'function') {
    eventCallbacks.push(callback);
    console.log('[HopWhistle] Event subscriber added, total:', eventCallbacks.length);
  }
  
  // Return unsubscribe function
  return () => {
    eventCallbacks = eventCallbacks.filter(cb => cb !== callback);
    console.log('[HopWhistle] Event subscriber removed, total:', eventCallbacks.length);
  };
}

/**
 * Emit event to all subscribers
 */
function emitEvent(data) {
  eventCallbacks.forEach(callback => {
    try {
      callback(data);
    } catch (e) {
      console.error('[HopWhistle] Error in event callback:', e);
    }
  });
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

/**
 * Check HopWhistle API health
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${HOPWHISTLE_CONFIG.apiUrl}/health`);
    const data = await response.json();
    return { connected: response.ok, ...data };
  } catch (error) {
    console.error('[HopWhistle] Health check failed:', error);
    return { connected: false, error: error.message };
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize HopWhistle connection
 */
export async function initializeHopwhistle() {
  console.log('[HopWhistle] Initializing with API:', HOPWHISTLE_CONFIG.apiUrl);
  
  try {
    // Check API health
    const health = await checkHealth();
    if (!health.connected) {
      console.warn('[HopWhistle] API not reachable, running in offline mode');
      return { success: false, reason: 'API not reachable' };
    }
    
    // Connect WebSocket for real-time events
    connectWebSocket();
    
    // Get initial agent status
    try {
      await getAgentStatus();
    } catch (e) {
      console.warn('[HopWhistle] Could not get initial agent status');
    }
    
    console.log('[HopWhistle] Initialization complete');
    return { success: true };
  } catch (error) {
    console.error('[HopWhistle] Initialization failed:', error);
    return { success: false, error };
  }
}

// Export config and events for reference
export { HOPWHISTLE_CONFIG, HOPWHISTLE_EVENTS, AGENT_STATUS };

// Default export with all methods
export default {
  // Initialization
  initializeHopwhistle,
  checkHealth,
  
  // Agent status
  getAgentStatus,
  updateAgentStatus,
  
  // Call control
  originateCall,
  answerCall,
  hangupCall,
  holdCall,
  muteCall,
  transferCall,
  sendDTMF,
  
  // Screen pop & leads
  getScreenPopData,
  lookupLead,
  
  // Call history
  getCallHistory,
  
  // WebRTC
  getWebRTCCredentials,
  
  // WebSocket
  connectWebSocket,
  disconnectWebSocket,
  subscribeToEvents,
  
  // Constants
  HOPWHISTLE_CONFIG,
  HOPWHISTLE_EVENTS,
  AGENT_STATUS,
};
