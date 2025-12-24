// wizardMain.jsx - Entry point for the Scripting Wizard
// Mounts ScriptingWizard to #wizard-root

import React from 'react';
import { createRoot } from 'react-dom/client';
import ScriptingWizard from './ScriptingWizard';
import './index.css';

// Check for any URL params to pre-populate prospect data
function getInitialProspectData() {
  const urlParams = new URLSearchParams(window.location.search);
  const prospectData = {};
  
  // Map URL params to prospect data
  if (urlParams.get('firstName')) prospectData.firstName = urlParams.get('firstName');
  if (urlParams.get('lastName')) prospectData.lastName = urlParams.get('lastName');
  if (urlParams.get('state')) prospectData.state = urlParams.get('state');
  if (urlParams.get('city')) prospectData.city = urlParams.get('city');
  if (urlParams.get('age')) prospectData.age = parseInt(urlParams.get('age'), 10);
  if (urlParams.get('gender')) prospectData.gender = urlParams.get('gender');
  if (urlParams.get('tobacco')) prospectData.tobacco = urlParams.get('tobacco') === 'true';
  if (urlParams.get('phone')) prospectData.phone = urlParams.get('phone');
  
  return prospectData;
}

// Mount the app
const container = document.getElementById('wizard-root');
if (container) {
  const root = createRoot(container);
  const initialData = getInitialProspectData();
  
  root.render(
    <React.StrictMode>
      <ScriptingWizard initialProspectData={initialData} />
    </React.StrictMode>
  );
}
