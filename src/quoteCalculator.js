/**
 * Quote Calculator - Shared module for insurance premium calculations
 * Extracted from App.jsx for use in agent phone screen
 */

// ═══════════════════════════════════════════════════════════════════
// CARRIERS & CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

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

export const CARRIER_CONFIG = {
  'Aflac': { annualFee: 48, monthlyFactor: 0.0875, hasTobacco: true },
  'SBLI': { annualFee: 48, monthlyFactor: 0.087, hasTobacco: true },
  'CICA': { annualFee: 48, monthlyFactor: 0.087, hasTobacco: false },
  'GTL': { annualFee: 48, monthlyFactor: 0.08333, hasTobacco: false },
  'Corebridge': { annualFee: 0, monthlyFactor: 0, hasTobacco: false, directLookup: true },
  'TransAmerica': { annualFee: 48, monthlyFactor: 0.0875, hasTobacco: true },
  'American Amicable': { annualFee: 30, monthlyFactor: 0.088, hasTobacco: true },
  'AHL': { annualFee: 120, monthlyFactor: 0.0875, hasTobacco: true },
  'Royal Neighbors': { annualFee: 30, monthlyFactor: 0.087, hasTobacco: true },
  'Gerber': { annualFee: 11, monthlyFactor: 0.083334, hasTobacco: false },
  'Mutual of Omaha': { annualFee: 36, monthlyFactor: 0.089, hasTobacco: true }
};

// ═══════════════════════════════════════════════════════════════════
// SIMPLIFIED RATE TABLES (Common ages 50-80)
// ═══════════════════════════════════════════════════════════════════

// Aflac Level rates per $1,000
const AFLAC_RATES = {
  50: { maleNS: 33.49, maleSm: 47.71, femaleNS: 26.03, femaleSm: 38.57 },
  55: { maleNS: 38.93, maleSm: 59.14, femaleNS: 28.86, femaleSm: 46.57 },
  60: { maleNS: 46.81, maleSm: 70.57, femaleNS: 34.80, femaleSm: 54.57 },
  65: { maleNS: 58.98, maleSm: 95.14, femaleNS: 45.47, femaleSm: 68.29 },
  70: { maleNS: 77.46, maleSm: 119.72, femaleNS: 59.17, femaleSm: 82.00 },
  75: { maleNS: 109.42, maleSm: 179.14, femaleNS: 88.85, femaleSm: 127.72 },
  80: { maleNS: 173.43, maleSm: 238.57, femaleNS: 127.72, femaleSm: 173.43 }
};

// SBLI Level rates per $1,000
const SBLI_RATES = {
  50: { maleNS: 38.90, maleSm: 52.90, femaleNS: 30.85, femaleSm: 41.80 },
  55: { maleNS: 46.15, maleSm: 63.65, femaleNS: 36.85, femaleSm: 49.05 },
  60: { maleNS: 56.40, maleSm: 77.90, femaleNS: 45.10, femaleSm: 60.05 },
  65: { maleNS: 71.15, maleSm: 100.40, femaleNS: 57.35, femaleSm: 76.55 },
  70: { maleNS: 96.40, maleSm: 140.90, femaleNS: 79.60, femaleSm: 111.30 },
  75: { maleNS: 139.90, maleSm: 202.40, femaleNS: 115.85, femaleSm: 160.55 },
  80: { maleNS: 206.40, maleSm: 285.90, femaleNS: 171.10, femaleSm: 222.55 }
};

// CICA Level rates per $1,000 (no tobacco differentiation)
const CICA_RATES = {
  50: { male: 39.11, female: 36.25 },
  55: { male: 49.63, female: 44.61 },
  60: { male: 63.71, female: 56.70 },
  65: { male: 83.12, female: 72.04 },
  70: { male: 118.28, female: 96.40 },
  75: { male: 168.32, female: 129.00 },
  80: { male: 239.25, female: 175.91 }
};

// Mutual of Omaha Level rates per $1,000
const MUTUAL_RATES = {
  50: { maleNS: 39.23, maleSm: 39.23, femaleNS: 32.83, femaleSm: 32.83 },
  55: { maleNS: 51.48, maleSm: 51.48, femaleNS: 39.23, femaleSm: 39.23 },
  60: { maleNS: 59.45, maleSm: 59.45, femaleNS: 48.78, femaleSm: 48.78 },
  65: { maleNS: 71.58, maleSm: 71.58, femaleNS: 57.77, femaleSm: 57.77 },
  70: { maleNS: 93.03, maleSm: 93.03, femaleNS: 75.29, femaleSm: 75.29 },
  75: { maleNS: 121.11, maleSm: 121.11, femaleNS: 104.60, femaleSm: 104.60 },
  80: { maleNS: 159.52, maleSm: 159.52, femaleNS: 132.23, femaleSm: 132.23 }
};

// Corebridge Guaranteed Issue (direct lookup by coverage amount)
const COREBRIDGE_RATES = {
  50: { male: { 5000: 31.43, 10000: 60.85, 15000: 90.27, 20000: 119.70, 25000: 149.12 }, female: { 5000: 21.94, 10000: 41.88, 15000: 61.81, 20000: 86.79, 25000: 107.98 } },
  55: { male: { 5000: 34.36, 10000: 66.72, 15000: 99.08, 20000: 147.18, 25000: 183.48 }, female: { 5000: 26.30, 10000: 50.61, 15000: 74.91, 20000: 112.02, 25000: 139.53 } },
  60: { male: { 5000: 42.18, 10000: 82.37, 15000: 122.55, 20000: 180.95, 25000: 225.69 }, female: { 5000: 32.34, 10000: 62.68, 15000: 93.02, 20000: 137.69, 25000: 171.61 } },
  65: { male: { 5000: 51.97, 10000: 101.94, 15000: 151.91, 20000: 223.94, 25000: 279.42 }, female: { 5000: 40.01, 10000: 78.02, 15000: 116.03, 20000: 171.49, 25000: 213.86 } },
  70: { male: { 5000: 58.68, 10000: 115.36, 15000: 172.04, 20000: 253.35, 25000: 316.19 }, female: { 5000: 44.74, 10000: 87.47, 15000: 130.20, 20000: 192.47, 25000: 240.09 } },
  75: { male: { 5000: 82.49, 10000: 162.98, 15000: 243.47, 20000: 357.15, 25000: 445.94 }, female: { 5000: 64.08, 10000: 126.15, 15000: 188.23, 20000: 276.97, 25000: 345.72 } },
  80: { male: { 5000: 117.43, 10000: 232.86, 15000: 348.29, 20000: 508.27, 25000: 634.84 }, female: { 5000: 93.31, 10000: 184.62, 15000: 275.93, 20000: 405.16, 25000: 505.95 } }
};

// American Amicable Level rates per $1,000
const AMAM_RATES = {
  50: { maleNS: 32.96, maleSm: 43.12, femaleNS: 27.30, femaleSm: 32.55 },
  55: { maleNS: 42.49, maleSm: 53.82, femaleNS: 35.28, femaleSm: 40.94 },
  60: { maleNS: 50.47, maleSm: 65.82, femaleNS: 40.48, femaleSm: 49.01 },
  65: { maleNS: 64.89, maleSm: 83.43, femaleNS: 50.47, femaleSm: 62.57 },
  70: { maleNS: 86.53, maleSm: 108.72, femaleNS: 65.61, femaleSm: 79.02 },
  75: { maleNS: 119.74, maleSm: 147.55, femaleNS: 89.87, femaleSm: 104.29 },
  80: { maleNS: 174.07, maleSm: 203.53, femaleNS: 126.18, femaleSm: 150.62 }
};

// TransAmerica Level rates per $1,000
const TRANSAMERICA_RATES = {
  50: { maleNS: 41.11, maleSm: 63.95, femaleNS: 34.27, femaleSm: 47.63 },
  55: { maleNS: 48.68, maleSm: 75.31, femaleNS: 38.28, femaleSm: 55.39 },
  60: { maleNS: 55.96, maleSm: 97.30, femaleNS: 43.38, femaleSm: 68.80 },
  65: { maleNS: 70.69, maleSm: 125.70, femaleNS: 55.78, femaleSm: 85.45 },
  70: { maleNS: 95.88, maleSm: 166.76, femaleNS: 71.58, femaleSm: 112.81 },
  75: { maleNS: 131.96, maleSm: 221.22, femaleNS: 95.67, femaleSm: 152.74 },
  80: { maleNS: 196.15, maleSm: 307.44, femaleNS: 151.99, femaleSm: 220.92 }
};

// GTL Graded rates per $1,000 (no tobacco)
const GTL_RATES = {
  50: { male: 61, female: 41 },
  55: { male: 67, female: 51 },
  60: { male: 78, female: 60 },
  65: { male: 100, female: 73 },
  70: { male: 120, female: 90 },
  75: { male: 172, female: 132 },
  80: { male: 290, female: 210 }
};

// ═══════════════════════════════════════════════════════════════════
// HEALTH QUESTIONS (Same as application form)
// ═══════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════
// ELIGIBILITY CALCULATION
// ═══════════════════════════════════════════════════════════════════

/**
 * Calculate eligibility tier based on health question answers
 * @param {Object} answers - Object with question IDs as keys, boolean answers as values
 * @returns {Object} { status, plan, message }
 */
export const calculateEligibility = (answers) => {
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

// ═══════════════════════════════════════════════════════════════════
// PREMIUM CALCULATION
// ═══════════════════════════════════════════════════════════════════

/**
 * Get the nearest available age from rate table
 */
const getNearestAge = (age, rateTable) => {
  const ages = Object.keys(rateTable).map(Number);
  return ages.reduce((prev, curr) => 
    Math.abs(curr - age) < Math.abs(prev - age) ? curr : prev
  );
};

/**
 * Calculate monthly premium for a carrier
 * @param {string} carrier - Carrier name
 * @param {number} age - Customer age
 * @param {string} gender - 'Male' or 'Female'
 * @param {boolean} tobacco - Tobacco user
 * @param {number} faceAmount - Coverage amount
 * @param {string} planType - Plan type (Level, Graded, etc.)
 * @returns {number|null} Monthly premium or null if not available
 */
export const calculateMonthlyPremium = (carrier, age, gender, tobacco, faceAmount, planType = 'Level') => {
  const config = CARRIER_CONFIG[carrier];
  if (!config) return null;

  const isMale = gender === 'Male';
  const isSmoker = tobacco === true;
  let rate = null;

  // Helper to get rate with tobacco differentiation
  const getRateWithTobacco = (table, lookupAge) => {
    const ageData = table[lookupAge];
    if (!ageData) return null;
    return isMale 
      ? (isSmoker ? ageData.maleSm : ageData.maleNS)
      : (isSmoker ? ageData.femaleSm : ageData.femaleNS);
  };

  // Helper to get rate without tobacco
  const getRateNoTobacco = (table, lookupAge) => {
    const ageData = table[lookupAge];
    if (!ageData) return null;
    return isMale ? ageData.male : ageData.female;
  };

  switch (carrier) {
    case 'Aflac':
      rate = getRateWithTobacco(AFLAC_RATES, getNearestAge(age, AFLAC_RATES));
      break;
    case 'SBLI':
      rate = getRateWithTobacco(SBLI_RATES, getNearestAge(age, SBLI_RATES));
      break;
    case 'CICA':
      rate = getRateNoTobacco(CICA_RATES, getNearestAge(age, CICA_RATES));
      break;
    case 'Mutual of Omaha':
      rate = getRateWithTobacco(MUTUAL_RATES, getNearestAge(age, MUTUAL_RATES));
      break;
    case 'American Amicable':
      rate = getRateWithTobacco(AMAM_RATES, getNearestAge(age, AMAM_RATES));
      break;
    case 'TransAmerica':
      rate = getRateWithTobacco(TRANSAMERICA_RATES, getNearestAge(age, TRANSAMERICA_RATES));
      break;
    case 'GTL':
      rate = getRateNoTobacco(GTL_RATES, getNearestAge(age, GTL_RATES));
      break;
    case 'Corebridge': {
      const lookupAge = getNearestAge(age, COREBRIDGE_RATES);
      const ageData = COREBRIDGE_RATES[lookupAge];
      if (!ageData) return null;
      const genderRates = isMale ? ageData.male : ageData.female;
      // Find closest coverage amount
      const amounts = [5000, 10000, 15000, 20000, 25000];
      const closestAmount = amounts.reduce((prev, curr) =>
        Math.abs(curr - faceAmount) < Math.abs(prev - faceAmount) ? curr : prev
      );
      return genderRates[closestAmount];
    }
    default:
      return null;
  }

  if (!rate) return null;

  // Calculate premium
  const units = faceAmount / 1000;
  const annualBase = rate * units;
  const totalAnnual = annualBase + config.annualFee;
  const withFactor = totalAnnual + (totalAnnual * config.monthlyFactor);
  const monthlyPremium = withFactor / 12;

  return Math.round(monthlyPremium * 100) / 100;
};

/**
 * Get all carrier quotes for comparison
 */
export const getAllCarrierQuotes = (age, gender, tobacco, faceAmount, eligibility) => {
  const quotes = {};
  const availableCarriers = eligibility?.availableCarriers || Object.keys(CARRIERS);
  
  availableCarriers.forEach(carrier => {
    const planTypes = CARRIERS[carrier];
    if (planTypes) {
      // Use first available plan type
      const premium = calculateMonthlyPremium(carrier, age, gender, tobacco, faceAmount, planTypes[0]);
      if (premium) {
        quotes[carrier] = {
          premium,
          planType: planTypes[0],
          planOptions: planTypes
        };
      }
    }
  });

  return quotes;
};
