# Complete Final Expense Sales Script

## All Nodes & Full Script Text

---

# PHASE 1: OPENING

---

## NODE: opening

**Title:** Transfer Opening

**Script:**
Thank you, I've got it from here. Hello, {firstName}. My name is [Your Name], and I am the state-licensed field underwriter assigned to your file in {state} today. I see here that you were looking for some information on the state-regulated final expense programs to cover burial and cremation costs, is that correct?

**Tip:** Never ask "How are you?" - dive straight in (+7.63 pts)

**Options:**

- ✅ Yes, that's right → authority
- ⚠️ Just looking / Not buying → reassurance
- ❓ Confused / Who is this? → clarify
- ❌ Not interested → not_interested

---

## NODE: reassurance

**Title:** Reassurance

**Script:**
I understand completely. My job isn't to sell you anything you don't need. My job is simply to be your eyes and ears, shop the top-rated carriers in {state}, and see if we can find you a plan that fits your budget.

**Options:**

- ✅ Continue → authority

---

## NODE: clarify

**Title:** Clarify Purpose

**Script:**
You recently requested information about final expense coverage—sometimes through a mailer, TV ad, or online form. I'm just following up to see what options are available in {state}. Does that ring a bell?

**Options:**

- ✅ Yes, I remember → authority
- ❌ Wrong person → end_polite

---

## NODE: not_interested

**Title:** Handle Not Interested

**Script:**
I completely understand. Before I let you go—do you currently have any coverage in place for final expenses? The average funeral today costs between $8,000 and $15,000. Without coverage, that burden falls directly on your family. Can I take just 2 minutes to show you what's available?

**Options:**

- ✅ Okay, 2 minutes → authority
- ❌ No thanks → end_polite

---

# PHASE 2: AUTHORITY & VERIFICATION

---

## NODE: authority

**Title:** Establish Authority

**Script:**
Now, just so you know who you are speaking with—I am a state-regulated benefit coordinator. I don't work for just one insurance company. I work for you. I have access to over 20 different carriers, which means I can find the discounts that you might not be able to find on your own. Does that make sense?

**Tip:** Authority title: +1.06 pts

**Options:**

- ✅ Yes / Makes sense → compliance
- ❓ Skeptical / Wants proof → trust_objection

---

## NODE: compliance

**Title:** Compliance Disclosure

**Script:**
Because I am a licensed agent in the state of {state}, I am required to let you know that this line is recorded for quality assurance and training purposes. Everything we discuss is 100% private and protected under HIPAA laws. I take your privacy very seriously.

**Options:**

- ✅ Continue → verify_name

---

## NODE: verify_name

**Title:** Verify Name

**Script:**
Perfect. To get started, I have your first name as {firstName}. Can you spell your last name for me?

**Tip:** Assumptive language: +30.56 pts lift

**Fields:** Last Name

**Options:**

- ✅ Continue → verify_location

---

## NODE: verify_location

**Title:** Verify Location

**Script (if city/state from webhook):**
Thank you. And just to confirm, you are currently residing in {city}, {state}, correct?

**Script (if state from area code only):**
Thank you. And just to confirm, you are currently residing in {state}, correct?

**Tip:** Finding common ground: +9.19 pts lift

**Options:**

- ✅ Yes, that's correct → verify_location_yes
- ❌ No, that's not right → verify_location_no

---

## NODE: verify_location_yes

**Title:** Location Confirmed

**Script (if city available):**
Wonderful. I have family that lives not too far from there. How long have you lived in {city}?

**Script (if state only):**
Excellent. I have family that lives in {state}. How long have you lived in {state}?

**Tip:** Build rapport with personal connection

**Options:**

- ✅ Continue → dob_transition

---

## NODE: verify_location_no

**Title:** Update Location

**Script:**
Oh. What state do you live in?

**Tip:** Collect correct location info

**Fields:** State, City (optional)

**Options:**

- ✅ Updated → verify_location_updated

---

## NODE: verify_location_updated

**Title:** Location Updated

**Script:**
Oh fantastic. I have family that lives there too. I hear it's a great place. How long have you lived there for?

**Tip:** Continue building rapport

**Options:**

- ✅ Continue → dob_transition

---

# PHASE 3: HEALTH QUALIFICATION

---

## NODE: dob_transition

**Title:** How We Help

**Script:**
So, here is how I help. Instead of you calling ten different insurance companies and waiting on hold, I can pull all the state-regulated plan rates up right now on my screen and find you discounts that wouldn't be available to you elsewhere... and then we can pick the best plan together that offers you the most coverage at the lowest price. To get those rates accurate, I need to ask you a few more questions. Fair enough?

**Tip:** Value proposition before asking for info

**Options:**

- ✅ Fair enough → health_dob
- ⚠️ Hesitant → dob_transition

---

## NODE: health_dob

**Title:** Date of Birth

**Script (if DOB is pre-filled from webhook):**
Fantastic. We have your date of birth as {dob formatted}. Is that correct?

**Script (if DOB is NOT available):**
What is your date of birth?

**Tip:** Permission-based questions: +16.13 pts lift

**Fields (if needed):** Date of Birth

**Options (if DOB pre-filled):**

- ✅ Yes, that's correct → health_gender
- ❌ No, that's incorrect → health_dob_correction

**Options (if DOB needed):**

- ✅ DOB Provided → health_gender
- ⚠️ User Objects/Refuses → health_dob_objection

---

## NODE: health_dob_correction

**Title:** Correct Date of Birth

**Script:**
Apologies, let me correct that in the system. What is the correct date of birth?

**Fields:** Correct Date of Birth

**Options:**

- ✅ Updated → health_gender

---

## NODE: health_dob_objection

**Title:** DOB Objection - Rebuttal

**Script:**
I completely understand your concern. The only reason I ask is that these state-regulated plans are strictly based on age. Without your specific date of birth, I can't see the actual rates, and I don't want to quote you a price that ends up being wrong. I just need the basic date to see what you qualify for.

**Tip:** Address concern directly, explain the WHY

**Fields:** Date of Birth

**Options:**

- ✅ User Provides DOB → health_gender
- ❌ Still Refuses → soft_close

---

## NODE: health_gender

**Title:** Gender

**Script:**
And for the insurance records, are you male or female?

**Fields:** Gender (Female/Male)

**Options:**

- ✅ Continue → health_tobacco

---

## NODE: health_tobacco

**Title:** Tobacco Use

**Script:**
Now, regarding tobacco or nicotine. Do you smoke cigarettes, use a pipe, chew tobacco, or use e-cigarettes?

**Options:**

- 🚭 No / Quit 12+ months ago → tobacco_no
- 🚬 Yes, current user → tobacco_yes

---

## NODE: tobacco_no

**Title:** Non-Smoker

**Script:**
Nonsmoker. That is excellent. That's going to save you a lot of money right off the bat.

**Tip:** Mirroring technique: +13.83 pts lift

**Options:**

- ✅ Continue → health_major

---

## NODE: tobacco_yes

**Title:** Smoker

**Script:**
Okay, I'll note that. It does affect the rate, but I have several carriers that work with tobacco users. We'll find you the best option.

**Options:**

- ✅ Continue → health_major

---

## NODE: health_major

**Title:** Major Conditions

**Script:**
In the past 2 years, have you been diagnosed with or treated for any heart attack, stroke, congestive heart failure, cancer, kidney failure, dialysis, or dementia?

**Tip:** Combined questions: +14.9 pts lift

**Options:**

- ✅ No to all → health_meds
- ⚠️ Yes to one or more → health_major_yes

---

## NODE: health_major_yes

**Title:** Health Consideration

**Script:**
Thank you for being honest with me. Because of that condition, you may qualify for a Graded Benefit plan. This means full coverage kicks in after 24 months, but you're protected from day one for accidental death. Let me continue to see exactly what you qualify for.

**Options:**

- ✅ Continue → health_meds

---

## NODE: health_meds

**Title:** Medications

**Script:**
What medications are you currently taking? Common ones would be for blood pressure, cholesterol, or diabetes.

**Tip:** Empathy: "My own father takes that" +5.61 pts

**Fields:** Medications

**Options:**

- ✅ No diabetes → health_hospital
- 💊 Diabetes - pills only → diabetes_pills
- 💉 Diabetes - insulin → diabetes_insulin

---

## NODE: diabetes_pills

**Title:** Diabetes Pills

**Script:**
Just pills? Perfect. Pills-only diabetes gets the best rates. That helps a lot.

**Options:**

- ✅ Continue → health_hospital

---

## NODE: diabetes_insulin

**Title:** Diabetes Insulin

**Script:**
Okay, insulin use does affect the plan type. Don't worry—I have carriers that work with insulin-dependent diabetes.

**Options:**

- ✅ Continue → health_hospital

---

## NODE: health_hospital

**Title:** Hospitalizations

**Script:**
In the last 2 years, have you been hospitalized overnight for any reason—other than routine surgery like a knee or hip replacement?

**Options:**

- ✅ No hospitalizations → health_height_weight
- 🩹 Minor surgery only → hospital_minor
- ⚠️ Major hospitalization → hospital_major

---

## NODE: hospital_minor

**Title:** Minor Surgery

**Script:**
I bet that was a tough recovery. But other than that, no overnight stays for heart or lungs? Excellent.

**Options:**

- ✅ Continue → health_height_weight

---

## NODE: hospital_major

**Title:** Major Hospitalization

**Script:**
Thank you for sharing that. Can you tell me briefly what it was for so I can find the right carrier?

**Fields:** Reason

**Options:**

- ✅ Continue → health_height_weight

---

## NODE: health_height_weight

**Title:** Height & Weight

**Script:**
And roughly, what is your height and weight?

**Tip:** Social proof: "Same as last person" +7.04 pts

**Fields:** Height (feet, inches), Weight (lbs)

**Options:**

- ✅ Continue → beneficiary

---

## NODE: beneficiary

**Title:** Beneficiary

**Script:**
Now, this is an important question. When something happens to you, who are we doing this for? Who is going to be your beneficiary?

**Tip:** Tie-down: "That would be nice, wouldn't it?" +15.44 pts

**Fields:** Beneficiary Name, Relationship

**Options:**

- ✅ Continue → existing_coverage

---

## NODE: existing_coverage

**Title:** Existing Coverage

**Script:**
That would be nice for {beneficiary}, wouldn't it? To not have to worry about the bill. Do you currently have any life insurance in place?

**Options:**

- ❌ No coverage → no_coverage_urgency
- ✅ Has coverage → has_coverage
- ❓ Sent in a card / Maybe → unit_plan

---

## NODE: no_coverage_urgency

**Title:** Create Urgency

**Script:**
Okay. So right now, if something happened, {beneficiary} would have to pay for everything out of pocket? That is exactly why we are on the phone today. We are going to fix that.

**Tip:** Urgency: +4.0 pts lift

**Options:**

- ✅ Continue → budget_ss

---

## NODE: has_coverage

**Title:** Existing Coverage Details

**Script:**
That's great you were proactive. How much coverage do you have? With funeral costs averaging $8,000-$15,000 these days, many clients add a supplemental policy for the extras—flowers, obituary, time off work for family.

**Options:**

- ✅ Interested in supplement → budget_ss
- ❌ Satisfied with current → soft_close

---

## NODE: unit_plan

**Title:** Unit Plan Education

**Script:**
Did you ever speak to an agent or give them a payment? That's typically a "unit" plan—$9.95 often only buys a few hundred dollars of coverage with a 2-year waiting period. What we're looking at today is first-day coverage. You're fully protected from day one.

**Options:**

- ✅ Continue → budget_ss

---

# PHASE 4: BUDGET DISCOVERY

---

## NODE: budget_ss

**Title:** Social Security

**Script:**
Most of my clients, including myself, like everything to be based around their Social Security. Are you currently receiving Social Security?

**Tip:** Social proof: +7.04 pts

**Options:**

- ✅ Yes → budget_ss_day
- ❌ No / Other income → budget_income

---

## NODE: budget_ss_day

**Title:** SS Payment Day

**Script:**
And does that usually come on the 1st, the 3rd, or one of the Wednesdays?

**Fields:** SS Payment Day

**Options:**

- ✅ Continue → budget_anchor

---

## NODE: budget_income

**Title:** Other Income

**Script:**
What day of the month works best for you for payments?

**Fields:** Preferred Day

**Options:**

- ✅ Continue → budget_anchor

---

## NODE: budget_anchor

**Title:** Budget Anchor

**Script:**
I know that every penny counts when you're on a fixed income. I assume you're looking for something that is affordable and isn't going to break the bank, right? My goal is to find you something that fits comfortably into your budget. We aren't looking to make you "insurance poor"—we just want to make sure {beneficiary} is okay.

**Tip:** Anchoring: +11.25 pts lift

**Options:**

- ✅ Continue → quote_calc

---

# PHASE 5: QUOTE & PRESENTATION

---

## NODE: quote_calc

**Title:** Calculate Quote

**Script:**
Okay, I have everything I need to run the numbers. Give me just one moment while the computer calculates the best rates for you...

**Tip:** 🔥 SILENCE: +29.1 pts lift. Let it work.

**Options:**

- ✅ Present Quote → presentation

---

## NODE: presentation

**Title:** Great News

**Script:**
Okay, {firstName}, I have some great news. Based on the health information you gave me, you qualify for the preferred tier with a top-rated carrier. This is the best rating class available.

**Options:**

- ✅ Continue → benefits

---

## NODE: benefits

**Title:** Present Benefits

**Script:**
Let me explain how this plan works:

First, this is Whole Life insurance. The price I give you today is locked in forever. It will never go up.

Second, the coverage amount never goes down.

Third, this pays out within 24 to 48 hours. That means {beneficiary} will have the money immediately to pay the funeral home.

Does that sound like the kind of peace of mind you're looking for?

**Tip:** "Peace of mind" phrase: +15.59 pts

**Options:**

- ✅ Yes, sounds good → present_options
- ❓ Has questions → answer_questions

---

## NODE: answer_questions

**Title:** Answer Questions

**Script:**
Great question. This is whole life—it builds cash value over time, and the death benefit is guaranteed. Unlike term insurance, you never lose your coverage as long as you pay the premium. It's designed specifically for final expenses.

**Options:**

- ✅ Continue → present_options

---

## NODE: present_options

**Title:** Present 3 Options

**Script:**
The average burial is between $8,000 and $15,000. I'm going to give you three options—just tell me which feels most comfortable:

Option 1: $15,000 — Full funeral, headstone, extra for {beneficiary} — {p15k}/month

Option 2: $10,000 — Most popular. Complete service and burial — {p10k}/month

Option 3: $5,000 — Basics, cremation and small service — {p5k}/month

**Tip:** Multiple options: +9.39 pts. WAIT IN SILENCE after presenting.

**Options:**

- ✅ Picks an option → trial_close
- 💰 Too expensive → price_objection
- 🤔 Need to think → think_objection
- 👨‍👩‍👧 Talk to family → family_objection
- 🔒 Trust concern → trust_objection
- ⏰ Bad timing → timing_objection

---

# OBJECTION HANDLING

---

## NODE: price_objection

**Title:** Handle Price (Phase 6)

**Script:**
I understand. You're on a fixed income and have to be careful. Honestly, having some coverage is better than no coverage. If {beneficiary} has to come up with $10,000, that's a burden. But if we can cover even half, it helps.

$5,000 is {p5k}/month. Or to get your foot in the door, $3,000 is about {p3k}/month.

**Tip:** Price objection: 39.8% occurrence, 98.9% resolution. Drop face amount.

**Options:**

- ✅ Accepts lower amount → trial_close
- 🤔 Still hesitant → think_objection

---

## NODE: think_objection

**Title:** Handle "Need to Think" (Phase 7)

**Script:**
I understand. But honestly, what is there to think about? Maybe I can help.

Here's the thing—quotes don't mean anything until the company reviews your medical background. Right now, we don't even know if you're approved.

The next step is just to submit an application to see if you get approved. If you do, you have a 30-day risk-free look period. If you get the policy and decide you don't want it, you get 100% of your money back.

**Tip:** "30-day free look + underwriting" frame

**Options:**

- ✅ "Okay, let's see if I qualify" → urgency_close
- 👨‍👩‍👧 "Should talk to family first" → family_objection
- ❌ Still wants to wait → soft_close

---

## NODE: urgency_close

**Title:** Urgency Close (Phase 7)

**Script:**
100%. You're the boss. But within 48 hours, if I don't submit that application, this rate goes away. And as you age, it just continues to increase. Better to be safe than sorry, right?

**Tip:** Urgency: +4.0 pts lift

**Options:**

- ✅ Continue to application → app_address

---

## NODE: family_objection

**Title:** Handle Family Objection (Phase 8)

**Script:**
I think that's a great idea—you should definitely tell {beneficiary}. But let me ask you this: if you ask "{beneficiary}, do you want me to buy life insurance so you don't have to pay for my funeral?" what do you think they'll say?

They'll probably say "don't worry about it." They love you. But when the time comes, they will worry.

Let's just see if we can get you approved. You can show the policy to {beneficiary} when it arrives. If they hate that you protected them financially, you can cancel it.

**Tip:** Family objection: CRITICAL severity. Use non-binding approval frame.

**Options:**

- ✅ "That makes sense" → app_address
- ❌ Still wants to wait → soft_close

---

## NODE: trust_objection

**Title:** Handle Trust Concern (Phase 9)

**Script:**
I am SO glad you said that. You're absolutely right to be careful—there are a lot of bad actors out there.

I'm a licensed agent in {state}. Let me give you my information right now. Do you have a pen?

My National Producer Number is [NPN]. My {state} license number is [LICENSE #]. You can look me up on the {state} Department of Insurance website. I'm also going to text you a picture of my license right now so you can see my face.

Your information goes directly to the insurance carrier through a secure, encrypted portal. I don't store your information.

**Tip:** Provide license # + text picture = resolution

**Options:**

- ✅ "Okay, you seem legitimate" → app_address
- ❌ Still suspicious → soft_close

---

## NODE: timing_objection

**Title:** Handle Bad Timing (Phase 11)

**Script:**
Please don't worry about that. I couldn't take a payment from you today even if you wanted. You get to pick when you start making payments.

We can set the policy to start on your next Social Security deposit day. Nothing comes out of your account until you have your money in hand. We're just doing the paperwork today to get you approved.

**Tip:** Deferred draft: resolves 100% of timing concerns

**Options:**

- ✅ "If nothing comes out today, that's fine" → app_address
- ❌ Still can't proceed → soft_close

---

## NODE: trial_close

**Title:** Trial Close (Phase 5)

**Script:**
Is that something you would be comfortable with?

**Tip:** Trial close: +16.89 pts lift. Wait for explicit "YES".

**Fields:** Selected Coverage

**Options:**

- ✅ Yes / "I can do that" → app_address
- 😐 Hesitant → think_objection

---

# PHASE 13: APPLICATION DATA

---

## NODE: app_address

**Title:** Collect Address

**Script:**
Let me start this application for you. I have your name as {firstName} {lastName}. What is your street address?

**Tip:** Assumptive transition: +30.56 pts

**Fields:** Street Address, Apt/Unit, Zip Code

**Options:**

- ✅ Continue → app_ssn

---

## NODE: app_ssn

**Title:** Social Security Number

**Script:**
This part is for the background check to verify your identity. I need your Social Security number. As I type it, it turns into X's on my screen—I can't see it once I enter it.

**Fields:** SSN

**Options:**

- ✅ Provided SSN → app_birth
- 🔒 Hesitant → ssn_reassurance

---

## NODE: ssn_reassurance

**Title:** SSN Reassurance

**Script:**
I completely understand the hesitation. Your Social Security number is only used for identity verification with the insurance carrier—it's required by law to prevent fraud. The number goes directly into the carrier's encrypted system. I don't have access to it after I enter it.

**Options:**

- ✅ Continue → app_birth

---

## NODE: app_birth

**Title:** Birth State & Citizenship

**Script:**
Thank you. That was the scary part—we're past it now. What state were you born in? And are you a U.S. citizen?

**Fields:** Birth State, US Citizen

**Options:**

- ✅ Continue → app_beneficiary

---

## NODE: app_beneficiary

**Title:** Beneficiary Details

**Script:**
For the beneficiary, we have {beneficiary}. What is their last name? And do you have their phone number?

**Fields:** Beneficiary Last Name, Beneficiary Phone

**Options:**

- ✅ Continue → app_contact

---

## NODE: app_contact

**Title:** Contact Info

**Script:**
Is the number we're talking on a cell phone? And do you have an email address?

**Fields:** Phone Type, Email

**Options:**

- ✅ Continue → banking_intro

---

# PHASE 14: BANKING

---

## NODE: banking_intro

**Title:** Banking

**Script:**
We're almost done. You're doing great.

We'll set the payment to come out on {ssDay} to match your income.

Would you be paying through automatic bank draft, like most people?

**Tip:** 🔥 SMOOTH TRANSITION: +37.31 pts. NORMALIZED ASK: +37.73 pts.

**Options:**

- 🏦 Yes, bank draft → banking_collect
- 💳 Card instead → banking_card
- ❌ "Don't give that out" → banking_objection

---

## NODE: banking_objection

**Title:** Banking Objection

**Script:**
I understand completely. We don't actually take the payment today. The insurance company just requires the routing and account number to verify you have an active account. It's just like setting up Netflix or a utility bill. Nothing comes out until {ssDay}.

**Options:**

- ✅ Okay → banking_collect
- 💳 Use card instead → banking_card

---

## NODE: banking_collect

**Title:** Collect Bank Info

**Script:**
Who do you bank with? On the bottom left corner of your check, there's a 9-digit routing number. Right next to it is your account number.

**Fields:** Bank Name, Routing Number, Account Number, Account Type

**Options:**

- ✅ Continue → summary_close

---

## NODE: banking_card

**Title:** Collect Card Info

**Script:**
No problem. I'll need the 16-digit card number, expiration date, and the 3-digit CVV on the back.

**Fields:** Card Type, Card Number, Expiration, CVV

**Options:**

- ✅ Continue → summary_close

---

# PHASE 15: SUMMARY & CLOSE

---

## NODE: summary_close

**Title:** Summary Close

**Script:**
Let me recap:

We're submitting an application to {carrier} for {coverage} of Whole Life coverage.

Your monthly premium is {premium}.

Your beneficiary is {beneficiary}.

Your first payment date is {ssDay}.

Does that all sound correct?

**Tip:** 🔥🔥🔥 SUMMARY CLOSE = +43.77 pts lift. #1 TECHNIQUE. NEVER SKIP.

**Options:**

- ✅ "Yes, that's right" → authorization
- ⚠️ Needs correction → summary_close

---

## NODE: authorization

**Title:** Authorization

**Script:**
{firstName}, do you authorize that we submit this application to the carrier for the face amount of {coverage}?

**Tip:** Wait for EXPLICIT "Yes": +25.29 pts lift

**Options:**

- ✅ "Yes, I do" → voice_sig
- ⚠️ Hesitates → authorization

---

## NODE: voice_sig

**Title:** Voice Signature

**Script:**
Perfect. I need to do a quick voice signature. Please state your full name and say "I agree."

**Fields:** Voice Signature Completed (checkbox)

**Options:**

- ✅ Completed → congrats

---

## NODE: congrats

**Title:** 🎉 Congratulations!

**Script:**
Congratulations, {firstName}! You've taken a huge step today. You've done a wonderful thing for {beneficiary}. They are going to be so relieved.

You'll receive your policy in the mail in 7-10 business days. I'm texting you my direct number—if you have ANY questions, call me directly.

Take care!

**[END - Application Complete]**

---

## NODE: soft_close

**Title:** Schedule Callback

**Script:**
I understand. When would be a good time to call you back—tomorrow afternoon, or would an evening work better?

The rate I quoted is based on your current age and health. If anything changes, the rate will go up.

**Fields:** Callback Date, Callback Time

**Options:**

- ✅ Scheduled → end_callback

---

## NODE: end_callback

**Title:** Callback Scheduled

**Script:**
I've got you scheduled. I'll talk to you soon. Take care!

**[END - Callback Scheduled]**

---

## NODE: end_polite

**Title:** Polite End

**Script:**
I completely understand. Thank you for your time today. If you ever have questions about final expense coverage, please don't hesitate to reach out. Have a wonderful day!

**[END - Call Complete]**

---

# SCRIPT FLOW SUMMARY

## Main Path (Happy Path):

1. opening → authority → compliance → verify_name → verify_location → verify_location_yes
2. → dob_transition → health_dob → health_gender → health_tobacco → tobacco_no
3. → health_major → health_meds → health_hospital → health_height_weight → beneficiary
4. → existing_coverage → no_coverage_urgency → budget_ss → budget_ss_day → budget_anchor
5. → quote_calc → presentation → benefits → present_options → trial_close
6. → app_address → app_ssn → app_birth → app_beneficiary → app_contact
7. → banking_intro → banking_collect → summary_close → authorization → voice_sig → congrats

## Total Nodes: 55

## Total Phases: 15

---

# DYNAMIC VARIABLES

The following placeholders are replaced with real data:

- `{firstName}` - Prospect's first name
- `{lastName}` - Prospect's last name
- `{state}` - Prospect's state
- `{city}` - Prospect's city
- `{age}` - Prospect's calculated age
- `{beneficiary}` - Beneficiary name
- `{carrier}` - Selected insurance carrier
- `{premium}` - Monthly premium amount
- `{coverage}` - Selected coverage amount
- `{p15k}` - Premium for $15,000 coverage
- `{p10k}` - Premium for $10,000 coverage
- `{p5k}` - Premium for $5,000 coverage
- `{p3k}` - Premium for $3,000 coverage
- `{ssDay}` - Social Security payment day
