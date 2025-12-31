# Script Variable Replacement Examples

## Example 1: Opening Sequence

### Before Variable Replacement (Raw Script):

```
"Hello, this is {agent_name}, the licensed field underwriter
for the state of {state}."

"I have you listed here as {first_name} {last_name},
residing in {state}, is that correct?"

"And I have your date of birth listed as {dob},
making you {age} years young, correct?"
```

### After Variable Replacement (Rendered):

```
"Hello, this is John Smith, the licensed field underwriter
for the state of Texas."

"I have you listed here as Mary Johnson,
residing in Texas, is that correct?"

"And I have your date of birth listed as 05/12/1952,
making you 72 years young, correct?"
```

---

## Example 2: Emotional Excavation (Beneficiary Discovery)

### Before Variable Replacement:

```
"Now {first_name}, before we look at the numbers, I need to
understand who we are protecting today. If something were to
happen to you yesterday, who would be the person responsible
for handling your arrangements?"

[After prospect responds: "My daughter Sarah"]

"Okay, and what is your child's name?"

[Prospect: "Sarah"]

"Does {beneficiary} live close by to you in {state},
or are they in a different state?"

"Does {beneficiary} know that you are looking into this,
or is this going to be a surprise for them?"

"God forbid, if you passed away today, would {beneficiary}
have the $10,000 to $15,000 cash on hand to pay for the
funeral immediately?"
```

### After Variable Replacement:

```
"Now Mary, before we look at the numbers, I need to
understand who we are protecting today. If something were to
happen to you yesterday, who would be the person responsible
for handling your arrangements?"

[After prospect responds: "My daughter Sarah"]

"Okay, and what is your child's name?"

[Prospect: "Sarah"]

"Does Sarah live close by to you in Texas,
or are they in a different state?"

"Does Sarah know that you are looking into this,
or is this going to be a surprise for them?"

"God forbid, if you passed away today, would Sarah
have the $10,000 to $15,000 cash on hand to pay for the
funeral immediately?"
```

---

## Example 3: Validation & Empathy

### Before Variable Replacement:

```
"I understand completely. That is exactly why we are on
the phone. We want to make sure {beneficiary} never has
to worry about that bill. Does that make sense?"

"I appreciate you sharing that with me. It sounds like
getting this taken care of is a priority for you so
{beneficiary} is protected, right?"

"Okay {first_name}, based on what you've told me, I can
definitely help. To find you the best rate, I just need to
ask a few medical questions. I'll be your eyes and ears and
shop all the top carriers for you. Fair enough?"
```

### After Variable Replacement:

```
"I understand completely. That is exactly why we are on
the phone. We want to make sure Sarah never has
to worry about that bill. Does that make sense?"

"I appreciate you sharing that with me. It sounds like
getting this taken care of is a priority for you so
Sarah is protected, right?"

"Okay Mary, based on what you've told me, I can
definitely help. To find you the best rate, I just need to
ask a few medical questions. I'll be your eyes and ears and
shop all the top carriers for you. Fair enough?"
```

---

## Example 4: Health Questions with Medication List

### Before Variable Replacement:

```
"Just to make sure I match you with the right carrier,
grab your medication bottles. I need to list them out to
ensure they are covered. Go ahead, I'll wait."

[Prospect lists: "Lisinopril, Metformin, and Atorvastatin"]

"Okay, I have {medications_list}. Is there anything else,
like a blood thinner or memory medication?"
```

### After Variable Replacement:

```
"Just to make sure I match you with the right carrier,
grab your medication bottles. I need to list them out to
ensure they are covered. Go ahead, I'll wait."

[Prospect lists: "Lisinopril, Metformin, and Atorvastatin"]

"Okay, I have Lisinopril, Metformin, and Atorvastatin.
Is there anything else, like a blood thinner or memory medication?"
```

---

## Example 5: Education Phase (Value Bridge)

### Before Variable Replacement:

```
"While that loads, {first_name}, let me explain why this
program is so popular. You know how the price of everything—
gas, bread, milk—keeps going up, right?"

"Also, because you are in good health, I can qualify you
for 'First Day Coverage'. That means if you pay the first
premium and pass away next week, {beneficiary} gets the
full check tax-free. You don't have to wait 2 years like
those TV plans. That's huge, right?"

"Now, most of my clients in {state} with a fixed income
like to keep their budget between $50 and $80 a month to
get the maximum coverage. Does that range sound comfortable
for you, or were you thinking higher?"
```

### After Variable Replacement:

```
"While that loads, Mary, let me explain why this
program is so popular. You know how the price of everything—
gas, bread, milk—keeps going up, right?"

"Also, because you are in good health, I can qualify you
for 'First Day Coverage'. That means if you pay the first
premium and pass away next week, Sarah gets the
full check tax-free. You don't have to wait 2 years like
those TV plans. That's huge, right?"

"Now, most of my clients in Texas with a fixed income
like to keep their budget between $50 and $80 a month to
get the maximum coverage. Does that range sound comfortable
for you, or were you thinking higher?"
```

---

## Example 6: Pricing Options

### Before Variable Replacement:

```
"Okay {first_name}, I have three options approved for you.
Grab a pen and paper, let me know when you're ready to
write these down."

"Option 1 is the Maximum Protection. This provides
${coverage_amount_high} for {beneficiary}, and that runs
${monthly_premium_high} per month."

"Option 2 is the Standard Protection. This gives
${coverage_amount_mid} of coverage, and that is
${monthly_premium_mid} per month."

"Option 3 is the Basic Protection. This provides
${coverage_amount_low}, and that is only
${monthly_premium_low} per month."

"Looking at those three, {first_name}, which one fits
your budget best so we can get this to {beneficiary}?"
```

### After Variable Replacement (with Quote Data):

```
"Okay Mary, I have three options approved for you.
Grab a pen and paper, let me know when you're ready to
write these down."

"Option 1 is the Maximum Protection. This provides
$15,000 for Sarah, and that runs $95 per month."

"Option 2 is the Standard Protection. This gives
$10,000 of coverage, and that is $75 per month."

"Option 3 is the Basic Protection. This provides
$5,000, and that is only $45 per month."

"Looking at those three, Mary, which one fits
your budget best so we can get this to Sarah?"
```

---

## Example 7: Closing & Address Verification

### Before Variable Replacement:

```
"Excellent choice. That's the one I would have picked for
you as well. Let me just verify the spelling of your last
name to get that started. Is it {last_name}?"

"And for the policy delivery, is {address} the best place
to mail the hard copy?"

"Perfect. And for {beneficiary}, do you want them listed
as the 100% primary beneficiary?"
```

### After Variable Replacement:

```
"Excellent choice. That's the one I would have picked for
you as well. Let me just verify the spelling of your last
name to get that started. Is it Johnson?"

"And for the policy delivery, is 123 Oak Street, Austin, TX 78701
the best place to mail the hard copy?"

"Perfect. And for Sarah, do you want them listed
as the 100% primary beneficiary?"
```

---

## Example 8: Banking Collection

### Before Variable Replacement:

```
"Now {first_name}, the last step is to set up your
state-regulated profile so the carrier can send the money
to {beneficiary}. They don't accept cash or checks through
the mail anymore because of fraud."

"Okay, grab your checkbook real quick. I need to verify
the 9-digit routing number to make sure they are a
participating bank. Let me know when you have that."

[Prospect provides routing: 111000025]

"Perfect, that comes up as {bank_name}. Now, what is
the account number right next to it?"

"And do you receive your Social Security on the 1st,
the 3rd, or a Wednesday?"

[Prospect: "The 3rd"]

"Okay, I'll set the draft for that same day so it aligns
with your deposit. That way you never have to worry about
it. Fair?"
```

### After Variable Replacement:

```
"Now Mary, the last step is to set up your
state-regulated profile so the carrier can send the money
to Sarah. They don't accept cash or checks through
the mail anymore because of fraud."

"Okay, grab your checkbook real quick. I need to verify
the 9-digit routing number to make sure they are a
participating bank. Let me know when you have that."

[Prospect provides routing: 111000025]

"Perfect, that comes up as Wells Fargo. Now, what is
the account number right next to it?"

"And do you receive your Social Security on the 1st,
the 3rd, or a Wednesday?"

[Prospect: "The 3rd"]

"Okay, I'll set the draft for the 3rd so it aligns
with your deposit. That way you never have to worry about
it. Fair?"
```

---

## Example 9: Final Confirmation

### Before Variable Replacement:

```
"Congratulations {first_name}, you are approved!
Let me recap: You have ${coverage_amount} of whole life
coverage for ${monthly_premium}. Your beneficiary is
{beneficiary}. And your first payment will be on {draft_date}."

"You will receive your policy in the mail in about 7-10 days.
Please put it in a safe place and tell {beneficiary} where
it is."

"Now that the business is done, I just want to say—you did
a great thing for your family today. How does it feel to
have this crossed off your list?"

"Here is my direct number. Save it as 'Insurance Agent
{agent_name}'. Call me if you need anything. Have a
blessed day!"
```

### After Variable Replacement:

```
"Congratulations Mary, you are approved!
Let me recap: You have $10,000 of whole life
coverage for $75. Your beneficiary is
Sarah. And your first payment will be on the 3rd."

"You will receive your policy in the mail in about 7-10 days.
Please put it in a safe place and tell Sarah where
it is."

"Now that the business is done, I just want to say—you did
a great thing for your family today. How does it feel to
have this crossed off your list?"

"Here is my direct number. Save it as 'Insurance Agent
John Smith'. Call me if you need anything. Have a
blessed day!"
```

---

## Example 10: Objection Handling

### Before Variable Replacement:

```
PRICE OBJECTION:
"I understand. You're on a fixed income, and you have
to be careful."

"I hear you, {first_name}. And honestly, having some
coverage is a lot better than having no coverage. If
{beneficiary} has to come up with $10,000, that's a burden.
But if we can take care of even half of that, it helps."

FAMILY OBJECTION:
"I think that is a great idea. You definitely should tell
{beneficiary}. But let me ask you this—if you ask {beneficiary},
'Do you want me to buy life insurance so you don't have to
pay for my funeral?' what do you think she's going to say?"

"She loves you. She doesn't want you to worry. But you and
I both know that when the time comes, she *will* worry."

"So, let's do this. Let's just see if we can get you
approved, {first_name}. Because if we can't get you approved,
none of it matters. We can get the approval today, and then
you can show the policy to {beneficiary} when it arrives."
```

### After Variable Replacement:

```
PRICE OBJECTION:
"I understand. You're on a fixed income, and you have
to be careful."

"I hear you, Mary. And honestly, having some
coverage is a lot better than having no coverage. If
Sarah has to come up with $10,000, that's a burden.
But if we can take care of even half of that, it helps."

FAMILY OBJECTION:
"I think that is a great idea. You definitely should tell
Sarah. But let me ask you this—if you ask Sarah,
'Do you want me to buy life insurance so you don't have to
pay for my funeral?' what do you think she's going to say?"

"She loves you. She doesn't want you to worry. But you and
I both know that when the time comes, she *will* worry."

"So, let's do this. Let's just see if we can get you
approved, Mary. Because if we can't get you approved,
none of it matters. We can get the approval today, and then
you can show the policy to Sarah when it arrives."
```

---

## Summary

Every instance of a variable placeholder like `{first_name}`, `{beneficiary}`, `{state}`, etc. is **automatically replaced** with the actual customer data from the webhook datapass.

This creates a highly personalized, conversational experience where:

- ✅ The agent never has to mentally substitute variables
- ✅ The script flows naturally with real names and data
- ✅ The prospect feels the conversation is tailored to them
- ✅ All data is consistently referenced throughout the call
- ✅ No risk of forgetting or misremembering prospect details

The `replaceVariables()` function handles all of this automatically in real-time as the agent progresses through the decision tree.
