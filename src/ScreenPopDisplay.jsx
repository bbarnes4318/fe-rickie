import React, { useState, useEffect } from 'react';
import { Phone, CheckCircle, X, ExternalLink, ChevronDown } from 'lucide-react';
import { POST_FIELD_DEFINITIONS } from './types';

const ScreenPopDisplay = ({ notification, onClose, displayFields, onSaveCallRecord }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [callDisposition, setCallDisposition] = useState('');
  const [dispositionDetails, setDispositionDetails] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  
  const getFieldValue = (field) => {
    const value = notification.prospect[field];
    if (value === undefined || value === null) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
  };
  
  const getFieldLabel = (field) => {
    return POST_FIELD_DEFINITIONS.find(f => f.name === field)?.label || field;
  };

  const dispositionOptions = [
    { value: 'app_submitted', label: 'App Submitted' },
    { value: 'callback_requested', label: 'Callback Requested' },
    { value: 'unqualified', label: 'Unqualified/Not Interested' },
    { value: 'duplicate_transfer', label: 'Duplicate Transfer' }
  ];

  const getDispositionDetails = (disposition) => {
    switch (disposition) {
      case 'app_submitted':
        return {
          carrier: ['Aetna', 'Americo', 'AmAm', 'Combined', 'Corebridge', 'TransAmerica'],
          type: ['Level', 'Graded', 'Guaranteed Issue'],
          monthlyPremium: true
        };
      case 'callback_requested':
        return ['Consult with family', 'Budget Concerns', 'Currently Shopping', 'Banking info needed', 'Other'];
      case 'unqualified':
        return ['Not interested', 'Dementia/Nursing home/Power of Attorney', 'No active bank', 'Hostile/Abusive/Wasting Time', 'DNC'];
      case 'duplicate_transfer':
        return [];
      default:
        return [];
    }
  };

  const handleDispositionChange = (value) => {
    setCallDisposition(value);
    setDispositionDetails('');
    setShowDetails(value !== 'duplicate_transfer');
  };

  const saveCallRecord = () => {
    if (callDisposition && onSaveCallRecord) {
      const callRecord = {
        id: `record-${Date.now()}`,
        notificationId: notification.id,
        prospect: notification.prospect,
        timestamp: notification.timestamp,
        disposition: callDisposition,
        dispositionDetails: dispositionDetails,
        callEndTime: new Date().toISOString()
      };
      
      onSaveCallRecord(callRecord);
      console.log('Call record saved:', callRecord);
    }
  };

  // Listen for call end events
  useEffect(() => {
    const handleCallEnd = (event) => {
      console.log('Call end event received:', event.detail);
      console.log('Current notification ID:', notification.id);
      // For testing, also accept events without notification ID matching
      if (!event.detail.notificationId || event.detail.notificationId === notification.id) {
        console.log('Setting call ended to true');
        setCallEnded(true);
      }
    };

    window.addEventListener('callEnded', handleCallEnd);
    return () => window.removeEventListener('callEnded', handleCallEnd);
  }, [notification.id]);
  
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 bg-blue-600 text-white rounded-lg shadow-2xl p-3 cursor-pointer hover:bg-blue-700 transition-all z-50"
           onClick={() => setIsMinimized(false)}>
        <div className="flex items-center space-x-2">
          <Phone className="w-5 h-5 animate-pulse" />
          <span className="font-medium">Incoming Call</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed top-4 right-4 w-[420px] h-[600px] bg-white rounded-xl shadow-2xl border-2 border-blue-500 overflow-hidden z-50 animate-slideIn flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <Phone className="w-6 h-6 animate-pulse" />
          <div>
            <h3 className="font-bold text-lg">Incoming Call</h3>
            <p className="text-xs text-blue-100">{new Date(notification.timestamp).toLocaleTimeString()}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setIsMinimized(true)}
            className="p-1 hover:bg-blue-800 rounded transition-colors"
            title="Minimize"
          >
            <div className="w-4 h-0.5 bg-white"></div>
          </button>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-blue-800 rounded transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Caller Info Highlight */}
      <div className={`border-b-2 px-4 py-3 flex-shrink-0 ${callEnded ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xl font-bold text-gray-900">
              {notification.prospect.first_name} {notification.prospect.last_name}
            </p>
            <p className="text-sm text-gray-600 flex items-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>{notification.prospect.caller_id || 'Unknown'}</span>
              {callEnded && <span className="text-red-600 font-medium">• Call Ended</span>}
              <span className="text-xs text-gray-400">(callEnded: {callEnded.toString()})</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Lead Token</p>
            <p className="text-xs font-mono text-gray-700">{notification.prospect.lead_token}</p>
          </div>
        </div>
      </div>
      
      {/* Prospect Details - No scroll content area */}
      <div className="flex-1 px-4 py-3 overflow-hidden">
        <div className="space-y-1">
          {displayFields.filter(field => notification.prospect[field] !== undefined).map(field => (
            <div key={field} className="flex justify-between items-start border-b border-gray-100 pb-1">
              <span className="text-xs font-medium text-gray-600">{getFieldLabel(field)}:</span>
              <span className="text-xs text-gray-900 font-medium text-right max-w-[180px] break-words">
                {getFieldValue(field)}
              </span>
            </div>
          ))}
          
          {/* Compliance Indicators */}
          {notification.prospect.tcpa_opt_in !== undefined && (
            <div className={`flex items-center space-x-1 p-1 rounded ${
              notification.prospect.tcpa_opt_in ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <CheckCircle className={`w-3 h-3 ${notification.prospect.tcpa_opt_in ? 'text-green-600' : 'text-red-600'}`} />
              <span className="text-xs font-medium">
                TCPA: {notification.prospect.tcpa_opt_in ? 'Verified' : 'Not Verified'}
              </span>
            </div>
          )}
          
          {/* Verification Links */}
          {(notification.prospect.jornaya_leadid || notification.prospect.trusted_form_cert_url) && (
            <div className="bg-gray-50 rounded p-1 space-y-0.5">
              <p className="text-xs font-medium text-gray-700 uppercase">Verification</p>
              {notification.prospect.jornaya_leadid && (
                <a 
                  href={`https://app.jornaya.com/leads/${notification.prospect.jornaya_leadid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between text-xs text-blue-600 hover:text-blue-700"
                >
                  <span>Jornaya LeadID</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {notification.prospect.trusted_form_cert_url && (
                <a 
                  href={notification.prospect.trusted_form_cert_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between text-xs text-blue-600 hover:text-blue-700"
                >
                  <span>TrustedForm Cert</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Call Disposition Section - Only show when call has ended */}
      {callEnded && (
        <div className="bg-blue-50 border-t border-blue-200 px-4 py-3 flex-shrink-0">
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-blue-900">Call Result</label>
          <select 
            value={callDisposition} 
            onChange={(e) => handleDispositionChange(e.target.value)}
            className="w-full text-xs border border-blue-300 rounded px-2 py-1 bg-white"
          >
            <option value="">Select disposition...</option>
            {dispositionOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          
          {showDetails && callDisposition === 'app_submitted' && (
            <div className="space-y-1">
              <div className="grid grid-cols-2 gap-1">
                <div>
                  <label className="block text-xs text-blue-800">Carrier</label>
                  <select 
                    value={dispositionDetails.carrier || ''} 
                    onChange={(e) => setDispositionDetails(prev => ({...prev, carrier: e.target.value}))}
                    className="w-full text-xs border border-blue-300 rounded px-1 py-0.5 bg-white"
                  >
                    <option value="">Select carrier...</option>
                    {getDispositionDetails('app_submitted').carrier.map(carrier => (
                      <option key={carrier} value={carrier}>{carrier}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-blue-800">Type</label>
                  <select 
                    value={dispositionDetails.type || ''} 
                    onChange={(e) => setDispositionDetails(prev => ({...prev, type: e.target.value}))}
                    className="w-full text-xs border border-blue-300 rounded px-1 py-0.5 bg-white"
                  >
                    <option value="">Select type...</option>
                    {getDispositionDetails('app_submitted').type.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-blue-800">Monthly Premium</label>
                <input 
                  type="text" 
                  value={dispositionDetails.monthlyPremium || ''} 
                  onChange={(e) => setDispositionDetails(prev => ({...prev, monthlyPremium: e.target.value}))}
                  placeholder="Enter amount..."
                  className="w-full text-xs border border-blue-300 rounded px-2 py-0.5 bg-white"
                />
              </div>
            </div>
          )}
          
          {showDetails && (callDisposition === 'callback_requested' || callDisposition === 'unqualified') && (
            <div>
              <label className="block text-xs text-blue-800">Reason</label>
              <select 
                value={dispositionDetails} 
                onChange={(e) => setDispositionDetails(e.target.value)}
                className="w-full text-xs border border-blue-300 rounded px-2 py-1 bg-white"
              >
                <option value="">Select reason...</option>
                {getDispositionDetails(callDisposition).map(reason => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
            </div>
          )}
          
          {/* Save Button */}
          {callDisposition && (
            <div className="pt-3 border-t border-blue-200">
              <button
                onClick={saveCallRecord}
                className="w-full px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                Save Call Record
              </button>
            </div>
          )}
          
          {/* Save Button */}
          {callDisposition && (
            <div className="pt-3 border-t border-blue-200">
              <button
                onClick={saveCallRecord}
                className="w-full px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                Save Call Record
              </button>
            </div>
          )}
        </div>
      </div>
      )}
      
      {/* Footer */}
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
        <span className="text-xs text-gray-500">Source: {notification.source}</span>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              console.log('Test call end from popup');
              setCallEnded(true);
            }}
            className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Test End
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScreenPopDisplay;
