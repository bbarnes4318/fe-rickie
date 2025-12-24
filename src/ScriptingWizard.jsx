// ScriptingWizard.jsx - Main wizard container with 100vh layout
// No scrollbars, card-based stepper pattern

import React, { useEffect } from 'react';
import { WizardProvider, useWizard } from './WizardContext';
import ProgressStepper from './components/ProgressStepper';
import WizardCard from './components/WizardCard';

// ═══════════════════════════════════════════════════════════════════
// WIZARD CONTENT (uses context)
// ═══════════════════════════════════════════════════════════════════
function WizardContent() {
  const { 
    goBack, 
    canGoBack, 
    goToNode, 
    updateTimer, 
    resetWizard,
    currentNode,
    prospectData 
  } = useWizard();
  
  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      updateTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [updateTimer]);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Escape = go back
      if (e.key === 'Escape' && canGoBack) {
        goBack();
      }
      // O = open objection hub (quick access)
      if (e.key === 'o' && e.ctrlKey) {
        e.preventDefault();
        goToNode('objection_hub');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canGoBack, goBack, goToNode]);
  
  return (
    <div className="wizard-container">
      {/* Header */}
      <header className="wizard-header">
        <div className="header-left">
          <img 
            src="/amerben (2).png" 
            alt="AmerBen" 
            className="header-logo"
            onError={(e) => e.target.style.display = 'none'}
          />
        </div>
        <ProgressStepper />
        <div className="header-right">
          <button 
            className="header-btn reset-btn"
            onClick={resetWizard}
            title="Reset Call"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
          </button>
        </div>
      </header>
      
      {/* Main Content - Single Card */}
      <main className="wizard-content">
        <WizardCard />
      </main>
      
      {/* Footer */}
      <footer className="wizard-footer">
        <div className="footer-left">
          {canGoBack && (
            <button 
              className="nav-btn back-btn"
              onClick={goBack}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back
            </button>
          )}
        </div>
        
        <div className="footer-center">
          <span className="prospect-tag">
            {prospectData.firstName || 'Prospect'} {prospectData.lastName || ''}
            {prospectData.state && ` • ${prospectData.state}`}
          </span>
        </div>
        
        <div className="footer-right">
          <button 
            className="nav-btn objection-btn"
            onClick={() => goToNode('objection_hub')}
            title="Objection Hub (Ctrl+O)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4M12 16h.01"/>
            </svg>
            Objections
          </button>
        </div>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN EXPORT (wraps with provider)
// ═══════════════════════════════════════════════════════════════════
export default function ScriptingWizard({ initialProspectData = {} }) {
  return (
    <WizardProvider initialProspectData={initialProspectData}>
      <WizardContent />
    </WizardProvider>
  );
}
