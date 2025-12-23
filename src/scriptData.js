// Script Data for Live Transfer and PreClosed Deal Scripts
// Contains all phases, scripts, and objection handlers

/**
 * DYNAMIC FIELD PLACEHOLDERS
 * These placeholders in the script text will be replaced with actual prospect data:
 * - {first_name} - Prospect's first name
 * - {last_name} - Prospect's last name
 * - {state} - Prospect's state
 * - {city} - Prospect's city
 * - {age} - Prospect's age
 * - {beneficiary} - Beneficiary name
 * - {coverage_amount} - Requested coverage amount
 * - {premium} - Monthly premium
 * - {carrier} - Insurance carrier name
 */

// ============================================================================
// LIVE TRANSFER SCRIPT
// ============================================================================

export const LIVE_TRANSFER_SCRIPT = {
  id: 'live_transfer',
  title: 'AmerBen LIVE Transfer',
  phases: [
    {
      id: 'setup',
      title: 'Setup',
      icon: '🎯',
      content: {
        type: 'setup',
        heading: 'Select Transfer Type',
        description: 'Choose how the call was transferred to you to get the appropriate opening script.',
        options: [
          { id: 'blind', label: 'Blind Transfer', description: 'Fronter drops off immediately', icon: '📞' },
          { id: 'warm', label: 'Warm Transfer', description: 'Fronter introduces you', icon: '👤' }
        ],
        alert: {
          type: 'danger',
          title: 'Forbidden Phrases',
          text: 'NEVER say "How are you?" or "How may I help you?"'
        }
      }
    },
    {
      id: 'opening',
      title: 'Opening',
      icon: '📞',
      content: {
        type: 'scripts',
        heading: 'The Opening',
        scripts: [
          {
            id: 'blind',
            variant: 'blind',
            title: '📞 Blind Transfer Script',
            text: `(Fronter connects call...)

"Hi, this is [Your Name]. Whom do I have the pleasure of speaking with?"

[WAIT FOR NAME. Do not ask to spell it.]

"Pleasure to meet you, {first_name}. I appreciate you holding. The previous agent just transferred you to me because I'm the local licensed specialist for {state}. They mentioned you're {age} and living in {city}, right?"

"Okay, great. Now {first_name}, I know you didn't wake up this morning expecting to hear from me—we called you. But since I have you on the line, my job is pretty simple — I'll ask you a few quick questions, show you exactly what you qualify for, and then you decide if it makes sense. Fair enough?"`
          },
          {
            id: 'warm',
            variant: 'warm',
            title: '👤 Warm Transfer Script',
            text: `(To Fronter):

"Thanks [Fronter Name], I see the file here. I'll take it from here."

(To Prospect):

"Hi {first_name}, this is [Your Name], the licensed specialist for {state}. I appreciate your patience while they got us connected. [Fronter Name] got me up to speed—they mentioned you're {age} and looking to make sure the family isn't stuck with a bill, is that right?"

"Perfect. Like I said, I'm the specialist for the area. My job is simple—I'll ask a few quick questions to see if you qualify for the state-regulated benefits. If you do, I'll show you the numbers. If not, I'll tell you that too. Fair enough?"`
          }
        ]
      }
    },
    {
      id: 'discovery',
      title: 'Discovery',
      icon: '🔍',
      content: {
        type: 'scripts',
        heading: 'Discovery',
        scripts: [
          {
            id: 'motivation',
            title: '🎯 Motivation Check',
            text: `"Great. So {first_name}, when you were speaking with the other agent, you mentioned you wanted to make sure your family isn't stuck dealing with any final expenses when that time comes. Is that still the main thing on your mind, or is there something else driving this for you?"

(Listen to response)

"I appreciate you sharing that. You know, a lot of the folks I talk to—they're not worried about themselves. They've lived their life. What keeps them up at night is the thought of their kids or grandkids having to scramble to come up with $10,000 or $15,000 just to lay them to rest properly. Does that resonate with you at all?"`
          },
          {
            id: 'beneficiary',
            title: '💔 Identify the Beneficiary',
            text: `"Perfect. So, If you didn't wake up tomorrow morning... who is the one person that would have to pick up the phone and handle everything?"

(Wait for name, e.g., '{beneficiary}')

"{beneficiary}. Okay. Now, {first_name}, most people don't realize that funeral homes are businesses. They generally require the full $10,000 to $15,000 upfront before they will even open the doors."`
          },
          {
            id: 'pain',
            title: '⚡ The Pain Question',
            style: 'critical',
            text: `"Knowing {beneficiary}'s financial situation... is she in a position to write a check that big on a Tuesday morning?"

(Wait for 'No')

"Ok. {beneficiary} would have to come up with that money somehow. How would that affect her? Would she have to borrow it? Go into debt?"`
          },
          {
            id: 'bridge',
            title: '🌉 The Bridge',
            style: 'success',
            text: `"That's exactly why we're talking. We want to make sure {beneficiary} gets a check, not a bill. My goal is to set this up so she never has to worry about the money. Does that sound like what you want to accomplish?"`
          }
        ]
      }
    },
    {
      id: 'health',
      title: 'Health',
      icon: '🏥',
      content: {
        type: 'mixed',
        heading: 'Health Discovery',
        items: [
          {
            type: 'script',
            id: 'intro',
            title: '🏥 Health Questions Intro',
            text: `"Alright, so here's what I want to do. I'm going to ask you a few quick health questions—nothing invasive—just so I can match you with the right program and make sure you're not overpaying. Sound good?"`
          },
          {
            type: 'checklist',
            id: 'health_checklist',
            title: '✅ Health Checklist',
            items: [
              '"Are you currently taking any medications for your heart—like blood thinners, or anything for cholesterol or blood pressure?"',
              '"Any history of cancer, stroke, or diabetes?"',
              '"Have you been hospitalized for anything in the last two years?"',
              '"Do you use any oxygen equipment or have any issues with your lungs?"',
              '"Do you smoke or use tobacco?"'
            ]
          },
          {
            type: 'script',
            id: 'value_stack',
            title: '✨ Value Stack',
            style: 'success',
            text: `"Good news, {first_name}—you qualify for our [Plan Tier] program. This is whole life insurance—not term. That means:"

• Rate locked in forever • Benefit guaranteed, tax-free, 24-48 hours • Day One coverage, no waiting period`
          }
        ]
      }
    },
    {
      id: 'mandate',
      title: 'Mandate',
      icon: '📊',
      content: {
        type: 'scripts',
        heading: 'The Mandate',
        scripts: [
          {
            id: 'budget',
            title: '📊 Budget Anchor',
            text: `"Okay. Based on what you've told me, I'm going to run a comparison across the top state-approved carriers. I'm filtering strictly for the 'Rate Lock' programs."

"Most folks on a fixed income tell me they want to keep this between $50 and $80 a month."`
          },
          {
            id: 'takeaway',
            title: '🎯 The Takeaway (CRUCIAL)',
            style: 'warning',
            highlight: true,
            text: `"If I find the right plan but it comes back at $150 a month, are you going to kick me off the phone?"

(Wait for laugh/agreement)

"I figured. Let me pull the numbers now. Hold on."`
          }
        ],
        footer: {
          type: 'loading',
          text: 'Silence for 10-15 seconds (Actually quote)'
        }
      }
    },
    {
      id: 'verdict',
      title: 'Verdict',
      icon: '⚖️',
      content: {
        type: 'scripts',
        heading: 'The Verdict',
        scripts: [
          {
            id: 'verdict_delivery',
            title: '⚖️ Verdict Delivery',
            style: 'success',
            text: `"Alright, I've got good news for you. Based on everything you've shared, I found a program that fits exactly what you're looking for."

"Looking at {carrier}, I can get you set up with {coverage_amount} in coverage at {premium} a month."

"Now, tell me—is {beneficiary} worth that kind of protection?"

[Wait for response]`
          }
        ]
      }
    },
    {
      id: 'presentation',
      title: 'Presentation',
      icon: '💎',
      content: {
        type: 'mixed',
        heading: 'Presentation',
        items: [
          {
            type: 'keypoint',
            label: '🎯 The Goldilocks Method',
            text: 'Present 3 options: High (anchor), Medium (target), Low (floor)'
          },
          {
            type: 'options',
            options: [
              { title: '💎 Premium Option', coverage: '$20,000', price: '~$95/month', note: '"Covers everything plus extra"', style: 'warning' },
              { title: '✅ Recommended', coverage: '$15,000', price: '~$70/month', note: '"Most popular - covers a proper burial"', style: 'success' },
              { title: '📦 Basic Option', coverage: '$10,000', price: '~$45/month', note: '"Takes biggest burden off shoulders"', style: 'default' }
            ]
          },
          {
            type: 'script',
            id: 'goldilocks',
            title: '💬 Goldilocks Script',
            text: `"Okay {first_name}, I've got three options:"

• $20,000 — covers everything + extra for {beneficiary} — ~$95/mo
• $15,000 — funeral, casket, flowers, everything — ~$70/mo ← MOST POPULAR
• $10,000 — takes biggest burden off shoulders — ~$45/mo

"Which one sounds right for you?"`
          }
        ]
      }
    },
    {
      id: 'close',
      title: 'Close',
      icon: '🎉',
      content: {
        type: 'scripts',
        heading: 'The Close',
        scripts: [
          {
            id: 'application',
            title: '📝 Application Transition',
            text: `"Perfect. Let's go ahead and get this locked in for you today. I just need to gather a few pieces of information to finalize the application."

"First, can you verify your date of birth for me?"

(Collect: Full name, DOB, SSN, Address, Payment info)`
          },
          {
            id: 'confirmation',
            title: '🎉 Final Confirmation',
            style: 'success',
            text: `"Alright {first_name}, you're all set! Here's what you've got:"

• {coverage_amount} of whole life coverage
• Beneficiary: {beneficiary}
• Monthly payment: {premium} on the [Date] of each month

"You'll receive your policy in the mail within 7-10 business days. My information will be included. Congratulations—you just did something really important for {beneficiary}."`
          }
        ],
        footer: {
          type: 'complete',
          text: '🎉 CALL COMPLETE'
        }
      }
    }
  ],
  objections: [
    {
      id: 'expensive',
      label: "It's too expensive",
      response: `"I totally understand. Most of our clients are on a fixed income, so we have to be careful. But let me ask you—is it that you can't afford the $XX right now, or is it that you're just not sure if it's worth that amount?"`
    },
    {
      id: 'think',
      label: 'I need to think about it',
      response: `"That's fair. But let me ask—what specifically is it that you need to think over? Is it the monthly amount, or is it who you want to leave the money to? Usually when folks tell me that, it's just the price."`
    },
    {
      id: 'kids',
      label: 'I need to talk to my kids',
      response: `"I get that. But let me ask—if you told them you were buying this to protect them from a $15,000 bill, would they tell you NOT to do it? This is for them, not you. You're the one protecting them."`
    },
    {
      id: 'mail',
      label: 'Send me info by mail',
      response: `"I wish I could, but these rates are state-regulated and change based on your exact age and health as of today. If I mail you something, it'll be wrong by the time you get it. My job is just to show you the accurate math right now. It takes 2 minutes."`
    }
  ]
};

// ============================================================================
// PRECLOSED DEAL SCRIPT
// ============================================================================

export const PRECLOSED_SCRIPT = {
  id: 'preclosed',
  title: 'AmerBen PRE-CLOSE',
  phases: [
    {
      id: 'setup',
      title: 'Getting Started',
      icon: '🎯',
      content: {
        type: 'setup',
        heading: 'Pre-Closed Application Guide',
        description: "The sale is already made. Your job is to finish it—not lose it. This guide will walk you through completing the application efficiently.",
        alert: {
          type: 'danger',
          title: 'The #1 Way Agents Kill These Deals',
          text: 'Starting over. The customer just spent 15-20 minutes with your call center. If you say "So tell me, what made you interested in final expense today?"—the deal is DEAD.'
        }
      }
    },
    {
      id: 'pickup',
      title: 'The Pickup',
      icon: '📞',
      content: {
        type: 'scripts',
        heading: 'Phase 1: The Pickup',
        scripts: [
          {
            id: 'standard_opening',
            title: '💬 Standard Opening Script',
            text: `"Hi, {first_name}?"

[Wait for yes]

"Hey {first_name}, this is [Your Name]—I'm the licensed agent that's going to help you finish up today."

"My team has already filled me in on everything, so this should only take a few minutes."

"Sound good?"`
          }
        ],
        tips: [
          { label: '"Finish up today"', effect: "We're almost done" },
          { label: '"Already filled me in"', effect: 'No repeating' },
          { label: '"Only a few minutes"', effect: 'Quick process' }
        ]
      }
    },
    {
      id: 'confirm',
      title: 'Confirm Details',
      icon: '✓',
      content: {
        type: 'scripts',
        heading: 'Phase 2: Confirm the Details',
        scripts: [
          {
            id: 'coverage',
            title: '✓ Coverage Confirmation',
            text: `"Alright, so I've got you down for {coverage_amount} of coverage with {carrier}, coming out to {premium} a month."

"That's what you discussed with my team, correct?"

[Wait for yes]`
          },
          {
            id: 'beneficiary',
            title: '👤 Beneficiary Confirmation',
            text: `"And I have {beneficiary} listed as your beneficiary—that's your [relationship], right?"

[Wait for yes]`
          }
        ],
        tips: [
          { label: "If Something Doesn't Match", effect: '"Okay, no problem—let me update that. So it should be [correct information], right?" Fix it and move on. Don\'t make it a big deal.' }
        ]
      }
    },
    {
      id: 'application',
      title: 'Application',
      icon: '📝',
      content: {
        type: 'scripts',
        heading: 'Phase 3: The Application',
        alert: {
          type: 'warning',
          title: 'Compliance',
          text: 'MUST ask health questions directly—call center answers don\'t count.'
        },
        scripts: [
          {
            id: 'transition_health',
            title: '📝 Application & Health Questions',
            text: `"Perfect. Now I just need to walk you through the application. Most of this I already have."

ASK EACH QUESTION:
☐ Tobacco/nicotine in past 12 months?
☐ Confined to hospital/nursing home/assisted living?
☐ Cancer, heart disease, stroke, kidney disease in past 2 years?
☐ HIV/AIDS diagnosis?
☐ Currently taking prescription medications? [If YES, document]`
          }
        ]
      }
    },
    {
      id: 'payment',
      title: 'Payment Setup',
      icon: '💳',
      content: {
        type: 'mixed',
        heading: 'Phase 4: Payment Setup',
        items: [
          {
            type: 'grid',
            cards: [
              {
                title: 'For Bank Draft',
                items: ['1. Routing number (9-digit)', '2. Account number', '3. Name on the account']
              },
              {
                title: 'For Credit/Debit Card',
                style: 'warning',
                items: ['1. Card number', '2. Expiration date', '3. Security code (back)', '4. Billing zip code']
              }
            ]
          },
          {
            type: 'script',
            id: 'payment_date',
            title: '📅 Payment Date Script',
            text: `"What day of the month does your social security check arrive?"

[Wait for answer]

"Okay. Your first payment will come when this application is approved and your future monthly payments will come out on the [date check arrives], okay?"`
          }
        ]
      }
    },
    {
      id: 'disclosures',
      title: 'Disclosures',
      icon: '📜',
      content: {
        type: 'scripts',
        heading: 'Phase 5: Disclosures & Authorization',
        alert: {
          type: 'danger',
          title: 'Critical Compliance Requirement',
          text: 'Read disclosures EXACTLY as required by your carrier. Do not paraphrase. Do not skip.'
        },
        scripts: [
          {
            id: 'authorization',
            title: '📜 Authorization Script',
            text: `"Perfect. Now to complete this application, I need your verbal authorization."

"By saying 'Yes, I agree,' you are authorizing {carrier} to issue this policy, confirming that all the information you've provided is accurate to the best of your knowledge, and authorizing the payment of {premium} per month from your [bank account/card]."

"{first_name}, do you agree?"

[Wait for clear "Yes" or "I agree"]

"Thank you. For our records, I'm noting that {first_name} {last_name} provided verbal authorization on [Today's Date] at [Time]."`
          }
        ]
      }
    },
    {
      id: 'wrapup',
      title: 'Wrap-Up',
      icon: '🎉',
      content: {
        type: 'scripts',
        heading: 'Phase 6: Wrap-Up',
        scripts: [
          {
            id: 'closing',
            title: '🎉 Closing Script',
            style: 'success',
            text: `"Alright {first_name}, you are all set!"

"Let me confirm what you're getting:

• {coverage_amount} of permanent whole life coverage with {carrier}
• Your beneficiary is {beneficiary}
• Your monthly payment is {premium}, coming out on the [Date] of each month"

"Does everything sound correct?"

[Wait for confirmation]

"You'll receive your policy documents in the mail within [7-10 business days]. When you get them, look them over. If you have any questions, my contact information will be included."

"{first_name}, congratulations. You just did something really important for {beneficiary}. A lot of people talk about doing this but never follow through. You actually got it done."`
          }
        ]
      }
    },
    {
      id: 'compliance',
      title: 'Compliance',
      icon: '✓',
      content: {
        type: 'compliance',
        heading: 'Compliance Checklist',
        mustDo: [
          'Read all required disclosures exactly as written',
          'Document verbal authorization with date and time',
          'Verify identity (SSN, DOB)',
          'Ask ALL health questions directly',
          'Explain the free look period'
        ],
        mustNot: [
          'Skip health questions because "call center asked them"',
          'Promise specific payout timing',
          'Say "guaranteed" without proper qualification',
          'Continue if customer clearly wants to stop',
          'Misrepresent coverage or benefits'
        ],
        goldenRule: "The application call isn't where you win the sale—it's where you don't lose it.",
        footer: {
          type: 'complete',
          text: '🎉 APPLICATION GUIDE COMPLETE'
        }
      }
    }
  ],
  objections: [
    {
      id: 'confused',
      label: 'Customer Confused',
      response: `"I know you've already been through a lot of questions—I apologize if this feels repetitive. The reason I'm asking again is because this is the official application that goes to {carrier}. I need to document everything directly. We're almost done—just a few more things."`
    },
    {
      id: 'second_thoughts',
      label: 'Second Thoughts',
      response: `"I understand, {first_name}. This is an important decision. Let me ask you—what specifically is giving you pause? Is it the coverage amount, the monthly payment, or something else?" [Address their specific concern]`
    },
    {
      id: 'legitimacy',
      label: 'Questions Legitimacy',
      response: `"That's a fair question—you should always be careful. {carrier} has been around for [X years]. They're A-rated, licensed in all 50 states, and have paid out billions in claims. After you receive your policy, you can call them directly to verify everything. And remember—you have a 30-day free look period."`
    },
    {
      id: 'change_coverage',
      label: 'Wants to Change Coverage',
      response: `"Absolutely, we can adjust that. Let me see what the premium would be for $[New Amount]... Okay, so $[New Amount] would be $[New Premium] per month. Would you like to go with that instead?"`
    }
  ]
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get script by type
 * @param {'live_transfer' | 'preclosed'} scriptType
 * @returns {Object} The script data object
 */
export const getScriptByType = (scriptType) => {
  return scriptType === 'preclosed' ? PRECLOSED_SCRIPT : LIVE_TRANSFER_SCRIPT;
};

/**
 * Replace dynamic placeholders in text with prospect data
 * @param {string} text - Text with placeholders like {first_name}
 * @param {Object} prospectData - Prospect data object
 * @returns {string} Text with placeholders replaced
 */
export const populateDynamicFields = (text, prospectData) => {
  if (!text || !prospectData) return text;
  
  const fieldMappings = {
    '{first_name}': prospectData.first_name || prospectData.firstName || '[Name]',
    '{last_name}': prospectData.last_name || prospectData.lastName || '[Last Name]',
    '{state}': prospectData.state || '[State]',
    '{city}': prospectData.city || '[City]',
    '{age}': prospectData.age || '[Age]',
    '{beneficiary}': prospectData.beneficiary || prospectData.primaryBenName || '[Beneficiary Name]',
    '{carrier}': prospectData.carrier || '[Carrier Name]',
    '{coverage_amount}': prospectData.faceAmount 
      ? `$${Number(prospectData.faceAmount).toLocaleString()}` 
      : prospectData.coverage_amount 
        ? `$${Number(prospectData.coverage_amount).toLocaleString()}`
        : '$[Coverage Amount]',
    '{premium}': prospectData.monthlyPremium || prospectData.premium || '$[Premium]'
  };
  
  let result = text;
  for (const [placeholder, value] of Object.entries(fieldMappings)) {
    result = result.replace(new RegExp(placeholder.replace(/[{}$]/g, '\\$&'), 'g'), value);
  }
  
  return result;
};
