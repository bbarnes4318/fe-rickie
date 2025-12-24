// WizardCard.jsx - Renders the active node based on type
// Handles SCRIPT, DECISION, DATA_COLLECT, QUOTE, OBJECTION_HUB, CLOSE

import React from 'react';
import { useWizard } from '../WizardContext';
import { populateDynamicFields, NODE_TYPES } from '../scriptData';
import ConversionTip from './ConversionTip';
import QuoteDisplay from './QuoteDisplay';

export default function WizardCard() {
  const { currentNode, prospectData, goToNode } = useWizard();
  
  if (!currentNode) {
    return (
      <div className="wizard-card error">
        <h3>Error: Node not found</h3>
      </div>
    );
  }
  
  // Populate dynamic fields like {first_name}, {beneficiary}, etc.
  const populatedScript = populateDynamicFields(currentNode.script, prospectData);
  const populatedPrompt = populateDynamicFields(currentNode.prompt, prospectData);
  
  // Handle button click
  const handleOptionClick = (option) => {
    if (option.nextNode) {
      goToNode(option.nextNode);
    }
  };
  
  const handleContinue = () => {
    if (currentNode.nextNode) {
      goToNode(currentNode.nextNode);
    }
  };
  
  // ═══════════════════════════════════════════════════════════════
  // RENDER BY NODE TYPE
  // ═══════════════════════════════════════════════════════════════
  
  const renderNodeContent = () => {
    switch (currentNode.type) {
      case NODE_TYPES.SCRIPT:
        return (
          <>
            {/* Script Text */}
            <div className="script-content">
              {currentNode.stageDirection && (
                <div className="stage-direction">
                  {currentNode.stageDirection}
                </div>
              )}
              <div 
                className="script-text"
                dangerouslySetInnerHTML={{ 
                  __html: formatScriptText(populatedScript) 
                }}
              />
            </div>
            
            {/* Continue Button */}
            <div className="card-actions">
              <button 
                className="action-btn primary"
                onClick={handleContinue}
              >
                Continue →
              </button>
            </div>
          </>
        );
      
      case NODE_TYPES.DECISION:
        return (
          <>
            {/* Prompt */}
            {populatedPrompt && (
              <div className="decision-prompt">
                {populatedPrompt}
              </div>
            )}
            
            {/* Script if present */}
            {populatedScript && (
              <div 
                className="script-text"
                dangerouslySetInnerHTML={{ 
                  __html: formatScriptText(populatedScript) 
                }}
              />
            )}
            
            {/* Response Options */}
            <div className="response-buttons">
              {currentNode.options?.map((option, idx) => (
                <button
                  key={idx}
                  className={`response-btn ${getButtonVariant(option.label)}`}
                  onClick={() => handleOptionClick(option)}
                >
                  {option.label}
                  {option.stats && (
                    <span className="option-stats">{option.stats}</span>
                  )}
                </button>
              ))}
            </div>
          </>
        );
      
      case NODE_TYPES.QUOTE:
        return (
          <>
            {/* Script Text (for setup) */}
            {populatedScript && (
              <div 
                className="script-text compact"
                dangerouslySetInnerHTML={{ 
                  __html: formatScriptText(populatedScript) 
                }}
              />
            )}
            
            {/* Embedded Quote Display */}
            <QuoteDisplay />
          </>
        );
      
      case NODE_TYPES.OBJECTION_HUB:
        return (
          <>
            <div className="objection-hub-header">
              <p>{currentNode.description}</p>
            </div>
            
            <div className="objection-grid">
              {currentNode.options?.map((option, idx) => (
                <button
                  key={idx}
                  className="objection-btn"
                  onClick={() => handleOptionClick(option)}
                >
                  <span className="objection-label">{option.label}</span>
                  {option.stats && (
                    <span className="objection-stats">{option.stats}</span>
                  )}
                </button>
              ))}
            </div>
          </>
        );
      
      case NODE_TYPES.CLOSE:
        return (
          <>
            <div className="close-celebration">
              <div className="celebration-icon">🎉</div>
              <h2>Sale Complete!</h2>
            </div>
            
            <div 
              className="script-text"
              dangerouslySetInnerHTML={{ 
                __html: formatScriptText(populatedScript) 
              }}
            />
            
            <div className="card-actions">
              <button 
                className="action-btn success"
                onClick={() => window.location.reload()}
              >
                Start New Call
              </button>
            </div>
          </>
        );
      
      case NODE_TYPES.DATA_COLLECT:
        // TODO: Implement data collection form
        return (
          <>
            <div 
              className="script-text"
              dangerouslySetInnerHTML={{ 
                __html: formatScriptText(populatedScript) 
              }}
            />
            <div className="card-actions">
              <button 
                className="action-btn primary"
                onClick={handleContinue}
              >
                Continue →
              </button>
            </div>
          </>
        );
      
      default:
        return (
          <div className="script-text">
            Unknown node type: {currentNode.type}
          </div>
        );
    }
  };
  
  return (
    <div className="wizard-card">
      {/* Card Header */}
      <div className="card-header">
        <h3 className="card-title">
          {currentNode.title}
        </h3>
        {currentNode.timestamp && (
          <span className="card-timestamp">{currentNode.timestamp}</span>
        )}
      </div>
      
      {/* Conversion Tip */}
      {currentNode.conversionTip && (
        <ConversionTip tip={currentNode.conversionTip} />
      )}
      
      {/* Card Content */}
      <div className="card-content">
        {renderNodeContent()}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

function formatScriptText(text) {
  if (!text) return '';
  
  // Convert markdown-style formatting to HTML
  return text
    // Bold: **text** -> <strong>text</strong>
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Italic brackets: [text] -> <em>[text]</em> (stage directions)
    .replace(/\[([^\]]+)\]/g, '<em class="direction">[$1]</em>')
    // Newlines to <br>
    .replace(/\n/g, '<br/>');
}

function getButtonVariant(label) {
  if (label.includes('✅')) return 'success';
  if (label.includes('❌')) return 'danger';
  if (label.includes('⚠️')) return 'warning';
  if (label.includes('🤔')) return 'warning';
  if (label.includes('💰')) return 'warning';
  if (label.includes('❓')) return 'info';
  return 'default';
}
