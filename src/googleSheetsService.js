/**
 * Google Sheets Service - Fetches live rate data from Google Sheets
 * Sheet: "rating" (ID: 1-X4i7w2kxs7xtqFJ-9wHqft2Jlx7MiXs1wlLzwSA06M)
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const SHEET_ID = '1-X4i7w2kxs7xtqFJ-9wHqft2Jlx7MiXs1wlLzwSA06M';
const API_KEY = 'AIzaSyBQD0raC0Qv9MzQs8BZBebApywHh7ABVBU';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Tab names in exact order (matches Key tab B1:U1 left-to-right)
export const TAB_NAMES = [
  'aflac',
  'aflac-modified',
  'SBLI',
  'SBLI-modified',
  'CICA',
  'CICA-GI',
  'gtl',
  'TransAmerica',
  'TransAmerica Graded',
  'Corebridge',
  'amam',
  'amam-graded',
  'amam-return-or-premium',
  'AHL',
  'AHL-Graded',
  'Royal Neighbors',
  'Royal Neighbors-Graded',
  'Gerber-GI',
  'Mutual of Omaha',
  'Mutual of Omaha-Graded'
];

// Tabs WITHOUT tobacco differentiation (3 columns: Age, Male, Female)
const NO_TOBACCO_TABS = [
  'aflac-modified',
  'CICA',
  'CICA-GI',
  'gtl',
  'Corebridge',
  'Gerber-GI'
];

// Map tab names to a standardized carrier name for the UI
export const TAB_TO_CARRIER = {
  'aflac': { carrier: 'Aflac', planType: 'Level' },
  'aflac-modified': { carrier: 'Aflac', planType: 'Modified' },
  'SBLI': { carrier: 'SBLI', planType: 'Level' },
  'SBLI-modified': { carrier: 'SBLI', planType: 'Modified' },
  'CICA': { carrier: 'CICA', planType: 'Level' },
  'CICA-GI': { carrier: 'CICA', planType: 'Guaranteed Issue' },
  'gtl': { carrier: 'GTL', planType: 'Graded' },
  'TransAmerica': { carrier: 'TransAmerica', planType: 'Level' },
  'TransAmerica Graded': { carrier: 'TransAmerica', planType: 'Graded' },
  'Corebridge': { carrier: 'Corebridge', planType: 'Guaranteed Issue' },
  'amam': { carrier: 'American Amicable', planType: 'Level' },
  'amam-graded': { carrier: 'American Amicable', planType: 'Graded' },
  'amam-return-or-premium': { carrier: 'American Amicable', planType: 'ROP' },
  'AHL': { carrier: 'AHL', planType: 'Level' },
  'AHL-Graded': { carrier: 'AHL', planType: 'Graded' },
  'Royal Neighbors': { carrier: 'Royal Neighbors', planType: 'Level' },
  'Royal Neighbors-Graded': { carrier: 'Royal Neighbors', planType: 'Graded' },
  'Gerber-GI': { carrier: 'Gerber', planType: 'Guaranteed Issue' },
  'Mutual of Omaha': { carrier: 'Mutual of Omaha', planType: 'Level' },
  'Mutual of Omaha-Graded': { carrier: 'Mutual of Omaha', planType: 'Graded' }
};

// ═══════════════════════════════════════════════════════════════════════════
// CACHE
// ═══════════════════════════════════════════════════════════════════════════

let ratesCache = {
  data: null,
  keyData: null,
  timestamp: 0,
  loading: false,
  error: null
};

let subscribers = [];

// ═══════════════════════════════════════════════════════════════════════════
// API FETCH HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fetch a single tab from Google Sheets
 */
async function fetchTab(tabName) {
  const encodedTab = encodeURIComponent(tabName);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodedTab}?key=${API_KEY}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch tab "${tabName}": ${response.status}`);
  }
  
  const data = await response.json();
  return data.values || [];
}

/**
 * Parse a currency/number string, stripping $ signs and commas
 * Handles: "$48", "$28.97 ", "0.0875", "48", etc.
 */
function parseCurrency(value) {
  if (value === undefined || value === null || value === '') return 0;
  // Remove $, commas, and whitespace, then parse
  const cleaned = String(value).replace(/[$,\s]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Parse the Key tab to get annual fees and monthly factors
 * Row 1: Carrier names (B1:U1)
 * Row 2: Annual fees (B2:U2)
 * Row 3: Monthly factors (B3:U3)
 */
function parseKeyTab(rows) {
  if (!rows || rows.length < 3) {
    console.error('Key tab missing required rows');
    return {};
  }
  
  const carriers = rows[0].slice(1); // Skip column A
  const annualFees = rows[1].slice(1);
  const monthlyFactors = rows[2].slice(1);
  
  console.log('[GoogleSheets] Raw Key tab data - carriers:', carriers);
  console.log('[GoogleSheets] Raw Key tab data - fees:', annualFees);
  console.log('[GoogleSheets] Raw Key tab data - factors:', monthlyFactors);
  
  const keyData = {};
  
  TAB_NAMES.forEach((tabName, index) => {
    keyData[tabName] = {
      annualFee: parseCurrency(annualFees[index]),
      monthlyFactor: parseCurrency(monthlyFactors[index])
    };
  });
  
  console.log('[GoogleSheets] Parsed Key tab:', keyData);
  return keyData;
}

/**
 * Parse a rate tab into structured data
 * @param {string} tabName - Name of the tab
 * @param {Array} rows - Raw row data from API
 * @param {boolean} hasTobacco - Whether this tab has tobacco columns
 */
function parseRateTab(tabName, rows, hasTobacco) {
  if (!rows || rows.length < 2) {
    console.warn(`[GoogleSheets] Tab "${tabName}" has no data`);
    return {};
  }
  
  const rates = {};
  
  // Skip header row, parse data rows
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const age = parseInt(row[0], 10);
    
    if (isNaN(age) || age < 18 || age > 100) continue;
    
    if (hasTobacco) {
      // Columns: Age, Male NS, Male Sm, Female NS, Female Sm
      rates[age] = {
        maleNS: parseCurrency(row[1]),
        maleSm: parseCurrency(row[2]),
        femaleNS: parseCurrency(row[3]),
        femaleSm: parseCurrency(row[4])
      };
    } else {
      // Columns: Age, Male, Female
      rates[age] = {
        male: parseCurrency(row[1]),
        female: parseCurrency(row[2])
      };
    }
  }
  
  // Log first rate for debugging
  const firstAge = Object.keys(rates)[0];
  if (firstAge) {
    console.log(`[GoogleSheets] ${tabName} sample rate (age ${firstAge}):`, rates[firstAge]);
  }
  
  return rates;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN FETCH FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fetch all rates from Google Sheets
 * @param {boolean} force - Force refresh even if cache is valid
 */
export async function fetchAllRates(force = false) {
  // Check cache
  const now = Date.now();
  if (!force && ratesCache.data && (now - ratesCache.timestamp) < CACHE_TTL) {
    console.log('[GoogleSheets] Using cached rates');
    return { rates: ratesCache.data, keyData: ratesCache.keyData };
  }
  
  // Prevent concurrent fetches
  if (ratesCache.loading) {
    console.log('[GoogleSheets] Fetch already in progress...');
    return { rates: ratesCache.data, keyData: ratesCache.keyData };
  }
  
  ratesCache.loading = true;
  ratesCache.error = null;
  
  try {
    console.log('[GoogleSheets] Fetching rates from Google Sheets...');
    
    // Try to fetch Key tab - but don't fail if it doesn't exist
    let keyData = {};
    try {
      const keyRows = await fetchTab('Key');
      keyData = parseKeyTab(keyRows);
    } catch (keyError) {
      console.warn('[GoogleSheets] Key tab not found or failed, using default values:', keyError.message);
      // Use default values for all tabs (no annual fee, no monthly factor)
      TAB_NAMES.forEach(tabName => {
        keyData[tabName] = {
          annualFee: 0,
          monthlyFactor: 0
        };
      });
    }
    
    // Fetch all rate tabs in parallel
    const tabPromises = TAB_NAMES.map(async (tabName) => {
      try {
        const rows = await fetchTab(tabName);
        const hasTobacco = !NO_TOBACCO_TABS.includes(tabName);
        const rates = parseRateTab(tabName, rows, hasTobacco);
        return { tabName, rates, hasTobacco };
      } catch (err) {
        console.error(`[GoogleSheets] Failed to fetch ${tabName}:`, err);
        return { tabName, rates: {}, hasTobacco: !NO_TOBACCO_TABS.includes(tabName) };
      }
    });
    
    const results = await Promise.all(tabPromises);
    
    // Build rates object
    const rates = {};
    results.forEach(({ tabName, rates: tabRates, hasTobacco }) => {
      rates[tabName] = {
        rates: tabRates,
        hasTobacco,
        ...TAB_TO_CARRIER[tabName],
        ...keyData[tabName]
      };
    });
    
    // Update cache
    ratesCache.data = rates;
    ratesCache.keyData = keyData;
    ratesCache.timestamp = now;
    ratesCache.loading = false;
    
    console.log('[GoogleSheets] Rates loaded successfully:', Object.keys(rates).length, 'tabs');
    
    // Notify subscribers
    subscribers.forEach(cb => cb(rates));
    
    return { rates, keyData };
    
  } catch (error) {
    console.error('[GoogleSheets] Failed to fetch rates:', error);
    ratesCache.loading = false;
    ratesCache.error = error.message;
    
    // Return cached data if available
    return { rates: ratesCache.data, keyData: ratesCache.keyData };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SYNC ACCESS (for non-async contexts)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get cached rates synchronously
 * Returns null if not yet loaded
 */
export function getRatesSync() {
  return ratesCache.data;
}

/**
 * Get cached key data synchronously
 */
export function getKeyDataSync() {
  return ratesCache.keyData;
}

/**
 * Check if rates are loaded
 */
export function isRatesLoaded() {
  return ratesCache.data !== null;
}

/**
 * Get loading/error state
 */
export function getRatesStatus() {
  return {
    loading: ratesCache.loading,
    error: ratesCache.error,
    lastUpdated: ratesCache.timestamp ? new Date(ratesCache.timestamp) : null
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// SUBSCRIPTION (for real-time updates)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Subscribe to rate updates
 * @param {Function} callback - Called with new rates when they change
 * @returns {Function} Unsubscribe function
 */
export function subscribeToRates(callback) {
  subscribers.push(callback);
  return () => {
    subscribers = subscribers.filter(cb => cb !== callback);
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTO-REFRESH
// ═══════════════════════════════════════════════════════════════════════════

let refreshInterval = null;

/**
 * Start auto-refresh (call once on app init)
 */
export function startAutoRefresh(intervalMs = CACHE_TTL) {
  if (refreshInterval) return;
  
  // Initial fetch
  fetchAllRates();
  
  // Set up interval
  refreshInterval = setInterval(() => {
    fetchAllRates(true);
  }, intervalMs);
  
  console.log(`[GoogleSheets] Auto-refresh started (every ${intervalMs / 1000}s)`);
}

/**
 * Stop auto-refresh
 */
export function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
    console.log('[GoogleSheets] Auto-refresh stopped');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PREMIUM CALCULATION (using live rates)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get the nearest available age from rate table
 */
function getNearestAge(age, rateTable) {
  const ages = Object.keys(rateTable).map(Number).filter(a => !isNaN(a));
  if (ages.length === 0) return 65;
  return ages.reduce((prev, curr) => 
    Math.abs(curr - age) < Math.abs(prev - age) ? curr : prev
  );
}

/**
 * Calculate monthly premium using live rates
 * @param {string} tabName - The sheet tab name (e.g., 'aflac', 'SBLI')
 * @param {number} age - Customer age
 * @param {string} gender - 'Male' or 'Female'
 * @param {boolean} tobacco - Tobacco user
 * @param {number} faceAmount - Coverage amount
 * @returns {number|null} Monthly premium or null if not available
 */
export function calculatePremiumFromSheet(tabName, age, gender, tobacco, faceAmount) {
  const rates = ratesCache.data;
  if (!rates || !rates[tabName]) {
    console.warn(`[GoogleSheets] No rates for tab: ${tabName}`);
    return null;
  }
  
  const tabData = rates[tabName];
  const rateTable = tabData.rates;
  
  if (!rateTable || Object.keys(rateTable).length === 0) {
    return null;
  }
  
  const lookupAge = getNearestAge(age, rateTable);
  const ageData = rateTable[lookupAge];
  
  if (!ageData) return null;
  
  const isMale = gender === 'Male';
  const isSmoker = tobacco === true;
  
  let annualRatePer1000;
  
  if (tabData.hasTobacco) {
    // With tobacco differentiation
    annualRatePer1000 = isMale
      ? (isSmoker ? ageData.maleSm : ageData.maleNS)
      : (isSmoker ? ageData.femaleSm : ageData.femaleNS);
  } else {
    // No tobacco differentiation
    annualRatePer1000 = isMale ? ageData.male : ageData.female;
  }
  
  if (!annualRatePer1000 || annualRatePer1000 === 0) return null;
  
  // Calculate using the formula:
  // units = faceAmount / 1000
  // annualBase = rate * units
  // totalAnnual = annualBase + annualFee
  // withFactor = totalAnnual + (totalAnnual * monthlyFactor)
  // monthlyPremium = withFactor / 12
  
  const units = faceAmount / 1000;
  const annualBase = annualRatePer1000 * units;
  const totalAnnual = annualBase + (tabData.annualFee || 0);
  const withFactor = totalAnnual + (totalAnnual * (tabData.monthlyFactor || 0));
  const monthlyPremium = withFactor / 12;
  
  return Math.round(monthlyPremium * 100) / 100;
}

/**
 * Get all quotes for a customer (using live rates)
 */
export function getAllQuotesFromSheet(age, gender, tobacco, faceAmount) {
  const rates = ratesCache.data;
  if (!rates) return [];
  
  const quotes = [];
  
  TAB_NAMES.forEach(tabName => {
    const premium = calculatePremiumFromSheet(tabName, age, gender, tobacco, faceAmount);
    const meta = TAB_TO_CARRIER[tabName];
    
    if (premium !== null) {
      quotes.push({
        tabName,
        carrier: meta.carrier,
        planType: meta.planType,
        premium,
        faceAmount,
        isEligible: true
      });
    }
  });
  
  // Sort by premium (lowest first)
  return quotes.sort((a, b) => a.premium - b.premium);
}

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════

// Auto-start on import (comment out if you want manual control)
// startAutoRefresh();

export default {
  fetchAllRates,
  getRatesSync,
  getKeyDataSync,
  isRatesLoaded,
  getRatesStatus,
  subscribeToRates,
  startAutoRefresh,
  stopAutoRefresh,
  calculatePremiumFromSheet,
  getAllQuotesFromSheet,
  TAB_NAMES,
  TAB_TO_CARRIER
};
