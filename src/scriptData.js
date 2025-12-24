// scriptData.js - STATE MACHINE BUILT FROM ACTUAL CALL DATA
// Source: FULL_31MIN_SCRIPT_20251223_131554.md
// Analytics: DEEP_ANALYSIS.json (2206 calls, 28.6% baseline)

// ═══════════════════════════════════════════════════════════════════
// CONVERSION DATA FROM DEEP_ANALYSIS.json
// ═══════════════════════════════════════════════════════════════════
export const CONVERSION_DATA = {
  baseline: 28.6,
  totalCalls: 2206,
  confirmedSales: 632,
  
  // Top techniques by conversion lift (from PRIORITIZED_RECOMMENDATIONS)
  topTechniques: {
    summary_close: { lift: 43.77, rate: 66.9, sample: 278 },
    normalized_banking: { lift: 37.73, rate: 45.9, sample: 1199 },
    smooth_transition: { lift: 37.31, rate: 49.7, sample: 959 },
    assumptive_close: { lift: 30.56, rate: 37.3, sample: 1582 },
    silence_technique: { lift: 29.1, rate: 51.6, sample: 465 },
    explicit_yes: { lift: 25.29, rate: 35.9, sample: 1574 },
    validated_concerns: { lift: 19.0, rate: 31.8, sample: 1839 },
    alternative_choice: { lift: 17.36, rate: 39.1, sample: 874 },
    trial_close: { lift: 16.89, rate: 30.9, sample: 1907 },
    specific_dollars: { lift: 16.31, rate: 30.8, sample: 1916 },
    permission_questions: { lift: 16.13, rate: 31.9, sample: 1762 },
    peace_of_mind: { lift: 15.59, rate: 34.0, sample: 1442 },
    tie_downs: { lift: 15.44, rate: 31.6, sample: 1785 },
    combined_questions: { lift: 14.9, rate: 31.1, sample: 1842 },
    benefits_over_features: { lift: 14.69, rate: 31.0, sample: 1856 }
  },
  
  // Things to AVOID (from PRIORITIZED_RECOMMENDATIONS)
  thingsToAvoid: {
    awkward_banking_transition: { lift: -21.04, rate: 14.3, sample: 700 },
    robotic_questions: { lift: -24.83, rate: 5.3, sample: 132 },
    transfer_bridge: { lift: -9.24, rate: 25.1, sample: 1365 },
    referenced_transfer: { lift: -7.93, rate: 25.6, sample: 1346 },
    asked_how_are_you: { lift: -5.41, rate: 26.7, sample: 1392 },
    first_name_only: { lift: -3.95, rate: 26.1, sample: 807 }
  },
  
  // Optimal timing from analysis
  timing: {
    timeToPrice: { optimal: '260-690 sec', target: 450 },
    timeToClose: { optimal: '370-850 sec', target: 560 },
    agentWPM: { optimal: '110-142', target: 115 },
    talkRatio: { optimal: '1.7-3.0', target: 2.42 }
  },
  
  // Technique count = 9 yields 56.2% conversion
  optimalTechniqueCount: 9
};

// ═══════════════════════════════════════════════════════════════════
// NODE TYPES
// ═══════════════════════════════════════════════════════════════════
export const NODE_TYPES = {
  SCRIPT: 'script',
  DECISION: 'decision',
  OBJECTION_HUB: 'objection_hub',
  DATA_COLLECT: 'data_collect',
  QUOTE: 'quote',
  CLOSE: 'close'
};

// ═══════════════════════════════════════════════════════════════════
// SCRIPT NODES - VERBATIM FROM FULL_31MIN_SCRIPT
// ═══════════════════════════════════════════════════════════════════
export const SCRIPT_NODES = {
  
  // ═══════════════════════════════════════════════════════════════
  // PHASE 1: TRANSFER OPENING (0:00 - 0:30)
  // ═══════════════════════════════════════════════════════════════
  'transfer_opening': {
    id: 'transfer_opening',
    type: NODE_TYPES.SCRIPT,
    phase: 1,
    title: '📞 Transfer Opening',
    timestamp: '0:00 - 0:30',
    stageDirection: '[Downward inflection on your name to signal authority. Do NOT ask "How are you?"]',
    conversionTip: {
      text: 'NEVER ask "How are you?" (-5.41 pts). Dive Straight In (+7.63 pts)',
      source: 'DEEP_ANALYSIS: asked_how_are_you vs dove_straight_in'
    },
    script: `Thank you, I've got it from here. Hello, {first_name}. My name is [Agent Name], and I am the state-licensed field underwriter assigned to your file in {state} today. I see here that you were looking for some information on the state-regulated final expense programs to cover burial and cremation costs, is that correct?`,
    nextNode: 'opening_response'
  },

  'opening_response': {
    id: 'opening_response',
    type: NODE_TYPES.DECISION,
    phase: 1,
    title: 'Prospect Response',
    // No prompt needed - shown inline on previous script card
    options: [
      { 
        label: '✅ \"Yes, that\'s right\"', 
        nextNode: 'authority_purpose'
      },
      { 
        label: '⚠️ \"Just looking at prices\"', 
        nextNode: 'reassurance_bridge'
      },
      { 
        label: '❌ \"Who is this?\" / Confused', 
        nextNode: 'trust_objection'
      }
    ]
  },

  'reassurance_bridge': {
    id: 'reassurance_bridge',
    type: NODE_TYPES.SCRIPT,
    phase: 1,
    title: '🤝 Reassurance Bridge',
    conversionTip: {
      text: 'Validated Prospect Concerns: +19.0 pts lift (31.8% vs 12.8%)',
      source: 'DEEP_ANALYSIS: validated_prospect_concerns'
    },
    script: `I understand completely, {first_name}. My job isn't to sell you anything you don't need. My job is simply to be your eyes and ears, shop the top-rated carriers in {state}, and see if we can find you a plan that fits your budget.`,
    nextNode: 'authority_purpose'
  },

  // ═══════════════════════════════════════════════════════════════
  // PHASE 2: ESTABLISHING AUTHORITY (0:30 - 3:00)
  // ═══════════════════════════════════════════════════════════════
  'authority_purpose': {
    id: 'authority_purpose',
    type: NODE_TYPES.SCRIPT,
    phase: 2,
    title: '🏛️ Establish Authority & Purpose',
    timestamp: '0:30 - 3:00',
    conversionTip: {
      text: 'Authority Title: +1.06 pts. "State-regulated benefit coordinator" = power phrase.',
      source: 'DEEP_ANALYSIS: used_authority_title'
    },
    script: `Now, {first_name}, just so you know who you are speaking with—I am a state-regulated benefit coordinator. I don't work for just one insurance company. I work for you. I have access to over 20 different carriers, which means I can find the discounts that you might not be able to find on your own. Does that make sense?`,
    nextNode: 'authority_response'
  },

  'authority_response': {
    id: 'authority_response',
    type: NODE_TYPES.DECISION,
    phase: 2,
    title: 'Response Check',
    options: [
      { label: '✅ \"Yes\" / \"I understand\"', nextNode: 'compliance_disclosure' },
      { label: '⚠️ Confused / \"What do you mean?\"', nextNode: 'authority_clarify' },
      { label: '❌ Skeptical / Wants proof', nextNode: 'trust_objection' }
    ]
  },

  'authority_clarify': {
    id: 'authority_clarify',
    type: NODE_TYPES.SCRIPT,
    phase: 2,
    title: 'Clarify Role',
    script: `There is a lot of information out there, and it can be confusing. Think of me like a car insurance broker—I shop multiple companies to find you the best deal. I don't get paid more to sell you a bigger policy.`,
    nextNode: 'compliance_disclosure'
  },

  'compliance_disclosure': {
    id: 'compliance_disclosure',
    type: NODE_TYPES.SCRIPT,
    phase: 2,
    title: '🔒 Compliance & Privacy Disclosure',
    script: `Now, because I am a licensed agent in the state of {state}, I am required to let you know that this line is recorded for quality assurance and training purposes. And since we will be discussing some medical information to see what you qualify for, I want to assure you that everything we discuss is 100% private and protected under HIPAA laws. I take your privacy very seriously.`,
    nextNode: 'verify_name'
  },

  'verify_name': {
    id: 'verify_name',
    type: NODE_TYPES.SCRIPT,
    phase: 2,
    title: '📝 Verify Name',
    conversionTip: {
      text: 'Assumptive Language: "To get started..." (+30.56 pts lift, 37.3% conversion)',
      source: 'DEEP_ANALYSIS: assumptive_close'
    },
    script: `Perfect. So, to get started and see which discounts you're eligible for, I just need to verify a little bit of information to get your file open. I have your first name as {first_name}. Can you please spell your last name for me clearly?`,
    nextNode: 'location_rapport'
  },

  'location_rapport': {
    id: 'location_rapport',
    type: NODE_TYPES.SCRIPT,
    phase: 2,
    title: '🏠 Location & Rapport',
    conversionTip: {
      text: 'Found Common Ground: +9.19 pts lift (31.1% conversion)',
      source: 'DEEP_ANALYSIS: found_common_ground'
    },
    script: `[After they spell name] Thank you, {first_name}. And just to confirm, you are currently residing in {state}, correct?

[If they mention city]: {city}. Okay, wonderful. I have family not too far from there. It's a beautiful area.

[If they mention health/weather]: I know you're not feeling right. The cold weather can be really tough on the joints. My mother deals with the same thing. We'll try to make this as quick and easy as possible for you so you can get back to resting.`,
    nextNode: 'health_intro'
  },

  // ═══════════════════════════════════════════════════════════════
  // PHASE 3: HEALTH QUALIFICATION (3:00 - 8:00)
  // ═══════════════════════════════════════════════════════════════
  'health_intro': {
    id: 'health_intro',
    type: NODE_TYPES.SCRIPT,
    phase: 3,
    title: '🏥 Health Questions Intro',
    timestamp: '3:00 - 8:00',
    conversionTip: {
      text: 'Permission-Based Questions: +16.13 pts lift (31.9% vs 15.8%)',
      source: 'DEEP_ANALYSIS: permission_based_questions'
    },
    script: `Now, {first_name}, to make sure I don't pair you with a company that will decline you, I need to ask a few health questions. This helps me get you the best rate. First, could you verify your date of birth for me?`,
    nextNode: 'health_dob_response'
  },

  'health_dob_response': {
    id: 'health_dob_response',
    type: NODE_TYPES.SCRIPT,
    phase: 3,
    title: 'DOB Response',
    script: `[After they give DOB, e.g., "May 12th, 1952"]

That makes you... {age} years young?

[After they respond, often with a chuckle]

You sound full of energy to me, {first_name}.`,
    nextNode: 'health_tobacco'
  },

  'health_tobacco': {
    id: 'health_tobacco',
    type: NODE_TYPES.DECISION,
    phase: 3,
    title: '🚬 Tobacco Question',
    prompt: `"Now, regarding tobacco or nicotine. Do you smoke cigarettes, use a pipe, chew tobacco, or use those e-cigarettes?"`,
    options: [
      { 
        label: '✅ Non-Smoker / Quit 12+ months ago', 
        nextNode: 'health_tobacco_nonsmoker',
        response: '"Oh heavens no. I quit smoking thirty years ago."'
      },
      { 
        label: '🚬 Current Tobacco User', 
        nextNode: 'health_tobacco_smoker',
        response: '"Yes, I smoke."'
      }
    ]
  },

  'health_tobacco_nonsmoker': {
    id: 'health_tobacco_nonsmoker',
    type: NODE_TYPES.SCRIPT,
    phase: 3,
    title: 'Non-Smoker Response',
    conversionTip: {
      text: 'Mirroring: +13.83 pts lift (35.6% vs 21.8%)',
      source: 'DEEP_ANALYSIS: mirroring technique'
    },
    script: `Nonsmoker. Nonsmoker. That is excellent. That's going to save you a lot of money right off the bat.`,
    nextNode: 'health_major_conditions'
  },

  'health_tobacco_smoker': {
    id: 'health_tobacco_smoker',
    type: NODE_TYPES.SCRIPT,
    phase: 3,
    title: 'Smoker Response',
    script: `Okay, I'll note that. It does affect the rate, but I have several carriers that work with tobacco users. We'll find you the best option.`,
    nextNode: 'health_major_conditions'
  },

  'health_major_conditions': {
    id: 'health_major_conditions',
    type: NODE_TYPES.DECISION,
    phase: 3,
    title: '❤️ Major Conditions',
    conversionTip: {
      text: 'Combined Questions: +14.9 pts lift (31.1% vs 16.2%)',
      source: 'DEEP_ANALYSIS: combined_questions'
    },
    prompt: `"Now, I'm going to run through a list of conditions. Just tell me yes or no. In the past 5 years, have you been treated for or diagnosed with any heart attack, stroke, or congestive heart failure?"`,
    options: [
      { label: '✅ No Major Heart Issues', nextNode: 'health_bp_check' },
      { label: '⚠️ Has Heart Condition (in past 5 years)', nextNode: 'health_heart_details' }
    ]
  },

  'health_heart_details': {
    id: 'health_heart_details',
    type: NODE_TYPES.SCRIPT,
    phase: 3,
    title: 'Heart Condition Details',
    script: `I appreciate you sharing that. When was the last hospitalization or procedure for your heart? Was it more than 2 years ago?

[Note: This may affect plan eligibility - may need Graded or ROP plan]`,
    nextNode: 'health_bp_check'
  },

  'health_bp_check': {
    id: 'health_bp_check',
    type: NODE_TYPES.SCRIPT,
    phase: 3,
    title: '💊 Blood Pressure & Medications',
    conversionTip: {
      text: 'Empathy Statements: +5.61 pts lift. "My own father takes medication for that."',
      source: 'DEEP_ANALYSIS: empathy_statements'
    },
    script: `Okay, high blood pressure. That is very common. I assume you take medication for that?

[After they confirm, e.g., "Lisinopril"]

Lisinopril. Okay. I'm writing that down. That's very common—my own father takes medication for that. It won't affect your rate.

Any other medications you are currently taking, {first_name}? Maybe something for cholesterol or diabetes?`,
    nextNode: 'health_diabetes_check'
  },

  'health_diabetes_check': {
    id: 'health_diabetes_check',
    type: NODE_TYPES.DECISION,
    phase: 3,
    title: '🩸 Diabetes Check',
    prompt: 'Does prospect have diabetes?',
    options: [
      { label: '✅ No Diabetes', nextNode: 'health_hospital' },
      { label: '💊 Pills Only (Metformin)', nextNode: 'health_diabetes_pills' },
      { label: '💉 Insulin User', nextNode: 'health_diabetes_insulin' }
    ]
  },

  'health_diabetes_pills': {
    id: 'health_diabetes_pills',
    type: NODE_TYPES.SCRIPT,
    phase: 3,
    title: 'Diabetes (Pills Only)',
    script: `Metformin and a water pill. Okay. Have you ever used insulin for the diabetes?

[If No]: Perfect. That helps a lot. Pills-only diabetes gets the best rates.`,
    nextNode: 'health_hospital'
  },

  'health_diabetes_insulin': {
    id: 'health_diabetes_insulin',
    type: NODE_TYPES.SCRIPT,
    phase: 3,
    title: 'Diabetes (Insulin)',
    script: `Okay, insulin use does affect the plan type. Don't worry—I have carriers that work with insulin-dependent diabetes. It may be a graded benefit plan, but you'll still be protected.`,
    nextNode: 'health_hospital'
  },

  'health_hospital': {
    id: 'health_hospital',
    type: NODE_TYPES.DECISION,
    phase: 3,
    title: '🏥 Hospitalization Check',
    prompt: `"In the last two years, have you been hospitalized for any reason?"`,
    options: [
      { label: '✅ No Hospitalization', nextNode: 'health_height_weight' },
      { label: '🩹 Minor Surgery (knee, etc.)', nextNode: 'health_minor_surgery' },
      { label: '⚠️ Major Hospitalization', nextNode: 'health_major_hospital' }
    ]
  },

  'health_minor_surgery': {
    id: 'health_minor_surgery',
    type: NODE_TYPES.SCRIPT,
    phase: 3,
    title: 'Minor Surgery Response',
    conversionTip: {
      text: 'Empathy: "I bet that was a tough recovery. You\'ve been through a lot."',
      source: 'DEEP_ANALYSIS: empathy_statements verbatim'
    },
    script: `I bet that was a tough recovery. You've been through a lot. But other than the knee surgery, no overnight stays for heart or lungs?

[After "No"]: Excellent.`,
    nextNode: 'health_height_weight'
  },

  'health_major_hospital': {
    id: 'health_major_hospital',
    type: NODE_TYPES.SCRIPT,
    phase: 3,
    title: 'Major Hospitalization',
    script: `Thank you for being honest with me. Tell me a little more about what happened so I can find the right carrier for your situation.`,
    nextNode: 'health_height_weight'
  },

  'health_height_weight': {
    id: 'health_height_weight',
    type: NODE_TYPES.SCRIPT,
    phase: 3,
    title: '📏 Height & Weight',
    conversionTip: {
      text: 'Social Proof: "You are the exact same height and weight as the last lady I was helping" (+7.04 pts)',
      source: 'DEEP_ANALYSIS: social_proof verbatim'
    },
    script: `And {first_name}, roughly what is your height and weight?

[After response, e.g., "5'4" and 180"]:

You are the exact same height and weight as the last lady I was helping. That is perfectly fine.`,
    nextNode: 'beneficiary_discovery'
  },

  'beneficiary_discovery': {
    id: 'beneficiary_discovery',
    type: NODE_TYPES.SCRIPT,
    phase: 3,
    title: '💜 Beneficiary Discovery',
    conversionTip: {
      text: 'Tie-Down: "That would be nice, wouldn\'t it?" (+15.44 pts lift, 31.6% vs 16.2%)',
      source: 'DEEP_ANALYSIS: tie_downs'
    },
    script: `Now, {first_name}, this is an important question. When something happens to you, who are we doing this for? Who is going to be your beneficiary?

[After they say name, e.g., "My daughter, Sarah"]:

{beneficiary}. That would be nice for her, wouldn't it? To not have to worry about the bill?`,
    nextNode: 'beneficiary_pain_response'
  },

  'beneficiary_pain_response': {
    id: 'beneficiary_pain_response',
    type: NODE_TYPES.SCRIPT,
    phase: 3,
    title: '⚡ The Pain Point',
    stageDirection: '[This is the EMOTIONAL ANCHOR. Build the "why".]',
    conversionTip: {
      text: '"Most people these days don\'t have a big account" - verbatim from top sales calls',
      source: 'DEEP_ANALYSIS: empathy_statements verbatim'
    },
    script: `[After "Yes, she has three kids of her own. She doesn't have extra money lying around."]:

Most people these days don't have a big account, and God willing, you know, there's enough in there to pay for groceries these days. It's crazy. So we want to make sure {beneficiary} is protected.

Do you currently have any life insurance in place, {first_name}?`,
    nextNode: 'existing_coverage_check'
  },

  'existing_coverage_check': {
    id: 'existing_coverage_check',
    type: NODE_TYPES.DECISION,
    phase: 3,
    title: 'Existing Coverage?',
    options: [
      { label: '❌ No Coverage / Had Through Work (Ended)', nextNode: 'no_coverage_urgency' },
      { label: '✅ Has Existing Policy', nextNode: 'already_covered_objection' }
    ]
  },

  'no_coverage_urgency': {
    id: 'no_coverage_urgency',
    type: NODE_TYPES.SCRIPT,
    phase: 3,
    title: '⏰ Create Urgency',
    conversionTip: {
      text: 'Urgency/Scarcity: +4.0 pts lift when used. "If something happened" language.',
      source: 'DEEP_ANALYSIS: urgency_scarcity'
    },
    script: `Okay. So right now, if something happened, {beneficiary} would have to pay for everything out of pocket?

[After "Yes, and I don't want that"]:

I understand completely. That is exactly why we are on the phone today. We are going to fix that.`,
    nextNode: 'budget_discovery'
  },

  // ═══════════════════════════════════════════════════════════════
  // PHASE 4: BUDGET DISCOVERY (8:00 - 10:00)
  // ═══════════════════════════════════════════════════════════════
  'budget_discovery': {
    id: 'budget_discovery',
    type: NODE_TYPES.SCRIPT,
    phase: 4,
    title: '💰 Budget Discovery',
    timestamp: '8:00 - 10:00',
    conversionTip: {
      text: 'Social Proof: "Most of my clients, including myself..." (+7.04 pts)',
      source: 'DEEP_ANALYSIS: social_proof verbatim'
    },
    script: `Now, {first_name}, most of my clients, including myself, like everything to be based around their Social Security or retirement income. Are you currently receiving Social Security?

[If Yes]: And does that usually come on the 1st or the 3rd of the month, or is it one of those Wednesdays?

[After response, e.g., "The second Wednesday"]:

The second Wednesday. Perfect.`,
    nextNode: 'budget_anchor'
  },

  'budget_anchor': {
    id: 'budget_anchor',
    type: NODE_TYPES.SCRIPT,
    phase: 4,
    title: '⚓ Budget Anchor',
    conversionTip: {
      text: 'Anchoring: +11.25 pts lift (33.4% vs 22.2%). Set expectation before price.',
      source: 'DEEP_ANALYSIS: used_anchoring'
    },
    script: `And I know that every penny counts when you're on a fixed income. I assume you're looking for something that is affordable and isn't going to break the bank, right?

[After "Yes, absolutely. Everything is so expensive now."]:

Tell me about it. I went to the store yesterday and couldn't believe the prices. That's why my goal is to find you something that fits comfortably into your budget so you never have to worry about it. We aren't looking to make you "insurance poor," we just want to make sure {beneficiary} is okay.`,
    nextNode: 'quote_calculation'
  },

  'quote_calculation': {
    id: 'quote_calculation',
    type: NODE_TYPES.QUOTE,
    phase: 4,
    title: '⏳ Calculate Quote',
    stageDirection: '[SILENCE - Type for 10-15 seconds. Actually run the quote in the calculator.]',
    conversionTip: {
      text: '🔥 SILENCE: +29.1 pts lift (51.6% vs 22.5%). Let the silence work.',
      source: 'DEEP_ANALYSIS: silence_as_technique'
    },
    script: `Okay, I have everything I need to run the numbers. Give me just one moment while the computer calculates the best rates for you...

[Sound of typing for 10-15 seconds]

...Okay, it's pulling up the options now.`,
    showQuoteCalculator: true,
    nextNode: 'presentation_great_news'
  },

  // ═══════════════════════════════════════════════════════════════
  // PHASE 5: PRESENTATION (10:00 - 15:00)
  // ═══════════════════════════════════════════════════════════════
  'presentation_great_news': {
    id: 'presentation_great_news',
    type: NODE_TYPES.SCRIPT,
    phase: 5,
    title: '🎁 Great News Opening',
    timestamp: '10:00 - 15:00',
    conversionTip: {
      text: 'Benefits Over Features: +14.69 pts lift (31.0% vs 16.3%)',
      source: 'DEEP_ANALYSIS: benefits_over_features'
    },
    script: `Okay, {first_name}, I have some great news. Based on the health information you gave me—the fact that you're a non-smoker and your conditions are under control—you qualify for the preferred tier with a top-rated carrier. This is the best rating class available.

[After "Oh, that's good."]:

It is very good. Now, let me explain how this plan works because it's different from what you might see on TV.`,
    nextNode: 'presentation_benefits'
  },

  'presentation_benefits': {
    id: 'presentation_benefits',
    type: NODE_TYPES.SCRIPT,
    phase: 5,
    title: '✨ Present Benefits',
    conversionTip: {
      text: '"Peace of Mind" phrase: +15.59 pts lift (34.0% vs 18.5%)',
      source: 'DEEP_ANALYSIS: mentioned_peace_of_mind'
    },
    script: `First, this is **Whole Life** insurance. That means the price I give you today is locked in forever. It will never go up, even as you get older or if your health changes.

Second, the coverage amount never goes down.

And third, and most importantly, this pays out within 24 to 48 hours of notification. That means {beneficiary} will have the money immediately to pay the funeral home.

Does that sound like the kind of **peace of mind** you're looking for?`,
    nextNode: 'presentation_response'
  },

  'presentation_response': {
    id: 'presentation_response',
    type: NODE_TYPES.DECISION,
    phase: 5,
    title: 'Presentation Response',
    options: [
      { label: '✅ "Yes, that sounds right"', nextNode: 'price_options' },
      { label: '❓ Questions About Plan', nextNode: 'plan_questions' },
      { label: '⚠️ Skeptical', nextNode: 'objection_hub' }
    ]
  },

  'plan_questions': {
    id: 'plan_questions',
    type: NODE_TYPES.SCRIPT,
    phase: 5,
    title: 'Answer Plan Questions',
    script: `Great question. This is whole life—it builds cash value over time, and the death benefit is guaranteed. Unlike term insurance, you never lose your coverage as long as you pay the premium. It's designed specifically for final expenses.`,
    nextNode: 'price_options'
  },

  'price_options': {
    id: 'price_options',
    type: NODE_TYPES.SCRIPT,
    phase: 5,
    title: '💲 Present 3 Options',
    conversionTip: {
      text: 'Multiple Options: +9.39 pts lift. Alternative Choice Close: +17.36 pts lift.',
      source: 'DEEP_ANALYSIS: offered_multiple_options, alternative_choice'
    },
    stageDirection: '[Price Anchoring - Start with the highest option]',
    script: `Now, the average burial is usually between $8,000 and $15,000 in the United States. It's not cheap. I'm going to give you three options, and you just tell me which one feels most comfortable for you.

**Option one** is for **$15,000** in coverage. This would cover a full funeral, the headstone, and leave a little extra for {beneficiary} for bills or time off work. That runs **{premium_high}** a month.

**Option two** is for **$10,000** in coverage. This is our most popular plan. It covers the complete service and burial. That one is **{premium_mid}** a month.

And **option three** is for **$5,000**. This covers the basics, maybe a cremation and a small service. That one is **{premium_low}** a month.`,
    nextNode: 'price_silence'
  },

  'price_silence': {
    id: 'price_silence',
    type: NODE_TYPES.SCRIPT,
    phase: 5,
    title: '🤫 THE SILENCE',
    stageDirection: '[CRITICAL: PAUSE AND WAIT. Count to 10. Do NOT speak first.]',
    conversionTip: {
      text: '🔥🔥🔥 SILENCE IS CRITICAL: +29.1 pts lift (51.6% vs 22.5%). Let them speak first!',
      source: 'DEEP_ANALYSIS: silence_as_technique - highest impact technique'
    },
    script: `[WAIT IN SILENCE - Count to 10 if needed. The first person to speak loses.]`,
    nextNode: 'price_response'
  },

  'price_response': {
    id: 'price_response',
    type: NODE_TYPES.DECISION,
    phase: 5,
    title: 'Price Response',
    prompt: 'What did they say after the silence?',
    options: [
      { label: '✅ Picks an Option', nextNode: 'trial_close' },
      { label: '💰 "Too Expensive" / "Even the lowest is steep"', nextNode: 'price_objection' },
      { label: '🤔 "Need to Think"', nextNode: 'think_objection' },
      { label: '👨‍👩‍👧 "Talk to Family"', nextNode: 'family_objection' },
      { label: '❓ Other Objection', nextNode: 'objection_hub' }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // PHASE 6: PRICE OBJECTION (15:00 - 16:30)
  // ═══════════════════════════════════════════════════════════════
  'price_objection': {
    id: 'price_objection',
    type: NODE_TYPES.SCRIPT,
    phase: 6,
    title: '💰 Handle Price Objection',
    timestamp: '15:00 - 16:30',
    conversionTip: {
      text: 'Price objection occurs in 39.8% of calls. Resolution rate in sales: 98.9%. DROP THE FACE AMOUNT.',
      source: 'DEEP_ANALYSIS: OBJECTION_ANALYSIS > PRICE'
    },
    stageDirection: '[From verbatim successful response: Lower the face amount immediately]',
    script: `I understand. You're on a fixed income, and you have to be careful.

[After "Yeah, I just... I don't make that much money."]:

I hear you, {first_name}. And honestly, having some coverage is a lot better than having no coverage. If {beneficiary} has to come up with $10,000, that's a burden. But if we can take care of even half of that, it helps.

Let's look at this. A coverage amount of **$5,000** will cost you **{premium_low}** a month. Or, if we need to go even lower just to get your foot in the door, I can look at **$3,000** for about **{premium_min}** a month.`,
    nextNode: 'price_objection_response'
  },

  'price_objection_response': {
    id: 'price_objection_response',
    type: NODE_TYPES.DECISION,
    phase: 6,
    title: 'Price Objection Response',
    options: [
      { label: '✅ "$28? That sounds better. I can do that."', nextNode: 'trial_close' },
      { label: '⚠️ "Is $3,000 enough?"', nextNode: 'coverage_reassurance' },
      { label: '🤔 "I think so... but let me think about it"', nextNode: 'think_objection' }
    ]
  },

  'coverage_reassurance': {
    id: 'coverage_reassurance',
    type: NODE_TYPES.SCRIPT,
    phase: 6,
    title: 'Coverage Reassurance',
    script: `With the $3,000, it will cover a basic cremation and the urn. It ensures {beneficiary} doesn't have to put that on a credit card.

And remember, you can always add more later if your budget allows. But right now, the most important thing is locking in your age and health before anything changes.`,
    nextNode: 'trial_close'
  },

  // ═══════════════════════════════════════════════════════════════
  // PHASE 7: "NEED TO THINK" OBJECTION (16:30 - 18:00)
  // ═══════════════════════════════════════════════════════════════
  'think_objection': {
    id: 'think_objection',
    type: NODE_TYPES.SCRIPT,
    phase: 7,
    title: '🤔 Handle "Need to Think"',
    timestamp: '16:30 - 18:00',
    conversionTip: {
      text: '"Need to Think" occurs in 9.7% of calls, -8.6 pts impact. Use 30-day free look + underwriting frame.',
      source: 'DEEP_ANALYSIS: OBJECTION_ANALYSIS > NEED_TO_THINK'
    },
    stageDirection: '[Verbatim successful response from DEEP_ANALYSIS]',
    script: `I understand. It's a decision. But honestly, {first_name}, what do you got to think about? Maybe I can help.

[After "I just... I like to sleep on things. I don't like making decisions on the phone."]:

I get that. But here is the thing—quotes and all that really doesn't mean anything outside of the comfortability of what you could afford. The companies are the ones that are going to take a look at your medical background.

Right now, we don't even know if you're approved. I'm sitting here telling you the price is {premium}, but the insurance company might look at your prescriptions and say "No."

So, the next step would be just to submit an application to see if we actually get an approval with the carrier. If you get approved, that's going to be the main thing... **you have 30 days still to make a decision**. It's a risk-free look period. If you get the policy in the mail and decide you don't want it, you get your money back.`,
    nextNode: 'think_response'
  },

  'think_response': {
    id: 'think_response',
    type: NODE_TYPES.DECISION,
    phase: 7,
    title: '"Think" Response',
    prompt: `Prospect says: "Oh, so I can cancel it if I don't like it?"`,
    options: [
      { label: '✅ "I guess it wouldn\'t hurt to see if I qualify"', nextNode: 'urgency_close' },
      { label: '👨‍👩‍👧 "But I should probably talk to [family member] first"', nextNode: 'family_objection' },
      { label: '❌ Still wants to wait', nextNode: 'soft_close_schedule' }
    ]
  },

  'urgency_close': {
    id: 'urgency_close',
    type: NODE_TYPES.SCRIPT,
    phase: 7,
    title: '⏰ Urgency Close',
    conversionTip: {
      text: 'Urgency: "Within 48 hours, if I don\'t put in that application... this rate goes away"',
      source: 'DEEP_ANALYSIS: urgency_scarcity verbatim'
    },
    script: `100%. You are the boss. But within 48 hours, if I don't put in that application... this rate goes away. And as you age, it just continues to increase and increase. Better to be safe than sorry. Yeah?`,
    nextNode: 'application_start'
  },

  // ═══════════════════════════════════════════════════════════════
  // PHASE 8: FAMILY/SPOUSE OBJECTION (18:00 - 19:30)
  // ═══════════════════════════════════════════════════════════════
  'family_objection': {
    id: 'family_objection',
    type: NODE_TYPES.SCRIPT,
    phase: 8,
    title: '👨‍👩‍👧 Handle Family Objection',
    timestamp: '18:00 - 19:30',
    conversionTip: {
      text: 'Family objection: -19.7 pts impact (8.9% conversion). CRITICAL severity. Use "non-binding approval check" frame.',
      source: 'DEEP_ANALYSIS: OBJECTION_ANALYSIS > SPOUSE_FAMILY'
    },
    stageDirection: '[Verbatim successful response from analysis]',
    script: `I think that is a great idea. You definitely should tell {beneficiary}. But let me ask you this—if you ask {beneficiary}, "Do you want me to buy life insurance so you don't have to pay for my funeral?" what do you think she's going to say?

[After "She'd probably say don't worry about it, she'll figure it out."]:

Exactly. She loves you. She doesn't want you to worry. But you and I both know that when the time comes, she *will* worry.

So, let's do this. Let's just see if we can get you approved, {first_name}. Because if we can't get you approved, none of it matters. We can get the approval today, and then you can show the policy to {beneficiary} when it arrives. If she absolutely hates that you protected her financially, you can cancel it. But at least you'll have the option.`,
    nextNode: 'family_response'
  },

  'family_response': {
    id: 'family_response',
    type: NODE_TYPES.DECISION,
    phase: 8,
    title: 'Family Response',
    prompt: `Prospect says: "Okay. That makes sense. I just want to help her."`,
    options: [
      { label: '✅ "That makes sense"', nextNode: 'application_start' },
      { label: '❌ Still wants to wait', nextNode: 'soft_close_schedule' }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // PHASE 9: DISTRUST/PRIVACY OBJECTION (19:30 - 21:00)
  // ═══════════════════════════════════════════════════════════════
  'trust_objection': {
    id: 'trust_objection',
    type: NODE_TYPES.SCRIPT,
    phase: 9,
    title: '🔐 Handle Trust/Scam Concern',
    timestamp: '19:30 - 21:00',
    conversionTip: {
      text: 'Trust objection: -8.0 pts impact (20.7% conversion). Provide license # + text picture = resolution.',
      source: 'DEEP_ANALYSIS: OBJECTION_ANALYSIS > DISTRUST_PRIVACY'
    },
    stageDirection: '[Verbatim successful response: "Well, Ms. Lawrence, I\'d be the perfect person..."]',
    script: `{first_name}, I am so glad you said that. You are absolutely right to be careful. There are a lot of bad actors out there.

[After "Exactly. I don't know you."]:

Well, {first_name}, I'd be the perfect person to help you with it over the phone. I'm a licensed agent in the state of {state}. I can give you my licensing information right now. Do you have a pen?

[After "Yes, I have one right here."]:

My National Producer Number is [NPN]. And my {state} state license number is [State License #]. You can look me up on the {state} Department of Insurance website. I am also going to send you a text message right now with a picture of my license so you can see my face.

[Send text with license photo]

And regarding your information—I'm submitting this directly to the insurance carrier through a secure, encrypted portal. I don't store your information. It goes straight to them. We take your privacy and security very seriously.`,
    nextNode: 'trust_response'
  },

  'trust_response': {
    id: 'trust_response',
    type: NODE_TYPES.DECISION,
    phase: 9,
    title: 'Trust Response',
    prompt: `[Phone buzzes] Prospect says: "Okay, you look like a nice young man. Okay."`,
    options: [
      { label: '✅ Accepts / "You look nice"', nextNode: 'application_start' },
      { label: '❌ Still suspicious', nextNode: 'soft_close_schedule' }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // PHASE 10: "ALREADY COVERED" OBJECTION (21:00 - 22:00)
  // ═══════════════════════════════════════════════════════════════
  'already_covered_objection': {
    id: 'already_covered_objection',
    type: NODE_TYPES.SCRIPT,
    phase: 10,
    title: '📄 Handle "Already Have Coverage"',
    timestamp: '21:00 - 22:00',
    conversionTip: {
      text: 'Already covered: -9.3 pts impact (19.4% conversion). Distinguish "unit plans" vs "first day coverage".',
      source: 'DEEP_ANALYSIS: OBJECTION_ANALYSIS > ALREADY_COVERED'
    },
    script: `Okay. So you have a policy already, or you just sent in a card for information?

[After "I think I sent in the card. They sent me a little certificate. It said it was just $9.95."]:

Ah, I see. {first_name}, I'm glad you brought that up. That is a "unit" plan. Often, that $9.95 only buys a very small amount of coverage, sometimes only a few hundred dollars, and it usually has a two-year waiting period where if you pass away, they don't pay the full amount.

[After "Oh really? They didn't say that on the commercial."]:

I know. That's why I'm here. What we are looking at today is "first day coverage." That means you are fully protected from day one. And honestly, even if you did have that other plan, $3,000 is a great supplement to make sure the flowers and the obituary are paid for. You can never have too much protection for {beneficiary}, right?`,
    nextNode: 'covered_response'
  },

  'covered_response': {
    id: 'covered_response',
    type: NODE_TYPES.DECISION,
    phase: 10,
    options: [
      { label: '✅ Agrees to supplement', nextNode: 'price_options' },
      { label: '❌ Satisfied with current', nextNode: 'soft_close_schedule' }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // PHASE 11: BAD TIMING OBJECTION (22:00 - 23:00)
  // ═══════════════════════════════════════════════════════════════
  'timing_objection': {
    id: 'timing_objection',
    type: NODE_TYPES.SCRIPT,
    phase: 11,
    title: '📅 Handle Bad Timing',
    timestamp: '22:00 - 23:00',
    conversionTip: {
      text: 'Bad timing: -8.6 pts impact. Deferred draft resolves 100% of legitimate timing concerns.',
      source: 'DEEP_ANALYSIS: OBJECTION_ANALYSIS > BAD_TIMING'
    },
    stageDirection: '[Verbatim: "I couldn\'t take a payment from you today if you wanted..."]',
    script: `{first_name}, please don't worry about that. I couldn't take a payment from you today if you wanted. You get to pick when you start making your payments.

[After "Oh, I do?"]:

Yes. We can set the policy to start on your very next Social Security deposit day. So, nothing will come out of your account until you have your money in your hand. We are just doing the paperwork today to get you approved.`,
    nextNode: 'timing_response'
  },

  'timing_response': {
    id: 'timing_response',
    type: NODE_TYPES.DECISION,
    phase: 11,
    options: [
      { label: '✅ "If nothing comes out today, that\'s fine"', nextNode: 'application_start' },
      { label: '❌ Still can\'t proceed', nextNode: 'soft_close_schedule' }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // PHASE 12: "SEND BY MAIL" OBJECTION (23:00 - 24:00)
  // ═══════════════════════════════════════════════════════════════
  'mail_objection': {
    id: 'mail_objection',
    type: NODE_TYPES.SCRIPT,
    phase: 12,
    title: '📬 Handle "Send by Mail"',
    timestamp: '23:00 - 24:00',
    stageDirection: '[Verbatim from script: "there\'s not a brochure unless it\'s an online brochure..."]',
    script: `{first_name}, there's not a brochure unless it's an online brochure that I can email you... you don't hear just policies and things getting mailed into the mail, you get the junk mail. The application has to be completed electronically to lock in the rate.

If I mail it, by the time you get it and send it back, the rates could change or your health could change. I can read every single line to you on this phone call. I'm your eyes and ears, remember?

[After "Well, okay. My eyes aren't what they used to be anyway."]:

I'll go slow. I promise.`,
    nextNode: 'application_start'
  },

  // ═══════════════════════════════════════════════════════════════
  // OBJECTION HUB (Central Router)
  // ═══════════════════════════════════════════════════════════════
  'objection_hub': {
    id: 'objection_hub',
    type: NODE_TYPES.OBJECTION_HUB,
    title: '⚠️ Objection Handler',
    description: 'Select the objection to get the best response:',
    options: [
      { label: '💰 "Too Expensive"', nextNode: 'price_objection', stats: '39.8% occurrence, 98.9% resolution' },
      { label: '🤔 "Need to Think"', nextNode: 'think_objection', stats: '9.7% occurrence, -8.6 pts impact' },
      { label: '👨‍👩‍👧 "Talk to Family"', nextNode: 'family_objection', stats: '7.1% occurrence, CRITICAL severity' },
      { label: '🔐 "Don\'t Trust / Scam?"', nextNode: 'trust_objection', stats: '19.7% occurrence, -8.0 pts impact' },
      { label: '📄 "Already Have Coverage"', nextNode: 'already_covered_objection', stats: '7.5% occurrence' },
      { label: '📅 "Bad Timing / No Money Now"', nextNode: 'timing_objection', stats: '10.2% occurrence' },
      { label: '📬 "Send Info by Mail"', nextNode: 'mail_objection', stats: 'Common stall tactic' }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // TRIAL CLOSE
  // ═══════════════════════════════════════════════════════════════
  'trial_close': {
    id: 'trial_close',
    type: NODE_TYPES.SCRIPT,
    phase: 5,
    title: '🎯 Trial Close',
    conversionTip: {
      text: 'Trial Close: +16.89 pts lift (30.9% vs 14.0%). Get explicit verbal confirmation.',
      source: 'DEEP_ANALYSIS: trial_close_before_real_close'
    },
    script: `Is that something that you would be comfortable with, that {premium} a month?

[Wait for explicit "YES"]`,
    nextNode: 'trial_close_response'
  },

  'trial_close_response': {
    id: 'trial_close_response',
    type: NODE_TYPES.DECISION,
    phase: 5,
    options: [
      { label: '✅ Explicit "Yes" / "Yeah, I can do that"', nextNode: 'application_start' },
      { label: '😐 Hesitant "I think so..."', nextNode: 'clarify_hesitation' },
      { label: '❌ Objection', nextNode: 'objection_hub' }
    ]
  },

  'clarify_hesitation': {
    id: 'clarify_hesitation',
    type: NODE_TYPES.SCRIPT,
    phase: 5,
    title: 'Clarify Hesitation',
    script: `{first_name}, I'm sensing a little hesitation. What's on your mind? Is it the monthly amount, or is there something else?`,
    nextNode: 'objection_hub'
  },

  // ═══════════════════════════════════════════════════════════════
  // PHASE 13: APPLICATION DATA COLLECTION (24:00 - 28:00)
  // ═══════════════════════════════════════════════════════════════
  'application_start': {
    id: 'application_start',
    type: NODE_TYPES.SCRIPT,
    phase: 13,
    title: '📝 Start Application',
    timestamp: '24:00 - 28:00',
    conversionTip: {
      text: 'Assumptive Transition: "So, let me start this application..." (+30.56 pts)',
      source: 'DEEP_ANALYSIS: assumptive_close'
    },
    script: `So, let me start this application for you. I have your name as {first_name} {last_name}. And that address in {city}... what was the house number and street again?

[After "425 Maple Street"]:

425 Maple Street. Is there an apartment number?

[After "No, it's a house"]:

And the zip code there?`,
    nextNode: 'collect_ssn'
  },

  'collect_ssn': {
    id: 'collect_ssn',
    type: NODE_TYPES.SCRIPT,
    phase: 13,
    title: '🔢 Collect SSN',
    conversionTip: {
      text: '"As I type it, it turns into X\'s on my screen. I can\'t see it once I enter it."',
      source: 'DEEP_ANALYSIS: trust power phrase verbatim'
    },
    script: `Now, {first_name}, this part is for the background check to verify your identity. I need your Social Security number. And before you say it, I want you to know—as I type it, it turns into X's on my screen. I can't see it once I enter it. Go ahead when you're ready.

[After "Let me find my card... Okay, it's 2-4-5..."]:

2-4-5...

[After they complete it]:

Thank you, {first_name}. I know that's the scary part, but we're past it now.`,
    nextNode: 'ssn_response'
  },

  'ssn_response': {
    id: 'ssn_response',
    type: NODE_TYPES.DECISION,
    phase: 13,
    options: [
      { label: '✅ Provides SSN', nextNode: 'collect_beneficiary_details' },
      { label: '🔐 Hesitant about SSN', nextNode: 'trust_objection' }
    ]
  },

  'collect_beneficiary_details': {
    id: 'collect_beneficiary_details',
    type: NODE_TYPES.SCRIPT,
    phase: 13,
    title: '💜 Beneficiary Details',
    script: `Now, place of birth?

[After "Ohio"]:

And are you a US Citizen?

[After "Yes, born and raised"]:

Excellent. Now, for the beneficiary. We said {beneficiary}. What is her last name?

[After they provide it]:

And is she your daughter?

Do you happen to know {beneficiary}'s phone number? It's optional, but good to have just in case they can't reach you.`,
    nextNode: 'banking_transition'
  },

  // ═══════════════════════════════════════════════════════════════
  // PHASE 14: BANKING COLLECTION (28:00 - 30:00)
  // ═══════════════════════════════════════════════════════════════
  'banking_transition': {
    id: 'banking_transition',
    type: NODE_TYPES.SCRIPT,
    phase: 14,
    title: '💳 Banking Transition',
    timestamp: '28:00 - 30:00',
    conversionTip: {
      text: '🔥🔥 SMOOTH TRANSITION: +37.31 pts lift (49.7% vs 12.4%). NORMALIZED ASK: +37.73 pts lift (45.9% vs 8.1%)',
      source: 'DEEP_ANALYSIS: smooth_transition, normalized_the_ask - TOP 3 TECHNIQUES'
    },
    stageDirection: '[CRITICAL: DO NOT PAUSE OR CHANGE TONE. Treat this as routine.]',
    script: `We are almost done, {first_name}. You are doing great.

Now, we set the payment to come out on the {ss_day} to match your Social Security.

Now, would you be paying for the coverage through automatic bank draft like most people?`,
    nextNode: 'banking_method'
  },

  'banking_method': {
    id: 'banking_method',
    type: NODE_TYPES.DECISION,
    phase: 14,
    title: 'Banking Method',
    options: [
      { label: '🏦 "Yes, that\'s how I pay my electric bill"', nextNode: 'collect_bank_draft' },
      { label: '💳 Credit/Debit Card', nextNode: 'collect_card' },
      { label: '❌ "I don\'t give that out"', nextNode: 'banking_objection' }
    ]
  },

  'collect_bank_draft': {
    id: 'collect_bank_draft',
    type: NODE_TYPES.SCRIPT,
    phase: 14,
    title: '🏦 Collect Bank Info',
    conversionTip: {
      text: 'Guide them through checkbook: "Bottom left-hand corner... 9-digit number... usually starts with 0, 1, or 2"',
      source: 'FULL_31MIN_SCRIPT verbatim'
    },
    script: `Perfect. It's the safest way. And who do you bank with?

[After "Fifth Third Bank"]:

Fifth Third. Okay. Now, in order to process your application, we do have to put on file a traditional bank routing and account number. Do you have your checkbook handy, or maybe a bank statement?

[After "I have my checkbook right here"]:

Great. Open that up for me. On the bottom left-hand corner, there is a 9-digit number. It usually starts with a 0 or a 1 or a 2. Can you read that routing number to me?

[After they read routing]:

Okay, that pulls up Fifth Third Bank Ohio. Perfect.

Now, right next to that is the account number. How many numbers is that one?

[After they read account number]:

And is this a checking or savings account?`,
    nextNode: 'banking_confirmation'
  },

  'collect_card': {
    id: 'collect_card',
    type: NODE_TYPES.SCRIPT,
    phase: 14,
    title: '💳 Collect Card Info',
    script: `No problem. What type of card—Visa, Mastercard, Discover?

Can you read me the 16-digit number on the front?

And the expiration date?

And the 3-digit security code on the back?`,
    nextNode: 'banking_confirmation'
  },

  'banking_objection': {
    id: 'banking_objection',
    type: NODE_TYPES.SCRIPT,
    phase: 14,
    title: '🔐 Banking Objection',
    conversionTip: {
      text: 'Verbatim successful response: "It\'s just like setting up Netflix or a utility bill."',
      source: 'DEEP_ANALYSIS: DISTRUST_PRIVACY objection handling'
    },
    script: `I understand completely. We don't actually take the payment today. The insurance company just requires the routing and account number to verify you have an active account so they can approve the policy. It's just like setting up Netflix or a utility bill.

And just to confirm again, {first_name}, I am setting the first draft date for the {ss_day}. Not a penny comes out today. This is just to get the approval.`,
    nextNode: 'banking_method'
  },

  'banking_confirmation': {
    id: 'banking_confirmation',
    type: NODE_TYPES.SCRIPT,
    phase: 14,
    title: '✅ Banking Confirmed',
    script: `Excellent. And just to confirm again, {first_name}, I am setting the first draft date for the {ss_day}. Not a penny comes out today. This is just to get the approval.

[After "Okay, good. Because I need to buy groceries this week."]:

I completely understand. You are all set.`,
    nextNode: 'summary_close'
  },

  // ═══════════════════════════════════════════════════════════════
  // PHASE 15: SUMMARY CLOSE & AUTHORIZATION (30:00 - 31:00)
  // ═══════════════════════════════════════════════════════════════
  'summary_close': {
    id: 'summary_close',
    type: NODE_TYPES.SCRIPT,
    phase: 15,
    title: '🔥 SUMMARY CLOSE',
    timestamp: '30:00 - 31:00',
    conversionTip: {
      text: '🔥🔥🔥 SUMMARY CLOSE = +43.77 pts lift (66.9% vs 23.1%). This is THE MOST POWERFUL technique. NEVER skip.',
      source: 'DEEP_ANALYSIS: summary_close - #1 RANKED TECHNIQUE'
    },
    stageDirection: '[CRITICAL: Recap EVERYTHING before final ask]',
    script: `So, let me recap. We are submitting an application to {carrier} for **{coverage_amount}** of Whole Life coverage. Your monthly premium is **{premium}**. Your beneficiary is your daughter, **{beneficiary}**. And your start date is the **{ss_day}**.

Does that all sound correct?

[After "That sounds right."]:`,
    nextNode: 'authorization'
  },

  'authorization': {
    id: 'authorization',
    type: NODE_TYPES.SCRIPT,
    phase: 15,
    title: '🖊️ Authorization',
    conversionTip: {
      text: 'Wait for EXPLICIT "Yes" (+25.29 pts lift, 35.9% vs 10.6%)',
      source: 'DEEP_ANALYSIS: waited_for_explicit_yes'
    },
    script: `{first_name}, do you authorize that we submit this application to the carrier for the face amount of {coverage_amount}?

[Wait for clear "Yes, I do."]

Perfect. I need to do a quick voice signature. I'm going to turn on a recorder. I need you to state your full name and say "I agree."

[After "{first_name} {last_name}. I agree."]:

Thank you, {first_name}.`,
    nextNode: 'congratulations'
  },

  'congratulations': {
    id: 'congratulations',
    type: NODE_TYPES.CLOSE,
    phase: 15,
    title: '🎉 Congratulations!',
    script: `Congratulations! You have taken a huge step today. You've done a wonderful thing for {beneficiary}. She is going to be so relieved.

[After "I hope so. I feel better having it done."]:

You should. Now, you will receive your policy in the mail in about 7 to 10 days. I'm going to text you my direct number again. If you have any questions, or if {beneficiary} has questions, you call me directly, okay?

{first_name}, you stay warm in {city}, okay?

Goodbye!`,
    nextNode: null
  },

  // ═══════════════════════════════════════════════════════════════
  // SOFT CLOSE (For callbacks)
  // ═══════════════════════════════════════════════════════════════
  'soft_close_schedule': {
    id: 'soft_close_schedule',
    type: NODE_TYPES.SCRIPT,
    phase: 15,
    title: '📅 Schedule Callback',
    script: `I understand, {first_name}. I don't want to pressure you. When would be a good time to call you back—tomorrow afternoon, or would an evening work better?

I'm going to put this in my calendar. And {first_name}, I want you to know that the rate I quoted you today is based on your current age and health. If anything changes, the rate will go up. So keep that in mind.

I'll talk to you soon. Take care.`,
    nextNode: null
  }
};

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

export const getNode = (nodeId) => SCRIPT_NODES[nodeId] || null;
export const getStartNode = () => SCRIPT_NODES['transfer_opening'];

export const populateDynamicFields = (text, prospectData) => {
  if (!text || !prospectData) return text || '';
  
  const fieldMappings = {
    '{first_name}': prospectData.first_name || prospectData.firstName || '[Name]',
    '{last_name}': prospectData.last_name || prospectData.lastName || '[Last Name]',
    '{state}': prospectData.state || '[State]',
    '{city}': prospectData.city || '[City]',
    '{age}': prospectData.age || '[Age]',
    '{beneficiary}': prospectData.beneficiary || prospectData.primaryBenName || '[Beneficiary]',
    '{carrier}': prospectData.carrier || '[Carrier]',
    '{coverage_amount}': prospectData.faceAmount 
      ? `$${Number(prospectData.faceAmount).toLocaleString()}` 
      : '$[Coverage]',
    '{premium}': prospectData.monthlyPremium || prospectData.premium || '$[Premium]',
    '{premium_high}': prospectData.premiumHigh || '$[High]',
    '{premium_mid}': prospectData.premiumMid || '$[Mid]',
    '{premium_low}': prospectData.premiumLow || '$[Low]',
    '{premium_min}': prospectData.premiumMin || '$[Min]',
    '{ss_day}': prospectData.draftDate || prospectData.ssPaymentDay || '[SS Day]'
  };
  
  let result = text;
  for (const [placeholder, value] of Object.entries(fieldMappings)) {
    result = result.replace(new RegExp(placeholder.replace(/[{}$]/g, '\\$&'), 'g'), value);
  }
  
  return result;
};

export const getPhaseInfo = (nodeId) => {
  const node = getNode(nodeId);
  return { phase: node?.phase || 1, total: 15 };
};

export default SCRIPT_NODES;
