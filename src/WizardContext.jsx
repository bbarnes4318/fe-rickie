// WizardContext.jsx - Shared state management for the Scripting Wizard
// Provides prospect data inheritance to quoting engine automatically

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { SCRIPT_NODES, getNode, NODE_TYPES } from './scriptData';
import { calculateEligibility, getAllCarrierQuotes } from './quoteCalculator';

// ═══════════════════════════════════════════════════════════════════
// INITIAL STATE
// ═══════════════════════════════════════════════════════════════════
const initialState = {
  // Navigation
  currentNodeId: 'transfer_opening',
  nodeHistory: [],
  
  // Prospect Data (inherited by quoting engine)
  prospectData: {
    firstName: '',
    lastName: '',
    state: '',
    city: '',
    dateOfBirth: null,
    age: null,
    gender: 'Female', // Default for final expense leads
    tobacco: false,
    
    // Health conditions (mapped to eligibility questions)
    healthConditions: {
      // Knockout questions
      hospitalized_nursing_oxygen: false,
      cancer_diagnosis: false,
      heart_attack_stroke_chf: false,
      
      // Graded questions
      diabetes_insulin: false,
      copd_emphysema: false,
      heart_condition_2yr: false,
      
      // Level qualifiers
      diabetes_pills_only: false,
      high_blood_pressure: false,
      high_cholesterol: false
    },
    
    // Beneficiary
    beneficiary: '',
    beneficiaryRelation: '',
    beneficiaryPhone: '',
    
    // Coverage selection
    faceAmount: 10000,
    carrier: null,
    planType: 'Level',
    monthlyPremium: null,
    
    // Payment
    ssPaymentDay: '',
    draftDate: '',
    paymentMethod: null, // 'bank' or 'card'
    
    // Calculated values
    heightFeet: null,
    heightInches: null,
    weight: null,
    
    // Quote results (populated by quoting engine)
    quotes: [],
    eligibility: null
  },
  
  // Timer
  callStartTime: null,
  elapsedSeconds: 0,
  
  // UI State
  isLoading: false,
  error: null
};

// ═══════════════════════════════════════════════════════════════════
// ACTION TYPES
// ═══════════════════════════════════════════════════════════════════
const ActionTypes = {
  GO_TO_NODE: 'GO_TO_NODE',
  GO_BACK: 'GO_BACK',
  UPDATE_PROSPECT: 'UPDATE_PROSPECT',
  UPDATE_HEALTH: 'UPDATE_HEALTH',
  SET_TOBACCO: 'SET_TOBACCO',
  CALCULATE_QUOTES: 'CALCULATE_QUOTES',
  SELECT_QUOTE: 'SELECT_QUOTE',
  START_TIMER: 'START_TIMER',
  UPDATE_TIMER: 'UPDATE_TIMER',
  RESET_WIZARD: 'RESET_WIZARD',
  SET_ERROR: 'SET_ERROR'
};

// ═══════════════════════════════════════════════════════════════════
// REDUCER
// ═══════════════════════════════════════════════════════════════════
function wizardReducer(state, action) {
  switch (action.type) {
    case ActionTypes.GO_TO_NODE: {
      const newHistory = [...state.nodeHistory, state.currentNodeId];
      return {
        ...state,
        currentNodeId: action.payload,
        nodeHistory: newHistory
      };
    }
    
    case ActionTypes.GO_BACK: {
      if (state.nodeHistory.length === 0) return state;
      const newHistory = [...state.nodeHistory];
      const previousNode = newHistory.pop();
      return {
        ...state,
        currentNodeId: previousNode,
        nodeHistory: newHistory
      };
    }
    
    case ActionTypes.UPDATE_PROSPECT: {
      return {
        ...state,
        prospectData: {
          ...state.prospectData,
          ...action.payload
        }
      };
    }
    
    case ActionTypes.UPDATE_HEALTH: {
      return {
        ...state,
        prospectData: {
          ...state.prospectData,
          healthConditions: {
            ...state.prospectData.healthConditions,
            ...action.payload
          }
        }
      };
    }
    
    case ActionTypes.SET_TOBACCO: {
      return {
        ...state,
        prospectData: {
          ...state.prospectData,
          tobacco: action.payload
        }
      };
    }
    
    case ActionTypes.CALCULATE_QUOTES: {
      const { age, gender, tobacco, faceAmount, healthConditions } = state.prospectData;
      
      // Calculate eligibility from health conditions
      const healthAnswers = {
        q1: healthConditions.hospitalized_nursing_oxygen || healthConditions.cancer_diagnosis,
        q2: healthConditions.heart_attack_stroke_chf,
        q3: healthConditions.diabetes_insulin || healthConditions.copd_emphysema || healthConditions.heart_condition_2yr,
        q4: healthConditions.diabetes_pills_only || healthConditions.high_blood_pressure || healthConditions.high_cholesterol
      };
      
      const eligibility = calculateEligibility(healthAnswers);
      const quotes = getAllCarrierQuotes(age, gender, tobacco, faceAmount, eligibility);
      
      return {
        ...state,
        prospectData: {
          ...state.prospectData,
          eligibility,
          quotes
        }
      };
    }
    
    case ActionTypes.SELECT_QUOTE: {
      const { carrier, planType, premium, faceAmount } = action.payload;
      return {
        ...state,
        prospectData: {
          ...state.prospectData,
          carrier,
          planType,
          monthlyPremium: premium,
          faceAmount
        }
      };
    }
    
    case ActionTypes.START_TIMER: {
      return {
        ...state,
        callStartTime: Date.now()
      };
    }
    
    case ActionTypes.UPDATE_TIMER: {
      if (!state.callStartTime) return state;
      return {
        ...state,
        elapsedSeconds: Math.floor((Date.now() - state.callStartTime) / 1000)
      };
    }
    
    case ActionTypes.RESET_WIZARD: {
      return {
        ...initialState,
        callStartTime: Date.now()
      };
    }
    
    case ActionTypes.SET_ERROR: {
      return {
        ...state,
        error: action.payload
      };
    }
    
    default:
      return state;
  }
}

// ═══════════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════════
const WizardContext = createContext(null);

// ═══════════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════════
export function WizardProvider({ children, initialProspectData = {} }) {
  // Merge any initial prospect data (e.g., from screen pop)
  const mergedInitialState = {
    ...initialState,
    prospectData: {
      ...initialState.prospectData,
      ...initialProspectData
    },
    callStartTime: Date.now()
  };
  
  const [state, dispatch] = useReducer(wizardReducer, mergedInitialState);
  
  // ═══════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════
  const goToNode = useCallback((nodeId) => {
    if (!nodeId || !getNode(nodeId)) {
      console.error(`Invalid node ID: ${nodeId}`);
      return;
    }
    dispatch({ type: ActionTypes.GO_TO_NODE, payload: nodeId });
  }, []);
  
  const goBack = useCallback(() => {
    dispatch({ type: ActionTypes.GO_BACK });
  }, []);
  
  const updateProspect = useCallback((updates) => {
    dispatch({ type: ActionTypes.UPDATE_PROSPECT, payload: updates });
  }, []);
  
  const updateHealth = useCallback((updates) => {
    dispatch({ type: ActionTypes.UPDATE_HEALTH, payload: updates });
  }, []);
  
  const setTobacco = useCallback((value) => {
    dispatch({ type: ActionTypes.SET_TOBACCO, payload: value });
  }, []);
  
  const calculateQuotes = useCallback(() => {
    dispatch({ type: ActionTypes.CALCULATE_QUOTES });
  }, []);
  
  const selectQuote = useCallback((carrier, planType, premium, faceAmount) => {
    dispatch({ 
      type: ActionTypes.SELECT_QUOTE, 
      payload: { carrier, planType, premium, faceAmount } 
    });
  }, []);
  
  const resetWizard = useCallback(() => {
    dispatch({ type: ActionTypes.RESET_WIZARD });
  }, []);
  
  const updateTimer = useCallback(() => {
    dispatch({ type: ActionTypes.UPDATE_TIMER });
  }, []);
  
  // ═══════════════════════════════════════════════════════════════
  // DERIVED STATE
  // ═══════════════════════════════════════════════════════════════
  const currentNode = getNode(state.currentNodeId);
  const canGoBack = state.nodeHistory.length > 0;
  const currentPhase = currentNode?.phase || 1;
  const totalPhases = 15;
  
  // Format elapsed time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const contextValue = {
    // State
    ...state,
    currentNode,
    canGoBack,
    currentPhase,
    totalPhases,
    formattedTime: formatTime(state.elapsedSeconds),
    
    // Actions
    goToNode,
    goBack,
    updateProspect,
    updateHealth,
    setTobacco,
    calculateQuotes,
    selectQuote,
    resetWizard,
    updateTimer
  };
  
  return (
    <WizardContext.Provider value={contextValue}>
      {children}
    </WizardContext.Provider>
  );
}

// ═══════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════
export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
}

export default WizardContext;
