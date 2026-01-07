/**
 * Verto Softphone Service
 * WebRTC calling via FreeSWITCH Verto protocol (JSON-RPC over WebSocket)
 */

import { HOPWHISTLE_CONFIG } from './hopwhistleConfig';

// ============================================================================
// CONSTANTS
// ============================================================================

const VERTO_DOMAIN = '107-170-36-116.sslip.io';
const VERTO_PORT = 8084; // Nginx SSL proxy -> FreeSWITCH Verto
const VERTO_WS_URL = `wss://${VERTO_DOMAIN}:${VERTO_PORT}`;

// ============================================================================
// STATE
// ============================================================================

let ws = null;
let sessionId = null;
let isLoggedIn = false;
let currentCall = null;
let localStream = null;
let peerConnection = null;
let eventCallbacks = [];
let jsonRpcId = 1;
let pendingRequests = new Map();

// ICE Servers
const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

// ============================================================================
// EVENT EMITTER
// ============================================================================

function emit(event, data) {
  eventCallbacks.forEach(cb => {
    try {
      cb({ event, ...data });
    } catch (e) {
      console.error('[Verto] Error in event callback:', e);
    }
  });
}

export function subscribeToEvents(callback) {
  eventCallbacks.push(callback);
  return () => {
    eventCallbacks = eventCallbacks.filter(cb => cb !== callback);
  };
}

// ============================================================================
// JSON-RPC HELPERS
// ============================================================================

function sendRequest(method, params) {
  return new Promise((resolve, reject) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      reject(new Error('WebSocket not connected'));
      return;
    }

    const id = jsonRpcId++;
    const request = {
      jsonrpc: '2.0',
      method,
      params,
      id,
    };

    pendingRequests.set(id, { resolve, reject });
    console.log('[Verto] Sending:', method, params);
    ws.send(JSON.stringify(request));

    // Timeout after 30 seconds
    setTimeout(() => {
      if (pendingRequests.has(id)) {
        pendingRequests.delete(id);
        reject(new Error(`Request ${method} timed out`));
      }
    }, 30000);
  });
}

function handleJsonRpcMessage(message) {
  try {
    const data = JSON.parse(message);
    console.log('[Verto] Received:', data);

    // Handle response to our request
    if (data.id && pendingRequests.has(data.id)) {
      const { resolve, reject } = pendingRequests.get(data.id);
      pendingRequests.delete(data.id);

      if (data.error) {
        reject(new Error(data.error.message || 'Unknown error'));
      } else {
        resolve(data.result);
      }
      return;
    }

    // Handle server-initiated messages (incoming calls, etc.)
    if (data.method) {
      handleVertoEvent(data.method, data.params);
    }
  } catch (e) {
    console.error('[Verto] Failed to parse message:', e, message);
  }
}

// ============================================================================
// VERTO EVENT HANDLERS
// ============================================================================

function handleVertoEvent(method, params) {
  console.log('[Verto] Event:', method, params);

  switch (method) {
    case 'verto.clientReady':
      console.log('[Verto] Client ready signal received');
      break;

    case 'verto.display':
      // Incoming call notification
      handleIncomingCall(params);
      break;

    case 'verto.media':
      // Media update (SDP answer/offer)
      handleMediaEvent(params);
      break;

    case 'verto.answer':
      // Call was answered
      emit('callAnswered', { callId: params?.callID });
      break;

    case 'verto.bye':
      // Call ended
      handleCallEnded(params);
      break;

    case 'verto.punt':
      // Logged out / session ended
      console.log('[Verto] Session ended by server');
      isLoggedIn = false;
      emit('unregistered', {});
      break;

    default:
      console.log('[Verto] Unhandled event:', method);
  }
}

async function handleIncomingCall(params) {
  console.log('[Verto] Incoming call:', params);
  
  currentCall = {
    id: params.callID,
    callerName: params.caller_id_name || 'Unknown',
    callerNumber: params.caller_id_number || '',
    sdp: params.sdp,
    direction: 'inbound',
  };

  emit('incomingCall', {
    callId: currentCall.id,
    callerName: currentCall.callerName,
    callerNumber: currentCall.callerNumber,
  });
}

async function handleMediaEvent(params) {
  console.log('[Verto] Media event:', params);
  
  if (params.sdp && peerConnection) {
    try {
      await peerConnection.setRemoteDescription({
        type: 'answer',
        sdp: params.sdp,
      });
      console.log('[Verto] Remote SDP set successfully');
    } catch (e) {
      console.error('[Verto] Failed to set remote SDP:', e);
    }
  }
}

function handleCallEnded(params) {
  console.log('[Verto] Call ended:', params);
  
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
  
  currentCall = null;
  emit('callEnded', { callId: params?.callID });
}

// ============================================================================
// WEBRTC
// ============================================================================

async function createPeerConnection() {
  peerConnection = new RTCPeerConnection({ iceServers: ICE_SERVERS });

  // Add local audio track
  if (localStream) {
    localStream.getAudioTracks().forEach(track => {
      peerConnection.addTrack(track, localStream);
    });
  }

  // Handle remote audio
  peerConnection.ontrack = (event) => {
    console.log('[Verto] Remote track received');
    const remoteAudio = new Audio();
    remoteAudio.srcObject = event.streams[0];
    remoteAudio.play().catch(e => console.error('[Verto] Audio play failed:', e));
  };

  // ICE candidate handling
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      console.log('[Verto] ICE candidate:', event.candidate.candidate);
    }
  };

  peerConnection.oniceconnectionstatechange = () => {
    console.log('[Verto] ICE state:', peerConnection.iceConnectionState);
  };

  return peerConnection;
}

async function createOffer() {
  const offer = await peerConnection.createOffer({
    offerToReceiveAudio: true,
    offerToReceiveVideo: false,
  });
  await peerConnection.setLocalDescription(offer);
  
  // Wait for ICE gathering to complete
  await new Promise(resolve => {
    if (peerConnection.iceGatheringState === 'complete') {
      resolve();
    } else {
      peerConnection.onicegatheringstatechange = () => {
        if (peerConnection.iceGatheringState === 'complete') {
          resolve();
        }
      };
    }
  });

  return peerConnection.localDescription.sdp;
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Initialize the Verto softphone
 */
export async function initializeSoftphone() {
  console.log('[Verto] Initializing...');

  // Get microphone access
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log('[Verto] Microphone access granted');
    emit('microphoneGranted', {});
  } catch (e) {
    console.error('[Verto] Microphone access denied:', e);
    emit('error', { message: 'Microphone access denied' });
    return { success: false, error: 'Microphone access denied' };
  }

  // Connect WebSocket
  return new Promise((resolve) => {
    console.log('[Verto] Connecting to:', VERTO_WS_URL);
    
    ws = new WebSocket(VERTO_WS_URL);

    ws.onopen = async () => {
      console.log('[Verto] WebSocket connected');
      emit('connected', {});

      // Login to Verto
      try {
        await login();
        resolve({ success: true });
      } catch (e) {
        console.error('[Verto] Login failed:', e);
        emit('error', { message: e.message });
        resolve({ success: false, error: e.message });
      }
    };

    ws.onmessage = (event) => {
      handleJsonRpcMessage(event.data);
    };

    ws.onclose = () => {
      console.log('[Verto] WebSocket disconnected');
      isLoggedIn = false;
      emit('disconnected', {});
    };

    ws.onerror = (error) => {
      console.error('[Verto] WebSocket error:', error);
      emit('error', { message: 'WebSocket connection failed' });
      resolve({ success: false, error: 'WebSocket connection failed' });
    };
  });
}

/**
 * Login to FreeSWITCH Verto
 */
async function login() {
  // Get credentials from HopWhistle API
  let username = 'demo-agent';
  let password = 'ClueCon';

  try {
    const response = await fetch(`${HOPWHISTLE_CONFIG.apiUrl}/api/v1/agent/webrtc/credentials`, {
      headers: {
        'X-API-Key': HOPWHISTLE_CONFIG.apiKey,
        'X-Demo-Tenant-Id': HOPWHISTLE_CONFIG.tenantId,
      },
    });
    if (response.ok) {
      const creds = await response.json();
      username = creds.username?.split('@')[0] || username;
      password = creds.password || password;
    }
  } catch (e) {
    console.log('[Verto] Using default credentials');
  }

  sessionId = `${username}-${Date.now()}`;

  const result = await sendRequest('login', {
    login: username,
    passwd: password,
    sessid: sessionId,
  });

  console.log('[Verto] Login result:', result);
  isLoggedIn = true;
  emit('registered', { username });
  return result;
}

/**
 * Make an outbound call
 */
export async function makeCall(phoneNumber) {
  if (!isLoggedIn) {
    throw new Error('Not logged in');
  }

  console.log('[Verto] Making call to:', phoneNumber);

  await createPeerConnection();
  const sdp = await createOffer();

  const callId = `call-${Date.now()}`;
  currentCall = {
    id: callId,
    phoneNumber,
    direction: 'outbound',
  };

  const result = await sendRequest('verto.invite', {
    sdp,
    dialogParams: {
      callID: callId,
      destination_number: phoneNumber,
      caller_id_name: 'Agent',
      caller_id_number: '1000',
    },
  });

  console.log('[Verto] Call invite result:', result);
  emit('callInitiated', { callId, phoneNumber });
  return { callId };
}

/**
 * Answer an incoming call
 */
export async function answerCall() {
  if (!currentCall || currentCall.direction !== 'inbound') {
    throw new Error('No incoming call to answer');
  }

  console.log('[Verto] Answering call:', currentCall.id);

  await createPeerConnection();

  // Set remote offer SDP
  if (currentCall.sdp) {
    await peerConnection.setRemoteDescription({
      type: 'offer',
      sdp: currentCall.sdp,
    });
  }

  // Create answer
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  const result = await sendRequest('verto.answer', {
    dialogParams: {
      callID: currentCall.id,
    },
    sdp: answer.sdp,
  });

  console.log('[Verto] Answer result:', result);
  emit('callAnswered', { callId: currentCall.id });
  return result;
}

/**
 * Hang up the current call
 */
export async function hangupCall() {
  if (!currentCall) {
    console.log('[Verto] No call to hang up');
    return;
  }

  console.log('[Verto] Hanging up call:', currentCall.id);

  try {
    await sendRequest('verto.bye', {
      dialogParams: {
        callID: currentCall.id,
      },
    });
  } catch (e) {
    console.error('[Verto] Hangup error:', e);
  }

  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }

  currentCall = null;
  emit('callEnded', {});
}

/**
 * Decline an incoming call
 */
export async function declineCall() {
  if (!currentCall) {
    return;
  }

  await hangupCall();
}

/**
 * Toggle mute
 */
/**
 * Toggle mute
 */
export function toggleMute(shouldMute) {
  if (!localStream) return false;

  const audioTrack = localStream.getAudioTracks()[0];
  if (audioTrack) {
    // If shouldMute is provided, use it. Otherwise toggle.
    if (typeof shouldMute === 'boolean') {
        audioTrack.enabled = !shouldMute;
    } else {
        audioTrack.enabled = !audioTrack.enabled;
    }
    
    const isMuted = !audioTrack.enabled;
    emit('muteChanged', { muted: isMuted });
    return isMuted;
  }
  return false;
}

/**
 * Toggle hold
 */
export async function toggleHold(shouldHold) {
  if (!currentCall) return;

  const action = shouldHold ? 'hold' : 'unhold';

  try {
    await sendRequest('verto.modify', {
      dialogParams: {
        callID: currentCall.id,
      },
      action: action,
    });
    emit('holdChanged', { held: shouldHold });
  } catch (e) {
    console.error(`[Verto] ${action} failed:`, e);
  }
}

/**
 * Alias for declineCall to match existing API
 */
export const rejectCall = declineCall;

/**
 * Disconnect and cleanup
 */
export function disconnect() {
  console.log('[Verto] Disconnecting...');

  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }

  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
  }

  if (ws) {
    ws.close();
    ws = null;
  }

  isLoggedIn = false;
  currentCall = null;
  emit('disconnected', {});
}

/**
 * Check if registered/logged in
 */
export function isRegistered() {
  return isLoggedIn;
}

/**
 * Get current call
 */
export function getCurrentCall() {
  return currentCall;
}

// Default export
export default {
  initializeSoftphone,
  makeCall,
  answerCall,
  hangupCall,
  declineCall,
  rejectCall,
  toggleMute,
  toggleHold,
  disconnect,
  isRegistered,
  getCurrentCall,
  subscribeToEvents,
};
