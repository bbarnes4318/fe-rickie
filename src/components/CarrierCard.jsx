// CarrierCard.jsx - Logo-based carrier display for quotes
// Shows carrier logo, plan type, coverage, and pricing

import React from 'react';

// Carrier logo mapping
const CARRIER_LOGOS = {
  'Aflac': '/logos/aflac.png',
  'SBLI': '/logos/sbli.png',
  'CICA': '/logos/cica.png',
  'Corebridge': '/logos/corebridge.png',
  'GTL': '/logos/gtl.png',
  'American Amicable': '/logos/amam.png',
  'Royal Neighbors': '/logos/royal.png',
  'Transamerica': '/logos/trans.png',
  'Gerber': '/logos/gerber.png',
  'Mutual of Omaha': '/logos/mutual.png'
};

// Plan type badges
const PLAN_BADGES = {
  'Level': { label: 'Level', color: 'emerald', description: 'Full coverage from day 1' },
  'Graded': { label: 'Graded', color: 'amber', description: '2-year graded benefits' },
  'Modified': { label: 'Modified', color: 'amber', description: 'Modified benefits' },
  'Guaranteed Issue': { label: 'GI', color: 'blue', description: 'No health questions' },
  'ROP': { label: 'ROP', color: 'purple', description: 'Return of Premium' }
};

export default function CarrierCard({ quote, onSelect, isSelected }) {
  const { carrier, planType, premium, faceAmount, isEligible } = quote;
  
  const logo = CARRIER_LOGOS[carrier] || null;
  const planInfo = PLAN_BADGES[planType] || PLAN_BADGES['Level'];
  
  return (
    <div 
      className={`carrier-card ${isSelected ? 'selected' : ''} ${!isEligible ? 'disabled' : ''}`}
      onClick={() => isEligible && onSelect?.(quote)}
    >
      {/* Logo */}
      <div className="carrier-logo-container">
        {logo ? (
          <img 
            src={logo} 
            alt={carrier} 
            className="carrier-logo"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="carrier-logo-fallback" style={{ display: logo ? 'none' : 'flex' }}>
          {carrier.charAt(0)}
        </div>
      </div>
      
      {/* Carrier Name & Plan */}
      <div className="carrier-info">
        <h4 className="carrier-name">{carrier}</h4>
        <span className={`plan-badge badge-${planInfo.color}`}>
          {planInfo.label}
        </span>
      </div>
      
      {/* Coverage */}
      <div className="coverage-amount">
        ${faceAmount?.toLocaleString()}
      </div>
      
      {/* Premium */}
      <div className="premium-display">
        <span className="premium-amount">
          ${premium?.toFixed(2)}
        </span>
        <span className="premium-period">/mo</span>
      </div>
      
      {/* Eligibility indicator */}
      {!isEligible ? (
        <div className="eligibility-warning">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>Not eligible</span>
        </div>
      ) : (
        <button className="select-btn">
          {isSelected ? '✓ Selected' : 'Select'}
        </button>
      )}
    </div>
  );
}
