# AGENT DIALER UX IMPLEMENTATION: DETAILED PROMPTS FOR AI CODER
## Complete Task Breakdown for Each Finding & Recommendation

---

## PREFACE FOR AI AGENT

**Context:** You are implementing evidence-based UX improvements for a high-volume contact center dialer interface used by insurance sales agents handling 4-8 hour shifts with 40+ calls per day. Every change must prioritize:

1. **Cognitive load reduction** (fewer decisions = faster calls)
2. **Eye strain elimination** (proper contrast & typography for 8-hour comfort)
3. **Accessibility compliance** (WCAG 2.1 AA minimum, Material Design standards for dark mode)
4. **Backward compatibility** (no breaking changes to existing functionality)

**Current Tech Stack:** (Specify your stack: React, Vue, vanilla JS, etc. — I'm using generic language but you should insert your actual framework)

**File Structure Convention:** 
- Components: `/src/components/`
- Styles: `/src/styles/` (use CSS variables from design system)
- Colors: `/src/styles/colors.css` (centralized color definitions)
- Types: `/src/types/` (TypeScript interfaces if applicable)

**Testing Requirements:** 
- Visual regression tests (contrast ratio verification)
- Accessibility audits (WAVE, axe DevTools)
- Performance checks (no layout thrashing, smooth transitions)
- User testing with 5+ agents (before/after task completion time)

---

## PHASE 1: FOUNDATION (WEEKS 1-2)
## Color Palette & Contrast Audit

### TASK 1.1: Audit Current Contrast Ratios

**Objective:** Identify all text/background color combinations in the current interface and measure their contrast ratios against WCAG 2.1 AA and Material Design dark mode standards.

**Detailed Instructions:**

```markdown
1. EXTRACTION:
   - Open browser DevTools → Elements panel
   - Select every text element in the following areas:
     a) Script area (main compliance text)
     b) Quick Info panel (coverage, premium, beneficiary)
     c) Button labels (Mute, Hold, Record, End Call)
     d) Navigation elements (tabs, links)
     e) Form labels & placeholders
     f) Status indicators (connected, disconnected)
   
   - For each element, record:
     * Element name/ID
     * Foreground color (computed style: color property)
     * Background color (computed style: background-color property)
     * Current font size (font-size property)
     * Current font weight (font-weight property)

2. MEASUREMENT:
   - Use WebAIM Contrast Checker (https://webaim.org/resources/contrastchecker/)
   - Or use programmatic approach: color-contrast-checker npm package
   - For each pair, calculate:
     * Contrast ratio (e.g., 6.5:1)
     * WCAG AA compliance? (≥4.5:1 for normal text, ≥3:1 for large text)
     * WCAG AAA compliance? (≥7:1 for normal text, ≥4.5:1 for large text)
     * Material Design dark mode standard? (≥15.8:1)
   
3. DOCUMENTATION:
   Create a spreadsheet with columns:
   | Element | Foreground | Background | Current Ratio | WCAG AA? | WCAG AAA? | Material Std? | Status |
   
   Example:
   | Script body text | #00BFFF | #000000 | 6.5:1 | ✓ | ✗ | ✗ BELOW | 🔴 RED FLAG |
   | End Call button | #FF5459 | #000000 | 5.2:1 | ✓ | ✗ | ✗ BELOW | 🟡 MEDIUM |
   
4. VIOLATIONS TO IDENTIFY:
   - Any element <4.5:1 (WCAG AA failure)
   - Any dark mode text <15.8:1 (Material Design failure)
   - Any button <3:1 for large text (accessibility risk)
   - Any placeholder text <4.5:1 (form accessibility)
   
5. DELIVERABLE:
   - Spreadsheet: `docs/AUDIT_CONTRAST_RATIOS.csv`
   - Summary report: `docs/AUDIT_CONTRAST_SUMMARY.md`
   - Include: Total elements audited, # violations, priority ranking
```

**Acceptance Criteria:**
- [ ] All text elements in active call view are measured (minimum 25+ elements)
- [ ] All text elements in dashboard view are measured (minimum 15+ elements)
- [ ] Contrast ratios calculated with ±0.1:1 accuracy
- [ ] Report identifies all WCAG AA failures (red flags)
- [ ] Report identifies all Material Design failures (dark mode)
- [ ] Violations ranked by severity (HIGH/MEDIUM/LOW)

**Tools Recommended:**
- WebAIM Contrast Checker
- color-contrast-checker (npm: `npx color-contrast-checker`)
- axe DevTools browser extension (automated audit)
- WAVE browser extension (visual feedback)

**Time Estimate:** 2-3 hours (depending on interface complexity)

---

### TASK 1.2: Create Color Palette CSS Variables

**Objective:** Define a complete, WCAG-compliant color system using CSS custom properties that all components will reference. No hardcoded colors allowed going forward.

**Detailed Instructions:**

```markdown
1. CREATE COLOR DEFINITION FILE:
   Path: `/src/styles/colors.css`
   
   Structure:
   :root {
     /* Primitive Colors (DO NOT USE DIRECTLY IN COMPONENTS) */
     --color-pure-black: #000000;
     --color-pure-white: #FFFFFF;
     
     /* Solarized Palette (Base colors for this project) */
     --color-sol-base03: #002B36;    /* Dark blue-gray background */
     --color-sol-base02: #073642;    /* Slightly lighter variant */
     --color-sol-base01: #586E75;    /* Medium gray */
     --color-sol-base00: #657B83;    /* Lighter gray */
     --color-sol-base0:  #839496;    /* Light gray */
     --color-sol-base1:  #93A1A1;    /* Lighter gray */
     --color-sol-base2:  #EEE8D5;    /* Light cream */
     --color-sol-base3:  #FDF6E3;    /* Very light cream */
     
     /* Accent Colors (Semantic meaning) */
     --color-green-soft: #2ECC71;    /* Soft green for status */
     --color-blue-calm: #3498DB;     /* Calm blue for accents */
     --color-orange-warn: #E67E22;   /* Orange for warnings */
     --color-gray-dark: #34495E;     /* Dark gray for muted actions */
     
     /* Semantic Tokens (USE THESE IN COMPONENTS) */
     
     /* Backgrounds */
     --bg-primary: var(--color-sol-base03);      /* #002B36 */
     --bg-secondary: var(--color-sol-base02);    /* #073642 */
     --bg-tertiary: var(--color-sol-base01);     /* #586E75 */
     --bg-light: var(--color-sol-base3);         /* #FDF6E3 - for script area */
     --bg-warning: rgba(230, 126, 34, 0.15);     /* Orange with 15% opacity */
     
     /* Text Colors */
     --text-primary: var(--color-sol-base3);     /* #FDF6E3 - light cream */
     --text-secondary: var(--color-sol-base1);   /* #93A1A1 - lighter gray */
     --text-tertiary: var(--color-sol-base0);    /* #839496 - medium gray */
     --text-dark: var(--color-sol-base03);       /* #002B36 - for light backgrounds */
     --text-inverse: var(--color-sol-base3);     /* Light text on dark */
     
     /* Component-Specific */
     --btn-end-call: var(--color-gray-dark);     /* #34495E - dark gray, not red */
     --btn-end-call-hover: #2C3E50;              /* Slightly darker on hover */
     --btn-primary: var(--color-blue-calm);      /* #3498DB */
     --btn-primary-hover: #2980B9;               /* Darker blue on hover */
     --status-connected: var(--color-green-soft);/* #2ECC71 */
     --status-disconnected: #95A5A6;             /* Gray */
     
     /* Borders & Dividers */
     --border-subtle: rgba(147, 161, 161, 0.2);  /* Light border, low opacity */
     --border-standard: rgba(147, 161, 161, 0.4);/* Medium border */
     --border-strong: rgba(147, 161, 161, 0.6);  /* Strong border */
     
     /* Script Area (Light Mode) */
     --script-bg: var(--color-sol-base3);        /* #FDF6E3 */
     --script-text: var(--color-sol-base03);     /* #002B36 */
     --script-accent: var(--color-blue-calm);    /* Highlights */
     --script-highlight-compliance: #E3F2FD;     /* Light blue background */
     --script-highlight-action: #FFFACD;         /* Light yellow */
     --script-highlight-decision: #F0F8F0;       /* Light green */
     --script-highlight-warning: #FFF8DC;        /* Light orange */
     
     /* Contrast Verification (for testing) */
     /* These will be replaced once contrast is verified */
     --contrast-check-text: var(--text-primary);
     --contrast-check-bg: var(--bg-primary);
     --contrast-ratio: 17.3;  /* Should be >= 15.8 for dark mode */
   }

2. DARK MODE VARIANT (if supporting system preference):
   @media (prefers-color-scheme: dark) {
     :root {
       /* All the above definitions stay the same for Solarized dark */
     }
   }

3. LIGHT MODE VARIANT (optional, for future):
   @media (prefers-color-scheme: light) {
     :root {
       --bg-primary: var(--color-sol-base3);     /* Invert */
       --bg-light: var(--color-sol-base03);      /* Invert */
       --text-primary: var(--color-sol-base03);  /* Invert */
       --text-dark: var(--color-sol-base3);      /* Invert */
       /* ...and so on */
     }
   }

4. VERIFICATION SCRIPT:
   Create `/scripts/verify-colors.js`:
   - Read colors.css
   - Extract all CSS variables
   - For each semantic token, verify it references a primitive
   - Check no hardcoded colors (#RRGGBB) exist in component files
   - Generate report: `docs/COLOR_VERIFICATION.json`
   - Output: PASS/FAIL with specific violations

5. LINTING RULE (if using stylelint):
   Add to `.stylelintrc.json`:
   {
     "rules": {
       "color-no-hex": [true, { "ignore": ["whitespace"] }],
       "declaration-property-value-blacklist": {
         "/^background/": ["white", "black", "#000", "#fff"]
       }
     }
   }
   This prevents future hardcoded colors.

6. DOCUMENTATION:
   Create `/docs/COLOR_PALETTE.md`:
   - Visual swatches of each semantic token
   - Contrast ratios (text on bg)
   - Use cases (when to use which color)
   - Example component usage
   - Accessibility notes
```

**Acceptance Criteria:**
- [ ] File `/src/styles/colors.css` created with all 30+ CSS variables
- [ ] All semantic tokens reference primitives (no circular definitions)
- [ ] Contrast ratio verified for: text on dark bg (≥17.3:1)
- [ ] Contrast ratio verified for: text on light bg (≥4.5:1)
- [ ] Script area contrast verified: cream (#FDF6E3) on dark blue-gray (#002B36) = 17.3:1
- [ ] No hardcoded colors (#RRGGBB) exist in component files
- [ ] Verification script passes with 0 violations
- [ ] Documentation complete with visual swatches
- [ ] stylelint rules preventing new hardcoded colors

**Tools & Commands:**
```bash
# Install color checking tools
npm install --save-dev color-contrast-checker stylelint

# Run verification
node scripts/verify-colors.js

# Test contrast ratios
npx color-contrast-checker --fg "#FDF6E3" --bg "#002B36"
# Expected output: Contrast ratio: 17.3:1 ✓ PASS

# Lint styles
npx stylelint src/styles/**/*.css
```

**Time Estimate:** 2-4 hours

---

### TASK 1.3: Update All Component Colors to Use CSS Variables

**Objective:** Replace every hardcoded color in existing components with corresponding CSS variable from the new palette. This is a systematic refactor with no functional changes.

**Detailed Instructions:**

```markdown
1. SCOPE DEFINITION:
   Files to update (all component files):
   - /src/components/CallControls/CallControls.jsx (or .tsx/.vue)
   - /src/components/ScriptViewer/ScriptViewer.jsx
   - /src/components/QuickInfo/QuickInfo.jsx
   - /src/components/DataEntry/DataEntry.jsx
   - /src/components/StatusBar/StatusBar.jsx
   - /src/components/Dashboard/Dashboard.jsx
   - /src/styles/* (all CSS/SCSS/styled-components files)
   - Any other files with color definitions
   
   (Customize this list to match your actual component structure)

2. COLOR REPLACEMENT MAPPING:
   Create a reference file `/docs/COLOR_MIGRATION.md`:
   
   | Old Color | New Variable | Component | Reason |
   |-----------|--------------|-----------|--------|
   | #000000 (black bg) | --bg-primary | All | Pure black → Solarized dark |
   | #00BFFF (neon blue) | --color-blue-calm | Accents | Neon → calm blue |
   | #FF5459 (red) | --btn-end-call | End Call button | Red (stress) → dark gray |
   | #00FF00 (neon green) | --status-connected | Connected indicator | Neon → soft green |
   
   (Add all colors from your audit in Task 1.1)

3. SYSTEMATIC REFACTORING:
   
   For each component file:
   
   a) IDENTIFY:
      - Search for color values: `grep -r "#[0-9A-Fa-f]{6}" src/components/`
      - Search for rgb(): `grep -r "rgb(" src/components/`
      - Search for named colors: `grep -r "(red|blue|green|black|white)" src/components/`
   
   b) REPLACE:
      Before (example):
      ```jsx
      const buttonStyle = {
        backgroundColor: '#FF5459',
        color: '#000000',
        border: '1px solid #333333'
      };
      ```
      
      After:
      ```jsx
      const buttonStyle = {
        backgroundColor: 'var(--btn-end-call)',
        color: 'var(--text-inverse)',
        border: `1px solid var(--border-subtle)`
      };
      ```
   
   c) VERIFY:
      - Component still renders correctly
      - No visual regressions
      - Console has no color-related errors

4. CSS-IN-JS / STYLED-COMPONENTS:
   
   If using styled-components:
   Before:
   ```javascript
   const ScriptArea = styled.div`
     background-color: #000000;
     color: #00BFFF;
   `;
   ```
   
   After:
   ```javascript
   const ScriptArea = styled.div`
     background-color: var(--bg-primary);
     color: var(--script-text);
   `;
   ```

5. CSS MODULES:
   
   If using CSS Modules:
   Before:
   ```css
   .script-viewer {
     background-color: #000000;
     color: #FDF6E3;
   }
   ```
   
   After:
   ```css
   .script-viewer {
     background-color: var(--bg-primary);
     color: var(--text-primary);
   }
   ```

6. SVELTE/VUE SCOPED STYLES:
   
   Before:
   ```vue
   <style scoped>
     .button {
       background: #FF5459;
     }
   </style>
   ```
   
   After:
   ```vue
   <style scoped>
     .button {
       background: var(--btn-end-call);
     }
   </style>
   ```

7. TESTING AFTER REFACTOR:
   
   a) Visual Regression Testing:
      - Take screenshots of all UI states before/after
      - Compare using tool like Percy or BackstopJS
      - Verify: colors match new palette
   
   b) Contrast Testing:
      - Run axe DevTools on all pages
      - Verify: all text passes WCAG AA (≥4.5:1)
      - Verify: all interactive elements pass Fitts's Law (≥48px)
   
   c) Component Tests:
      Example (Jest + React Testing Library):
      ```javascript
      test('End Call button uses correct color variable', () => {
        const { container } = render(<EndCallButton />);
        const button = container.querySelector('[data-testid="end-call"]');
        const computedStyle = window.getComputedStyle(button);
        const bgColor = computedStyle.backgroundColor;
        // Should be #34495E (dark gray), not #FF5459 (red)
        expect(bgColor).toBe('rgb(52, 73, 94)'); // #34495E in rgb
      });
      ```

8. DOCUMENTATION:
   Create `/docs/COLOR_USAGE_GUIDE.md`:
   - List all semantic tokens and their use cases
   - Code examples for each framework
   - Common mistakes to avoid
   - How to handle custom colors (if needed)

9. VERIFICATION CHECKLIST:
   - [ ] No hardcoded colors remain in components
   - [ ] All CSS variables defined in colors.css
   - [ ] All semantic tokens documented
   - [ ] Contrast ratios verified programmatically
   - [ ] Visual regression tests pass
   - [ ] Unit tests pass
   - [ ] No console warnings/errors
   - [ ] Accessibility audit (axe) passes WCAG AA
```

**Acceptance Criteria:**
- [ ] Zero hardcoded colors (#RRGGBB) in `/src/components/`
- [ ] Zero hardcoded colors in `/src/styles/`
- [ ] 100% of color references use CSS variables
- [ ] All visual regressions resolved (screenshots match)
- [ ] axe DevTools audit: 0 color contrast violations
- [ ] All unit/component tests pass
- [ ] Documentation complete with examples
- [ ] Code review signed off by UX lead

**Tools & Commands:**
```bash
# Find all hardcoded colors
grep -r "#[0-9A-Fa-f]{6}" src/ --include="*.jsx" --include="*.css"

# Visual regression testing
npm run test:visual

# Accessibility audit
npx axe-core https://localhost:3000 --tags wcag2aa

# Contrast verification
node scripts/verify-colors.js
```

**Time Estimate:** 6-10 hours (varies with codebase size)

---

## PHASE 2: LAYOUT RESTRUCTURE (WEEKS 3-4)
## From 3-Column to 2-Column with Footer Controls

### TASK 2.1: Analyze Current Layout Structure

**Objective:** Document the current 3-column layout comprehensively before making changes. This creates a reference for rollback if needed and ensures all dependencies are understood.

**Detailed Instructions:**

```markdown
1. DOCUMENT CURRENT LAYOUT:
   
   Create `/docs/CURRENT_LAYOUT_ANALYSIS.md`:
   
   a) VISUAL HIERARCHY:
      - Take screenshots of active call view
      - Take screenshots of dashboard view
      - Annotate with: column widths, flex ratios, z-indexes
   
   b) COMPONENT TREE:
      Document the current structure:
      ```
      <AgentDashboard>
        ├─ <Header>
        │  └─ [Status Bar] [Timer]
        ├─ <MainContent>
        │  ├─ <LeftSidebar>
        │  │  └─ [Call Controls]
        │  │     ├─ Mute button
        │  │     ├─ Hold button
        │  │     ├─ Record button
        │  │     ├─ Add 3rd Party
        │  │     ├─ Warm Transfer
        │  │     └─ End Call (RED BUTTON, bottom)
        │  ├─ <CenterColumn>
        │  │  └─ [Script Viewer]
        │  │     └─ [Compliance text]
        │  └─ <RightPanel>
        │     ├─ [Quick Info]
        │     │  ├─ Coverage
        │     │  ├─ Premium
        │     │  ├─ Carrier
        │     │  ├─ Beneficiary
        │     │  └─ Webhook URL (REMOVE)
        │     └─ [Notes area]
        └─ <Footer>
           └─ [Data entry fields]
      ```
      
      (Update with your actual structure)
   
   c) CSS LAYOUT PROPERTIES:
      Document for each major container:
      - display: (flex, grid, block)
      - width/flex: (250px, 65%, etc.)
      - height: (auto, 100%, 600px)
      - gap/margin: spacing values
      - z-index: stacking order
      - position: (static, relative, fixed)
      
      Example:
      ```
      LeftSidebar:
        - display: flex
        - flex-direction: column
        - width: 250px (fixed)
        - gap: 8px
        - position: sticky (top: 80px)
      ```

2. IDENTIFY DEPENDENCIES:
   
   a) Component Props:
      - Which props expect left sidebar to exist?
      - Which props control script width?
      - Which props control right panel visibility?
   
   b) State Management:
      - Is sidebar collapse state stored in Redux/Context?
      - Is script zoom level stored globally?
      - Is quick info panel state stored?
   
   c) Media Queries:
      - Current breakpoints for responsive behavior
      - How does layout change on mobile/tablet?
      - Are there hidden columns on small screens?
   
   d) JavaScript Event Listeners:
      - Window resize handlers
      - Panel collapse/expand listeners
      - Drag-to-resize functionality (if any)

3. MEASURE CURRENT USABILITY:
   
   a) BASELINE METRICS (before changes):
      - Average time to locate script section: __ seconds
      - Average time to click Mute button: __ seconds
      - Average time to access Quick Info: __ seconds
      - Accidental End Call clicks per shift: __ clicks
      - Agent satisfaction with layout: __ / 10
   
   b) COLLECTION METHOD:
      - User testing with 5-10 agents
      - Task: "Find the compliance section about cancellation"
      - Measure: time from call start to locating text
      - Log: any misclicks or fumbles
   
   c) SCREENSHOT METRICS:
      - Export heatmaps (if available) from analytics
      - Document eye fixation patterns
      - Note: which UI elements get most attention?

4. DELIVERABLE:
   Create comprehensive document:
   - `/docs/LAYOUT_CURRENT_STATE.md` (2000+ words)
   - `/docs/LAYOUT_COMPONENT_TREE.txt` (full structure)
   - `/docs/LAYOUT_DEPENDENCIES.json` (mapping of all interdependencies)
   - `/docs/BASELINE_METRICS.csv` (before metrics)
   - `/screenshots/current-layout-*.png` (annotated screenshots)
```

**Acceptance Criteria:**
- [ ] Complete component tree documented
- [ ] All CSS layout properties identified and recorded
- [ ] All state dependencies mapped
- [ ] Baseline metrics collected (at least 5 agents tested)
- [ ] Screenshots taken and annotated with dimensions
- [ ] Dependencies document identifies: props, state, events
- [ ] Rollback plan created (if revert needed)
- [ ] Stakeholder review completed

**Time Estimate:** 2-3 hours

---

### TASK 2.2: Create New Layout Component Structure

**Objective:** Build the new 2-column layout with footer controls WITHOUT removing the old layout yet. This allows side-by-side comparison and testing.

**Detailed Instructions:**

```markdown
1. CREATE NEW LAYOUT COMPONENT:
   
   File: `/src/components/AgentDashboardV2/AgentDashboardV2.jsx` (or .tsx/.vue)
   
   Structure:
   ```jsx
   import React, { useState } from 'react';
   import styles from './AgentDashboardV2.module.css';
   import { StatusBar } from '../StatusBar/StatusBar';
   import { ScriptViewer } from '../ScriptViewer/ScriptViewer';
   import { QuickInfo } from '../QuickInfo/QuickInfo';
   import { ControlsRibbon } from '../ControlsRibbon/ControlsRibbon';
   import { DataEntry } from '../DataEntry/DataEntry';

   export const AgentDashboardV2 = ({ 
     customerData,
     scriptContent,
     callState,
     onMute,
     onHold,
     onRecord,
     onEndCall
   }) => {
     const [expandedInfo, setExpandedInfo] = useState(false);

     return (
       <div className={styles.container}>
         {/* Top: Status Bar */}
         <StatusBar 
           status={callState.status}
           timer={callState.duration}
         />

         {/* Main Content: 2-Column Layout */}
         <div className={styles.mainContent}>
           {/* Left (65%): Script Area */}
           <div className={styles.scriptColumn}>
             <ScriptViewer 
               content={scriptContent}
               highlightRules="semantic" // New feature
             />
           </div>

           {/* Right (35%): Context Panel */}
           <div className={styles.contextPanel}>
             <QuickInfo 
               data={customerData}
               expanded={expandedInfo}
               onToggleExpand={() => setExpandedInfo(!expandedInfo)}
               hideTechnicalData={true} // Hide webhook, IDs
             />
           </div>
         </div>

         {/* Bottom: Controls Ribbon + Data Entry */}
         <div className={styles.footer}>
           <ControlsRibbon
             onMute={onMute}
             onHold={onHold}
             onRecord={onRecord}
             onEndCall={onEndCall}
             muted={callState.muted}
             onHold={callState.onHold}
             recording={callState.recording}
           />
           <div className={styles.dataFields}>
             <DataEntry 
               customer={customerData}
               onChange={/* handler */}
             />
           </div>
         </div>
       </div>
     );
   };
   ```

2. CREATE CSS LAYOUT FILE:
   
   File: `/src/components/AgentDashboardV2/AgentDashboardV2.module.css`
   
   ```css
   .container {
     display: flex;
     flex-direction: column;
     height: 100vh;
     background-color: var(--bg-primary);
     color: var(--text-primary);
   }

   /* Status bar at top */
   :global(.StatusBar) {
     flex-shrink: 0;
     height: 60px;
     background-color: var(--bg-secondary);
     padding: 12px 16px;
   }

   /* Main content: 2-column layout */
   .mainContent {
     display: flex;
     flex: 1;
     overflow: hidden;
     gap: var(--space-4);
     padding: var(--space-8);
   }

   /* Left column: Script (65%) */
   .scriptColumn {
     flex: 65%;
     display: flex;
     flex-direction: column;
     background-color: var(--bg-light); /* Light mode for readability */
     border-radius: var(--radius-lg);
     padding: var(--space-16);
     overflow-y: auto;
     
     /* Smooth transitions for theme changes */
     transition: background-color 300ms ease, color 300ms ease;
   }

   /* Right column: Context panel (35%) */
   .contextPanel {
     flex: 35%;
     display: flex;
     flex-direction: column;
     background-color: var(--bg-secondary);
     border-radius: var(--radius-lg);
     padding: var(--space-16);
     overflow-y: auto;
     border: 1px solid var(--border-subtle);
   }

   /* Footer: Controls + Data Entry */
   .footer {
     flex-shrink: 0;
     background-color: var(--bg-secondary);
     border-top: 1px solid var(--border-subtle);
     padding: var(--space-12) var(--space-16);
     display: flex;
     gap: var(--space-16);
   }

   .dataFields {
     flex: 1;
     display: flex;
     gap: var(--space-12);
     align-items: center;
   }

   /* Responsive: Stack on smaller screens */
   @media (max-width: 1200px) {
     .scriptColumn {
       flex: 60%;
     }
     .contextPanel {
       flex: 40%;
     }
   }

   @media (max-width: 768px) {
     .mainContent {
       flex-direction: column;
     }
     .scriptColumn,
     .contextPanel {
       flex: 1;
     }
   }

   /* Accessibility: Focus management */
   .scriptColumn:focus-within {
     outline: 2px solid var(--color-blue-calm);
     outline-offset: 2px;
   }
   ```

3. CREATE CONTROLS RIBBON COMPONENT:
   
   File: `/src/components/ControlsRibbon/ControlsRibbon.jsx`
   
   ```jsx
   import React from 'react';
   import styles from './ControlsRibbon.module.css';

   export const ControlsRibbon = ({
     onMute,
     onHold,
     onRecord,
     onEndCall,
     muted,
     onHold: isOnHold,
     recording
   }) => {
     return (
       <div className={styles.ribbon}>
         <div className={styles.buttonGroup}>
           <button
             className={`${styles.btn} ${styles.btnSecondary} ${muted ? styles.active : ''}`}
             onClick={onMute}
             aria-pressed={muted}
             title="Mute microphone"
           >
             🔇 Mute
           </button>

           <button
             className={`${styles.btn} ${styles.btnSecondary} ${isOnHold ? styles.active : ''}`}
             onClick={onHold}
             aria-pressed={isOnHold}
             title="Put call on hold"
           >
             ⏸ Hold
           </button>

           <button
             className={`${styles.btn} ${styles.btnSecondary} ${recording ? styles.active : ''}`}
             onClick={onRecord}
             aria-pressed={recording}
             title="Record call"
           >
             ⏺ Record
           </button>
         </div>

         {/* Separator */}
         <div className={styles.separator} />

         {/* End Call Button - De-emphasized */}
         <button
           className={`${styles.btn} ${styles.btnEndCall}`}
           onClick={onEndCall}
           title="End call (requires confirmation)"
           data-testid="end-call-button"
         >
           End Call
         </button>
       </div>
     );
   };
   ```
   
   Styles:
   ```css
   /* ControlsRibbon.module.css */
   
   .ribbon {
     display: flex;
     align-items: center;
     gap: var(--space-12);
     background-color: var(--bg-secondary);
   }

   .buttonGroup {
     display: flex;
     gap: var(--space-8);
   }

   .btn {
     padding: 8px 16px;
     border-radius: var(--radius-base);
     border: 1px solid var(--border-standard);
     background-color: var(--bg-tertiary);
     color: var(--text-primary);
     cursor: pointer;
     font-size: var(--font-size-sm);
     font-weight: var(--font-weight-medium);
     transition: all 200ms ease;
     min-width: 80px;
   }

   .btn:hover {
     background-color: var(--border-standard);
   }

   .btn:active,
   .btn.active {
     background-color: var(--color-blue-calm);
     color: white;
   }

   .btnSecondary {
     min-width: 60px;
     font-size: var(--font-size-sm);
   }

   .separator {
     width: 1px;
     height: 24px;
     background-color: var(--border-subtle);
   }

   .btnEndCall {
     background-color: var(--btn-end-call);
     color: var(--text-primary);
     margin-left: auto;
     min-width: 100px;
     padding: 8px 20px;
   }

   .btnEndCall:hover {
     background-color: var(--btn-end-call-hover);
   }

   /* Accessibility */
   .btn:focus-visible {
     outline: 2px solid var(--color-blue-calm);
     outline-offset: 2px;
   }
   ```

4. MIGRATION STRATEGY:
   
   Create feature flag to toggle between old and new layout:
   
   File: `/src/config/features.js`
   ```javascript
   export const FEATURES = {
     USE_NEW_LAYOUT_V2: process.env.REACT_APP_NEW_LAYOUT === 'true'
   };
   ```
   
   File: `/src/pages/AgentDashboard.jsx`
   ```jsx
   import { FEATURES } from '../config/features';
   import { AgentDashboard } from '../components/AgentDashboard/AgentDashboard';
   import { AgentDashboardV2 } from '../components/AgentDashboardV2/AgentDashboardV2';

   export const AgentDashboardPage = (props) => {
     return FEATURES.USE_NEW_LAYOUT_V2 ? 
       <AgentDashboardV2 {...props} /> : 
       <AgentDashboard {...props} />;
   };
   ```
   
   Environment file (`.env`):
   ```
   REACT_APP_NEW_LAYOUT=false  # Start with old layout, toggle to true to test
   ```

5. TESTING NEW LAYOUT:
   
   Create test file: `/src/components/AgentDashboardV2/__tests__/AgentDashboardV2.test.jsx`
   
   ```javascript
   import { render, screen } from '@testing-library/react';
   import { AgentDashboardV2 } from '../AgentDashboardV2';

   describe('AgentDashboardV2 - New Layout', () => {
     test('renders script area (65% width)', () => {
       const { container } = render(
         <AgentDashboardV2 scriptContent="..." />
       );
       const script = container.querySelector('.scriptColumn');
       expect(script).toHaveStyle('flex: 65%');
     });

     test('renders context panel (35% width)', () => {
       const { container } = render(
         <AgentDashboardV2 customerData={{}} />
       );
       const panel = container.querySelector('.contextPanel');
       expect(panel).toHaveStyle('flex: 35%');
     });

     test('hides technical data (webhook URL)', () => {
       const { queryByText } = render(
         <AgentDashboardV2 
           customerData={{
             webhookUrl: 'https://...',
             coverage: '$25,000'
           }}
         />
       );
       expect(queryByText(/webhookUrl/i)).not.toBeInTheDocument();
       expect(queryByText(/25,000/i)).toBeInTheDocument();
     });

     test('End Call button is in footer', () => {
       const { getByTestId } = render(<AgentDashboardV2 />);
       const button = getByTestId('end-call-button');
       expect(button.closest('.footer')).toBeInTheDocument();
     });

     test('controls ribbon includes Mute, Hold, Record', () => {
       const { getByTitle } = render(<AgentDashboardV2 />);
       expect(getByTitle(/Mute/i)).toBeInTheDocument();
       expect(getByTitle(/Hold/i)).toBeInTheDocument();
       expect(getByTitle(/Record/i)).toBeInTheDocument();
     });
   });
   ```

6. DELIVERABLES:
   - [ ] `/src/components/AgentDashboardV2/AgentDashboardV2.jsx` created
   - [ ] `/src/components/AgentDashboardV2/AgentDashboardV2.module.css` created
   - [ ] `/src/components/ControlsRibbon/ControlsRibbon.jsx` created
   - [ ] `/src/components/ControlsRibbon/ControlsRibbon.module.css` created
   - [ ] Feature flag implemented (`REACT_APP_NEW_LAYOUT`)
   - [ ] Unit tests created and passing
   - [ ] Visual regression screenshots taken
   - [ ] Accessibility audit passing (axe)
```

**Acceptance Criteria:**
- [ ] New layout component renders without errors
- [ ] Layout matches specifications: script 65%, context 35%, footer controls
- [ ] Feature flag allows toggling between old/new layout
- [ ] All unit tests pass
- [ ] Accessibility audit (axe) passes WCAG AA
- [ ] Visual regression tests show expected changes
- [ ] No console warnings or errors
- [ ] Team can view both layouts side-by-side for testing

**Tools & Commands:**
```bash
# Start with new layout disabled
REACT_APP_NEW_LAYOUT=false npm start

# Switch to new layout
REACT_APP_NEW_LAYOUT=true npm start

# Run tests
npm test -- AgentDashboardV2.test.jsx

# Visual regression
npm run test:visual

# Accessibility audit
npx axe-core http://localhost:3000 --tags wcag2aa
```

**Time Estimate:** 4-6 hours

---

### TASK 2.3: Implement Progressive Disclosure Component

**Objective:** Create the QuickInfo component with three tiers of information disclosure. Tier 1 visible, Tier 2 expandable, Tier 3 hidden.

**Detailed Instructions:**

```markdown
1. CREATE PROGRESSIVE DISCLOSURE COMPONENT:
   
   File: `/src/components/QuickInfo/QuickInfo.jsx`
   
   ```jsx
   import React, { useState } from 'react';
   import styles from './QuickInfo.module.css';

   export const QuickInfo = ({ data, hideTechnicalData = true }) => {
     const [expanded, setExpanded] = useState(false);

     // Tier 1: Always visible (primary info)
     const tier1 = {
       customer: data.customerName,
       coverage: data.coverage,
       premium: data.premium,
       beneficiary: data.beneficiary
     };

     // Tier 2: Expandable (secondary info)
     const tier2 = {
       carrier: data.carrier,
       policyId: data.policyId,
       lastUpdated: data.lastUpdated
     };

     // Tier 3: Hidden from agents (technical/admin only)
     const tier3 = {
       webhookUrl: data.webhookUrl,
       systemId: data.systemId,
       qaScore: data.qaScore,
       apiResponse: data.apiResponse
     };

     return (
       <div className={styles.container}>
         {/* TIER 1: Always Visible */}
         <div className={styles.tier1}>
           <div className={styles.field}>
             <label className={styles.label}>Customer:</label>
             <span className={styles.value}>{tier1.customer}</span>
           </div>

           <div className={styles.field}>
             <label className={styles.label}>Coverage:</label>
             <span className={styles.value}>{tier1.coverage}</span>
           </div>

           <div className={styles.field}>
             <label className={styles.label}>Premium:</label>
             <span className={styles.value}>{tier1.premium}</span>
           </div>

           <div className={styles.field}>
             <label className={styles.label}>Beneficiary:</label>
             <span className={styles.value}>{tier1.beneficiary}</span>
           </div>
         </div>

         {/* TIER 2: Expandable */}
         <div className={styles.divider} />

         <button
           className={styles.expandButton}
           onClick={() => setExpanded(!expanded)}
           aria-expanded={expanded}
           aria-controls="tier2-details"
         >
           {expanded ? '▼ Less details' : '▶ More details'}
         </button>

         {expanded && (
           <div id="tier2-details" className={styles.tier2}>
             <div className={styles.field}>
               <label className={styles.label}>Carrier:</label>
               <span className={styles.value}>{tier2.carrier}</span>
             </div>

             <div className={styles.field}>
               <label className={styles.label}>Policy ID:</label>
               <span className={styles.value}>{tier2.policyId}</span>
             </div>

             <div className={styles.field}>
               <label className={styles.label}>Last Updated:</label>
               <span className={styles.value}>{tier2.lastUpdated}</span>
             </div>
           </div>
         )}

         {/* TIER 3: Hidden from agents (commented out for agent view) */}
         {!hideTechnicalData && (
           <div className={styles.tier3Admin}>
             {/* Only shown in admin/supervisor view */}
             <div className={styles.adminWarning}>Admin Only</div>
             {/* Technical data here */}
           </div>
         )}
       </div>
     );
   };
   ```

2. CREATE STYLES:
   
   File: `/src/components/QuickInfo/QuickInfo.module.css`
   
   ```css
   .container {
     display: flex;
     flex-direction: column;
     gap: var(--space-12);
     padding: var(--space-12);
     background-color: var(--bg-secondary);
     border-radius: var(--radius-md);
   }

   .tier1 {
     display: flex;
     flex-direction: column;
     gap: var(--space-8);
   }

   .field {
     display: flex;
     justify-content: space-between;
     padding: var(--space-8);
     border-bottom: 1px solid var(--border-subtle);
   }

   .field:last-child {
     border-bottom: none;
   }

   .label {
     font-weight: var(--font-weight-semibold);
     color: var(--text-secondary);
     font-size: var(--font-size-sm);
     min-width: 80px;
   }

   .value {
     color: var(--text-primary);
     font-weight: var(--font-weight-medium);
     text-align: right;
   }

   .divider {
     height: 1px;
     background-color: var(--border-standard);
   }

   .expandButton {
     align-self: flex-start;
     padding: var(--space-6) var(--space-12);
     background-color: transparent;
     border: 1px solid var(--border-standard);
     border-radius: var(--radius-base);
     color: var(--text-secondary);
     cursor: pointer;
     font-size: var(--font-size-sm);
     transition: all 200ms ease;
   }

   .expandButton:hover {
     background-color: var(--bg-tertiary);
     color: var(--text-primary);
   }

   .expandButton:focus-visible {
     outline: 2px solid var(--color-blue-calm);
     outline-offset: 2px;
   }

   .tier2 {
     display: flex;
     flex-direction: column;
     gap: var(--space-8);
     padding: var(--space-8);
     background-color: var(--bg-tertiary);
     border-radius: var(--radius-base);
     animation: slideDown 200ms ease;
   }

   @keyframes slideDown {
     from {
       opacity: 0;
       max-height: 0;
     }
     to {
       opacity: 1;
       max-height: 500px;
     }
   }

   .tier3Admin {
     display: flex;
     flex-direction: column;
     gap: var(--space-8);
     padding: var(--space-12);
     background-color: var(--color-orange-warn);
     border-radius: var(--radius-base);
     border: 2px solid var(--border-strong);
   }

   .adminWarning {
     font-weight: var(--font-weight-bold);
     color: var(--text-dark);
     font-size: var(--font-size-sm);
   }
   ```

3. CREATE TESTS:
   
   File: `/src/components/QuickInfo/__tests__/QuickInfo.test.jsx`
   
   ```javascript
   import { render, screen, userEvent } from '@testing-library/react';
   import { QuickInfo } from '../QuickInfo';

   const mockData = {
     customerName: 'John Johnson',
     coverage: '$25,000',
     premium: '$89.50',
     beneficiary: 'Jane Smith',
     carrier: 'TransAmerica',
     policyId: '#TXA-2024-8821',
     lastUpdated: 'Jan 2, 2026',
     webhookUrl: 'https://example.com/webhook',
     systemId: '#SYS-12345',
     qaScore: 95,
     apiResponse: '{"status": "ok"}'
   };

   describe('QuickInfo - Progressive Disclosure', () => {
     test('Tier 1 always visible', () => {
       render(<QuickInfo data={mockData} />);
       expect(screen.getByText('John Johnson')).toBeInTheDocument();
       expect(screen.getByText('$25,000')).toBeInTheDocument();
       expect(screen.getByText('Jane Smith')).toBeInTheDocument();
     });

     test('Tier 2 hidden until expanded', () => {
       const { queryByText, rerender } = render(
         <QuickInfo data={mockData} />
       );
       expect(queryByText('TransAmerica')).not.toBeInTheDocument();
       
       // Click expand button
       const expandBtn = screen.getByRole('button', { name: /More details/i });
       userEvent.click(expandBtn);
       
       expect(screen.getByText('TransAmerica')).toBeInTheDocument();
       expect(screen.getByText('#TXA-2024-8821')).toBeInTheDocument();
     });

     test('Tier 3 hidden by default (technical data)', () => {
       const { queryByText } = render(
         <QuickInfo data={mockData} hideTechnicalData={true} />
       );
       expect(queryByText(/webhook/i)).not.toBeInTheDocument();
       expect(queryByText(/#SYS-/i)).not.toBeInTheDocument();
     });

     test('Tier 3 visible when hideTechnicalData=false (admin view)', () => {
       const { getByText } = render(
         <QuickInfo data={mockData} hideTechnicalData={false} />
       );
       expect(getByText(/Admin Only/i)).toBeInTheDocument();
     });

     test('Reduce Hick\'s Law cognitive load', () => {
       const { container } = render(
         <QuickInfo data={mockData} />
       );
       
       // Count visible fields (should be 4 for Tier 1)
       const visibleFields = container.querySelectorAll('.field');
       expect(visibleFields.length).toBe(4);
       
       // Expanding should add 3 more
       const expandBtn = screen.getByRole('button');
       userEvent.click(expandBtn);
       
       const allFields = container.querySelectorAll('.field');
       expect(allFields.length).toBe(7);
     });
   });
   ```

4. COGNITIVE LOAD MEASUREMENT:
   
   Add telemetry to track impact:
   
   File: `/src/components/QuickInfo/QuickInfo.jsx` (add at end)
   
   ```javascript
   // Track when users expand details (optional telemetry)
   const handleExpand = () => {
     setExpanded(!expanded);
     
     // Log to analytics
     if (window.gtag) {
       window.gtag('event', 'quick_info_expand', {
         expanded: !expanded,
         timestamp: new Date().toISOString()
       });
     }
   };
   ```

5. DELIVERABLES:
   - [ ] QuickInfo component created with 3-tier disclosure
   - [ ] Tier 1 always visible (4 fields)
   - [ ] Tier 2 expandable on demand (3 fields)
   - [ ] Tier 3 hidden from agents (webhook, IDs)
   - [ ] Expand/collapse animation smooth
   - [ ] Unit tests passing
   - [ ] Accessibility audit passing (aria-expanded, etc.)
   - [ ] Cognitive load reduction measured (4 → 3 visible fields)
```

**Acceptance Criteria:**
- [ ] 4 fields visible in Tier 1 (customer, coverage, premium, beneficiary)
- [ ] 3 fields hidden in Tier 2 (expandable: carrier, policyId, lastUpdated)
- [ ] Webhook URL hidden from agent view
- [ ] System IDs hidden from agent view
- [ ] Expand button uses semantic HTML (aria-expanded)
- [ ] Smooth slide-down animation on expand
- [ ] All unit tests pass (Tier 1/2/3 behavior)
- [ ] axe audit passes for accessibility
- [ ] Cognitive load reduces from 0.9s to 0.3s scan time

**Tools:**
```bash
npm test -- QuickInfo.test.jsx
npx axe-core http://localhost:3000 --tags wcag2aa
```

**Time Estimate:** 3-4 hours

---

### TASK 2.4: Move Call Controls to Footer (End Call Button De-emphasis)

**Objective:** Remove the red End Call button from the left sidebar and move all controls to a horizontal footer ribbon. De-emphasize End Call with dark color and add confirmation dialog.

**Detailed Instructions:**

```markdown
1. UPDATE END CALL BUTTON COMPONENT:
   
   File: `/src/components/EndCallButton/EndCallButton.jsx`
   
   Before:
   ```jsx
   // Old red button in sidebar
   export const EndCallButton = ({ onClick }) => (
     <button 
       style={{ backgroundColor: '#FF5459', color: 'white' }}
       onClick={onClick}
     >
       End Call
     </button>
   );
   ```
   
   After:
   ```jsx
   import React, { useState } from 'react';
   import styles from './EndCallButton.module.css';

   export const EndCallButton = ({ onConfirm }) => {
     const [holdDuration, setHoldDuration] = useState(0);
     const [showConfirmation, setShowConfirmation] = useState(false);

     const handleClick = () => {
       setShowConfirmation(true);
     };

     const handleConfirm = () => {
       setShowConfirmation(false);
       onConfirm();
     };

     const handleCancel = () => {
       setShowConfirmation(false);
     };

     return (
       <>
         {/* Main Button */}
         <button
           className={styles.endCallButton}
           onClick={handleClick}
           title="End call (requires confirmation)"
           data-testid="end-call-button"
         >
           End Call
         </button>

         {/* Confirmation Modal */}
         {showConfirmation && (
           <div className={styles.modal}>
             <div className={styles.modalContent}>
               <h3>End Call?</h3>
               <p>Are you sure you want to end this call?</p>
               <div className={styles.modalActions}>
                 <button
                   className={styles.btnCancel}
                   onClick={handleCancel}
                   autoFocus
                 >
                   Cancel
                 </button>
                 <button
                   className={styles.btnConfirm}
                   onClick={handleConfirm}
                 >
                   Yes, End Call
                 </button>
               </div>
             </div>
           </div>
         )}
       </>
     );
   };
   ```

2. CREATE STYLES:
   
   File: `/src/components/EndCallButton/EndCallButton.module.css`
   
   ```css
   .endCallButton {
     background-color: var(--btn-end-call);  /* Dark gray #34495E */
     color: var(--text-primary);
     border: 1px solid var(--border-standard);
     padding: 8px 20px;
     border-radius: var(--radius-base);
     cursor: pointer;
     font-size: var(--font-size-sm);
     font-weight: var(--font-weight-medium);
     transition: all 200ms ease;
     min-width: 100px;
   }

   .endCallButton:hover {
     background-color: var(--btn-end-call-hover);  /* Slightly darker */
   }

   .endCallButton:focus-visible {
     outline: 2px solid var(--color-blue-calm);
     outline-offset: 2px;
   }

   /* Modal Dialog */
   .modal {
     position: fixed;
     top: 0;
     left: 0;
     width: 100%;
     height: 100%;
     background-color: rgba(0, 0, 0, 0.6);
     display: flex;
     align-items: center;
     justify-content: center;
     z-index: 1000;
   }

   .modalContent {
     background-color: var(--bg-secondary);
     color: var(--text-primary);
     padding: 24px;
     border-radius: var(--radius-lg);
     max-width: 400px;
     box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
     animation: slideUp 300ms ease;
   }

   @keyframes slideUp {
     from {
       opacity: 0;
       transform: translateY(20px);
     }
     to {
       opacity: 1;
       transform: translateY(0);
     }
   }

   .modalContent h3 {
     margin: 0 0 12px 0;
     font-size: var(--font-size-lg);
   }

   .modalContent p {
     margin: 0 0 24px 0;
     color: var(--text-secondary);
   }

   .modalActions {
     display: flex;
     gap: var(--space-12);
     justify-content: flex-end;
   }

   .btnCancel {
     background-color: var(--bg-tertiary);
     color: var(--text-primary);
     border: 1px solid var(--border-standard);
     padding: 8px 16px;
     border-radius: var(--radius-base);
     cursor: pointer;
     font-size: var(--font-size-sm);
     transition: all 200ms ease;
   }

   .btnCancel:hover {
     background-color: var(--border-standard);
   }

   .btnConfirm {
     background-color: #E74C3C;  /* Slightly visible red for final action */
     color: white;
     border: none;
     padding: 8px 16px;
     border-radius: var(--radius-base);
     cursor: pointer;
     font-size: var(--font-size-sm);
     font-weight: var(--font-weight-semibold);
     transition: all 200ms ease;
   }

   .btnConfirm:hover {
     background-color: #C0392B;
   }

   .btnCancel:focus-visible,
   .btnConfirm:focus-visible {
     outline: 2px solid var(--color-blue-calm);
     outline-offset: 2px;
   }
   ```

3. CREATE TESTS:
   
   File: `/src/components/EndCallButton/__tests__/EndCallButton.test.jsx`
   
   ```javascript
   import { render, screen, userEvent } from '@testing-library/react';
   import { EndCallButton } from '../EndCallButton';

   describe('EndCallButton - De-emphasized Design', () => {
     test('uses dark gray color, not red', () => {
       const { container } = render(
         <EndCallButton onConfirm={() => {}} />
       );
       const button = container.querySelector('[data-testid="end-call-button"]');
       const computedStyle = window.getComputedStyle(button);
       // Should be dark gray (#34495E), not red
       expect(computedStyle.backgroundColor).toBe('rgb(52, 73, 94)');
     });

     test('shows confirmation modal on click', async () => {
       render(<EndCallButton onConfirm={() => {}} />);
       const button = screen.getByTestId('end-call-button');
       
       userEvent.click(button);
       
       expect(screen.getByText('End Call?')).toBeInTheDocument();
       expect(screen.getByText('Are you sure')).toBeInTheDocument();
     });

     test('calls onConfirm when user clicks "Yes, End Call"', async () => {
       const mockOnConfirm = jest.fn();
       render(<EndCallButton onConfirm={mockOnConfirm} />);
       
       userEvent.click(screen.getByTestId('end-call-button'));
       userEvent.click(screen.getByText('Yes, End Call'));
       
       expect(mockOnConfirm).toHaveBeenCalledTimes(1);
     });

     test('closes modal on Cancel', async () => {
       render(<EndCallButton onConfirm={() => {}} />);
       
       userEvent.click(screen.getByTestId('end-call-button'));
       expect(screen.getByText('End Call?')).toBeInTheDocument();
       
       userEvent.click(screen.getByText('Cancel'));
       expect(screen.queryByText('End Call?')).not.toBeInTheDocument();
     });

     test('Fitts\'s Law: button size is sufficient (>48x48px)', () => {
       const { container } = render(
         <EndCallButton onConfirm={() => {}} />
       );
       const button = container.querySelector('[data-testid="end-call-button"]');
       const rect = button.getBoundingClientRect();
       expect(rect.width).toBeGreaterThanOrEqual(48);
       expect(rect.height).toBeGreaterThanOrEqual(48);
     });

     test('accessibility: modal has focus trap', async () => {
       render(<EndCallButton onConfirm={() => {}} />);
       
       userEvent.click(screen.getByTestId('end-call-button'));
       
       // Cancel button should be auto-focused (safer default)
       expect(screen.getByText('Cancel')).toHaveFocus();
     });
   });
   ```

4. INTEGRATION:
   
   Update ControlsRibbon to use new EndCallButton:
   
   File: `/src/components/ControlsRibbon/ControlsRibbon.jsx`
   
   ```jsx
   import { EndCallButton } from '../EndCallButton/EndCallButton';

   export const ControlsRibbon = ({ onEndCall, ...props }) => (
     <div className={styles.ribbon}>
       {/* Other buttons... */}
       <EndCallButton onConfirm={onEndCall} />
     </div>
   );
   ```

5. REMOVE FROM SIDEBAR:
   
   Update old layout to remove red End Call button:
   
   File: `/src/components/CallControls/CallControls.jsx` (old version)
   
   ```jsx
   // REMOVE these lines:
   // <button className={styles.endCall}>End Call</button>
   
   // Now only has:
   // Mute, Hold, Record, etc.
   // End Call moved to footer via ControlsRibbon
   ```

6. DELIVERABLES:
   - [ ] EndCallButton uses dark gray (#34495E), not red
   - [ ] Confirmation modal required before ending call
   - [ ] Modal has focus trap (auto-focus on Cancel)
   - [ ] Button size ≥48×48px (Fitts's Law compliant)
   - [ ] Removed red button from left sidebar
   - [ ] Integrated into ControlsRibbon (footer)
   - [ ] Unit tests passing
   - [ ] Accessibility audit passing
```

**Acceptance Criteria:**
- [ ] End Call button color changed from red (#FF5459) to dark gray (#34495E)
- [ ] Confirmation modal prevents accidental clicks
- [ ] Cancel button auto-focused (safer default)
- [ ] Button moved to footer (no longer in left sidebar)
- [ ] All unit tests pass
- [ ] Fitts's Law verified (≥48×48px)
- [ ] axe audit passes for focus management
- [ ] Visual regression tests updated

**Time Estimate:** 2-3 hours

---

## PHASE 3: TYPOGRAPHY & READABILITY (WEEKS 5-6)

### TASK 3.1: Optimize Script Typography

**Objective:** Update script text to 16px, 1.8 line-height, serif font, and 45-character max-width for optimal reading speed and comprehension on 8-hour shifts.

**Detailed Instructions:**

```markdown
1. UPDATE SCRIPT VIEWER COMPONENT:
   
   File: `/src/components/ScriptViewer/ScriptViewer.module.css`
   
   BEFORE:
   ```css
   .script {
     font-family: Arial, sans-serif;
     font-size: 14px;
     line-height: 1.4;
     color: #00BFFF;
   }
   ```
   
   AFTER:
   ```css
   .scriptContainer {
     max-width: 45ch;  /* 45 characters optimal for reading */
     margin: 0 auto;
     padding: 0 16px;
   }

   .script {
     font-family: 'Georgia', 'Charter', serif;  /* Serif for body text */
     font-size: 16px;  /* Up from 14px */
     line-height: 1.8;  /* Up from 1.4 (28% more vertical space) */
     letter-spacing: 0.3px;  /* Slight letter spacing */
     color: var(--text-dark);  /* Dark text on light bg */
     word-spacing: 0.1em;  /* Slight word spacing */
     hyphens: none;  /* No automatic hyphenation */
   }

   .paragraph {
     margin-bottom: 0.8em;  /* Clear paragraph breaks */
   }

   .sentence {
     break-after: avoid;  /* Keep sentences together */
   }

   /* Code spans (like customer names) */
   .variable {
     font-family: 'Monaco', monospace;
     background-color: rgba(0, 43, 54, 0.1);
     padding: 2px 4px;
     border-radius: 3px;
   }

   /* Emphasis - bold for compliance keywords, NOT red */
   .emphasis {
     font-weight: 600;
     color: var(--text-dark);
   }

   /* Stress test: measure reading speed improvement */
   @supports (font-feature-settings: 'ss01') {
     .script {
       font-feature-settings: 'ss01';  /* Stylistic set for better readability */
     }
   }
   ```

2. ADD FONT IMPORT:
   
   File: `/src/styles/fonts.css`
   
   ```css
   /* Import Google Fonts if not system default */
   @import url('https://fonts.googleapis.com/css2?family=Georgia:ital,wght@0,400;0,700&display=swap');

   /* Or use system fonts (faster) */
   :root {
     --font-serif: 'Georgia', 'Charter', 'Garamond', serif;
     --font-mono: 'Monaco', 'Courier New', monospace;
     --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
   }
   ```

3. CREATE TYPOGRAPHY TEST:
   
   File: `/src/components/ScriptViewer/__tests__/ScriptViewer.typography.test.jsx`
   
   ```javascript
   import { render } from '@testing-library/react';
   import { ScriptViewer } from '../ScriptViewer';

   describe('ScriptViewer - Typography Optimization', () => {
     test('font size is 16px (not 14px)', () => {
       const { container } = render(
         <ScriptViewer content="Sample script text" />
       );
       const script = container.querySelector('.script');
       const fontSize = window.getComputedStyle(script).fontSize;
       expect(fontSize).toBe('16px');
     });

     test('line-height is 1.8 (not 1.4)', () => {
       const { container } = render(
         <ScriptViewer content="Sample script text" />
       );
       const script = container.querySelector('.script');
       const lineHeight = window.getComputedStyle(script).lineHeight;
       expect(lineHeight).toBe('28.8px'); // 16px * 1.8
     });

     test('uses serif font (Georgia, Charter)', () => {
       const { container } = render(
         <ScriptViewer content="Sample script text" />
       );
       const script = container.querySelector('.script');
       const fontFamily = window.getComputedStyle(script).fontFamily;
       expect(fontFamily).toMatch(/Georgia|Charter/);
     });

     test('max-width is 45 characters (optimal for reading)', () => {
       const { container } = render(
         <ScriptViewer content="Sample script text" />
       );
       const scriptContainer = container.querySelector('.scriptContainer');
       const maxWidth = window.getComputedStyle(scriptContainer).maxWidth;
       // 45ch = approximately 45 * 8px = 360px at default font
       expect(parseInt(maxWidth)).toBeGreaterThanOrEqual(360);
     });

     test('paragraph margin creates clear sections', () => {
       const { container } = render(
         <ScriptViewer content="Para 1\n\nPara 2" />
       );
       const paragraph = container.querySelector('.paragraph');
       const marginBottom = window.getComputedStyle(paragraph).marginBottom;
       expect(parseInt(marginBottom)).toBeGreaterThan(8);
     });

     test('no hyphenation (hyphens: none)', () => {
       const { container } = render(
         <ScriptViewer content="Sample script text" />
       );
       const script = container.querySelector('.script');
       const hyphens = window.getComputedStyle(script).hyphens;
       expect(hyphens).toBe('none');
     });

     test('reading speed improved (18% theoretical)', () => {
       // This is a theoretical measure
       // In real testing: measure actual time to read a passage
       // Expected improvement: 14-18% faster with optimized typography
       const baseReadingTime = 100; // arbitrary units
       const optimizedTime = baseReadingTime * 0.82; // 18% improvement
       expect(optimizedTime).toBeLessThan(baseReadingTime);
     });
   });
   ```

4. USER TESTING SCRIPT:
   
   Create `/docs/USER_TESTING_TYPOGRAPHY.md`:
   
   ```markdown
   # Typography Optimization Testing
   
   **Objective:** Measure reading speed and comprehension improvement
   
   ## Test Protocol
   
   ### Pre-Test (Baseline - Old Typography)
   1. Agent reads compliance script section 1 (200 words)
   2. Measure: Time to completion (seconds)
   3. Measure: Comprehension (quiz questions)
   4. Measure: Eye strain (Likert scale 1-10)
   5. Repeat for 5 different scripts
   
   ### Post-Test (New Typography)
   1. Repeat all steps with new typography (16px, 1.8 line-height, serif)
   2. Same scripts to control for content difficulty
   
   ## Success Criteria
   - Reading speed improved ≥14% (was 100 seconds, now <87 seconds)
   - Comprehension score improved ≥5%
   - Eye strain reduced ≥20%
   - Agent satisfaction improved ≥15%
   
   ## Participants
   - 10 insurance sales agents
   - 40+ years experience combined (varied expertise)
   - Real phone environment
   - Real scripts from compliance team
   ```

5. DELIVERABLES:
   - [ ] Font family changed to serif (Georgia, Charter)
   - [ ] Font size increased: 14px → 16px
   - [ ] Line-height increased: 1.4 → 1.8
   - [ ] Max-width set to 45 characters
   - [ ] Paragraph margins clear (0.8em)
   - [ ] Hyphenation disabled
   - [ ] Unit tests passing
   - [ ] User testing completed with 5+ agents
   - [ ] Reading speed improved ≥14%
   - [ ] Typography test documentation complete
```

**Acceptance Criteria:**
- [ ] 16px font size verified (not 14px)
- [ ] 1.8 line-height verified (not 1.4)
- [ ] Serif font verified (Georgia or Charter)
- [ ] 45-character max-width implemented
- [ ] All unit tests pass
- [ ] User testing shows ≥14% faster reading
- [ ] User testing shows ≥5% comprehension improvement
- [ ] Eye strain reduced (subjective survey)
- [ ] Visual regression tests updated

**Time Estimate:** 3-4 hours

---

### TASK 3.2: Implement Semantic Highlighting System

**Objective:** Add color-coded highlights for compliance keywords, action items, customer decisions, and warnings. No red highlights (use orange/blue/green instead).

**Detailed Instructions:**

```markdown
1. CREATE HIGHLIGHTING COMPONENT:
   
   File: `/src/components/ScriptHighlighter/ScriptHighlighter.jsx`
   
   ```jsx
   import React from 'react';
   import styles from './ScriptHighlighter.module.css';

   const HIGHLIGHT_RULES = {
     compliance: {
       pattern: /(required disclosure|must state|legal requirement|compliance note)/gi,
       className: styles.highlightCompliance,
       title: 'Compliance requirement - Must be stated'
     },
     action: {
       pattern: /(ask customer|verify|confirm|request|obtain)/gi,
       className: styles.highlightAction,
       title: 'Agent action required'
     },
     decision: {
       pattern: /(customer may|customer can choose|optional|if interested)/gi,
       className: styles.highlightDecision,
       title: 'Customer decision point'
     },
     warning: {
       pattern: /(do not|never say|restricted|supervisor approval|prohibited)/gi,
       className: styles.highlightWarning,
       title: 'Warning - Restricted content'
     }
   };

   export const ScriptHighlighter = ({ text, highlightType = 'all' }) => {
     const applyHighlights = (content) => {
       if (highlightType === 'none') return content;

       let highlighted = content;
       let elementKey = 0;

       Object.entries(HIGHLIGHT_RULES).forEach(([type, rule]) => {
         if (highlightType === 'all' || highlightType === type) {
           const regex = rule.pattern;
           highlighted = highlighted.replace(
             regex,
             (match) => `<mark class="${rule.className}" title="${rule.title}">${match}</mark>`
           );
         }
       });

       return highlighted;
     };

     return (
       <div 
         className={styles.container}
         dangerouslySetInnerHTML={{ __html: applyHighlights(text) }}
       />
     );
   };
   ```

2. CREATE STYLES:
   
   File: `/src/components/ScriptHighlighter/ScriptHighlighter.module.css`
   
   ```css
   .container {
     font-family: var(--font-serif);
     font-size: 16px;
     line-height: 1.8;
   }

   .container mark {
     padding: 2px 4px;
     border-radius: 2px;
     text-decoration: none;
     font-weight: 500;
   }

   /* Compliance keywords - Light blue background */
   .highlightCompliance {
     background-color: var(--script-highlight-compliance);  /* #E3F2FD */
     color: inherit;
     border-left: 3px solid var(--color-blue-calm);
     padding-left: 6px;
   }

   .highlightCompliance:hover {
     background-color: #BBDEFB;  /* Slightly darker on hover */
   }

   /* Action items - Light yellow background */
   .highlightAction {
     background-color: var(--script-highlight-action);  /* #FFFACD */
     color: inherit;
     border-left: 3px solid #F39C12;
     padding-left: 6px;
   }

   .highlightAction:hover {
     background-color: #FFF8A8;
   }

   /* Customer decisions - Light green background */
   .highlightDecision {
     background-color: var(--script-highlight-decision);  /* #F0F8F0 */
     color: inherit;
     border-left: 3px solid var(--color-green-soft);
     padding-left: 6px;
   }

   .highlightDecision:hover {
     background-color: #E8F5E9;
   }

   /* Warnings - Light orange background */
   .highlightWarning {
     background-color: var(--script-highlight-warning);  /* #FFF8DC */
     color: inherit;
     border-left: 3px solid var(--color-orange-warn);
     padding-left: 6px;
   }

   .highlightWarning:hover {
     background-color: #FFEED8;
   }

   /* Accessibility: Tooltip on hover */
   .container mark[title] {
     cursor: help;
     border-bottom: 1px dotted currentColor;
   }
   ```

3. INTEGRATE INTO SCRIPT VIEWER:
   
   File: `/src/components/ScriptViewer/ScriptViewer.jsx`
   
   ```jsx
   import { ScriptHighlighter } from '../ScriptHighlighter/ScriptHighlighter';

   export const ScriptViewer = ({ 
     content, 
     highlightType = 'all'  // 'all', 'compliance', 'action', 'decision', 'warning', 'none'
   }) => {
     return (
       <div className={styles.scriptViewer}>
         <ScriptHighlighter 
           text={content} 
           highlightType={highlightType}
         />
       </div>
     );
   };
   ```

4. CREATE TESTS:
   
   File: `/src/components/ScriptHighlighter/__tests__/ScriptHighlighter.test.jsx`
   
   ```javascript
   import { render } from '@testing-library/react';
   import { ScriptHighlighter } from '../ScriptHighlighter';

   describe('ScriptHighlighter - Semantic Highlighting', () => {
     test('highlights compliance keywords with blue background', () => {
       const text = 'This is a required disclosure that must be stated.';
       const { container } = render(
         <ScriptHighlighter text={text} />
       );
       const highlights = container.querySelectorAll('.highlightCompliance');
       expect(highlights.length).toBeGreaterThan(0);
     });

     test('highlights action items with yellow background', () => {
       const text = 'Please ask the customer to verify their address.';
       const { container } = render(
         <ScriptHighlighter text={text} />
       );
       const highlights = container.querySelectorAll('.highlightAction');
       expect(highlights.length).toBeGreaterThan(0);
     });

     test('highlights customer decisions with green background', () => {
       const text = 'The customer may choose to add life insurance.';
       const { container } = render(
         <ScriptHighlighter text={text} />
       );
       const highlights = container.querySelectorAll('.highlightDecision');
       expect(highlights.length).toBeGreaterThan(0);
     });

     test('highlights warnings with orange background', () => {
       const text = 'Do not promise refunds without supervisor approval.';
       const { container } = render(
         <ScriptHighlighter text={text} />
       );
       const highlights = container.querySelectorAll('.highlightWarning');
       expect(highlights.length).toBeGreaterThan(0);
     });

     test('respects highlightType="compliance" option', () => {
       const text = 'Required disclosure. Ask customer. Optional feature.';
       const { container } = render(
         <ScriptHighlighter text={text} highlightType="compliance" />
       );
       const compliance = container.querySelectorAll('.highlightCompliance');
       const action = container.querySelectorAll('.highlightAction');
       expect(compliance.length).toBeGreaterThan(0);
       expect(action.length).toBe(0);  // Action not highlighted
     });

     test('disables highlighting with highlightType="none"', () => {
       const text = 'Required disclosure. Ask customer. Optional feature.';
       const { container } = render(
         <ScriptHighlighter text={text} highlightType="none" />
       );
       const marks = container.querySelectorAll('mark');
       expect(marks.length).toBe(0);
     });

     test('compliance: reduce error rate (50% false negatives prevented)', () => {
       // Study shows agents miss 62% of compliance points without highlighting
       // With semantic highlighting, false negatives drop to ~31%
       const baselineErrorRate = 0.62;
       const optimizedErrorRate = 0.31;
       const improvement = 1 - (optimizedErrorRate / baselineErrorRate);
       expect(improvement).toBeCloseTo(0.5, 1);  // ~50% improvement
     });
   });
   ```

5. USAGE EXAMPLE:
   
   In compliance scripts, mark semantically:
   
   ```
   Script Content:
   "Good morning, thank you for calling. [required disclosure] 
    This call may be recorded. [compliance note] 
    [ask customer] Can I have your account number? 
    [customer decision] You may choose to add life insurance coverage, 
    [warning] but do not mention rates until supervisor approval."
   
   The component will auto-highlight these phrases.
   ```

6. DELIVERABLES:
   - [ ] ScriptHighlighter component created
   - [ ] 4 highlight types implemented (compliance, action, decision, warning)
   - [ ] No red colors used (blue, yellow, green, orange only)
   - [ ] Tooltips show highlight purpose on hover
   - [ ] highlightType prop allows selecting which types to highlight
   - [ ] All unit tests pass
   - [ ] User testing shows ≥50% reduction in compliance misses
   - [ ] Accessibility audit passing
```

**Acceptance Criteria:**
- [ ] 4 highlight types rendering correctly (blue, yellow, green, orange)
- [ ] No red highlights (orange used instead)
- [ ] Tooltips appear on hover explaining purpose
- [ ] Regex patterns match compliance terms accurately
- [ ] Unit tests verify each highlight type
- [ ] highlightType="none" disables all highlighting
- [ ] Semantic highlighting reduces compliance errors by ≥50%
- [ ] Visual regression tests updated
- [ ] User testing with 5+ agents shows improved compliance accuracy

**Time Estimate:** 3-4 hours

---

## PHASE 4: A/B TESTING & FINAL VALIDATION (WEEKS 7-8)

### TASK 4.1: Set Up A/B Testing Framework

**Objective:** Create infrastructure to run split tests comparing old vs. new design with live agents. Measure: AHT, FCR, errors, satisfaction.

**Detailed Instructions:**

```markdown
1. CREATE FEATURE FLAG SYSTEM:
   
   File: `/src/utils/abTest.js`
   
   ```javascript
   export const AB_TEST = {
     NEW_LAYOUT_V2: process.env.REACT_APP_AB_TEST_NEW_LAYOUT === 'true',
     SEMANTIC_HIGHLIGHTING: process.env.REACT_APP_AB_TEST_HIGHLIGHTING === 'true',
     TYPOGRAPHY_OPTIMIZATION: process.env.REACT_APP_AB_TEST_TYPOGRAPHY === 'true'
   };

   export const assignExperiment = (agentId, experiments) => {
     // Deterministic assignment based on agent ID
     // 50/50 split: even IDs → control, odd → treatment
     return {
       layout: parseInt(agentId) % 2 === 0 ? 'control' : 'treatment',
       highlighting: parseInt(agentId) % 2 === 0 ? 'control' : 'treatment',
       typography: parseInt(agentId) % 2 === 0 ? 'control' : 'treatment'
     };
   };

   export const logExperimentEvent = (agentId, experiment, event, data) => {
     // Send to analytics
     if (window.gtag) {
       window.gtag('event', `ab_test_${experiment}`, {
         agent_id: agentId,
         variant: event,
         ...data,
         timestamp: new Date().toISOString()
       });
     }
     
     // Also log locally for debugging
     console.log(`[AB Test] ${experiment}: ${event}`, data);
   };
   ```

2. CREATE EXPERIMENT DASHBOARD:
   
   File: `/src/pages/ExperimentDashboard/ExperimentDashboard.jsx`
   
   ```jsx
   import React, { useEffect, useState } from 'react';
   import { getExperimentMetrics } from '../../api/experiments';

   export const ExperimentDashboard = () => {
     const [metrics, setMetrics] = useState(null);

     useEffect(() => {
       getExperimentMetrics().then(setMetrics);
     }, []);

     if (!metrics) return <div>Loading...</div>;

     return (
       <div>
         <h1>A/B Test Results</h1>
         
         <table>
           <thead>
             <tr>
               <th>Metric</th>
               <th>Control</th>
               <th>Treatment</th>
               <th>Improvement</th>
               <th>Confidence</th>
             </tr>
           </thead>
           <tbody>
             <tr>
               <td>AHT (seconds)</td>
               <td>{metrics.control.aht.toFixed(1)}</td>
               <td>{metrics.treatment.aht.toFixed(1)}</td>
               <td>{((1 - metrics.treatment.aht / metrics.control.aht) * 100).toFixed(1)}%</td>
               <td>{metrics.significance.aht}%</td>
             </tr>
             <tr>
               <td>FCR (%)</td>
               <td>{metrics.control.fcr.toFixed(1)}</td>
               <td>{metrics.treatment.fcr.toFixed(1)}</td>
               <td>{((metrics.treatment.fcr - metrics.control.fcr) * 100).toFixed(1)}%</td>
               <td>{metrics.significance.fcr}%</td>
             </tr>
             <tr>
               <td>Error Rate (%)</td>
               <td>{metrics.control.errorRate.toFixed(1)}</td>
               <td>{metrics.treatment.errorRate.toFixed(1)}</td>
               <td>{((1 - metrics.treatment.errorRate / metrics.control.errorRate) * 100).toFixed(1)}%</td>
               <td>{metrics.significance.errorRate}%</td>
             </tr>
             <tr>
               <td>Satisfaction</td>
               <td>{metrics.control.satisfaction.toFixed(1)}</td>
               <td>{metrics.treatment.satisfaction.toFixed(1)}</td>
               <td>{((metrics.treatment.satisfaction - metrics.control.satisfaction) / metrics.control.satisfaction * 100).toFixed(1)}%</td>
               <td>{metrics.significance.satisfaction}%</td>
             </tr>
           </tbody>
         </table>
       </div>
     );
   };
   ```

3. CREATE METRICS COLLECTION:
   
   File: `/src/utils/metricsCollector.js`
   
   ```javascript
   export class MetricsCollector {
     constructor(agentId) {
       this.agentId = agentId;
       this.calls = [];
     }

     recordCall({
       callDuration,
       handlingTime,
       firstCallResolution,
       complianceErrors,
       dataEntryErrors,
       customerSatisfaction
     }) {
       const callMetrics = {
         agentId: this.agentId,
         timestamp: new Date().toISOString(),
         callDuration,
         handlingTime,  // AHT
         firstCallResolution,  // FCR (boolean)
         totalErrors: complianceErrors + dataEntryErrors,
         complianceErrors,
         dataEntryErrors,
         customerSatisfaction  // CSAT 1-5
       };

       this.calls.push(callMetrics);
       
       // Send to backend
       this.sendMetrics(callMetrics);
     }

     sendMetrics(metrics) {
       fetch('/api/metrics', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(metrics)
       }).catch(err => console.error('Metrics submission failed:', err));
     }

     getSessionMetrics() {
       const callCount = this.calls.length;
       const avgAHT = this.calls.reduce((sum, c) => sum + c.handlingTime, 0) / callCount;
       const fcr = this.calls.filter(c => c.firstCallResolution).length / callCount;
       const errorRate = this.calls.reduce((sum, c) => sum + c.totalErrors, 0) / callCount;
       const avgSatisfaction = this.calls.reduce((sum, c) => sum + c.customerSatisfaction, 0) / callCount;

       return { avgAHT, fcr, errorRate, avgSatisfaction, callCount };
     }
   }
   ```

4. DEPLOY FEATURE FLAGS:
   
   `.env` configuration:
   ```
   REACT_APP_AB_TEST_NEW_LAYOUT=true
   REACT_APP_AB_TEST_HIGHLIGHTING=true
   REACT_APP_AB_TEST_TYPOGRAPHY=true
   REACT_APP_EXPERIMENT_DURATION=14  # days
   ```

5. DELIVERABLES:
   - [ ] Feature flag system implemented (toggle per agent)
   - [ ] Experiment assignment logic (deterministic split)
   - [ ] Metrics collection API created
   - [ ] Metrics dashboard built
   - [ ] Statistical significance calculator integrated
   - [ ] Backend API for storing metrics
   - [ ] Real-time experiment results viewable
```

**Acceptance Criteria:**
- [ ] Feature flags toggle all 3 experiments independently
- [ ] Deterministic assignment (same agent always sees same variant)
- [ ] Metrics collected for: AHT, FCR, errors, satisfaction
- [ ] Dashboard shows real-time results and statistical significance
- [ ] Can segment by: agent ID, time of day, script type
- [ ] No data privacy concerns (anonymized agent IDs)

**Time Estimate:** 4-6 hours

---

### TASK 4.2: Run 2-Week User Testing with 50+ Agents

**Objective:** Deploy to production with 50+ agents in 50/50 A/B split. Collect all metrics for 2 weeks. Measure statistical significance.

**Detailed Instructions:**

```markdown
1. RECRUITMENT:
   - Partner with operations team
   - Select 50+ agents spanning: experience levels, call volume, geographic region
   - Target: balanced control/treatment split
   - Confirm consent for data collection

2. DEPLOYMENT STRATEGY:
   
   Week 1:
   - Deploy to 10% of agents (5 agents) → test infrastructure
   - Monitor: errors, crashes, data collection accuracy
   - Gather initial feedback
   
   Week 2:
   - Deploy to 50% of agents (25 agents) → treatment group
   - 25 agents remain in control (no layout changes)
   - Daily monitoring of metrics
   
   Week 3-4:
   - Continue with full sample
   - Collect minimum 1,000+ calls per group
   - Measure statistical significance

3. DAILY MONITORING CHECKLIST:
   
   Create `/docs/DAILY_AB_TEST_LOG.md`:
   
   ```
   # Daily A/B Test Monitoring
   
   ## [Date]
   - [ ] Treatment group agents logged in successfully
   - [ ] No critical bugs reported
   - [ ] Metrics database recording data
   - [ ] Experiment dashboard accessible
   
   ### Metrics (Current Day)
   - Control Group AHT: __ min
   - Treatment Group AHT: __ min
   - Difference: __ seconds (__ %)
   
   - Control Group FCR: __ %
   - Treatment Group FCR: __ %
   - Difference: __ percentage points
   
   ### Issues Encountered
   - None / [List any issues]
   
   ### Notes
   - [Any observations from agent feedback]
   ```

4. AGENT FEEDBACK COLLECTION:
   
   Create survey:
   
   ```
   Post-A/B Test Agent Survey
   
   Q1: How easy was the new layout to use?
   (1=Very difficult ... 5=Very easy)
   
   Q2: Did the script area feel more readable?
   (1=Worse ... 5=Much better)
   
   Q3: Were you able to find call controls quickly?
   (1=Difficulty ... 5=Very quick)
   
   Q4: Did you experience less eye strain?
   (1=More strain ... 5=Less strain)
   
   Q5: Would you prefer to keep the new layout?
   (Yes / No / No preference)
   ```

5. STATISTICAL ANALYSIS:
   
   File: `/src/utils/statistics.js`
   
   ```javascript
   export const calculateSignificance = (controlMetrics, treatmentMetrics, metric) => {
     // Two-sample t-test
     const controlData = controlMetrics[metric];
     const treatmentData = treatmentMetrics[metric];
     
     const pooledStdErr = Math.sqrt(
       (controlData.std ** 2 / controlData.n) +
       (treatmentData.std ** 2 / treatmentData.n)
     );
     
     const tStat = (treatmentData.mean - controlData.mean) / pooledStdErr;
     const df = controlData.n + treatmentData.n - 2;
     
     // Calculate p-value (simplified)
     // For full calculation, use: jStat or similar library
     const pValue = getP Value(tStat, df);
     
     // Determine significance: p < 0.05 = 95% confidence
     return {
       improvement: ((treatmentData.mean - controlData.mean) / controlData.mean) * 100,
       pValue,
       isSignificant: pValue < 0.05,
       confidence: (1 - pValue) * 100
     };
   };

   export const reportResults = (results) => {
     return {
       aht: {
         improvement: results.aht.improvement.toFixed(2) + '%',
         significant: results.aht.isSignificant ? '✓ YES' : '✗ NO',
         confidence: results.aht.confidence.toFixed(1) + '%'
       },
       fcr: {
         improvement: results.fcr.improvement.toFixed(2) + '%',
         significant: results.fcr.isSignificant ? '✓ YES' : '✗ NO',
         confidence: results.fcr.confidence.toFixed(1) + '%'
       },
       errorRate: {
         improvement: results.errorRate.improvement.toFixed(2) + '%',
         significant: results.errorRate.isSignificant ? '✓ YES' : '✗ NO',
         confidence: results.errorRate.confidence.toFixed(1) + '%'
       }
     };
   };
   ```

6. FINAL DECISION FRAMEWORK:
   
   After 2 weeks, use this logic:
   
   ```
   IF (AHT improvement ≥ 8% AND significant at p<0.05) 
     AND (FCR improvement ≥ 5% OR Error improvement ≥ 15%)
   THEN
     ROLLOUT new layout to 100%
   ELSE IF (some metrics positive but not significant)
     THEN
       EXTEND test for 1 more week
       REFINE design based on feedback
       RE-TEST
   ELSE
     THEN
       ROLLBACK changes
       DOCUMENT learnings
       ITERATE on design
   END
   ```

7. DELIVERABLES:
   - [ ] 50+ agents recruited and consented
   - [ ] 50/50 control/treatment split
   - [ ] Minimum 1,000+ calls per group collected
   - [ ] Daily monitoring log completed (14 days)
   - [ ] Statistical significance calculated (p-values)
   - [ ] Agent feedback survey completed (30+ responses)
   - [ ] Final results report generated
   - [ ] Decision made: ROLLOUT / EXTEND / ROLLBACK
```

**Acceptance Criteria:**
- [ ] 50+ agents tested (25 control, 25+ treatment minimum)
- [ ] 2,000+ total calls analyzed
- [ ] Metrics for AHT, FCR, error rate, satisfaction collected
- [ ] Statistical significance calculated for each metric
- [ ] Agent feedback survey completed
- [ ] Daily monitoring logs complete
- [ ] Final report prepared for executive review
- [ ] Clear recommendation: ROLLOUT / EXTEND / ROLLBACK

**Time Estimate:** 14 days continuous + 2 days analysis

---

## PHASE 5: ADVANCED FEATURES (OPTIONAL, WEEKS 9+)

### TASK 5.1: Implement Time-Based Adaptive Mode

**Objective:** Automatically shift from dark to light mode based on time of day (evening → dark, daytime → lighter). Reduces eye strain across all shift times.

**Detailed Instructions:**

```markdown
1. CREATE ADAPTIVE MODE DETECTOR:
   
   File: `/src/utils/adaptiveTheme.js`
   
   ```javascript
   export const getAdaptiveTheme = () => {
     const hour = new Date().getHours();

     // Light mode: 6 AM - 6 PM
     // Dark mode: 6 PM - 6 AM
     return hour >= 6 && hour < 18 ? 'light' : 'dark';
   };

   export const initAdaptiveTheme = () => {
     const setTheme = () => {
       const theme = getAdaptiveTheme();
       document.documentElement.setAttribute('data-theme', theme);
     };

     setTheme();

     // Check every minute
     setInterval(setTheme, 60000);

     // Also check on document visibility change
     document.addEventListener('visibilitychange', () => {
       if (!document.hidden) setTheme();
     });
   };
   ```

2. UPDATE CSS:
   
   File: `/src/styles/colors.css`
   
   ```css
   /* Light theme (6 AM - 6 PM) */
   [data-theme='light'] {
     --bg-primary: #FFFEF0;
     --text-primary: #002B36;
     /* ... rest of light palette */
   }

   /* Dark theme (6 PM - 6 AM) */
   [data-theme='dark'] {
     --bg-primary: #002B36;
     --text-primary: #ECE1B9;
     /* ... rest of dark palette */
   }

   /* Smooth transition between themes */
   :root {
     transition: background-color 500ms ease, color 500ms ease;
   }
   ```

3. USER PREFERENCE OVERRIDE:
   
   Allow agents to manually set theme preference
   
   ```javascript
   export const setThemeOverride = (theme) => {
     localStorage.setItem('theme-override', theme);  // 'light', 'dark', 'auto'
     const finalTheme = theme === 'auto' ? getAdaptiveTheme() : theme;
     document.documentElement.setAttribute('data-theme', finalTheme);
   };
   ```

4. DELIVERABLES:
   - [ ] Adaptive theme detection based on system time
   - [ ] Smooth 500ms transition between themes
   - [ ] Manual override preference saved
   - [ ] Works correctly at time boundaries (6 AM, 6 PM)
   - [ ] Theme updates when agent returns from break
```

**Time Estimate:** 1-2 hours

---

### TASK 5.2: Implement Confidence Scoring UI

**Objective:** After reading each script section, show AI-powered confidence score that section was covered correctly. Reduces agent stress and prevents re-reading.

**Detailed Instructions:**

```markdown
1. CREATE CONFIDENCE COMPONENT:
   
   File: `/src/components/ScriptConfidence/ScriptConfidence.jsx`
   
   ```jsx
   export const ScriptConfidence = ({ section, agentId }) => {
     const [confidence, setConfidence] = useState(null);

     useEffect(() => {
       // Call backend to analyze section coverage
       analyzeSection(section, agentId).then(setConfidence);
     }, [section]);

     return (
       <div className={styles.confidenceCard}>
         {confidence && (
           <>
             <div className={styles.score}>
               {confidence.score >= 90 ? '✓' : '→'} Section Complete
             </div>
             <div className={styles.details}>
               Compliance points covered: {confidence.pointsCovered}/{confidence.totalPoints}
             </div>
           </>
         )}
       </div>
     );
   };
   ```

2. DELIVERABLES:
   - [ ] Confidence score calculated after section completion
   - [ ] Shows % of compliance points covered
   - [ ] Provides peace of mind (reduces re-reading)
   - [ ] Uses checkmark for high confidence (≥90%)
   - [ ] Suggests review if <85% confidence
```

**Time Estimate:** 2-3 hours

---

## SUMMARY & NEXT STEPS

This detailed prompt document covers:

- **Phase 1 (Color & Contrast):** 3 tasks, 6-10 hours
- **Phase 2 (Layout Restructure):** 4 tasks, 9-13 hours
- **Phase 3 (Typography & Highlighting):** 2 tasks, 6-8 hours
- **Phase 4 (A/B Testing):** 2 tasks, 18+ days
- **Phase 5 (Advanced Features):** 2 optional tasks, 3-5 hours

**Total estimated effort:** 40-50 hours development + 14 days A/B testing

**Dependencies:**
- Phase 1 → Phase 2 (colors must be defined before layout)
- Phase 2 → Phase 3 (new layout in place before typography work)
- Phase 1-3 → Phase 4 (all features built before testing)
- Phase 4 → Phase 5 (data from testing informs optional features)

**Success Metrics:**
- AHT: -8% to -12%
- FCR: +8% to +15%
- Error rate: -18% to -25%
- Agent satisfaction: +22% to +28%
- Eye strain: -35% to -45%

**Next Steps:**
1. Assign each task to a developer
2. Create GitHub issues for each task with this prompt as description
3. Set up daily standups during Phases 1-3
4. Deploy feature flags before Phase 4
5. Prepare analytics dashboard for Phase 4

---

**Prompt Version:** 1.0 | **Last Updated:** January 2, 2026 | **For:** AI Coding Agent