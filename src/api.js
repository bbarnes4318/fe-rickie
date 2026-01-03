const API_BASE = import.meta.env.DEV ? 'http://localhost:3001/api' : '/api';
console.log('API Base URL:', API_BASE); // Debugging

const getHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  // Login
  async login(password) {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Login failed');
    }
    
    return res.json();
  },

  // Fetch all applications
  async getApplications() {
    const res = await fetch(`${API_BASE}/applications`, {
      headers: getHeaders()
    });
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) throw new Error('Unauthorized');
      throw new Error('Failed to fetch applications');
    }
    return res.json();
  },

  // Create new application
  async createApplication(data) {
    const res = await fetch(`${API_BASE}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, // Public endpoint doesn't need auth, but consistent headers ok
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create application');
    return res.json();
  },

  // Update application
  async updateApplication(id, data) {
    const res = await fetch(`${API_BASE}/applications/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update application');
    return res.json();
  },

  // Delete application
  async deleteApplication(id) {
    const res = await fetch(`${API_BASE}/applications/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete application');
    return res.json();
  },

  // Run carrier application automation
  async runAutomation(formData) {
    const res = await fetch(`${API_BASE}/automation/run-carrier-app`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Automation failed');
    }
    return res.json();
  }
};
