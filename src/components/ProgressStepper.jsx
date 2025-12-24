// ProgressStepper.jsx - Phase progress indicator with call timer
// Displays current phase, progress bar, and elapsed time

import React from 'react';
import { useWizard } from '../WizardContext';

const PHASE_LABELS = {
  1: 'Opening',
  2: 'Authority',
  3: 'Health Questions',
  4: 'Budget',
  5: 'Presentation',
  6: 'Price Objection',
  7: 'Think Objection',
  8: 'Family Objection',
  9: 'Trust Objection',
  10: 'Already Covered',
  11: 'Bad Timing',
  12: 'Mail Objection',
  13: 'Application',
  14: 'Banking',
  15: 'Close'
};

export default function ProgressStepper() {
  const { currentPhase, totalPhases, formattedTime, currentNode } = useWizard();
  
  const progressPercent = (currentPhase / totalPhases) * 100;
  const phaseLabel = PHASE_LABELS[currentPhase] || `Phase ${currentPhase}`;
  
  return (
    <div className="progress-stepper">
      <div className="progress-left">
        <span className="phase-badge">
          Phase {currentPhase}/{totalPhases}
        </span>
        <span className="phase-label">{phaseLabel}</span>
      </div>
      
      <div className="progress-center">
        <div className="progress-track">
          <div 
            className="progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
      
      <div className="progress-right">
        <div className="call-timer">
          <svg className="timer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span className="timer-value">{formattedTime}</span>
        </div>
      </div>
    </div>
  );
}
