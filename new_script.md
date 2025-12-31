{
  "metadata": {
    "title": "THE GOLDEN PATH: COMPLETE 31-MINUTE SALES SCRIPT",
    "source": "Reverse-Engineered from 624 Successful Final Expense Sales",
    "executive_summary": {
      "total_sales_analyzed": 624,
      "average_call_duration": "35 minutes 58 seconds",
      "total_script_sections": 12,
      "common_denominator_sequence_count": 14,
      "script_adherence_success_rate": 93.4
    },
    "duration_proof": {
      "shortest_successful_call": "15:11",
      "longest_successful_call": "116:22",
      "average_end_time": "35:58",
      "timestamp_averages": {
        "qualification_ended": "5:57",
        "health_questions_started": "4:40",
        "presentation_started": "7:33",
        "pricing_presented": "9:08",
        "close_attempted": "10:46",
        "ssn_collected": "15:30",
        "banking_collected": "18:51"
      }
    },
    "winning_sequence_at_a_glance": [
      {"phase": "The Trust Anchor (Greeting)", "timing": "0:00 - 0:45"},
      {"phase": "The Emotional Excavation (Discovery)", "timing": "0:45 - 4:40"},
      {"phase": "The Eligibility Pivot (Health)", "timing": "4:40 - 7:30"},
      {"phase": "The Value Bridge (Education)", "timing": "7:30 - 9:00"},
      {"phase": "The Option Selection (Pricing)", "timing": "9:00 - 10:45"},
      {"phase": "The Commitment Seal (Close)", "timing": "10:45 - 12:00"},
      {"phase": "The Identity Lock (SSN)", "timing": "12:00 - 15:30"},
      {"phase": "The Financial Disarm (Banking)", "timing": "15:30 - 19:00"},
      {"phase": "The Victory Lap (Confirmation)", "timing": "19:00 - 35:58"}
    ]
  },
  "script_phases": {
    "phase_1_greeting": {
      "phase_name": "The Trust Anchor",
      "timing": "0:00 - 0:45",
      "data_source": "opening_approach.dove_straight_in (+7.1%), opening_approach.used_authority_title (+0.9%)",
      "nodes": {
        "greeting_start": {
          "text": "Hello, this is {agent_name}, the licensed field underwriter for the state of {state}.",
          "original_verbatim": "Hello, this is John, the licensed field underwriter for the state of Texas.",
          "type": "statement",
          "data_proof": "+7.1% lift (dove_straight_in), +0.9% (authority_title)",
          "options": {
            "next": "verify_identity"
          }
        },
        "verify_identity": {
          "text": "I have you listed here as {first_name} {last_name}, residing in {state}, is that correct?",
          "type": "verification_question",
          "data_proof": "+4.1% lift (full_name)",
          "options": {
            "yes": "verify_age",
            "no": "correct_info"
          }
        },
        "correct_info": {
          "text": "My apologies, let me update my file. What is the correct spelling of your name?",
          "type": "data_collection",
          "capture_variable": "first_name",
          "options": {
            "next": "verify_age"
          }
        },
        "verify_age": {
          "text": "And I have your date of birth listed as {dob}, making you {age} years young, correct?",
          "type": "verification_question",
          "data_proof": "+4.3% lift (controlled_conversation)",
          "options": {
            "yes": "purpose_statement",
            "no": "correct_age"
          }
        },
        "correct_age": {
          "text": "Let me correct that. What is your actual date of birth?",
          "type": "data_collection",
          "capture_variable": "age",
          "options": {
            "next": "purpose_statement"
          }
        },
        "purpose_statement": {
          "text": "Perfect. My job today is simple: as a state-regulated broker, I'm required to verify your information and see if you qualify for the state-approved final expense programs. Fair enough?",
          "type": "statement",
          "data_proof": "+11.7% lift (tie_downs), +1.02% (authority_title)",
          "options": {
            "fair_enough": "transition_to_discovery",
            "what_is_this": "explain_program"
          }
        },
        "explain_program": {
          "text": "This is regarding the final expense benefits designed to cover burial and cremation costs so your family isn't left with a bill. I just need to ask a few questions to see what you qualify for.",
          "type": "objection_handler",
          "options": {
            "next": "transition_to_discovery"
          }
        }
      }
    },
    "phase_1_5_discovery_rapport": {
      "phase_name": "The Emotional Excavation",
      "timing": "0:45 - 4:40",
      "data_source": "needs_analysis.beneficiary_discussed (+12.7%), needs_analysis.motivation_extracted (+6.3%)",
      "nodes": {
        "transition_to_discovery": {
          "text": "Now {first_name}, before we look at the numbers, I need to understand who we are protecting today. If something were to happen to you yesterday, who would be the person responsible for handling your arrangements?",
          "type": "question",
          "data_proof": "+12.7% lift (beneficiary_discussed)",
          "options": {
            "child": "beneficiary_child",
            "spouse": "beneficiary_spouse",
            "sibling": "beneficiary_sibling",
            "nobody": "beneficiary_nobody"
          }
        },
        "beneficiary_child": {
          "text": "Okay, and what is your {beneficiary_relationship}'s name?",
          "type": "data_collection",
          "capture_variable": "beneficiary",
          "options": {
            "next": "beneficiary_location"
          }
        },
        "beneficiary_spouse": {
          "text": "Okay, and what is your spouse's name?",
          "type": "data_collection",
          "capture_variable": "beneficiary",
          "options": {
            "next": "beneficiary_location"
          }
        },
        "beneficiary_location": {
          "text": "Does {beneficiary} live close by to you in {state}, or are they in a different state?",
          "type": "rapport_question",
          "data_proof": "+5.9% lift (showed_genuine_interest)",
          "options": {
            "close": "beneficiary_awareness",
            "far": "beneficiary_awareness"
          }
        },
        "beneficiary_awareness": {
          "text": "Does {beneficiary} know that you are looking into this, or is this going to be a surprise for them?",
          "type": "question",
          "options": {
            "knows": "financial_reality",
            "surprise": "financial_reality"
          }
        },
        "financial_reality": {
          "text": "God forbid, if you passed away today, would {beneficiary} have the $10,000 to $15,000 cash on hand to pay for the funeral immediately?",
          "type": "pain_question",
          "data_proof": "+5.9% lift (mentioned_family_burden)",
          "options": {
            "no": "pain_implication",
            "yes": "why_insurance"
          }
        },
        "pain_implication": {
          "text": "I see. So if they don't have that money sitting in the bank, how would they pay for it? Would they have to borrow it, or use credit cards?",
          "type": "pain_question",
          "data_proof": "+6.3% lift (fears_identified)",
          "options": {
            "borrow_credit": "validate_concern",
            "gofundme": "validate_concern"
          }
        },
        "why_insurance": {
          "text": "That's a blessing that they have funds, but let me ask you—did you want them to use their own savings for this, or was your goal to leave them something extra?",
          "type": "clarification",
          "options": {
            "protect_savings": "validate_concern",
            "leave_extra": "validate_concern"
          }
        },
        "validate_concern": {
          "text": "I understand completely. That is exactly why we are on the phone. We want to make sure {beneficiary} never has to worry about that bill. Does that make sense?",
          "type": "tie_down",
          "data_proof": "+12.9% lift (validated_prospect_concerns)",
          "options": {
            "yes": "motivation_check"
          }
        },
        "motivation_check": {
          "text": "What got you thinking about this specifically today? Did you have a recent health scare, or a death in the family?",
          "type": "discovery_question",
          "data_proof": "+6.3% lift (motivation_extracted)",
          "options": {
            "health_scare": "empathy_pivot",
            "death_in_family": "empathy_pivot",
            "just_getting_older": "empathy_pivot",
            "tv_ad": "empathy_pivot"
          }
        },
        "empathy_pivot": {
          "text": "I appreciate you sharing that with me. It sounds like getting this taken care of is a priority for you so {beneficiary} is protected, right?",
          "type": "tie_down",
          "data_proof": "+92.9% persuasion_score correlation",
          "options": {
            "yes": "transition_to_health"
          }
        },
        "beneficiary_nobody": {
          "text": "If there is no one currently, the state would typically handle those arrangements, which can be impersonal. Is your goal to have a dignified service handled by a professional?",
          "type": "pain_question",
          "options": {
            "yes": "transition_to_health"
          }
        },
        "transition_to_health": {
          "text": "Okay {first_name}, based on what you've told me, I can definitely help. To find you the best rate, I just need to ask a few medical questions. I'll be your eyes and ears and shop all the top carriers for you. Fair enough?",
          "type": "transition",
          "data_proof": "+1.02% (authority_title)",
          "options": {
            "fair_enough": "tobacco_check"
          }
        }
      }
    },
    "phase_2_qualification_granular": {
      "phase_name": "The Eligibility Pivot",
      "timing": "4:40 - 7:30",
      "data_source": "qualification_approach.combined_questions (+10.0%), qualification_approach.controlled_conversation (+4.3%)",
      "nodes": {
        "tobacco_check": {
          "text": "First, have you used any form of tobacco or nicotine in the last 12 months, like cigarettes, cigars, or a vape?",
          "type": "qualification_question",
          "data_proof": "Standard Underwriting Requirement",
          "options": {
            "no": "height_weight",
            "yes": "tobacco_details"
          }
        },
        "tobacco_details": {
          "text": "Okay, is that cigarettes or something else?",
          "type": "data_collection",
          "capture_variable": "tobacco_type",
          "options": {
            "next": "height_weight"
          }
        },
        "height_weight": {
          "text": "And roughly, how tall are you and how much do you weigh?",
          "type": "data_collection",
          "capture_variable": "height_weight",
          "options": {
            "next": "heart_loop"
          }
        },
        "heart_loop": {
          "text": "I'm going to ask about the heart. In the past 2 years, have you had a heart attack, stroke, or congestive heart failure?",
          "type": "health_loop",
          "data_proof": "+10.0% lift (combined_questions)",
          "options": {
            "no": "respiratory_loop",
            "yes": "heart_drill_down"
          }
        },
        "heart_drill_down": {
          "text": "I see. Which one was it, and when exactly did that happen?",
          "type": "drill_down",
          "capture_variable": "heart_condition_date",
          "options": {
            "next": "respiratory_loop"
          }
        },
        "respiratory_loop": {
          "text": "Moving to the lungs—have you ever been diagnosed with COPD, emphysema, or do you use oxygen equipment to assist with breathing?",
          "type": "health_loop",
          "options": {
            "no": "diabetes_loop",
            "yes": "respiratory_drill_down"
          }
        },
        "respiratory_drill_down": {
          "text": "Okay, do you use a nebulizer or just inhalers?",
          "type": "drill_down",
          "capture_variable": "respiratory_details",
          "options": {
            "next": "diabetes_loop"
          }
        },
        "diabetes_loop": {
          "text": "Do you have diabetes or high blood sugar?",
          "type": "health_loop",
          "options": {
            "no": "major_illness_loop",
            "yes": "diabetes_drill_down"
          }
        },
        "diabetes_drill_down": {
          "text": "Do you take pills for that, or do you use insulin?",
          "type": "drill_down",
          "options": {
            "pills": "neuropathy_check",
            "insulin": "insulin_details"
          }
        },
        "insulin_details": {
          "text": "How old were you when you started the insulin, and how many units a day do you take?",
          "type": "drill_down",
          "capture_variable": "insulin_start_age",
          "options": {
            "next": "neuropathy_check"
          }
        },
        "neuropathy_check": {
          "text": "Have you ever been told you have neuropathy or nerve pain related to the diabetes?",
          "type": "drill_down",
          "options": {
            "next": "major_illness_loop"
          }
        },
        "major_illness_loop": {
          "text": "In the last 2 years, have you been treated for any internal cancer or tumors?",
          "type": "health_loop",
          "options": {
            "no": "hospital_loop",
            "yes": "cancer_drill_down"
          }
        },
        "cancer_drill_down": {
          "text": "Was that cancer free more than 2 years ago, or are you still taking medication for it?",
          "type": "drill_down",
          "capture_variable": "cancer_status",
          "options": {
            "next": "hospital_loop"
          }
        },
        "hospital_loop": {
          "text": "And finally, do you have any surgeries pending, or have you been hospitalized overnight in the last 12 months?",
          "type": "health_loop",
          "options": {
            "no": "medication_list",
            "yes": "hospital_drill_down"
          }
        },
        "hospital_drill_down": {
          "text": "What was the hospitalization for?",
          "type": "drill_down",
          "capture_variable": "hospital_reason",
          "options": {
            "next": "medication_list"
          }
        },
        "medication_list": {
          "text": "Just to make sure I match you with the right carrier, grab your medication bottles. I need to list them out to ensure they are covered. Go ahead, I'll wait.",
          "type": "data_collection",
          "data_proof": "+4.3% lift (controlled_conversation)",
          "options": {
            "list_provided": "medication_confirmation"
          }
        },
        "medication_confirmation": {
          "text": "Okay, I have {medications_list}. Is there anything else, like a blood thinner or memory medication?",
          "type": "verification_question",
          "options": {
            "no": "transition_to_presentation",
            "yes": "add_medication"
          }
        },
        "add_medication": {
          "text": "Got it. What is the name of that one?",
          "type": "data_collection",
          "options": {
            "next": "transition_to_presentation"
          }
        },
        "transition_to_presentation": {
          "text": "Excellent. Based on that, I'm seeing some great options for you. Give me one moment to pull up the state-approved rates.",
          "type": "transition",
          "options": {
            "next": "inflation_story"
          }
        }
      }
    },
    "phase_3_education_presentation": {
      "phase_name": "The Value Bridge",
      "timing": "7:30 - 9:00",
      "data_source": "presentation_approach.benefits_over_features (+9.6%), presentation_approach.used_anchoring (+13.4%)",
      "nodes": {
        "inflation_story": {
          "text": "While that loads, {first_name}, let me explain why this program is so popular. You know how the price of everything—gas, bread, milk—keeps going up, right?",
          "type": "education_story",
          "data_proof": "+7.5% lift (used_stories)",
          "options": {
            "yes": "funeral_cost_reality"
          }
        },
        "funeral_cost_reality": {
          "text": "Exactly. Funerals are the same. A funeral that costs $10,000 today might cost $15,000 in a few years. The benefit of this state-regulated program is that it locks in your rate forever. It never goes up, even as you get older. Does that sound like the kind of stability you're looking for?",
          "type": "benefit_statement",
          "data_proof": "+11.7% lift (tie_downs)",
          "options": {
            "yes": "waiting_period_warning"
          }
        },
        "waiting_period_warning": {
          "text": "Also, because you are in good health, I can qualify you for 'First Day Coverage'. That means if you pay the first premium and pass away next week, {beneficiary} gets the full check tax-free. You don't have to wait 2 years like those TV plans. That's huge, right?",
          "type": "benefit_statement",
          "data_proof": "+12.1% lift (used_comparison)",
          "options": {
            "yes": "pricing_anchor"
          }
        },
        "pricing_anchor": {
          "text": "Now, most of my clients in {state} with a fixed income like to keep their budget between $50 and $80 a month to get the maximum coverage. Does that range sound comfortable for you, or were you thinking higher?",
          "type": "anchoring_question",
          "data_proof": "+13.4% lift (used_anchoring)",
          "options": {
            "comfortable": "present_options",
            "lower": "adjust_anchor",
            "higher": "adjust_anchor_up"
          }
        },
        "adjust_anchor": {
          "text": "Understood. We can definitely look at something lower. The most important thing is that it's comfortable for you.",
          "type": "empathy_statement",
          "options": {
            "next": "present_options"
          }
        },
        "adjust_anchor_up": {
          "text": "Okay, we can look at higher amounts. I just want to make sure we don't 'take food off the table' to pay for this.",
          "type": "empathy_statement",
          "options": {
            "next": "present_options"
          }
        },
        "present_options": {
          "text": "Okay {first_name}, I have three options approved for you. Grab a pen and paper, let me know when you're ready to write these down.",
          "type": "instruction",
          "data_proof": "+4.3% lift (controlled_conversation)",
          "options": {
            "ready": "quote_high"
          }
        },
        "quote_high": {
          "text": "Option 1 is the Maximum Protection. This provides ${coverage_amount_high} for {beneficiary}, and that runs ${monthly_premium_high} per month.",
          "type": "pricing_statement",
          "data_proof": "+10.3% lift (offered_multiple_options)",
          "options": {
            "next": "quote_mid"
          }
        },
        "quote_mid": {
          "text": "Option 2 is the Standard Protection. This gives ${coverage_amount_mid} of coverage, and that is ${monthly_premium_mid} per month.",
          "type": "pricing_statement",
          "options": {
            "next": "quote_low"
          }
        },
        "quote_low": {
          "text": "Option 3 is the Basic Protection. This provides ${coverage_amount_low}, and that is only ${monthly_premium_low} per month.",
          "type": "pricing_statement",
          "options": {
            "next": "trial_close_selection"
          }
        }
      }
    },
    "phase_4_close": {
      "phase_name": "The Commitment Seal",
      "timing": "10:45 - 12:00",
      "data_source": "close_approach.assumptive_close (+30.3%), close_approach.alternative_choice (+20.3%)",
      "nodes": {
        "trial_close_selection": {
          "text": "Looking at those three, {first_name}, which one fits your budget best so we can get this to {beneficiary}?",
          "type": "alternative_choice_close",
          "data_proof": "+20.3% lift (alternative_choice)",
          "options": {
            "selects_high": "assumptive_transition",
            "selects_mid": "assumptive_transition",
            "selects_low": "assumptive_transition",
            "too_expensive": "objection_price_handler",
            "think_about_it": "objection_think_handler"
          }
        },
        "assumptive_transition": {
          "text": "Excellent choice. That's the one I would have picked for you as well. Let me just verify the spelling of your last name to get that started. Is it {last_name}?",
          "type": "assumptive_close",
          "data_proof": "+30.3% lift (assumptive_close)",
          "options": {
            "yes": "verify_address_delivery",
            "correction": "correct_name"
          }
        },
        "correct_name": {
          "text": "Got it. And your middle initial?",
          "type": "data_collection",
          "options": {
            "next": "verify_address_delivery"
          }
        },
        "verify_address_delivery": {
          "text": "And for the policy delivery, is {address} the best place to mail the hard copy?",
          "type": "verification_question",
          "options": {
            "yes": "beneficiary_finalization",
            "no": "update_address"
          }
        },
        "beneficiary_finalization": {
          "text": "Perfect. And for {beneficiary}, do you want them listed as the 100% primary beneficiary?",
          "type": "data_collection",
          "options": {
            "yes": "beneficiary_backup",
            "no": "adjust_beneficiary"
          }
        },
        "beneficiary_backup": {
          "text": "Do you want to add a contingent beneficiary, just in case something happens to {beneficiary} first?",
          "type": "data_collection",
          "options": {
            "yes": "collect_contingent",
            "no": "transition_to_ssn"
          }
        },
        "collect_contingent": {
          "text": "Okay, who would that be?",
          "type": "data_collection",
          "capture_variable": "contingent_beneficiary",
          "options": {
            "next": "transition_to_ssn"
          }
        }
      }
    },
    "phase_5_ssn_trust": {
      "phase_name": "The Identity Lock",
      "timing": "12:00 - 15:30",
      "data_source": "phrases.used_trust_signals (High Usage), ssn_collected_sec (Avg 15:30)",
      "nodes": {
        "transition_to_ssn": {
          "text": "Okay, we are almost done. The insurance company requires a Medical Information Bureau check to verify what you told me about your health. It's just an identity check.",
          "type": "statement",
          "data_proof": "Standard Industry Practice",
          "options": {
            "next": "ssn_ask"
          }
        },
        "ssn_ask": {
          "text": "What is your Social Security Number so I can verify your identity?",
          "type": "data_collection",
          "data_proof": "Direct Ask Strategy",
          "options": {
            "provides": "ssn_confirmation",
            "hesitates": "ssn_reassurance"
          }
        },
        "ssn_reassurance": {
          "text": "I understand. Just so you know, I cannot see the number once I type it in; it turns into asterisks on my screen for your security. It is only used to verify you are who you say you are. Go ahead.",
          "type": "trust_statement",
          "data_proof": "Verbatim from training ('I can't see your social')",
          "options": {
            "provides": "ssn_confirmation",
            "refuses": "crankwheel_pivot"
          }
        },
        "crankwheel_pivot": {
          "text": "I tell you what, I can send you a text right now that lets you see my screen, so you can watch me type it into the official carrier application. Would that make you more comfortable?",
          "type": "trust_pivot",
          "options": {
            "yes": "send_link",
            "no": "manager_takeover"
          }
        },
        "ssn_confirmation": {
          "text": "Thank you. I'm submitting that to the medical bureau now... [Pause]... Okay, looks like everything is checking out.",
          "type": "statement",
          "options": {
            "next": "transition_to_banking"
          }
        }
      }
    },
    "phase_6_banking": {
      "phase_name": "The Financial Disarm",
      "timing": "15:30 - 19:00",
      "data_source": "banking_approach.normalized_the_ask (+46.0%), banking_approach.smooth_transition (+45.1%)",
      "nodes": {
        "transition_to_banking": {
          "text": "Now {first_name}, the last step is to set up your state-regulated profile so the carrier can send the money to {beneficiary}. They don't accept cash or checks through the mail anymore because of fraud.",
          "type": "statement",
          "data_proof": "+17.0% lift (explained_why_needed)",
          "options": {
            "next": "bank_ask"
          }
        },
        "bank_ask": {
          "text": "Do you do your banking with a local bank like Chase or Wells Fargo, or a credit union?",
          "type": "data_collection",
          "data_proof": "+46.0% lift (normalized_the_ask)",
          "options": {
            "local_bank": "routing_number_ask",
            "credit_union": "routing_number_ask",
            "direct_express": "direct_express_pivot",
            "no_bank": "deal_killer_pivot"
          }
        },
        "routing_number_ask": {
          "text": "Okay, grab your checkbook real quick. I need to verify the 9-digit routing number to make sure they are a participating bank. Let me know when you have that.",
          "type": "data_collection",
          "data_proof": "Training: 'Routing Number Database' bluff",
          "options": {
            "provides": "account_number_ask",
            "hesitates": "banking_reassurance"
          }
        },
        "banking_reassurance": {
          "text": "This is just the public routing number for the bank, it identifies the bank, not you. It's the bottom left number on the check.",
          "type": "education",
          "options": {
            "provides": "account_number_ask"
          }
        },
        "account_number_ask": {
          "text": "Perfect, that comes up as {bank_name}. Now, what is the account number right next to it?",
          "type": "data_collection",
          "options": {
            "provides": "draft_date_setup"
          }
        },
        "draft_date_setup": {
          "text": "And do you receive your Social Security on the 1st, the 3rd, or a Wednesday?",
          "type": "data_collection",
          "options": {
            "date_given": "set_draft_date"
          }
        },
        "set_draft_date": {
          "text": "Okay, I'll set the draft for that same day so it aligns with your deposit. That way you never have to worry about it. Fair?",
          "type": "tie_down",
          "options": {
            "yes": "transition_to_confirmation"
          }
        }
      }
    },
    "phase_7_confirmation": {
      "phase_name": "The Victory Lap",
      "timing": "19:00 - 35:58",
      "data_source": "presentation_approach.mentioned_peace_of_mind (+17.0%)",
      "nodes": {
        "recap": {
          "text": "Congratulations {first_name}, you are approved! Let me recap: You have ${coverage_amount} of whole life coverage for ${monthly_premium}. Your beneficiary is {beneficiary}. And your first payment will be on {draft_date}.",
          "type": "summary_close",
          "data_proof": "+23.6% lift (summary_close)",
          "options": {
            "next": "expectations"
          }
        },
        "expectations": {
          "text": "You will receive your policy in the mail in about 7-10 days. Please put it in a safe place and tell {beneficiary} where it is.",
          "type": "instruction",
          "options": {
            "next": "cool_down"
          }
        },
        "cool_down": {
          "text": "Now that the business is done, I just want to say—you did a great thing for your family today. How does it feel to have this crossed off your list?",
          "type": "rapport_building",
          "data_proof": "+17.0% lift (mentioned_peace_of_mind)",
          "options": {
            "good": "referral_ask"
          }
        },
        "referral_ask": {
          "text": "I'm glad. Since I helped you, do you know anyone else, maybe a sibling or neighbor, who needs to get this taken care of too?",
          "type": "referral",
          "options": {
            "next": "goodbye"
          }
        },
        "goodbye": {
          "text": "Here is my direct number. Save it as 'Insurance Agent {agent_name}'. Call me if you need anything. Have a blessed day!",
          "type": "closing",
          "options": {
            "end": "end_call"
          }
        }
      }
    },
    "objection_handlers": {
      "price_objection": {
        "nodes": {
          "acknowledge": {
            "text": "I completely understand. We are all on a budget these days.",
            "type": "empathy",
            "options": {
              "next": "isolate"
            }
          },
          "isolate": {
            "text": "Is it the price specifically, or are you unsure about the value of the coverage?",
            "type": "isolation",
            "options": {
              "price": "pivot_down",
              "value": "re_educate"
            }
          },
          "pivot_down": {
            "text": "If we could drop the coverage slightly to get the payment under $50, would that be more comfortable for you?",
            "type": "negotiation",
            "options": {
              "yes": "re_quote"
            }
          }
        }
      },
      "think_about_it": {
        "nodes": {
          "acknowledge": {
            "text": "That's perfectly fine. It's a big decision.",
            "type": "empathy",
            "options": {
              "next": "isolate"
            }
          },
          "isolate": {
            "text": "Usually when folks say that, it's either the price or they want to talk to someone. Which is it for you?",
            "type": "isolation",
            "options": {
              "talk_to_kids": "responsibility_reframe",
              "price": "price_objection"
            }
          },
          "responsibility_reframe": {
            "text": "I understand. But let me ask you—if your kids said 'No, don't buy it', would you really want to leave them with the bill? Or is this something you want to take care of for them?",
            "type": "reframe",
            "options": {
              "take_care": "close_again"
            }
          }
        }
      }
    }
  },
  "appendices": {
    "health_sequence": [
      "Tobacco/Nicotine (Last 12 months)",
      "Height/Weight",
      "Heart Attack/Stroke/CHF (Last 2 years)",
      "COPD/Oxygen Use",
      "Diabetes (Pills vs Insulin, Neuropathy)",
      "Internal Cancer/Tumors (Last 2 years)",
      "Kidney Disease/Dialysis",
      "Alzheimer's/Dementia",
      "Hospitalizations (Last 12 months)",
      "HIV/AIDS",
      "Terminal Illness"
    ],
    "app_data_collection": {
      "ssn_script": "What is your Social Security Number so I can verify your identity?",
      "banking_script": "Grab your checkbook real quick. I need to verify the 9-digit routing number...",
      "beneficiary_script": "Who would be the person responsible for handling your arrangements?"
    },
    "phrase_library": [
      "God forbid, if you passed away today...",
      "I'll be your eyes and ears...",
      "State-regulated program...",
      "Take food off the table...",
      "Locks in your rate forever...",
      "I can't see your social, it's encrypted...",
      "Heavy is the head that wears the crown...",
      "Does that make sense?",
      "Fair enough?"
    ],
    "objection_playbook": {
      "price": "Pivot down / Reality check on funeral costs",
      "spouse": "Isolate decision maker / Responsibility reframe",
      "trust": "Crankwheel screen share / License verification",
      "not_interested": "One minute micro-commitment"
    },
    "transitions": {
      "greeting_to_discovery": "Fair enough?",
      "discovery_to_health": "I'll be your eyes and ears... Fair enough?",
      "health_to_presentation": "Based on that, I'm seeing some great options...",
      "presentation_to_close": "Which one fits your budget best?",
      "close_to_ssn": "The insurance company requires a Medical Information Bureau check...",
      "ssn_to_banking": "The last step is to set up your state-regulated profile..."
    }
  }
}