/**
 * Redaction utility for sensitive data in logs.
 * Masks routing numbers, account numbers, SSNs, passwords, and tokens.
 */

/**
 * Redact a single sensitive value based on type
 * @param {any} value - Value to redact
 * @param {string} type - 'ssn' | 'account' | 'routing' | 'password' | 'token'
 * @returns {string} Redacted string
 */
export const redactSensitive = (value, type) => {
  if (value === undefined || value === null) return '';
  const str = String(value).trim();
  if (!str) return '';

  const cleanType = (type || '').toLowerCase();
  
  if (cleanType === 'ssn') {
    return `***-**-${str.slice(-4)}`;
  }
  if (cleanType === 'account') {
    return `******${str.slice(-4)}`;
  }
  if (cleanType === 'routing') {
    return `*****${str.slice(-4)}`;
  }
  if (cleanType === 'password' || cleanType === 'token') {
    return '[REDACTED]';
  }
  return str;
};

/**
 * Recursively walk payload and return a redacted copy
 * @param {object} payload - Payload to redact
 * @returns {object} Redacted copy
 */
export const redactPayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return payload;
  }

  if (Array.isArray(payload)) {
    return payload.map(item => redactPayload(item));
  }

  const redacted = {};
  for (const [key, value] of Object.entries(payload)) {
    const lowerKey = key.toLowerCase();
    
    if (lowerKey.includes('ssn') || lowerKey.includes('taxid')) {
      redacted[key] = redactSensitive(value, 'ssn');
    } else if (lowerKey.includes('account') && !lowerKey.includes('name') && !lowerKey.includes('holder') && !lowerKey.includes('type')) {
      redacted[key] = redactSensitive(value, 'account');
    } else if (lowerKey.includes('routing') || lowerKey.includes('transit')) {
      redacted[key] = redactSensitive(value, 'routing');
    } else if (lowerKey.includes('password') || lowerKey.includes('pass') || lowerKey.includes('secret') || lowerKey.includes('token') || lowerKey.includes('auth')) {
      redacted[key] = redactSensitive(value, 'password');
    } else if (typeof value === 'object') {
      redacted[key] = redactPayload(value);
    } else {
      redacted[key] = value;
    }
  }
  
  return redacted;
};

/**
 * Log payload safely with redacted sensitive fields
 * @param {string} label - Log message prefix
 * @param {any} payload - Payload to log
 */
export const safeLog = (label, payload) => {
  if (payload && typeof payload === 'object') {
    const redacted = redactPayload(payload);
    console.log(`[SafeLog] ${label}:`, JSON.stringify(redacted));
  } else {
    console.log(`[SafeLog] ${label}:`, redactSensitive(payload, 'password'));
  }
};
