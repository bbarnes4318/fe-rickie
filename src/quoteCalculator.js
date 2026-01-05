/**
 * Quote Calculator - Shared module for insurance premium calculations
 * NOW USES GOOGLE SHEETS FOR LIVE RATE DATA
 * Fallback to hardcoded rates if API fails
 * Carrier filtering based on user settings
 */

import {
  fetchAllRates,
  getRatesSync,
  isRatesLoaded,
  calculatePremiumFromSheet,
  getAllQuotesFromSheet,
  startAutoRefresh,
  subscribeToRates,
  TAB_TO_CARRIER
} from './googleSheetsService';

// Import settings service for carrier filtering
import { getEnabledCarriers } from './settingsService';

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZATION - Start loading rates immediately
// ═══════════════════════════════════════════════════════════════════════════

// Start auto-refresh on module load
startAutoRefresh();

// ═══════════════════════════════════════════════════════════════════════════
// CARRIERS & CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

export const CARRIERS = {
  'American Amicable': ['Level', 'Graded', 'ROP'],
  'Corebridge': ['Guaranteed Issue'],
  'TransAmerica': ['Level', 'Graded'],
  'Aflac': ['Level', 'Modified'],
  'SBLI': ['Level', 'Modified'],
  'CICA': ['Level', 'Guaranteed Issue'],
  'GTL': ['Graded'],
  'AHL': ['Level', 'Graded'],
  'Royal Neighbors': ['Level', 'Graded'],
  'Gerber': ['Guaranteed Issue'],
  'Mutual of Omaha': ['Level', 'Graded']
};

// Map carrier + planType to tab name
const CARRIER_TO_TAB = {
  'Aflac_Level': 'aflac',
  'Aflac_Modified': 'aflac-modified',
  'SBLI_Level': 'SBLI',
  'SBLI_Modified': 'SBLI-modified',
  'CICA_Level': 'CICA',
  'CICA_Guaranteed Issue': 'CICA-GI',
  'GTL_Graded': 'gtl',
  'TransAmerica_Level': 'TransAmerica',
  'TransAmerica_Graded': 'TransAmerica Graded',
  'Corebridge_Guaranteed Issue': 'Corebridge',
  'American Amicable_Level': 'amam',
  'American Amicable_Graded': 'amam-graded',
  'American Amicable_ROP': 'amam-return-or-premium',
  'AHL_Level': 'AHL',
  'AHL_Graded': 'AHL-Graded',
  'Royal Neighbors_Level': 'Royal Neighbors',
  'Royal Neighbors_Graded': 'Royal Neighbors-Graded',
  'Gerber_Guaranteed Issue': 'Gerber-GI',
  'Mutual of Omaha_Level': 'Mutual of Omaha',
  'Mutual of Omaha_Graded': 'Mutual of Omaha-Graded'
};

// Legacy config - kept for backwards compatibility but now pulled from Key tab
export const CARRIER_CONFIG = {
  'Aflac': { annualFee: 48, monthlyFactor: 0.0875, hasTobacco: true },
  'SBLI': { annualFee: 48, monthlyFactor: 0.087, hasTobacco: true },
  'CICA': { annualFee: 48, monthlyFactor: 0.087, hasTobacco: false },
  'GTL': { annualFee: 48, monthlyFactor: 0.08333, hasTobacco: false },
  'Corebridge': { annualFee: 0, monthlyFactor: 0, hasTobacco: false },
  'TransAmerica': { annualFee: 48, monthlyFactor: 0.0875, hasTobacco: true },
  'American Amicable': { annualFee: 30, monthlyFactor: 0.088, hasTobacco: true },
  'AHL': { annualFee: 120, monthlyFactor: 0.0875, hasTobacco: true },
  'Royal Neighbors': { annualFee: 30, monthlyFactor: 0.087, hasTobacco: true },
  'Gerber': { annualFee: 11, monthlyFactor: 0.083334, hasTobacco: false },
  'Mutual of Omaha': { annualFee: 36, monthlyFactor: 0.089, hasTobacco: true }
};

// ═══════════════════════════════════════════════════════════════════════════
// HEALTH QUESTIONS (Same as before)
// ═══════════════════════════════════════════════════════════════════════════

export const HEALTH_QUESTIONS = {
  knockout: [
    { id: 'q1', text: 'Currently hospitalized, in nursing facility, using oxygen, receiving hospice care, had amputation, or diagnosed with cancer?' },
    { id: 'q2', text: 'Terminal illness, awaiting organ transplant, or on dialysis?' },
    { id: 'q3', text: 'Diagnosed with AIDS or tested positive for HIV?' }
  ],
  modified: [
    { id: 'q4', text: 'Heart attack, stroke, or TIA in the past 2 years?' },
    { id: 'q5', text: 'Internal cancer diagnosis or treatment in the past 2 years?' },
    { id: 'q6', text: 'COPD/emphysema, congestive heart failure, dementia, cirrhosis, or major organ disease?' },
    { id: 'q7a', text: 'Diabetes with insulin AND complications (kidney, eye, nerve damage)?' },
    { id: 'q7b', text: 'Diabetes with amputation?' },
    { id: 'q7c', text: 'Diabetes with dialysis?' },
    { id: 'q7d', text: 'Diabetes requiring hospitalization in past 2 years?' }
  ],
  graded: [
    { id: 'q8a', text: 'Hepatitis B or C?' },
    { id: 'q8b', text: 'Treated for alcoholism in past 2 years?' },
    { id: 'q8c', text: 'Drug abuse treatment in past 2 years?' }
  ]
};

// ═══════════════════════════════════════════════════════════════════════════
// ELIGIBILITY CALCULATION
// ═══════════════════════════════════════════════════════════════════════════

export const calculateEligibility = (answers) => {
  if (!answers || Object.keys(answers).length === 0) {
    return {
      status: 'standard',
      plan: 'Level',
      message: 'Eligible for Level (best) rates',
      availableCarriers: Object.keys(CARRIERS)
    };
  }
  
  // Check knockout questions first
  const knockoutAnswers = HEALTH_QUESTIONS.knockout.map(q => answers[q.id]);
  if (knockoutAnswers.some(a => a === true)) {
    return {
      status: 'ineligible',
      plan: 'Guaranteed Issue Only',
      message: 'Only Guaranteed Issue carriers available',
      availableCarriers: ['Corebridge', 'Gerber', 'CICA']
    };
  }

  // Check modified/ROP questions
  const modifiedAnswers = HEALTH_QUESTIONS.modified.map(q => answers[q.id]);
  if (modifiedAnswers.some(a => a === true)) {
    return {
      status: 'modified',
      plan: 'Modified/ROP',
      message: 'Eligible for Modified or Return of Premium plans',
      availableCarriers: ['Aflac', 'SBLI', 'American Amicable', 'Corebridge', 'Gerber']
    };
  }

  // Check graded questions
  const gradedAnswers = HEALTH_QUESTIONS.graded.map(q => answers[q.id]);
  if (gradedAnswers.some(a => a === true)) {
    return {
      status: 'graded',
      plan: 'Graded',
      message: 'Eligible for Graded benefit plans',
      availableCarriers: ['GTL', 'TransAmerica', 'American Amicable', 'AHL', 'Royal Neighbors', 'Mutual of Omaha']
    };
  }

  // All questions answered No - eligible for best rates
  return {
    status: 'standard',
    plan: 'Level',
    message: 'Eligible for Level (best) rates',
    availableCarriers: Object.keys(CARRIERS)
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// PREMIUM CALCULATION - NOW USES GOOGLE SHEETS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate monthly premium for a carrier
 * Uses live Google Sheets data if available
 */
export const calculateMonthlyPremium = (carrier, age, gender, tobacco, faceAmount, planType = 'Level') => {
  // Build the lookup key
  const lookupKey = `${carrier}_${planType}`;
  const tabName = CARRIER_TO_TAB[lookupKey];
  
  if (!tabName) {
    console.warn(`[QuoteCalc] No tab mapping for: ${lookupKey}`);
    return null;
  }
  
  // Use Google Sheets data if loaded
  if (isRatesLoaded()) {
    const premium = calculatePremiumFromSheet(tabName, age, gender, tobacco, faceAmount);
    if (premium !== null) {
      return premium;
    }
  }
  
  // Fallback: return null if not loaded (caller should handle loading state)
  console.warn(`[QuoteCalc] Rates not loaded, cannot calculate for ${carrier}`);
  return null;
};

// ═══════════════════════════════════════════════════════════════════════════
// GET ALL CARRIER QUOTES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get all carrier quotes for comparison
 * Returns array format for QuoteDisplay component
 * Filters based on enabled carriers in settings
 */
export const getAllCarrierQuotes = (age, gender, tobacco, faceAmount, eligibility) => {
  const availableCarriers = eligibility?.availableCarriers || Object.keys(CARRIERS);
  
  // Get enabled carriers from user settings
  const enabledCarriers = getEnabledCarriers();
  
  console.log('[QuoteCalc] getAllCarrierQuotes called:', { 
    age, gender, tobacco, faceAmount, 
    isLoaded: isRatesLoaded(),
    enabledCarriers: enabledCarriers.length
  });
  
  // Use Google Sheets data if loaded
  if (isRatesLoaded()) {
    const allQuotes = getAllQuotesFromSheet(age, gender, tobacco, faceAmount);
    
    console.log('[QuoteCalc] Raw quotes from sheet:', allQuotes.length);
    
    // Filter by enabled carriers from settings, mark eligibility
    return allQuotes
      .filter(quote => enabledCarriers.includes(quote.carrier)) // Only show enabled carriers
      .map(quote => ({
        ...quote,
        isEligible: availableCarriers.includes(quote.carrier) && quote.premium !== null
      }))
      .sort((a, b) => {
        // Eligible first, then by premium
        if (a.isEligible && !b.isEligible) return -1;
        if (!a.isEligible && b.isEligible) return 1;
        return (a.premium || 9999) - (b.premium || 9999);
      });
  }
  
  // Return empty if not loaded
  console.warn('[QuoteCalc] Rates not loaded, returning empty quotes');
  return [];
};

/**
 * Get quotes as object (legacy format)
 */
export const getAllCarrierQuotesObject = (age, gender, tobacco, faceAmount, eligibility) => {
  const quotes = {};
  const allQuotes = getAllCarrierQuotes(age, gender, tobacco, faceAmount, eligibility);
  
  allQuotes.forEach(quote => {
    if (quote.isEligible && quote.premium) {
      const key = quote.carrier;
      if (!quotes[key] || quote.premium < quotes[key].premium) {
        quotes[key] = {
          premium: quote.premium,
          planType: quote.planType,
          planOptions: CARRIERS[quote.carrier] || []
        };
      }
    }
  });

  return quotes;
};

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

// Re-export useful functions from the service
export { 
  isRatesLoaded, 
  fetchAllRates, 
  subscribeToRates,
  getRatesSync 
} from './googleSheetsService';

// Check if rates are ready
export const waitForRates = async () => {
  if (isRatesLoaded()) return true;
  await fetchAllRates();
  return isRatesLoaded();
};
