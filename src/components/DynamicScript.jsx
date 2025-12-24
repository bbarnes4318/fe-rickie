// DynamicScript.jsx
// Component that renders the correct script text based on data source and scenario
// All text displayed to the agent is dynamic based on webhook vs phone inference

import React from 'react';

/**
 * DynamicScript Component
 * Renders the appropriate script text variation based on scenario and data source
 * 
 * @param {Object} props
 * @param {string} props.scenario - Current scenario identifier (e.g., 'verify_location_webhook', 'dob_available')
 * @param {string} props.dataSource - 'webhook' | 'areaCode' | 'manual'
 * @param {Object} props.data - Prospect data object with city, state, dob, firstName, etc.
 * @param {string} props.variant - 'main' | 'yes_response' | 'no_response' | 'objection'
 * @param {string} props.className - Additional CSS classes
 */
const DynamicScript = ({ 
  scenario, 
  dataSource = 'webhook', 
  data = {}, 
  variant = 'main',
  className = '' 
}) => {
  const { 
    city, 
    state, 
    dob, 
    firstName,
    formattedDOB 
  } = data;

  // Format DOB for display
  const displayDOB = formattedDOB || (dob ? new Date(dob).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }) : 'your date of birth');

  // ═══════════════════════════════════════════════════════════════════════════
  // LOCATION VERIFICATION SCRIPTS
  // ═══════════════════════════════════════════════════════════════════════════
  
  const locationScripts = {
    // Scenario A: Webhook Data IS Available (city + state)
    webhook: {
      main: `Thank you. And just to confirm, you are currently residing in **${city || '{city}'}**, **${state || '{state}'}**, correct?`,
      yes_response: `Wonderful. I have family that lives not too far from there. How long have you lived in **${city || '{city}'}**?`,
      no_response: `Oh. What state do you live in?`,
      no_followup: `Oh fantastic. I have family that lives there too. I hear it's a great place. How long have you lived there for?`
    },
    
    // Scenario B: Area Code Logic (state only, no city)
    areaCode: {
      main: `Thank you. And just to confirm, you are currently residing in **${state || '{state}'}**, correct?`,
      yes_response: `Excellent. I have family that lives in **${state || '{state}'}**. How long have you lived in **${state || '{state}'}**?`,
      no_response: `Oh. What state do you live in?`,
      no_followup: `Oh fantastic. I have family that lives there too. I hear it's a great place.`
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // DOB SCREEN SCRIPTS
  // ═══════════════════════════════════════════════════════════════════════════
  
  const dobTransitionScript = `So, here is how I help. Instead of you calling ten different insurance companies and waiting on hold, I can pull all the state-regulated plan rates up right now on my screen and find you discounts that wouldn't be available to you elsewhere... and then we can pick the best plan together that offers you the most coverage at the lowest price. To get those rates accurate, I need to ask you a few more questions. Fair enough?`;

  const dobScripts = {
    // Scenario A: DOB IS Available (Pre-filled)
    available: {
      main: `Fantastic. We have your date of birth as **${displayDOB}**. Is that correct?`,
      yes_response: null, // Proceed to next step
      no_response: `Apologies, let me correct that in the system. What is the correct date of birth?`
    },
    
    // Scenario B: DOB is NOT Available (Empty)
    empty: {
      main: `What is your date of birth?`,
      objection_rebuttal: `I completely understand your concern. The only reason I ask is that these state-regulated plans are strictly based on age. Without your specific date of birth, I can't see the actual rates, and I don't want to quote you a price that ends up being wrong. I just need the basic date to see what you qualify for.`
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SCRIPT SELECTION LOGIC
  // ═══════════════════════════════════════════════════════════════════════════
  
  const getScript = () => {
    switch (scenario) {
      // Location Verification
      case 'verify_location':
        const locSource = dataSource === 'webhook' && city ? 'webhook' : 'areaCode';
        return locationScripts[locSource]?.[variant] || '';
      
      // DOB Screen
      case 'dob_transition':
        return dobTransitionScript;
      
      case 'dob_verify':
        const dobSource = dob ? 'available' : 'empty';
        return dobScripts[dobSource]?.[variant] || '';
      
      case 'dob_objection':
        return dobScripts.empty.objection_rebuttal;
      
      default:
        return '';
    }
  };

  const scriptText = getScript();

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER WITH MARKDOWN-STYLE BOLD
  // ═══════════════════════════════════════════════════════════════════════════
  
  const renderFormattedText = (text) => {
    if (!text) return null;
    
    // Split by bold markers and render appropriately
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return (
          <span key={index} className="font-bold text-cyan-300">
            {boldText}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className={`dynamic-script ${className}`}>
      <p className="text-white text-base leading-relaxed">
        {renderFormattedText(scriptText)}
      </p>
    </div>
  );
};

/**
 * Data Source Indicator Badge
 * Shows whether data came from webhook or was inferred from area code
 */
export const DataSourceBadge = ({ source, className = '' }) => {
  const badges = {
    webhook: {
      label: 'Webhook Data',
      color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      icon: '✓'
    },
    areaCode: {
      label: 'Area Code Inferred',
      color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      icon: '📞'
    },
    manual: {
      label: 'Manual Entry',
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      icon: '✏️'
    }
  };

  const badge = badges[source] || badges.manual;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium border rounded-full ${badge.color} ${className}`}>
      <span>{badge.icon}</span>
      <span>{badge.label}</span>
    </span>
  );
};

export default DynamicScript;
