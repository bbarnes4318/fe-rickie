import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { api } from './api';
import { 
  User, MapPin, Calendar, Heart, DollarSign, Activity, 
  Users, CheckCircle, AlertTriangle, ChevronRight, ChevronLeft,
  FileText, CreditCard, Shield, Stethoscope, LayoutDashboard,
  Search, Bell, Settings, PieChart, TrendingUp, Filter,
  MoreHorizontal, Download, Sparkles, BrainCircuit, X, LogOut,
  Mail, Phone, Zap, AlertOctagon, BarChart3, Target, ArrowUpRight, ArrowDownRight,
  Save, Edit3, RefreshCw, Copy, ExternalLink, Printer
} from 'lucide-react';

// --- Constants & Data ---

const STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", 
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", 
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", 
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", 
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

const RELATIONSHIPS = [
  "Spouse", "Child", "Parent", "Partner", "Friend", "Relative", "Other"
];

const APP_STATUSES = [
  "Underwriting", "Issued", "Paid & Issued", "Active", "Not Taken", "Cancelled", "Lapsed", "Pending"
];

const PLAN_TYPES = [
  "Immediate Death Benefit", "Graded Death Benefit", "Return of Premium Death Benefit"
];

const CARRIERS = {
  "American Amicable": ["Level", "Graded", "Modified"],
  "Corebridge": ["Guaranteed Issue", "Simplified Issue"],
  "TransAmerica": ["Level", "Graded"]
};

// Height options in ft'in" format
const HEIGHT_OPTIONS = [];
for (let ft = 4; ft <= 7; ft++) {
  for (let inch = 0; inch <= 11; inch++) {
    HEIGHT_OPTIONS.push(`${ft}'${inch}"`);
  }
}

const DRAFT_DATES = [
  "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th",
  "11th", "12th", "13th", "14th", "15th", "16th", "17th", "18th", "19th", "20th",
  "21st", "22nd", "23rd", "24th", "25th", "26th", "27th", "28th",
  "2nd Wednesday", "3rd Wednesday", "4th Wednesday"
];

const INITIAL_DATA = {
  // Carrier & Policy
  carrier: '',
  planType: '',
  monthlyPremium: '',

  // Personal
  firstName: '', middleName: '', lastName: '',
  address: '', city: '', state: '', zip: '',
  dob: '', age: '', stateOfBirth: '', ssn: '',
  height: "5'9\"", weight: 170, gender: '',
  
  // Owner (if different)
  ownerName: '', ownerRel: '', ownerSsn: '', ownerAddress: '',
  
  // Beneficiaries
  primaryBenName: '', primaryBenRel: '',
  contingentBenName: '', contingentBenRel: '',
  
  // Plan (Legacy / Calculated)
  // planType: '', // Moved up 
  faceAmount: 10000,
  willingToAccept: false,
  tobacco: null,
  
  // Riders
  grandchildRider: false, grandchildCount: 0, grandchildUnits: 0,
  childRider: false, childUnits: 0, childADB: false, childAmount: 0,
  
  // Existing Insurance
  hasExisting: null,
  willReplace: null,
  replacePolicyNum: '',
  replaceAmount: '',
  replaceReason: '',
  
  // Health (null = unanswered, true = yes, false = no)
  physicianName: '',
  q1: null, q2: null, q3: null, // Knockout
  q4: null, q5: null, q6: null, q7a: null, q7b: null, q7c: null, q7d: null, // ROP
  q8a: null, q8b: null, q8c: null, // Graded
  
  // Bank
  accountName: '', accountType: 'checking',
  bankName: '', bankAddress: '', routing: '', accountNum: '',
  draftSchedule: 'ss_payment', // or 'specific_date'
  draftDate: '', 
  
  // Replacement specific
  discontinuing: null,
  usingFunds: null,
  replacements: [{ insurer: '', insured: '', policyNum: '', replaceOrFinance: '' }]
};

// Mock data removed - using API now

// --- Shared UI Components ---

const Logo = ({ small = false }) => (
  <div className={`flex flex-col items-center justify-center ${small ? 'mb-2' : 'mb-6'}`}>
    <div className={`relative ${small ? 'w-10 h-8' : 'w-16 h-12'} mb-2`}>
      <svg viewBox="0 0 64 48" className="w-full h-full drop-shadow-sm">
        <path d="M0 4C0 1.8 1.8 0 4 0H28V24H0V4Z" fill="#00205B"/> 
        <path d="M14 6L16 11H21L17 14L18.5 19L14 16L9.5 19L11 14L7 11H12L14 6Z" fill="white"/> 
        <path d="M30 0H60C62.2 0 64 1.8 64 4V8H30V0Z" fill="#C8102E"/> 
        <path d="M30 12H64V20H30V12Z" fill="#C8102E"/> 
        <path d="M0 28H64V36H0V28Z" fill="#C8102E"/> 
        <path d="M0 40H64V44C64 46.2 62.2 48 60 48H4C1.8 48 0 46.2 0 44V40Z" fill="#C8102E"/> 
      </svg>
    </div>
    <div className="text-center">
      <h1 className={`${small ? 'text-sm' : 'text-xl'} font-extrabold tracking-wider text-slate-800 leading-tight`}>AMERICAN</h1>
      <h1 className={`${small ? 'text-sm' : 'text-xl'} font-extrabold tracking-wider text-slate-800 leading-tight`}>BENEFICIARY</h1>
    </div>
  </div>
);

const SectionTitle = ({ icon: Icon, title, subtitle }) => (
  <div className="mb-6 border-b border-slate-200 pb-2">
    <div className="flex items-center gap-2 text-blue-900 mb-1">
      <Icon size={24} className="stroke-[2.5px]" />
      <h2 className="text-xl font-bold">{title}</h2>
    </div>
    {subtitle && <p className="text-sm text-slate-500 ml-8">{subtitle}</p>}
  </div>
);

const Input = ({ label, type = "text", value, onChange, placeholder, className = "", required = false, ...props }) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-800 font-medium placeholder:text-slate-400"
      {...props}
    />
  </div>
);

const Select = ({ label, value, onChange, options, className = "" }) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white appearance-none text-slate-800 font-medium"
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <div className="absolute right-3 top-3.5 pointer-events-none text-slate-400">
        <ChevronRight className="rotate-90" size={16} />
      </div>
    </div>
  </div>
);

const YesNo = ({ label, value, onChange, subLabel }) => (
  <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm mb-4">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex-1">
        <p className="font-medium text-slate-800">{label}</p>
        {subLabel && <p className="text-sm text-slate-500 mt-1">{subLabel}</p>}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onChange(true)}
          className={`px-6 py-2 rounded-lg font-bold transition-all ${value === true ? 'bg-blue-600 text-white shadow-md scale-105' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
        >
          Yes
        </button>
        <button
          onClick={() => onChange(false)}
          className={`px-6 py-2 rounded-lg font-bold transition-all ${value === false ? 'bg-slate-700 text-white shadow-md scale-105' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
        >
          No
        </button>
      </div>
    </div>
  </div>
);

const StepIndicator = ({ currentStep, totalSteps }) => (
  <div className="flex items-center justify-center gap-2 mb-8">
    {[...Array(totalSteps)].map((_, idx) => (
      <div key={idx} className={`h-2 rounded-full transition-all duration-500 ${idx + 1 === currentStep ? 'w-8 bg-blue-600' : idx + 1 < currentStep ? 'w-2 bg-green-500' : 'w-2 bg-slate-200'}`} />
    ))}
  </div>
);

const DataField = ({ label, value, copyable = true }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative bg-slate-50 p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-white transition-all">
       <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1">{label}</span>
       <div className="flex items-center justify-between gap-2">
         <span className={`font-semibold text-slate-800 break-words ${!value && 'text-slate-300 italic'}`}>{value || 'N/A'}</span>
         {copyable && value && (
           <button onClick={handleCopy} className="text-slate-400 hover:text-blue-600 transition-colors" title="Copy to clipboard">
             {copied ? <CheckCircle size={16} className="text-green-500" /> : <Copy size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
           </button>
         )}
       </div>
    </div>
  );
};

// --- Component: Customer Application Form ---

const CustomerForm = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState(INITIAL_DATA);

  const update = (field, val) => setData(prev => ({ ...prev, [field]: val }));

  const eligibility = useMemo(() => {
    // Corebridge: Everyone is eligible, always Guaranteed Issue
    if (data.carrier === 'Corebridge') {
      return { status: 'standard', plan: 'Guaranteed Issue', message: `${data.carrier} - Guaranteed Issue` };
    }

    // For all other carriers, check health questions
    const isKnockout = [data.q1, data.q2, data.q3].some(a => a === true);
    if (isKnockout) {
      return { status: 'ineligible', plan: 'Not Eligible', message: data.carrier ? `${data.carrier} - Not Eligible` : 'Not Eligible based on health responses.' };
    }
    
    const isROP = [data.q4, data.q5, data.q6, data.q7a, data.q7b, data.q7c, data.q7d].some(a => a === true);
    if (isROP) {
      return { status: 'modified', plan: 'Return of Premium', message: data.carrier ? `${data.carrier} - Return of Premium` : 'Qualifies for Return of Premium Plan.' };
    }
    
    const isGraded = [data.q8a, data.q8b, data.q8c].some(a => a === true);
    if (isGraded) {
      return { status: 'graded', plan: 'Graded', message: data.carrier ? `${data.carrier} - Graded` : 'Qualifies for Graded Death Benefit Plan.' };
    }
    
    // All questions No = Level/Immediate
    return { status: 'standard', plan: 'Level', message: data.carrier ? `${data.carrier} - Level` : 'Qualifies for Level (Immediate Death Benefit) Plan.' };
  }, [data]);

  useEffect(() => {
    if (!data.carrier && eligibility.status !== 'ineligible' && eligibility.plan !== data.planType) {
      update('planType', eligibility.plan);
    }
  }, [eligibility, data.carrier]);

  const handleSubmit = () => {
    onComplete({
      ...data,
      id: `APP-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
      riskScore: Math.floor(Math.random() * 100),
      premium: data.monthlyPremium || (data.faceAmount * 0.003).toFixed(2),
      plan: data.planType // Ensure dashboard compatibility
    });
  };

  const renderCarrierSelect = () => (
    <div className="animate-fade-in">
      <SectionTitle icon={Shield} title="Select Carrier" subtitle="Choose the insurance carrier." />
      <div className="grid grid-cols-1 gap-4 mb-6">
        {Object.keys(CARRIERS).map((c) => (
          <button
            key={c}
            onClick={() => { update('carrier', c); update('planType', ''); }} // Reset plan when carrier changes
            className={`p-6 rounded-xl border-2 text-left transition-all flex items-center justify-between group ${data.carrier === c ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}
          >
            <div>
              <h3 className={`font-bold text-lg ${data.carrier === c ? 'text-blue-700' : 'text-slate-700'}`}>{c}</h3>
              <p className="text-sm text-slate-500">Select to view available policies</p>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${data.carrier === c ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}`}>
              {data.carrier === c && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderPolicySelect = () => (
    <div className="animate-fade-in">
      <SectionTitle icon={FileText} title="Policy & Premium" subtitle="Configure the policy details." />
      
      <div className="mb-6">
        <label className="text-sm font-bold text-slate-700 block mb-2">Select Policy Type</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.carrier && CARRIERS[data.carrier].map((policy) => (
            <button
              key={policy}
              onClick={() => update('planType', policy)}
              className={`p-4 rounded-lg border-2 text-sm font-bold transition-all ${data.planType === policy ? 'border-blue-600 bg-blue-600 text-white shadow-md' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {policy}
            </button>
          ))}
          {!data.carrier && <p className="text-slate-500 italic">Please select a carrier first.</p>}
        </div>
      </div>

      <div className="mb-6">
         <Input 
            label="Monthly Premium ($)" 
            type="number" 
            placeholder="0.00" 
            value={data.monthlyPremium} 
            onChange={(e) => update('monthlyPremium', e.target.value)} 
            className="md:w-1/2"
         />
      </div>

      {/* Grandchild Rider */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6">
        <h3 className="font-bold text-slate-700 mb-4">Rider: Grandchild/Great-Grandchild Coverage</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input type="number" label="Number of Children Applying" value={data.grandchildCount} onChange={(e) => update('grandchildCount', parseInt(e.target.value) || 0)} />
          <Input type="number" label="Units" value={data.grandchildUnits} onChange={(e) => update('grandchildUnits', parseInt(e.target.value) || 0)} />
        </div>
      </div>
    </div>
  );

  const renderStep1 = () => {
    // Auto-calculate age from DOB
    const calculateAge = (dob) => {
      if (!dob) return '';
      const today = new Date();
      const birth = new Date(dob);
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      return age;
    };

    const handleDobChange = (e) => {
      const dob = e.target.value;
      update('dob', dob);
      update('age', calculateAge(dob));
    };

    return (
      <div className="animate-fade-in">
        <SectionTitle icon={User} title="Personal Information" subtitle="Tell us about the proposed insured." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Input label="First Name" value={data.firstName} onChange={(e) => update('firstName', e.target.value)} required />
          <Input label="Middle Name" value={data.middleName} onChange={(e) => update('middleName', e.target.value)} />
          <Input label="Last Name" value={data.lastName} onChange={(e) => update('lastName', e.target.value)} required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input label="Street Address" value={data.address} onChange={(e) => update('address', e.target.value)} className="md:col-span-2" />
          <Input label="City" value={data.city} onChange={(e) => update('city', e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="State" options={STATES} value={data.state} onChange={(e) => update('state', e.target.value)} />
            <Input label="Zip Code" value={data.zip} onChange={(e) => update('zip', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Input type="date" label="Date of Birth" value={data.dob} onChange={handleDobChange} required />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase">Age (Auto-calculated)</label>
            <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg font-bold text-slate-700">
              {data.age || 'Enter DOB'}
            </div>
          </div>
          <Select label="State of Birth" options={STATES} value={data.stateOfBirth} onChange={(e) => update('stateOfBirth', e.target.value)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Input label="SSN" placeholder="XXX-XX-XXXX" value={data.ssn} onChange={(e) => update('ssn', e.target.value)} required />
          <Select label="Height" options={HEIGHT_OPTIONS} value={data.height} onChange={(e) => update('height', e.target.value)} />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase">Weight (lbs)</label>
            <input 
              type="number" 
              min="50" max="500" 
              value={data.weight} 
              onChange={(e) => update('weight', parseInt(e.target.value) || 0)} 
              className="p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
            />
          </div>
        </div>
        <div className="mb-6">
          <label className="text-xs font-semibold text-slate-500 uppercase block mb-2">Gender</label>
          <div className="flex gap-4">
            {['Male', 'Female'].map(g => (
              <button key={g} onClick={() => update('gender', g)} className={`flex-1 p-3 rounded-lg border-2 font-bold transition-all ${data.gender === g ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-400'}`}>{g}</button>
            ))}
          </div>
        </div>

        {/* Owner Section */}
        <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
          <h3 className="font-bold text-slate-700 mb-2">Policy Owner (if different from insured)</h3>
          <p className="text-sm text-slate-500 mb-4">Only complete this section if the owner is a different person than the proposed insured.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Owner Name" value={data.ownerName} onChange={(e) => update('ownerName', e.target.value)} />
            <Select label="Relationship to Insured" options={RELATIONSHIPS} value={data.ownerRel} onChange={(e) => update('ownerRel', e.target.value)} />
            <Input label="Owner SSN" placeholder="XXX-XX-XXXX" value={data.ownerSsn} onChange={(e) => update('ownerSsn', e.target.value)} />
            <Input label="Owner Address" value={data.ownerAddress} onChange={(e) => update('ownerAddress', e.target.value)} />
          </div>
        </div>
      </div>
    );
  };

  const renderStep2 = () => (
    <div className="animate-fade-in">
      <SectionTitle icon={Heart} title="Beneficiaries" subtitle="Designate your beneficiaries." />
      
      {/* Primary Beneficiary */}
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 mb-6">
        <h3 className="font-bold text-blue-800 mb-4">Primary Beneficiary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Full Name" value={data.primaryBenName} onChange={(e) => update('primaryBenName', e.target.value)} required />
          <Select label="Relationship" options={RELATIONSHIPS} value={data.primaryBenRel} onChange={(e) => update('primaryBenRel', e.target.value)} />
        </div>
      </div>

      {/* Contingent Beneficiary */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6">
        <h3 className="font-bold text-slate-700 mb-2">Contingent Beneficiary (Optional)</h3>
        <p className="text-sm text-slate-500 mb-4">This person will receive benefits if the primary beneficiary is unable to.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Full Name" value={data.contingentBenName} onChange={(e) => update('contingentBenName', e.target.value)} />
          <Select label="Relationship" options={RELATIONSHIPS} value={data.contingentBenRel} onChange={(e) => update('contingentBenRel', e.target.value)} />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="animate-fade-in">
      <SectionTitle icon={Stethoscope} title="Health Information" subtitle="Answer all questions honestly. Your answers determine plan eligibility." />
      
      <div className="mb-6">
        <Input label="Physician Name (if applicable)" value={data.physicianName} onChange={(e) => update('physicianName', e.target.value)} />
      </div>

      <div className="p-4 bg-red-50 rounded-xl border border-red-200 mb-6">
        <h3 className="font-bold text-red-800 mb-4 flex items-center gap-2"><AlertTriangle size={20}/> Critical Questions (1-3)</h3>
        <p className="text-sm text-red-700 mb-4">If any "Yes", proposed insured is not eligible.</p>
      <YesNo label="1. Are you currently hospitalized, confined to nursing facility/bed/wheelchair, using oxygen, receiving Hospice care, had amputation from disease, have cancer (excl. basal cell), or need assistance with daily living?" value={data.q1} onChange={(v) => update('q1', v)} />
      
      <YesNo label="2. Advised for organ transplant, dialysis, CHF, Alzheimer's, dementia, ALS, or terminal condition?" value={data.q2} onChange={(v) => update('q2', v)} />
      <YesNo label="3. Diagnosed with AIDS, ARC, immune deficiency, or HIV positive?" value={data.q3} onChange={(v) => update('q3', v)} />
      </div>

      <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200 mb-6">
        <h3 className="font-bold text-yellow-800 mb-4">Questions 4-7 (Return of Premium)</h3>
        <YesNo label="4. Diabetes complications or insulin before age 50?" value={data.q4} onChange={(v) => update('q4', v)} />
        <YesNo label="5. Renal insufficiency, kidney disease, or multiple cancers?" value={data.q5} onChange={(v) => update('q5', v)} />
        <YesNo label="6. Past 2 years: testing/surgery not completed?" value={data.q6} onChange={(v) => update('q6', v)} />
        <YesNo label="7a. Past 2 years: angina, stroke, COPD, Hepatitis C, or oxygen?" value={data.q7a} onChange={(v) => update('q7a', v)} />
        <YesNo label="7b. Heart attack, aneurysm, or heart/brain surgery?" value={data.q7b} onChange={(v) => update('q7b', v)} />
        <YesNo label="7c. Any cancer (excl. basal cell)?" value={data.q7c} onChange={(v) => update('q7c', v)} />
        <YesNo label="7d. Illegal drugs or alcohol abuse?" value={data.q7d} onChange={(v) => update('q7d', v)} />
      </div>

      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 mb-6">
        <h3 className="font-bold text-blue-800 mb-4">Question 8 (Graded Plan)</h3>
        <YesNo label="8a. Past 3 years: stroke, heart attack, aneurysm, heart surgery?" value={data.q8a} onChange={(v) => update('q8a', v)} />
        <YesNo label="8b. Cancer, emphysema, COPD, cirrhosis, liver disease?" value={data.q8b} onChange={(v) => update('q8b', v)} />
        <YesNo label="8c. Paralysis, cerebral palsy, MS, seizures, Parkinson's?" value={data.q8c} onChange={(v) => update('q8c', v)} />
      </div>

      <div className={`mt-6 p-4 rounded-xl flex items-center gap-3 ${eligibility.status === 'ineligible' ? 'bg-red-100 text-red-900' : eligibility.status === 'modified' ? 'bg-yellow-100 text-yellow-900' : 'bg-green-100 text-green-900'}`}>
        <Activity size={20} />
        <p className="font-bold">{eligibility.message}</p>
      </div>
    </div>
  );

    const renderStep4 = () => (
    <div className="animate-fade-in">
      <SectionTitle icon={DollarSign} title="Coverage & Options" subtitle="Select your plan details and additional options." />
      
      <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-xl mb-6">
        <h3 className="text-blue-300 font-bold uppercase text-sm mb-2">Eligible Plan</h3>
        <h2 className="text-3xl font-bold mb-1">{data.planType}</h2>
        <p className="text-slate-400 text-sm">Based on your health profile.</p>
      </div>
      
      <div className="mb-6">
        <label className="text-xs font-semibold text-slate-500 uppercase block mb-2">Face Amount: ${data.faceAmount.toLocaleString()}</label>
        <input type="range" min="1000" max="50000" step="1000" value={data.faceAmount} onChange={(e) => update('faceAmount', parseInt(e.target.value))} className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
      </div>

      {/* Willing to Accept */}
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 mb-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={data.willingToAccept} onChange={(e) => update('willingToAccept', e.target.checked)} className="mt-1 w-5 h-5 accent-blue-600" />
          <span className="text-sm text-slate-700"><strong>Check here if you are willing to accept any plan for which you qualify</strong> based on this application. The insurance may have a graded or return of premium death benefit for the first 2-3 years, a face amount less than indicated, and riders may not be available.</span>
        </label>
      </div>

      {/* Tobacco */}
      <YesNo label="During the past 12 months have you used tobacco in any form (excluding occasional pipe and cigar use)?" value={data.tobacco} onChange={(v) => update('tobacco', v)} />

      {/* Existing Insurance */}
      <YesNo label="Do you have existing life insurance or an annuity contract?" value={data.hasExisting} onChange={(v) => update('hasExisting', v)} />
      {data.hasExisting && (
        <div className="ml-6 mt-2">
          <YesNo label="Will you replace an existing life insurance policy or annuity?" value={data.willReplace} onChange={(v) => update('willReplace', v)} />
        </div>
      )}
    </div>
  );

    const renderStep5 = () => (
    <div className="animate-fade-in">
      <SectionTitle icon={CreditCard} title="Payment" subtitle="Bank Draft Setup" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Input label="Name on Account" value={data.accountName} onChange={(e) => update('accountName', e.target.value)} />
        <Select label="Account Type" options={['Checking', 'Savings']} value={data.accountType} onChange={(e) => update('accountType', e.target.value)} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Input label="Bank Name" value={data.bankName} onChange={(e) => update('bankName', e.target.value)} />
        <Input label="Bank Address" value={data.bankAddress} onChange={(e) => update('bankAddress', e.target.value)} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Input label="Routing Number" value={data.routing} onChange={(e) => update('routing', e.target.value)} />
        <Input label="Account Number" value={data.accountNum} onChange={(e) => update('accountNum', e.target.value)} />
      </div>

      {/* Draft Schedule */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6">
        <h3 className="font-bold text-slate-700 mb-4">Draft Schedule</h3>
        <YesNo label="Would you like your draft to coincide with your Social Security payment schedule?" value={data.draftSchedule === 'ss_payment'} onChange={(v) => update('draftSchedule', v ? 'ss_payment' : 'specific_date')} />
        
        {data.draftSchedule === 'ss_payment' && (
          <div className="mt-4">
            <Select label="Social Security Draft Day" options={['1st of Month', '3rd of Month', '2nd Wednesday', '3rd Wednesday', '4th Wednesday']} value={data.draftDate} onChange={(e) => update('draftDate', e.target.value)} />
          </div>
        )}
        
        {data.draftSchedule !== 'ss_payment' && (
          <div className="mt-4">
            <Select label="Requested Draft Day (1st-28th)" options={[...Array(28).keys()].map(i => `${i + 1}`)} value={data.draftDate} onChange={(e) => update('draftDate', e.target.value)} />
          </div>
        )}
      </div>
    </div>
  );

  const renderReview = () => (
    <div className="animate-fade-in">
      <SectionTitle icon={CheckCircle} title="Review" subtitle="Confirm and Submit" />
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4 border-b pb-4 mb-2">
           <div>
             <span className="text-xs font-bold text-slate-400 uppercase">Carrier</span>
             <p className="font-bold text-slate-800">{data.carrier || 'N/A'}</p>
           </div>
           <div>
             <span className="text-xs font-bold text-slate-400 uppercase">Premium</span>
             <p className="font-bold text-green-600 text-lg">${data.monthlyPremium || (data.faceAmount * 0.003).toFixed(2)}/mo</p>
           </div>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="text-slate-500">Proposed Insured</span>
          <span className="font-bold">{data.firstName} {data.lastName}</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="text-slate-500">Plan Type</span>
          <span className="font-bold text-blue-600">{data.planType}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Face Amount</span>
          <span className="font-bold">${data.faceAmount.toLocaleString()}</span>
        </div>
      </div>
      <button onClick={handleSubmit} className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg text-lg">
        Submit Application
      </button>
    </div>
  );

  const totalSteps = 8;
  const nextStep = () => {
    // Validation logic per step
    if (step === 1 && !data.carrier) { alert("Please select a carrier."); return; }
    if (step === 2 && (!data.planType || !data.monthlyPremium)) { alert("Please select a policy and enter a premium."); return; }
    setStep(Math.min(totalSteps, step + 1));
  };
  const prevStep = () => setStep(Math.max(1, step - 1));

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white min-h-screen">
      <Logo />
      <StepIndicator currentStep={step} totalSteps={totalSteps} />
      {step === 1 && renderCarrierSelect()}
      {step === 2 && renderPolicySelect()}
      {step === 3 && renderStep1()}
      {step === 4 && renderStep2()}
      {step === 5 && renderStep3()}
      {step === 6 && renderStep4()}
      {step === 7 && renderStep5()}
      {step === 8 && renderReview()}
      <div className="mt-8 flex justify-between">
         <button onClick={prevStep} disabled={step === 1} className="px-6 py-2 text-slate-500 font-bold disabled:opacity-0">Back</button>
         {step < 8 && <button onClick={nextStep} className="px-6 py-2 bg-blue-900 text-white rounded-lg font-bold">Next Step</button>}
      </div>
    </div>
  );
};

// --- Component: Admin Dashboard ---

const AdminDashboard = ({ submissions, onLogout, onUpdateSubmission }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [timeFilter, setTimeFilter] = useState('YTD');
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [notification, setNotification] = useState(null);
  const [prevSubmissionCount, setPrevSubmissionCount] = useState(0);

  // Detect new applications and show notification
  useEffect(() => {
    if (submissions.length > prevSubmissionCount && prevSubmissionCount > 0) {
      const newApp = submissions[0]; // Latest app is at the top
      
      // Play notification sound
      const audio = new Audio('data:audio/wav;base64,UklGRl4FAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YToFAACAgICAgICAgICAgICAgICA/v8AAP7/AAD+/wAA/v8AAP7/AAD+/wAA/v8AAP7/AAD+/wAA/v8AAP7/AAD+/wAA/v8AAP7/AAD+/wAAAAAAAP7/AAD+/wAA/v8AAP7/AAD+/wAA/v8AAP7/AAD+/wAA/v8AAP7/AAD+/wAA/v8AAP7/AAD+/wAA/v8AAP7/AAD+/wAA/v8AAP7/AAD+/wAA/v8AAP7/AAD+/wAA/v8AAP7/AAD+/wAAAAAAAAAAAACAgICAgICAgICAgICAgIA=');
      audio.volume = 0.5;
      audio.play().catch(() => {}); // Ignore if audio fails
      
      // Show visual notification
      setNotification({
        title: 'New Application!',
        message: `${newApp.name || newApp.firstName + ' ' + newApp.lastName} submitted a new application`,
        app: newApp
      });
      
      // Auto-dismiss after 10 seconds
      setTimeout(() => setNotification(null), 10000);
    }
    setPrevSubmissionCount(submissions.length);
  }, [submissions.length]);

  useEffect(() => {
    if (selectedApp) {
      setEditData(selectedApp);
      setEditMode(false);
    }
  }, [selectedApp]);

  const handleSaveEdit = () => {
    onUpdateSubmission(editData);
    setSelectedApp(editData);
    setEditMode(false);
  };

  const filteredSubmissions = useMemo(() => {
    return submissions.filter(sub => 
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      sub.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [submissions, searchTerm]);

  const SidebarItem = ({ id, icon: Icon, label }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-1 ${activeTab === id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  const StatusBadge = ({ status }) => {
    const styles = {
      'Approved': 'bg-green-100 text-green-700 border-green-200',
      'Issued': 'bg-green-100 text-green-700 border-green-200',
      'Paid & Issued': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'Active': 'bg-blue-100 text-blue-700 border-blue-200',
      'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Underwriting': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      'Review': 'bg-orange-100 text-orange-700 border-orange-200',
      'Flagged': 'bg-red-100 text-red-700 border-red-200',
      'Not Taken': 'bg-slate-100 text-slate-500 border-slate-200',
      'Cancelled': 'bg-red-50 text-red-700 border-red-200',
      'Lapsed': 'bg-red-50 text-red-600 border-red-200',
      'Delinquent': 'bg-red-100 text-red-700 border-red-200'
    };
    return (
      <span className={`px-2 py-1 rounded-md text-xs font-bold border whitespace-nowrap ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
        {status}
      </span>
    );
  };

  // --- Analytics Logic ---
  
  const analyticsData = useMemo(() => {
    const now = new Date();
    const isWithin = (dateStr) => {
      const d = new Date(dateStr);
      if (timeFilter === 'Daily') return d.toDateString() === now.toDateString();
      if (timeFilter === 'Weekly') return (now - d) / (1000 * 60 * 60 * 24) <= 7;
      if (timeFilter === 'Monthly') return (now - d) / (1000 * 60 * 60 * 24) <= 30;
      if (timeFilter === 'Quarterly') return (now - d) / (1000 * 60 * 60 * 24) <= 90;
      if (timeFilter === 'YTD') return d.getFullYear() === now.getFullYear();
      return true;
    };

    const filtered = submissions.filter(s => isWithin(s.date));
    
    const counts = {
      applications: filtered.length,
      issued: filtered.filter(s => s.status === 'Issued').length,
      paidIssued: filtered.filter(s => s.status === 'Paid & Issued').length,
      active: filtered.filter(s => s.status === 'Active').length,
      underwriting: filtered.filter(s => s.status === 'Underwriting' || s.status === 'Pending').length,
      notTaken: filtered.filter(s => s.status === 'Not Taken').length,
      cancelled: filtered.filter(s => s.status === 'Cancelled').length,
      lapsed: filtered.filter(s => s.status === 'Lapsed').length,
    };

    const retentionBase = counts.active + counts.cancelled + counts.lapsed;
    const retentionRate = retentionBase > 0 ? ((counts.active / retentionBase) * 100).toFixed(1) : 0;
    const appsToIssue = counts.applications > 0 ? ((counts.active / counts.applications) * 100).toFixed(1) : 0;

    return { counts, retentionRate, appsToIssue };
  }, [submissions, timeFilter]);

  // --- Renderers ---

  const renderOverview = () => (
    <div className="animate-fade-in space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         {[
           { label: 'Total Apps', val: submissions.length, icon: FileText, color: 'blue' },
           { label: 'Active Policies', val: submissions.filter(s => s.status === 'Active').length, icon: Shield, color: 'green' },
           { label: 'Pending', val: submissions.filter(s => s.status === 'Pending').length, icon: Activity, color: 'orange' },
           { label: 'Avg Premium', val: submissions.length > 0 ? `$${(submissions.reduce((sum, s) => sum + parseFloat(s.premium || 0), 0) / submissions.length).toFixed(2)}` : '$0.00', icon: DollarSign, color: 'purple' },
         ].map((stat, i) => (
           <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-800">{stat.val}</h3>
              </div>
              <div className={`p-3 rounded-lg bg-${stat.color}-50 text-${stat.color}-600`}>
                <stat.icon size={24} />
              </div>
           </div>
         ))}
       </div>

       <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
         <div className="relative z-10 flex items-start gap-4">
            <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
               <Sparkles size={24} className="text-yellow-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">AI Underwriting Insights</h3>
              <p className="text-blue-100 text-sm max-w-xl leading-relaxed">
                Today's analysis suggests a 15% increase in Graded Benefit qualifications due to recent health questionnaire trends in the Southeast region. 
              </p>
              <button className="mt-4 px-4 py-2 bg-white text-blue-700 text-sm font-bold rounded-lg hover:bg-blue-50 transition-colors">
                View Report
              </button>
            </div>
         </div>
       </div>

       <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
         <div className="p-5 border-b border-slate-100 flex justify-between items-center">
           <h3 className="font-bold text-slate-800">Recent Applications</h3>
           <button onClick={() => setActiveTab('applications')} className="text-sm text-blue-600 font-semibold hover:underline">View All</button>
         </div>
         <table className="w-full text-left text-sm">
           <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
             <tr>
               <th className="px-6 py-3">ID</th>
               <th className="px-6 py-3">Applicant</th>
               <th className="px-6 py-3">Plan</th>
               <th className="px-6 py-3">Status</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
             {filteredSubmissions.slice(0, 5).map((row) => (
               <tr key={row.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setSelectedApp(row)}>
                 <td className="px-6 py-4 font-mono text-slate-500">{row.id}</td>
                 <td className="px-6 py-4 font-medium text-slate-800">{row.name}</td>
                 <td className="px-6 py-4 text-slate-600 truncate max-w-[150px]">{row.plan}</td>
                 <td className="px-6 py-4"><StatusBadge status={row.status} /></td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="animate-fade-in space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm gap-4">
         <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
           <BarChart3 className="text-blue-600" /> Performance Metrics
         </h3>
         <div className="flex bg-slate-100 p-1 rounded-lg">
           {['Daily', 'Weekly', 'Monthly', 'Quarterly', 'YTD'].map(period => (
             <button 
               key={period}
               onClick={() => setTimeFilter(period)}
               className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${timeFilter === period ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               {period}
             </button>
           ))}
         </div>
       </div>

       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Applications', val: analyticsData.counts.applications, icon: FileText, color: 'blue' },
            { label: 'Underwriting', val: analyticsData.counts.underwriting, icon: Activity, color: 'indigo' },
            { label: 'Issued', val: analyticsData.counts.issued, icon: CheckCircle, color: 'green' },
            { label: 'Paid & Issued', val: analyticsData.counts.paidIssued, icon: DollarSign, color: 'emerald' },
            { label: 'Active', val: analyticsData.counts.active, icon: Shield, color: 'blue' },
            { label: 'Not Taken', val: analyticsData.counts.notTaken, icon: X, color: 'slate' },
            { label: 'Cancelled', val: analyticsData.counts.cancelled, icon: AlertOctagon, color: 'orange' },
            { label: 'Lapsed', val: analyticsData.counts.lapsed, icon: AlertTriangle, color: 'red' },
          ].map((stat, i) => (
             <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-2">
                   <div className={`p-2 rounded-lg bg-${stat.color}-50 text-${stat.color}-600`}>
                     <stat.icon size={20} />
                   </div>
                   <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800">{stat.val}</h3>
             </div>
          ))}
       </div>

       <div className="bg-slate-900 text-white rounded-xl shadow-lg p-6 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
               <Target className="text-blue-400" /> Efficiency & Retention (YTD)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-2xl font-bold">{analyticsData.retentionRate}%</span>
                    <span className="text-xs text-green-400 font-bold bg-green-400/10 px-2 py-1 rounded">+2.4% vs last year</span>
                  </div>
                  <p className="text-slate-300 font-medium">Retention Rate</p>
                  <p className="text-xs text-slate-500 mt-1">Active / (Active + Cancelled + Lapsed)</p>
                  <div className="w-full h-1.5 bg-slate-700 rounded-full mt-3 overflow-hidden">
                     <div className="h-full bg-blue-500 rounded-full" style={{ width: `${analyticsData.retentionRate}%` }}></div>
                  </div>
               </div>

               <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-2xl font-bold">{analyticsData.appsToIssue}%</span>
                    <span className="text-xs text-yellow-400 font-bold bg-yellow-400/10 px-2 py-1 rounded">-1.2% vs last year</span>
                  </div>
                  <p className="text-slate-300 font-medium">Apps to Issue %</p>
                  <p className="text-xs text-slate-500 mt-1">Active / Total Applications</p>
                  <div className="w-full h-1.5 bg-slate-700 rounded-full mt-3 overflow-hidden">
                     <div className="h-full bg-purple-500 rounded-full" style={{ width: `${analyticsData.appsToIssue}%` }}></div>
                  </div>
               </div>
            </div>
          </div>
          <div className="absolute right-0 top-0 w-64 h-64 bg-blue-600/20 blur-3xl rounded-full"></div>
       </div>
    </div>
  );

  const renderApplications = () => (
     <div className="animate-fade-in bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
           <h3 className="font-bold text-slate-800 text-lg">All Applications</h3>
           <div className="flex gap-2">
             <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-2">
               <Filter size={16}/> Filter
             </button>
             <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-2">
               <Download size={16}/> Export
             </button>
           </div>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Applicant</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Plan Type</th>
                <th className="px-6 py-3">Premium</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubmissions.map((row) => (
                <tr key={row.id} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="px-6 py-4 font-mono text-slate-500">{row.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{row.name}</td>
                  <td className="px-6 py-4 text-slate-500">{row.date}</td>
                  <td className="px-6 py-4 text-slate-600 max-w-[200px] truncate">{row.plan}</td>
                  <td className="px-6 py-4 font-medium">${parseFloat(row.premium).toFixed(2)}</td>
                  <td className="px-6 py-4"><StatusBadge status={row.status} /></td>
                  <td className="px-6 py-4 text-right">
                     <button onClick={() => setSelectedApp(row)} className="text-slate-400 hover:text-blue-600 p-1">
                       <MoreHorizontal size={20} />
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
     </div>
  );

  // Derive customers from submissions
  const customers = useMemo(() => {
    const customerMap = {};
    submissions.forEach(sub => {
      const name = sub.name || `${sub.firstName || ''} ${sub.lastName || ''}`.trim();
      if (!customerMap[name]) {
        customerMap[name] = {
          id: `CUST-${sub.id?.slice(-4) || Math.random().toString(36).slice(-4).toUpperCase()}`,
          name,
          email: sub.email || 'N/A',
          phone: sub.phone || 'N/A',
          policies: 0,
          ltv: 0,
          status: sub.status
        };
      }
      customerMap[name].policies += 1;
      customerMap[name].ltv += parseFloat(sub.premium || 0) * 12;
    });
    return Object.values(customerMap);
  }, [submissions]);

  const renderCustomers = () => (
    <div className="animate-fade-in bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
       <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2">
             <Users className="text-blue-600" size={24} />
             <h3 className="font-bold text-slate-800 text-lg">Customer Directory</h3>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow hover:bg-blue-700 flex items-center gap-2">
            <Download size={16}/> Export CSV
          </button>
       </div>
       <div className="flex-1 overflow-auto">
         {customers.length === 0 ? (
           <div className="p-10 text-center text-slate-400">
             <Users size={48} className="mx-auto mb-4 opacity-50" />
             <p>No customers yet. Submit an application to see customers here.</p>
           </div>
         ) : (
         <table className="w-full text-left text-sm">
           <thead className="bg-slate-50 text-slate-500 font-semibold uppercase sticky top-0 z-10">
             <tr>
               <th className="px-6 py-3">Customer ID</th>
               <th className="px-6 py-3">Name</th>
               <th className="px-6 py-3">Contact</th>
               <th className="px-6 py-3">Policies</th>
               <th className="px-6 py-3">LTV</th>
               <th className="px-6 py-3">Status</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
             {customers.map((cust) => (
               <tr key={cust.id} className="hover:bg-blue-50/50 transition-colors group">
                 <td className="px-6 py-4 font-mono text-slate-500">{cust.id}</td>
                 <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                      {cust.name?.split(' ').map(n=>n[0]).join('') || '?'}
                    </div>
                    {cust.name}
                 </td>
                 <td className="px-6 py-4 text-slate-500">
                   <div className="flex items-center gap-2"><Mail size={12}/> {cust.email}</div>
                 </td>
                 <td className="px-6 py-4 font-medium text-slate-800">{cust.policies}</td>
                 <td className="px-6 py-4 font-medium text-slate-800">${cust.ltv.toFixed(2)}</td>
                 <td className="px-6 py-4"><StatusBadge status={cust.status} /></td>
               </tr>
             ))}
           </tbody>
         </table>
         )}
       </div>
    </div>
  );

  const renderAIRiskCenter = () => (
    <div className="animate-fade-in space-y-6">
       <div className="flex items-center justify-between bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
               <BrainCircuit className="text-purple-600" /> Risk Control Center
            </h2>
            <p className="text-slate-500 mt-1">Real-time fraud detection and underwriting analysis.</p>
          </div>
          <div className="flex gap-4">
             <div className="text-right">
                <p className="text-xs text-slate-400 uppercase font-bold">System Status</p>
                <p className="text-green-600 font-bold flex items-center justify-end gap-1"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Online</p>
             </div>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4">Risk Distribution Heatmap</h3>
                <div className="grid grid-cols-6 gap-2 h-40">
                   {[...Array(24)].map((_, i) => {
                      const risk = Math.random();
                      const color = risk > 0.8 ? 'bg-red-500' : risk > 0.5 ? 'bg-orange-400' : risk > 0.3 ? 'bg-yellow-300' : 'bg-green-400';
                      return (
                        <div key={i} className={`rounded-md ${color} opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}></div>
                      );
                   })}
                </div>
             </div>

             <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-700">Recent AI Alerts</div>
                <div className="divide-y divide-slate-100">
                   {[
                     { msg: "Velocity Check: Multiple applications from IP 192.168.1.1", time: "10 min ago", severity: "high" },
                     { msg: "Inconsistency: BMI does not match age/weight average", time: "45 min ago", severity: "medium" },
                   ].map((alert, i) => (
                     <div key={i} className="p-4 flex items-start gap-4 hover:bg-slate-50">
                        <div className={`p-2 rounded-lg ${alert.severity === 'high' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                           <AlertOctagon size={20} />
                        </div>
                        <div className="flex-1">
                           <p className="font-bold text-slate-800 text-sm">{alert.msg}</p>
                           <p className="text-xs text-slate-400">{alert.time}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>

          <div className="bg-purple-600 text-white p-6 rounded-xl shadow-lg">
             <div className="flex items-center gap-3 mb-4">
               <Zap size={24} className="text-yellow-300" />
               <h3 className="font-bold">Auto-Decision Rate</h3>
             </div>
             <div className="flex items-end gap-2 mb-2">
               <span className="text-5xl font-bold">78%</span>
               <span className="text-purple-200 mb-1">of apps</span>
             </div>
             <p className="text-sm text-purple-200">System is automatically processing majority of standard immediate benefit applications.</p>
          </div>
       </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0 transition-all">
        <div className="p-6 border-b border-slate-800">
           <div className="flex items-center gap-2 text-white mb-1">
             <Shield className="text-red-600 fill-current" size={28} />
             <h1 className="font-extrabold tracking-wider text-lg">AMBEN</h1>
           </div>
           <p className="text-xs text-slate-400 uppercase tracking-widest pl-9">Admin Portal</p>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <p className="text-xs font-bold text-slate-500 uppercase mb-3 pl-4">Main Menu</p>
          <SidebarItem id="overview" icon={LayoutDashboard} label="Dashboard" />
          
          <p className="text-xs font-bold text-slate-500 uppercase mt-6 mb-3 pl-4">Analytics</p>
          <SidebarItem id="analytics" icon={PieChart} label="Performance" />
          <SidebarItem id="ai-risk" icon={BrainCircuit} label="AI Risk Center" />

          <p className="text-xs font-bold text-slate-500 uppercase mt-6 mb-3 pl-4">Management</p>
          <SidebarItem id="applications" icon={FileText} label="Applications" />
          <SidebarItem id="customers" icon={Users} label="Customers" />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-slate-800 rounded-lg transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* New Application Notification Toast */}
        {notification && (
          <div className="fixed top-4 right-4 z-50 animate-bounce-in">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-xl shadow-2xl min-w-80 border-2 border-white/20">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-full animate-pulse">
                  <Bell size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg flex items-center gap-2">
                    {notification.title}
                    <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                  </h4>
                  <p className="text-white/90 text-sm mt-1">{notification.message}</p>
                  <button 
                    onClick={() => { setSelectedApp(notification.app); setNotification(null); }}
                    className="mt-3 px-4 py-2 bg-white text-emerald-700 font-bold rounded-lg text-sm hover:bg-emerald-50 transition-colors"
                  >
                    View Application
                  </button>
                </div>
                <button onClick={() => setNotification(null)} className="text-white/70 hover:text-white">
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-4 flex-1">
             <h2 className="text-xl font-bold text-slate-800 capitalize">{activeTab.replace('-', ' ')}</h2>
             {/* AI Smart Search */}
             <div className="relative flex-1 max-w-md ml-8 group">
               <Search className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
               <input 
                 type="text" 
                 placeholder="Ask AI: 'Show pending apps...'" 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
               />
               <Sparkles className="absolute right-3 top-2.5 text-purple-500 opacity-0 group-focus-within:opacity-100 transition-opacity" size={16} />
             </div>
          </div>
          <div className="flex items-center gap-4">
             <button className="relative p-2 text-slate-400 hover:text-blue-600 transition-colors">
               <Bell size={20} />
               <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
             </button>
             <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold border border-blue-200">
               AD
             </div>
          </div>
        </header>

        {/* Content Views */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'analytics' && renderAnalytics()}
          {activeTab === 'applications' && renderApplications()}
          {activeTab === 'customers' && renderCustomers()}
          {activeTab === 'ai-risk' && renderAIRiskCenter()}
        </div>

        {/* Application Detail "Jacket" Modal */}
        {selectedApp && (
           <div className="absolute inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-md animate-fade-in">
              <div className="w-full max-w-5xl bg-white h-full shadow-2xl overflow-y-auto transform transition-transform border-l border-slate-200 flex flex-col">
                 
                 {/* Detail Header */}
                 <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-8 py-6 flex justify-between items-start shadow-sm">
                    <div className="flex items-start gap-4">
                       <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                          <FileText size={32} />
                       </div>
                       <div>
                         <div className="flex items-center gap-3">
                           <h2 className="text-2xl font-bold text-slate-900">{selectedApp.name || selectedApp.firstName + ' ' + selectedApp.lastName}</h2>
                           <StatusBadge status={selectedApp.status} />
                         </div>
                         <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">ID: {selectedApp.id}</span>
                            <span className="flex items-center gap-1"><Calendar size={14}/> {selectedApp.date}</span>
                            <span className="flex items-center gap-1"><MapPin size={14}/> {selectedApp.state || 'N/A'}</span>
                         </div>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200 transition-colors">
                        <Printer size={18} /> Print
                      </button>
                      <button onClick={() => setSelectedApp(null)} className="p-2 hover:bg-slate-100 text-slate-400 hover:text-red-500 rounded-full transition-colors">
                        <X size={24} />
                      </button>
                    </div>
                 </div>

                 <div className="p-8 space-y-8 bg-slate-50/50 flex-1">
                    
                    {/* Top Row: Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                           <p className="text-xs font-bold text-slate-400 uppercase">Risk Score</p>
                           <div className="flex items-center gap-2 mt-1">
                              <span className={`text-2xl font-bold ${selectedApp.riskScore > 50 ? 'text-red-600' : 'text-green-600'}`}>{selectedApp.riskScore || 'Pending'}</span>
                              <Activity size={16} className="text-slate-400"/>
                           </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                           <p className="text-xs font-bold text-slate-400 uppercase">Monthly Premium</p>
                           <div className="flex items-center gap-2 mt-1">
                              <span className="text-2xl font-bold text-slate-800">${parseFloat(selectedApp.premium).toFixed(2)}</span>
                              <DollarSign size={16} className="text-slate-400"/>
                           </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm md:col-span-2 flex items-center justify-between">
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase">Carrier</p>
                              <p className="text-lg font-bold text-slate-800">{selectedApp.carrier || 'American Amicable'}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-slate-400 uppercase">Plan</p>
                              <p className="text-lg font-bold text-blue-600">{selectedApp.plan}</p>
                            </div>
                        </div>
                    </div>

                    {/* Main Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      
                       {/* Column 1: Personal & Policy */}
                       <div className="space-y-6">
                          <div>
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                              <User size={20} className="text-blue-500"/> Personal Information
                            </h3>
                            <div className="grid grid-cols-1 gap-2">
                               <DataField label="Full Name" value={`${selectedApp.firstName || selectedApp.name} ${selectedApp.middleName || ''} ${selectedApp.lastName || ''}`} />
                               <DataField label="Date of Birth" value={selectedApp.dob} />
                               <DataField label="Age" value={selectedApp.age} />
                               <DataField label="SSN" value={selectedApp.ssn} />
                               <DataField label="Gender" value={selectedApp.gender} />
                               <div className="grid grid-cols-2 gap-2">
                                  <DataField label="Height" value={selectedApp.height} />
                                  <DataField label="Weight" value={selectedApp.weight ? `${selectedApp.weight} lbs` : null} />
                               </div>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                              <MapPin size={20} className="text-orange-500"/> Contact Details
                            </h3>
                            <div className="grid grid-cols-1 gap-2">
                               <DataField label="Address" value={selectedApp.address} />
                               <div className="grid grid-cols-2 gap-2">
                                 <DataField label="City" value={selectedApp.city} />
                                 <DataField label="State" value={selectedApp.state} />
                               </div>
                               <DataField label="Zip Code" value={selectedApp.zip} />
                               <DataField label="Phone" value={selectedApp.phone || '(555) 000-0000'} />
                               <DataField label="Email" value={selectedApp.email || 'N/A'} />
                            </div>
                          </div>

                          {/* Owner Section - only show if owner exists */}
                          {selectedApp.ownerName && (
                           <div>
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                              <Users size={20} className="text-indigo-500"/> Policy Owner
                            </h3>
                            <div className="grid grid-cols-1 gap-2">
                               <DataField label="Owner Name" value={selectedApp.ownerName} />
                               <DataField label="Relationship" value={selectedApp.ownerRel} />
                               <DataField label="Owner SSN" value={selectedApp.ownerSsn} />
                               <DataField label="Owner Address" value={selectedApp.ownerAddress} />
                            </div>
                           </div>
                          )}
                       </div>

                       {/* Column 2: Beneficiaries & Bank */}
                       <div className="space-y-6">
                          <div>
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                              <Heart size={20} className="text-red-500"/> Beneficiaries
                            </h3>
                            <div className="space-y-4">
                               <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm relative overflow-hidden">
                                  <div className="absolute top-0 right-0 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase">Primary</div>
                                  <DataField label="Name" value={selectedApp.primaryBenName} />
                                  <div className="mt-2 text-xs text-slate-500 flex gap-2">
                                     <span className="font-bold">Rel:</span> {selectedApp.primaryBenRel || 'N/A'}
                                  </div>
                               </div>
                               <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm relative overflow-hidden opacity-80">
                                  <div className="absolute top-0 right-0 bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase">Contingent</div>
                                  <DataField label="Name" value={selectedApp.contingentBenName} />
                                  <div className="mt-2 text-xs text-slate-500 flex gap-2">
                                     <span className="font-bold">Rel:</span> {selectedApp.contingentBenRel || 'N/A'}
                                  </div>
                               </div>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                              <CreditCard size={20} className="text-emerald-500"/> Banking & Payment
                            </h3>
                            <div className="grid grid-cols-1 gap-2">
                               <DataField label="Name on Account" value={selectedApp.accountName} />
                               <DataField label="Account Type" value={selectedApp.accountType} />
                               <DataField label="Bank Name" value={selectedApp.bankName} />
                               <DataField label="Bank Address" value={selectedApp.bankAddress} />
                               <DataField label="Routing Number" value={selectedApp.routing} />
                               <DataField label="Account Number" value={selectedApp.accountNum} />
                               <DataField label="Draft Schedule" value={selectedApp.draftSchedule === 'ss_payment' ? 'Social Security' : 'Specific Date'} />
                               <DataField label="Draft Date" value={selectedApp.draftDate} />
                            </div>
                          </div>
                       </div>

                       {/* Column 3: Health & Status */}
                       <div className="space-y-6">
                           <div>
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                              <Stethoscope size={20} className="text-purple-500"/> Health & Underwriting
                            </h3>
                            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3">
                                <DataField label="Physician" value={selectedApp.physicianName} />
                                <DataField label="Tobacco Use" value={selectedApp.tobacco === true ? 'YES' : 'NO'} />
                                
                                <div className="border-t border-slate-100 pt-3">
                                   <p className="text-xs font-bold text-red-600 uppercase mb-2">Knockout Questions (1-3)</p>
                                   <div className="space-y-1 text-sm">
                                      <div className="flex justify-between"><span>Q1</span><span className={selectedApp.q1 ? 'text-red-600 font-bold' : 'text-green-600'}>{selectedApp.q1 ? 'YES' : 'NO'}</span></div>
                                      <div className="flex justify-between"><span>Q2</span><span className={selectedApp.q2 ? 'text-red-600 font-bold' : 'text-green-600'}>{selectedApp.q2 ? 'YES' : 'NO'}</span></div>
                                      <div className="flex justify-between"><span>Q3</span><span className={selectedApp.q3 ? 'text-red-600 font-bold' : 'text-green-600'}>{selectedApp.q3 ? 'YES' : 'NO'}</span></div>
                                   </div>
                                </div>

                                <div className="border-t border-slate-100 pt-3">
                                   <p className="text-xs font-bold text-yellow-600 uppercase mb-2">ROP Questions (4-7)</p>
                                   <div className="space-y-1 text-sm">
                                      <div className="flex justify-between"><span>Q4</span><span className={selectedApp.q4 ? 'text-yellow-600 font-bold' : 'text-green-600'}>{selectedApp.q4 ? 'YES' : 'NO'}</span></div>
                                      <div className="flex justify-between"><span>Q5</span><span className={selectedApp.q5 ? 'text-yellow-600 font-bold' : 'text-green-600'}>{selectedApp.q5 ? 'YES' : 'NO'}</span></div>
                                      <div className="flex justify-between"><span>Q6</span><span className={selectedApp.q6 ? 'text-yellow-600 font-bold' : 'text-green-600'}>{selectedApp.q6 ? 'YES' : 'NO'}</span></div>
                                      <div className="flex justify-between"><span>Q7a</span><span className={selectedApp.q7a ? 'text-yellow-600 font-bold' : 'text-green-600'}>{selectedApp.q7a ? 'YES' : 'NO'}</span></div>
                                      <div className="flex justify-between"><span>Q7b</span><span className={selectedApp.q7b ? 'text-yellow-600 font-bold' : 'text-green-600'}>{selectedApp.q7b ? 'YES' : 'NO'}</span></div>
                                      <div className="flex justify-between"><span>Q7c</span><span className={selectedApp.q7c ? 'text-yellow-600 font-bold' : 'text-green-600'}>{selectedApp.q7c ? 'YES' : 'NO'}</span></div>
                                      <div className="flex justify-between"><span>Q7d</span><span className={selectedApp.q7d ? 'text-yellow-600 font-bold' : 'text-green-600'}>{selectedApp.q7d ? 'YES' : 'NO'}</span></div>
                                   </div>
                                </div>

                                <div className="border-t border-slate-100 pt-3">
                                   <p className="text-xs font-bold text-blue-600 uppercase mb-2">Graded Questions (8)</p>
                                   <div className="space-y-1 text-sm">
                                      <div className="flex justify-between"><span>Q8a</span><span className={selectedApp.q8a ? 'text-blue-600 font-bold' : 'text-green-600'}>{selectedApp.q8a ? 'YES' : 'NO'}</span></div>
                                      <div className="flex justify-between"><span>Q8b</span><span className={selectedApp.q8b ? 'text-blue-600 font-bold' : 'text-green-600'}>{selectedApp.q8b ? 'YES' : 'NO'}</span></div>
                                      <div className="flex justify-between"><span>Q8c</span><span className={selectedApp.q8c ? 'text-blue-600 font-bold' : 'text-green-600'}>{selectedApp.q8c ? 'YES' : 'NO'}</span></div>
                                   </div>
                                </div>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                              <Shield size={20} className="text-blue-600"/> Agent Actions
                            </h3>
                             <div className="space-y-2">
                                <button className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition flex items-center justify-center gap-2">
                                   <ExternalLink size={18} /> Open Carrier Portal
                                </button>
                                <button className="w-full py-3 bg-white text-slate-700 border-2 border-slate-200 font-bold rounded-lg hover:bg-slate-50 transition flex items-center justify-center gap-2">
                                   <Zap size={18} /> Validate Data
                                </button>
                             </div>
                          </div>
                       </div>

                    </div>
                 </div>
              </div>
           </div>
        )}

      </main>
    </div>
  );
};



// --- Main Controller ---

export default function App() {
  const [view, setView] = useState('home'); // 'home', 'app', 'admin'
  const [submissions, setSubmissions] = useState([]);
  const [lastSubmission, setLastSubmission] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load applications from API
  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getApplications();
      setSubmissions(data);
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleAppSubmit = async (data) => {
    try {
      // Create application object with name field for dashboard
      const newApp = {
        ...data,
        name: `${data.firstName} ${data.lastName}`.trim(),
        status: 'Pending'
      };
      
      await api.createApplication(newApp);
      setLastSubmission(newApp);
      setView('success');
      // Reload to get the saved version
      loadApplications();
    } catch (error) {
      console.error('Failed to submit application:', error);
      alert('Failed to submit application. Please try again.');
    }
  };

  const handleUpdateSubmission = async (updatedData) => {
    try {
      await api.updateApplication(updatedData.id, updatedData);
      setSubmissions(prev => prev.map(sub => sub.id === updatedData.id ? updatedData : sub));
    } catch (error) {
      console.error('Failed to update application:', error);
    }
  };

  // Intro Screen to choose path (for demo purposes)
  if (view === 'home') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl shadow-2xl overflow-hidden min-h-[500px]">
           {/* Left: Customer Side */}
           <div className="p-10 flex flex-col justify-center items-center text-center border-r border-slate-100 group hover:bg-blue-50 transition-colors cursor-pointer" onClick={() => setView('app')}>
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform">
                <User size={40} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Customer Application</h2>
              <p className="text-slate-500">Launch the smart application form for new insurance applicants.</p>
              <button className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full font-bold shadow-lg hover:shadow-blue-500/30 transition-shadow">Start App</button>
           </div>
           {/* Right: Admin Side */}
           <div className="p-10 flex flex-col justify-center items-center text-center group hover:bg-slate-900 hover:text-white transition-colors cursor-pointer" onClick={() => setView('admin')}>
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-700 group-hover:bg-slate-800 group-hover:text-white group-hover:scale-110 transition-transform">
                <LayoutDashboard size={40} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 group-hover:text-white mb-2">Agent Dashboard</h2>
              <p className="text-slate-500 group-hover:text-slate-400">Login to the AI-powered backend to manage submissions and risks.</p>
              <button className="mt-6 px-6 py-2 bg-white border border-slate-300 text-slate-700 rounded-full font-bold hover:bg-slate-50 group-hover:bg-blue-600 group-hover:border-transparent group-hover:text-white transition-all">Login</button>
           </div>
        </div>
      </div>
    );
  }

  if (view === 'app') {
    return <CustomerForm onComplete={handleAppSubmit} />;
  }

  if (view === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
         <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full animate-fade-in">
           <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
             <CheckCircle size={40} />
           </div>
           <h2 className="text-2xl font-bold text-slate-800 mb-2">Application Received</h2>
           <p className="text-slate-500 mb-6">Thank you, {lastSubmission?.firstName}. Your application ID is <span className="font-mono font-bold text-slate-700">{lastSubmission?.id}</span>.</p>
           <div className="flex flex-col gap-3">
             <button onClick={() => setView('home')} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold">Return Home</button>
             <button onClick={() => setView('admin')} className="w-full py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold">View in Dashboard (Demo)</button>
           </div>
         </div>
      </div>
    );
  }

  if (view === 'admin') {
    return <AdminDashboard submissions={submissions} onLogout={() => setView('home')} onUpdateSubmission={handleUpdateSubmission} />;
  }

  return null;
}