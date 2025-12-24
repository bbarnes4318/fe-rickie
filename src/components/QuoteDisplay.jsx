// QuoteDisplay.jsx - Integrated quote grid (NOT a popup)
// Auto-calculates using inherited prospect data from WizardContext

import React, { useEffect, useState } from 'react';
import { useWizard } from '../WizardContext';
import CarrierCard from './CarrierCard';

const FACE_AMOUNT_OPTIONS = [3000, 5000, 7500, 10000, 15000, 20000, 25000];

export default function QuoteDisplay() {
  const { 
    prospectData, 
    calculateQuotes, 
    selectQuote, 
    updateProspect,
    goToNode 
  } = useWizard();
  
  const { age, gender, tobacco, faceAmount, quotes, eligibility, carrier: selectedCarrier } = prospectData;
  
  const [sortBy, setSortBy] = useState('price'); // 'price' or 'eligibility'
  const [selectedFaceAmount, setSelectedFaceAmount] = useState(faceAmount || 10000);
  
  // Calculate quotes when component mounts or face amount changes
  useEffect(() => {
    if (age) {
      updateProspect({ faceAmount: selectedFaceAmount });
      calculateQuotes();
    }
  }, [age, selectedFaceAmount, calculateQuotes, updateProspect]);
  
  // Sort quotes
  const sortedQuotes = [...(quotes || [])].sort((a, b) => {
    if (sortBy === 'price') {
      return (a.premium || 999) - (b.premium || 999);
    } else {
      // Sort by eligibility (eligible first), then price
      if (a.isEligible && !b.isEligible) return -1;
      if (!a.isEligible && b.isEligible) return 1;
      return (a.premium || 999) - (b.premium || 999);
    }
  });
  
  // Filter to only show eligible carriers
  const eligibleQuotes = sortedQuotes.filter(q => q.isEligible && q.premium);
  const ineligibleQuotes = sortedQuotes.filter(q => !q.isEligible || !q.premium);
  
  const handleSelectQuote = (quote) => {
    selectQuote(quote.carrier, quote.planType, quote.premium, selectedFaceAmount);
  };
  
  const handleContinue = () => {
    goToNode('presentation_great_news');
  };
  
  // Calculate premiums for different amounts to show options
  const premiumOptions = FACE_AMOUNT_OPTIONS.map(amount => {
    const bestQuote = sortedQuotes.find(q => q.isEligible && q.premium);
    if (!bestQuote) return { amount, premium: null };
    // Rough estimate scaling
    const basePremium = bestQuote.premium;
    const baseAmount = selectedFaceAmount;
    const scaledPremium = (basePremium / baseAmount) * amount;
    return { amount, premium: scaledPremium };
  });
  
  return (
    <div className="quote-display">
      {/* Header */}
      <div className="quote-header">
        <div className="quote-eligibility">
          <span className={`eligibility-badge ${eligibility?.status || 'unknown'}`}>
            {eligibility?.status === 'approved' && '✓ Preferred Tier'}
            {eligibility?.status === 'graded' && '⚠ Graded Tier'}
            {eligibility?.status === 'declined' && '✗ Review Needed'}
          </span>
          {eligibility?.message && (
            <span className="eligibility-message">{eligibility.message}</span>
          )}
        </div>
        
        {/* Face Amount Selector */}
        <div className="face-amount-selector">
          <label>Coverage Amount:</label>
          <div className="amount-buttons">
            {FACE_AMOUNT_OPTIONS.map(amount => (
              <button
                key={amount}
                className={`amount-btn ${selectedFaceAmount === amount ? 'active' : ''}`}
                onClick={() => setSelectedFaceAmount(amount)}
              >
                ${amount.toLocaleString()}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Sort Controls */}
      <div className="quote-controls">
        <div className="sort-toggle">
          <button 
            className={`sort-btn ${sortBy === 'price' ? 'active' : ''}`}
            onClick={() => setSortBy('price')}
          >
            💰 By Price
          </button>
          <button 
            className={`sort-btn ${sortBy === 'eligibility' ? 'active' : ''}`}
            onClick={() => setSortBy('eligibility')}
          >
            ✓ By Approval
          </button>
        </div>
        
        <div className="prospect-summary">
          <span>Age: <strong>{age}</strong></span>
          <span>Gender: <strong>{gender}</strong></span>
          <span>Tobacco: <strong>{tobacco ? 'Yes' : 'No'}</strong></span>
        </div>
      </div>
      
      {/* Quote Grid */}
      <div className="quote-grid">
        {eligibleQuotes.length > 0 ? (
          eligibleQuotes.map(quote => (
            <CarrierCard
              key={`${quote.carrier}-${quote.planType}`}
              quote={{ ...quote, faceAmount: selectedFaceAmount }}
              onSelect={handleSelectQuote}
              isSelected={selectedCarrier === quote.carrier}
            />
          ))
        ) : (
          <div className="no-quotes-message">
            <p>No quotes available for the current criteria.</p>
            <p>Try adjusting the coverage amount or check health questions.</p>
          </div>
        )}
      </div>
      
      {/* Show ineligible carriers collapsed */}
      {ineligibleQuotes.length > 0 && (
        <details className="ineligible-section">
          <summary>
            {ineligibleQuotes.length} carrier(s) not eligible for this profile
          </summary>
          <div className="quote-grid ineligible">
            {ineligibleQuotes.map(quote => (
              <CarrierCard
                key={`${quote.carrier}-${quote.planType}`}
                quote={{ ...quote, faceAmount: selectedFaceAmount }}
                isSelected={false}
              />
            ))}
          </div>
        </details>
      )}
      
      {/* Continue Button */}
      {selectedCarrier && (
        <div className="quote-actions">
          <button className="continue-btn primary" onClick={handleContinue}>
            Continue with {selectedCarrier} →
          </button>
        </div>
      )}
    </div>
  );
}
