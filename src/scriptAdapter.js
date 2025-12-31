// scriptAdapter.js - Adapter to use Golden Path script in IntegratedScriptPanel
// This bridges the new Golden Path script format with the existing component

import { SCRIPT_NODES, STARTING_NODE, replaceVariables, SCRIPT_PHASES } from './scriptData';

// Helper to adapt Golden Path nodes to IntegratedScriptPanel format
export const adaptNodeForComponent = (node, formData) => {
  if (!node) return null;
  
  // Map the Golden Path node types to IntegratedScriptPanel expectations
  const adapted = {
    id: node.id,
    type: node.type?.toLowerCase() || 'statement', // Include type for conditional handling
    phase: node.phase,
    title: node.title,
    script: node.script, // Will be replaced by replaceVars in component
    nextNode: node.nextNode, // Include nextNode for navigation
    tip: node.conversionTip?.text || node.stageDirection,
    timestamp: node.timestamp,
    
    // Handle options - map them to component format
    options: node.options?.map(opt => ({
      label: opt.label,
      next: opt.nextNode,
      color: opt.label.includes('✅') ? 'emerald' : 
             opt.label.includes('❌') ? 'red' :
             opt.label.includes('⚠️') ? 'amber' : 'blue',
      setData: opt.setData
    })) || (node.nextNode ? [{ label: '✅ Continue', next: node.nextNode, color: 'emerald' }] : []),
    
    // Handle fields for data collection nodes
    // Map captureVariable names to formData keys
    // Special handling for height_weight node
    // Skip fields for coverage_selection (uses custom selector)
    fields: node.id === 'coverage_selection' ? [] : 
      node.id === 'height_weight' ? [
      { key: 'heightFeet', label: 'Height (Feet)', type: 'height_slider' },
      { key: 'heightInches', label: 'Height (Inches)', type: 'height_slider' },
      { key: 'weight', label: 'Weight (lbs)', type: 'weight_slider' }
    ] : node.captureVariable ? [{
      key: node.captureVariable === 'beneficiary' ? 'beneficiaryName' : node.captureVariable,
      label: node.title,
      type: 'text',
      placeholder: `Enter ${node.captureVariable}`
    }] : [],
    
    // Special flags
    showQuoteCalculator: node.showQuoteCalculator || node.type === 'quote',
    showQuote: node.showQuoteCalculator || node.type === 'quote',
    showCoverageSelector: node.showCoverageSelector || false,
    showThreeOptions: node.showThreeOptions || false,
    dynamicLocation: node.id === 'verify_location',
    dynamicDOB: node.id === 'health_dob',
    ageDisplay: node.id?.includes('dob') || node.id?.includes('age'),
    
    // Conditional node properties
    checkVariable: node.checkVariable,
    ifEmpty: node.ifEmpty,
    ifNotEmpty: node.ifNotEmpty
  };
  
  return adapted;
};

// Get all adapted nodes as a map
export const getAdaptedNodes = (formData) => {
  const adaptedNodes = {};
  
  Object.keys(SCRIPT_NODES).forEach(nodeId => {
    adaptedNodes[nodeId] = adaptNodeForComponent(SCRIPT_NODES[nodeId], formData);
  });
  
  return adaptedNodes;
};

export { STARTING_NODE, replaceVariables, SCRIPT_PHASES };
export default { getAdaptedNodes, adaptNodeForComponent, STARTING_NODE, replaceVariables };
