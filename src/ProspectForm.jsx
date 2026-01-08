import React, { useState } from 'react';
import { api } from './api';

// US States list
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
];

export default function ProspectForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dob: '',
    age: '',
    state: '',
    zip: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      setFormData(prev => ({ ...prev, [name]: formatPhoneNumber(value) }));
    } else if (name === 'zip') {
      // Only allow digits, max 5
      const cleaned = value.replace(/\D/g, '').slice(0, 5);
      setFormData(prev => ({ ...prev, [name]: cleaned }));
    } else if (name === 'age') {
      // Only allow digits
      const cleaned = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: cleaned }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.phone || formData.phone.replace(/\D/g, '').length !== 10) {
      newErrors.phone = 'Valid 10-digit phone number is required';
    }
    if (!formData.age || parseInt(formData.age) < 18 || parseInt(formData.age) > 120) {
      newErrors.age = 'Valid age (18-120) is required';
    }
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.zip || formData.zip.length !== 5) newErrors.zip = 'Valid 5-digit zip code is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      // Generate a unique ID for the prospect
      const prospectId = `PROSP-${Date.now()}`;
      
      await api.createApplication({
        id: prospectId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone.replace(/\D/g, ''),
        dob: formData.dob || null,
        age: parseInt(formData.age),
        state: formData.state,
        zip: formData.zip,
        leadType: 'prospect',
        status: 'New Lead'
      });
      
      setSubmitSuccess(true);
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        dob: '',
        age: '',
        state: '',
        zip: ''
      });
    } catch (error) {
      setSubmitError(error.message || 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Thank You!</h2>
          <p className="text-gray-400 mb-6">Your information has been submitted. An agent will contact you shortly.</p>
          <button
            onClick={() => setSubmitSuccess(false)}
            className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:shadow-cyan-500/30 transition-all"
          >
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0a0a0f] flex items-center justify-center p-2">
      <div className="w-full max-w-2xl">
        {/* Compact Header */}
        <div className="text-center mb-3">
          <h1 className="text-xl font-bold text-white mb-1">Get Your Free Quote</h1>
          <p className="text-gray-400 text-sm">Fill out the form below</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-[#13131a] rounded-xl border border-[#1e1e2e] p-4 shadow-xl">
          {submitError && (
            <div className="mb-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">
              {submitError}
            </div>
          )}

          {/* Row 1: First Name, Last Name, Phone, DOB */}
          <div className="grid grid-cols-4 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                First Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full bg-[#1e1e2e] border ${errors.firstName ? 'border-red-500' : 'border-[#2e2e3e]'} rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500`}
                placeholder="John"
              />
              {errors.firstName && <p className="text-red-400 text-[10px] mt-0.5">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Last Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full bg-[#1e1e2e] border ${errors.lastName ? 'border-red-500' : 'border-[#2e2e3e]'} rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500`}
                placeholder="Doe"
              />
              {errors.lastName && <p className="text-red-400 text-[10px] mt-0.5">{errors.lastName}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Phone <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full bg-[#1e1e2e] border ${errors.phone ? 'border-red-500' : 'border-[#2e2e3e]'} rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500`}
                placeholder="(555) 123-4567"
              />
              {errors.phone && <p className="text-red-400 text-[10px] mt-0.5">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full bg-[#1e1e2e] border border-[#2e2e3e] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Row 2: Age, State, Zip */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Age <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className={`w-full bg-[#1e1e2e] border ${errors.age ? 'border-red-500' : 'border-[#2e2e3e]'} rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500`}
                placeholder="65"
              />
              {errors.age && <p className="text-red-400 text-[10px] mt-0.5">{errors.age}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                State <span className="text-red-400">*</span>
              </label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className={`w-full bg-[#1e1e2e] border ${errors.state ? 'border-red-500' : 'border-[#2e2e3e]'} rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500`}
              >
                <option value="">Select...</option>
                {US_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              {errors.state && <p className="text-red-400 text-[10px] mt-0.5">{errors.state}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Zip <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="zip"
                value={formData.zip}
                onChange={handleChange}
                className={`w-full bg-[#1e1e2e] border ${errors.zip ? 'border-red-500' : 'border-[#2e2e3e]'} rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500`}
                placeholder="12345"
              />
              {errors.zip && <p className="text-red-400 text-[10px] mt-0.5">{errors.zip}</p>}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:shadow-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>

          <p className="text-center text-gray-500 text-[10px] mt-2">
            By submitting, you agree to be contacted by an agent.
          </p>
        </form>
      </div>
    </div>
  );
}
