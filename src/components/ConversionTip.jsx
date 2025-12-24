// ConversionTip.jsx - Data-driven coaching tip badge
// Displays conversion insights from DEEP_ANALYSIS.json

import React from 'react';

// Color-code by impact level
const getImpactLevel = (liftPoints) => {
  if (liftPoints >= 25) return 'critical';  // 🔥 Red
  if (liftPoints >= 10) return 'high';      // 🟡 Yellow/Orange
  if (liftPoints >= 5) return 'medium';     // 🟢 Green
  return 'low';                              // Blue
};

const extractLift = (text) => {
  // Extract lift points from text like "+29.1 pts"
  const match = text.match(/\+?([\d.]+)\s*pts?/i);
  return match ? parseFloat(match[1]) : 0;
};

export default function ConversionTip({ tip }) {
  if (!tip) return null;
  
  const liftPoints = extractLift(tip.text);
  const impactLevel = getImpactLevel(liftPoints);
  
  const icons = {
    critical: '🔥',
    high: '⚡',
    medium: '💡',
    low: '📊'
  };
  
  return (
    <div className={`conversion-tip tip-${impactLevel}`}>
      <span className="tip-icon">{icons[impactLevel]}</span>
      <div className="tip-content">
        <span className="tip-text">{tip.text}</span>
        {tip.source && (
          <span className="tip-source">{tip.source}</span>
        )}
      </div>
    </div>
  );
}
