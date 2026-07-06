/**
 * Normalization and validation utility for automation payloads.
 */

/**
 * Normalize plan type to Level, Graded, or ROP
 * @param {string} value
 * @returns {string}
 */
export const normalizePlanType = (value) => {
  if (!value) return 'Level';
  const val = String(value).trim().toLowerCase();
  if (val === 'i' || val === 'immediate' || val === 'level' || val === 'l') {
    return 'Level';
  }
  if (val === 'g' || val === 'graded') {
    return 'Graded';
  }
  if (val === 'r' || val === 'rop' || val.includes('return of premium')) {
    return 'ROP';
  }
  return 'Level'; // Default fallback
};

/**
 * Normalize boolean values from various formats
 * @param {any} value
 * @returns {boolean}
 */
export const normalizeBoolean = (value) => {
  if (value === undefined || value === null) return false;
  if (typeof value === 'boolean') return value;
  const str = String(value).trim().toLowerCase();
  return ['true', 'yes', 'y', 't', '1'].includes(str);
};

/**
 * Normalize account type to Checking or Saving
 * @param {string} value
 * @returns {string}
 */
export const normalizeAccountType = (value) => {
  if (!value) return 'Checking';
  const str = String(value).trim().toLowerCase();
  if (str === 'savings' || str === 'saving' || str === 's') {
    return 'Saving';
  }
  return 'Checking';
};

/**
 * Normalize draft day based on SS payment schedule flag
 * @param {any} value
 * @param {boolean} ssPaymentSchedule
 * @returns {string}
 */
export const normalizeDraftDay = (value, ssPaymentSchedule) => {
  if (!value) return ssPaymentSchedule ? '1S' : '15';
  const str = String(value).trim().toUpperCase();
  if (ssPaymentSchedule) {
    const validWeeks = ['1S', '3S', '2W', '3W', '4W'];
    return validWeeks.includes(str) ? str : '1S';
  } else {
    // Extract numbers, limit between 1 and 28
    const num = parseInt(str.replace(/[^0-9]/g, ''), 10);
    if (isNaN(num) || num < 1 || num > 28) return '15';
    return String(num);
  }
};

/**
 * Parse height string (e.g. 5'9" or 5-9) to feet and inches
 * @param {string} value
 * @returns {{feet: number, inches: number}}
 */
export const parseHeight = (value) => {
  const defaultHeight = { feet: 5, inches: 6 };
  if (!value) return defaultHeight;
  
  const str = String(value).trim();
  // Try pattern like 5'9" or 5'9
  const feetInchesMatch = str.match(/(\d+)\s*'\s*(\d+)/);
  if (feetInchesMatch) {
    return {
      feet: parseInt(feetInchesMatch[1], 10),
      inches: parseInt(feetInchesMatch[2], 10)
    };
  }
  
  // Try pattern like 5-9 or 5 9
  const separatorMatch = str.match(/(\d+)\s*[- ]\s*(\d+)/);
  if (separatorMatch) {
    return {
      feet: parseInt(separatorMatch[1], 10),
      inches: parseInt(separatorMatch[2], 10)
    };
  }
  
  // Try single number (inches or feet)
  const singleMatch = str.match(/^(\d+)$/);
  if (singleMatch) {
    const num = parseInt(singleMatch[1], 10);
    if (num > 3 && num < 9) {
      return { feet: num, inches: 0 };
    }
  }
  
  return defaultHeight;
};

/**
 * Normalize DOB to MM/DD/YYYY format
 * @param {string} value
 * @returns {string}
 */
export const normalizeDob = (value) => {
  if (!value) return '';
  const str = String(value).trim();
  
  // If YYYY-MM-DD
  if (str.includes('-')) {
    const parts = str.split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts;
      if (y.length === 4) {
        return `${m.padStart(2, '0')}/${d.padStart(2, '0')}/${y}`;
      }
    }
  }
  
  // If MM/DD/YYYY
  if (str.includes('/')) {
    const parts = str.split('/');
    if (parts.length === 3) {
      const [m, d, y] = parts;
      return `${m.padStart(2, '0')}/${d.padStart(2, '0')}/${y.padStart(4, '20')}`;
    }
  }
  
  return str;
};

/**
 * Extract health questions and convert to boolean map
 * @param {object} body
 * @returns {object}
 */
export const normalizeHealthQuestions = (body) => {
  const q = {};
  for (let i = 1; i <= 6; i++) {
    q[`healthQ${i}`] = normalizeBoolean(body[`healthQ${i}`] !== undefined ? body[`healthQ${i}`] : body[`q${i}`]);
  }
  
  const subQs = ['7a', '7b', '7c', '7d', '8a', '8b', '8c'];
  subQs.forEach(suffix => {
    q[`healthQ${suffix}`] = normalizeBoolean(body[`healthQ${suffix}`] !== undefined ? body[`healthQ${suffix}`] : body[`q${suffix}`]);
  });
  
  q.healthCovid = normalizeBoolean(body.healthCovid || body.covid);
  return q;
};

/**
 * Validate required fields and normalize payload
 * @param {object} body
 * @returns {{isValid: boolean, errors: string[], normalized: object}}
 */
export const validateAndNormalizePayload = (body) => {
  const errors = [];
  const normalized = {};

  if (!body) {
    return { isValid: false, errors: ['Request body is empty'], normalized: {} };
  }

  // 1. Personal Info
  normalized.firstName = (body.firstName || body.first_name || '').trim();
  if (!normalized.firstName) errors.push('First Name is required');

  normalized.middleName = (body.middleName || body.middle_name || '').trim();

  normalized.lastName = (body.lastName || body.last_name || '').trim();
  if (!normalized.lastName) errors.push('Last Name is required');

  normalized.dob = normalizeDob(body.dob);
  if (!normalized.dob) {
    errors.push('Date of Birth is required');
  }

  // Calculate age if missing but DOB is present
  let age = parseInt(body.age, 10);
  if (isNaN(age) && normalized.dob) {
    const parts = normalized.dob.split('/');
    if (parts.length === 3) {
      const birthDate = new Date(parts[2], parts[0] - 1, parts[1]);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }
  }
  normalized.age = isNaN(age) ? null : age;
  if (normalized.age === null) {
    errors.push('Age or Date of Birth is required to resolve age');
  }

  normalized.gender = (body.gender || '').trim();
  if (!normalized.gender) {
    errors.push('Gender is required');
  } else {
    const g = normalized.gender.toUpperCase();
    if (g === 'M' || g === 'MALE') normalized.gender = 'Male';
    else if (g === 'F' || g === 'FEMALE') normalized.gender = 'Female';
    else errors.push('Gender must be Male or Female');
  }

  normalized.tobacco = normalizeBoolean(body.tobacco);
  if (body.tobacco === undefined || body.tobacco === null) {
    errors.push('Tobacco selection is required');
  }

  normalized.state = (body.state || '').trim();
  if (!normalized.state) errors.push('State is required');

  normalized.address = (body.address || '').trim();
  if (!normalized.address) errors.push('Address is required');

  normalized.city = (body.city || '').trim();
  if (!normalized.city) errors.push('City is required');

  normalized.zip = (body.zip || '').trim();
  if (!normalized.zip) errors.push('Zip code is required');

  normalized.phone = (body.phone || '').trim().replace(/[^0-9]/g, '');
  if (!normalized.phone) errors.push('Phone number is required');

  normalized.email = (body.email || '').trim() || `${normalized.firstName.toLowerCase()}.${normalized.lastName.toLowerCase()}@example.com`;
  normalized.birthState = (body.birthState || body.stateOfBirth || body.state_of_birth || normalized.state || '').trim();

  // Height / Weight
  const heightData = parseHeight(body.height || body.heightFeet);
  normalized.heightFeet = heightData.feet;
  normalized.heightInches = heightData.inches;

  normalized.weight = parseInt(body.weight, 10);
  if (isNaN(normalized.weight)) {
    errors.push('Weight must be a valid number');
  }

  // 2. Plan Info
  normalized.selectedPlanType = normalizePlanType(body.selectedPlanType || body.planType || body.plan);
  normalized.selectedCoverage = parseInt(body.selectedCoverage || body.faceAmount || body.face_amount, 10);
  if (isNaN(normalized.selectedCoverage) || normalized.selectedCoverage <= 0) {
    errors.push('Coverage amount must be a positive number');
  }

  // 3. Beneficiary Info
  normalized.beneficiaryName = (body.beneficiaryName || body.primaryBenName || '').trim();
  if (!normalized.beneficiaryName) errors.push('Beneficiary Name is required');

  normalized.beneficiaryRelation = (body.beneficiaryRelation || body.primaryBenRel || '').trim();
  if (!normalized.beneficiaryRelation) errors.push('Beneficiary Relation is required');

  // 4. Banking Info
  normalized.accountHolder = (body.accountHolder || body.accountName || '').trim() || `${normalized.firstName} ${normalized.lastName}`;
  if (!normalized.accountHolder) errors.push('Account Holder Name is required');

  normalized.bankName = (body.bankName || '').trim();
  if (!normalized.bankName) errors.push('Bank Name is required');

  normalized.bankCityState = (body.bankCityState || body.bankAddress || '').trim();
  if (!normalized.bankCityState) errors.push('Bank City/State is required');

  normalized.ssPaymentSchedule = normalizeBoolean(body.ssPaymentSchedule !== undefined ? body.ssPaymentSchedule : (body.draftSchedule === 'ss_payment'));
  normalized.draftDay = normalizeDraftDay(body.draftDay || body.draftDate, normalized.ssPaymentSchedule);
  if (!normalized.draftDay) errors.push('Draft Day is required');

  normalized.routingNumber = (body.routingNumber || body.routing || '').trim().replace(/[^0-9]/g, '');
  if (!normalized.routingNumber) {
    errors.push('Routing Number is required');
  } else if (normalized.routingNumber.length !== 9) {
    errors.push('Routing Number must be exactly 9 digits');
  }

  normalized.accountNumber = (body.accountNumber || body.accountNum || '').trim().replace(/[^0-9]/g, '');
  if (!normalized.accountNumber) errors.push('Account Number is required');

  normalized.accountType = normalizeAccountType(body.accountType);

  // 5. Existing Insurance / Replacements
  normalized.hasExistingInsurance = normalizeBoolean(body.hasExistingInsurance !== undefined ? body.hasExistingInsurance : body.hasExisting);
  normalized.willReplaceExisting = normalizeBoolean(body.willReplaceExisting !== undefined ? body.willReplaceExisting : body.willReplace);
  normalized.existingCompanyName = (body.existingCompanyName || '').trim();
  normalized.existingPolicyNumber = (body.existingPolicyNumber || '').trim();
  normalized.existingCoverageAmount = (body.existingCoverageAmount || '').trim();

  // 6. Doctor Info
  normalized.doctorName = (body.doctorName || body.physicianName || '').trim() || 'None';
  normalized.doctorAddress = (body.doctorAddress || '').trim() || 'None';
  normalized.doctorPhone = (body.doctorPhone || '').trim() || 'None';

  // 7. Illinois Resident Designee Choice
  normalized.ilDesigneeChoice = body.ilDesigneeChoice || null;

  // 8. Health Questions
  const healthQs = normalizeHealthQuestions(body);
  Object.assign(normalized, healthQs);

  // 9. Meta and flow control
  normalized.appId = body.id || body.appId || null;
  normalized.ownerIsInsured = body.ownerIsInsured !== undefined ? normalizeBoolean(body.ownerIsInsured) : true;
  normalized.payorIsInsured = body.payorIsInsured !== undefined ? normalizeBoolean(body.payorIsInsured) : true;
  normalized.retryMode = normalizeBoolean(body.retryMode);

  return {
    isValid: errors.length === 0,
    errors,
    normalized
  };
};
