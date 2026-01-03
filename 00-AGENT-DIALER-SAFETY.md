# 🚨 CRITICAL: AGENT DIALER PROTECTION PROTOCOL
## READ THIS FIRST BEFORE MAKING ANY CODE CHANGES

**Status:** MANDATORY SAFETY BRIEFING | **Priority:** HIGHEST  
**Scope:** Agent Dialer UX Changes ONLY  
**Component:** `src/CallPopApp.jsx` and related UI components  
**Applies to:** All developers working on agent-facing dialer UI changes

---

## ⚠️ CRITICAL RULE #1: DO NOT TOUCH BACKEND

Your task is **AGENT DIALER FRONTEND ONLY**. The backend APIs and Puppeteer automation are complete, tested, and working correctly. Breaking them will break the entire application.

### What You CANNOT Change:

```
❌ DO NOT MODIFY server/ directory (backend APIs)
❌ DO NOT CHANGE Puppeteer automation (americanAmicable.js)
❌ DO NOT TOUCH database schema or connection logic
❌ DO NOT MODIFY Express routes or API endpoints
❌ DO NOT CHANGE JWT authentication
❌ DO NOT ALTER form data field names in INITIAL_DATA
❌ DO NOT TOUCH package.json dependencies (backend)
❌ DO NOT CHANGE Dockerfile or deployment config
```

**Violation of this rule = PRODUCTION OUTAGE. Do not do it.**

---

## ⚠️ CRITICAL RULE #2: THESE AGENT DIALER COMPONENTS ARE YOUR SCOPE

Your task is to improve the **CallPopApp.jsx** interface and **agent-facing views ONLY**. Here's what changes where:

### AGENT DIALER COMPONENT STRUCTURE

```
src/
├─ CallPopApp.jsx                    ← MAIN AGENT DIALER (this is your primary focus)
│  ├─ Header/StatusBar               ← Shows: call status, timer, muted indicator
│  ├─ MainContent (2-column layout)  ← THIS IS WHERE YOUR CHANGES GO
│  │  ├─ LEFT COLUMN (65%)
│  │  │  └─ ScriptViewer             ← Script text display (TYPOGRAPHY CHANGES HERE)
│  │  │                                  • Font size: 14px → 16px
│  │  │                                  • Line height: 1.4 → 1.8
│  │  │                                  • Font: sans-serif → Georgia (serif)
│  │  │                                  • ADD: Semantic highlighting (colors)
│  │  │
│  │  └─ RIGHT COLUMN (35%)
│  │     └─ QuickInfo                 ← Customer context (PROGRESSIVE DISCLOSURE HERE)
│  │                                     • Tier 1: Customer, Coverage, Premium, Beneficiary (VISIBLE)
│  │                                     • Tier 2: Carrier, Policy ID, Last Updated (EXPANDABLE)
│  │                                     • Tier 3: Webhook, System IDs (HIDDEN from agents)
│  │
│  ├─ Footer (NEW)                   ← CONTROLS MOVED HERE (layout redesign)
│  │  ├─ ControlsRibbon              ← Mute, Hold, Record, End Call buttons
│  │  │  └─ EndCallButton            ← Color change: Red → Dark Gray
│  │  │                                  Add: Confirmation dialog
│  │  └─ DataEntry fields            ← Form inputs at bottom
│  │
│  └─ LeftSidebar (REMOVE)           ← DELETE: Call Controls sidebar
│                                        These move to Footer/ControlsRibbon
│
├─ IntegratedScriptPanel.jsx         ← May contain script text (UPDATE colors)
├─ App.jsx                           ← Form creation (DO NOT CHANGE form logic)
└─ api.js                            ← API calls (DO NOT CHANGE endpoints)
```

---

## 🎯 SPECIFIC CHANGES BY VIEW/COMPONENT

### 1️⃣ SCRIPT VIEWER (LEFT COLUMN, 65%)

**File:** `src/components/ScriptViewer/ScriptViewer.jsx` (or similar)

**SAFE Changes (DO THIS):**
```css
/* ✅ Update typography */
.script {
  font-family: 'Georgia', serif;    /* Change from sans-serif */
  font-size: 16px;                   /* Change from 14px */
  line-height: 1.8;                  /* Change from 1.4 */
  max-width: 45ch;                   /* Add 45-character limit */
}

/* ✅ Add semantic highlighting (NO RED colors) */
.highlight-compliance {
  background-color: #E3F2FD;         /* Light blue */
  border-left: 3px solid #3498DB;    /* Blue accent */
}

.highlight-action {
  background-color: #FFFACD;         /* Light yellow */
  border-left: 3px solid #F39C12;    /* Orange accent */
}

.highlight-decision {
  background-color: #F0F8F0;         /* Light green */
  border-left: 3px solid #2ECC71;    /* Green accent */
}

.highlight-warning {
  background-color: #FFF8DC;         /* Light orange */
  border-left: 3px solid #E67E22;    /* Orange accent (NOT red) */
}

/* ✅ Update background/text colors */
.script-bg {
  background-color: var(--color-bg-light);  /* Light cream for reading */
  color: var(--color-text-dark);            /* Dark text on light */
}
```

**DANGEROUS Changes (DO NOT DO THIS):**
```javascript
// ❌ DO NOT change script text field names
const scriptData = {
  // complianceText: '',        // DO NOT rename!
  // agentNotes: '',            // DO NOT rename!
  // These field names are referenced in backend automation
}

// ❌ DO NOT modify how script data is fetched
// Endpoint /api/scripts/ must NOT change

// ❌ DO NOT add red highlighting
.highlight { color: #FF5459; }  // ❌ NO - Don't do this
```

---

### 2️⃣ QUICK INFO PANEL (RIGHT COLUMN, 35%)

**File:** `src/components/QuickInfo/QuickInfo.jsx` (or similar)

**SAFE Changes (DO THIS):**
```javascript
// ✅ TIER 1: Always visible (4 fields, minimal cognitive load)
export const QuickInfo = ({ data }) => {
  return (
    <div>
      {/* These 4 fields ALWAYS show */}
      <Field label="Customer" value={data.customerName} />
      <Field label="Coverage" value={data.coverage} />
      <Field label="Premium" value={data.premium} />
      <Field label="Beneficiary" value={data.beneficiary} />

      {/* TIER 2: Expandable on demand (3 more fields) */}
      <button onClick={() => setExpanded(!expanded)}>More Details</button>
      {expanded && (
        <>
          <Field label="Carrier" value={data.carrier} />
          <Field label="Policy ID" value={data.policyId} />
          <Field label="Last Updated" value={data.lastUpdated} />
        </>
      )}

      {/* TIER 3: Hidden from agents (technical data) */}
      {/* 🚫 NEVER show these to agents:
          - data.webhookUrl
          - data.systemId
          - data.qaScore
          - data.apiResponse
      */}
    </div>
  );
};

// ✅ Update colors only
.tier1 { background-color: var(--bg-secondary); }
.tier2 { background-color: var(--bg-tertiary); }
```

**DANGEROUS Changes (DO NOT DO THIS):**
```javascript
// ❌ DO NOT add webhook/system data to agent view
<Field label="Webhook" value={data.webhookUrl} /> // ❌ Hidden from agents

// ❌ DO NOT change the visible field names
// "Customer" must stay "Customer" (not "Customer Name" or "Name")
// These are referenced in backend queries

// ❌ DO NOT remove any Tier 1 fields
// Agents need to see: Customer, Coverage, Premium, Beneficiary
// Removing these breaks the call flow
```

---

### 3️⃣ CONTROLS RIBBON (FOOTER, NEW)

**File:** `src/components/ControlsRibbon/ControlsRibbon.jsx` (NEW component)

**SAFE Changes (CREATE THIS):**
```javascript
// ✅ New footer component with all controls
export const ControlsRibbon = ({ onMute, onHold, onRecord, onEndCall }) => {
  return (
    <div className={styles.footer}>
      {/* Mute, Hold, Record - existing buttons, moved from sidebar */}
      <button onClick={onMute}>🔇 Mute</button>
      <button onClick={onHold}>⏸ Hold</button>
      <button onClick={onRecord}>⏺ Record</button>

      {/* End Call - DE-EMPHASIZED */}
      <button 
        onClick={onEndCall} 
        style={{ backgroundColor: '#34495E' }}  // Dark gray, NOT red
      >
        End Call
      </button>
    </div>
  );
};

// ✅ Update button colors
.btn-mute { background-color: var(--color-blue-calm); }
.btn-hold { background-color: var(--color-blue-calm); }
.btn-record { background-color: var(--color-blue-calm); }
.btn-end-call { background-color: #34495E; }  // Dark gray instead of #FF5459 (red)

// ✅ Add confirmation dialog for End Call
const [showConfirm, setShowConfirm] = useState(false);
if (showConfirm) {
  return (
    <Modal>
      <h3>End Call?</h3>
      <p>Are you sure you want to end this call?</p>
      <button onClick={confirmEnd}>Yes, End Call</button>
      <button onClick={() => setShowConfirm(false)}>Cancel</button>
    </Modal>
  );
}
```

**DANGEROUS Changes (DO NOT DO THIS):**
```javascript
// ❌ DO NOT keep the red End Call button
backgroundColor: '#FF5459'  // ❌ NO - remove red button from sidebar

// ❌ DO NOT make these buttons call backend without confirmation
// Agent might accidentally click while thinking about customer
// Confirmation dialog is REQUIRED for safety

// ❌ DO NOT remove the Mute/Hold/Record buttons
// Agents NEED quick access to these controls during calls
```

---

### 4️⃣ CALL CONTROLS SIDEBAR (REMOVE/DELETE)

**File:** `src/components/CallControls/CallControls.jsx` (or similar)

**SAFE Changes (DELETE THIS):**
```javascript
// ✅ All controls from left sidebar move to footer
// Delete or disable the sidebar component:
// - Mute button → moves to ControlsRibbon
// - Hold button → moves to ControlsRibbon
// - Record button → moves to ControlsRibbon
// - Red End Call button → moves to ControlsRibbon (changed to dark gray)
// - Add 3rd Party → moves to ControlsRibbon
// - Warm Transfer → moves to ControlsRibbon

// ✅ Update CallPopApp.jsx layout from 3-column to 2-column
// Remove: <LeftSidebar />
// Update: <MainContent> to use script (65%) + context (35%)
```

**DANGEROUS Changes (DO NOT DO THIS):**
```javascript
// ❌ DO NOT delete the button click handlers
// Example: onMute must still exist and work
// Just move the UI, not the logic

// ❌ DO NOT change button behavior
// Mute button must still call the same backend endpoint
// Only the appearance/layout changes
```

---

### 5️⃣ DATA ENTRY FIELDS (BOTTOM OF FOOTER)

**File:** `src/components/DataEntry/DataEntry.jsx` (or similar)

**SAFE Changes (UPDATE STYLING):**
```css
/* ✅ Update form styling to match new color palette */
.form-field {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-subtle);
}

.form-field:focus {
  border-color: var(--color-blue-calm);
  outline: 2px solid var(--color-focus-ring);
}

/* ✅ Update input labels */
.label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
}
```

**DANGEROUS Changes (DO NOT DO THIS):**
```javascript
// ❌ DO NOT rename any form fields
// These field names match INITIAL_DATA in App.jsx
// Renaming breaks backend form submission
// Example:
  // <input name="ssn" />     // ✓ CORRECT
  // <input name="social_security_number" /> // ❌ WRONG

// ❌ DO NOT change form validation logic
// Only styling changes allowed
// Validation must stay the same (backend expects certain formats)

// ❌ DO NOT move form fields out of view
// Agents need access to: SSN, address, DOB, etc.
// These are required to submit applications
```

---

## 📋 AGENT DIALER SAFETY CHECKLIST

**Before each commit, verify:**

- [ ] **Did I modify CallPopApp.jsx?**
  - If YES → Verify it only changes LAYOUT/STYLING, not data flow
  
- [ ] **Did I change any form field names?**
  - If YES → REVERT IMMEDIATELY
  
- [ ] **Did I modify /api endpoints?**
  - If YES → REVERT IMMEDIATELY
  
- [ ] **Did I use red color (#FF5459) for highlighting?**
  - If YES → Change to orange/blue/green instead
  
- [ ] **Did I hide any Tier 1 QuickInfo fields?**
  - If YES → REVERT (Customer, Coverage, Premium, Beneficiary must be visible)
  
- [ ] **Did I remove the End Call button?**
  - If YES → Restore it (moved to footer, but must exist)
  
- [ ] **Can I submit a complete test application?**
  - If NO → You broke something, revert
  
- [ ] **Did I test the script typography?**
  - If NO → Test before committing (font, size, line-height)

---

## 🚨 EMERGENCY: I BROKE THE AGENT DIALER

If agents report the dialer is broken:

1. **STOP everything**
2. **Check what you changed:**
   ```bash
   git diff HEAD~1  # See your last change
   ```
3. **Look for:**
   - Did I rename a form field?
   - Did I change an API endpoint?
   - Did I modify QuickInfo structure?
   - Did I remove the End Call button?

4. **Revert immediately:**
   ```bash
   git revert HEAD  # Undo your change
   npm run dev      # Test if it works
   ```

5. **DO NOT PUSH** until it's working

---

## 📚 YOUR SAFE SCOPE (Agent Dialer Only)

### Phase 1: Colors & Styling ✅
- Change colors in CSS variables
- Update all hardcoded colors to use --bg-*, --text-*, etc.
- Apply Solarized dark theme throughout

### Phase 2: Layout Redesign ✅
- Move controls from left sidebar to footer (ControlsRibbon)
- Change from 3-column to 2-column layout
- Script: 65% width, Context: 35% width
- End Call button: Red → Dark Gray

### Phase 3: Script Improvements ✅
- Font: 14px → 16px
- Line-height: 1.4 → 1.8
- Font-family: sans-serif → Georgia (serif)
- Add semantic highlighting (blue/yellow/green/orange)

### Phase 4: Progressive Disclosure ✅
- QuickInfo: Show 4 fields (Tier 1)
- Hide webhook/system data (Tier 3)
- Add "More Details" button for Tier 2

### ❌ YOU CANNOT DO THIS (Not Your Scope)

- Modify backend APIs
- Change form field structure
- Alter Puppeteer automation
- Change database schema
- Modify JWT/authentication
- Change application submission logic

---

## 🎯 Remember

**AGENT DIALER** = What agents SEE and INTERACT WITH  
**Backend** = How applications WORK and GET SUBMITTED

You are improving what agents SEE.  
DO NOT TOUCH how applications get submitted.

```
Mess with the interface = Bad UX
Mess with the backend = BROKEN APPLICATIONS
```

---

**This is your safety briefing. Acknowledge you understand by starting work AFTER reading this entire document.**

**Now proceed to the Agent-Coder-Prompts.md for your detailed implementation tasks.**

---

**Last Updated:** January 3, 2026 | **Severity:** CRITICAL | **Scope:** Agent Dialer Frontend Only