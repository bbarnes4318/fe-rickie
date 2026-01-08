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
    zip: '',
    beneficiary: ''
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
    if (!formData.beneficiary.trim()) newErrors.beneficiary = 'Beneficiary is required';
    
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
        primaryBenName: formData.beneficiary,
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
        zip: '',
        beneficiary: ''
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
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Get Your Free Quote</h1>
          <p className="text-gray-400">Fill out the form below and we'll be in touch</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-[#13131a] rounded-2xl border border-[#1e1e2e] p-6 shadow-xl">
          {submitError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {submitError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                First Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full bg-[#1e1e2e] border ${errors.firstName ? 'border-red-500' : 'border-[#2e2e3e]'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors`}
                placeholder="John"
              />
              {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Last Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full bg-[#1e1e2e] border ${errors.lastName ? 'border-red-500' : 'border-[#2e2e3e]'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors`}
                placeholder="Doe"
              />
              {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>}
            </div>
          </div>

          {/* Phone */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Phone <span className="text-red-400">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full bg-[#1e1e2e] border ${errors.phone ? 'border-red-500' : 'border-[#2e2e3e]'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors`}
              placeholder="(555) 123-4567"
            />
            {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full bg-[#1e1e2e] border border-[#2e2e3e] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Age <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className={`w-full bg-[#1e1e2e] border ${errors.age ? 'border-red-500' : 'border-[#2e2e3e]'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors`}
                placeholder="65"
              />
              {errors.age && <p className="text-red-400 text-xs mt-1">{errors.age}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* State */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                State <span className="text-red-400">*</span>
              </label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className={`w-full bg-[#1e1e2e] border ${errors.state ? 'border-red-500' : 'border-[#2e2e3e]'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors`}
              >
                <option value="">Select...</option>
                {US_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              {errors.state && <p className="text-red-400 text-xs mt-1">{errors.state}</p>}
            </div>

            {/* Zip */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Zip Code <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="zip"
                value={formData.zip}
                onChange={handleChange}
                className={`w-full bg-[#1e1e2e] border ${errors.zip ? 'border-red-500' : 'border-[#2e2e3e]'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors`}
                placeholder="12345"
              />
              {errors.zip && <p className="text-red-400 text-xs mt-1">{errors.zip}</p>}
            </div>
          </div>

          {/* Beneficiary */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Beneficiary <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="beneficiary"
              value={formData.beneficiary}
              onChange={handleChange}
              className={`w-full bg-[#1e1e2e] border ${errors.beneficiary ? 'border-red-500' : 'border-[#2e2e3e]'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors`}
              placeholder="Name of beneficiary"
            />
            {errors.beneficiary && <p className="text-red-400 text-xs mt-1">{errors.beneficiary}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:shadow-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : (
              'Submit'
            )}
          </button>

          <p className="text-center text-gray-500 text-xs mt-4">
            By submitting, you agree to be contacted by an agent.
          </p>
        </form>
      </div>
    </div>
  );
}
