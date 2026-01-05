/**
 * Settings Service - Manages user preferences stored in localStorage
 * Handles carrier selection preferences for quote filtering
 */

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULTS & CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

// All available carriers
export const ALL_CARRIERS = [
  'American Amicable',
  'Corebridge',
  'TransAmerica',
  'Aflac',
  'SBLI',
  'CICA',
  'GTL',
  'AHL',
  'Royal Neighbors',
  'Gerber',
  'Mutual of Omaha'
];

// Default settings - all carriers enabled
const DEFAULT_SETTINGS = {
  enabledCarriers: [...ALL_CARRIERS],
  version: '1.0'
};

const STORAGE_KEY = 'fe_rickie_settings';
let subscribers = [];

// ═══════════════════════════════════════════════════════════════════════════
// GETTERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get all settings from localStorage
 */
export function getSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure all fields exist
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        // Ensure enabledCarriers is always an array
        enabledCarriers: Array.isArray(parsed.enabledCarriers) 
          ? parsed.enabledCarriers 
          : DEFAULT_SETTINGS.enabledCarriers
      };
    }
  } catch (err) {
    console.warn('[Settings] Failed to load settings from localStorage:', err);
  }
  return { ...DEFAULT_SETTINGS };
}

/**
 * Get list of enabled carriers
 */
export function getEnabledCarriers() {
  const settings = getSettings();
  return settings.enabledCarriers || ALL_CARRIERS;
}

/**
 * Check if a specific carrier is enabled
 */
export function isCarrierEnabled(carrier) {
  const enabled = getEnabledCarriers();
  return enabled.includes(carrier);
}

// ═══════════════════════════════════════════════════════════════════════════
// SETTERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Save settings to localStorage
 */
export function saveSettings(settings) {
  try {
    const toSave = {
      ...getSettings(),
      ...settings
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    notifySubscribers(toSave);
    console.log('[Settings] Saved:', toSave);
    return true;
  } catch (err) {
    console.error('[Settings] Failed to save settings:', err);
    return false;
  }
}

/**
 * Set enabled carriers
 */
export function setEnabledCarriers(carriers) {
  if (!Array.isArray(carriers)) {
    console.error('[Settings] setEnabledCarriers expects an array');
    return false;
  }
  // Validate carriers
  const validCarriers = carriers.filter(c => ALL_CARRIERS.includes(c));
  return saveSettings({ enabledCarriers: validCarriers });
}

/**
 * Toggle a single carrier
 */
export function toggleCarrier(carrier) {
  const current = getEnabledCarriers();
  if (current.includes(carrier)) {
    // Prevent disabling all carriers - keep at least one
    if (current.length <= 1) {
      console.warn('[Settings] Cannot disable last carrier');
      return false;
    }
    return setEnabledCarriers(current.filter(c => c !== carrier));
  } else {
    return setEnabledCarriers([...current, carrier]);
  }
}

/**
 * Enable all carriers
 */
export function enableAllCarriers() {
  return setEnabledCarriers([...ALL_CARRIERS]);
}

/**
 * Reset settings to defaults
 */
export function resetSettings() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    notifySubscribers(DEFAULT_SETTINGS);
    console.log('[Settings] Reset to defaults');
    return true;
  } catch (err) {
    console.error('[Settings] Failed to reset settings:', err);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SUBSCRIPTION (for real-time updates)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Subscribe to settings changes
 * @param {Function} callback - Called with new settings when they change
 * @returns {Function} Unsubscribe function
 */
export function subscribeToSettings(callback) {
  subscribers.push(callback);
  return () => {
    subscribers = subscribers.filter(cb => cb !== callback);
  };
}

function notifySubscribers(settings) {
  subscribers.forEach(cb => {
    try {
      cb(settings);
    } catch (err) {
      console.error('[Settings] Subscriber error:', err);
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// CARRIER INFO HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get carrier metadata for UI display
 */
export const CARRIER_INFO = {
  'American Amicable': { 
    logo: '/logos/amam.png', 
    plans: ['Level', 'Graded', 'ROP'],
    description: 'Final expense specialist with Level, Graded, and ROP options'
  },
  'Corebridge': { 
    logo: '/logos/corebridge.png', 
    plans: ['Guaranteed Issue'],
    description: 'Guaranteed Issue - no health questions'
  },
  'TransAmerica': { 
    logo: '/logos/trans.png', 
    plans: ['Level', 'Graded'],
    description: 'Level and Graded coverage options'
  },
  'Aflac': { 
    logo: '/logos/aflac.png', 
    plans: ['Level', 'Modified'],
    description: 'Level and Modified benefit plans'
  },
  'SBLI': { 
    logo: '/logos/sbli.png', 
    plans: ['Level', 'Modified'],
    description: 'Level and Modified coverage'
  },
  'CICA': { 
    logo: '/logos/cica.png', 
    plans: ['Level', 'Guaranteed Issue'],
    description: 'Level and Guaranteed Issue options'
  },
  'GTL': { 
    logo: '/logos/gtl.png', 
    plans: ['Graded'],
    description: 'Graded benefit coverage'
  },
  'AHL': { 
    logo: '/logos/ahl.png', 
    plans: ['Level', 'Graded'],
    description: 'Level and Graded plans'
  },
  'Royal Neighbors': { 
    logo: '/logos/royal.png', 
    plans: ['Level', 'Graded'],
    description: 'Fraternal benefit society'
  },
  'Gerber': { 
    logo: '/logos/gerber.png', 
    plans: ['Guaranteed Issue'],
    description: 'Guaranteed Issue coverage'
  },
  'Mutual of Omaha': { 
    logo: '/logos/mutual.png', 
    plans: ['Level', 'Graded'],
    description: 'Level and Graded whole life'
  }
};
