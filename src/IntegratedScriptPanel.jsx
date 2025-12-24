// IntegratedScriptPanel.jsx
// COMPLETE REBUILD - Imports from quoteCalculator.js
// NO hardcoded rate tables - uses existing module
// Now implements dynamic Location Verification and DOB Collection

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  Check, 
  DollarSign, 
  X, 
  Calculator,
  CheckCircle2,
  RotateCcw,
  Info,
  MapPin,
  Calendar,
  AlertCircle
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════
// IMPORT FROM YOUR EXISTING QUOTE CALCULATOR - NO DUPLICATED RATE TABLES
// ═══════════════════════════════════════════════════════════════════════════
import { 
  calculateMonthlyPremium, 
  getAllCarrierQuotes,
  calculateEligibility,
  CARRIERS,
  CARRIER_CONFIG,
  isRatesLoaded,
  subscribeToRates,
  fetchAllRates
} from './quoteCalculator';

// ═══════════════════════════════════════════════════════════════════════════
// AREA CODE UTILITY - Derive state from phone number
// ═══════════════════════════════════════════════════════════════════════════
import { getStateFromAreaCode } from './utils/areaCodeLookup';

// ═══════════════════════════════════════════════════════════════════════════
// HELPER: Calculate age from DOB
// ═══════════════════════════════════════════════════════════════════════════
const calculateAge = (dob) => {
  if (!dob) return null;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

// ═══════════════════════════════════════════════════════════════════════════
// CARRIER LOGO MAPPING
// ═══════════════════════════════════════════════════════════════════════════
const CARRIER_LOGOS = {
  'Aflac': '/logos/aflac.png',
  'SBLI': '/logos/sbli.png',
  'CICA': '/logos/cica.png',
  'GTL': '/logos/gtl.png',
  'Corebridge': '/logos/corebridge.png',
  'TransAmerica': '/logos/trans.png',
  'American Amicable': '/logos/amam.png',
  'AHL': '/logos/ahl.png',
  'Royal Neighbors': '/logos/royal.png',
  'Gerber': '/logos/gerber.png',
  'Mutual of Omaha': '/logos/mutual.png'
};

// Coverage amount options
const COVERAGE_OPTIONS = [
  { value: 3000, label: '$3,000' },
  { value: 5000, label: '$5,000' },
  { value: 7500, label: '$7,500' },
  { value: 10000, label: '$10,000' },
  { value: 15000, label: '$15,000' },
  { value: 20000, label: '$20,000' },
  { value: 25000, label: '$25,000' }
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
const IntegratedScriptPanel = ({ prospectData = {}, onDataUpdate }) => {
  
  // ─────────────────────────────────────────────────────────────────────────
  // DETERMINE DATA SOURCE FOR LOCATION
  // Priority 1: Webhook Data (city + state)
  // Priority 2: Area Code Lookup (state only from phone number)
  // ─────────────────────────────────────────────────────────────────────────
  const phoneNumber = prospectData?.phone || prospectData?.caller_id || '';
  const webhookCity = prospectData?.city || null;
  const webhookState = prospectData?.state || null;
  const areaCodeState = phoneNumber ? getStateFromAreaCode(phoneNumber) : null;
  
  // Determine which data source to use
  const hasWebhookData = !!(webhookCity && webhookState);
  const locationDataSource = hasWebhookData ? 'webhook' : (areaCodeState ? 'areaCode' : 'manual');
  const initialState = webhookState || areaCodeState || '';
  const initialCity = hasWebhookData ? webhookCity : '';
  
  // Check if DOB is pre-filled from webhook
  const webhookDOB = prospectData?.dob || prospectData?.date_of_birth || null;
  const hasDOBData = !!webhookDOB;
  
  // Calculate initial age from DOB or use prospectData.age
  const calculateInitialAge = () => {
    if (webhookDOB) {
      return calculateAge(webhookDOB);
    }
    return prospectData?.age || null;
  };
  
  // ─────────────────────────────────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────────────────────────────────
  const [nodeId, setNodeId] = useState('opening');
  const [history, setHistory] = useState(['opening']);
  const [formData, setFormData] = useState({
    firstName: prospectData?.first_name || prospectData?.firstName || '',
    lastName: prospectData?.last_name || prospectData?.lastName || '',
    state: initialState,
    city: initialCity,
    dob: webhookDOB || '',
    age: calculateInitialAge(),
    gender: prospectData?.gender || 'Female',
    tobacco: false,
    heightFeet: '',
    heightInches: '',
    weight: '',
    beneficiaryName: prospectData?.beneficiary || '',
    beneficiaryRelation: '',
    ssPaymentDay: '',
    address: prospectData?.address || '',
    zip: prospectData?.zip || '',
    ssn: '',
    birthState: '',
    citizenship: 'Yes',
    email: prospectData?.email || '',
    phone: phoneNumber,
    bankName: '',
    routingNumber: '',
    accountNumber: '',
    accountType: 'Checking',
    healthAnswers: {},
    selectedCarrier: null,
    selectedCoverage: 10000,
    selectedPremium: null,
    selectedPlanType: 'Level',
    medications: '',
    hospitalizationReason: '',
    callbackDate: '',
    callbackTime: '',
    // ═══ DATA VERIFICATION FLAGS ═══
    locationVerified: false,
    dobVerified: false,
    locationDataSource: locationDataSource, // 'webhook' | 'areaCode' | 'manual'
    dobDataSource: hasDOBData ? 'webhook' : 'manual' // 'webhook' | 'manual'
  });
  
  const [showQuotePanel, setShowQuotePanel] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [ratesLoaded, setRatesLoaded] = useState(isRatesLoaded());
  const [ratesVersion, setRatesVersion] = useState(0); // Forces re-render on rate update
  const scrollRef = useRef(null);

  // ─────────────────────────────────────────────────────────────────────────
  // GOOGLE SHEETS RATE LOADING
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    // Initial load
    if (!isRatesLoaded()) {
      fetchAllRates().then(() => {
        setRatesLoaded(true);
        setRatesVersion(v => v + 1);
      });
    }
    
    // Subscribe to rate updates
    const unsubscribe = subscribeToRates(() => {
      console.log('[IntegratedScriptPanel] Rates updated from Google Sheets');
      setRatesLoaded(true);
      setRatesVersion(v => v + 1);
    });
    
    return () => unsubscribe();
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // SYNC DATA TO PARENT (Customer Data tab, Admin Dashboard)
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (onDataUpdate) {
      onDataUpdate(formData);
    }
  }, [formData, onDataUpdate]);

  // Scroll to top on node change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [nodeId]);

  // ─────────────────────────────────────────────────────────────────────────
  // UPDATE FORM DATA
  // ─────────────────────────────────────────────────────────────────────────
  const updateField = useCallback((key, value) => {
    setFormData(prev => {
      const updated = { ...prev, [key]: value };
      if (key === 'dob' && value) {
        updated.age = calculateAge(value);
      }
      return updated;
    });
  }, []);

  const updateMultiple = useCallback((updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // QUOTE CALCULATIONS - USING IMPORTED FUNCTIONS
  // ─────────────────────────────────────────────────────────────────────────
  const eligibility = useMemo(() => {
    return calculateEligibility(formData.healthAnswers);
  }, [formData.healthAnswers]);

  const quotes = useMemo(() => {
    if (!ratesLoaded) return []; // Wait for rates to load
    if (!formData.age) return []; // Don't calculate without a real age
    return getAllCarrierQuotes(
      formData.age, 
      formData.gender, 
      formData.tobacco, 
      formData.selectedCoverage, 
      eligibility
    );
  }, [formData.age, formData.gender, formData.tobacco, formData.selectedCoverage, eligibility, ratesLoaded, ratesVersion]);

  const bestQuote = useMemo(() => {
    const eligible = quotes.filter(q => q.isEligible && q.premium);
    if (eligible.length === 0) {
      // Return loading/empty state instead of hardcoded values
      return null;
    }
    return eligible[0];
  }, [quotes]);

  const activeQuote = formData.selectedCarrier 
    ? quotes.find(q => q.carrier === formData.selectedCarrier) || bestQuote 
    : bestQuote;

  const premiums = useMemo(() => {
    if (!activeQuote || !formData.age) {
      return { p15k: null, p10k: null, p5k: null, p3k: null };
    }
    return {
      p15k: calculateMonthlyPremium(activeQuote.carrier, formData.age, formData.gender, formData.tobacco, 15000, activeQuote.planType),
      p10k: calculateMonthlyPremium(activeQuote.carrier, formData.age, formData.gender, formData.tobacco, 10000, activeQuote.planType),
      p5k: calculateMonthlyPremium(activeQuote.carrier, formData.age, formData.gender, formData.tobacco, 5000, activeQuote.planType),
      p3k: calculateMonthlyPremium(activeQuote.carrier, formData.age, formData.gender, formData.tobacco, 3000, activeQuote.planType)
    };
  }, [activeQuote?.carrier, activeQuote?.planType, formData.age, formData.gender, formData.tobacco, ratesVersion]);

  // ─────────────────────────────────────────────────────────────────────────
  // SCRIPT TEXT REPLACEMENT
  // ─────────────────────────────────────────────────────────────────────────
  const replaceVars = useCallback((text) => {
    if (!text) return '';
    return text
      .replace(/{firstName}/g, formData.firstName || 'Friend')
      .replace(/{lastName}/g, formData.lastName || '')
      .replace(/{state}/g, formData.state || 'your state')
      .replace(/{city}/g, formData.city || '')
      .replace(/{age}/g, formData.age || '')
      .replace(/{beneficiary}/g, formData.beneficiaryName || 'your beneficiary')
      .replace(/{carrier}/g, activeQuote?.carrier || 'the carrier')
      .replace(/{premium}/g, `$${activeQuote?.premium?.toFixed(2) || '0.00'}`)
      .replace(/{coverage}/g, `$${formData.selectedCoverage.toLocaleString()}`)
      .replace(/{p15k}/g, `$${premiums.p15k?.toFixed(2) || '0.00'}`)
      .replace(/{p10k}/g, `$${premiums.p10k?.toFixed(2) || '0.00'}`)
      .replace(/{p5k}/g, `$${premiums.p5k?.toFixed(2) || '0.00'}`)
      .replace(/{p3k}/g, `$${premiums.p3k?.toFixed(2) || '0.00'}`)
      .replace(/{ssDay}/g, formData.ssPaymentDay || 'your payment day');
  }, [formData, activeQuote, premiums]);

  // ─────────────────────────────────────────────────────────────────────────
  // DYNAMIC SCRIPT NODES
  // ─────────────────────────────────────────────────────────────────────────
  const NODES = useMemo(() => ({
    
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 1: OPENING
    // ═══════════════════════════════════════════════════════════════════════
    'opening': {
      id: 'opening',
      phase: 1,
      title: 'Transfer Opening',
      script: `Thank you, I've got it from here. Hello, **{firstName}**. My name is [Your Name], and I am the state-licensed field underwriter assigned to your file in **{state}** today. I see here that you were looking for some information on the state-regulated final expense programs to cover burial and cremation costs, is that correct?`,
      tip: 'Never ask "How are you?" - dive straight in (+7.63 pts)',
      options: [
        { label: '✅ Yes, that\'s right', next: 'authority', color: 'emerald' },
        { label: '⚠️ Just looking / Not buying', next: 'reassurance', color: 'amber' },
        { label: '❓ Confused / Who is this?', next: 'clarify', color: 'blue' },
        { label: '❌ Not interested', next: 'not_interested', color: 'red' }
      ]
    },

    'reassurance': {
      id: 'reassurance',
      phase: 1,
      title: 'Reassurance',
      script: `I understand completely. My job isn't to sell you anything you don't need. My job is simply to be your eyes and ears, shop the top-rated carriers in **{state}**, and see if we can find you a plan that fits your budget.`,
      options: [
        { label: '✅ Continue', next: 'authority', color: 'emerald' }
      ]
    },

    'clarify': {
      id: 'clarify',
      phase: 1,
      title: 'Clarify Purpose',
      script: `You recently requested information about final expense coverage—sometimes through a mailer, TV ad, or online form. I'm just following up to see what options are available in **{state}**. Does that ring a bell?`,
      options: [
        { label: '✅ Yes, I remember', next: 'authority', color: 'emerald' },
        { label: '❌ Wrong person', next: 'end_polite', color: 'red' }
      ]
    },

    'not_interested': {
      id: 'not_interested',
      phase: 1,
      title: 'Handle Not Interested',
      script: `I completely understand. Before I let you go—do you currently have any coverage in place for final expenses? The average funeral today costs between $8,000 and $15,000. Without coverage, that burden falls directly on your family. Can I take just 2 minutes to show you what's available?`,
      options: [
        { label: '✅ Okay, 2 minutes', next: 'authority', color: 'emerald' },
        { label: '❌ No thanks', next: 'end_polite', color: 'red' }
      ]
    },

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 2: AUTHORITY & VERIFICATION
    // ═══════════════════════════════════════════════════════════════════════
    'authority': {
      id: 'authority',
      phase: 2,
      title: 'Establish Authority',
      script: `Now, just so you know who you are speaking with—I am a state-regulated benefit coordinator. I don't work for just one insurance company. **I work for you.** I have access to over 20 different carriers, which means I can find the discounts that you might not be able to find on your own. Does that make sense?`,
      tip: 'Authority title: +1.06 pts',
      options: [
        { label: '✅ Yes / Makes sense', next: 'compliance', color: 'emerald' },
        { label: '❓ Skeptical / Wants proof', next: 'trust_objection', color: 'amber' }
      ]
    },

    'compliance': {
      id: 'compliance',
      phase: 2,
      title: 'Compliance Disclosure',
      script: `Because I am a licensed agent in the state of **{state}**, I am required to let you know that this line is recorded for quality assurance and training purposes. Everything we discuss is 100% private and protected under HIPAA laws. I take your privacy very seriously.`,
      options: [
        { label: '✅ Continue', next: 'verify_name', color: 'emerald' }
      ]
    },

    'verify_name': {
      id: 'verify_name',
      phase: 2,
      title: 'Verify Name',
      script: `Perfect. To get started, I have your first name as **{firstName}**. Can you spell your last name for me?`,
      tip: 'Assumptive language: +30.56 pts lift',
      fields: [
        { key: 'lastName', label: 'Last Name', type: 'text', placeholder: 'Enter last name' }
      ],
      options: [
        { label: '✅ Continue', next: 'verify_location', color: 'emerald' }
      ]
    },

    // ═══════════════════════════════════════════════════════════════════════
    // VERIFY LOCATION SCREEN - DYNAMIC BASED ON DATA SOURCE
    // ═══════════════════════════════════════════════════════════════════════
    'verify_location': {
      id: 'verify_location',
      phase: 2,
      title: 'Verify Location',
      // Script changes based on whether we have webhook data or just area code
      script: formData.locationDataSource === 'webhook' && formData.city
        ? `Thank you. And just to confirm, you are currently residing in **${formData.city}**, **${formData.state}**, correct?`
        : `Thank you. And just to confirm, you are currently residing in **${formData.state || 'your state'}**, correct?`,
      tip: 'Finding common ground: +9.19 pts lift',
      dynamicLocation: true, // Flag to show location UI
      options: [
        { 
          label: '✅ Yes, that\'s correct', 
          next: 'verify_location_yes', 
          color: 'emerald',
          setData: { locationVerified: true }
        },
        { 
          label: '❌ No, that\'s not right', 
          next: 'verify_location_no', 
          color: 'red' 
        }
      ]
    },

    // Location YES Response - varies by data source
    'verify_location_yes': {
      id: 'verify_location_yes',
      phase: 2,
      title: 'Location Confirmed',
      script: formData.locationDataSource === 'webhook' && formData.city
        ? `Wonderful. I have family that lives not too far from there. How long have you lived in **${formData.city}**?`
        : `Excellent. I have family that lives in **${formData.state}**. How long have you lived in **${formData.state}**?`,
      tip: 'Build rapport with personal connection',
      options: [
        { label: '✅ Continue', next: 'dob_transition', color: 'emerald' }
      ]
    },

    // Location NO Response - need to update
    'verify_location_no': {
      id: 'verify_location_no',
      phase: 2,
      title: 'Update Location',
      script: `Oh. What state do you live in?`,
      tip: 'Collect correct location info',
      fields: [
        { key: 'state', label: 'State', type: 'text', placeholder: 'Enter state' },
        { key: 'city', label: 'City', type: 'text', placeholder: 'Enter city (optional)' }
      ],
      options: [
        { 
          label: '✅ Updated', 
          next: 'verify_location_updated', 
          color: 'emerald',
          setData: { locationVerified: true, locationDataSource: 'manual' }
        }
      ]
    },

    'verify_location_updated': {
      id: 'verify_location_updated',
      phase: 2,
      title: 'Location Updated',
      script: `Oh fantastic. I have family that lives there too. I hear it's a great place. How long have you lived there for?`,
      tip: 'Continue building rapport',
      options: [
        { label: '✅ Continue', next: 'dob_transition', color: 'emerald' }
      ]
    },

    // ═══════════════════════════════════════════════════════════════════════
    // DOB TRANSITION SCRIPT - ALWAYS DISPLAYED BEFORE DOB LOGIC
    // ═══════════════════════════════════════════════════════════════════════
    'dob_transition': {
      id: 'dob_transition',
      phase: 3,
      title: 'How We Help',
      script: `So, here is how I help. Instead of you calling ten different insurance companies and waiting on hold, I can pull all the state-regulated plan rates up right now on my screen and find you discounts that wouldn't be available to you elsewhere... and then we can pick the best plan together that offers you the most coverage at the lowest price. To get those rates accurate, I need to ask you a few more questions. Fair enough?`,
      tip: 'Value proposition before asking for info',
      options: [
        { label: '✅ Fair enough', next: 'health_dob', color: 'emerald' },
        { label: '⚠️ Hesitant', next: 'dob_transition', color: 'amber' }
      ]
    },

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 3: HEALTH QUALIFICATION - DOB SCREEN
    // Dynamic based on whether DOB is pre-filled
    // ═══════════════════════════════════════════════════════════════════════
    'health_dob': {
      id: 'health_dob',
      phase: 3,
      title: 'Date of Birth',
      // Scenario A: DOB IS Available (Pre-filled) vs Scenario B: DOB is NOT Available
      script: formData.dob && formData.dobDataSource === 'webhook'
        ? `Fantastic. We have your date of birth as **${new Date(formData.dob).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}**. Is that correct?`
        : `What is your date of birth?`,
      tip: 'Permission-based questions: +16.13 pts lift',
      dynamicDOB: true, // Flag to show DOB-specific UI
      fields: formData.dob && formData.dobDataSource === 'webhook'
        ? [] // No field needed if pre-filled and asking for confirmation
        : [{ key: 'dob', label: 'Date of Birth', type: 'date' }],
      ageDisplay: true,
      options: formData.dob && formData.dobDataSource === 'webhook'
        ? [
            { 
              label: '✅ Yes, that\'s correct', 
              next: 'health_gender', 
              color: 'emerald',
              setData: { dobVerified: true }
            },
            { 
              label: '❌ No, that\'s incorrect', 
              next: 'health_dob_correction', 
              color: 'red' 
            }
          ]
        : [
            { 
              label: '✅ DOB Provided', 
              next: 'health_gender', 
              color: 'emerald',
              setData: { dobVerified: true, dobDataSource: 'manual' }
            },
            { 
              label: '⚠️ User Objects/Refuses', 
              next: 'health_dob_objection', 
              color: 'amber' 
            }
          ]
    },

    // DOB Correction (when pre-filled DOB is wrong)
    'health_dob_correction': {
      id: 'health_dob_correction',
      phase: 3,
      title: 'Correct Date of Birth',
      script: `Apologies, let me correct that in the system. What is the correct date of birth?`,
      fields: [
        { key: 'dob', label: 'Correct Date of Birth', type: 'date' }
      ],
      ageDisplay: true,
      options: [
        { 
          label: '✅ Updated', 
          next: 'health_gender', 
          color: 'emerald',
          setData: { dobVerified: true, dobDataSource: 'manual' }
        }
      ]
    },

    // DOB Objection Handling
    'health_dob_objection': {
      id: 'health_dob_objection',
      phase: 3,
      title: 'DOB Objection - Rebuttal',
      script: `I completely understand your concern. The only reason I ask is that these state-regulated plans are strictly based on age. Without your specific date of birth, I can't see the actual rates, and I don't want to quote you a price that ends up being wrong. I just need the basic date to see what you qualify for.`,
      tip: 'Address concern directly, explain the WHY',
      fields: [
        { key: 'dob', label: 'Date of Birth', type: 'date' }
      ],
      ageDisplay: true,
      options: [
        { 
          label: '✅ User Provides DOB', 
          next: 'health_gender', 
          color: 'emerald',
          setData: { dobVerified: true, dobDataSource: 'manual' }
        },
        { 
          label: '❌ Still Refuses', 
          next: 'soft_close', 
          color: 'red' 
        }
      ]
    },

    'health_gender': {
      id: 'health_gender',
      phase: 3,
      title: 'Gender',
      script: `And for the insurance records, are you **male** or **female**?`,
      fields: [
        { key: 'gender', label: 'Gender', type: 'select', options: ['Female', 'Male'] }
      ],
      options: [
        { label: '✅ Continue', next: 'health_tobacco', color: 'emerald' }
      ]
    },

    'health_tobacco': {
      id: 'health_tobacco',
      phase: 3,
      title: 'Tobacco Use',
      script: `Now, regarding tobacco or nicotine. Do you smoke cigarettes, use a pipe, chew tobacco, or use e-cigarettes?`,
      options: [
        { label: '🚭 No / Quit 12+ months ago', next: 'tobacco_no', color: 'emerald', setData: { tobacco: false } },
        { label: '🚬 Yes, current user', next: 'tobacco_yes', color: 'amber', setData: { tobacco: true } }
      ]
    },

    'tobacco_no': {
      id: 'tobacco_no',
      phase: 3,
      title: 'Non-Smoker',
      script: `**Nonsmoker.** That is excellent. That's going to save you a lot of money right off the bat.`,
      tip: 'Mirroring technique: +13.83 pts lift',
      options: [
        { label: '✅ Continue', next: 'health_major', color: 'emerald' }
      ]
    },

    'tobacco_yes': {
      id: 'tobacco_yes',
      phase: 3,
      title: 'Smoker',
      script: `Okay, I'll note that. It does affect the rate, but I have several carriers that work with tobacco users. We'll find you the best option.`,
      options: [
        { label: '✅ Continue', next: 'health_major', color: 'emerald' }
      ]
    },

    'health_major': {
      id: 'health_major',
      phase: 3,
      title: 'Major Conditions',
      script: `In the past 2 years, have you been diagnosed with or treated for any **heart attack, stroke, congestive heart failure, cancer, kidney failure, dialysis, or dementia**?`,
      tip: 'Combined questions: +14.9 pts lift',
      options: [
        { label: '✅ No to all', next: 'health_meds', color: 'emerald' },
        { label: '⚠️ Yes to one or more', next: 'health_major_yes', color: 'amber', setData: { healthAnswers: { knockout: true } } }
      ]
    },

    'health_major_yes': {
      id: 'health_major_yes',
      phase: 3,
      title: 'Health Consideration',
      script: `Thank you for being honest with me. Because of that condition, you may qualify for a **Graded Benefit** plan. This means full coverage kicks in after 24 months, but you're protected from day one for accidental death. Let me continue to see exactly what you qualify for.`,
      options: [
        { label: '✅ Continue', next: 'health_meds', color: 'emerald' }
      ]
    },

    'health_meds': {
      id: 'health_meds',
      phase: 3,
      title: 'Medications',
      script: `What medications are you currently taking? Common ones would be for blood pressure, cholesterol, or diabetes.`,
      tip: 'Empathy: "My own father takes that" +5.61 pts',
      fields: [
        { key: 'medications', label: 'Medications', type: 'text', placeholder: 'List medications' }
      ],
      options: [
        { label: '✅ No diabetes', next: 'health_hospital', color: 'emerald' },
        { label: '💊 Diabetes - pills only', next: 'diabetes_pills', color: 'blue' },
        { label: '💉 Diabetes - insulin', next: 'diabetes_insulin', color: 'amber', setData: { healthAnswers: { insulinDiabetes: true } } }
      ]
    },

    'diabetes_pills': {
      id: 'diabetes_pills',
      phase: 3,
      title: 'Diabetes Pills',
      script: `Just pills? Perfect. **Pills-only diabetes gets the best rates.** That helps a lot.`,
      options: [
        { label: '✅ Continue', next: 'health_hospital', color: 'emerald' }
      ]
    },

    'diabetes_insulin': {
      id: 'diabetes_insulin',
      phase: 3,
      title: 'Diabetes Insulin',
      script: `Okay, insulin use does affect the plan type. Don't worry—I have carriers that work with insulin-dependent diabetes.`,
      options: [
        { label: '✅ Continue', next: 'health_hospital', color: 'emerald' }
      ]
    },

    'health_hospital': {
      id: 'health_hospital',
      phase: 3,
      title: 'Hospitalizations',
      script: `In the last 2 years, have you been hospitalized overnight for any reason—other than routine surgery like a knee or hip replacement?`,
      options: [
        { label: '✅ No hospitalizations', next: 'health_height_weight', color: 'emerald' },
        { label: '🩹 Minor surgery only', next: 'hospital_minor', color: 'blue' },
        { label: '⚠️ Major hospitalization', next: 'hospital_major', color: 'amber' }
      ]
    },

    'hospital_minor': {
      id: 'hospital_minor',
      phase: 3,
      title: 'Minor Surgery',
      script: `I bet that was a tough recovery. But other than that, no overnight stays for heart or lungs? Excellent.`,
      options: [
        { label: '✅ Continue', next: 'health_height_weight', color: 'emerald' }
      ]
    },

    'hospital_major': {
      id: 'hospital_major',
      phase: 3,
      title: 'Major Hospitalization',
      script: `Thank you for sharing that. Can you tell me briefly what it was for so I can find the right carrier?`,
      fields: [
        { key: 'hospitalizationReason', label: 'Reason', type: 'text', placeholder: 'Brief description' }
      ],
      options: [
        { label: '✅ Continue', next: 'health_height_weight', color: 'emerald' }
      ]
    },

    'health_height_weight': {
      id: 'health_height_weight',
      phase: 3,
      title: 'Height & Weight',
      script: `And roughly, what is your **height** and **weight**?`,
      tip: 'Social proof: "Same as last person" +7.04 pts',
      fields: [
        { key: 'heightFeet', label: 'Feet', type: 'select', options: ['4', '5', '6', '7'], inline: true },
        { key: 'heightInches', label: 'Inches', type: 'select', options: ['0','1','2','3','4','5','6','7','8','9','10','11'], inline: true },
        { key: 'weight', label: 'Weight (lbs)', type: 'number', placeholder: '180' }
      ],
      options: [
        { label: '✅ Continue', next: 'beneficiary', color: 'emerald' }
      ]
    },

    'beneficiary': {
      id: 'beneficiary',
      phase: 3,
      title: 'Beneficiary',
      script: `Now, this is an important question. When something happens to you, **who are we doing this for?** Who is going to be your beneficiary?`,
      tip: 'Tie-down: "That would be nice, wouldn\'t it?" +15.44 pts',
      fields: [
        { key: 'beneficiaryName', label: 'Beneficiary Name', type: 'text', placeholder: 'Full name' },
        { key: 'beneficiaryRelation', label: 'Relationship', type: 'select', options: ['Spouse', 'Son', 'Daughter', 'Child', 'Sibling', 'Parent', 'Other'] }
      ],
      options: [
        { label: '✅ Continue', next: 'existing_coverage', color: 'emerald' }
      ]
    },

    'existing_coverage': {
      id: 'existing_coverage',
      phase: 3,
      title: 'Existing Coverage',
      script: `That would be nice for **{beneficiary}**, wouldn't it? To not have to worry about the bill. Do you currently have any life insurance in place?`,
      options: [
        { label: '❌ No coverage', next: 'no_coverage_urgency', color: 'emerald' },
        { label: '✅ Has coverage', next: 'has_coverage', color: 'blue' },
        { label: '❓ Sent in a card / Maybe', next: 'unit_plan', color: 'amber' }
      ]
    },

    'no_coverage_urgency': {
      id: 'no_coverage_urgency',
      phase: 3,
      title: 'Create Urgency',
      script: `Okay. So right now, if something happened, **{beneficiary}** would have to pay for everything out of pocket? That is exactly why we are on the phone today. **We are going to fix that.**`,
      tip: 'Urgency: +4.0 pts lift',
      options: [
        { label: '✅ Continue', next: 'budget_ss', color: 'emerald' }
      ]
    },

    'has_coverage': {
      id: 'has_coverage',
      phase: 3,
      title: 'Existing Coverage Details',
      script: `That's great you were proactive. How much coverage do you have? With funeral costs averaging $8,000-$15,000 these days, many clients add a supplemental policy for the extras—flowers, obituary, time off work for family.`,
      options: [
        { label: '✅ Interested in supplement', next: 'budget_ss', color: 'emerald' },
        { label: '❌ Satisfied with current', next: 'soft_close', color: 'red' }
      ]
    },

    'unit_plan': {
      id: 'unit_plan',
      phase: 3,
      title: 'Unit Plan Education',
      script: `Did you ever speak to an agent or give them a payment? That's typically a "unit" plan—$9.95 often only buys a few hundred dollars of coverage with a 2-year waiting period. What we're looking at today is **first-day coverage**. You're fully protected from day one.`,
      options: [
        { label: '✅ Continue', next: 'budget_ss', color: 'emerald' }
      ]
    },

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 4: BUDGET DISCOVERY
    // ═══════════════════════════════════════════════════════════════════════
    'budget_ss': {
      id: 'budget_ss',
      phase: 4,
      title: 'Social Security',
      script: `Most of my clients, including myself, like everything to be based around their Social Security. Are you currently receiving Social Security?`,
      tip: 'Social proof: +7.04 pts',
      options: [
        { label: '✅ Yes', next: 'budget_ss_day', color: 'emerald' },
        { label: '❌ No / Other income', next: 'budget_income', color: 'blue' }
      ]
    },

    'budget_ss_day': {
      id: 'budget_ss_day',
      phase: 4,
      title: 'SS Payment Day',
      script: `And does that usually come on the **1st**, the **3rd**, or one of the **Wednesdays**?`,
      fields: [
        { key: 'ssPaymentDay', label: 'SS Payment Day', type: 'select', options: ['1st of month', '3rd of month', '2nd Wednesday', '3rd Wednesday', '4th Wednesday'] }
      ],
      options: [
        { label: '✅ Continue', next: 'budget_anchor', color: 'emerald' }
      ]
    },

    'budget_income': {
      id: 'budget_income',
      phase: 4,
      title: 'Other Income',
      script: `What day of the month works best for you for payments?`,
      fields: [
        { key: 'ssPaymentDay', label: 'Preferred Day', type: 'select', options: ['1st', '5th', '10th', '15th', '20th', '25th'] }
      ],
      options: [
        { label: '✅ Continue', next: 'budget_anchor', color: 'emerald' }
      ]
    },

    'budget_anchor': {
      id: 'budget_anchor',
      phase: 4,
      title: 'Budget Anchor',
      script: `I know that every penny counts when you're on a fixed income. I assume you're looking for something that is affordable and isn't going to break the bank, right? My goal is to find you something that fits comfortably into your budget. We aren't looking to make you "insurance poor"—we just want to make sure **{beneficiary}** is okay.`,
      tip: 'Anchoring: +11.25 pts lift',
      options: [
        { label: '✅ Continue', next: 'quote_calc', color: 'emerald' }
      ]
    },

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 5: QUOTE & PRESENTATION
    // ═══════════════════════════════════════════════════════════════════════
    'quote_calc': {
      id: 'quote_calc',
      phase: 5,
      title: 'Calculate Quote',
      script: `Okay, I have everything I need to run the numbers. Give me just one moment while the computer calculates the best rates for you...`,
      tip: '🔥 SILENCE: +29.1 pts lift. Let it work.',
      showQuote: true,
      options: [
        { label: '✅ Present Quote', next: 'presentation', color: 'emerald' }
      ]
    },

    'presentation': {
      id: 'presentation',
      phase: 5,
      title: 'Great News',
      script: `Okay, **{firstName}**, I have some great news. Based on the health information you gave me, you qualify for the **preferred tier** with a top-rated carrier. This is the best rating class available.`,
      options: [
        { label: '✅ Continue', next: 'benefits', color: 'emerald' }
      ]
    },

    'benefits': {
      id: 'benefits',
      phase: 5,
      title: 'Present Benefits',
      script: `Let me explain how this plan works:

**First**, this is **Whole Life** insurance. The price I give you today is locked in forever. It will never go up.

**Second**, the coverage amount never goes down.

**Third**, this pays out within **24 to 48 hours**. That means **{beneficiary}** will have the money immediately to pay the funeral home.

Does that sound like the kind of **peace of mind** you're looking for?`,
      tip: '"Peace of mind" phrase: +15.59 pts',
      options: [
        { label: '✅ Yes, sounds good', next: 'present_options', color: 'emerald' },
        { label: '❓ Has questions', next: 'answer_questions', color: 'blue' }
      ]
    },

    'answer_questions': {
      id: 'answer_questions',
      phase: 5,
      title: 'Answer Questions',
      script: `Great question. This is whole life—it builds cash value over time, and the death benefit is guaranteed. Unlike term insurance, you never lose your coverage as long as you pay the premium. It's designed specifically for final expenses.`,
      options: [
        { label: '✅ Continue', next: 'present_options', color: 'emerald' }
      ]
    },

    'present_options': {
      id: 'present_options',
      phase: 5,
      title: 'Present 3 Options',
      script: `The average burial is between **$8,000** and **$15,000**. I'm going to give you three options—just tell me which feels most comfortable:

**Option 1: $15,000** — Full funeral, headstone, extra for {beneficiary} — **{p15k}/month**

**Option 2: $10,000** — Most popular. Complete service and burial — **{p10k}/month**

**Option 3: $5,000** — Basics, cremation and small service — **{p5k}/month**`,
      tip: 'Multiple options: +9.39 pts. WAIT IN SILENCE after presenting.',
      options: [
        { label: '✅ Picks an option', next: 'trial_close', color: 'emerald' },
        { label: '💰 Too expensive', next: 'price_objection', color: 'amber' },
        { label: '🤔 Need to think', next: 'think_objection', color: 'blue' },
        { label: '👨‍👩‍👧 Talk to family', next: 'family_objection', color: 'purple' },
        { label: '🔒 Trust concern', next: 'trust_objection', color: 'red' },
        { label: '⏰ Bad timing', next: 'timing_objection', color: 'orange' }
      ]
    },

    // ═══════════════════════════════════════════════════════════════════════
    // OBJECTION HANDLING
    // ═══════════════════════════════════════════════════════════════════════
    'price_objection': {
      id: 'price_objection',
      phase: 6,
      title: 'Handle Price',
      script: `I understand. You're on a fixed income and have to be careful. Honestly, having **some** coverage is better than **no** coverage. If {beneficiary} has to come up with $10,000, that's a burden. But if we can cover even half, it helps.

**$5,000** is **{p5k}/month**. Or to get your foot in the door, **$3,000** is about **{p3k}/month**.`,
      tip: 'Price objection: 39.8% occurrence, 98.9% resolution. Drop face amount.',
      options: [
        { label: '✅ Accepts lower amount', next: 'trial_close', color: 'emerald' },
        { label: '🤔 Still hesitant', next: 'think_objection', color: 'amber' }
      ]
    },

    'think_objection': {
      id: 'think_objection',
      phase: 7,
      title: 'Handle "Need to Think"',
      script: `I understand. But honestly, what is there to think about? Maybe I can help.

Here's the thing—quotes don't mean anything until the company reviews your medical background. Right now, we don't even know if you're approved.

The next step is just to submit an application to see if you get approved. If you do, you have a **30-day risk-free look period**. If you get the policy and decide you don't want it, you get 100% of your money back.`,
      tip: '"30-day free look + underwriting" frame',
      options: [
        { label: '✅ "Okay, let\'s see if I qualify"', next: 'urgency_close', color: 'emerald' },
        { label: '👨‍👩‍👧 "Should talk to family first"', next: 'family_objection', color: 'purple' },
        { label: '❌ Still wants to wait', next: 'soft_close', color: 'red' }
      ]
    },

    'urgency_close': {
      id: 'urgency_close',
      phase: 7,
      title: 'Urgency Close',
      script: `100%. You're the boss. But within 48 hours, if I don't submit that application, **this rate goes away**. And as you age, it just continues to increase. Better to be safe than sorry, right?`,
      tip: 'Urgency: +4.0 pts lift',
      options: [
        { label: '✅ Continue to application', next: 'app_address', color: 'emerald' }
      ]
    },

    'family_objection': {
      id: 'family_objection',
      phase: 8,
      title: 'Handle Family Objection',
      script: `I think that's a great idea—you should definitely tell {beneficiary}. But let me ask you this: if you ask "{beneficiary}, do you want me to buy life insurance so you don't have to pay for my funeral?" what do you think they'll say?

They'll probably say "don't worry about it." They love you. But when the time comes, they **will** worry.

Let's just see if we can get you approved. You can show the policy to {beneficiary} when it arrives. If they hate that you protected them financially, you can cancel it.`,
      tip: 'Family objection: CRITICAL severity. Use non-binding approval frame.',
      options: [
        { label: '✅ "That makes sense"', next: 'app_address', color: 'emerald' },
        { label: '❌ Still wants to wait', next: 'soft_close', color: 'red' }
      ]
    },

    'trust_objection': {
      id: 'trust_objection',
      phase: 9,
      title: 'Handle Trust Concern',
      script: `I am SO glad you said that. You're absolutely right to be careful—there are a lot of bad actors out there.

I'm a licensed agent in **{state}**. Let me give you my information right now. Do you have a pen?

My National Producer Number is **[NPN]**. My {state} license number is **[LICENSE #]**. You can look me up on the {state} Department of Insurance website. I'm also going to text you a picture of my license right now so you can see my face.

Your information goes directly to the insurance carrier through a secure, encrypted portal. I don't store your information.`,
      tip: 'Provide license # + text picture = resolution',
      options: [
        { label: '✅ "Okay, you seem legitimate"', next: 'app_address', color: 'emerald' },
        { label: '❌ Still suspicious', next: 'soft_close', color: 'red' }
      ]
    },

    'timing_objection': {
      id: 'timing_objection',
      phase: 11,
      title: 'Handle Bad Timing',
      script: `Please don't worry about that. **I couldn't take a payment from you today even if you wanted.** You get to pick when you start making payments.

We can set the policy to start on your next Social Security deposit day. **Nothing comes out of your account until you have your money in hand.** We're just doing the paperwork today to get you approved.`,
      tip: 'Deferred draft: resolves 100% of timing concerns',
      options: [
        { label: '✅ "If nothing comes out today, that\'s fine"', next: 'app_address', color: 'emerald' },
        { label: '❌ Still can\'t proceed', next: 'soft_close', color: 'red' }
      ]
    },

    // ═══════════════════════════════════════════════════════════════════════
    // TRIAL CLOSE
    // ═══════════════════════════════════════════════════════════════════════
    'trial_close': {
      id: 'trial_close',
      phase: 5,
      title: 'Trial Close',
      script: `Is that something you would be comfortable with?`,
      tip: 'Trial close: +16.89 pts lift. Wait for explicit "YES".',
      fields: [
        { key: 'selectedCoverage', label: 'Selected Coverage', type: 'select', options: ['3000', '5000', '10000', '15000', '20000', '25000'] }
      ],
      options: [
        { label: '✅ Yes / "I can do that"', next: 'app_address', color: 'emerald' },
        { label: '😐 Hesitant', next: 'think_objection', color: 'amber' }
      ]
    },

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 13: APPLICATION DATA
    // ═══════════════════════════════════════════════════════════════════════
    'app_address': {
      id: 'app_address',
      phase: 13,
      title: 'Collect Address',
      script: `Let me start this application for you. I have your name as **{firstName} {lastName}**. What is your **street address**?`,
      tip: 'Assumptive transition: +30.56 pts',
      fields: [
        { key: 'address', label: 'Street Address', type: 'text', placeholder: '123 Main Street', fullWidth: true },
        { key: 'apt', label: 'Apt/Unit', type: 'text', placeholder: 'Optional' },
        { key: 'zip', label: 'Zip Code', type: 'text', placeholder: '12345' }
      ],
      options: [
        { label: '✅ Continue', next: 'app_ssn', color: 'emerald' }
      ]
    },

    'app_ssn': {
      id: 'app_ssn',
      phase: 13,
      title: 'Social Security Number',
      script: `This part is for the background check to verify your identity. I need your **Social Security number**. As I type it, it turns into X's on my screen—I can't see it once I enter it.`,
      fields: [
        { key: 'ssn', label: 'SSN', type: 'password', placeholder: '***-**-****', sensitive: true }
      ],
      options: [
        { label: '✅ Provided SSN', next: 'app_birth', color: 'emerald' },
        { label: '🔒 Hesitant', next: 'ssn_reassurance', color: 'amber' }
      ]
    },

    'ssn_reassurance': {
      id: 'ssn_reassurance',
      phase: 13,
      title: 'SSN Reassurance',
      script: `I completely understand the hesitation. Your Social Security number is **only used for identity verification** with the insurance carrier—it's required by law to prevent fraud. The number goes directly into the carrier's encrypted system. I don't have access to it after I enter it.`,
      options: [
        { label: '✅ Continue', next: 'app_birth', color: 'emerald' }
      ]
    },

    'app_birth': {
      id: 'app_birth',
      phase: 13,
      title: 'Birth State & Citizenship',
      script: `Thank you. That was the scary part—we're past it now. What **state were you born in**? And are you a **U.S. citizen**?`,
      fields: [
        { key: 'birthState', label: 'Birth State', type: 'text', placeholder: 'State' },
        { key: 'citizenship', label: 'US Citizen', type: 'select', options: ['Yes', 'No'] }
      ],
      options: [
        { label: '✅ Continue', next: 'app_beneficiary', color: 'emerald' }
      ]
    },

    'app_beneficiary': {
      id: 'app_beneficiary',
      phase: 13,
      title: 'Beneficiary Details',
      script: `For the beneficiary, we have **{beneficiary}**. What is their **last name**? And do you have their phone number?`,
      fields: [
        { key: 'beneficiaryLastName', label: 'Beneficiary Last Name', type: 'text', placeholder: 'Last name' },
        { key: 'beneficiaryPhone', label: 'Beneficiary Phone', type: 'tel', placeholder: 'Optional' }
      ],
      options: [
        { label: '✅ Continue', next: 'app_contact', color: 'emerald' }
      ]
    },

    'app_contact': {
      id: 'app_contact',
      phase: 13,
      title: 'Contact Info',
      script: `Is the number we're talking on a **cell phone**? And do you have an **email address**?`,
      fields: [
        { key: 'phoneType', label: 'Phone Type', type: 'select', options: ['Cell', 'Home', 'Work'] },
        { key: 'email', label: 'Email', type: 'email', placeholder: 'email@example.com' }
      ],
      options: [
        { label: '✅ Continue', next: 'banking_intro', color: 'emerald' }
      ]
    },

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 14: BANKING
    // ═══════════════════════════════════════════════════════════════════════
    'banking_intro': {
      id: 'banking_intro',
      phase: 14,
      title: 'Banking',
      script: `We're almost done. You're doing great.

We'll set the payment to come out on **{ssDay}** to match your income.

Would you be paying through **automatic bank draft**, like most people?`,
      tip: '🔥 SMOOTH TRANSITION: +37.31 pts. NORMALIZED ASK: +37.73 pts.',
      options: [
        { label: '🏦 Yes, bank draft', next: 'banking_collect', color: 'emerald' },
        { label: '💳 Card instead', next: 'banking_card', color: 'blue' },
        { label: '❌ "Don\'t give that out"', next: 'banking_objection', color: 'amber' }
      ]
    },

    'banking_objection': {
      id: 'banking_objection',
      phase: 14,
      title: 'Banking Objection',
      script: `I understand completely. We don't actually take the payment today. The insurance company just requires the routing and account number to verify you have an active account. It's just like setting up Netflix or a utility bill. **Nothing comes out until {ssDay}**.`,
      options: [
        { label: '✅ Okay', next: 'banking_collect', color: 'emerald' },
        { label: '💳 Use card instead', next: 'banking_card', color: 'blue' }
      ]
    },

    'banking_collect': {
      id: 'banking_collect',
      phase: 14,
      title: 'Collect Bank Info',
      script: `Who do you bank with? On the bottom left corner of your check, there's a **9-digit routing number**. Right next to it is your **account number**.`,
      fields: [
        { key: 'bankName', label: 'Bank Name', type: 'text', placeholder: 'Bank name' },
        { key: 'routingNumber', label: 'Routing Number', type: 'text', placeholder: '9 digits' },
        { key: 'accountNumber', label: 'Account Number', type: 'text', placeholder: 'Account number' },
        { key: 'accountType', label: 'Account Type', type: 'select', options: ['Checking', 'Savings'] }
      ],
      options: [
        { label: '✅ Continue', next: 'summary_close', color: 'emerald' }
      ]
    },

    'banking_card': {
      id: 'banking_card',
      phase: 14,
      title: 'Collect Card Info',
      script: `No problem. I'll need the **16-digit card number**, **expiration date**, and the **3-digit CVV** on the back.`,
      fields: [
        { key: 'cardType', label: 'Card Type', type: 'select', options: ['Visa', 'Mastercard', 'Discover', 'Amex'] },
        { key: 'cardNumber', label: 'Card Number', type: 'text', placeholder: '16 digits', sensitive: true },
        { key: 'cardExp', label: 'Expiration', type: 'text', placeholder: 'MM/YY' },
        { key: 'cardCvv', label: 'CVV', type: 'text', placeholder: '3 digits', sensitive: true }
      ],
      options: [
        { label: '✅ Continue', next: 'summary_close', color: 'emerald' }
      ]
    },

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 15: SUMMARY & CLOSE
    // ═══════════════════════════════════════════════════════════════════════
    'summary_close': {
      id: 'summary_close',
      phase: 15,
      title: 'Summary Close',
      script: `Let me recap:

We're submitting an application to **{carrier}** for **{coverage}** of Whole Life coverage.

Your monthly premium is **{premium}**.

Your beneficiary is **{beneficiary}**.

Your first payment date is **{ssDay}**.

**Does that all sound correct?**`,
      tip: '🔥🔥🔥 SUMMARY CLOSE = +43.77 pts lift. #1 TECHNIQUE. NEVER SKIP.',
      options: [
        { label: '✅ "Yes, that\'s right"', next: 'authorization', color: 'emerald' },
        { label: '⚠️ Needs correction', next: 'summary_close', color: 'amber' }
      ]
    },

    'authorization': {
      id: 'authorization',
      phase: 15,
      title: 'Authorization',
      script: `**{firstName}**, do you authorize that we submit this application to the carrier for the face amount of **{coverage}**?`,
      tip: 'Wait for EXPLICIT "Yes": +25.29 pts lift',
      options: [
        { label: '✅ "Yes, I do"', next: 'voice_sig', color: 'emerald' },
        { label: '⚠️ Hesitates', next: 'authorization', color: 'amber' }
      ]
    },

    'voice_sig': {
      id: 'voice_sig',
      phase: 15,
      title: 'Voice Signature',
      script: `Perfect. I need to do a quick voice signature. Please state your **full name** and say **"I agree."**`,
      fields: [
        { key: 'voiceSignature', label: 'Voice Signature Completed', type: 'checkbox' }
      ],
      options: [
        { label: '✅ Completed', next: 'congrats', color: 'emerald' }
      ]
    },

    'congrats': {
      id: 'congrats',
      phase: 15,
      title: '🎉 Congratulations!',
      script: `**Congratulations, {firstName}!** You've taken a huge step today. You've done a wonderful thing for **{beneficiary}**. They are going to be so relieved.

You'll receive your policy in the mail in **7-10 business days**. I'm texting you my direct number—if you have ANY questions, call me directly.

Take care!`,
      isComplete: true,
      options: []
    },

    'soft_close': {
      id: 'soft_close',
      phase: 15,
      title: 'Schedule Callback',
      script: `I understand. When would be a good time to call you back—tomorrow afternoon, or would an evening work better?

The rate I quoted is based on your current age and health. If anything changes, the rate will go up.`,
      fields: [
        { key: 'callbackDate', label: 'Callback Date', type: 'date' },
        { key: 'callbackTime', label: 'Callback Time', type: 'select', options: ['Morning', 'Afternoon', 'Evening'] }
      ],
      options: [
        { label: '✅ Scheduled', next: 'end_callback', color: 'emerald' }
      ]
    },

    'end_callback': {
      id: 'end_callback',
      phase: 15,
      title: 'Callback Scheduled',
      script: `I've got you scheduled. I'll talk to you soon. Take care!`,
      isComplete: true,
      options: []
    },

    'end_polite': {
      id: 'end_polite',
      phase: 1,
      title: 'Polite End',
      script: `I completely understand. Thank you for your time today. If you ever have questions about final expense coverage, please don't hesitate to reach out. Have a wonderful day!`,
      isComplete: true,
      options: []
    }
  }), [formData, activeQuote, premiums]);

  // Get current node
  const node = NODES[nodeId];

  // ─────────────────────────────────────────────────────────────────────────
  // NAVIGATION
  // ─────────────────────────────────────────────────────────────────────────
  const goTo = useCallback((nextId, options = {}) => {
    if (!nextId || !NODES[nextId]) return;
    if (options.setData) {
      updateMultiple(options.setData);
    }
    setHistory(prev => [...prev, nextId]);
    setNodeId(nextId);
    setShowTip(false);
  }, [NODES, updateMultiple]);

  const goBack = useCallback(() => {
    if (history.length <= 1) return;
    const newHist = [...history];
    newHist.pop();
    setHistory(newHist);
    setNodeId(newHist[newHist.length - 1]);
  }, [history]);

  const resetScript = useCallback(() => {
    setNodeId('opening');
    setHistory(['opening']);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // COPY SCRIPT
  // ─────────────────────────────────────────────────────────────────────────
  const copyScript = useCallback(() => {
    if (!node?.script) return;
    const text = replaceVars(node.script).replace(/\*\*/g, '').replace(/\n\n/g, '\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [node, replaceVars]);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER INPUT FIELD
  // ─────────────────────────────────────────────────────────────────────────
  const renderField = (field) => {
    const value = formData[field.key] || '';
    const baseClass = "bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none";
    
    if (field.type === 'select') {
      return (
        <div key={field.key} className={field.inline ? 'flex-1' : ''}>
          <label className="text-gray-400 text-xs mb-1 block">{field.label}</label>
          <select
            value={value}
            onChange={(e) => updateField(field.key, e.target.value)}
            className={`${baseClass} w-full`}
          >
            <option value="">Select...</option>
            {field.options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      );
    }
    
    if (field.type === 'checkbox') {
      return (
        <label key={field.key} className="flex items-center gap-2 text-white">
          <input
            type="checkbox"
            checked={value === true}
            onChange={(e) => updateField(field.key, e.target.checked)}
            className="w-5 h-5 rounded bg-gray-800 border-gray-600 text-cyan-500 focus:ring-cyan-500"
          />
          {field.label}
        </label>
      );
    }
    
    return (
      <div key={field.key} className={field.fullWidth ? 'col-span-2' : (field.inline ? 'flex-1' : '')}>
        <label className="text-gray-400 text-xs mb-1 block">{field.label}</label>
        <input
          type={field.type || 'text'}
          value={value}
          onChange={(e) => updateField(field.key, e.target.value)}
          placeholder={field.placeholder || ''}
          className={`${baseClass} w-full ${field.sensitive ? 'font-mono tracking-widest' : ''}`}
        />
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER QUOTE PANEL OVERLAY
  // ─────────────────────────────────────────────────────────────────────────
  const renderQuotePanel = () => {
    if (!showQuotePanel) return null;
    
    // Separate quotes by eligibility
    const eligibleQuotes = quotes.filter(q => q.isEligible && q.premium);
    const ineligibleQuotes = quotes.filter(q => !q.isEligible && q.premium);
    const isLoading = !ratesLoaded;
    
    return (
      <div className="absolute inset-0 z-50 flex flex-col overflow-hidden" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
      }}>
        
        {/* Header with Glass Effect */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10" style={{
          background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
          backdropFilter: 'blur(10px)'
        }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Quote Calculator</h2>
              <p className="text-gray-400 text-xs">
                {isLoading ? 'Loading rates...' : `${eligibleQuotes.length} carriers available`}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowQuotePanel(false)} 
            className="p-2 hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-white/20"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Coverage Selection - Compact Horizontal */}
          <div className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5">
            <span className="text-gray-400 text-sm whitespace-nowrap">Coverage:</span>
            <div className="flex flex-wrap gap-1.5 flex-1">
              {COVERAGE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => updateField('selectedCoverage', opt.value)}
                  className={`px-3 py-1 rounded-full font-medium text-xs transition-all ${
                    formData.selectedCoverage === opt.value
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg'
                      : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
              eligibility.status === 'standard' 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : eligibility.status === 'modified' 
                  ? 'bg-amber-500/20 text-amber-400' 
                  : 'bg-red-500/20 text-red-400'
            }`}>
              {eligibility.plan}
            </div>
          </div>


          {/* Loading State */}
          {isLoading && (
            <div className="py-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 mb-4">
                <div className="animate-spin w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full"></div>
              </div>
              <p className="text-gray-400">Loading rates from Google Sheets...</p>
              <p className="text-gray-500 text-sm mt-1">This may take a few seconds</p>
            </div>
          )}

          {/* No Quotes Available */}
          {!isLoading && eligibleQuotes.length === 0 && (
            <div className="py-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/20 mb-4">
                <X className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-gray-200 font-medium">No quotes available</p>
              <p className="text-gray-500 text-sm mt-1">Try different criteria or age range</p>
            </div>
          )}

          {/* Carrier Quote Cards with Logos */}
          {!isLoading && eligibleQuotes.length > 0 && (
            <div className="space-y-3">
              <p className="text-gray-400 text-sm font-medium px-1">Available Carriers ({eligibleQuotes.length})</p>
              {eligibleQuotes.map((quote, idx) => (
                <button
                  key={`${quote.carrier}-${quote.planType}`}
                  onClick={() => {
                    updateMultiple({
                      selectedCarrier: quote.carrier,
                      selectedPremium: quote.premium,
                      selectedPlanType: quote.planType
                    });
                    setShowQuotePanel(false);
                  }}
                  className={`w-full p-4 rounded-2xl transition-all duration-200 flex items-center gap-4 group ${
                    activeQuote?.carrier === quote.carrier && activeQuote?.planType === quote.planType
                      ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-2 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Carrier Logo */}
                  <div className={`w-14 h-14 rounded-xl bg-white flex items-center justify-center flex-shrink-0 overflow-hidden ${
                    idx === 0 ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-slate-900' : ''
                  }`}>
                    {CARRIER_LOGOS[quote.carrier] ? (
                      <img 
                        src={CARRIER_LOGOS[quote.carrier]} 
                        alt={quote.carrier}
                        className="w-12 h-12 object-contain"
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling?.classList.remove('hidden'); }}
                      />
                    ) : null}
                    <span className={`text-gray-600 font-bold text-xs text-center ${CARRIER_LOGOS[quote.carrier] ? 'hidden' : ''}`}>
                      {quote.carrier.substring(0, 3)}
                    </span>
                  </div>

                  {/* Carrier Info */}
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2">
                      {idx === 0 && (
                        <span className="px-2 py-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs font-bold rounded-full shadow-lg">
                          BEST RATE
                        </span>
                      )}
                    </div>
                    <p className="text-white font-bold text-lg truncate">{quote.carrier}</p>
                    <p className="text-gray-400 text-sm">{quote.planType} Plan</p>
                  </div>

                  {/* Premium */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                      ${quote.premium?.toFixed(2)}
                    </p>
                    <p className="text-gray-500 text-xs">per month</p>
                  </div>

                  {/* Selection Indicator */}
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    activeQuote?.carrier === quote.carrier && activeQuote?.planType === quote.planType
                      ? 'border-emerald-500 bg-emerald-500'
                      : 'border-gray-600 group-hover:border-gray-400'
                  }`}>
                    {activeQuote?.carrier === quote.carrier && activeQuote?.planType === quote.planType && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Ineligible Carriers (Collapsed Section) */}
          {!isLoading && ineligibleQuotes.length > 0 && (
            <div className="mt-6">
              <p className="text-gray-500 text-sm font-medium px-1 mb-2">Not Available Based on Health Answers ({ineligibleQuotes.length})</p>
              <div className="space-y-2 opacity-50">
                {ineligibleQuotes.slice(0, 3).map((quote) => (
                  <div
                    key={`${quote.carrier}-${quote.planType}`}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {CARRIER_LOGOS[quote.carrier] ? (
                        <img 
                          src={CARRIER_LOGOS[quote.carrier]} 
                          alt={quote.carrier}
                          className="w-8 h-8 object-contain grayscale"
                        />
                      ) : (
                        <span className="text-gray-500 font-bold text-xs">{quote.carrier.substring(0, 3)}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-400 font-medium text-sm">{quote.carrier}</p>
                      <p className="text-gray-600 text-xs">{quote.planType}</p>
                    </div>
                    <span className="text-gray-500 text-sm">${quote.premium?.toFixed(2)}/mo</span>
                  </div>
                ))}
                {ineligibleQuotes.length > 3 && (
                  <p className="text-gray-600 text-xs text-center">+{ineligibleQuotes.length - 3} more carriers</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer with Selected Quote Summary */}
        {activeQuote && (
          <div className="border-t border-white/10 p-4" style={{
            background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.1) 0%, rgba(0,0,0,0.3) 100%)'
          }}>
            <button
              onClick={() => setShowQuotePanel(false)}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-lg shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Use {activeQuote.carrier} @ ${activeQuote.premium?.toFixed(2)}/mo
            </button>
          </div>
        )}
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // MAIN RENDER
  // ─────────────────────────────────────────────────────────────────────────
  if (!node) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900 rounded-xl">
        <p className="text-red-400">Node "{nodeId}" not found</p>
        <button onClick={resetScript} className="ml-4 px-4 py-2 bg-gray-800 text-white rounded-lg">Reset</button>
      </div>
    );
  }

  const progressPercent = (node.phase / 15) * 100;
  const getOptionColor = (color) => {
    const colors = {
      emerald: 'border-emerald-500/50 bg-emerald-900/20 hover:bg-emerald-800/30',
      amber: 'border-amber-500/50 bg-amber-900/20 hover:bg-amber-800/30',
      blue: 'border-blue-500/50 bg-blue-900/20 hover:bg-blue-800/30',
      red: 'border-red-500/50 bg-red-900/20 hover:bg-red-800/30',
      purple: 'border-purple-500/50 bg-purple-900/20 hover:bg-purple-800/30',
      orange: 'border-orange-500/50 bg-orange-900/20 hover:bg-orange-800/30'
    };
    return colors[color] || 'border-gray-600 bg-gray-800/50 hover:bg-gray-700/50';
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 rounded-xl overflow-hidden relative border border-gray-800">
      
      {/* HEADER */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={goBack}
            disabled={history.length <= 1}
            className="p-1.5 hover:bg-gray-700 rounded-lg disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={18} className="text-white" />
          </button>
          <div>
            <h2 className="text-white font-bold text-sm">{node.title}</h2>
            <p className="text-gray-500 text-xs">Phase {node.phase}/15 • Step {history.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {node.tip && (
            <button
              onClick={() => setShowTip(!showTip)}
              className={`p-1.5 rounded-lg transition-colors ${showTip ? 'bg-amber-600/30 text-amber-400' : 'text-gray-400 hover:bg-gray-700'}`}
              title="Show conversion tip"
            >
              <Info size={16} />
            </button>
          )}
          <button onClick={copyScript} className="p-1.5 hover:bg-gray-700 rounded-lg text-gray-400 transition-colors" title="Copy script">
            {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
          </button>
          <button
            onClick={() => setShowQuotePanel(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 rounded-lg text-sm text-white font-medium transition-all shadow-lg shadow-emerald-500/20"
          >
            <DollarSign size={14} />
            {!ratesLoaded ? (
              <span className="animate-pulse">Loading...</span>
            ) : activeQuote ? (
              <span>${activeQuote.premium?.toFixed(2)}/mo</span>
            ) : (
              <span>Get Quote</span>
            )}
          </button>
          <button onClick={resetScript} className="p-1.5 hover:bg-gray-700 rounded-lg text-gray-400 transition-colors" title="Reset">
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="h-1 bg-gray-800 flex-shrink-0">
        <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
      </div>

      {/* TIP (Collapsible) */}
      {showTip && node.tip && (
        <div className="px-3 py-2 bg-amber-900/30 border-b border-amber-500/30 flex-shrink-0">
          <p className="text-amber-200 text-xs">💡 {node.tip}</p>
        </div>
      )}

      {/* CONTENT */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        
        {/* DATA SOURCE INDICATOR - Shows for location and DOB screens */}
        {(node.dynamicLocation || node.dynamicDOB) && (
          <div className="mb-3 flex items-center gap-2 flex-wrap">
            {node.dynamicLocation && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-full ${
                formData.locationDataSource === 'webhook' 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : formData.locationDataSource === 'areaCode'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
              }`}>
                <MapPin size={12} />
                {formData.locationDataSource === 'webhook' && 'Location from Webhook Data'}
                {formData.locationDataSource === 'areaCode' && 'State from Area Code'}
                {formData.locationDataSource === 'manual' && 'Manual Entry Required'}
              </span>
            )}
            {node.dynamicDOB && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-full ${
                formData.dobDataSource === 'webhook' && formData.dob
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
              }`}>
                <Calendar size={12} />
                {formData.dobDataSource === 'webhook' && formData.dob ? 'DOB from Webhook Data' : 'DOB Required'}
              </span>
            )}
          </div>
        )}

        {/* SCRIPT TEXT */}
        <div 
          className="text-white text-[15px] leading-relaxed mb-4"
          dangerouslySetInnerHTML={{
            __html: replaceVars(node.script)
              .replace(/\*\*(.*?)\*\*/g, '<strong class="text-cyan-400 font-bold">$1</strong>')
              .replace(/\n\n/g, '<br/><br/>')
              .replace(/\n/g, '<br/>')
          }}
        />

        {/* LOCATION VERIFICATION CARD */}
        {node.dynamicLocation && (
          <div className="mt-4 p-4 rounded-xl border border-white/10 bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-bold">Current Location</p>
                <p className="text-gray-400 text-sm">
                  {formData.locationDataSource === 'webhook' 
                    ? `${formData.city}, ${formData.state}` 
                    : formData.state || 'Not available'}
                </p>
              </div>
            </div>
            {formData.locationDataSource === 'areaCode' && (
              <p className="text-amber-400/80 text-xs flex items-center gap-1">
                <AlertCircle size={12} />
                City not available - State derived from phone area code
              </p>
            )}
          </div>
        )}

        {/* DOB VERIFICATION CARD - Only when DOB is pre-filled */}
        {node.dynamicDOB && formData.dob && formData.dobDataSource === 'webhook' && (
          <div className="mt-4 p-4 rounded-xl border border-white/10 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-bold">Date of Birth on File</p>
                <p className="text-gray-400 text-sm">
                  {new Date(formData.dob).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
              {formData.age && (
                <div className="ml-auto text-right">
                  <p className="text-2xl font-bold text-purple-400">{formData.age}</p>
                  <p className="text-gray-500 text-xs">years old</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* DOB OBJECTION REBUTTAL HIGHLIGHT */}
        {node.id === 'health_dob_objection' && (
          <div className="mt-4 p-4 rounded-xl border-2 border-amber-500/50 bg-amber-900/20">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-amber-300 font-bold text-sm mb-1">Objection Handling Script</p>
                <p className="text-amber-200/80 text-sm">
                  Use this rebuttal if the user hesitates or refuses to provide their date of birth.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* DYNAMIC RAPPORT */}
        {node.rapportScript && formData.city && (
          <div className="mt-3 p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
            <p className="text-purple-200 text-sm italic"
              dangerouslySetInnerHTML={{
                __html: replaceVars(node.rapportScript)
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="text-purple-300">$1</strong>')
              }}
            />
          </div>
        )}

        {/* AGE DISPLAY */}
        {node.ageDisplay && formData.age && (
          <div className="mt-3 p-3 bg-cyan-900/20 border border-cyan-500/30 rounded-lg">
            <p className="text-cyan-200 text-sm">
              That makes you <strong className="text-cyan-400">{formData.age} years young</strong>.
            </p>
          </div>
        )}

        {/* QUOTE DISPLAY (embedded) with Coverage Selection */}
        {node.showQuote && (
          <div className="mt-4 rounded-2xl border border-white/10 overflow-hidden" style={{
            background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 78, 59, 0.15) 100%)'
          }}>
            {/* Coverage Quick Select */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-300 font-medium text-sm">Coverage Amount</span>
                <span className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  ${formData.selectedCoverage.toLocaleString()}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {COVERAGE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => updateField('selectedCoverage', opt.value)}
                    className={`px-3 py-1.5 rounded-full font-medium text-xs transition-all ${
                      formData.selectedCoverage === opt.value
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/30'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quote Result */}
            <div className="p-4">
              {!ratesLoaded ? (
                /* Loading State */
                <div className="flex items-center gap-4 py-2">
                  <div className="w-14 h-14 rounded-xl bg-gray-700/50 flex items-center justify-center flex-shrink-0 animate-pulse">
                    <Calculator className="w-6 h-6 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <div className="h-5 w-32 bg-gray-700/50 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-24 bg-gray-700/30 rounded animate-pulse"></div>
                  </div>
                  <div className="text-right">
                    <div className="h-7 w-24 bg-gray-700/50 rounded animate-pulse"></div>
                  </div>
                </div>
              ) : activeQuote ? (
                /* Loaded Quote with Logo */
                <div className="flex items-center gap-4">
                  {/* Carrier Logo */}
                  <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center flex-shrink-0 overflow-hidden ring-2 ring-emerald-500 ring-offset-2 ring-offset-transparent">
                    {CARRIER_LOGOS[activeQuote.carrier] ? (
                      <img 
                        src={CARRIER_LOGOS[activeQuote.carrier]} 
                        alt={activeQuote.carrier}
                        className="w-12 h-12 object-contain"
                      />
                    ) : (
                      <span className="text-gray-600 font-bold text-sm">{activeQuote.carrier?.substring(0, 3)}</span>
                    )}
                  </div>
                  
                  {/* Quote Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs font-bold rounded-full">
                        BEST RATE
                      </span>
                    </div>
                    <p className="text-white font-bold">{activeQuote.carrier}</p>
                    <p className="text-gray-400 text-sm">{activeQuote.planType} Plan</p>
                  </div>
                  
                  {/* Premium */}
                  <div className="text-right">
                    <p className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                      ${activeQuote.premium?.toFixed(2)}
                    </p>
                    <p className="text-gray-500 text-xs">per month</p>
                  </div>
                </div>
              ) : (
                /* No Quotes Available */
                <div className="text-center py-4">
                  <p className="text-amber-400 font-medium">No quotes available</p>
                  <p className="text-gray-500 text-xs">Try adjusting coverage or criteria</p>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="px-4 pb-4">
              <button
                onClick={() => setShowQuotePanel(true)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <Calculator className="w-4 h-4" />
                Compare All Carriers ({quotes.filter(q => q.isEligible && q.premium).length} available)
              </button>
            </div>
          </div>
        )}

        {/* DATA COLLECTION FIELDS */}
        {node.fields && node.fields.length > 0 && (
          <div className="mt-4 p-3 bg-gray-800/50 border border-gray-700 rounded-xl">
            <div className={`grid gap-3 ${node.fields.some(f => f.inline) ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {node.fields.map(field => renderField(field))}
            </div>
          </div>
        )}

        {/* DECISION OPTIONS */}
        {node.options && node.options.length > 0 && (
          <div className="mt-4 space-y-2">
            {node.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => goTo(opt.next, { setData: opt.setData })}
                className={`w-full p-3 rounded-xl border-2 text-left transition-all hover:scale-[1.01] ${getOptionColor(opt.color)}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white text-sm">{opt.label}</span>
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* COMPLETION */}
        {node.isComplete && (
          <div className="mt-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <p className="text-emerald-400 font-bold text-lg">
              {node.id === 'congrats' ? 'Sale Complete! 🎉' : 'Call Ended'}
            </p>
            <button
              onClick={resetScript}
              className="mt-4 px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2 mx-auto"
            >
              <RotateCcw size={16} /> Start New Call
            </button>
          </div>
        )}
      </div>

      {/* QUOTE PANEL OVERLAY */}
      {renderQuotePanel()}
    </div>
  );
};

export default IntegratedScriptPanel;
