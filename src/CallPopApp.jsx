import React, { useState, useEffect, useRef } from 'react';
import { Phone, Bell, Copy, ExternalLink, FileText, User, LogIn, CheckCircle, X, Mic, MicOff, Pause, Play, Users, PhoneForwarded, PhoneOff, Circle, Settings, Clock, Plus, Hash, Delete, PhoneIncoming, PhoneCall, UserPlus, Headphones, Shield, RefreshCw } from 'lucide-react';
import ScreenPopDisplay from './ScreenPopDisplay';
import WebhookHandler from './WebhookHandler';
import { POST_FIELD_DEFINITIONS } from './types';
import { api } from './api';
import IntegratedScriptPanel from './IntegratedScriptPanel';
import hopwhistleService, { HOPWHISTLE_EVENTS, AGENT_STATUS } from './hopwhistleService';
import softphone from './vertoSoftphone';

// Health question tooltips - full question text for Q1-Q8
const HEALTH_QUESTIONS = {
  q1: "Are you currently hospitalized, confined to nursing facility/bed/wheelchair, using oxygen, receiving Hospice care, had amputation from disease, have cancer (excl. basal cell), or need assistance with daily living?",
  q2: "Advised for organ transplant, dialysis, CHF, Alzheimer's, dementia, ALS, or terminal condition?",
  q3: "Diagnosed with AIDS, ARC, immune deficiency, or HIV positive?",
  q4: "Diabetes complications or insulin before age 50?",
  q5: "Renal insufficiency, kidney disease, or multiple cancers?",
  q6: "Past 2 years: testing/surgery not completed?",
  q7a: "Past 2 years: angina, stroke, COPD, Hepatitis C, or oxygen?",
  q7b: "Heart attack, aneurysm, or heart/brain surgery?",
  q7c: "Any cancer (excl. basal cell)?",
  q7d: "Illegal drugs or alcohol abuse?",
  q8a: "Past 3 years: stroke, heart attack, aneurysm, heart surgery?",
  q8b: "Cancer, emphysema, COPD, cirrhosis, liver disease?",
  q8c: "Paralysis, cerebral palsy, MS, seizures, Parkinson's?"
};

// Carrier and Plan Type configuration for Sale Made disposition
const CARRIER_PLANS = {
  'Aetna': ['Level'],
  'AHL': ['Level'],
  'Aflac': ['Level', 'Modified'],
  'American Amicable': ['Level', 'Graded', 'Return of Premium'],
  'CICA': ['Level', 'Guaranteed Issue'],
  'Corebridge': ['Level', 'Guaranteed Issue'],
  'Gerber': ['Guaranteed Issue'],
  'GTL': ['Graded'],
  'Mutual of Omaha': ['Level', 'Guaranteed Issue'],
  'SBLI': ['Level', 'Modified'],
  'Securico': ['Level', 'Graded', 'Modified'],
  'TransAmerica': ['Level', 'Graded']
};

const CARRIERS = Object.keys(CARRIER_PLANS);

const CallPopApp = () => {
  const [currentView, setCurrentView] = useState('roleSelect');
  const [userRole, setUserRole] = useState(null);
  const [screenPopNotifications, setScreenPopNotifications] = useState([]);
  const [callRecords, setCallRecords] = useState([]);
  const [customerProfiles, setCustomerProfiles] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingProfile, setEditingProfile] = useState(null);
  const [screenPopConfig, setScreenPopConfig] = useState({
    enabled: true,
    method: 'trackdrive',
    trackdrive_enabled: true,
    form_capture_url: 'https://form.example.com/lead-capture',
    screen_pop_fields: ['lead_token', 'caller_id', 'first_name', 'last_name', 'email', 'city', 'state', 'jornaya_leadid', 'trusted_form_cert_url', 'tcpa_opt_in'],
    pop_trigger: 'pre_call',
    pop_display_duration: 0
  });

  const [postConfig] = useState({
    enabled: true,
    use_platform_url: true,
    custom_url: '',
    required_fields: ['lead_token', 'caller_id', 'first_name', 'last_name']
  });

  // Agent Dashboard State
  const [agentStatus, setAgentStatus] = useState('available'); // 'available' | 'away' | 'on_call'
  const [hopwhistleConnected, setHopwhistleConnected] = useState(false);
  const [currentCallId, setCurrentCallId] = useState(null);
  const [phoneRegistered, setPhoneRegistered] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isCallActive, setIsCallActive] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [incomingCallData, setIncomingCallData] = useState(null);
  const [activeCallData, setActiveCallData] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [callNotes, setCallNotes] = useState('');
  const [callTimer, setCallTimer] = useState(0);
  const [showDisposition, setShowDisposition] = useState(false);
  const [selectedDisposition, setSelectedDisposition] = useState('');
  // Sale details state (required when disposition is 'Sale Made')
  const [saleCarrier, setSaleCarrier] = useState('');
  const [salePlanType, setSalePlanType] = useState('');
  const [saleAnnualPremium, setSaleAnnualPremium] = useState('');
  const [thirdPartyNumber, setThirdPartyNumber] = useState('');
  const [isAddingThirdParty, setIsAddingThirdParty] = useState(false);
  const [thirdPartyConnected, setThirdPartyConnected] = useState(false);
  const [showTransferPanel, setShowTransferPanel] = useState(false);
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [activeCallView, setActiveCallView] = useState('script'); // 'script' | 'data'
  const callTimerRef = useRef(null);
  const notesAutoSaveRef = useRef(null);

  const platformPostUrl = `https://api.ppcio-platform.com/v1/post/${Math.random().toString(36).substr(2, 9)}`;

  // Simulate incoming screen pop (for demo)
  const simulateIncomingCall = () => {
    const demoProspect = {
      lead_token: `LT-${Date.now()}`,
      caller_id: '(865) 555-7890', // Knoxville, TN area code
      first_name: 'Margaret',
      last_name: 'Henderson',
      email: 'margaret.henderson@example.com',
      address: '2451 Kingston Pike',
      city: 'Knoxville',
      state: 'Tennessee',
      zip: '37919',
      dob: '1951-08-14', // Makes her 73 years old
      age: 73,
      gender: 'Female',
      jornaya_leadid: 'JRN-' + Math.random().toString(36).substr(2, 9),
      trusted_form_cert_url: 'https://cert.trustedform.com/abc123',
      tcpa_opt_in: true,
      tcpa_optin_consent_language: 'I agree to be contacted via phone for insurance quotes',
      coverage_amount: 10000,
      beneficiary: 'David Henderson',
      carrier: 'Mutual of Omaha',
      premium: '$89.50',
      call_time: new Date().toISOString(),
      campaign_id: 'CAMP-001',
      did: '+18005551234'
    };
    
    const notification = {
      id: `pop-${Date.now()}`,
      prospect: demoProspect,
      timestamp: new Date().toISOString(),
      source: screenPopConfig.method === 'trackdrive' ? 'TrackDrive' : 'Webhook'
    };
    
    setScreenPopNotifications(prev => [...prev, notification]);
    
    // Auto-close after duration if set
    if (screenPopConfig.pop_display_duration > 0) {
      setTimeout(() => {
        setScreenPopNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, screenPopConfig.pop_display_duration * 1000);
    }
  };

  // Simulate call end event (for demo)
  const simulateCallEnd = () => {
    console.log('Simulate call end clicked');
    console.log('Screen pop notifications:', screenPopNotifications);
    if (screenPopNotifications.length > 0) {
      const latestNotification = screenPopNotifications[screenPopNotifications.length - 1];
      console.log('Dispatching call end event for notification:', latestNotification.id);
      window.dispatchEvent(new CustomEvent('callEnded', { 
        detail: { notificationId: latestNotification.id } 
      }));
    } else {
      console.log('No screen pop notifications to end');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  // Handle real webhook notifications
  const handleWebhookNotification = (notification) => {
    setScreenPopNotifications(prev => [...prev, notification]);
    
    // Auto-close after duration if set
    if (screenPopConfig.pop_display_duration > 0) {
      setTimeout(() => {
        setScreenPopNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, screenPopConfig.pop_display_duration * 1000);
    }
  };

  const handleSaveCallRecord = (callRecord) => {
    setCallRecords(prev => [...prev, callRecord]);
    console.log('Call record added to CRM:', callRecord);
  };

  // Customer profile management functions
  const handleViewCustomer = (record) => {
    const customerId = record.prospect.lead_token;
    let customer = customerProfiles.find(p => p.id === customerId);
    
    if (!customer) {
      // Create new customer profile from call record
      customer = {
        id: customerId,
        firstName: record.prospect.first_name,
        lastName: record.prospect.last_name,
        email: record.prospect.email,
        phone: record.prospect.caller_id,
        address: '',
        city: '',
        state: '',
        zip: '',
        dateOfBirth: '',
        notes: '',
        callHistory: [record]
      };
      setCustomerProfiles(prev => [...prev, customer]);
    } else {
      // Add this call to existing customer's history if not already there
      const existingCall = customer.callHistory.find(c => c.id === record.id);
      if (!existingCall) {
        customer.callHistory.push(record);
        setCustomerProfiles(prev => prev.map(p => p.id === customerId ? customer : p));
      }
    }
    
    setSelectedCustomer(customer);
    setCurrentView('customerProfile');
  };

  const handleEditProfile = (customer) => {
    setEditingProfile({...customer});
    setCurrentView('editProfile');
  };

  const handleSaveProfile = (updatedProfile) => {
    setCustomerProfiles(prev => prev.map(p => p.id === updatedProfile.id ? updatedProfile : p));
    setSelectedCustomer(updatedProfile);
    setEditingProfile(null);
    setCurrentView('customerProfile');
  };

  // Add some sample data for demo
  useEffect(() => {
    console.log('Loading sample CRM data...');
    const sampleRecords = [
      {
        id: 'record-1',
        notificationId: 'pop-1',
        prospect: {
          first_name: 'John',
          last_name: 'Smith',
          caller_id: '(555) 123-4567',
          email: 'john.smith@example.com',
          lead_token: 'LT-abc123'
        },
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        disposition: 'app_submitted',
        dispositionDetails: {
          carrier: 'Aetna',
          type: 'Level',
          monthlyPremium: '$150'
        },
        callEndTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString()
      },
      {
        id: 'record-2',
        notificationId: 'pop-2',
        prospect: {
          first_name: 'Sarah',
          last_name: 'Johnson',
          caller_id: '(555) 987-6543',
          email: 'sarah.johnson@example.com',
          lead_token: 'LT-def456'
        },
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        disposition: 'callback_requested',
        dispositionDetails: 'Consult with family',
        callEndTime: new Date(Date.now() - 4 * 60 * 60 * 1000 + 8 * 60 * 1000).toISOString()
      },
      {
        id: 'record-3',
        notificationId: 'pop-3',
        prospect: {
          first_name: 'Mike',
          last_name: 'Davis',
          caller_id: '(555) 456-7890',
          email: 'mike.davis@example.com',
          lead_token: 'LT-ghi789'
        },
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        disposition: 'unqualified',
        dispositionDetails: 'Not interested',
        callEndTime: new Date(Date.now() - 6 * 60 * 60 * 1000 + 3 * 60 * 1000).toISOString()
      }
    ];
    setCallRecords(sampleRecords);
    console.log('Sample CRM data loaded:', sampleRecords);
  }, []);

  // Initialize HopWhistle connection and Softphone
  useEffect(() => {
    const initHopwhistle = async () => {
      try {
        console.log('[CallPopApp] Initializing HopWhistle...');
        const result = await hopwhistleService.initializeHopwhistle();
        if (result.success) {
          setHopwhistleConnected(true);
          console.log('[CallPopApp] HopWhistle connected successfully');
        } else {
          console.warn('[CallPopApp] HopWhistle not connected:', result.reason);
        }
      } catch (error) {
        console.error('[CallPopApp] HopWhistle initialization error:', error);
      }
    };
    
    // Initialize softphone (WebRTC)
    const initSoftphone = async () => {
      try {
        console.log('[CallPopApp] Initializing Softphone...');
        const result = await softphone.initializeSoftphone();
        if (result.success) {
          setPhoneRegistered(true);
          console.log('[CallPopApp] Softphone registered successfully');
        } else {
          console.warn('[CallPopApp] Softphone not registered:', result.error);
        }
      } catch (error) {
        console.error('[CallPopApp] Softphone initialization error:', error);
      }
    };
    
    initHopwhistle();
    initSoftphone();
    
    // Subscribe to HopWhistle events
    const unsubscribeHW = hopwhistleService.subscribeToEvents((event) => {
      console.log('[CallPopApp] HopWhistle event:', event.event);
      
      switch (event.event) {
        case HOPWHISTLE_EVENTS.AGENT_CALL_INCOMING:
          // Incoming call from HopWhistle
          if (currentView === 'agentDashboard' && !isCallActive && !isIncomingCall) {
            const data = event.data;
            setCurrentCallId(data.callId);
            setIncomingCallData({
              first_name: data.screenPopData?.first_name || data.callerName || 'Unknown',
              last_name: data.screenPopData?.last_name || '',
              caller_id: data.callerNumber,
              ...data.screenPopData,
              ...data.prospectData,
            });
            setIsIncomingCall(true);
            setAgentStatus('on_call');
          }
          break;
          
        case HOPWHISTLE_EVENTS.CALL_ANSWERED:
          console.log('[CallPopApp] Call answered:', event.data.callId);
          break;
          
        case HOPWHISTLE_EVENTS.CALL_ENDED:
          // Call ended from HopWhistle side
          if (event.data.callId === currentCallId) {
            if (callTimerRef.current) {
              clearInterval(callTimerRef.current);
            }
            setIsCallActive(false);
            setShowDisposition(true);
            setAgentStatus('available');
          }
          break;
          
        case 'websocket.connected':
          setHopwhistleConnected(true);
          break;
          
        case 'websocket.disconnected':
          setHopwhistleConnected(false);
          break;
      }
    });
    
    // Subscribe to Softphone events (WebRTC)
    const unsubscribeSP = softphone.subscribeToEvents((event) => {
      console.log('[CallPopApp] Softphone event:', event.event);
      
      switch (event.event) {
        case 'registered':
          setPhoneRegistered(true);
          break;
          
        case 'unregistered':
        case 'disconnected':
          setPhoneRegistered(false);
          break;
          
        case 'incomingCall':
          // Incoming WebRTC call
          if (currentView === 'agentDashboard' && !isCallActive && !isIncomingCall) {
            setCurrentCallId(event.callId);
            setIncomingCallData({
              first_name: event.callerName || 'Unknown',
              last_name: '',
              caller_id: event.callerNumber,
            });
            setIsIncomingCall(true);
            setAgentStatus('on_call');
          }
          break;
          
        case 'connected':
          console.log('[CallPopApp] WebRTC call connected');
          break;
          
        case 'callEnded':
          if (callTimerRef.current) {
            clearInterval(callTimerRef.current);
          }
          setIsCallActive(false);
          setShowDisposition(true);
          setAgentStatus('available');
          break;
          
        case 'error':
          console.error('[CallPopApp] Softphone error:', event.message);
          break;
      }
    });
    
    return () => {
      unsubscribeHW();
      unsubscribeSP();
      hopwhistleService.disconnectWebSocket();
      softphone.disconnect();
    };
  }, [currentView, isCallActive, isIncomingCall, currentCallId]);

  // Listen for incoming calls from webhook in Agent Dashboard (fallback for non-HopWhistle)
  useEffect(() => {
    const handleIncomingWebhook = (event) => {
      if (currentView === 'agentDashboard' && !isCallActive && !isIncomingCall) {
        const notification = event.detail;
        setIncomingCallData(notification.prospect);
        setIsIncomingCall(true);
        setAgentStatus('on_call');
      }
    };
    window.addEventListener('webhookReceived', handleIncomingWebhook);
    return () => window.removeEventListener('webhookReceived', handleIncomingWebhook);
  }, [currentView, isCallActive, isIncomingCall]);

  // Fetch applications when entering Agent Dashboard
  const fetchApplications = async () => {
    setLoadingApplications(true);
    try {
      const apps = await api.getApplications();
      setApplications(apps);
    } catch (err) {
      console.log('Could not fetch applications:', err.message);
      setApplications([]);
    } finally {
      setLoadingApplications(false);
    }
  };

  useEffect(() => {
    if (currentView === 'agentDashboard') {
      fetchApplications();
    }
  }, [currentView]);

  // Start call with selected application
  const startCallWithApplication = async (app) => {
    setSelectedApplication(app);
    setActiveCallData(app);
    setIsCallActive(true);
    setAgentStatus('on_call');
    setCallTimer(0);
    callTimerRef.current = setInterval(() => {
      setCallTimer(prev => prev + 1);
    }, 1000);
    
    // Actually dial the phone number via Verto WebRTC
    const phoneNumber = app.phone || app.caller_id;
    if (phoneNumber && phoneRegistered) {
      try {
        // Strip non-digits for dialing
        const dialNumber = phoneNumber.replace(/\D/g, '');
        console.log('[CallPopApp] Dialing via Verto:', dialNumber);
        await softphone.makeCall(dialNumber);
      } catch (error) {
        console.error('[CallPopApp] Failed to dial:', error);
      }
    } else if (!phoneRegistered) {
      console.warn('[CallPopApp] Softphone not registered, cannot dial');
    } else {
      console.warn('[CallPopApp] No phone number available for:', app);
    }
    
    // Create notification for screen pop
    const notification = {
      id: `pop-${Date.now()}`,
      prospect: app,
      timestamp: new Date().toISOString(),
      source: 'Application Queue'
    };
    setScreenPopNotifications(prev => [...prev, notification]);
  };

  // Role Selection View - Professional styling matching main app
  if (currentView === 'roleSelect') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-5xl w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/30">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Call Center Platform</h1>
            <p className="text-slate-500">Select your workspace to continue</p>
          </div>

          {/* Role Cards - 3 column layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Agent Dialer - Primary Option */}
            <div
              onClick={() => {
                setUserRole('Agent');
                setCurrentView('agentDashboard');
              }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden cursor-pointer group hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 border border-slate-100 hover:border-cyan-300"
            >
              <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-4">
                <div className="flex items-center justify-between">
                  <Headphones className="w-8 h-8 text-white" />
                  <span className="px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full backdrop-blur-sm">RECOMMENDED</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-cyan-600 transition-colors">Agent Dialer</h3>
                <p className="text-slate-500 text-sm mb-4">Full-featured softphone with 3-way calling, screen pop, call recording, and CRM integration.</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-cyan-50 text-cyan-700 text-xs rounded-full">3-Way Calling</span>
                  <span className="px-2 py-1 bg-cyan-50 text-cyan-700 text-xs rounded-full">Screen Pop</span>
                  <span className="px-2 py-1 bg-cyan-50 text-cyan-700 text-xs rounded-full">Quick Notes</span>
                </div>
              </div>
            </div>

            {/* Publisher Setup */}
            <div
              onClick={() => {
                setUserRole('Publisher');
                setCurrentView('publisherSetup');
              }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden cursor-pointer group hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 border border-slate-100 hover:border-green-300"
            >
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-green-600 transition-colors">Publisher Setup</h3>
                <p className="text-slate-500 text-sm mb-4">Configure webhook endpoints, call routing rules, and data field mappings.</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">Webhooks</span>
                  <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">Routing</span>
                </div>
              </div>
            </div>

            {/* CRM Dashboard */}
            <div
              onClick={() => {
                setUserRole('CRM');
                setCurrentView('crmDashboard');
              }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden cursor-pointer group hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 border border-slate-100 hover:border-purple-300"
            >
              <div className="bg-gradient-to-r from-purple-600 to-violet-600 p-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-purple-600 transition-colors">CRM Records</h3>
                <p className="text-slate-500 text-sm mb-4">View call history, disposition outcomes, and customer profile management.</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">Call Logs</span>
                  <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">Profiles</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Start - Go directly to Agent Dashboard */}
          <div className="text-center">
            <button
              onClick={() => {
                setUserRole('Agent');
                setCurrentView('agentDashboard');
              }}
              className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:shadow-cyan-500/30 transition-all"
            >
              Quick Start → Open Agent Dialer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Agent Dashboard Helper Functions
  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (!match) return value;
    let formatted = '';
    if (match[1]) formatted = `(${match[1]}`;
    if (match[1]?.length === 3) formatted += ') ';
    if (match[2]) formatted += match[2];
    if (match[2]?.length === 3) formatted += '-';
    if (match[3]) formatted += match[3];
    return formatted;
  };

  const handleKeypadPress = (key) => {
    if (phoneNumber.replace(/\D/g, '').length < 10) {
      setPhoneNumber(prev => formatPhoneNumber(prev.replace(/\D/g, '') + key));
    }
  };

  const handleAnswerCall = async () => {
    // Answer call via HopWhistle API if available
    if (currentCallId && hopwhistleConnected) {
      try {
        await hopwhistleService.answerCall(currentCallId);
        console.log('[CallPopApp] Answered call via HopWhistle:', currentCallId);
      } catch (error) {
        console.error('[CallPopApp] Failed to answer via HopWhistle:', error);
      }
    }
    
    // Answer via WebRTC softphone for actual audio
    if (phoneRegistered) {
      try {
        await softphone.answerCall();
        console.log('[CallPopApp] Answered call via WebRTC softphone');
      } catch (error) {
        console.error('[CallPopApp] Failed to answer via softphone:', error);
      }
    }
    
    setIsIncomingCall(false);
    setIsCallActive(true);
    setActiveCallData(incomingCallData);
    setAgentStatus('on_call');
    setCallTimer(0);
    // Start call timer
    callTimerRef.current = setInterval(() => {
      setCallTimer(prev => prev + 1);
    }, 1000);
    // Create notification for screen pop
    const notification = {
      id: `pop-${Date.now()}`,
      prospect: incomingCallData,
      timestamp: new Date().toISOString(),
      source: phoneRegistered ? 'WebRTC' : (hopwhistleConnected ? 'HopWhistle' : 'Agent Dashboard')
    };
    setScreenPopNotifications(prev => [...prev, notification]);
  };

  const handleDeclineCall = async () => {
    // Decline/hangup incoming call via HopWhistle if available
    if (currentCallId && hopwhistleConnected) {
      try {
        await hopwhistleService.hangupCall(currentCallId);
        console.log('[CallPopApp] Declined call via HopWhistle:', currentCallId);
      } catch (error) {
        console.error('[CallPopApp] Failed to decline via HopWhistle:', error);
      }
    }
    
    // Reject via WebRTC softphone
    if (phoneRegistered) {
      try {
        await softphone.rejectCall();
        console.log('[CallPopApp] Rejected call via WebRTC softphone');
      } catch (error) {
        console.error('[CallPopApp] Failed to reject via softphone:', error);
      }
    }
    
    setIsIncomingCall(false);
    setIncomingCallData(null);
    setCurrentCallId(null);
    setAgentStatus('available');
  };

  const handleHangup = async () => {
    // Hangup call via HopWhistle API if available
    if (currentCallId && hopwhistleConnected) {
      try {
        await hopwhistleService.hangupCall(currentCallId);
        console.log('[CallPopApp] Hung up call via HopWhistle:', currentCallId);
      } catch (error) {
        console.error('[CallPopApp] Failed to hangup via HopWhistle:', error);
      }
    }
    
    // Hangup via WebRTC softphone
    if (phoneRegistered) {
      try {
        await softphone.hangupCall();
        console.log('[CallPopApp] Hung up call via WebRTC softphone');
      } catch (error) {
        console.error('[CallPopApp] Failed to hangup via softphone:', error);
      }
    }
    
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }
    setIsCallActive(false);
    setShowDisposition(true);
    setAgentStatus('available');
    setIsMuted(false);
    setIsOnHold(false);
    setIsRecording(false);
    setThirdPartyConnected(false);
    setIsAddingThirdParty(false);
    setThirdPartyNumber('');
    setCurrentCallId(null);
  };

  const handleSaveDisposition = async () => {
    if (selectedDisposition && activeCallData) {
      const callRecord = {
        id: `record-${Date.now()}`,
        notificationId: `pop-${Date.now()}`,
        prospect: activeCallData,
        timestamp: new Date().toISOString(),
        disposition: selectedDisposition,
        dispositionDetails: callNotes,
        callDuration: callTimer,
        callEndTime: new Date().toISOString()
      };
      setCallRecords(prev => [...prev, callRecord]);
      
      // Sync disposition to Admin Dashboard via API
      // Only "Sale Made" converts a Lead to a Submitted Application
      if (selectedApplication && selectedApplication.id) {
        // Sale Made = Lead becomes a real Submitted Application
        const shouldUpdateStatus = selectedDisposition === 'Sale Made';
        const newStatus = shouldUpdateStatus ? 'Submitted' : selectedApplication.status;
        
        // Build update payload
        const updatePayload = {
          status: newStatus,
          lastCallDate: new Date().toISOString(),
          lastDisposition: selectedDisposition,
          callNotes: callNotes
        };
        
        // Include sale details if Sale Made
        if (shouldUpdateStatus && saleCarrier && salePlanType && saleAnnualPremium) {
          updatePayload.carrier = saleCarrier;
          updatePayload.planType = salePlanType;
          updatePayload.premium = (parseFloat(saleAnnualPremium) / 12).toFixed(2); // Monthly premium for display
          updatePayload.annualPremium = parseFloat(saleAnnualPremium);
        }
        
        // Update application in the database
        try {
          await api.updateApplication(selectedApplication.id, updatePayload);
          if (shouldUpdateStatus) {
            console.log('✅ Lead converted to Submitted Application with:', saleCarrier, salePlanType, `$${saleAnnualPremium}/year`);
          } else {
            console.log('📝 Disposition logged:', selectedDisposition);
          }
        } catch (err) {
          console.log('Could not sync to dashboard (API not available):', err.message);
        }
      }
    }
    setShowDisposition(false);
    setSelectedDisposition('');
    setSaleCarrier('');
    setSalePlanType('');
    setSaleAnnualPremium('');
    setCallNotes('');
    setCallTimer(0);
    setActiveCallData(null);
    setSelectedApplication(null);
    setScreenPopNotifications([]);
  };

  const addThirdParty = async () => {
    const cleanNumber = thirdPartyNumber.replace(/\D/g, '');
    if (cleanNumber.length === 10) {
      if (phoneRegistered) {
        try {
          console.log('[CallPopApp] Adding third party via Verto:', cleanNumber);
          await softphone.addToConference(cleanNumber);
          setThirdPartyConnected(true);
          setIsAddingThirdParty(false);
        } catch (error) {
          console.error('[CallPopApp] Failed to add third party:', error);
          // Still update UI for demo purposes
          setThirdPartyConnected(true);
          setIsAddingThirdParty(false);
        }
      } else {
        // Fallback to UI-only update if softphone not registered
        setThirdPartyConnected(true);
        setIsAddingThirdParty(false);
      }
    }
  };

  const removeThirdParty = async () => {
    if (phoneRegistered && thirdPartyConnected) {
      try {
        console.log('[CallPopApp] Removing third party from conference');
        await softphone.removeFromConference();
      } catch (error) {
        console.error('[CallPopApp] Failed to remove third party:', error);
      }
    }
    setThirdPartyConnected(false);
    setThirdPartyNumber('');
  };

  // HopWhistle-integrated hold toggle
  // HopWhistle-integrated hold toggle
  const handleToggleHold = async () => {
    // Hold via HopWhistle API
    if (currentCallId && hopwhistleConnected) {
      try {
        const result = await hopwhistleService.holdCall(currentCallId);
        setIsOnHold(result.isOnHold);
      } catch (error) {
        console.error('[CallPopApp] Failed to toggle hold via HopWhistle:', error);
        setIsOnHold(!isOnHold); // Fallback to local state
      }
    } 
    // Hold via WebRTC softphone
    else if (phoneRegistered) {
      try {
        const result = await softphone.toggleHold(!isOnHold);
        if (result.success) {
          setIsOnHold(!isOnHold);
        }
      } catch (error) {
        console.error('[CallPopApp] Failed to toggle hold via softphone:', error);
      }
    }
    else {
      setIsOnHold(!isOnHold);
    }
  };

  // HopWhistle-integrated mute toggle (client-side for WebRTC)
// HopWhistle-integrated mute toggle (client-side for WebRTC)
const handleToggleMute = async () => {
  // Mute via softphone (WebRTC) - Local stream mute
  if (phoneRegistered) {
    const success = softphone.toggleMute(!isMuted);
    if (success) {
      setIsMuted(!isMuted);
    }
  } 
  // Mute via API (if supported)
  else if (currentCallId && hopwhistleConnected) {
    try {
      await hopwhistleService.muteCall(currentCallId);
    } catch (error) {
      console.error('[CallPopApp] Failed to mute via HopWhistle:', error);
    }
    setIsMuted(!isMuted);
  }
  else {
    setIsMuted(!isMuted);
  }
};

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };


  // Script suggestions based on call data
  const getScriptSuggestions = () => {
    if (!activeCallData) return [];
    const suggestions = [];
    if (activeCallData.first_name) {
      suggestions.push(`"Hello ${activeCallData.first_name}, thank you for your interest in our insurance products."`);
    }
    if (activeCallData.coverage_amount) {
      suggestions.push(`"I see you're interested in coverage of $${activeCallData.coverage_amount.toLocaleString()}. Let me find the best options for you."`);
    }
    if (activeCallData.state) {
      suggestions.push(`"As a resident of ${activeCallData.state}, you have several excellent options available."`);
    }
    suggestions.push(`"May I verify your date of birth for our records?"`);
    suggestions.push(`"Do you have any existing life insurance policies?"`);
    return suggestions;
  };

  // Agent Dashboard View
  if (currentView === 'agentDashboard') {
    return (
      <div className="h-screen bg-[#0a0a0f] flex flex-col overflow-hidden">
        <style>{`
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 5px currentColor, 0 0 10px currentColor; }
            50% { box-shadow: 0 0 15px currentColor, 0 0 25px currentColor; }
          }
          @keyframes pulse-ring {
            0% { transform: scale(0.8); opacity: 1; }
            100% { transform: scale(1.4); opacity: 0; }
          }
          .pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
          .pulse-ring::before {
            content: '';
            position: absolute;
            inset: -4px;
            border-radius: 9999px;
            border: 2px solid currentColor;
            animation: pulse-ring 1.5s ease-out infinite;
          }
          .glass-panel {
            background: rgba(19, 19, 26, 0.8);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
        `}</style>

        {/* Header */}
        <div className="bg-[#13131a] border-b border-[#1e1e2e] px-6 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Headphones className="w-6 h-6 text-cyan-400" />
                <h1 className="text-lg font-bold text-white">Agent Dashboard</h1>
              </div>
              
              {/* Status Indicator */}
              <div className="relative">
                <select
                  value={agentStatus}
                  onChange={(e) => setAgentStatus(e.target.value)}
                  disabled={isCallActive || isIncomingCall}
                  className="appearance-none bg-[#1e1e2e] text-white text-sm pl-8 pr-8 py-1.5 rounded-lg border border-[#2e2e3e] focus:border-cyan-500 focus:outline-none cursor-pointer disabled:opacity-50"
                >
                  <option value="available">Available</option>
                  <option value="away">Away</option>
                  <option value="on_call">On Call</option>
                </select>
                <div className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full ${
                  agentStatus === 'available' ? 'bg-green-500 pulse-glow text-green-500' :
                  agentStatus === 'away' ? 'bg-yellow-500' :
                  'bg-red-500 pulse-glow text-red-500'
                }`} />
              </div>
              
              {/* HopWhistle Connection Status */}
              <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg ${
                hopwhistleConnected 
                  ? 'bg-green-500/10 border border-green-500/30' 
                  : 'bg-red-500/10 border border-red-500/30'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  hopwhistleConnected ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className={`text-xs font-medium ${
                  hopwhistleConnected ? 'text-green-400' : 'text-red-400'
                }`}>
                  {hopwhistleConnected ? 'HopWhistle' : 'Offline'}
                </span>
              </div>

              {/* WebRTC Softphone Status */}
              <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg ${
                phoneRegistered
                  ? 'bg-blue-500/10 border border-blue-500/30' 
                  : 'bg-gray-500/10 border border-gray-500/30'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  phoneRegistered ? 'bg-blue-500' : 'bg-gray-500'
                }`} />
                <span className={`text-xs font-medium ${
                  phoneRegistered ? 'text-blue-400' : 'text-gray-400'
                }`}>
                  {phoneRegistered ? 'Softphone Ready' : 'Softphone Off'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {isCallActive && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-red-400 font-mono text-sm">{formatTime(callTimer)}</span>
                </div>
              )}
              <button
                onClick={() => setCurrentView('roleSelect')}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                ← Exit
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - 3 Column Layout */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Column - Dialer */}
          <div className="w-80 flex-shrink-0 border-r border-[#1e1e2e] p-4 flex flex-col">
            <div className="glass-panel rounded-2xl p-4 flex-1 flex flex-col">
              
              {/* Incoming Call State */}
              {isIncomingCall && incomingCallData && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center pulse-ring text-green-400">
                      <PhoneIncoming className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{incomingCallData.first_name} {incomingCallData.last_name}</p>
                    <p className="text-gray-400">{incomingCallData.caller_id}</p>
                    {incomingCallData.city && <p className="text-sm text-gray-500">{incomingCallData.city}, {incomingCallData.state}</p>}
                  </div>
                  <div className="flex space-x-4">
                    <button
                      onClick={handleDeclineCall}
                      className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors shadow-lg shadow-red-500/30"
                    >
                      <PhoneOff className="w-7 h-7 text-white" />
                    </button>
                    <button
                      onClick={handleAnswerCall}
                      className="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors shadow-lg shadow-green-500/30 pulse-glow text-green-400"
                    >
                      <Phone className="w-7 h-7 text-white" />
                    </button>
                  </div>
                </div>
              )}

              {/* Active Call State */}
              {isCallActive && activeCallData && !showDisposition && (
                <div className="flex-1 flex flex-col">
                  {/* Caller Info */}
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <PhoneCall className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-lg font-bold text-white">{activeCallData.first_name} {activeCallData.last_name}</p>
                    <p className="text-sm text-gray-400">{activeCallData.caller_id}</p>
                    <div className="flex items-center justify-center space-x-2 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-green-400 text-sm">Connected</span>
                    </div>
                  </div>

                  {/* 3-Way / Conference Status */}
                  {thirdPartyConnected && (
                    <div className="bg-purple-500/20 border border-purple-500/50 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-purple-400" />
                          <span className="text-purple-300 text-sm font-medium">3-Way Conference</span>
                        </div>
                        <button
                          onClick={removeThirdParty}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                      <p className="text-xs text-purple-300 mt-1">{thirdPartyNumber}</p>
                    </div>
                  )}

                  {/* Call Controls */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <button
                      onClick={handleToggleMute}
                      className={`p-3 rounded-xl flex flex-col items-center transition-all ${
                        isMuted ? 'bg-red-500/30 border border-red-500' : 'bg-[#1e1e2e] hover:bg-[#2e2e3e] border border-[#2e2e3e]'
                      }`}
                    >
                      {isMuted ? <MicOff className="w-5 h-5 text-red-400" /> : <Mic className="w-5 h-5 text-gray-300" />}
                      <span className="text-xs text-gray-400 mt-1">Mute</span>
                    </button>
                    <button
                      onClick={handleToggleHold}
                      className={`p-3 rounded-xl flex flex-col items-center transition-all ${
                        isOnHold ? 'bg-yellow-500/30 border border-yellow-500' : 'bg-[#1e1e2e] hover:bg-[#2e2e3e] border border-[#2e2e3e]'
                      }`}
                    >
                      {isOnHold ? <Play className="w-5 h-5 text-yellow-400" /> : <Pause className="w-5 h-5 text-gray-300" />}
                      <span className="text-xs text-gray-400 mt-1">Hold</span>
                    </button>
                    <button
                      onClick={() => setIsRecording(!isRecording)}
                      className={`p-3 rounded-xl flex flex-col items-center transition-all ${
                        isRecording ? 'bg-red-500/30 border border-red-500' : 'bg-[#1e1e2e] hover:bg-[#2e2e3e] border border-[#2e2e3e]'
                      }`}
                    >
                      <Circle className={`w-5 h-5 ${isRecording ? 'text-red-400 fill-red-400' : 'text-gray-300'}`} />
                      <span className="text-xs text-gray-400 mt-1">{isRecording ? 'Recording' : 'Record'}</span>
                    </button>
                  </div>

                  {/* Add Third Party / Conference */}
                  {!isAddingThirdParty && !thirdPartyConnected && (
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <button
                        onClick={() => setIsAddingThirdParty(true)}
                        className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/50 hover:bg-purple-500/30 flex flex-col items-center transition-all"
                      >
                        <UserPlus className="w-5 h-5 text-purple-400" />
                        <span className="text-xs text-purple-300 mt-1">Add 3rd Party</span>
                      </button>
                      <button
                        onClick={() => setShowTransferPanel(!showTransferPanel)}
                        className="p-3 rounded-xl bg-blue-500/20 border border-blue-500/50 hover:bg-blue-500/30 flex flex-col items-center transition-all"
                      >
                        <PhoneForwarded className="w-5 h-5 text-blue-400" />
                        <span className="text-xs text-blue-300 mt-1">Warm Transfer</span>
                      </button>
                    </div>
                  )}

                  {/* Add Third Party Panel */}
                  {isAddingThirdParty && (
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3 mb-4">
                      <p className="text-sm text-purple-300 mb-2 font-medium">Add Third Party to Call</p>
                      <input
                        type="text"
                        value={thirdPartyNumber}
                        onChange={(e) => setThirdPartyNumber(formatPhoneNumber(e.target.value.replace(/\D/g, '')))}
                        placeholder="(555) 123-4567"
                        className="w-full bg-[#1e1e2e] border border-purple-500/50 rounded-lg px-3 py-2 text-white text-sm mb-2 focus:outline-none focus:border-purple-400"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setIsAddingThirdParty(false)}
                          className="flex-1 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={addThirdParty}
                          className="flex-1 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded-lg transition-colors"
                        >
                          Connect
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Warm Transfer Panel */}
                  {showTransferPanel && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 mb-4">
                      <p className="text-sm text-blue-300 mb-2 font-medium">Warm Transfer</p>
                      <input
                        type="text"
                        placeholder="Transfer to..."
                        className="w-full bg-[#1e1e2e] border border-blue-500/50 rounded-lg px-3 py-2 text-white text-sm mb-2 focus:outline-none focus:border-blue-400"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setShowTransferPanel(false)}
                          className="flex-1 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                        >
                          Transfer
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Hang Up Button */}
                  <div className="mt-auto">
                    <button
                      onClick={handleHangup}
                      className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl flex items-center justify-center space-x-2 transition-colors shadow-lg shadow-red-500/30"
                    >
                      <PhoneOff className="w-5 h-5" />
                      <span>End Call</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Disposition Panel */}
              {showDisposition && (
                <div className="flex-1 flex flex-col overflow-y-auto">
                  <h3 className="text-lg font-bold text-white mb-4">Call Disposition</h3>
                  <div className="space-y-2 mb-4">
                    {['Sale Made', 'Callback Scheduled', 'Left Voicemail', 'No Answer', 'Not Interested', 'Wrong Number', 'Do Not Call'].map(disposition => (
                      <button
                        key={disposition}
                        onClick={() => {
                          setSelectedDisposition(disposition);
                          // Reset sale details when disposition changes
                          if (disposition !== 'Sale Made') {
                            setSaleCarrier('');
                            setSalePlanType('');
                            setSaleAnnualPremium('');
                          }
                        }}
                        className={`w-full p-3 rounded-lg text-left text-sm transition-all ${
                          selectedDisposition === disposition
                            ? 'bg-cyan-500/30 border border-cyan-500 text-cyan-300'
                            : 'bg-[#1e1e2e] border border-[#2e2e3e] text-gray-300 hover:border-gray-500'
                        }`}
                      >
                        {disposition}
                      </button>
                    ))}
                  </div>
                  
                  {/* Sale Details - Required for Sale Made */}
                  {selectedDisposition === 'Sale Made' && (
                    <div className="bg-[#1e1e2e] border border-cyan-500/30 rounded-xl p-4 mb-4 space-y-3">
                      <h4 className="text-sm font-bold text-cyan-400 mb-3">Sale Details (Required)</h4>
                      
                      {/* Carrier Selection */}
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Carrier</label>
                        <select
                          value={saleCarrier}
                          onChange={(e) => {
                            setSaleCarrier(e.target.value);
                            setSalePlanType(''); // Reset plan type when carrier changes
                          }}
                          className="w-full bg-[#13131a] border border-[#2e2e3e] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                        >
                          <option value="">Select Carrier...</option>
                          {CARRIERS.map(carrier => (
                            <option key={carrier} value={carrier}>{carrier}</option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Plan Type Selection - Depends on Carrier */}
                      {saleCarrier && (
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Plan Type</label>
                          <select
                            value={salePlanType}
                            onChange={(e) => setSalePlanType(e.target.value)}
                            className="w-full bg-[#13131a] border border-[#2e2e3e] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                          >
                            <option value="">Select Plan Type...</option>
                            {CARRIER_PLANS[saleCarrier]?.map(plan => (
                              <option key={plan} value={plan}>{plan}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      
                      {/* Annual Premium */}
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Annual Premium ($)</label>
                        <input
                          type="number"
                          value={saleAnnualPremium}
                          onChange={(e) => setSaleAnnualPremium(e.target.value)}
                          placeholder="e.g. 1200"
                          className="w-full bg-[#13131a] border border-[#2e2e3e] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={handleSaveDisposition}
                    disabled={!selectedDisposition || (selectedDisposition === 'Sale Made' && (!saleCarrier || !salePlanType || !saleAnnualPremium))}
                    className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
                  >
                    Save & Continue
                  </button>
                </div>
              )}

              {/* Idle State - Dialer Keypad */}
              {!isIncomingCall && !isCallActive && !showDisposition && (
                <div className="flex-1 flex flex-col">
                  {/* Phone Number Display */}
                  <div className="mb-4">
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value.replace(/\D/g, '')))}
                      placeholder="(555) 123-4567"
                      className="w-full bg-transparent text-2xl text-white text-center font-mono py-3 border-b border-[#2e2e3e] focus:border-cyan-500 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Keypad */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(key => (
                      <button
                        key={key}
                        onClick={() => handleKeypadPress(key)}
                        className="aspect-square bg-[#1e1e2e] hover:bg-[#2e2e3e] rounded-xl flex items-center justify-center text-xl text-white font-medium transition-colors border border-[#2e2e3e]"
                      >
                        {key}
                      </button>
                    ))}
                  </div>

                  {/* Dial/Clear Buttons */}
                  <div className="flex space-x-3 mt-auto">
                    <button
                      onClick={() => setPhoneNumber('')}
                      className="flex-1 py-3 bg-[#1e1e2e] hover:bg-[#2e2e3e] text-gray-400 rounded-xl transition-colors border border-[#2e2e3e]"
                    >
                      Clear
                    </button>
                    <button
                      disabled={phoneNumber.replace(/\D/g, '').length !== 10}
                      className="flex-1 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center justify-center space-x-2"
                    >
                      <Phone className="w-5 h-5" />
                      <span>Call</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center/Right Column - Dynamic Workspace */}
          <div className="flex-1 p-4 overflow-hidden flex flex-col">
            {/* Active Call - Show Customer Data */}
            {isCallActive && activeCallData && screenPopNotifications.length > 0 && (
              <div className="flex-1 flex flex-col overflow-hidden gap-2">
                {/* View Toggle Tabs */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setActiveCallView('script')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      activeCallView === 'script'
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                        : 'bg-[#1e1e2e] text-gray-400 hover:text-white border border-[#2e2e3e]'
                    }`}
                  >
                    📋 Script & Call Guide
                  </button>
                  <button
                    onClick={() => setActiveCallView('data')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      activeCallView === 'data'
                        ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/30'
                        : 'bg-[#1e1e2e] text-gray-400 hover:text-white border border-[#2e2e3e]'
                    }`}
                  >
                    👤 Customer Data
                  </button>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-xs text-gray-500 uppercase font-bold">
                      {activeCallData?.first_name || activeCallData?.firstName} {activeCallData?.last_name || activeCallData?.lastName}
                    </span>
                    <span className="text-xs text-cyan-400">{activeCallData?.caller_id || activeCallData?.phone}</span>
                  </div>
                </div>

                {/* Script View */}
                {activeCallView === 'script' && (
                  <div className="flex-1 flex gap-4 overflow-hidden">
                    {/* Script Panel - Main Content */}
                    <div className="flex-1 overflow-hidden">
                      <IntegratedScriptPanel
                        prospectData={activeCallData}
                        did={activeCallData?.did || activeCallData?.caller_id}
                        scriptTypeOverride={null}
                      />
                    </div>
                    
                    {/* Quick Notes - Side Panel */}
                    <div className="w-64 flex flex-col gap-3 flex-shrink-0">
                      <div className="glass-panel rounded-xl p-3 flex-1 flex flex-col">
                        <h3 className="text-xs font-bold text-cyan-400 mb-2 flex items-center">
                          <FileText className="w-3 h-3 mr-1" />
                          Call Notes
                        </h3>
                        <textarea
                          value={callNotes}
                          onChange={(e) => setCallNotes(e.target.value)}
                          placeholder="Add notes about this call..."
                          className="flex-1 bg-[#1e1e2e] border border-[#2e2e3e] rounded-lg p-2 text-xs text-white resize-none focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div className="glass-panel rounded-xl p-3">
                        <h3 className="text-xs font-bold text-emerald-400 mb-2">Quick Info</h3>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Coverage:</span>
                            <span className="text-emerald-400 font-bold">${(activeCallData?.faceAmount || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Premium:</span>
                            <span className="text-white">${activeCallData?.premium || activeCallData?.monthlyPremium || '—'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Carrier:</span>
                            <span className="text-white">{activeCallData?.carrier || 'TBD'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Beneficiary:</span>
                            <span className="text-cyan-400">{activeCallData?.primaryBenName || activeCallData?.beneficiary || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Data View - Original CRM Data */}
                {activeCallView === 'data' && (
              <div className="flex-1 flex gap-4 overflow-hidden">
                {/* CRM Data Panel - Organized Sections */}
                <div className="flex-1 glass-panel rounded-2xl overflow-hidden flex flex-col">
                  {/* Header Bar */}
                  <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white">
                          {activeCallData.first_name} {activeCallData.last_name}
                        </h2>
                        <p className="text-cyan-100 text-sm">{activeCallData.caller_id}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {activeCallData.tcpa_opt_in && (
                        <span className="px-3 py-1 bg-green-500/30 text-green-200 text-xs font-medium rounded-full border border-green-400/50">
                          TCPA Verified
                        </span>
                      )}
                      {activeCallData.jornaya_leadid && (
                        <span className="px-3 py-1 bg-blue-500/30 text-blue-200 text-xs font-medium rounded-full border border-blue-400/50">
                          Jornaya
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content Area - Complete Application Data */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    
                    {/* Policy Information */}
                    <div className="bg-gradient-to-r from-emerald-900/30 to-cyan-900/30 rounded-xl p-4 border border-emerald-500/30">
                      <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Policy Information</h3>
                      <div className="grid grid-cols-4 gap-3">
                        <div className="text-center bg-emerald-900/40 rounded-lg py-2">
                          <p className="text-emerald-300 text-xs uppercase mb-1">Coverage</p>
                          <p className="text-emerald-400 text-xl font-bold">${(activeCallData.faceAmount || 0).toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500 text-xs uppercase mb-1">Premium</p>
                          <p className="text-white text-lg font-bold">${activeCallData.premium || activeCallData.monthlyPremium || '—'}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500 text-xs uppercase mb-1">Carrier</p>
                          <p className="text-white text-sm font-bold">{activeCallData.carrier || 'TBD'}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500 text-xs uppercase mb-1">Plan</p>
                          <p className="text-white text-sm font-bold">{activeCallData.planType || activeCallData.plan || 'TBD'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Personal Information */}
                    <div className="bg-[#1e1e2e] rounded-xl p-4">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Personal Information</h3>
                      <div className="grid grid-cols-4 gap-x-4 gap-y-2 text-sm">
                        <div><span className="text-gray-500">Full Name:</span></div>
                        <div className="text-white font-medium">{activeCallData.firstName || activeCallData.name?.split(' ')[0] || ''} {activeCallData.middleName || ''} {activeCallData.lastName || activeCallData.name?.split(' ').slice(1).join(' ') || ''}</div>
                        <div><span className="text-gray-500">Date of Birth:</span></div>
                        <div className="text-white font-medium">{activeCallData.dob || 'N/A'}</div>
                        
                        <div><span className="text-gray-500">Age:</span></div>
                        <div className="text-white font-medium">{activeCallData.age || 'N/A'}</div>
                        <div><span className="text-gray-500">State of Birth:</span></div>
                        <div className="text-white font-medium">{activeCallData.stateOfBirth || 'N/A'}</div>
                        
                        <div><span className="text-gray-500">SSN:</span></div>
                        <div className="text-white font-medium">{activeCallData.ssn || 'N/A'}</div>
                        <div><span className="text-gray-500">Gender:</span></div>
                        <div className="text-white font-medium">{activeCallData.gender || 'N/A'}</div>
                        
                        <div><span className="text-gray-500">Height:</span></div>
                        <div className="text-white font-medium">{activeCallData.height || 'N/A'}</div>
                        <div><span className="text-gray-500">Weight:</span></div>
                        <div className="text-white font-medium">{activeCallData.weight ? `${activeCallData.weight} lbs` : 'N/A'}</div>
                      </div>
                    </div>

                    {/* Contact Details */}
                    <div className="bg-[#1e1e2e] rounded-xl p-4">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Contact Details</h3>
                      <div className="grid grid-cols-4 gap-x-4 gap-y-2 text-sm">
                        <div><span className="text-gray-500">Address:</span></div>
                        <div className="text-white font-medium">{activeCallData.address || 'N/A'}</div>
                        <div><span className="text-gray-500">City:</span></div>
                        <div className="text-white font-medium">{activeCallData.city || 'N/A'}</div>
                        
                        <div><span className="text-gray-500">State:</span></div>
                        <div className="text-white font-medium">{activeCallData.state || 'N/A'}</div>
                        <div><span className="text-gray-500">Zip Code:</span></div>
                        <div className="text-white font-medium">{activeCallData.zip || 'N/A'}</div>
                        
                        <div><span className="text-gray-500">Phone:</span></div>
                        <div className="text-cyan-400 font-medium">{activeCallData.phone || activeCallData.caller_id || 'N/A'}</div>
                        <div><span className="text-gray-500">Email:</span></div>
                        <div className="text-cyan-400 font-medium">{activeCallData.email || 'N/A'}</div>
                      </div>
                    </div>

                    {/* Beneficiaries */}
                    <div className="bg-[#1e1e2e] rounded-xl p-4">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Beneficiaries</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Primary</p>
                          <p className="text-white font-medium">{activeCallData.primaryBenName || 'N/A'}</p>
                          <p className="text-cyan-400 text-sm">{activeCallData.primaryBenRel || ''}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Contingent</p>
                          <p className="text-white font-medium">{activeCallData.contingentBenName || 'N/A'}</p>
                          <p className="text-cyan-400 text-sm">{activeCallData.contingentBenRel || ''}</p>
                        </div>
                      </div>
                    </div>

                    {/* Banking & Payment */}
                    <div className="bg-[#1e1e2e] rounded-xl p-4">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Banking & Payment</h3>
                      <div className="grid grid-cols-4 gap-x-4 gap-y-2 text-sm">
                        <div><span className="text-gray-500">Name on Account:</span></div>
                        <div className="text-white font-medium">{activeCallData.accountName || 'N/A'}</div>
                        <div><span className="text-gray-500">Account Type:</span></div>
                        <div className="text-white font-medium">{activeCallData.accountType || 'N/A'}</div>
                        
                        <div><span className="text-gray-500">Bank Name:</span></div>
                        <div className="text-white font-medium">{activeCallData.bankName || 'N/A'}</div>
                        <div><span className="text-gray-500">Bank Address:</span></div>
                        <div className="text-white font-medium">{activeCallData.bankAddress || 'N/A'}</div>
                        
                        <div><span className="text-gray-500">Routing Number:</span></div>
                        <div className="text-white font-medium font-mono">{activeCallData.routing || 'N/A'}</div>
                        <div><span className="text-gray-500">Account Number:</span></div>
                        <div className="text-white font-medium font-mono">{activeCallData.accountNum || 'N/A'}</div>
                      </div>
                    </div>

                    {/* Draft Schedule */}
                    <div className="bg-[#1e1e2e] rounded-xl p-4">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Draft Schedule</h3>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Schedule:</span>
                          <span className="text-white font-medium ml-2">{activeCallData.draftSchedule === 'ss_payment' ? 'Social Security' : activeCallData.draftSchedule || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">SS Payment Day:</span>
                          <span className="text-white font-medium ml-2">{activeCallData.ssPaymentDay || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Draft Day:</span>
                          <span className="text-white font-medium ml-2">{activeCallData.draftDate || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Health & Underwriting */}
                    <div className="bg-[#1e1e2e] rounded-xl p-4">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Health & Underwriting</h3>
                      <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                        <div><span className="text-gray-500">Physician:</span></div>
                        <div className="text-white font-medium">{activeCallData.physicianName || 'N/A'}</div>
                        <div><span className="text-gray-500">Tobacco Use:</span></div>
                        <div className={`font-medium ${activeCallData.tobacco ? 'text-red-400' : 'text-green-400'}`}>
                          {activeCallData.tobacco === true ? 'Yes' : activeCallData.tobacco === false ? 'No' : 'N/A'}
                        </div>
                      </div>
                      
                      {/* Knockout Questions Q1-Q3 */}
                      <div className="border-t border-[#2e2e3e] pt-3 mb-3">
                        <p className="text-xs text-gray-500 mb-2">Knockout Questions (Q1-Q3) - Hover for details</p>
                        <div className="grid grid-cols-3 gap-2">
                          {['q1', 'q2', 'q3'].map(q => (
                            <div 
                              key={q} 
                              title={HEALTH_QUESTIONS[q]}
                              className={`text-center py-2 rounded cursor-help transition-all hover:scale-105 ${activeCallData[q] === true ? 'bg-red-900/30 text-red-400 border border-red-500/50' : activeCallData[q] === false ? 'bg-green-900/30 text-green-400 border border-green-500/50' : 'bg-[#2e2e3e] text-gray-500 border border-transparent'}`}
                            >
                              <span className="font-bold">{q.toUpperCase()}: </span>
                              <span>{activeCallData[q] === true ? 'YES' : activeCallData[q] === false ? 'NO' : '—'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* ROP Questions Q4-Q7 */}
                      <div className="border-t border-[#2e2e3e] pt-3 mb-3">
                        <p className="text-xs text-gray-500 mb-2">ROP Questions (Q4-Q7) - Hover for details</p>
                        <div className="grid grid-cols-4 gap-2">
                          {['q4', 'q5', 'q6', 'q7a', 'q7b', 'q7c', 'q7d'].map(q => (
                            <div 
                              key={q} 
                              title={HEALTH_QUESTIONS[q]}
                              className={`text-center py-2 rounded text-xs cursor-help transition-all hover:scale-105 ${activeCallData[q] === true ? 'bg-red-900/30 text-red-400 border border-red-500/50' : activeCallData[q] === false ? 'bg-green-900/30 text-green-400 border border-green-500/50' : 'bg-[#2e2e3e] text-gray-500 border border-transparent'}`}
                            >
                              <span className="font-bold">{q.toUpperCase()}: </span>
                              <span>{activeCallData[q] === true ? 'YES' : activeCallData[q] === false ? 'NO' : '—'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Graded Questions Q8 */}
                      <div className="border-t border-[#2e2e3e] pt-3">
                        <p className="text-xs text-gray-500 mb-2">Graded Questions (Q8) - Hover for details</p>
                        <div className="grid grid-cols-3 gap-2">
                          {['q8a', 'q8b', 'q8c'].map(q => (
                            <div 
                              key={q} 
                              title={HEALTH_QUESTIONS[q]}
                              className={`text-center py-2 rounded cursor-help transition-all hover:scale-105 ${activeCallData[q] === true ? 'bg-red-900/30 text-red-400 border border-red-500/50' : activeCallData[q] === false ? 'bg-green-900/30 text-green-400 border border-green-500/50' : 'bg-[#2e2e3e] text-gray-500 border border-transparent'}`}
                            >
                              <span className="font-bold">{q.toUpperCase()}: </span>
                              <span>{activeCallData[q] === true ? 'YES' : activeCallData[q] === false ? 'NO' : '—'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Coverage Options */}
                    <div className="bg-[#1e1e2e] rounded-xl p-4">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Coverage Options</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Willing to Accept:</span>
                          <span className={`ml-2 font-medium ${activeCallData.willingToAccept ? 'text-green-400' : 'text-gray-400'}`}>
                            {activeCallData.willingToAccept ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Existing Insurance:</span>
                          <span className={`ml-2 font-medium ${activeCallData.hasExisting ? 'text-yellow-400' : 'text-gray-400'}`}>
                            {activeCallData.hasExisting === true ? 'Yes' : activeCallData.hasExisting === false ? 'No' : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - Notes & Script */}
                <div className="w-80 flex flex-col gap-4">
                  {/* Script Assistant */}
                  <div className="glass-panel rounded-2xl p-4">
                    <h3 className="text-sm font-bold text-cyan-400 mb-3 flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      Script Assistant
                    </h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {getScriptSuggestions().map((suggestion, idx) => (
                        <div
                          key={idx}
                          className="bg-[#1e1e2e] rounded-lg p-3 text-xs text-gray-300 hover:bg-[#2e2e3e] cursor-pointer transition-colors border border-[#2e2e3e] hover:border-cyan-500/50"
                          onClick={() => navigator.clipboard.writeText(suggestion.replace(/"/g, ''))}
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Notes */}
                  <div className="glass-panel rounded-2xl p-4 flex-1 flex flex-col">
                    <h3 className="text-sm font-bold text-cyan-400 mb-3 flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      Call Notes
                      <span className="ml-auto text-xs text-gray-500 font-normal">Auto-saves</span>
                    </h3>
                    <textarea
                      value={callNotes}
                      onChange={(e) => setCallNotes(e.target.value)}
                      placeholder="Add notes about this call..."
                      className="flex-1 bg-[#1e1e2e] border border-[#2e2e3e] rounded-lg p-3 text-sm text-white resize-none focus:outline-none focus:border-cyan-500 min-h-[120px]"
                    />
                  </div>
                </div>
                </div>
                )}
              </div>
            )}

            {/* Idle State - Applications Queue */}
            {!isCallActive && !showDisposition && (
              <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                {/* Stats Cards */}
                <div className="grid grid-cols-4 gap-4 flex-shrink-0">
                  <div className="glass-panel rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Applications</p>
                        <p className="text-2xl font-bold text-white">{applications.length}</p>
                      </div>
                      <FileText className="w-8 h-8 text-cyan-500" />
                    </div>
                  </div>
                  <div className="glass-panel rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Today's Calls</p>
                        <p className="text-2xl font-bold text-white">{callRecords.length}</p>
                      </div>
                      <Phone className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                  <div className="glass-panel rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Conversion</p>
                        <p className="text-2xl font-bold text-green-400">32%</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                  <div className="glass-panel rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Queue</p>
                        <p className="text-2xl font-bold text-yellow-400">{applications.filter(a => a.status === 'Submitted').length}</p>
                      </div>
                      <Bell className="w-8 h-8 text-yellow-500" />
                    </div>
                  </div>
                </div>

                {/* Applications Queue */}
                <div className="flex-1 glass-panel rounded-2xl overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-[#2e2e3e] flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white">Application Queue</h2>
                    <button 
                      onClick={fetchApplications}
                      disabled={loadingApplications}
                      className="flex items-center space-x-2 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg text-sm transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${loadingApplications ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {loadingApplications ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <RefreshCw className="w-12 h-12 text-cyan-500 mx-auto mb-3 animate-spin" />
                          <p className="text-gray-500">Loading applications...</p>
                        </div>
                      </div>
                    ) : applications.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                          <p className="text-gray-500">No applications in queue</p>
                          <p className="text-sm text-gray-600">Applications submitted via the form will appear here</p>
                        </div>
                      </div>
                    ) : (
                      <table className="w-full">
                        <thead className="bg-[#1e1e2e] sticky top-0">
                          <tr>
                            <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Customer</th>
                            <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Phone</th>
                            <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Carrier</th>
                            <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Face Amount</th>
                            <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Premium</th>
                            <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Status</th>
                            <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1e1e2e]">
                          {applications.map(app => (
                            <tr key={app.id} className="hover:bg-[#1e1e2e]/50 transition-colors">
                              <td className="px-4 py-3">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-bold text-white">
                                      {(app.firstName || app.name?.split(' ')[0] || '?')[0]}
                                      {(app.lastName || app.name?.split(' ')[1] || '')[0]}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-white text-sm font-medium block">
                                      {app.name || `${app.firstName || ''} ${app.lastName || ''}`}
                                    </span>
                                    <span className="text-gray-500 text-xs">{app.state}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-gray-400 text-sm font-mono">{app.phone || 'N/A'}</td>
                              <td className="px-4 py-3 text-white text-sm">{app.carrier || 'N/A'}</td>
                              <td className="px-4 py-3 text-emerald-400 text-sm font-bold">
                                ${(app.faceAmount || 0).toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-white text-sm font-medium">
                                ${app.premium || app.monthlyPremium || 'N/A'}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  app.status === 'Submitted' ? 'bg-blue-500/20 text-blue-400' :
                                  app.status === 'Underwriting' ? 'bg-yellow-500/20 text-yellow-400' :
                                  app.status === 'Issued' ? 'bg-green-500/20 text-green-400' :
                                  app.status === 'Paid' ? 'bg-emerald-500/20 text-emerald-400' :
                                  'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {app.status}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => startCallWithApplication(app)}
                                  className="flex items-center space-x-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-medium transition-colors"
                                >
                                  <Phone className="w-3 h-3" />
                                  <span>Call</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                {/* Webhook Test Section */}
                <div className="glass-panel rounded-2xl p-4 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">Test Incoming Call</h3>
                      <p className="text-xs text-gray-500">Simulate a webhook to test the call flow</p>
                    </div>
                    <WebhookHandler onNotificationReceived={() => {}} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Buyer Dashboard View
  if (currentView === 'buyerDashboard') {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col overflow-hidden">
        <style>{`
          @keyframes slideIn {
            from {
              transform: translateX(400px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          .animate-slideIn {
            animation: slideIn 0.3s ease-out;
          }
        `}</style>
        
        {/* Minimal Header */}
        <div className="bg-white border-b border-gray-200 flex-shrink-0">
          <div className="px-4 py-1">
            <div className="flex items-center justify-between">
              <h1 className="text-base font-semibold text-gray-900">Call Pop Dashboard</h1>
              <button
                onClick={() => setCurrentView('roleSelect')}
                className="text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-2 py-1 rounded"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 p-3 overflow-hidden">
          <div className="h-full flex flex-col space-y-3">
            
            {/* Quick Test Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Test Call Pop</h2>
                  <p className="text-sm text-gray-600">Simulate incoming calls and call endings</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={simulateIncomingCall}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 font-medium transition-colors shadow-sm"
                  >
                    <Phone className="w-5 h-5" />
                    <span>Simulate Call</span>
                  </button>
                  <button
                    onClick={() => {
                      console.log('Call Ended button clicked!');
                      alert('Call Ended button clicked!');
                      simulateCallEnd();
                    }}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2 font-medium transition-colors shadow-sm"
                  >
                    <Phone className="w-5 h-5" />
                    <span>Call Ended</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Configuration & Webhook */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
              
              {/* Configuration */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h3>
                <div className="space-y-4 flex-1">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Endpoint Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">URL:</span>
                        <code className="text-blue-600 font-mono">/api/callpop/webhook</code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Method:</span>
                        <span className="font-medium">POST</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Content-Type:</span>
                        <span className="font-medium">application/json</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-3">Required Fields</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      <div><strong>lead_token</strong> - Unique lead identifier</div>
                      <div><strong>caller_id</strong> - Phone number</div>
                      <div><strong>first_name</strong> - Customer first name</div>
                      <div><strong>last_name</strong> - Customer last name</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Webhook Handler */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 flex flex-col">
                <WebhookHandler onNotificationReceived={handleWebhookNotification} />
              </div>
            </div>

            {/* Recent Activity */}
            {screenPopNotifications.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 flex-shrink-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Calls</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {screenPopNotifications.slice(-3).reverse().map(notif => (
                    <div key={notif.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Phone className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{notif.prospect.first_name} {notif.prospect.last_name}</div>
                          <div className="text-sm text-gray-500">{notif.prospect.caller_id}</div>
                          <div className="text-xs text-gray-400">{new Date(notif.timestamp).toLocaleTimeString()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Render Screen Pop Notifications */}
        {screenPopNotifications.map(notification => (
          <ScreenPopDisplay
            key={notification.id}
            notification={notification}
            onClose={() => setScreenPopNotifications(prev => prev.filter(n => n.id !== notification.id))}
            displayFields={screenPopConfig.screen_pop_fields}
            onSaveCallRecord={handleSaveCallRecord}
          />
        ))}
      </div>
    );
  }

  // Publisher Setup View
  if (currentView === 'publisherSetup') {
    return (
      <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 flex-shrink-0">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <LogIn className="w-6 h-6 text-green-600" />
                <h1 className="text-xl font-semibold text-gray-900">Publisher Setup</h1>
              </div>
              <button
                onClick={() => setCurrentView('roleSelect')}
                className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
              >
                Back
              </button>
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 m-4 p-3 flex flex-col">
              <h2 className="text-lg font-semibold text-gray-900 mb-2 flex-shrink-0">Configure Your Call Routing</h2>
              
              <div className="flex-1 flex flex-col space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-2 flex-shrink-0">
                  <h3 className="font-medium text-green-900 mb-1 text-xs">TrackDrive Integration</h3>
                  <p className="text-xs text-green-800 mb-1">
                    TrackDrive automatically captures form data and syncs it with your call routing. Perfect for seamless lead-to-call tracking.
                  </p>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Form Capture URL</label>
                    <input
                      type="text"
                      value={screenPopConfig.form_capture_url}
                      onChange={(e) => setScreenPopConfig({...screenPopConfig, form_capture_url: e.target.value})}
                      placeholder="https://form.example.com/lead-capture"
                      className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                    />
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-2 flex-1 flex flex-col">
                  <h3 className="font-medium text-gray-900 mb-2 text-xs flex-shrink-0">Screen Pop Configuration</h3>
                  <div className="space-y-2 flex-1 flex flex-col">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Integration Method</label>
                      <select
                        value={screenPopConfig.method}
                        onChange={(e) => setScreenPopConfig({...screenPopConfig, method: e.target.value})}
                        className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                      >
                        <option value="trackdrive">TrackDrive (Recommended)</option>
                        <option value="webhook">Direct Webhook</option>
                        <option value="iframe_postmessage">iFrame PostMessage</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Pop Trigger Timing</label>
                      <select
                        value={screenPopConfig.pop_trigger}
                        onChange={(e) => setScreenPopConfig({...screenPopConfig, pop_trigger: e.target.value})}
                        className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                      >
                        <option value="pre_call">Before Call Connects (Recommended)</option>
                        <option value="on_call_connect">On Call Connect</option>
                        <option value="on_post">On Data POST</option>
                      </select>
                    </div>
                    
                    <div className="flex-1 flex flex-col">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Display Fields</label>
                      <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg p-1">
                        <div className="grid grid-cols-1 gap-1">
                          {POST_FIELD_DEFINITIONS.map(field => (
                            <label key={field.name} className="flex items-center space-x-1">
                              <input
                                type="checkbox"
                                checked={screenPopConfig.screen_pop_fields.includes(field.name)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setScreenPopConfig({
                                      ...screenPopConfig,
                                      screen_pop_fields: [...screenPopConfig.screen_pop_fields, field.name]
                                    });
                                  } else {
                                    setScreenPopConfig({
                                      ...screenPopConfig,
                                      screen_pop_fields: screenPopConfig.screen_pop_fields.filter(f => f !== field.name)
                                    });
                                  }
                                }}
                                className="w-3 h-3 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="text-xs text-gray-700">{field.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 flex-shrink-0">
                  <button
                    onClick={() => setCurrentView('roleSelect')}
                    className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      alert('Configuration saved! You can now start routing calls with screen pop data.');
                      setCurrentView('buyerDashboard');
                    }}
                    className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs"
                  >
                    Save Configuration
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CRM Dashboard View
  if (currentView === 'crmDashboard') {
    console.log('Rendering CRM Dashboard, callRecords:', callRecords);
    return (
      <div className="h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">CRM Dashboard</h1>
                  <p className="text-sm text-gray-600">Manage call records and outcomes</p>
                </div>
              </div>
              <button
                onClick={() => setCurrentView('roleSelect')}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ← Back to Roles
              </button>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 p-6 overflow-hidden">
          <div className="h-full flex flex-col space-y-6">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Calls</p>
                    <p className="text-2xl font-bold text-gray-900">{callRecords ? callRecords.length : 0}</p>
                  </div>
                  <Phone className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">App Submitted</p>
                    <p className="text-2xl font-bold text-green-600">
                      {callRecords ? callRecords.filter(r => r.disposition === 'app_submitted').length : 0}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Callbacks</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {callRecords ? callRecords.filter(r => r.disposition === 'callback_requested').length : 0}
                    </p>
                  </div>
                  <Bell className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Unqualified</p>
                    <p className="text-2xl font-bold text-red-600">
                      {callRecords ? callRecords.filter(r => r.disposition === 'unqualified').length : 0}
                    </p>
                  </div>
                  <X className="w-8 h-8 text-red-600" />
                </div>
              </div>
            </div>

            {/* Call Records Table */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Call Records</h2>
                <p className="text-sm text-gray-600">All incoming calls and their outcomes</p>
              </div>
              
              <div className="overflow-y-auto flex-1">
                {!callRecords || callRecords.length === 0 ? (
                  <div className="p-8 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Call Records Yet</h3>
                    <p className="text-gray-600">Call records will appear here after calls are completed</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Call Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disposition</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {callRecords && callRecords.map((record) => (
                          <tr key={record.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                                  <span className="text-sm font-semibold text-white">
                                    {record.prospect.first_name[0]}{record.prospect.last_name[0]}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <button 
                                    onClick={() => handleViewCustomer(record)}
                                    className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                  >
                                    {record.prospect.first_name} {record.prospect.last_name}
                                  </button>
                                  <div className="text-sm text-gray-500">{record.prospect.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {record.prospect.caller_id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(record.timestamp).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                record.disposition === 'app_submitted' ? 'bg-green-100 text-green-800' :
                                record.disposition === 'callback_requested' ? 'bg-yellow-100 text-yellow-800' :
                                record.disposition === 'unqualified' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {record.disposition?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Pending'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {record.dispositionDetails ? JSON.stringify(record.dispositionDetails) : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button 
                                onClick={() => handleViewCustomer(record)}
                                className="text-blue-600 hover:text-blue-900 hover:underline"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Customer Profile View - Professional CRM Style
  if (currentView === 'customerProfile' && selectedCustomer) {
    const totalCalls = selectedCustomer.callHistory.length;
    const lastCall = selectedCustomer.callHistory[0];
    const successfulCalls = selectedCustomer.callHistory.filter(call => 
      call.disposition === 'app_submitted' || call.disposition === 'qualified'
    ).length;
    const successRate = totalCalls > 0 ? Math.round((successfulCalls / totalCalls) * 100) : 0;
    
    return (
      <div className="h-screen bg-white flex flex-col">
        {/* Professional Header */}
        <div className="bg-white border-b border-gray-300">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {selectedCustomer.firstName[0]}{selectedCustomer.lastName[0]}
                  </span>
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                  </h1>
                  <div className="text-sm text-gray-600">
                    {selectedCustomer.phone} • {selectedCustomer.email}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-sm font-semibold text-gray-900">{totalCalls}</div>
                  <div className="text-xs text-gray-500">Calls</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-gray-900">{successRate}%</div>
                  <div className="text-xs text-gray-500">Success</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-gray-900">
                    {lastCall ? new Date(lastCall.timestamp).toLocaleDateString() : 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500">Last Call</div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditProfile(selectedCustomer)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setCurrentView('crmDashboard')}
                    className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Left Panel - Contact Details */}
          <div className="w-1/3 bg-gray-50 border-r border-gray-300 p-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Contact Information</h3>
                <div className="bg-white border border-gray-200 rounded p-3">
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Phone:</span>
                      <span className="ml-2 text-gray-900">{selectedCustomer.phone}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <span className="ml-2 text-gray-900">{selectedCustomer.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Address:</span>
                      <span className="ml-2 text-gray-900">
                        {selectedCustomer.address || 'Not provided'}
                        {(selectedCustomer.city || selectedCustomer.state || selectedCustomer.zip) && (
                          <span className="text-gray-500">
                            <br />{[selectedCustomer.city, selectedCustomer.state, selectedCustomer.zip].filter(Boolean).join(', ')}
                          </span>
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">DOB:</span>
                      <span className="ml-2 text-gray-900">{selectedCustomer.dateOfBirth || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">ID:</span>
                      <span className="ml-2 text-gray-900 font-mono text-xs">{selectedCustomer.id}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Quick Actions</h3>
                <div className="bg-white border border-gray-200 rounded p-3">
                  <div className="space-y-1">
                    <button className="w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-50 rounded">
                      Call Customer
                    </button>
                    <button className="w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-50 rounded">
                      Send Email
                    </button>
                    <button className="w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-50 rounded">
                      Schedule Follow-up
                    </button>
                    <button className="w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-50 rounded">
                      Add Note
                    </button>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Notes</h3>
                <div className="bg-white border border-gray-200 rounded p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-500">Customer Notes</span>
                    <button
                      onClick={() => {
                        const newNotes = prompt('Edit customer notes:', selectedCustomer.notes || '');
                        if (newNotes !== null) {
                          const updatedCustomer = {...selectedCustomer, notes: newNotes};
                          setCustomerProfiles(prev => prev.map(p => p.id === selectedCustomer.id ? updatedCustomer : p));
                          setSelectedCustomer(updatedCustomer);
                        }
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="bg-gray-50 rounded p-2 min-h-[60px]">
                    <p className="text-xs text-gray-700">
                      {selectedCustomer.notes || 'No notes available. Click "Edit" to add notes.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Panel - Call History */}
          <div className="flex-1 p-4">
            <div className="h-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Call History</h3>
                <span className="text-sm text-gray-500">{totalCalls} calls</span>
              </div>
              
              {selectedCustomer.callHistory.length > 0 ? (
                <div className="bg-white border border-gray-200 rounded">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left text-xs font-medium text-gray-500 py-2 px-3">Date/Time</th>
                          <th className="text-left text-xs font-medium text-gray-500 py-2 px-3">Status</th>
                          <th className="text-left text-xs font-medium text-gray-500 py-2 px-3">Source</th>
                          <th className="text-left text-xs font-medium text-gray-500 py-2 px-3">Duration</th>
                          <th className="text-left text-xs font-medium text-gray-500 py-2 px-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedCustomer.callHistory.map((call) => (
                          <tr key={call.id} className="hover:bg-gray-50">
                            <td className="py-2 px-3 text-sm text-gray-900">
                              {new Date(call.timestamp).toLocaleString()}
                            </td>
                            <td className="py-2 px-3">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                                call.disposition === 'app_submitted' ? 'bg-green-100 text-green-800' :
                                call.disposition === 'callback_requested' ? 'bg-yellow-100 text-yellow-800' :
                                call.disposition === 'unqualified' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {call.disposition?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Pending'}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-sm text-gray-900">
                              {call.prospect?.source || 'Unknown'}
                            </td>
                            <td className="py-2 px-3 text-sm text-gray-900">
                              {call.duration || 'N/A'}
                            </td>
                            <td className="py-2 px-3">
                              <button className="text-xs text-blue-600 hover:text-blue-800">
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded p-8 text-center">
                  <div className="text-gray-500">
                    <Phone className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No call history available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Edit Profile View - Professional CRM Style
  if (currentView === 'editProfile' && editingProfile) {
    return (
      <div className="h-screen bg-white flex flex-col">
        {/* Professional Header */}
        <div className="bg-white border-b border-gray-300">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {editingProfile.firstName[0]}{editingProfile.lastName[0]}
                  </span>
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Edit Customer Profile</h1>
                  <p className="text-sm text-gray-600">Update customer information and details</p>
                </div>
              </div>
              <button
                onClick={() => setCurrentView('customerProfile')}
                className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
              >
                ← Back to Profile
              </button>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 p-4">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSaveProfile(editingProfile);
            }} className="space-y-4">
              
              {/* Personal Information */}
              <div className="bg-white border border-gray-200 rounded p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      value={editingProfile.firstName}
                      onChange={(e) => setEditingProfile({...editingProfile, firstName: e.target.value})}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={editingProfile.lastName}
                      onChange={(e) => setEditingProfile({...editingProfile, lastName: e.target.value})}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter last name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={editingProfile.email}
                      onChange={(e) => setEditingProfile({...editingProfile, email: e.target.value})}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="customer@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={editingProfile.phone}
                      onChange={(e) => setEditingProfile({...editingProfile, phone: e.target.value})}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={editingProfile.dateOfBirth}
                      onChange={(e) => setEditingProfile({...editingProfile, dateOfBirth: e.target.value})}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="bg-white border border-gray-200 rounded p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Address Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Street Address</label>
                    <input
                      type="text"
                      value={editingProfile.address}
                      onChange={(e) => setEditingProfile({...editingProfile, address: e.target.value})}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="123 Main Street, Apt 4B"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={editingProfile.city}
                      onChange={(e) => setEditingProfile({...editingProfile, city: e.target.value})}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="New York"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      value={editingProfile.state}
                      onChange={(e) => setEditingProfile({...editingProfile, state: e.target.value})}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="NY"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">ZIP Code</label>
                    <input
                      type="text"
                      value={editingProfile.zip}
                      onChange={(e) => setEditingProfile({...editingProfile, zip: e.target.value})}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="10001"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white border border-gray-200 rounded p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Notes & Comments</h3>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Customer Notes</label>
                  <textarea
                    value={editingProfile.notes}
                    onChange={(e) => setEditingProfile({...editingProfile, notes: e.target.value})}
                    rows={4}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Add any notes about this customer, their preferences, previous interactions, or any other relevant information..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    These notes will help you provide better service and remember important details about this customer.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-white border border-gray-200 rounded p-4">
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Last updated:</span> {new Date().toLocaleDateString()}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setCurrentView('customerProfile')}
                      className="px-4 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default CallPopApp;
