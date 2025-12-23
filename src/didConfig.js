// DID (Direct Inward Dialing) Configuration for Script Routing
// Maps incoming phone numbers to script types

/**
 * DID to Script Type Mapping
 *
 * Configure your incoming phone numbers (DIDs) to determine which script
 * should be displayed when a call comes in on that number.
 *
 * Script Types:
 * - 'live_transfer': Live Transfer Script for live transfer calls
 * - 'preclosed': PreClosed Deal Script for pre-closed applications
 */

// DIDs that should use the Live Transfer Script
export const LIVE_TRANSFER_DIDS = [
  // Add your Live Transfer DIDs here
  // Example: '+18885551001', '+18885551002'
];

// DIDs that should use the PreClosed Script
export const PRECLOSED_DIDS = [
  // Add your PreClosed DIDs here
  // Example: '+18885552001', '+18885552002'
];

// Default script type when DID is not recognized or not configured
export const DEFAULT_SCRIPT_TYPE = "live_transfer";

/**
 * Determines which script type to use based on the incoming DID
 * @param {string} did - The incoming phone number (DID)
 * @returns {'live_transfer' | 'preclosed'} The script type to use
 */
export const getScriptTypeFromDID = (did) => {
  if (!did) return DEFAULT_SCRIPT_TYPE;

  // Normalize the DID (remove formatting, spaces, dashes)
  const normalizedDID = did.replace(/[\s\-\(\)\.]/g, "");

  // Check if it matches a Live Transfer DID
  if (
    LIVE_TRANSFER_DIDS.some((d) =>
      normalizedDID.includes(d.replace(/[\s\-\(\)\.]/g, ""))
    )
  ) {
    return "live_transfer";
  }

  // Check if it matches a PreClosed DID
  if (
    PRECLOSED_DIDS.some((d) =>
      normalizedDID.includes(d.replace(/[\s\-\(\)\.]/g, ""))
    )
  ) {
    return "preclosed";
  }

  // Return default if no match
  return DEFAULT_SCRIPT_TYPE;
};

/**
 * For demo/testing purposes, you can force a script type
 * Set to 'live_transfer' or 'preclosed' to override DID-based routing
 * Set to null to use normal DID-based routing
 */
export const FORCE_SCRIPT_TYPE = 'live_transfer'; // 'live_transfer' | 'preclosed' | null
