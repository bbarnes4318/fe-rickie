/**
 * WebRTC Softphone Service
 * 
 * Provides browser-based phone calling via SIP.js connected to FreeSWITCH
 * Uses WebRTC for audio transmission
 */

import { UserAgent, Registerer, Inviter, Invitation, SessionState } from 'sip.js';
import { HOPWHISTLE_CONFIG } from './hopwhistleConfig';

// ============================================================================
// STATE
// ============================================================================
let userAgent = null;
let registerer = null;
let currentSession = null;
let localStream = null;
let remoteAudio = null;
let isRegistered = false;
let eventCallbacks = [];

// ============================================================================
// CONFIGURATION
// ============================================================================

// FreeSWITCH Verto WebSocket URL (from HopWhistle)
const getWebSocketUrl = () => {
  // FreeSWITCH runs on port 8082 for WebSocket
  // NOTE: If the API is proxied (starts with /), we can't extract host easily from it.
  // And we can't proxy WSS easily without more work. 
  // For now, hardcode the droplet IP but warn about SSL.
  const apiHost = '107.170.36.116'; 
  return `wss://${apiHost}:8082`;
};

// STUN servers for ICE
const STUN_SERVERS = [
  'stun:stun.l.google.com:19302',
  'stun:stun1.l.google.com:19302',
];

// ============================================================================
// EVENT EMITTER
// ============================================================================

function emitEvent(eventName, data = {}) {
  eventCallbacks.forEach(callback => {
    try {
      callback({ event: eventName, data });
    } catch (e) {
      console.error('[Softphone] Error in event callback:', e);
    }
  });
}

export function subscribeToPhoneEvents(callback) {
  if (typeof callback === 'function') {
    eventCallbacks.push(callback);
  }
  return () => {
    eventCallbacks = eventCallbacks.filter(cb => cb !== callback);
  };
}

// ============================================================================
// AUDIO MANAGEMENT
// ============================================================================

/**
 * Request microphone access
 */
async function getMicrophoneAccess() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: false,
    });
    console.log('[Softphone] Microphone access granted');
    return true;
  } catch (error) {
    console.error('[Softphone] Microphone access denied:', error);
    emitEvent('error', { message: 'Microphone access denied. Please allow microphone access.' });
    return false;
  }
}

/**
 * Setup remote audio element
 */
function setupRemoteAudio() {
  if (!remoteAudio) {
    remoteAudio = new Audio();
    remoteAudio.autoplay = true;
    // Append to DOM to ensure it plays
    document.body.appendChild(remoteAudio);
  }
}

/**
 * Attach remote audio stream from session
 */
function attachRemoteAudio(session) {
  setupRemoteAudio();
  
  const sessionDescriptionHandler = session.sessionDescriptionHandler;
  if (!sessionDescriptionHandler) return;
  
  const peerConnection = sessionDescriptionHandler.peerConnection;
  if (!peerConnection) return;
  
  // Get remote audio track
  peerConnection.getReceivers().forEach(receiver => {
    if (receiver.track && receiver.track.kind === 'audio') {
      const stream = new MediaStream([receiver.track]);
      remoteAudio.srcObject = stream;
      remoteAudio.play().catch(e => console.warn('[Softphone] Audio play error:', e));
    }
  });
}

// ============================================================================
// SIP USER AGENT
// ============================================================================

/**
 * Get WebRTC credentials from HopWhistle API
 */
async function getCredentials() {
  const FREESWITCH_DOMAIN = '107-170-36-116.sslip.io';
  const FREESWITCH_IP = '107.170.36.116';
  
  try {
    const response = await fetch(`${HOPWHISTLE_CONFIG.apiUrl}/api/v1/agent/webrtc/credentials`, {
      headers: {
        'X-API-Key': HOPWHISTLE_CONFIG.apiKey,
        'X-Demo-Tenant-Id': HOPWHISTLE_CONFIG.tenantId,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to get WebRTC credentials');
    }
    
    const creds = await response.json();
    console.log('[Softphone] API returned credentials:', creds);
    
    // CRITICAL: Override wsUrl and realm - API returns localhost which doesn't work
    return {
      ...creds,
      realm: FREESWITCH_IP, // SIP.js needs IP or domain for realm
      wsUrl: `wss://${FREESWITCH_DOMAIN}:8082`,
    };
  } catch (error) {
    console.error('[Softphone] Failed to get credentials from API:', error);
    // Return default credentials for testing
    return {
      username: `agent_${Date.now()}`,
      password: 'ClueCon', // FreeSWITCH default
      realm: FREESWITCH_IP, 
      wsUrl: `wss://${FREESWITCH_DOMAIN}:8082`,
    };
  }
}

/**
 * Initialize the SIP User Agent
 */
export async function initializeSoftphone() {
  console.log('[Softphone] Initializing...');
  
  // Request microphone first
  const hasMic = await getMicrophoneAccess();
  if (!hasMic) {
    return { success: false, error: 'Microphone access required' };
  }
  
  try {
    const credentials = await getCredentials();
    console.log('[Softphone] Got credentials, connecting to:', credentials.wsUrl);
    
    // The API returns username in format "demo-agent@demo-tenant"
    // SIP.js expects just the user part, and we use our own realm (IP)
    // Extract just the user part before any @ symbol
    const usernameForUri = credentials.username.split('@')[0];
    const sipUri = `sip:${usernameForUri}@${credentials.realm}`;
    console.log('[Softphone] Constructing SIP URI:', sipUri);
    
    const uri = UserAgent.makeURI(sipUri);
    if (!uri) {
      throw new Error('Invalid SIP URI: ' + sipUri);
    }
    
    // Create User Agent
    userAgent = new UserAgent({
      uri,
      authorizationPassword: credentials.password,
      authorizationUsername: credentials.username,
      transportOptions: {
        server: credentials.wsUrl || getWebSocketUrl(),
      },
      sessionDescriptionHandlerFactoryOptions: {
        peerConnectionConfiguration: {
          iceServers: STUN_SERVERS.map(url => ({ urls: url })),
        },
      },
      logLevel: 'warn',
    });
    
    // Handle incoming calls
    userAgent.delegate = {
      onInvite: (invitation) => {
        console.log('[Softphone] Incoming call from:', invitation.remoteIdentity.uri.user);
        currentSession = invitation;
        setupSessionListeners(invitation);
        emitEvent('incoming', {
          callId: invitation.id,
          callerNumber: invitation.remoteIdentity.uri.user,
          callerName: invitation.remoteIdentity.displayName,
        });
      },
    };
    
    // Start the User Agent
    await userAgent.start();
    console.log('[Softphone] User Agent started');
    
    // Register with the server
    registerer = new Registerer(userAgent);
    
    registerer.stateChange.addListener((state) => {
      console.log('[Softphone] Registerer state:', state);
      if (state === 'Registered') {
        isRegistered = true;
        emitEvent('registered');
      } else if (state === 'Unregistered') {
        isRegistered = false;
        emitEvent('unregistered');
      }
    });
    
    await registerer.register();
    console.log('[Softphone] Registration sent');
    
    emitEvent('initialized');
    return { success: true };
    
  } catch (error) {
    console.error('[Softphone] Initialization failed:', error);
    emitEvent('error', { message: error.message });
    return { success: false, error: error.message };
  }
}

/**
 * Setup session event listeners
 */
function setupSessionListeners(session) {
  session.stateChange.addListener((state) => {
    console.log('[Softphone] Session state:', state);
    
    switch (state) {
      case SessionState.Establishing:
        emitEvent('connecting', { callId: session.id });
        break;
        
      case SessionState.Established:
        attachRemoteAudio(session);
        emitEvent('connected', { callId: session.id });
        break;
        
      case SessionState.Terminated:
        currentSession = null;
        if (remoteAudio) {
          remoteAudio.srcObject = null;
        }
        emitEvent('ended', { callId: session.id });
        break;
    }
  });
}

// ============================================================================
// CALL CONTROL
// ============================================================================

/**
 * Make an outbound call
 */
export async function makeCall(phoneNumber) {
  if (!userAgent || !isRegistered) {
    console.error('[Softphone] Not registered, cannot make call');
    return { success: false, error: 'Phone not registered' };
  }
  
  if (currentSession) {
    console.error('[Softphone] Already in a call');
    return { success: false, error: 'Already in a call' };
  }
  
  try {
    // Clean phone number
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const credentials = await getCredentials();
    
    const targetUri = UserAgent.makeURI(`sip:${cleanNumber}@${credentials.realm}`);
    if (!targetUri) {
      throw new Error('Invalid phone number');
    }
    
    const inviter = new Inviter(userAgent, targetUri, {
      sessionDescriptionHandlerOptions: {
        constraints: {
          audio: true,
          video: false,
        },
      },
    });
    
    currentSession = inviter;
    setupSessionListeners(inviter);
    
    await inviter.invite();
    console.log('[Softphone] Call initiated to:', cleanNumber);
    
    emitEvent('outgoing', { callId: inviter.id, phoneNumber: cleanNumber });
    return { success: true, callId: inviter.id };
    
  } catch (error) {
    console.error('[Softphone] Failed to make call:', error);
    currentSession = null;
    return { success: false, error: error.message };
  }
}

/**
 * Answer an incoming call
 */
export async function answerCall() {
  if (!currentSession || !(currentSession instanceof Invitation)) {
    console.error('[Softphone] No incoming call to answer');
    return { success: false, error: 'No incoming call' };
  }
  
  try {
    await currentSession.accept({
      sessionDescriptionHandlerOptions: {
        constraints: {
          audio: true,
          video: false,
        },
      },
    });
    console.log('[Softphone] Call answered');
    return { success: true };
  } catch (error) {
    console.error('[Softphone] Failed to answer:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Reject an incoming call
 */
export async function rejectCall() {
  if (!currentSession || !(currentSession instanceof Invitation)) {
    return { success: false, error: 'No incoming call' };
  }
  
  try {
    await currentSession.reject();
    currentSession = null;
    console.log('[Softphone] Call rejected');
    return { success: true };
  } catch (error) {
    console.error('[Softphone] Failed to reject:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Hang up the current call
 */
export async function hangupCall() {
  if (!currentSession) {
    return { success: false, error: 'No active call' };
  }
  
  try {
    await currentSession.bye();
    currentSession = null;
    console.log('[Softphone] Call ended');
    return { success: true };
  } catch (error) {
    console.error('[Softphone] Failed to hangup:', error);
    // Force cleanup
    currentSession = null;
    return { success: true };
  }
}

/**
 * Toggle mute (local audio)
 */
export function toggleMute(muted) {
  if (!localStream) return false;
  
  localStream.getAudioTracks().forEach(track => {
    track.enabled = !muted;
  });
  
  console.log('[Softphone] Mute:', muted);
  return true;
}

/**
 * Toggle hold
 */
export async function toggleHold(held) {
  if (!currentSession) return { success: false };
  
  try {
    if (held) {
      await currentSession.hold();
    } else {
      await currentSession.unhold();
    }
    console.log('[Softphone] Hold:', held);
    return { success: true };
  } catch (error) {
    console.error('[Softphone] Hold error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send DTMF tone
 */
export function sendDTMF(digit) {
  if (!currentSession) return false;
  
  try {
    const dtmfSender = currentSession.sessionDescriptionHandler?.peerConnection
      ?.getSenders()
      ?.find(s => s.dtmf);
    
    if (dtmfSender?.dtmf) {
      dtmfSender.dtmf.insertDTMF(digit, 100, 70);
      console.log('[Softphone] DTMF sent:', digit);
      return true;
    }
  } catch (error) {
    console.error('[Softphone] DTMF error:', error);
  }
  return false;
}

// ============================================================================
// CLEANUP
// ============================================================================

/**
 * Disconnect and cleanup
 */
export async function disconnect() {
  try {
    if (currentSession) {
      await hangupCall();
    }
    
    if (registerer) {
      await registerer.unregister();
    }
    
    if (userAgent) {
      await userAgent.stop();
    }
    
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      localStream = null;
    }
    
    if (remoteAudio) {
      remoteAudio.srcObject = null;
    }
    
    userAgent = null;
    registerer = null;
    isRegistered = false;
    
    console.log('[Softphone] Disconnected');
  } catch (error) {
    console.error('[Softphone] Disconnect error:', error);
  }
}

// ============================================================================
// STATUS
// ============================================================================

export function isPhoneRegistered() {
  return isRegistered;
}

export function hasActiveCall() {
  return currentSession !== null;
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  initializeSoftphone,
  makeCall,
  answerCall,
  rejectCall,
  hangupCall,
  toggleMute,
  toggleHold,
  sendDTMF,
  disconnect,
  isPhoneRegistered,
  hasActiveCall,
  subscribeToPhoneEvents,
};
