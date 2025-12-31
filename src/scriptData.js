// scriptData_new.js - STATE MACHINE BUILT FROM "THE GOLDEN PATH" SCRIPT
// Source: new_script.md - Reverse-Engineered from 624 Successful Final Expense Sales
// Average Call Duration: 35 minutes 58 seconds
// Script Adherence Success Rate: 93.4%

// ═══════════════════════════════════════════════════════════════════
// CONVERSION DATA FROM THE GOLDEN PATH ANALYSIS
// ═══════════════════════════════════════════════════════════════════
export const CONVERSION_DATA = {
  baseline: 93.4,
  totalSales: 624,
  averageCallDuration: "35:58",
  totalScriptSections: 12,
  commonDenominatorSequenceCount: 14,

  // Timestamp Averages from Analysis
  timestampAverages: {
    qualificationEnded: "5:57",
    healthQuestionsStarted: "4:40",
    presentationStarted: "7:33",
    pricingPresented: "9:08",
    closeAttempted: "10:46",
    ssnCollected: "15:30",
    bankingCollected: "18:51",
  },

  // Duration Proof
  durationProof: {
    shortest: "15:11",
    longest: "116:22",
    average: "35:58",
  },
};

// ═══════════════════════════════════════════════════════════════════
// NODE TYPES
// ═══════════════════════════════════════════════════════════════════
export const NODE_TYPES = {
  STATEMENT: "statement",
  QUESTION: "question",
  VERIFICATION: "verification_question",
  DATA_COLLECTION: "data_collection",
  DECISION: "decision",
  OBJECTION_HANDLER: "objection_handler",
  TRANSITION: "transition",
  QUOTE: "quote",
  CLOSE: "close",
  CONDITIONAL: "conditional",
};

// ═══════════════════════════════════════════════════════════════════
// SCRIPT NODES - FROM THE GOLDEN PATH SCRIPT (new_script.md)
// ═══════════════════════════════════════════════════════════════════
export const SCRIPT_NODES = {
  // ═══════════════════════════════════════════════════════════════
  // PHASE 1: THE TRUST ANCHOR (Greeting) (0:00 - 0:45)
  // ═══════════════════════════════════════════════════════════════
  greeting_start: {
    id: "greeting_start",
    type: NODE_TYPES.VERIFICATION,
    phase: 1,
    title: "👋 The Trust Anchor",
    timestamp: "0:00 - 0:45",
    conversionTip: {
      text: "+7.1% lift (dove_straight_in), +0.9% (authority_title)",
      source: "opening_approach.dove_straight_in",
    },
    script: `Hello, this is {agent_name}, the licensed field underwriter for the state of {state}.

Just to make sure I've got the right file in front of me... I am speaking with {first_name} {last_name}, correct?`,
    options: [
      { label: "✅ Yes", nextNode: "verify_state" },
      { label: "❌ No / Need to correct", nextNode: "correct_info" },
    ],
  },

  verify_state: {
    id: "verify_state",
    type: NODE_TYPES.VERIFICATION,
    phase: 1,
    title: "📍 Verify State",
    conversionTip: {
      text: "+4.1% lift (full_name)",
      source: "Full Name Verification",
    },
    script: `Okay, great. And you're in the state of {state}, right?`,
    options: [
      { label: "✅ Yes", nextNode: "verify_age" },
      { label: "❌ No / Different state", nextNode: "correct_state" },
    ],
  },

  correct_info: {
    id: "correct_info",
    type: NODE_TYPES.DATA_COLLECTION,
    phase: 1,
    title: "✏️ Correct Information",
    script: `My apologies, let me update my file. What is the correct spelling of your name?`,
    captureVariable: "first_name",
    nextNode: "verify_state",
  },

  correct_state: {
    id: "correct_state",
    type: NODE_TYPES.DATA_COLLECTION,
    phase: 1,
    title: "📍 Correct State",
    script: `Oh, I'm sorry. Which state are you in?`,
    captureVariable: "state",
    nextNode: "verify_age",
  },

  verify_age: {
    id: "verify_age",
    type: NODE_TYPES.VERIFICATION,
    phase: 1,
    title: "🎂 Verify Age",
    conversionTip: {
      text: "+4.3% lift (controlled_conversation)",
      source: "Controlled Conversation Technique",
    },
    script: `And I have your date of birth listed as {dob}, making you {age} years young, correct?`,
    options: [
      { label: "✅ Yes", nextNode: "purpose_statement" },
      { label: "❌ No / Need to correct", nextNode: "correct_age" },
    ],
  },

  correct_age: {
    id: "correct_age",
    type: NODE_TYPES.DATA_COLLECTION,
    phase: 1,
    title: "✏️ Correct Age",
    script: `Let me correct that. What is your actual date of birth?`,
    captureVariable: "dob",
    nextNode: "purpose_statement",
  },

  purpose_statement: {
    id: "purpose_statement",
    type: NODE_TYPES.STATEMENT,
    phase: 1,
    title: "🎯 Purpose Statement",
    conversionTip: {
      text: "+11.7% lift (tie_downs), +1.02% (authority_title)",
      source: "Tie-Down Questions",
    },
    script: `Perfect. My job today is simple: as a state-regulated broker, I'm required to verify your information and see if you qualify for the state-approved final expense programs. Fair enough?`,
    options: [
      { label: "✅ Fair enough", nextNode: "transition_to_discovery" },
      { label: "❓ What is this?", nextNode: "explain_program" },
    ],
  },

  explain_program: {
    id: "explain_program",
    type: NODE_TYPES.OBJECTION_HANDLER,
    phase: 1,
    title: "📋 Explain Program",
    script: `This is regarding the final expense benefits designed to cover burial and cremation costs so your family isn't left with a bill. I just need to ask a few questions to see what you qualify for.`,
    nextNode: "transition_to_discovery",
  },

  // ═══════════════════════════════════════════════════════════════
  // PHASE 2: THE EMOTIONAL EXCAVATION (Discovery) (0:45 - 4:40)
  // ═══════════════════════════════════════════════════════════════
  transition_to_discovery: {
    id: "transition_to_discovery",
    type: NODE_TYPES.QUESTION,
    phase: 2,
    title: "💜 Beneficiary Discovery",
    timestamp: "0:45 - 4:40",
    conversionTip: {
      text: "+12.7% lift (beneficiary_discussed)",
      source: "needs_analysis.beneficiary_discussed",
    },
    script: `Now {first_name}, before we look at the numbers, I need to understand who we are protecting today. If something were to happen to you yesterday, who would be the person responsible for handling your arrangements?`,
    options: [
      { label: "👨‍👩‍👧 Child", nextNode: "beneficiary_child" },
      { label: "💑 Spouse", nextNode: "beneficiary_spouse" },
      { label: "👥 Sibling", nextNode: "beneficiary_sibling" },
      { label: "❌ Nobody", nextNode: "beneficiary_nobody" },
    ],
  },

  beneficiary_child: {
    id: "beneficiary_child",
    type: NODE_TYPES.DATA_COLLECTION,
    phase: 2,
    title: "👶 Child Beneficiary",
    script: `Okay, and what is your {beneficiary_relationship}'s name?`,
    captureVariable: "beneficiary",
    nextNode: "beneficiary_location",
  },

  beneficiary_spouse: {
    id: "beneficiary_spouse",
    type: NODE_TYPES.DATA_COLLECTION,
    phase: 2,
    title: "💑 Spouse Beneficiary",
    script: `Okay, and what is your spouse's name?`,
    captureVariable: "beneficiary",
    nextNode: "beneficiary_location",
  },

  beneficiary_sibling: {
    id: "beneficiary_sibling",
    type: NODE_TYPES.DATA_COLLECTION,
    phase: 2,
    title: "👥 Sibling Beneficiary",
    script: `Okay, and what is your sibling's name?`,
    captureVariable: "beneficiary",
    nextNode: "beneficiary_location",
  },

  beneficiary_location: {
    id: "beneficiary_location",
    type: NODE_TYPES.QUESTION,
    phase: 2,
    title: "📍 Beneficiary Location",
    conversionTip: {
      text: "+5.9% lift (showed_genuine_interest)",
      source: "Rapport Building",
    },
    script: `Does {beneficiary} live close by to you in {state}, or are they in a different state?`,
    options: [
      { label: "🏠 Close by", nextNode: "beneficiary_awareness" },
      { label: "✈️ Far away", nextNode: "beneficiary_awareness" },
    ],
  },

  beneficiary_awareness: {
    id: "beneficiary_awareness",
    type: NODE_TYPES.QUESTION,
    phase: 2,
    title: "🤔 Beneficiary Awareness",
    script: `Does {beneficiary} know that you are looking into this, or is this going to be a surprise for them?`,
    options: [
      { label: "✅ They know", nextNode: "financial_reality" },
      { label: "🎁 Surprise", nextNode: "financial_reality" },
    ],
  },

  financial_reality: {
    id: "financial_reality",
    type: NODE_TYPES.QUESTION,
    phase: 2,
    title: "💰 Financial Reality Check",
    conversionTip: {
      text: "+5.9% lift (mentioned_family_burden)",
      source: "Pain Point Identification",
    },
    script: `God forbid, if you passed away today, would {beneficiary} have the $10,000 to $15,000 cash on hand to pay for the funeral immediately?`,
    options: [
      { label: "❌ No", nextNode: "pain_implication" },
      { label: "✅ Yes", nextNode: "why_insurance" },
    ],
  },

  pain_implication: {
    id: "pain_implication",
    type: NODE_TYPES.QUESTION,
    phase: 2,
    title: "⚡ Pain Implication",
    conversionTip: {
      text: "+6.3% lift (fears_identified)",
      source: "needs_analysis.motivation_extracted",
    },
    script: `I see. So if they don't have that money sitting in the bank, how would they pay for it? Would they have to borrow it, or use credit cards?`,
    options: [
      { label: "💳 Borrow/Credit", nextNode: "validate_concern" },
      { label: "🙏 GoFundMe", nextNode: "validate_concern" },
    ],
  },

  why_insurance: {
    id: "why_insurance",
    type: NODE_TYPES.QUESTION,
    phase: 2,
    title: "❓ Why Insurance",
    script: `That's a blessing that they have funds, but let me ask you—did you want them to use their own savings for this, or was your goal to leave them something extra?`,
    options: [
      { label: "🛡️ Protect savings", nextNode: "validate_concern" },
      { label: "💝 Leave extra", nextNode: "validate_concern" },
    ],
  },

  validate_concern: {
    id: "validate_concern",
    type: NODE_TYPES.STATEMENT,
    phase: 2,
    title: "✅ Validate Concern",
    conversionTip: {
      text: "+12.9% lift (validated_prospect_concerns)",
      source: "Validation Technique",
    },
    script: `I understand completely. That is exactly why we are on the phone. We want to make sure {beneficiary} never has to worry about that bill. Does that make sense?`,
    nextNode: "motivation_check",
  },

  motivation_check: {
    id: "motivation_check",
    type: NODE_TYPES.QUESTION,
    phase: 2,
    title: "🎯 Motivation Check",
    conversionTip: {
      text: "+6.3% lift (motivation_extracted)",
      source: "needs_analysis.motivation_extracted",
    },
    script: `What got you thinking about this specifically today? Did you have a recent health scare, or a death in the family?`,
    options: [
      { label: "🏥 Health scare", nextNode: "empathy_pivot" },
      { label: "⚰️ Death in family", nextNode: "empathy_pivot" },
      { label: "📆 Just getting older", nextNode: "empathy_pivot" },
      { label: "📺 TV ad", nextNode: "empathy_pivot" },
    ],
  },

  empathy_pivot: {
    id: "empathy_pivot",
    type: NODE_TYPES.STATEMENT,
    phase: 2,
    title: "🤝 Empathy Pivot",
    conversionTip: {
      text: "+92.9% persuasion_score correlation",
      source: "Empathy Technique",
    },
    script: `I appreciate you sharing that with me. It sounds like getting this taken care of is a priority for you so {beneficiary} is protected, right?`,
    nextNode: "transition_to_health",
  },

  beneficiary_nobody: {
    id: "beneficiary_nobody",
    type: NODE_TYPES.QUESTION,
    phase: 2,
    title: "⚰️ No Beneficiary",
    script: `If there is no one currently, the state would typically handle those arrangements, which can be impersonal. Is your goal to have a dignified service handled by a professional?`,
    options: [{ label: "✅ Yes", nextNode: "transition_to_health" }],
  },

  transition_to_health: {
    id: "transition_to_health",
    type: NODE_TYPES.TRANSITION,
    phase: 2,
    title: "🏥 Transition to Health",
    conversionTip: {
      text: "+1.02% (authority_title)",
      source: "Authority Positioning",
    },
    script: `Okay {first_name}, based on what you've told me, I can definitely help. To find you the best rate, I just need to ask a few medical questions. I'll be your eyes and ears and shop all the top carriers for you. Fair enough?`,
    nextNode: "tobacco_check",
  },

  // ═══════════════════════════════════════════════════════════════
  // PHASE 3: THE ELIGIBILITY PIVOT (Health) (4:40 - 7:30)
  // ═══════════════════════════════════════════════════════════════
  tobacco_check: {
    id: "tobacco_check",
    type: NODE_TYPES.QUESTION,
    phase: 3,
    title: "🚬 Tobacco Check",
    timestamp: "4:40 - 7:30",
    script: `First, have you used any form of tobacco or nicotine in the last 12 months, like cigarettes, cigars, or a vape?`,
    options: [
      { label: "✅ No", nextNode: "height_weight" },
      { label: "🚬 Yes", nextNode: "tobacco_details" },
    ],
  },

  tobacco_details: {
    id: "tobacco_details",
    type: NODE_TYPES.DATA_COLLECTION,
    phase: 3,
    title: "🚬 Tobacco Details",
    script: `Okay, is that cigarettes or something else?`,
    captureVariable: "tobacco_type",
    nextNode: "height_weight",
  },

  height_weight: {
    id: "height_weight",
    type: NODE_TYPES.DATA_COLLECTION,
    phase: 3,
    title: "📏 Height & Weight",
    script: `And roughly, how tall are you and how much do you weigh?`,
    captureVariable: "height_weight",
    nextNode: "heart_loop",
  },

  heart_loop: {
    id: "heart_loop",
    type: NODE_TYPES.QUESTION,
    phase: 3,
    title: "❤️ Heart Conditions",
    conversionTip: {
      text: "+10.0% lift (combined_questions)",
      source: "qualification_approach.combined_questions",
    },
    script: `I'm going to ask about the heart. In the past 2 years, have you had a heart attack, stroke, or congestive heart failure?`,
    options: [
      { label: "✅ No", nextNode: "respiratory_loop" },
      { label: "⚠️ Yes", nextNode: "heart_drill_down" },
    ],
  },

  heart_drill_down: {
    id: "heart_drill_down",
    type: NODE_TYPES.DATA_COLLECTION,
    phase: 3,
    title: "❤️ Heart Details",
    script: `I see. Which one was it, and when exactly did that happen?`,
    captureVariable: "heart_condition_date",
    nextNode: "respiratory_loop",
  },

  respiratory_loop: {
    id: "respiratory_loop",
    type: NODE_TYPES.QUESTION,
    phase: 3,
    title: "🫁 Respiratory Check",
    script: `Moving to the lungs—have you ever been diagnosed with COPD, emphysema, or do you use oxygen equipment to assist with breathing?`,
    options: [
      { label: "✅ No", nextNode: "diabetes_loop" },
      { label: "⚠️ Yes", nextNode: "respiratory_drill_down" },
    ],
  },

  respiratory_drill_down: {
    id: "respiratory_drill_down",
    type: NODE_TYPES.DATA_COLLECTION,
    phase: 3,
    title: "🫁 Respiratory Details",
    script: `Okay, do you use a nebulizer or just inhalers?`,
    captureVariable: "respiratory_details",
    nextNode: "diabetes_loop",
  },

  diabetes_loop: {
    id: "diabetes_loop",
    type: NODE_TYPES.QUESTION,
    phase: 3,
    title: "🩸 Diabetes Check",
    script: `Do you have diabetes or high blood sugar?`,
    options: [
      { label: "✅ No", nextNode: "major_illness_loop" },
      { label: "💊 Yes", nextNode: "diabetes_drill_down" },
    ],
  },

  diabetes_drill_down: {
    id: "diabetes_drill_down",
    type: NODE_TYPES.QUESTION,
    phase: 3,
    title: "💊 Diabetes Details",
    script: `Do you take pills for that, or do you use insulin?`,
    options: [
      { label: "💊 Pills", nextNode: "neuropathy_check" },
      { label: "💉 Insulin", nextNode: "insulin_details" },
    ],
  },

  insulin_details: {
    id: "insulin_details",
    type: NODE_TYPES.DATA_COLLECTION,
    phase: 3,
    title: "💉 Insulin Details",
    script: `How old were you when you started the insulin, and how many units a day do you take?`,
    captureVariable: "insulin_start_age",
    nextNode: "neuropathy_check",
  },

  neuropathy_check: {
    id: "neuropathy_check",
    type: NODE_TYPES.QUESTION,
    phase: 3,
    title: "🦶 Neuropathy Check",
    script: `Have you ever been told you have neuropathy or nerve pain related to the diabetes?`,
    nextNode: "major_illness_loop",
  },

  major_illness_loop: {
    id: "major_illness_loop",
    type: NODE_TYPES.QUESTION,
    phase: 3,
    title: "🎗️ Cancer/Major Illness",
    script: `In the last 2 years, have you been treated for any internal cancer or tumors?`,
    options: [
      { label: "✅ No", nextNode: "hospital_loop" },
      { label: "⚠️ Yes", nextNode: "cancer_drill_down" },
    ],
  },

  cancer_drill_down: {
    id: "cancer_drill_down",
    type: NODE_TYPES.DATA_COLLECTION,
    phase: 3,
    title: "🎗️ Cancer Details",
    script: `Was that cancer free more than 2 years ago, or are you still taking medication for it?`,
    captureVariable: "cancer_status",
    nextNode: "hospital_loop",
  },

  hospital_loop: {
    id: "hospital_loop",
    type: NODE_TYPES.QUESTION,
    phase: 3,
    title: "🏥 Hospitalization",
    script: `And finally, do you have any surgeries pending, or have you been hospitalized overnight in the last 12 months?`,
    options: [
      { label: "✅ No", nextNode: "medication_list" },
      { label: "⚠️ Yes", nextNode: "hospital_drill_down" },
    ],
  },

  hospital_drill_down: {
    id: "hospital_drill_down",
    type: NODE_TYPES.DATA_COLLECTION,
    phase: 3,
    title: "🏥 Hospital Details",
    script: `What was the hospitalization for?`,
    captureVariable: "hospital_reason",
    nextNode: "medication_list",
  },

  medication_list: {
    id: "medication_list",
    type: NODE_TYPES.DATA_COLLECTION,
    phase: 3,
    title: "💊 Medication List",
    conversionTip: {
      text: "+4.3% lift (controlled_conversation)",
      source: "Control Technique",
    },
    script: `To make sure I find you the carrier with the absolute best rate, I need to check exactly how they cover your specific medications. Could you grab your bottles so we can read them off together? Take your time, I'll be right here.`,
    captureVariable: "medications_list",
    // Dynamic nextNode - will be handled by component based on whether meds entered
    nextNode: "medication_check",
  },

  // New: Check if medications were entered
  medication_check: {
    id: "medication_check",
    type: NODE_TYPES.CONDITIONAL,
    phase: 3,
    title: "🔍 Medication Check",
    // This is handled dynamically in the component
    checkVariable: "medications_list",
    ifEmpty: "no_medications_confirm",
    ifNotEmpty: "medication_confirmation",
  },

  // New: Confirmation screen if NO medications entered
  no_medications_confirm: {
    id: "no_medications_confirm",
    type: NODE_TYPES.QUESTION,
    phase: 3,
    title: "❓ No Medications?",
    script: `Okay, so no blood thinners, diabetes medication or anything like that?`,
    options: [
      { label: "✅ No, nothing", nextNode: "transition_to_presentation", color: "emerald" },
      { label: "💊 Yes, actually...", nextNode: "medication_list", color: "amber" },
    ],
  },

  medication_confirmation: {
    id: "medication_confirmation",
    type: NODE_TYPES.VERIFICATION,
    phase: 3,
    title: "✅ Medication Confirmation",
    script: `Okay, I have {medications_list}. Is there anything else, like a blood thinner or memory medication?`,
    options: [
      { label: "✅ No, that's it", nextNode: "transition_to_presentation" },
      { label: "➕ Yes, one more", nextNode: "add_medication" },
    ],
  },

  add_medication: {
    id: "add_medication",
    type: NODE_TYPES.DATA_COLLECTION,
    phase: 3,
    title: "➕ Add Medication",
    script: `Got it. What is the name of that one?`,
    nextNode: "transition_to_presentation",
  },

  transition_to_presentation: {
    id: "transition_to_presentation",
    type: NODE_TYPES.TRANSITION,
    phase: 3,
    title: "⏭️ Transition to Presentation",
    script: `Excellent. Based on that, I'm seeing some great options for you. Give me one moment to pull up the state-approved rates.`,
    nextNode: "inflation_story",
  },

  // ═══════════════════════════════════════════════════════════════
  // PHASE 4: THE VALUE BRIDGE (Education) (7:30 - 9:00)
  // ═══════════════════════════════════════════════════════════════
  inflation_story: {
    id: "inflation_story",
    type: NODE_TYPES.STATEMENT,
    phase: 4,
    title: "📈 Inflation Story",
    timestamp: "7:30 - 9:00",
    conversionTip: {
      text: "+7.5% lift (used_stories)",
      source: "presentation_approach.benefits_over_features",
    },
    script: `While that loads, {first_name}, let me explain why this program is so popular. You know how the price of everything—gas, bread, milk—keeps going up, right?`,
    nextNode: "funeral_cost_reality",
  },

  funeral_cost_reality: {
    id: "funeral_cost_reality",
    type: NODE_TYPES.STATEMENT,
    phase: 4,
    title: "⚰️ Funeral Cost Reality",
    conversionTip: {
      text: "+11.7% lift (tie_downs)",
      source: "Tie-Down Questions",
    },
    script: `Exactly. Funerals are the same. A funeral that costs $10,000 today might cost $15,000 in a few years. The benefit of this state-regulated program is that it locks in your rate forever. It never goes up, even as you get older. Does that sound like the kind of stability you're looking for?`,
    nextNode: "waiting_period_warning",
  },

  waiting_period_warning: {
    id: "waiting_period_warning",
    type: NODE_TYPES.STATEMENT,
    phase: 4,
    title: "⚡ First Day Coverage",
    conversionTip: {
      text: "+12.1% lift (used_comparison)",
      source: "Comparison Technique",
    },
    script: `Also, because you are in good health, I can qualify you for 'First Day Coverage'. That means if you pay the first premium and pass away next week, {beneficiary} gets the full check tax-free. You don't have to wait 2 years like those TV plans. That's huge, right?`,
    nextNode: "pricing_anchor",
  },

  pricing_anchor: {
    id: "pricing_anchor",
    type: NODE_TYPES.QUESTION,
    phase: 4,
    title: "⚓ Budget Anchor",
    conversionTip: {
      text: "+13.4% lift (used_anchoring)",
      source: "presentation_approach.used_anchoring",
    },
    script: `Now, most of my clients in {state} with a fixed income like to keep their budget between $50 and $80 a month to get the maximum coverage. Does that range sound comfortable for you, or were you thinking higher?`,
    options: [
      { label: "✅ Comfortable", nextNode: "coverage_selection" },
      { label: "⬇️ Lower", nextNode: "adjust_anchor" },
      { label: "⬆️ Higher", nextNode: "adjust_anchor_up" },
    ],
  },

  adjust_anchor: {
    id: "adjust_anchor",
    type: NODE_TYPES.STATEMENT,
    phase: 4,
    title: "⬇️ Adjust Lower",
    script: `Understood. We can definitely look at something lower. The most important thing is that it's comfortable for you.`,
    nextNode: "coverage_selection",
  },

  adjust_anchor_up: {
    id: "adjust_anchor_up",
    type: NODE_TYPES.STATEMENT,
    phase: 4,
    title: "⬆️ Adjust Higher",
    script: `Okay, we can look at higher amounts. I just want to make sure we don't 'take food off the table' to pay for this.`,
    nextNode: "coverage_selection",
  },

  coverage_selection: {
    id: "coverage_selection",
    type: NODE_TYPES.DATA_COLLECTION,
    phase: 4,
    title: "💵 Coverage Amount",
    conversionTip: {
      text: "Enter the target coverage - quotes will show this amount, +$5K above, and -$5K below",
      source: "Three Option Strategy",
    },
    script: `Based on what you told me about your budget, let me pull up the best rates. What coverage amount would work best for {beneficiary}?`,
    captureVariable: "target_coverage",
    showCoverageSelector: true,
    nextNode: "present_options",
  },

  present_options: {
    id: "present_options",
    type: NODE_TYPES.QUOTE,
    phase: 4,
    title: "📋 Present Three Options",
    conversionTip: {
      text: "+10.3% lift (offered_multiple_options) - Always present highest to lowest",
      source: "Multiple Options Strategy",
    },
    script: `Okay {first_name}, I have three options approved for you. Grab a pen and paper, let me know when you're ready to write these down.`,
    showQuoteCalculator: true,
    showThreeOptions: true,
    nextNode: "quote_high",
  },

  // ═══════════════════════════════════════════════════════════════
  // PHASE 5: THE OPTION SELECTION (Pricing) (9:00 - 10:45)
  // ═══════════════════════════════════════════════════════════════
  quote_high: {
    id: "quote_high",
    type: NODE_TYPES.QUOTE,
    phase: 5,
    title: "💰 Option 1 - Maximum",
    timestamp: "9:00 - 10:45",
    conversionTip: {
      text: "+10.3% lift (offered_multiple_options)",
      source: "Multiple Options Strategy",
    },
    script: `Option 1 is the Maximum Protection. This provides {coverage_amount_high} for {beneficiary}, and that runs {monthly_premium_high} per month.`,
    showQuoteCalculator: true,
    nextNode: "quote_mid",
  },

  quote_mid: {
    id: "quote_mid",
    type: NODE_TYPES.QUOTE,
    phase: 5,
    title: "💰 Option 2 - Standard",
    script: `Option 2 is the Standard Protection. This gives {coverage_amount_mid} of coverage, and that is {monthly_premium_mid} per month.`,
    nextNode: "quote_low",
  },

  quote_low: {
    id: "quote_low",
    type: NODE_TYPES.QUOTE,
    phase: 5,
    title: "💰 Option 3 - Basic",
    script: `Option 3 is the Basic Protection. This provides {coverage_amount_low}, and that is only {monthly_premium_low} per month.`,
    nextNode: "trial_close_selection",
  },

  // ═══════════════════════════════════════════════════════════════
  // PHASE 6: THE COMMITMENT SEAL (Close) (10:45 - 12:00)
  // ═══════════════════════════════════════════════════════════════
  trial_close_selection: {
    id: "trial_close_selection",
    type: NODE_TYPES.QUESTION,
    phase: 6,
    title: "🎯 Trial Close",
    timestamp: "10:45 - 12:00",
    conversionTip: {
      text: "+20.3% lift (alternative_choice)",
      source: "close_approach.alternative_choice",
    },
    script: `Looking at those three, {first_name}, which one fits your budget best so we can get this to {beneficiary}?`,
    options: [
      { label: "💎 High", nextNode: "assumptive_transition" },
      { label: "⭐ Mid", nextNode: "assumptive_transition" },
      { label: "✅ Low", nextNode: "assumptive_transition" },
      { label: "💰 Too expensive", nextNode: "objection_price_handler" },
      { label: "🤔 Think about it", nextNode: "objection_think_handler" },
    ],
  },

  assumptive_transition: {
    id: "assumptive_transition",
    type: NODE_TYPES.STATEMENT,
    phase: 6,
    title: "✅ Assumptive Close",
    conversionTip: {
      text: "+30.3% lift (assumptive_close)",
      source: "close_approach.assumptive_close",
    },
    script: `Excellent choice. That's the one I would have picked for you as well. Let me just verify the spelling of your last name to get that started. Is it {last_name_spelled}?`,
    options: [
      { label: "✅ Yes", nextNode: "verify_address_delivery" },
      { label: "✏️ Correction needed", nextNode: "correct_name" },
    ],
  },

  correct_name: {
    id: "correct_name",
    type: NODE_TYPES.DATA_COLLECTION,
    phase: 6,
    title: "✏️ Correct Name",
    script: `Got it. And your middle initial?`,
    nextNode: "verify_address_delivery",
  },

  verify_address_delivery: {
    id: "verify_address_delivery",
    type: NODE_TYPES.VERIFICATION,
    phase: 6,
    title: "📬 Verify Address",
    script: `And for the policy delivery, is {address} the best place to mail the hard copy?`,
    options: [
      { label: "✅ Yes", nextNode: "beneficiary_finalization" },
      { label: "✏️ No, different address", nextNode: "update_address" },
    ],
  },

  update_address: {
    id: "update_address",
    type: NODE_TYPES.DATA_COLLECTION,
    phase: 6,
    title: "✏️ Update Address",
    script: `What is the correct mailing address?`,
    captureVariable: "address",
    nextNode: "beneficiary_finalization",
  },

  beneficiary_finalization: {
    id: "beneficiary_finalization",
    type: NODE_TYPES.VERIFICATION,
    phase: 6,
    title: "💜 Finalize Beneficiary",
    script: `Perfect. And for {beneficiary}, do you want them listed as the 100% primary beneficiary?`,
    options: [
      { label: "✅ Yes", nextNode: "beneficiary_backup" },
      { label: "✏️ No, adjust", nextNode: "adjust_beneficiary" },
    ],
  },

  adjust_beneficiary: {
    id: "adjust_beneficiary",
    type: NODE_TYPES.DATA_COLLECTION,
    phase: 6,
    title: "✏️ Adjust Beneficiary",
    script: `How would you like to split the beneficiaries?`,
    nextNode: "beneficiary_backup",
  },

  beneficiary_backup: {
    id: "beneficiary_backup",
    type: NODE_TYPES.QUESTION,
    phase: 6,
    title: "👥 Contingent Beneficiary",
    script: `Do you want to add a contingent beneficiary, just in case something happens to {beneficiary} first?`,
    options: [
      { label: "✅ Yes", nextNode: "collect_contingent" },
      { label: "❌ No", nextNode: "transition_to_ssn" },
    ],
  },

  collect_contingent: {
    id: "collect_contingent",
    type: NODE_TYPES.DATA_COLLECTION,
    phase: 6,
    title: "👥 Collect Contingent",
    script: `Okay, who would that be?`,
    captureVariable: "contingent_beneficiary",
    nextNode: "transition_to_ssn",
  },

  // ═══════════════════════════════════════════════════════════════
  // PHASE 7: THE IDENTITY LOCK (SSN) (12:00 - 15:30)
  // ═══════════════════════════════════════════════════════════════
  transition_to_ssn: {
    id: "transition_to_ssn",
    type: NODE_TYPES.STATEMENT,
    phase: 7,
    title: "🔒 SSN Introduction",
    timestamp: "12:00 - 15:30",
    script: `Okay, we are almost done. The insurance company requires a Medical Information Bureau check to verify what you told me about your health. It's just an identity check.`,
    nextNode: "ssn_ask",
  },

  ssn_ask: {
    id: "ssn_ask",
    type: NODE_TYPES.DATA_COLLECTION,
    phase: 7,
    title: "🔢 SSN Collection",
    script: `What is your Social Security Number so I can verify your identity?`,
    captureVariable: "ssn",
    options: [
      { label: "✅ Provides SSN", nextNode: "ssn_confirmation" },
      { label: "⚠️ Hesitates", nextNode: "ssn_reassurance" },
    ],
  },

  ssn_reassurance: {
    id: "ssn_reassurance",
    type: NODE_TYPES.STATEMENT,
    phase: 7,
    title: "🔐 SSN Reassurance",
    script: `I understand. Just so you know, I cannot see the number once I type it in; it turns into asterisks on my screen for your security. It is only used to verify you are who you say you are. Go ahead.`,
    options: [
      { label: "✅ Provides SSN", nextNode: "ssn_confirmation" },
      { label: "❌ Still refuses", nextNode: "crankwheel_pivot" },
    ],
  },

  crankwheel_pivot: {
    id: "crankwheel_pivot",
    type: NODE_TYPES.STATEMENT,
    phase: 7,
    title: "🖥️ Screen Share Pivot",
    script: `I tell you what, I can send you a text right now that lets you see my screen, so you can watch me type it into the official carrier application. Would that make you more comfortable?`,
    options: [
      { label: "✅ Yes", nextNode: "send_link" },
      { label: "❌ No", nextNode: "manager_takeover" },
    ],
  },

  send_link: {
    id: "send_link",
    type: NODE_TYPES.STATEMENT,
    phase: 7,
    title: "📱 Send Screen Share",
    script: `Perfect, I'm sending that to you now. You should receive a text in just a moment.`,
    nextNode: "ssn_confirmation",
  },

  manager_takeover: {
    id: "manager_takeover",
    type: NODE_TYPES.STATEMENT,
    phase: 7,
    title: "👔 Manager Assistance",
    script: `I understand your concern. Let me have my manager step in to help address this.`,
    nextNode: "end_call",
  },

  ssn_confirmation: {
    id: "ssn_confirmation",
    type: NODE_TYPES.STATEMENT,
    phase: 7,
    title: "✅ SSN Confirmed",
    script: `Thank you. I'm submitting that to the medical bureau now... [Pause]... Okay, looks like everything is checking out.`,
    nextNode: "transition_to_banking",
  },

  // ═══════════════════════════════════════════════════════════════
  // PHASE 8: THE FINANCIAL DISARM (Banking) (15:30 - 19:00)
  // ═══════════════════════════════════════════════════════════════
  transition_to_banking: {
    id: "transition_to_banking",
    type: NODE_TYPES.STATEMENT,
    phase: 8,
    title: "🏦 Banking Introduction",
    timestamp: "15:30 - 19:00",
    conversionTip: {
      text: "+17.0% lift (explained_why_needed)",
      source: "banking_approach.normalized_the_ask",
    },
    script: `Now {first_name}, the last step is to set up your state-regulated profile so the carrier can send the money to {beneficiary}. They don't accept cash or checks through the mail anymore because of fraud.`,
    nextNode: "bank_ask",
  },

  bank_ask: {
    id: "bank_ask",
    type: NODE_TYPES.QUESTION,
    phase: 8,
    title: "🏦 Bank Question",
    conversionTip: {
      text: "+46.0% lift (normalized_the_ask)",
      source: "banking_approach.normalized_the_ask",
    },
    script: `Do you do your banking with a local bank like Chase or Wells Fargo, or a credit union?`,
    options: [
      { label: "🏦 Local bank", nextNode: "routing_number_ask" },
      { label: "🏛️ Credit union", nextNode: "routing_number_ask" },
      { label: "💳 Direct Express", nextNode: "direct_express_pivot" },
      { label: "❌ No bank", nextNode: "deal_killer_pivot" },
    ],
  },

  routing_number_ask: {
    id: "routing_number_ask",
    type: NODE_TYPES.DATA_COLLECTION,
    phase: 8,
    title: "🔢 Routing Number",
    script: `Okay, grab your checkbook real quick. I need to verify the 9-digit routing number to make sure they are a participating bank. Let me know when you have that.`,
    captureVariable: "routing_number",
    options: [
      { label: "✅ Provides", nextNode: "account_number_ask" },
      { label: "⚠️ Hesitates", nextNode: "banking_reassurance" },
    ],
  },

  banking_reassurance: {
    id: "banking_reassurance",
    type: NODE_TYPES.STATEMENT,
    phase: 8,
    title: "🔐 Banking Reassurance",
    script: `This is just the public routing number for the bank, it identifies the bank, not you. It's the bottom left number on the check.`,
    nextNode: "account_number_ask",
  },

  account_number_ask: {
    id: "account_number_ask",
    type: NODE_TYPES.DATA_COLLECTION,
    phase: 8,
    title: "🔢 Account Number",
    script: `Perfect, that comes up as {bank_name}. Now, what is the account number right next to it?`,
    captureVariable: "account_number",
    nextNode: "draft_date_setup",
  },

  draft_date_setup: {
    id: "draft_date_setup",
    type: NODE_TYPES.DATA_COLLECTION,
    phase: 8,
    title: "📅 Draft Date",
    script: `And do you receive your Social Security on the 1st, the 3rd, or a Wednesday?`,
    captureVariable: "ss_payment_date",
    nextNode: "set_draft_date",
  },

  set_draft_date: {
    id: "set_draft_date",
    type: NODE_TYPES.STATEMENT,
    phase: 8,
    title: "✅ Set Draft Date",
    script: `Okay, I'll set the draft for that same day so it aligns with your deposit. That way you never have to worry about it. Fair?`,
    nextNode: "transition_to_confirmation",
  },

  direct_express_pivot: {
    id: "direct_express_pivot",
    type: NODE_TYPES.STATEMENT,
    phase: 8,
    title: "💳 Direct Express",
    script: `That's perfectly fine. We can work with Direct Express cards as well.`,
    nextNode: "routing_number_ask",
  },

  deal_killer_pivot: {
    id: "deal_killer_pivot",
    type: NODE_TYPES.STATEMENT,
    phase: 8,
    title: "❌ No Banking",
    script: `I see. Unfortunately, we do need a bank account to set up the automatic payments. Is there a family member who might be able to help set one up?`,
    nextNode: "end_call",
  },

  transition_to_confirmation: {
    id: "transition_to_confirmation",
    type: NODE_TYPES.TRANSITION,
    phase: 8,
    title: "⏭️ Move to Confirmation",
    script: "Excellent. I have everything locked in. Let me just finalize the approval and we can wrap this up.",
    nextNode: "recap",
  },

  // ═══════════════════════════════════════════════════════════════
  // PHASE 9: THE VICTORY LAP (Confirmation) (19:00 - 35:58)
  // ═══════════════════════════════════════════════════════════════
  recap: {
    id: "recap",
    type: NODE_TYPES.STATEMENT,
    phase: 9,
    title: "🎉 Congratulations",
    timestamp: "19:00 - 35:58",
    conversionTip: {
      text: "+23.6% lift (summary_close)",
      source: "Summary Close Technique",
    },
    script: `Congratulations {first_name}, you are approved! Let me recap: You have {coverage_amount} of whole life coverage for {monthly_premium}. Your beneficiary is {beneficiary}. And your first payment will be on {draft_date}.`,
    nextNode: "expectations",
  },

  expectations: {
    id: "expectations",
    type: NODE_TYPES.STATEMENT,
    phase: 9,
    title: "📬 Set Expectations",
    script: `You will receive your policy in the mail in about 7-10 days. Please put it in a safe place and tell {beneficiary} where it is.`,
    nextNode: "cool_down",
  },

  cool_down: {
    id: "cool_down",
    type: NODE_TYPES.STATEMENT,
    phase: 9,
    title: "😊 Cool Down",
    conversionTip: {
      text: "+17.0% lift (mentioned_peace_of_mind)",
      source: "presentation_approach.mentioned_peace_of_mind",
    },
    script: `Now that the business is done, I just want to say—you did a great thing for your family today. How does it feel to have this crossed off your list?`,
    nextNode: "referral_ask",
  },

  referral_ask: {
    id: "referral_ask",
    type: NODE_TYPES.STATEMENT,
    phase: 9,
    title: "🤝 Referral Request",
    script: `I'm glad. Since I helped you, do you know anyone else, maybe a sibling or neighbor, who needs to get this taken care of too?`,
    nextNode: "goodbye",
  },

  goodbye: {
    id: "goodbye",
    type: NODE_TYPES.STATEMENT,
    phase: 9,
    title: "👋 Closing",
    script: `Here is my direct number. Save it as 'Insurance Agent {agent_name}'. Call me if you need anything. Have a blessed day!`,
    options: [{ label: "End Call", nextNode: "end_call" }],
  },

  // ═══════════════════════════════════════════════════════════════
  // OBJECTION HANDLERS
  // ═══════════════════════════════════════════════════════════════
  objection_price_handler: {
    id: "objection_price_handler",
    type: NODE_TYPES.OBJECTION_HANDLER,
    phase: 6,
    title: "💰 Price Objection",
    script: `I completely understand. We are all on a budget these days.`,
    nextNode: "price_isolate",
  },

  price_isolate: {
    id: "price_isolate",
    type: NODE_TYPES.QUESTION,
    phase: 6,
    title: "🎯 Isolate Issue",
    script: `Is it the price specifically, or are you unsure about the value of the coverage?`,
    options: [
      { label: "💰 Price", nextNode: "pivot_down" },
      { label: "❓ Value", nextNode: "re_educate" },
    ],
  },

  pivot_down: {
    id: "pivot_down",
    type: NODE_TYPES.QUESTION,
    phase: 6,
    title: "⬇️ Lower Coverage",
    script: `If we could drop the coverage slightly to get the payment under $50, would that be more comfortable for you?`,
    options: [{ label: "✅ Yes", nextNode: "re_quote" }],
  },

  re_quote: {
    id: "re_quote",
    type: NODE_TYPES.QUOTE,
    phase: 6,
    title: "💰 Re-Quote",
    script: `Let me pull up some lower coverage amounts for you.`,
    showQuoteCalculator: true,
    nextNode: "trial_close_selection",
  },

  re_educate: {
    id: "re_educate",
    type: NODE_TYPES.STATEMENT,
    phase: 6,
    title: "📚 Re-Educate on Value",
    script: `Let me explain the value again. This is whole life insurance, which means the coverage never expires and the rate never goes up. It's designed specifically to protect {beneficiary} from having to pay $10,000-$15,000 out of pocket for your funeral.`,
    nextNode: "trial_close_selection",
  },

  objection_think_handler: {
    id: "objection_think_handler",
    type: NODE_TYPES.OBJECTION_HANDLER,
    phase: 6,
    title: "🤔 Think About It",
    script: `That's perfectly fine. It's a big decision.`,
    nextNode: "think_isolate",
  },

  think_isolate: {
    id: "think_isolate",
    type: NODE_TYPES.QUESTION,
    phase: 6,
    title: "🎯 Isolate Think Objection",
    script: `Usually when folks say that, it's either the price or they want to talk to someone. Which is it for you?`,
    options: [
      { label: "👨‍👩‍👧 Talk to kids/family", nextNode: "responsibility_reframe" },
      { label: "💰 Price", nextNode: "objection_price_handler" },
    ],
  },

  responsibility_reframe: {
    id: "responsibility_reframe",
    type: NODE_TYPES.STATEMENT,
    phase: 6,
    title: "🎯 Reframe Responsibility",
    script: `I understand. But let me ask you—if your kids said 'No, don't buy it', would you really want to leave them with the bill? Or is this something you want to take care of for them?`,
    options: [
      { label: "✅ Take care of it", nextNode: "assumptive_transition" },
    ],
  },

  end_call: {
    id: "end_call",
    type: NODE_TYPES.STATEMENT,
    phase: 9,
    title: "📞 End Call",
    script: `Thank you for your time today, {first_name}. Have a great day!`,
    isEndNode: true,
  },

  already_covered_objection: {
    id: "already_covered_objection",
    type: NODE_TYPES.OBJECTION_HANDLER,
    phase: 3,
    title: "✅ Already Has Coverage",
    script: `That's great that you have something in place. How much coverage do you currently have?`,
    nextNode: "coverage_gap_analysis",
  },

  coverage_gap_analysis: {
    id: "coverage_gap_analysis",
    type: NODE_TYPES.STATEMENT,
    phase: 3,
    title: "🔍 Gap Analysis",
    script: `With funerals averaging $10,000-$15,000, and that only going up with inflation, we want to make sure you have enough. Many of my clients supplement their existing coverage to ensure their family is fully protected.`,
    nextNode: "budget_discovery",
  },

  budget_discovery: {
    id: "budget_discovery",
    type: NODE_TYPES.TRANSITION,
    phase: 3,
    title: "💰 Budget Discovery",
    script: `Let me pull up some options to show you what's available in your area.`,
    nextNode: "inflation_story",
  },
};

// ═══════════════════════════════════════════════════════════════════
// PHASE METADATA
// ═══════════════════════════════════════════════════════════════════
export const SCRIPT_PHASES = {
  1: { name: "The Trust Anchor", timing: "0:00 - 0:45", color: "blue" },
  2: {
    name: "The Emotional Excavation",
    timing: "0:45 - 4:40",
    color: "purple",
  },
  3: { name: "The Eligibility Pivot", timing: "4:40 - 7:30", color: "green" },
  4: { name: "The Value Bridge", timing: "7:30 - 9:00", color: "yellow" },
  5: { name: "The Option Selection", timing: "9:00 - 10:45", color: "orange" },
  6: { name: "The Commitment Seal", timing: "10:45 - 12:00", color: "red" },
  7: { name: "The Identity Lock", timing: "12:00 - 15:30", color: "indigo" },
  8: { name: "The Financial Disarm", timing: "15:30 - 19:00", color: "pink" },
  9: { name: "The Victory Lap", timing: "19:00 - 35:58", color: "teal" },
};

// ═══════════════════════════════════════════════════════════════════
// STARTING NODE
// ═══════════════════════════════════════════════════════════════════
export const STARTING_NODE = "greeting_start";

// ═══════════════════════════════════════════════════════════════════
// VARIABLE REPLACEMENT HELPER
// ═══════════════════════════════════════════════════════════════════
export const replaceVariables = (text, prospectData) => {
  if (!text || !prospectData) return text;

  let result = text;

  // Replace all dynamic variables with actual data
  const variables = {
    agent_name: prospectData.agent_name || "John Smith",
    first_name: prospectData.first_name || prospectData.firstName || "there",
    last_name: prospectData.last_name || prospectData.lastName || "",
    state: prospectData.state || "your state",
    city: prospectData.city || "",
    dob: prospectData.dob || prospectData.dateOfBirth || "",
    age: prospectData.age || "",
    beneficiary: prospectData.beneficiary || "your loved one",
    beneficiary_relationship: prospectData.beneficiary_relationship || "child",
    address: prospectData.address || prospectData.street_address || "",
    medications_list: prospectData.medications_list || "",
    coverage_amount: prospectData.selected_coverage || "10,000",
    coverage_amount_high: prospectData.coverage_high || "15,000",
    coverage_amount_mid: prospectData.coverage_mid || "10,000",
    coverage_amount_low: prospectData.coverage_low || "5,000",
    monthly_premium: prospectData.selected_premium || "75",
    monthly_premium_high: prospectData.premium_high || "95",
    monthly_premium_mid: prospectData.premium_mid || "75",
    monthly_premium_low: prospectData.premium_low || "45",
    premium_min: prospectData.premium_min || "28",
    bank_name: prospectData.bank_name || "your bank",
    draft_date: prospectData.draft_date || "the 3rd",
  };

  // Replace all {variable} patterns
  Object.keys(variables).forEach((key) => {
    const regex = new RegExp(`\\{${key}\\}`, "g");
    result = result.replace(regex, variables[key]);
  });

  return result;
};

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════
export const getNode = (id) => {
  if (!id) return null;
  return SCRIPT_NODES[id];
};

