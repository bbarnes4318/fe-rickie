const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = {
  // Fetch all applications
  async getApplications() {
    const res = await fetch(`${API_BASE}/applications`);
    if (!res.ok) throw new Error('Failed to fetch applications');
    return res.json();
  },

  // Create new application
  async createApplication(data) {
    const res = await fetch(`${API_BASE}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create application');
    return res.json();
  },

  // Update application
  async updateApplication(id, data) {
    const res = await fetch(`${API_BASE}/applications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update application');
    return res.json();
  }
};
