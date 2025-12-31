# Dynamic Variables Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PHONE SYSTEM                              │
│  (Delivers call with customer data via webhook)                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │   WEBHOOK      │
                    │   PAYLOAD      │
                    └────────┬───────┘
                             │
         Example Data: ──────┤
         {                   │
           first_name: "Mary"│
           last_name: "Johnson"
           state: "Texas"    │
           age: 72           │
           dob: "05/12/1952" │
         }                   │
                             │
                             ▼
┌────────────────────────────────────────────────────────────────┐
│               WebhookHandler.jsx                                │
│  - Receives webhook POST request                               │
│  - Validates required fields                                   │
│  - Dispatches 'webhookReceived' event                          │
└────────────────────────────┬───────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────┐
│               CallPopApp.jsx                                    │
│  - Listens for 'webhookReceived' event                         │
│  - Creates screen pop with prospect data                       │
│  - Opens IntegratedScriptPanel                                 │
└────────────────────────────┬───────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────┐
│            IntegratedScriptPanel.jsx                            │
│  - Receives prospectData prop                                  │
│  - Loads scriptData.js                                         │
│  - Starts at STARTING_NODE ('greeting_start')                  │
└────────────────────────────┬───────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────┐
│                 scriptData.js                                   │
│  SCRIPT_NODES['greeting_start'] = {                           │
│    script: "Hello, this is {agent_name}, the licensed         │
│             field underwriter for the state of {state}."       │
│  }                                                             │
└────────────────────────────┬───────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────┐
│            replaceVariables(script, prospectData)              │
│                                                                │
│  Input:  "Hello, this is {agent_name}, the licensed           │
│           field underwriter for the state of {state}."         │
│                                                                │
│  Process: Replace {state} → prospectData.state → "Texas"      │
│           Replace {agent_name} → "John Smith"                 │
│                                                                │
│  Output: "Hello, this is John Smith, the licensed             │
│           field underwriter for the state of Texas."           │
└────────────────────────────┬───────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────┐
│                     RENDERED SCRIPT                            │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ 👋 The Trust Anchor                                  │    │
│  │                                                      │    │
│  │ Hello, this is John Smith, the licensed field       │    │
│  │ underwriter for the state of Texas.                 │    │
│  │                                                      │    │
│  │ I have you listed here as Mary Johnson, residing   │    │
│  │ in Texas, is that correct?                          │    │
│  │                                                      │    │
│  │ [✅ Yes]  [❌ No]                                    │    │
│  └──────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────────┘
```

## Variable Mapping Flow

```
WEBHOOK DATA          →    PROSPECT DATA OBJECT    →    SCRIPT VARIABLE
─────────────────────      ─────────────────────       ───────────────
first_name: "Mary"    →    prospectData.first_name →    {first_name}
last_name: "Johnson"  →    prospectData.last_name  →    {last_name}
state: "TX"           →    prospectData.state      →    {state}
age: 72               →    prospectData.age        →    {age}
dob: "05/12/1952"     →    prospectData.dob        →    {dob}

                     RENDERED IN SCRIPT AS:
                     ─────────────────────
                     "Hello, this is [agent], the licensed field
                      underwriter for the state of Texas.

                      I have you listed here as Mary Johnson,
                      residing in Texas, is that correct?

                      And I have your date of birth listed as
                      05/12/1952, making you 72 years young, correct?"
```

## Data Collection During Call

As the agent progresses through the script, additional data is captured:

```
NODE: beneficiary_child
─────────────────────────────────────────
Agent asks: "Okay, and what is your child's name?"
Prospect responds: "Sarah"

CAPTURED: prospectData.beneficiary = "Sarah"

USED IN NEXT NODE:
─────────────────────────────────────────
"Does Sarah live close by to you in Texas, or are
 they in a different state?"
                ↑                        ↑
       {beneficiary}                {state}
```

## Quote Calculator Integration

```
NODE: quote_high (Phase 5)
─────────────────────────────────────────
QUOTE CALCULATOR RUNS:
  Input:  age=72, state="TX", smoker=false
  Output: coverage=$15,000, premium=$95/month

STORED IN:
  prospectData.coverage_high = "15,000"
  prospectData.premium_high = "95"

RENDERED:
─────────────────────────────────────────
"Option 1 is the Maximum Protection. This provides
 $15,000 for Sarah, and that runs $95 per month."
     ↑             ↑                    ↑
{coverage_amount_high}  {beneficiary}  {monthly_premium_high}
```

## Complete Variable Lifecycle

```
1. WEBHOOK RECEIVED
   ├─ first_name: "Mary"
   ├─ last_name: "Johnson"
   ├─ state: "TX"
   └─ age: 72

2. STORED IN STATE
   WizardContext.prospectData = {
     first_name: "Mary",
     last_name: "Johnson",
     state: "TX",
     age: 72
   }

3. SCRIPT NODE LOADED
   node.script = "Hello, {first_name}..."

4. VARIABLES REPLACED
   replaceVariables(node.script, prospectData)
   → "Hello, Mary..."

5. AGENT READS SCRIPT
   [Screen displays personalized script]

6. PROSPECT RESPONDS
   Agent clicks option → navigates to next node

7. DATA COLLECTED
   prospectData.beneficiary = "Sarah"

8. NEXT NODE USES NEW DATA
   "Does {beneficiary} live close..."
   → "Does Sarah live close..."

9. CYCLE REPEATS
   Through all 80+ nodes across 9 phases
```

## Variable Categories

### 🔵 Demographic (From Webhook)

- {agent_name}
- {first_name}
- {last_name}
- {state}
- {city}
- {dob}
- {age}
- {address}

### 💜 Relationship (Collected During Call)

- {beneficiary}
- {beneficiary_relationship}
- {contingent_beneficiary}

### 🟢 Health (Collected During Call)

- {tobacco_type}
- {height_weight}
- {medications_list}
- {heart_condition_date}
- {respiratory_details}
- {insulin_start_age}
- {cancer_status}
- {hospital_reason}

### 🟡 Financial (From Quote Calculator)

- {coverage_amount}
- {coverage_amount_high}
- {coverage_amount_mid}
- {coverage_amount_low}
- {monthly_premium}
- {monthly_premium_high}
- {monthly_premium_mid}
- {monthly_premium_low}
- {premium_min}

### 🔴 Banking (Collected During Call)

- {bank_name}
- {routing_number}
- {account_number}
- {ss_payment_date}
- {draft_date}

## Error Handling

```javascript
// If variable is missing, system uses fallback:
{
  first_name: prospectData.first_name || "there",
  beneficiary: prospectData.beneficiary || "your loved one",
  state: prospectData.state || "your state"
}

Example:
─────────
Missing beneficiary data:
"Does {beneficiary} live close..."
→ "Does your loved one live close..."
         ↑
    Fallback value
```

## Real-Time Updates

```
As agent progresses through call:

prospectData = {
  // From webhook
  first_name: "Mary",
  state: "TX",

  // Added at node: beneficiary_child
  beneficiary: "Sarah",

  // Added at node: tobacco_check
  tobacco: false,

  // Added at node: medication_list
  medications_list: "Lisinopril, Metformin",

  // Added after quote calculation
  selected_coverage: "10,000",
  selected_premium: "75",

  // All variables available for any node
}

Every node has access to ALL collected data!
```
