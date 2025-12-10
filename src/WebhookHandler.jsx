import React, { useState, useEffect } from 'react';
import { WEBHOOK_PAYLOAD_SPEC, EXAMPLE_WEBHOOK_PAYLOAD } from './webhookIntegration';

// Mock webhook server for development
const MOCK_WEBHOOK_SERVER = {
  // Simulate receiving webhook data
  simulateWebhook: (payload) => {
    console.log('📡 Webhook received:', payload);
    
    // Validate required fields
    const requiredFields = ['lead_token', 'caller_id', 'first_name', 'last_name'];
    const missingFields = requiredFields.filter(field => !payload[field]);
    
    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields);
      return { status: 'error', message: `Missing required fields: ${missingFields.join(', ')}` };
    }
    
    // Create notification
    const notification = {
      id: `pop-${Date.now()}`,
      prospect: payload,
      timestamp: new Date().toISOString(),
      source: payload.source || 'webhook'
    };
    
    // Dispatch custom event to notify the app
    window.dispatchEvent(new CustomEvent('webhookReceived', { detail: notification }));
    
    return { status: 'success', message: 'Screen pop notification created', notification_id: notification.id };
  }
};

// Webhook endpoint URL generator
const generateWebhookUrl = () => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/api/callpop/webhook`;
};

// WebhookHandler component for testing and demonstration
const WebhookHandler = ({ onNotificationReceived }) => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [receivedWebhooks, setReceivedWebhooks] = useState([]);

  useEffect(() => {
    setWebhookUrl(generateWebhookUrl());
  }, []);

  useEffect(() => {
    const handleWebhookReceived = (event) => {
      const notification = event.detail;
      setReceivedWebhooks(prev => [notification, ...prev]);
      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
    };

    window.addEventListener('webhookReceived', handleWebhookReceived);
    return () => window.removeEventListener('webhookReceived', handleWebhookReceived);
  }, [onNotificationReceived]);

  const testWebhook = () => {
    const testPayload = {
      ...EXAMPLE_WEBHOOK_PAYLOAD,
      lead_token: `LT-${Date.now()}`,
      caller_id: `(555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      first_name: ['John', 'Jane', 'Mike', 'Sarah', 'David'][Math.floor(Math.random() * 5)],
      last_name: ['Smith', 'Johnson', 'Williams', 'Brown', 'Davis'][Math.floor(Math.random() * 5)],
      timestamp: new Date().toISOString()
    };
    
    MOCK_WEBHOOK_SERVER.simulateWebhook(testPayload);
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    alert('Webhook URL copied to clipboard!');
  };

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Webhook Integration</h3>
      
      <div className="flex-1 flex flex-col space-y-4">
        {/* Endpoint URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Webhook Endpoint URL</label>
          <div className="flex items-center space-x-2">
            <code className="text-sm bg-gray-50 border border-gray-300 px-3 py-2 rounded-lg flex-1 break-all font-mono">
              {webhookUrl}
            </code>
            <button
              onClick={copyWebhookUrl}
              className="p-2 hover:bg-gray-100 rounded-lg border border-gray-300 transition-colors"
              title="Copy URL"
            >
              📋
            </button>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={testWebhook}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
          >
            Test Webhook
          </button>
          <button
            onClick={() => {
              const payload = JSON.stringify(EXAMPLE_WEBHOOK_PAYLOAD, null, 2);
              navigator.clipboard.writeText(payload);
              alert('Example payload copied to clipboard!');
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm transition-colors"
          >
            Copy Example
          </button>
        </div>
        
        {/* Recent Webhooks */}
        {receivedWebhooks.length > 0 && (
          <div className="border-t pt-4 flex-1 overflow-y-auto">
            <h4 className="font-semibold text-gray-900 mb-3">Recent Webhooks</h4>
            <div className="space-y-2">
              {receivedWebhooks.slice(0, 3).map((webhook, index) => (
                <div key={webhook.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="font-medium text-gray-900 text-sm">{webhook.prospect.first_name} {webhook.prospect.last_name}</div>
                  <div className="text-sm text-gray-500">{webhook.prospect.caller_id} • {new Date(webhook.timestamp).toLocaleTimeString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebhookHandler;
