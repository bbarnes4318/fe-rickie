import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Copy, Check, X, MessageSquare, User, MapPin, Phone, Calendar, Heart, RefreshCw, DollarSign, Calculator } from 'lucide-react';
import { getScriptByType, populateDynamicFields } from './scriptData';
import { getScriptTypeFromDID, FORCE_SCRIPT_TYPE } from './didConfig';
import { HEALTH_QUESTIONS, calculateEligibility, getAllCarrierQuotes, CARRIERS } from './quoteCalculator';

/**
 * IntegratedScriptPanel Component - With Inline Quoting
 * 
 * All content fits in viewport without vertical scrolling.
 * Includes health questions and carrier quote comparison.
 */
const IntegratedScriptPanel = ({ 
  prospectData, 
  did = null, 
  scriptTypeOverride = null,
  onClose = null,
  onQuoteSelect = null
}) => {
  // Script state
  const [currentPhase, setCurrentPhase] = useState(0);
  const [currentScriptIndex, setCurrentScriptIndex] = useState(0);
  const [transferType, setTransferType] = useState('blind');
  const [copiedId, setCopiedId] = useState(null);
  const [showObjectionPanel, setShowObjectionPanel] = useState(false);
  const [selectedObjection, setSelectedObjection] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});
  
  // Quote state
  const [showQuotePanel, setShowQuotePanel] = useState(false);
  const [healthAnswers, setHealthAnswers] = useState({});
  const [selectedCarrier, setSelectedCarrier] = useState(null);
  const [coverageAmount, setCoverageAmount] = useState(prospectData?.coverage_amount || 15000);

  // Determine script type from DID or override
  const scriptType = useMemo(() => {
    if (FORCE_SCRIPT_TYPE) return FORCE_SCRIPT_TYPE;
    if (scriptTypeOverride) return scriptTypeOverride;
    return getScriptTypeFromDID(did);
  }, [did, scriptTypeOverride]);

  // Get script data
  const script = useMemo(() => getScriptByType(scriptType), [scriptType]);
  const phases = script.phases;
  const currentPhaseData = phases[currentPhase];

  // Copy text to clipboard
  const copyText = (text, id) => {
    const processedText = populateDynamicFields(text, prospectData);
    navigator.clipboard.writeText(processedText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Navigation
  const goToPhase = (index) => {
    setCurrentPhase(index);
    setCurrentScriptIndex(0);
  };
  const nextPhase = () => {
    if (currentPhase < phases.length - 1) {
      setCurrentPhase(currentPhase + 1);
      setCurrentScriptIndex(0);
    }
  };
  const prevPhase = () => {
    if (currentPhase > 0) {
      setCurrentPhase(currentPhase - 1);
      setCurrentScriptIndex(0);
    }
  };
  const resetScript = () => {
    setCurrentPhase(0);
    setCurrentScriptIndex(0);
    setCheckedItems({});
  };

  // Get current scripts (filtered for transfer type)
  const getVisibleScripts = () => {
    const content = currentPhaseData.content;
    if (content.type === 'scripts') {
      return content.scripts.filter(s => !s.variant || s.variant === transferType);
    }
    if (content.type === 'mixed') {
      return content.items.filter(i => i.type === 'script').filter(s => !s.variant || s.variant === transferType);
    }
    return [];
  };

  const visibleScripts = getVisibleScripts();
  const hasMultipleScripts = visibleScripts.length > 1;
  const currentScript = visibleScripts[currentScriptIndex] || visibleScripts[0];

  // Navigate within scripts on a phase
  const nextScript = () => {
    if (currentScriptIndex < visibleScripts.length - 1) {
      setCurrentScriptIndex(currentScriptIndex + 1);
    } else {
      nextPhase();
    }
  };
  const prevScript = () => {
    if (currentScriptIndex > 0) {
      setCurrentScriptIndex(currentScriptIndex - 1);
    } else {
      prevPhase();
    }
  };

  // Toggle checklist
  const toggleCheckItem = (itemId) => {
    setCheckedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  // Show objection
  const showObjection = (objection) => {
    setSelectedObjection(objection);
    setShowObjectionPanel(true);
  };

  // Calculate eligibility based on health answers
  const eligibility = useMemo(() => calculateEligibility(healthAnswers), [healthAnswers]);
  
  // Get age from prospect data
  const prospectAge = prospectData?.age || (prospectData?.dob ? 
    Math.floor((new Date() - new Date(prospectData.dob)) / (365.25 * 24 * 60 * 60 * 1000)) : 65);
  const prospectGender = prospectData?.gender || 'Male';
  const prospectTobacco = healthAnswers['tobacco'] || false;
  
  // Get carrier quotes
  const carrierQuotes = useMemo(() => {
    if (!prospectAge) return {};
    return getAllCarrierQuotes(prospectAge, prospectGender, prospectTobacco, coverageAmount, eligibility);
  }, [prospectAge, prospectGender, prospectTobacco, coverageAmount, eligibility]);
  
  // Handle health answer change
  const handleHealthAnswer = (questionId, answer) => {
    setHealthAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  // Handle carrier selection
  const handleSelectCarrier = (carrier, premium) => {
    setSelectedCarrier(carrier);
    if (onQuoteSelect) {
      onQuoteSelect({ carrier, premium, coverage: coverageAmount, eligibility });
    }
  };

  // Render inline quote panel - COMPACT TWO-COLUMN DESIGN
  const renderQuotePanel = () => (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-white rounded-lg border border-slate-200 overflow-hidden">
      {/* Top Bar - Prospect + Coverage + Eligibility in one row */}
      <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 px-3 py-1.5 flex items-center gap-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Calculator size={12} className="text-white/80" />
          <span className="text-[10px] font-bold text-white uppercase">Quote</span>
        </div>
        <div className="flex-1 flex items-center gap-4 text-[10px] text-white/90">
          <span><b>{prospectData?.first_name || 'Prospect'}</b> • {prospectAge}yo {prospectGender}</span>
          <div className="flex items-center gap-1">
            <span>Coverage:</span>
            <input 
              type="range" min="5000" max="50000" step="5000"
              value={coverageAmount}
              onChange={(e) => setCoverageAmount(parseInt(e.target.value))}
              className="w-12 h-1 accent-white"
            />
            <span className="font-bold">${(coverageAmount/1000)}k</span>
          </div>
        </div>
        <div className={`px-2 py-0.5 rounded text-[9px] font-bold ${
          eligibility.status === 'standard' ? 'bg-white/20 text-white' :
          eligibility.status === 'modified' ? 'bg-amber-400 text-amber-900' :
          eligibility.status === 'graded' ? 'bg-orange-400 text-orange-900' :
          'bg-red-400 text-red-900'
        }`}>
          {eligibility.plan}
        </div>
        <button onClick={() => setShowQuotePanel(false)} className="text-white/60 hover:text-white">
          <X size={12} />
        </button>
      </div>
      
      {/* Main Content - Two Column Split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Health Toggle Chips */}
        <div className="w-44 p-2 border-r border-slate-100 flex flex-col">
          <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">Health Screening</div>
          <div className="flex-1 flex flex-col gap-1">
            {/* Tobacco */}
            <button
              onClick={() => handleHealthAnswer('tobacco', !healthAnswers['tobacco'])}
              className={`px-2 py-1 rounded text-[9px] font-medium text-left transition-all ${
                healthAnswers['tobacco'] ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              🚬 Tobacco
            </button>
            {/* Knockout - combined */}
            <button
              onClick={() => handleHealthAnswer('q1', !healthAnswers['q1'])}
              className={`px-2 py-1 rounded text-[9px] font-medium text-left transition-all ${
                healthAnswers['q1'] ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              🏥 Hospice/Oxygen/Cancer
            </button>
            <button
              onClick={() => handleHealthAnswer('q2', !healthAnswers['q2'])}
              className={`px-2 py-1 rounded text-[9px] font-medium text-left transition-all ${
                healthAnswers['q2'] ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ⚠️ Terminal/Dialysis
            </button>
            {/* Modified */}
            <button
              onClick={() => handleHealthAnswer('q4', !healthAnswers['q4'])}
              className={`px-2 py-1 rounded text-[9px] font-medium text-left transition-all ${
                healthAnswers['q4'] ? 'bg-orange-100 text-orange-800 border border-orange-300' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ❤️ Heart/Stroke 2yr
            </button>
            <button
              onClick={() => handleHealthAnswer('q5', !healthAnswers['q5'])}
              className={`px-2 py-1 rounded text-[9px] font-medium text-left transition-all ${
                healthAnswers['q5'] ? 'bg-orange-100 text-orange-800 border border-orange-300' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              🎗️ Cancer 2yr
            </button>
            {/* Graded */}
            <button
              onClick={() => handleHealthAnswer('q8a', !healthAnswers['q8a'])}
              className={`px-2 py-1 rounded text-[9px] font-medium text-left transition-all ${
                healthAnswers['q8a'] ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              💊 Hepatitis/Alcohol
            </button>
          </div>
        </div>
        
        {/* Right: Carrier Quote Grid */}
        <div className="flex-1 p-2 flex flex-col">
          <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">Available Carriers (sorted by price)</div>
          <div className="flex-1 grid grid-cols-3 gap-1.5 content-start">
            {Object.entries(carrierQuotes).sort((a,b) => a[1].premium - b[1].premium).slice(0,9).map(([carrier, data], idx) => (
              <button
                key={carrier}
                onClick={() => handleSelectCarrier(carrier, data.premium)}
                className={`p-1.5 rounded border text-center transition-all ${
                  selectedCarrier === carrier 
                    ? 'bg-emerald-50 border-emerald-500 shadow-sm ring-1 ring-emerald-500' 
                    : 'bg-white border-slate-200 hover:border-cyan-400 hover:shadow-sm'
                } ${idx === 0 ? 'ring-1 ring-emerald-300' : ''}`}
              >
                {idx === 0 && <div className="text-[8px] font-bold text-emerald-600 -mt-0.5">LOWEST</div>}
                <div className="text-[9px] font-semibold text-slate-700 truncate">{carrier}</div>
                <div className="text-sm font-bold text-emerald-600">${data.premium}</div>
                <div className="text-[8px] text-slate-400">{data.planType}</div>
              </button>
            ))}
          </div>
          {/* Selected Summary */}
          {selectedCarrier && (
            <div className="mt-1.5 p-2 bg-emerald-50 border border-emerald-200 rounded flex items-center justify-between">
              <div>
                <span className="text-[10px] text-emerald-600">Selected:</span>
                <span className="text-xs font-bold text-emerald-800 ml-1">{selectedCarrier}</span>
              </div>
              <div className="text-lg font-bold text-emerald-700">
                ${carrierQuotes[selectedCarrier]?.premium}/mo
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Compact script card (single script fills content area)
  const renderCompactScript = (scriptItem) => {
    if (!scriptItem) return null;
    const processedText = populateDynamicFields(scriptItem.text, prospectData);
    const cardId = `${currentPhase}-${scriptItem.id}`;
    
    const styleColors = {
      critical: 'border-l-4 border-red-500',
      warning: 'border-l-4 border-amber-500',
      success: 'border-l-4 border-emerald-500',
      default: 'border-l-4 border-blue-500'
    };
    const style = scriptItem.style || 'default';
    
    return (
      <div className={`h-full flex flex-col bg-white rounded-lg ${styleColors[style]} shadow-sm overflow-hidden`}>
        {/* Script Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-100 flex-shrink-0">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            {scriptItem.title}
          </span>
          <div className="flex items-center gap-2">
            {hasMultipleScripts && (
              <span className="text-xs text-slate-400">
                {currentScriptIndex + 1}/{visibleScripts.length}
              </span>
            )}
            <button
              onClick={() => copyText(scriptItem.text, cardId)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-all ${
                copiedId === cardId 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'hover:bg-slate-200 text-slate-500'
              }`}
            >
              {copiedId === cardId ? <Check size={12} /> : <Copy size={12} />}
              {copiedId === cardId ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
        
        {/* Script Content - No scroll */}
        <div className="flex-1 p-3 overflow-hidden">
          <div className="text-[13px] text-slate-800 leading-snug h-full">
            {processedText.split('\n').filter(line => line.trim()).map((line, i) => {
              const isInstruction = (line.startsWith('(') && line.includes(')')) || (line.startsWith('[') && line.includes(']'));
              const isBullet = line.startsWith('•');
              const isQuote = line.startsWith('"');
              
              if (isInstruction) {
                return <p key={i} className="text-slate-400 italic text-xs my-1">{line}</p>;
              }
              if (isBullet) {
                return <p key={i} className="ml-3 my-0.5">{line}</p>;
              }
              if (isQuote) {
                return <p key={i} className="font-medium text-slate-900 my-1">{line}</p>;
              }
              return <p key={i} className="my-0.5">{line}</p>;
            })}
          </div>
        </div>
      </div>
    );
  };

  // Render setup phase (transfer type selection)
  const renderSetup = () => {
    const content = currentPhaseData.content;
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <h2 className="text-lg font-bold text-slate-800 mb-1">{content.heading}</h2>
        <p className="text-xs text-slate-500 mb-4 text-center max-w-sm">{content.description}</p>
        
        {content.options && (
          <div className="flex gap-4 mb-4">
            {content.options.map(option => (
              <button
                key={option.id}
                onClick={() => {
                  setTransferType(option.id);
                  nextPhase();
                }}
                className={`flex flex-col items-center px-6 py-4 rounded-xl transition-all ${
                  option.id === 'warm' 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                }`}
              >
                <span className="text-xl mb-1">{option.icon}</span>
                <span className="font-bold text-sm">{option.label}</span>
                <span className="text-xs opacity-80">{option.description}</span>
              </button>
            ))}
          </div>
        )}
        
        {!content.options && (
          <button
            onClick={nextPhase}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all"
          >
            Start Application →
          </button>
        )}
        
        {content.alert && (
          <div className={`mt-4 max-w-md flex gap-2 p-3 rounded-lg text-xs ${
            content.alert.type === 'danger' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>
            <span className="font-bold flex-shrink-0">{content.alert.type === 'danger' ? '⚠️' : '💡'}</span>
            <div>
              <span className="font-bold">{content.alert.title}:</span> {content.alert.text}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render checklist (compact grid)
  const renderChecklist = (checklist) => {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-3 h-full flex flex-col">
        <div className="text-xs font-bold uppercase text-slate-500 mb-2">{checklist.title}</div>
      <div className="grid grid-cols-1 gap-1.5 flex-1 overflow-hidden">
          {checklist.items.map((item, i) => {
            const itemId = `${currentPhase}-${checklist.id}-${i}`;
            const isChecked = checkedItems[itemId];
            return (
              <label 
                key={itemId}
                className={`flex items-center gap-2 p-2 rounded text-xs cursor-pointer transition-all ${
                  isChecked ? 'bg-blue-50 border border-blue-200' : 'bg-slate-50 border border-slate-100 hover:border-blue-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked || false}
                  onChange={() => toggleCheckItem(itemId)}
                  className="w-3.5 h-3.5 accent-blue-600"
                />
                <span className="text-slate-700 leading-tight">{item}</span>
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  // Render compliance checklist
  const renderCompliance = () => {
    const content = currentPhaseData.content;
    return (
      <div className="h-full flex flex-col">
        <h2 className="text-sm font-bold text-slate-800 mb-2">{content.heading}</h2>
        <div className="grid grid-cols-2 gap-3 flex-1">
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 flex flex-col">
            <div className="text-xs font-bold uppercase text-emerald-700 mb-2">✓ MUST Do</div>
            <div className="space-y-1 text-xs">
              {content.mustDo.map((item, i) => (
                <label key={i} className="flex items-start gap-1.5 text-slate-700">
                  <input type="checkbox" className="mt-0.5 accent-emerald-600" />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex flex-col">
            <div className="text-xs font-bold uppercase text-red-700 mb-2">✕ MUST NOT Do</div>
            <div className="space-y-1 text-xs">
              {content.mustNot.map((item, i) => (
                <div key={i} className="flex items-start gap-1.5 text-slate-700">
                  <span className="text-red-500 text-xs">✕</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {content.goldenRule && (
          <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-2 text-center">
            <span className="text-xs font-bold text-amber-700">⭐ {content.goldenRule}</span>
          </div>
        )}
      </div>
    );
  };

  // Render mixed content (script + checklist side by side)
  const renderMixed = () => {
    const content = currentPhaseData.content;
    const checklist = content.items.find(i => i.type === 'checklist');
    const scriptItem = currentScript;
    const alert = content.items.find(i => i.type === 'alert');
    
    return (
      <div className="h-full flex flex-col">
        <h2 className="text-sm font-bold text-slate-800 mb-2">{content.heading}</h2>
        {alert && (
          <div className={`mb-2 flex gap-2 p-2 rounded text-xs ${
            alert.style === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>
            <span className="font-bold">⚠️ {alert.title}:</span> {alert.text}
          </div>
        )}
        <div className="flex-1 grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            {scriptItem && renderCompactScript(scriptItem)}
          </div>
          <div className="flex flex-col">
            {checklist && renderChecklist(checklist)}
          </div>
        </div>
      </div>
    );
  };

  // Render payment/grid content
  const renderPaymentGrid = () => {
    const content = currentPhaseData.content;
    const grid = content.items.find(i => i.type === 'grid');
    const scriptItem = content.items.find(i => i.type === 'script');
    
    return (
      <div className="h-full flex flex-col">
        <h2 className="text-sm font-bold text-slate-800 mb-2">{content.heading}</h2>
        <div className="flex-1 flex gap-3">
          {grid && (
            <div className="w-1/3 flex flex-col gap-2">
              {grid.cards.map((card, j) => (
                <div key={j} className={`bg-white border rounded-lg p-2 ${
                  card.style === 'warning' ? 'border-t-2 border-t-amber-500' : 'border-t-2 border-t-blue-500'
                }`}>
                  <div className="text-xs font-bold text-slate-600 mb-1">{card.title}</div>
                  {card.items.map((item, k) => (
                    <div key={k} className="text-xs text-slate-600">{item}</div>
                  ))}
                </div>
              ))}
            </div>
          )}
          {scriptItem && (
            <div className="flex-1">
              {renderCompactScript(scriptItem)}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Main content renderer
  const renderPhaseContent = () => {
    const content = currentPhaseData.content;
    
    switch (content.type) {
      case 'setup':
        return renderSetup();
      case 'scripts':
        return (
          <div className="h-full flex flex-col">
            <h2 className="text-sm font-bold text-slate-800 mb-2">{content.heading}</h2>
            {content.alert && (
              <div className={`mb-2 flex gap-2 p-2 rounded text-xs ${
                content.alert.type === 'danger' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                <span className="font-bold">⚠️ {content.alert.title}:</span> {content.alert.text}
              </div>
            )}
            <div className="flex-1">{renderCompactScript(currentScript)}</div>
            {content.tips && (
              <div className="mt-2 bg-blue-50 border border-blue-100 rounded p-2">
                <div className="text-xs font-bold text-blue-700 mb-1">💡 Why This Works</div>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-blue-800">
                  {content.tips.map((tip, i) => (
                    <span key={i}><b>{tip.label}</b> → {tip.effect}</span>
                  ))}
                </div>
              </div>
            )}
            {content.footer?.type === 'loading' && (
              <div className="mt-2 bg-slate-900 text-slate-200 rounded p-2 flex items-center justify-center gap-2">
                <div className="w-3 h-3 border-2 border-slate-500 border-t-white rounded-full animate-spin" />
                <span className="text-xs font-mono uppercase">{content.footer.text}</span>
              </div>
            )}
          </div>
        );
      case 'mixed':
        // Check if it has a grid (payment phase)
        if (currentPhaseData.content.items.some(i => i.type === 'grid')) {
          return renderPaymentGrid();
        }
        return renderMixed();
      case 'compliance':
        return renderCompliance();
      default:
        return <div className="text-slate-500">Unknown content type</div>;
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 rounded-xl overflow-hidden border border-slate-200 relative">
      {/* Compact Header */}
      <div className="bg-white border-b border-slate-200 px-3 py-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            scriptType === 'preclosed' ? 'bg-purple-100 text-purple-700' : 'bg-cyan-100 text-cyan-700'
          }`}>
            {scriptType === 'preclosed' ? 'PRE-CLOSE' : 'LIVE TRANSFER'}
          </span>
          <span className="text-xs text-slate-500">
            Step {currentPhase + 1}/{phases.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setShowQuotePanel(!showQuotePanel)} 
            className={`px-2 py-1 rounded text-xs font-semibold transition-all flex items-center gap-1 ${
              showQuotePanel 
                ? 'bg-emerald-600 text-white' 
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
            title="Quote Calculator"
          >
            <DollarSign size={12} />
            Quote
          </button>
          <button onClick={resetScript} className="p-1 hover:bg-slate-100 rounded" title="Reset">
            <RefreshCw size={14} className="text-slate-400" />
          </button>
          {onClose && (
            <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
              <X size={14} className="text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-slate-100 flex-shrink-0">
        <div 
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
          style={{ width: `${((currentPhase + 1) / phases.length) * 100}%` }}
        />
      </div>

      {/* Compact Prospect Info */}
      {prospectData && (
        <div className="bg-white border-b border-slate-100 px-3 py-1.5 flex items-center gap-3 text-xs flex-shrink-0">
          <span className="font-semibold text-slate-700">
            <User size={12} className="inline mr-1 text-slate-400" />
            {prospectData.first_name || prospectData.firstName} {prospectData.last_name || prospectData.lastName}
          </span>
          <span className="text-slate-500">
            <Phone size={11} className="inline mr-1" />
            {prospectData.caller_id || prospectData.phone}
          </span>
          {prospectData.state && (
            <span className="text-slate-500">
              <MapPin size={11} className="inline mr-1" />
              {prospectData.city && `${prospectData.city}, `}{prospectData.state}
            </span>
          )}
          {prospectData.age && <span className="text-slate-500">Age {prospectData.age}</span>}
          {(prospectData.beneficiary || prospectData.primaryBenName) && (
            <span className="text-cyan-600 font-medium">
              <Heart size={11} className="inline mr-1" />
              {prospectData.beneficiary || prospectData.primaryBenName}
            </span>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Compact Phase Sidebar */}
        <div className="w-36 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
          <div className="flex-1 p-1.5 overflow-hidden">
            <div className="text-[10px] font-bold uppercase text-slate-400 px-2 py-1">Progress</div>
            {phases.map((phase, i) => (
              <button
                key={phase.id}
                onClick={() => goToPhase(i)}
                className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded text-left text-xs font-medium transition-all mb-0.5 ${
                  i === currentPhase 
                    ? 'bg-blue-50 text-blue-700' 
                    : i < currentPhase 
                      ? 'text-emerald-600 hover:bg-slate-50'
                      : 'text-slate-400 hover:bg-slate-50'
                }`}
              >
                {i < currentPhase ? (
                  <Check size={12} className="text-emerald-500 flex-shrink-0" />
                ) : (
                  <span className="text-[10px] font-bold w-3 text-center flex-shrink-0">{i + 1}</span>
                )}
                <span className="truncate">{phase.title}</span>
              </button>
            ))}
          </div>
          
          {/* Quick Handles */}
          <div className="border-t border-slate-200 p-1.5">
            <div className="text-[10px] font-bold uppercase text-slate-400 px-2 py-1">Objections</div>
            {script.objections.slice(0, 3).map(obj => (
              <button
                key={obj.id}
                onClick={() => showObjection(obj)}
                className="w-full text-left px-2 py-1 text-[10px] font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded mb-0.5 transition-colors truncate"
              >
                {obj.label}
              </button>
            ))}
          </div>
        </div>

        {/* Script Content Area - or Quote Panel */}
        <div className="flex-1 p-3 overflow-hidden flex flex-col min-h-0">
          {showQuotePanel ? renderQuotePanel() : renderPhaseContent()}
        </div>
      </div>

      {/* Compact Navigation Footer */}
      <div className="bg-white border-t border-slate-200 px-3 py-2 flex items-center justify-between flex-shrink-0">
        <button
          onClick={hasMultipleScripts ? prevScript : prevPhase}
          disabled={currentPhase === 0 && currentScriptIndex === 0}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={14} />
          Back
        </button>
        <span className="text-[10px] text-slate-400 uppercase font-bold">
          {currentPhaseData.title}
          {hasMultipleScripts && ` (${currentScriptIndex + 1}/${visibleScripts.length})`}
        </span>
        <button
          onClick={currentPhase === phases.length - 1 && currentScriptIndex >= visibleScripts.length - 1 ? resetScript : (hasMultipleScripts ? nextScript : nextPhase)}
          className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded transition-all ${
            currentPhase === phases.length - 1 && currentScriptIndex >= visibleScripts.length - 1
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow shadow-blue-500/30'
          }`}
        >
          {currentPhase === phases.length - 1 && currentScriptIndex >= visibleScripts.length - 1 ? (
            <>Finish <RefreshCw size={12} /></>
          ) : (
            <>Next <ChevronRight size={14} /></>
          )}
        </button>
      </div>

      {/* Objection Panel Overlay */}
      {showObjectionPanel && selectedObjection && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-20" onClick={() => setShowObjectionPanel(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-96 max-h-[80%] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-amber-500" />
                <span className="font-bold text-sm text-slate-800">Objection Handler</span>
              </div>
              <button onClick={() => setShowObjectionPanel(false)} className="p-1 hover:bg-slate-100 rounded">
                <X size={16} className="text-slate-400" />
              </button>
            </div>
            <div className="p-4">
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 mb-3">
                <div className="text-xs font-bold uppercase text-amber-700 mb-1">They Said:</div>
                <div className="text-sm font-semibold text-slate-800">{selectedObjection.label}</div>
              </div>
              <div className="bg-slate-900 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase text-blue-400">You Say:</span>
                  <button
                    onClick={() => copyText(selectedObjection.response, 'objection')}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {copiedId === 'objection' ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </div>
                <p className="text-sm text-slate-100 leading-relaxed">
                  {populateDynamicFields(selectedObjection.response, prospectData)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegratedScriptPanel;
