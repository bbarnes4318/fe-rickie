import React, { useState, useEffect, useMemo, useCallback } from "react";
import { api } from "./api";
import CallPopApp from './CallPopApp'; 
import {
  User, MapPin, Calendar, Heart, DollarSign, Activity, Users,
  CheckCircle, AlertTriangle, ChevronRight, ChevronLeft, FileText,
  CreditCard, Shield, Stethoscope, LayoutDashboard, Search, Bell,
  PieChart, TrendingUp, Filter, MoreHorizontal, Download, Sparkles,
  BrainCircuit, X, LogOut, Mail, Phone, Zap, AlertOctagon, BarChart3,
  Target, Save, RefreshCw, Copy, ExternalLink, Printer, Trash2, ArrowRight,
  ArrowDown, ArrowDownRight, GitBranch, Layers, ChevronDown, TrendingDown,
  CircleDot, GitMerge, Banknote, XCircle, Clock, CheckCircle2
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS & CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

const STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];
const RELATIONSHIPS = ["Spouse", "Child", "Parent", "Partner", "Friend", "Relative", "Other"];
const APP_STATUSES = ["Lead", "Submitted", "Underwriting", "Issued", "Paid", "Not Taken", "Declined", "Lapsed"];

const CARRIERS = {
  "American Amicable": ["Level", "Graded", "Modified"],
  Corebridge: ["Guaranteed Issue"],
  TransAmerica: ["Level"],
  Aflac: ["Level"],
  SBLI: ["Level"],
  CICA: ["Level"],
  GTL: ["Graded"],
};

const CARRIER_CONFIG = {
  Aflac: { annualFee: 48, monthlyFactor: 0.0875, hasTobacco: true },
  SBLI: { annualFee: 48, monthlyFactor: 0.087, hasTobacco: true },
  CICA: { annualFee: 0, monthlyFactor: 0, hasTobacco: false, simpleFormula: true },
  GTL: { annualFee: 48, monthlyFactor: 0.08333, hasTobacco: false },
  Corebridge: { annualFee: 0, monthlyFactor: 0, hasTobacco: false, directLookup: true },
  TransAmerica: { annualFee: 48, monthlyFactor: 0.0875, hasTobacco: true },
  "American Amicable": { annualFee: 30, monthlyFactor: 0.088, hasTobacco: true },
};

const CARRIER_LOGOS = {
  Aflac: "/logos/aflac.png",
  "American Amicable": "/logos/amam.png",
  CICA: "/logos/cica.png",
  Corebridge: "/logos/corebridge.png",
  GTL: "/logos/gtl.png",
  SBLI: "/logos/sbli.png",
  TransAmerica: "/logos/trans.png",
};

const HEIGHT_OPTIONS = [];
for (let ft = 4; ft <= 7; ft++) {
  for (let inch = 0; inch <= 11; inch++) {
    HEIGHT_OPTIONS.push(`${ft}'${inch}"`);
  }
}

const INITIAL_DATA = {
  carrier: "", planType: "", monthlyPremium: "",
  firstName: "", middleName: "", lastName: "",
  address: "", city: "", state: "", zip: "", phone: "",
  dob: "", age: "", stateOfBirth: "", ssn: "",
  height: "5'9\"", weight: 170, gender: "",
  ownerName: "", ownerRel: "", ownerSsn: "", ownerAddress: "",
  primaryBenName: "", primaryBenRel: "",
  contingentBenName: "", contingentBenRel: "",
  faceAmount: 15000, willingToAccept: false, tobacco: null,
  hasExisting: null, willReplace: null,
  physicianName: "",
  q1: null, q2: null, q3: null, q4: null, q5: null, q6: null,
  q7a: null, q7b: null, q7c: null, q7d: null,
  q8a: null, q8b: null, q8c: null,
  accountName: "", accountType: "checking", bankName: "",
  bankAddress: "", routing: "", accountNum: "",
  draftSchedule: "ss_payment", draftDate: "",
};

// ═══════════════════════════════════════════════════════════════════
// RATE TABLES (Keeping all your existing rate tables)
// ═══════════════════════════════════════════════════════════════════

const AFLAC_RATES = {
  45: { maleNS: 28.97, maleSm: 45.4, femaleNS: 24.0, femaleSm: 36.7 },
  46: { maleNS: 29.87, maleSm: 45.83, femaleNS: 24.41, femaleSm: 37.05 },
  47: { maleNS: 30.78, maleSm: 46.29, femaleNS: 24.81, femaleSm: 37.43 },
  48: { maleNS: 31.68, maleSm: 46.76, femaleNS: 25.22, femaleSm: 37.81 },
  49: { maleNS: 32.59, maleSm: 47.23, femaleNS: 25.62, femaleSm: 38.19 },
  50: { maleNS: 33.49, maleSm: 47.71, femaleNS: 26.03, femaleSm: 38.57 },
  51: { maleNS: 34.58, maleSm: 50.0, femaleNS: 26.6, femaleSm: 40.17 },
  52: { maleNS: 35.67, maleSm: 52.28, femaleNS: 27.16, femaleSm: 41.77 },
  53: { maleNS: 36.75, maleSm: 54.57, femaleNS: 27.73, femaleSm: 43.37 },
  54: { maleNS: 37.84, maleSm: 56.85, femaleNS: 28.29, femaleSm: 44.97 },
  55: { maleNS: 38.93, maleSm: 59.14, femaleNS: 28.86, femaleSm: 46.57 },
  56: { maleNS: 40.5, maleSm: 61.42, femaleNS: 30.04, femaleSm: 48.17 },
  57: { maleNS: 42.08, maleSm: 63.71, femaleNS: 31.23, femaleSm: 49.77 },
  58: { maleNS: 43.66, maleSm: 66.0, femaleNS: 32.42, femaleSm: 51.37 },
  59: { maleNS: 45.23, maleSm: 68.28, femaleNS: 33.61, femaleSm: 52.97 },
  60: { maleNS: 46.81, maleSm: 70.57, femaleNS: 34.8, femaleSm: 54.57 },
  61: { maleNS: 49.24, maleSm: 75.48, femaleNS: 36.93, femaleSm: 57.31 },
  62: { maleNS: 51.67, maleSm: 80.4, femaleNS: 39.06, femaleSm: 60.06 },
  63: { maleNS: 54.11, maleSm: 85.31, femaleNS: 41.2, femaleSm: 62.8 },
  64: { maleNS: 56.54, maleSm: 90.22, femaleNS: 43.33, femaleSm: 65.54 },
  65: { maleNS: 58.97, maleSm: 95.14, femaleNS: 45.46, femaleSm: 68.28 },
  66: { maleNS: 62.71, maleSm: 101.37, femaleNS: 48.42, femaleSm: 72.65 },
  67: { maleNS: 66.45, maleSm: 107.6, femaleNS: 51.37, femaleSm: 77.02 },
  68: { maleNS: 70.19, maleSm: 113.82, femaleNS: 54.33, femaleSm: 81.39 },
  69: { maleNS: 73.93, maleSm: 120.05, femaleNS: 57.28, femaleSm: 85.76 },
  70: { maleNS: 77.68, maleSm: 126.28, femaleNS: 60.24, femaleSm: 90.14 },
  71: { maleNS: 82.28, maleSm: 133.54, femaleNS: 64.16, femaleSm: 95.54 },
  72: { maleNS: 86.88, maleSm: 140.8, femaleNS: 68.08, femaleSm: 100.94 },
  73: { maleNS: 91.48, maleSm: 148.06, femaleNS: 72.0, femaleSm: 106.34 },
  74: { maleNS: 96.08, maleSm: 155.32, femaleNS: 75.92, femaleSm: 111.74 },
  75: { maleNS: 100.69, maleSm: 162.58, femaleNS: 79.84, femaleSm: 117.14 },
  76: { maleNS: 107.56, maleSm: 173.31, femaleNS: 85.35, femaleSm: 124.48 },
  77: { maleNS: 114.44, maleSm: 184.03, femaleNS: 90.86, femaleSm: 131.82 },
  78: { maleNS: 121.31, maleSm: 194.76, femaleNS: 96.37, femaleSm: 139.16 },
  79: { maleNS: 128.19, maleSm: 205.48, femaleNS: 101.88, femaleSm: 146.5 },
  80: { maleNS: 135.06, maleSm: 216.21, femaleNS: 107.39, femaleSm: 153.84 },
};

const SBLI_RATES = {
  50: { maleNS: 38.9, maleSm: 52.9, femaleNS: 30.85, femaleSm: 41.8 },
  51: { maleNS: 40.35, maleSm: 55.05, femaleNS: 32.05, femaleSm: 43.25 },
  52: { maleNS: 41.8, maleSm: 57.2, femaleNS: 33.25, femaleSm: 44.7 },
  53: { maleNS: 43.25, maleSm: 59.35, femaleNS: 34.45, femaleSm: 46.15 },
  54: { maleNS: 44.7, maleSm: 61.5, femaleNS: 35.65, femaleSm: 47.6 },
  55: { maleNS: 46.15, maleSm: 63.65, femaleNS: 36.85, femaleSm: 49.05 },
  56: { maleNS: 48.2, maleSm: 66.5, femaleNS: 38.5, femaleSm: 51.25 },
  57: { maleNS: 50.25, maleSm: 69.35, femaleNS: 40.15, femaleSm: 53.45 },
  58: { maleNS: 52.3, maleSm: 72.2, femaleNS: 41.8, femaleSm: 55.65 },
  59: { maleNS: 54.35, maleSm: 75.05, femaleNS: 43.45, femaleSm: 57.85 },
  60: { maleNS: 56.4, maleSm: 77.9, femaleNS: 45.1, femaleSm: 60.05 },
  61: { maleNS: 59.35, maleSm: 82.4, femaleNS: 47.55, femaleSm: 63.35 },
  62: { maleNS: 62.3, maleSm: 86.9, femaleNS: 50.0, femaleSm: 66.65 },
  63: { maleNS: 65.25, maleSm: 91.4, femaleNS: 52.45, femaleSm: 69.95 },
  64: { maleNS: 68.2, maleSm: 95.9, femaleNS: 54.9, femaleSm: 73.25 },
  65: { maleNS: 71.15, maleSm: 100.4, femaleNS: 57.35, femaleSm: 76.55 },
  66: { maleNS: 76.2, maleSm: 108.5, femaleNS: 61.8, femaleSm: 83.5 },
  67: { maleNS: 81.25, maleSm: 116.6, femaleNS: 66.25, femaleSm: 90.45 },
  68: { maleNS: 86.3, maleSm: 124.7, femaleNS: 70.7, femaleSm: 97.4 },
  69: { maleNS: 91.35, maleSm: 132.8, femaleNS: 75.15, femaleSm: 104.35 },
  70: { maleNS: 96.4, maleSm: 140.9, femaleNS: 79.6, femaleSm: 111.3 },
  71: { maleNS: 103.35, maleSm: 151.55, femaleNS: 85.55, femaleSm: 120.05 },
  72: { maleNS: 110.3, maleSm: 162.2, femaleNS: 91.5, femaleSm: 128.8 },
  73: { maleNS: 117.25, maleSm: 172.85, femaleNS: 97.45, femaleSm: 137.55 },
  74: { maleNS: 124.2, maleSm: 183.5, femaleNS: 103.4, femaleSm: 146.3 },
  75: { maleNS: 131.15, maleSm: 194.15, femaleNS: 109.35, femaleSm: 155.05 },
  76: { maleNS: 140.4, maleSm: 208.05, femaleNS: 117.15, femaleSm: 166.35 },
  77: { maleNS: 149.65, maleSm: 221.95, femaleNS: 124.95, femaleSm: 177.65 },
  78: { maleNS: 158.9, maleSm: 235.85, femaleNS: 132.75, femaleSm: 188.95 },
  79: { maleNS: 168.15, maleSm: 249.75, femaleNS: 140.55, femaleSm: 200.25 },
  80: { maleNS: 177.4, maleSm: 263.65, femaleNS: 148.35, femaleSm: 211.55 },
  81: { maleNS: 189.3, maleSm: 281.0, femaleNS: 158.75, femaleSm: 225.55 },
  82: { maleNS: 201.2, maleSm: 298.35, femaleNS: 169.15, femaleSm: 239.55 },
  83: { maleNS: 213.1, maleSm: 315.7, femaleNS: 179.55, femaleSm: 253.55 },
  84: { maleNS: 225.0, maleSm: 333.05, femaleNS: 189.95, femaleSm: 267.55 },
  85: { maleNS: 236.9, maleSm: 350.4, femaleNS: 200.35, femaleSm: 281.55 },
};

const CICA_RATES = {
  45: { male: 32.38, female: 30.03 }, 46: { male: 33.63, female: 31.21 },
  47: { male: 34.89, female: 32.39 }, 48: { male: 36.24, female: 33.64 },
  49: { male: 37.67, female: 34.9 }, 50: { male: 39.11, female: 36.25 },
  51: { male: 40.72, female: 37.68 }, 52: { male: 42.74, female: 39.12 },
  53: { male: 44.92, female: 40.63 }, 54: { male: 47.21, female: 42.54 },
  55: { male: 49.63, female: 44.61 }, 56: { male: 52.39, female: 46.77 },
  57: { male: 55.03, female: 49.05 }, 58: { male: 57.78, female: 51.66 },
  59: { male: 60.68, female: 54.13 }, 60: { male: 63.71, female: 56.7 },
  61: { male: 66.9, female: 59.41 }, 62: { male: 70.25, female: 62.22 },
  63: { male: 73.76, female: 65.18 }, 64: { male: 77.45, female: 68.28 },
  65: { male: 81.32, female: 71.54 }, 66: { male: 85.39, female: 74.97 },
  67: { male: 89.65, female: 78.57 }, 68: { male: 94.14, female: 82.35 },
  69: { male: 98.84, female: 86.31 }, 70: { male: 103.79, female: 90.47 },
  71: { male: 108.98, female: 94.84 }, 72: { male: 114.42, female: 99.42 },
  73: { male: 120.14, female: 104.23 }, 74: { male: 126.15, female: 109.28 },
  75: { male: 132.46, female: 114.59 }, 76: { male: 139.08, female: 120.16 },
  77: { male: 146.04, female: 126.02 }, 78: { male: 153.34, female: 132.17 },
  79: { male: 161.01, female: 138.62 }, 80: { male: 169.06, female: 145.4 },
  81: { male: 177.51, female: 152.52 }, 82: { male: 186.39, female: 160.0 },
  83: { male: 195.71, female: 167.85 }, 84: { male: 205.49, female: 176.09 },
  85: { male: 215.77, female: 184.74 },
};

const GTL_RATES = {
  40: { male: 55, female: 40 }, 41: { male: 56, female: 40 },
  42: { male: 57, female: 40 }, 43: { male: 58, female: 40 },
  44: { male: 59, female: 40 }, 45: { male: 60, female: 40 },
  46: { male: 60, female: 40 }, 47: { male: 60, female: 40 },
  48: { male: 60, female: 40 }, 49: { male: 60, female: 40 },
  50: { male: 61, female: 41 }, 51: { male: 62, female: 42 },
  52: { male: 63, female: 44 }, 53: { male: 64, female: 46 },
  54: { male: 65, female: 49 }, 55: { male: 67, female: 51 },
  56: { male: 70, female: 53 }, 57: { male: 72, female: 55 },
  58: { male: 73, female: 56 }, 59: { male: 75, female: 58 },
  60: { male: 78, female: 60 }, 61: { male: 81, female: 62 },
  62: { male: 84, female: 64 }, 63: { male: 87, female: 66 },
  64: { male: 91, female: 69 }, 65: { male: 95, female: 72 },
  66: { male: 100, female: 75 }, 67: { male: 105, female: 79 },
  68: { male: 110, female: 83 }, 69: { male: 116, female: 87 },
  70: { male: 122, female: 92 }, 71: { male: 129, female: 97 },
  72: { male: 136, female: 103 }, 73: { male: 144, female: 109 },
  74: { male: 152, female: 115 }, 75: { male: 161, female: 122 },
  76: { male: 170, female: 129 }, 77: { male: 180, female: 137 },
  78: { male: 190, female: 145 }, 79: { male: 201, female: 154 },
  80: { male: 213, female: 163 }, 81: { male: 226, female: 173 },
  82: { male: 239, female: 184 }, 83: { male: 253, female: 195 },
  84: { male: 268, female: 207 }, 85: { male: 284, female: 219 },
  86: { male: 301, female: 232 }, 87: { male: 319, female: 246 },
  88: { male: 338, female: 261 }, 89: { male: 358, female: 277 },
};

const TRANSAMERICA_RATES = {
  18: { maleNS: 20.44, maleSm: 24.37, femaleNS: 18.69, femaleSm: 19.25 },
  19: { maleNS: 20.73, maleSm: 25.33, femaleNS: 19.0, femaleSm: 20.06 },
  20: { maleNS: 21.03, maleSm: 26.31, femaleNS: 19.31, femaleSm: 20.89 },
  21: { maleNS: 21.63, maleSm: 27.23, femaleNS: 19.5, femaleSm: 21.57 },
  22: { maleNS: 22.25, maleSm: 28.17, femaleNS: 19.69, femaleSm: 22.27 },
  23: { maleNS: 22.88, maleSm: 29.15, femaleNS: 19.89, femaleSm: 22.99 },
  24: { maleNS: 23.53, maleSm: 30.17, femaleNS: 20.08, femaleSm: 23.74 },
  25: { maleNS: 24.2, maleSm: 31.22, femaleNS: 20.28, femaleSm: 24.51 },
  30: { maleNS: 23.37, maleSm: 31.09, femaleNS: 20.49, femaleSm: 26.9 },
  35: { maleNS: 24.62, maleSm: 35.11, femaleNS: 20.69, femaleSm: 27.4 },
  40: { maleNS: 30.94, maleSm: 45.34, femaleNS: 25.73, femaleSm: 34.74 },
  45: { maleNS: 38.1, maleSm: 58.55, femaleNS: 31.98, femaleSm: 44.05 },
  50: { maleNS: 41.11, maleSm: 63.95, femaleNS: 34.27, femaleSm: 47.63 },
  55: { maleNS: 48.68, maleSm: 75.31, femaleNS: 38.28, femaleSm: 55.39 },
  60: { maleNS: 55.96, maleSm: 97.3, femaleNS: 43.38, femaleSm: 68.8 },
  65: { maleNS: 70.69, maleSm: 125.7, femaleNS: 55.78, femaleSm: 85.45 },
  70: { maleNS: 95.88, maleSm: 166.76, femaleNS: 71.58, femaleSm: 112.81 },
  75: { maleNS: 131.96, maleSm: 221.22, femaleNS: 95.67, femaleSm: 152.74 },
  80: { maleNS: 196.15, maleSm: 307.44, femaleNS: 151.99, femaleSm: 220.92 },
  85: { maleNS: 287.46, maleSm: 427.27, femaleNS: 233.96, femaleSm: 319.53 },
};

const AMAM_RATES = {
  50: { maleNS: 32.96, maleSm: 43.12, femaleNS: 27.3, femaleSm: 32.55 },
  55: { maleNS: 42.49, maleSm: 53.82, femaleNS: 35.28, femaleSm: 40.94 },
  60: { maleNS: 50.47, maleSm: 65.82, femaleNS: 40.48, femaleSm: 49.01 },
  65: { maleNS: 64.89, maleSm: 83.43, femaleNS: 50.47, femaleSm: 62.57 },
  70: { maleNS: 86.53, maleSm: 108.72, femaleNS: 65.61, femaleSm: 79.02 },
  75: { maleNS: 119.74, maleSm: 147.55, femaleNS: 89.87, femaleSm: 104.29 },
  80: { maleNS: 174.07, maleSm: 203.53, femaleNS: 126.18, femaleSm: 150.62 },
  85: { maleNS: 248.49, maleSm: 289.69, femaleNS: 185.66, femaleSm: 236.13 },
};

const COREBRIDGE_RATES = {
  50: { male: { 5000: 31.43, 10000: 60.85, 15000: 90.27, 20000: 119.7, 25000: 149.12 }, female: { 5000: 21.94, 10000: 41.88, 15000: 61.81, 20000: 86.79, 25000: 107.98 } },
  55: { male: { 5000: 34.36, 10000: 66.72, 15000: 99.08, 20000: 147.18, 25000: 183.48 }, female: { 5000: 26.3, 10000: 50.61, 15000: 74.91, 20000: 112.02, 25000: 139.53 } },
  60: { male: { 5000: 38.05, 10000: 74.09, 15000: 110.14, 20000: 162.51, 25000: 202.64 }, female: { 5000: 30.3, 10000: 58.61, 15000: 86.91, 20000: 129.49, 25000: 161.36 } },
  65: { male: { 5000: 50.42, 10000: 98.83, 15000: 147.24, 20000: 217.26, 25000: 271.07 }, female: { 5000: 37.11, 10000: 72.22, 15000: 107.32, 20000: 159.21, 25000: 198.51 } },
  70: { male: { 5000: 58.68, 10000: 115.36, 15000: 172.04, 20000: 253.35, 25000: 316.19 }, female: { 5000: 44.74, 10000: 87.47, 15000: 130.2, 20000: 192.47, 25000: 240.09 } },
  75: { male: { 5000: 82.47, 10000: 162.95, 15000: 243.42, 20000: 357.15, 25000: 445.94 }, female: { 5000: 63.98, 10000: 125.96, 15000: 187.94, 20000: 276.47, 25000: 345.09 } },
  80: { male: { 5000: 113.36, 10000: 224.71, 15000: 336.07, 20000: 452.9, 25000: 565.62 }, female: { 5000: 104.21, 10000: 206.42, 15000: 308.62, 20000: 447.41, 25000: 558.76 } },
};

// Premium calculation function
const calculateMonthlyPremium = (carrier, age, gender, tobacco, faceAmount) => {
  const config = CARRIER_CONFIG[carrier];
  if (!config) return null;

  let rateTable, rate;
  const isMale = gender === "Male";
  const isSmoker = tobacco === true;

  switch (carrier) {
    case "Aflac":
      rateTable = AFLAC_RATES[age];
      if (!rateTable) return null;
      rate = isMale ? (isSmoker ? rateTable.maleSm : rateTable.maleNS) : (isSmoker ? rateTable.femaleSm : rateTable.femaleNS);
      break;
    case "SBLI":
      rateTable = SBLI_RATES[age];
      if (!rateTable) return null;
      rate = isMale ? (isSmoker ? rateTable.maleSm : rateTable.maleNS) : (isSmoker ? rateTable.femaleSm : rateTable.femaleNS);
      break;
    case "CICA":
      rateTable = CICA_RATES[age];
      if (!rateTable) return null;
      rate = isMale ? rateTable.male : rateTable.female;
      break;
    case "GTL":
      rateTable = GTL_RATES[age];
      if (!rateTable) return null;
      rate = isMale ? rateTable.male : rateTable.female;
      break;
    case "TransAmerica":
      rateTable = TRANSAMERICA_RATES[age];
      if (!rateTable) return null;
      rate = isMale ? (isSmoker ? rateTable.maleSm : rateTable.maleNS) : (isSmoker ? rateTable.femaleSm : rateTable.femaleNS);
      break;
    case "American Amicable":
      rateTable = AMAM_RATES[age];
      if (!rateTable) return null;
      rate = isMale ? (isSmoker ? rateTable.maleSm : rateTable.maleNS) : (isSmoker ? rateTable.femaleSm : rateTable.femaleNS);
      break;
    case "Corebridge": {
      rateTable = COREBRIDGE_RATES[age];
      if (!rateTable) return null;
      const genderRates = isMale ? rateTable.male : rateTable.female;
      const coverageAmounts = [5000, 10000, 15000, 20000, 25000];
      const closestAmount = coverageAmounts.reduce((prev, curr) =>
        Math.abs(curr - faceAmount) < Math.abs(prev - faceAmount) ? curr : prev
      );
      return genderRates[closestAmount];
    }
    default:
      return null;
  }

  const units = faceAmount / 1000;
  const annualBase = rate * units;

  if (config.simpleFormula) {
    return Math.round((annualBase / 12) * 100) / 100;
  }

  const totalAnnual = annualBase + config.annualFee;
  const withFactor = totalAnnual + totalAnnual * config.monthlyFactor;
  const monthlyPremium = withFactor / 12;

  return Math.round(monthlyPremium * 100) / 100;
};

// ═══════════════════════════════════════════════════════════════════
// DESIGN SYSTEM COMPONENTS
// ═══════════════════════════════════════════════════════════════════

// Color mapping for dynamic classes
const COLOR_CLASSES = {
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200', icon: 'text-cyan-500' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', icon: 'text-emerald-500' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', icon: 'text-purple-500' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', icon: 'text-blue-500' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', icon: 'text-orange-500' },
  green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', icon: 'text-green-500' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200', icon: 'text-indigo-500' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200', icon: 'text-violet-500' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', icon: 'text-amber-500' },
  red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', icon: 'text-red-500' },
};

// Logo Component
const Logo = ({ size = "default" }) => {
  const sizeClasses = { small: "h-8", default: "h-12", large: "h-16" };
  return (
    <img
      src="/amerben.png"
      alt="American Beneficiary"
      className={`${sizeClasses[size]} w-auto object-contain`}
    />
  );
};

// Section Title Component
const SectionTitle = ({ icon: Icon, title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-6">
    <div className="flex items-start gap-4">
      <div className="section-icon">
        <Icon size={22} className="text-cyan-600" strokeWidth={2} />
      </div>
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>
    </div>
    {action}
  </div>
);

// Input Component
const Input = ({ label, type = "text", value, onChange, placeholder, required, icon: Icon, className = "", dark = false, ...props }) => (
  <div className={`flex flex-col gap-2 ${className}`}>
    {label && (
      <label className={dark ? "label-dark" : "label"}>
        {label} {required && <span className="text-cyan-500">*</span>}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <Icon size={18} />
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${dark ? "input-dark" : "input"} ${Icon ? "pl-12" : ""}`}
        {...props}
      />
    </div>
  </div>
);

// Select Component
const Select = ({ label, value, onChange, options, className = "", dark = false }) => (
  <div className={`flex flex-col gap-2 ${className}`}>
    {label && <label className={dark ? "label-dark" : "label"}>{label}</label>}
    <select
      value={value}
      onChange={onChange}
      className={dark ? "input-dark appearance-none cursor-pointer pr-10" : "select"}
    >
      <option value="">Select...</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

// Yes/No Toggle Component
const YesNo = ({ label, value, onChange, compact = false }) => (
  <div className={`bg-white rounded-xl border border-slate-100 shadow-sm ${compact ? "p-4" : "p-5"} hover:border-slate-200 transition-all`}>
    <div className="flex items-center justify-between gap-4">
      <p className={`font-medium text-slate-700 flex-1 ${compact ? "text-sm" : ""}`}>{label}</p>
      <div className="flex gap-2 shrink-0">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={value === true ? "toggle-btn toggle-btn-yes" : "toggle-btn toggle-btn-inactive"}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={value === false ? "toggle-btn toggle-btn-no" : "toggle-btn toggle-btn-inactive"}
        >
          No
        </button>
      </div>
    </div>
  </div>
);

// Step Indicator Component
const StepIndicator = ({ currentStep, totalSteps, labels = [] }) => (
  <div className="flex items-center justify-center gap-3">
    {[...Array(totalSteps)].map((_, idx) => (
      <React.Fragment key={idx}>
        <div className="flex flex-col items-center gap-2">
          <div className={`step-dot ${
            idx + 1 === currentStep ? "step-dot-current" :
            idx + 1 < currentStep ? "step-dot-complete" : "step-dot-pending"
          }`}>
            {idx + 1 < currentStep ? <CheckCircle size={18} /> : idx + 1}
          </div>
          {labels[idx] && (
            <span className={`text-xs font-medium hidden md:block ${
              idx + 1 === currentStep ? "text-cyan-600" : "text-slate-400"
            }`}>
              {labels[idx]}
            </span>
          )}
        </div>
        {idx < totalSteps - 1 && (
          <div className={`step-connector hidden md:block ${
            idx + 1 < currentStep ? "step-connector-complete" : "step-connector-pending"
          }`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

// Carrier Logo Component
const CarrierLogo = ({ carrier, size = "md", className = "" }) => {
  const sizeClasses = {
    xs: "h-6 max-w-[70px]",
    sm: "h-8 max-w-[100px]",
    md: "h-10 max-w-[120px]",
    lg: "h-12 max-w-[140px]",
    xl: "h-16 max-w-[180px]",
  };

  const logoSrc = CARRIER_LOGOS[carrier];

  if (!logoSrc) {
    return <span className={`font-bold text-slate-700 ${className}`}>{carrier}</span>;
  }

  return (
    <img
      src={logoSrc}
      alt={`${carrier} logo`}
      className={`object-contain ${sizeClasses[size]} ${className}`}
      title={carrier}
    />
  );
};

// Data Field Component
const DataField = ({ label, value, copyable = true }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="data-field group">
      <span className="data-label">{label}</span>
      <div className="flex items-center justify-between gap-2">
        <span className={`data-value ${!value && "text-slate-300 italic"}`}>
          {value || "N/A"}
        </span>
        {copyable && value && (
          <button onClick={handleCopy} className="opacity-0 group-hover:opacity-100 transition-opacity">
            {copied
              ? <CheckCircle size={16} className="text-emerald-500" />
              : <Copy size={16} className="text-slate-400 hover:text-cyan-500" />
            }
          </button>
        )}
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const styles = {
    Lead: "badge-lead",
    Submitted: "badge-submitted",
    Underwriting: "badge-underwriting",
    Issued: "badge-issued",
    Paid: "badge-paid",
    "Not Taken": "badge-not-taken",
    Declined: "badge-declined",
    Lapsed: "badge-lapsed",
    Pending: "badge-pending",
  };

  return (
    <span className={`badge ${styles[status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
      {status}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════════
// LOGIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

const Login = ({ onLogin }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await api.login(password);
      if (data.success) {
        onLogin(data.token);
      }
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="view-contained items-center justify-center bg-gradient-hero p-6">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-scale-in">
        <div className="card-glass p-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl glow-cyan">
              <Shield size={40} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome Back</h2>
            <p className="text-slate-500">Enter your credentials to access the admin portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-center gap-3">
                <AlertTriangle size={18} /> {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full btn-accent">
              {loading ? <RefreshCw size={20} className="animate-spin" /> : <>Sign In <ArrowRight size={18} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// CUSTOMER APPLICATION FORM
// ═══════════════════════════════════════════════════════════════════

const CustomerForm = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState(INITIAL_DATA);
  const totalSteps = 8;

  const update = (field, val) => setData((prev) => ({ ...prev, [field]: val }));

  const stepLabels = ["Carrier", "Policy", "Personal", "Beneficiary", "Health", "Coverage", "Payment", "Review"];

  // Calculate age from DOB
  const calculateAge = (dob) => {
    if (!dob) return "";
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const handleDobChange = (e) => {
    const dob = e.target.value;
    update("dob", dob);
    update("age", calculateAge(dob));
  };

  // Calculate eligibility based on health questions
  const eligibility = useMemo(() => {
    if (data.carrier === "Corebridge") {
      return { status: "standard", plan: "Guaranteed Issue", message: `${data.carrier} - Guaranteed Issue` };
    }

    const isKnockout = [data.q1, data.q2, data.q3].some((a) => a === true);
    if (isKnockout) {
      return { status: "ineligible", plan: "Not Eligible", message: data.carrier ? `${data.carrier} - Not Eligible` : "Not Eligible" };
    }

    const isROP = [data.q4, data.q5, data.q6, data.q7a, data.q7b, data.q7c, data.q7d].some((a) => a === true);
    if (isROP) {
      return { status: "modified", plan: "Return of Premium", message: data.carrier ? `${data.carrier} - Return of Premium` : "Return of Premium" };
    }

    const isGraded = [data.q8a, data.q8b, data.q8c].some((a) => a === true);
    if (isGraded) {
      return { status: "graded", plan: "Graded", message: data.carrier ? `${data.carrier} - Graded` : "Graded" };
    }

    return { status: "standard", plan: "Level", message: data.carrier ? `${data.carrier} - Level` : "Level" };
  }, [data]);

  // Auto-switch to Corebridge when any health question is "Yes"
  useEffect(() => {
    const healthQuestions = [data.q1, data.q2, data.q3, data.q4, data.q5, data.q6, data.q7a, data.q7b, data.q7c, data.q7d, data.q8a, data.q8b, data.q8c];
    const anyYes = healthQuestions.some((q) => q === true);

    if (anyYes && data.carrier !== "Corebridge") {
      update("carrier", "Corebridge");
      update("planType", "Guaranteed Issue");
      const age = parseInt(data.age);
      if (age && data.gender && data.faceAmount) {
        const corebridgePremium = calculateMonthlyPremium("Corebridge", age, data.gender, data.tobacco, data.faceAmount);
        if (corebridgePremium) {
          update("monthlyPremium", corebridgePremium.toFixed(2));
        }
      }
    }
  }, [data.q1, data.q2, data.q3, data.q4, data.q5, data.q6, data.q7a, data.q7b, data.q7c, data.q7d, data.q8a, data.q8b, data.q8c, data.carrier, data.age, data.gender, data.tobacco, data.faceAmount]);

  // Step 1: Carrier Selection
  const renderCarrierSelect = () => (
    <div className="animate-slide-up">
      <SectionTitle
        icon={Shield}
        title="Select Your Carrier"
        subtitle="Choose from our trusted insurance partners"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.keys(CARRIERS).map((c) => (
          <button
            key={c}
            onClick={() => {
              update("carrier", c);
              update("planType", "");
            }}
            className={`relative p-6 rounded-2xl border-2 transition-all duration-300 group ${
              data.carrier === c
                ? "border-cyan-500 bg-cyan-50 shadow-lg glow-cyan"
                : "border-slate-200 bg-white hover:border-cyan-300 hover:shadow-md"
            }`}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 flex items-center justify-center">
                <CarrierLogo carrier={c} size="md" />
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                data.carrier === c ? "border-cyan-500 bg-cyan-500" : "border-slate-300 group-hover:border-cyan-400"
              }`}>
                {data.carrier === c && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // Step 2: Policy & Premium Configuration
  const renderPolicySelect = () => {
    const age = parseInt(data.age);
    const carrierQuotes = age && data.gender ? {
      Aflac: calculateMonthlyPremium("Aflac", age, data.gender, data.tobacco, data.faceAmount),
      SBLI: calculateMonthlyPremium("SBLI", age, data.gender, data.tobacco, data.faceAmount),
      CICA: calculateMonthlyPremium("CICA", age, data.gender, data.tobacco, data.faceAmount),
      GTL: calculateMonthlyPremium("GTL", age, data.gender, data.tobacco, data.faceAmount),
      TransAmerica: calculateMonthlyPremium("TransAmerica", age, data.gender, data.tobacco, data.faceAmount),
      Corebridge: calculateMonthlyPremium("Corebridge", age, data.gender, data.tobacco, data.faceAmount),
      "American Amicable": calculateMonthlyPremium("American Amicable", age, data.gender, data.tobacco, data.faceAmount),
    } : {};

    const selectedCarrierQuote = data.carrier ? carrierQuotes[data.carrier] : null;

    return (
      <div className="animate-slide-up">
        <SectionTitle
          icon={FileText}
          title="Configure Your Policy"
          subtitle="Set your coverage amount and view quotes"
        />

        {/* Customer Info Bar */}
        <div className="card-dark p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
            <Input type="date" label="Date of Birth" value={data.dob} onChange={handleDobChange} required dark />
            <div>
              <label className="label-dark">Age</label>
              <div className="mt-2 p-3 bg-slate-700/50 border border-slate-600 rounded-xl font-bold text-center text-lg text-white">
                {data.age || "-"}
              </div>
            </div>
            <div>
              <label className="label-dark">Gender</label>
              <div className="flex gap-2 mt-2">
                {["Male", "Female"].map((g) => (
                  <button
                    key={g}
                    onClick={() => update("gender", g)}
                    className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                      data.gender === g
                        ? "bg-cyan-500 text-white shadow-lg glow-cyan"
                        : "bg-slate-700/50 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    {g[0]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label-dark">Tobacco Use</label>
              <div className="flex gap-2 mt-2">
                {[{ val: true, label: "Yes" }, { val: false, label: "No" }].map(({ val, label }) => (
                  <button
                    key={label}
                    onClick={() => update("tobacco", val)}
                    className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                      data.tobacco === val
                        ? val ? "bg-amber-500 text-white" : "bg-emerald-500 text-white"
                        : "bg-slate-700/50 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label-dark">
                Coverage: <span className="text-cyan-400 font-bold">${data.faceAmount.toLocaleString()}</span>
              </label>
              <input
                type="range"
                min="5000"
                max="50000"
                step="1000"
                value={data.faceAmount}
                onChange={(e) => update("faceAmount", parseInt(e.target.value))}
                className="w-full mt-4 h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Policy Type Selection */}
        <div className="mb-6">
          <label className="label mb-3 block">Select Policy Type</label>
          <div className="flex flex-wrap gap-3">
            {data.carrier && CARRIERS[data.carrier].map((policy) => (
              <button
                key={policy}
                onClick={() => {
                  update("planType", policy);
                  if (selectedCarrierQuote) {
                    update("monthlyPremium", selectedCarrierQuote.toFixed(2));
                  }
                }}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  data.planType === policy
                    ? "bg-cyan-500 text-white shadow-lg glow-cyan scale-105"
                    : "bg-white border-2 border-slate-200 text-slate-600 hover:border-cyan-300"
                }`}
              >
                {policy}
              </button>
            ))}
          </div>
        </div>

        {/* Premium Display */}
        {selectedCarrierQuote && (
          <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-2xl p-6 border border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Estimated Monthly Premium</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-emerald-700">
                    ${data.monthlyPremium || selectedCarrierQuote.toFixed(2)}
                  </span>
                  <span className="text-emerald-600 font-medium">/month</span>
                </div>
              </div>
              <div className="text-right">
                <CarrierLogo carrier={data.carrier} size="lg" />
                <p className="text-sm text-emerald-600 mt-2">{data.planType || "Select a plan"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Carrier Quote Comparison */}
        {data.age && data.gender && (
          <div className="mt-6 p-5 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={20} className="text-cyan-600" />
              <span className="text-sm font-bold text-slate-700 uppercase tracking-wide">Compare All Carriers</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {Object.keys(CARRIERS).map((carrier) => {
                const quote = carrierQuotes[carrier];
                const isSelected = data.carrier === carrier;
                return (
                  <button
                    key={carrier}
                    onClick={() => {
                      update("carrier", carrier);
                      update("planType", "");
                      if (quote) update("monthlyPremium", quote.toFixed(2));
                    }}
                    disabled={!quote}
                    className={`relative p-3 rounded-xl border-2 text-center transition-all group ${
                      isSelected
                        ? "border-cyan-500 bg-cyan-50 shadow-md"
                        : quote
                        ? "border-slate-200 bg-white hover:border-cyan-300 hover:shadow-md"
                        : "border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div className="h-7 flex items-center justify-center mb-2">
                      <CarrierLogo carrier={carrier} size="xs" />
                    </div>
                    {quote ? (
                      <p className={`text-lg font-bold ${isSelected ? "text-cyan-700" : "text-slate-700"}`}>
                        ${quote.toFixed(0)}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400">N/A</p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Step 3: Personal Information
  const renderPersonalInfo = () => (
    <div className="animate-slide-up">
      <SectionTitle
        icon={User}
        title="Personal Information"
        subtitle="Tell us about the proposed insured"
      />

      <div className="space-y-5">
        {/* Name Row */}
        <div className="grid grid-cols-6 gap-4">
          <Input label="First Name" value={data.firstName} onChange={(e) => update("firstName", e.target.value)} required className="col-span-2" />
          <Input label="Middle" value={data.middleName} onChange={(e) => update("middleName", e.target.value)} className="col-span-1" />
          <Input label="Last Name" value={data.lastName} onChange={(e) => update("lastName", e.target.value)} required className="col-span-2" />
          <Input label="Phone" type="tel" value={data.phone} onChange={(e) => update("phone", e.target.value)} required className="col-span-1" />
        </div>

        {/* Address Row */}
        <div className="grid grid-cols-6 gap-4">
          <Input label="Street Address" value={data.address} onChange={(e) => update("address", e.target.value)} className="col-span-3" />
          <Input label="City" value={data.city} onChange={(e) => update("city", e.target.value)} className="col-span-2" />
          <Select label="State" options={STATES} value={data.state} onChange={(e) => update("state", e.target.value)} className="col-span-1" />
        </div>

        {/* Demographics Row */}
        <div className="grid grid-cols-6 gap-4">
          <Input label="Zip Code" value={data.zip} onChange={(e) => update("zip", e.target.value)} className="col-span-1" />
          <Select label="Birth State" options={STATES} value={data.stateOfBirth} onChange={(e) => update("stateOfBirth", e.target.value)} className="col-span-1" />
          <Input label="SSN" placeholder="XXX-XX-XXXX" value={data.ssn} onChange={(e) => update("ssn", e.target.value)} required className="col-span-2" />
          <Select label="Height" options={HEIGHT_OPTIONS} value={data.height} onChange={(e) => update("height", e.target.value)} className="col-span-1" />
          <Input label="Weight (lbs)" type="number" value={data.weight} onChange={(e) => update("weight", parseInt(e.target.value) || 0)} className="col-span-1" />
        </div>

        {/* Owner Section */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
          <p className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <Users size={18} className="text-slate-500" />
            Policy Owner (if different from insured)
          </p>
          <div className="grid grid-cols-4 gap-4">
            <Input label="Owner Name" value={data.ownerName} onChange={(e) => update("ownerName", e.target.value)} />
            <Select label="Relationship" options={RELATIONSHIPS} value={data.ownerRel} onChange={(e) => update("ownerRel", e.target.value)} />
            <Input label="Owner SSN" value={data.ownerSsn} onChange={(e) => update("ownerSsn", e.target.value)} />
            <Input label="Owner Address" value={data.ownerAddress} onChange={(e) => update("ownerAddress", e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  );

  // Step 4: Beneficiaries
  const renderBeneficiaries = () => (
    <div className="animate-slide-up">
      <SectionTitle
        icon={Heart}
        title="Beneficiaries"
        subtitle="Designate who receives the death benefit"
      />

      <div className="grid grid-cols-2 gap-6">
        {/* Primary */}
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border-2 border-cyan-200">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center">
              <Heart size={20} className="text-white" fill="currentColor" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Primary Beneficiary</h3>
              <p className="text-xs text-slate-500">Required</p>
            </div>
          </div>
          <div className="space-y-4">
            <Input label="Full Name" value={data.primaryBenName} onChange={(e) => update("primaryBenName", e.target.value)} required />
            <Select label="Relationship" options={RELATIONSHIPS} value={data.primaryBenRel} onChange={(e) => update("primaryBenRel", e.target.value)} />
          </div>
        </div>

        {/* Contingent */}
        <div className="bg-slate-50 rounded-2xl p-6 border-2 border-slate-200">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-slate-400 rounded-xl flex items-center justify-center">
              <Users size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Contingent Beneficiary</h3>
              <p className="text-xs text-slate-500">Optional backup</p>
            </div>
          </div>
          <div className="space-y-4">
            <Input label="Full Name" value={data.contingentBenName} onChange={(e) => update("contingentBenName", e.target.value)} />
            <Select label="Relationship" options={RELATIONSHIPS} value={data.contingentBenRel} onChange={(e) => update("contingentBenRel", e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  );

  // Step 5: Health Questions (SCROLLABLE)
  const renderHealthQuestions = () => (
    <div className="animate-slide-up">
      <SectionTitle
        icon={Stethoscope}
        title="Health Information"
        subtitle="Please answer all questions honestly"
      />

      <div className="mb-4">
        <Input label="Physician Name (if applicable)" value={data.physicianName} onChange={(e) => update("physicianName", e.target.value)} />
      </div>

      {/* Knockout Questions */}
      <div className="bg-red-50 rounded-2xl p-5 border border-red-200 mb-4">
        <h3 className="font-bold text-red-800 mb-4 flex items-center gap-2">
          <AlertTriangle size={18} /> Critical Questions (1-3)
        </h3>
        <div className="space-y-3">
          <YesNo label="1. Currently hospitalized, nursing facility, wheelchair, oxygen, hospice, amputation, cancer, or need ADL assistance?" value={data.q1} onChange={(v) => update("q1", v)} compact />
          <YesNo label="2. Advised for organ transplant, dialysis, CHF, Alzheimer's, ALS, or terminal condition?" value={data.q2} onChange={(v) => update("q2", v)} compact />
          <YesNo label="3. Diagnosed with AIDS, ARC, immune deficiency, or HIV positive?" value={data.q3} onChange={(v) => update("q3", v)} compact />
        </div>
      </div>

      {/* ROP Questions */}
      <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 mb-4">
        <h3 className="font-bold text-amber-800 mb-4">Questions 4-7 (Return of Premium)</h3>
        <div className="space-y-3">
          <YesNo label="4. Diabetes complications or insulin before age 50?" value={data.q4} onChange={(v) => update("q4", v)} compact />
          <YesNo label="5. Renal insufficiency, kidney disease, or multiple cancers?" value={data.q5} onChange={(v) => update("q5", v)} compact />
          <YesNo label="6. Past 2 years: testing/surgery not completed?" value={data.q6} onChange={(v) => update("q6", v)} compact />
          <YesNo label="7a. Past 2 years: angina, stroke, COPD, Hepatitis C, or oxygen?" value={data.q7a} onChange={(v) => update("q7a", v)} compact />
          <YesNo label="7b. Heart attack, aneurysm, or heart/brain surgery?" value={data.q7b} onChange={(v) => update("q7b", v)} compact />
          <YesNo label="7c. Any cancer (excl. basal cell)?" value={data.q7c} onChange={(v) => update("q7c", v)} compact />
          <YesNo label="7d. Illegal drugs or alcohol abuse?" value={data.q7d} onChange={(v) => update("q7d", v)} compact />
        </div>
      </div>

      {/* Graded Questions */}
      <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200">
        <h3 className="font-bold text-blue-800 mb-4">Question 8 (Graded Plan)</h3>
        <div className="space-y-3">
          <YesNo label="8a. Past 3 years: stroke, heart attack, aneurysm, heart surgery?" value={data.q8a} onChange={(v) => update("q8a", v)} compact />
          <YesNo label="8b. Cancer, emphysema, COPD, cirrhosis, liver disease?" value={data.q8b} onChange={(v) => update("q8b", v)} compact />
          <YesNo label="8c. Paralysis, cerebral palsy, MS, seizures, Parkinson's?" value={data.q8c} onChange={(v) => update("q8c", v)} compact />
        </div>
      </div>

      {/* Eligibility Display */}
      <div className={`mt-4 p-4 rounded-xl flex items-center gap-3 ${
        eligibility.status === "ineligible" ? "bg-red-100 text-red-900" :
        eligibility.status === "modified" ? "bg-amber-100 text-amber-900" :
        eligibility.status === "graded" ? "bg-blue-100 text-blue-900" :
        "bg-emerald-100 text-emerald-900"
      }`}>
        <Activity size={20} />
        <p className="font-bold">{eligibility.message}</p>
      </div>
    </div>
  );

  // Step 6: Coverage Options
  const renderCoverageOptions = () => (
    <div className="animate-slide-up">
      <SectionTitle
        icon={Shield}
        title="Coverage & Options"
        subtitle="Configure additional coverage options"
      />

      <div className="card-dark p-8 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">Your Eligible Plan</p>
            <h2 className="text-3xl font-bold">{data.planType || "Not Selected"}</h2>
            <p className="text-slate-400 mt-1">Based on your health profile</p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-sm">Coverage Amount</p>
            <p className="text-4xl font-bold text-cyan-400">${data.faceAmount.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <YesNo
          label="Check here if you are willing to accept any plan for which you qualify based on this application."
          value={data.willingToAccept}
          onChange={(v) => update("willingToAccept", v)}
        />

        <YesNo
          label="During the past 12 months have you used tobacco in any form?"
          value={data.tobacco}
          onChange={(v) => update("tobacco", v)}
        />

        <YesNo
          label="Do you have existing life insurance or an annuity contract?"
          value={data.hasExisting}
          onChange={(v) => update("hasExisting", v)}
        />

        {data.hasExisting && (
          <div className="ml-6 border-l-4 border-cyan-500 pl-6">
            <YesNo
              label="Will you replace an existing life insurance policy or annuity?"
              value={data.willReplace}
              onChange={(v) => update("willReplace", v)}
            />
          </div>
        )}
      </div>
    </div>
  );

  // Step 7: Payment Information
  const renderPayment = () => (
    <div className="animate-slide-up">
      <SectionTitle
        icon={CreditCard}
        title="Payment Information"
        subtitle="Set up your automatic bank draft"
      />

      <div className="grid grid-cols-2 gap-5 mb-5">
        <Input label="Name on Account" value={data.accountName} onChange={(e) => update("accountName", e.target.value)} />
        <Select label="Account Type" options={["Checking", "Savings"]} value={data.accountType} onChange={(e) => update("accountType", e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-5 mb-5">
        <Input label="Bank Name" value={data.bankName} onChange={(e) => update("bankName", e.target.value)} />
        <Input label="Bank Address" value={data.bankAddress} onChange={(e) => update("bankAddress", e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-5 mb-5">
        <Input label="Routing Number" value={data.routing} onChange={(e) => update("routing", e.target.value)} />
        <Input label="Account Number" value={data.accountNum} onChange={(e) => update("accountNum", e.target.value)} />
      </div>

      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
        <h3 className="font-bold text-slate-700 mb-4">Draft Schedule</h3>
        <YesNo
          label="Would you like your draft to coincide with your Social Security payment schedule?"
          value={data.draftSchedule === "ss_payment"}
          onChange={(v) => update("draftSchedule", v ? "ss_payment" : "specific_date")}
        />
        <div className="mt-4">
          <Select
            label={data.draftSchedule === "ss_payment" ? "Social Security Draft Day" : "Requested Draft Day"}
            options={data.draftSchedule === "ss_payment"
              ? ["1st of Month", "3rd of Month", "2nd Wednesday", "3rd Wednesday", "4th Wednesday"]
              : [...Array(28).keys()].map((i) => `${i + 1}`)
            }
            value={data.draftDate}
            onChange={(e) => update("draftDate", e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  // Step 8: Review & Submit
  const renderReview = () => (
    <div className="animate-slide-up">
      <SectionTitle
        icon={CheckCircle}
        title="Review & Submit"
        subtitle="Please verify all information is correct"
      />

      <div className="card-flat overflow-hidden mb-6">
        {/* Summary Header */}
        <div className="card-dark p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Applicant</p>
              <h2 className="text-2xl font-bold">{data.firstName} {data.lastName}</h2>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-sm">Monthly Premium</p>
              <p className="text-3xl font-bold text-cyan-400">${data.monthlyPremium || "0.00"}</p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-6 grid grid-cols-3 gap-4">
          <DataField label="Carrier" value={data.carrier} copyable={false} />
          <DataField label="Plan Type" value={data.planType} copyable={false} />
          <DataField label="Face Amount" value={`$${data.faceAmount.toLocaleString()}`} copyable={false} />
          <DataField label="Primary Beneficiary" value={data.primaryBenName} copyable={false} />
          <DataField label="Bank" value={data.bankName} copyable={false} />
          <DataField label="Draft Date" value={data.draftDate} copyable={false} />
        </div>
      </div>

      <button
        onClick={() => onComplete({
          ...data,
          id: `APP-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
          status: "Lead",
          date: new Date().toISOString().split("T")[0],
          premium: data.monthlyPremium || (data.faceAmount * 0.003).toFixed(2),
          plan: data.planType,
          name: `${data.firstName} ${data.lastName}`,
        })}
        className="w-full btn-accent py-4 text-lg"
      >
        <CheckCircle size={24} />
        Submit Application
      </button>
    </div>
  );

  // Navigation
  const nextStep = () => setStep(Math.min(totalSteps, step + 1));
  const prevStep = () => setStep(Math.max(1, step - 1));

  // Determine if this step should scroll (only health questions)
  const isScrollableStep = step === 5;

  return (
    <div className={`${isScrollableStep ? "view-scrollable" : "view-contained"} bg-gradient-to-br from-slate-50 to-slate-100`}>
      <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <Logo />
          <StepIndicator currentStep={step} totalSteps={totalSteps} labels={stepLabels} />
        </div>

        {/* Content Area */}
        <div className={`flex-1 ${isScrollableStep ? "" : "overflow-hidden"}`}>
          <div className={`card-flat p-8 ${isScrollableStep ? "" : "h-full overflow-auto"}`}>
            {step === 1 && renderCarrierSelect()}
            {step === 2 && renderPolicySelect()}
            {step === 3 && renderPersonalInfo()}
            {step === 4 && renderBeneficiaries()}
            {step === 5 && renderHealthQuestions()}
            {step === 6 && renderCoverageOptions()}
            {step === 7 && renderPayment()}
            {step === 8 && renderReview()}
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="flex justify-between items-center pt-6 shrink-0">
          <button onClick={prevStep} disabled={step === 1} className="btn-ghost disabled:opacity-0">
            <ChevronLeft size={20} /> Back
          </button>

          {step < totalSteps && (
            <button onClick={nextStep} className="btn-primary">
              Continue <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// ADMIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
// ADMIN DASHBOARD - FULLY RESTORED
// ═══════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
// ADMIN DASHBOARD - FULLY RESTORED FROM App-old.jsx
// ═══════════════════════════════════════════════════════════════════

const AdminDashboard = ({ submissions, onLogout, onUpdateSubmission }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);
  const [timeFilter, setTimeFilter] = useState("YTD");
  const [notification, setNotification] = useState(null);
  const [prevSubmissionCount, setPrevSubmissionCount] = useState(0);

  // ═══════════════════════════════════════════════════════════════
  // NEW APPLICATION NOTIFICATION SYSTEM
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (submissions.length > prevSubmissionCount && prevSubmissionCount > 0) {
      const newApp = submissions[0];
      const audio = new Audio(
        "data:audio/wav;base64,UklGRl4FAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YToFAACAgICAgICAgICAgICAgICA"
      );
      audio.volume = 0.5;
      audio.play().catch(() => {});

      setNotification({
        title: "New Application!",
        message: `${newApp.name || newApp.firstName + " " + newApp.lastName} submitted a new application`,
        app: newApp,
      });
      setTimeout(() => setNotification(null), 10000);
    }
    setPrevSubmissionCount(submissions.length);
  }, [submissions.length, prevSubmissionCount]);

  // ═══════════════════════════════════════════════════════════════
  // FILTERED SUBMISSIONS
  // ═══════════════════════════════════════════════════════════════
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(
      (sub) =>
        sub.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [submissions, searchTerm]);

  // ═══════════════════════════════════════════════════════════════
  // CUSTOMERS DERIVED FROM SUBMISSIONS
  // ═══════════════════════════════════════════════════════════════
  const customers = useMemo(() => {
    const customerMap = {};
    submissions.forEach((sub) => {
      const name = sub.name || `${sub.firstName || ""} ${sub.lastName || ""}`.trim();
      if (!customerMap[name]) {
        customerMap[name] = {
          id: `CUST-${sub.id?.slice(-4) || Math.random().toString(36).slice(-4).toUpperCase()}`,
          name,
          email: sub.email || "N/A",
          phone: sub.phone || "N/A",
          policies: 0,
          ltv: 0,
          status: sub.status,
        };
      }
      customerMap[name].policies += 1;
      customerMap[name].ltv += parseFloat(sub.premium || 0) * 12;
    });
    return Object.values(customerMap);
  }, [submissions]);

  // ═══════════════════════════════════════════════════════════════
  // FULL ANALYTICS DATA CALCULATION
  // ═══════════════════════════════════════════════════════════════
  const analyticsData = useMemo(() => {
    const now = new Date();
    const isWithin = (dateStr) => {
      const d = new Date(dateStr);
      if (timeFilter === "Daily") return d.toDateString() === now.toDateString();
      if (timeFilter === "Weekly") return (now - d) / (1000 * 60 * 60 * 24) <= 7;
      if (timeFilter === "Monthly") return (now - d) / (1000 * 60 * 60 * 24) <= 30;
      if (timeFilter === "Quarterly") return (now - d) / (1000 * 60 * 60 * 24) <= 90;
      if (timeFilter === "YTD") return d.getFullYear() === now.getFullYear();
      return true;
    };

    const filtered = submissions.filter((s) => isWithin(s.date));

    const counts = {
      applications: filtered.length,
      leads: filtered.filter((s) => s.status === "Lead").length,
      submitted: filtered.filter((s) => s.status === "Submitted").length,
      underwriting: filtered.filter((s) => s.status === "Underwriting").length,
      issued: filtered.filter((s) => s.status === "Issued").length,
      paid: filtered.filter((s) => s.status === "Paid").length,
      notTaken: filtered.filter((s) => s.status === "Not Taken").length,
      declined: filtered.filter((s) => s.status === "Declined").length,
      lapsed: filtered.filter((s) => s.status === "Lapsed").length,
    };

    const activeCount = counts.issued + counts.paid;
    const retentionBase = activeCount + counts.notTaken + counts.lapsed;
    const retentionRate = retentionBase > 0 ? ((activeCount / retentionBase) * 100).toFixed(1) : 0;
    const appsToIssue = counts.applications > 0 ? ((activeCount / counts.applications) * 100).toFixed(1) : 0;

    const totalPremium = filtered
      .filter((s) => s.status === "Paid" || s.status === "Issued")
      .reduce((sum, s) => sum + parseFloat(s.premium || 0) * 12, 0);

    return { counts, retentionRate, appsToIssue, totalPremium };
  }, [submissions, timeFilter]);

  // ═══════════════════════════════════════════════════════════════
  // NAV ITEM COMPONENT
  // ═══════════════════════════════════════════════════════════════
  const NavItem = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`nav-item w-full ${activeTab === id ? "nav-item-active" : ""}`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  // ═══════════════════════════════════════════════════════════════
  // RENDER: OVERVIEW DASHBOARD
  // ═══════════════════════════════════════════════════════════════
  const renderOverview = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-5">
        {[
          { label: "Total Apps", value: submissions.length, icon: FileText, color: "cyan" },
          { label: "Issued/Paid", value: analyticsData.counts.issued + analyticsData.counts.paid, icon: Shield, color: "emerald" },
          { label: "Underwriting", value: analyticsData.counts.underwriting, icon: Activity, color: "orange" },
          { label: "Avg Premium", value: submissions.length > 0 ? `$${(submissions.reduce((sum, s) => sum + parseFloat(s.premium || 0), 0) / submissions.length).toFixed(2)}` : "$0.00", icon: DollarSign, color: "purple" },
        ].map((metric, i) => (
          <div key={i} className="metric-card group">
            <div className="flex justify-between items-start mb-3">
              <div className={`p-3 rounded-xl ${COLOR_CLASSES[metric.color]?.bg || 'bg-slate-50'} ${COLOR_CLASSES[metric.color]?.text || 'text-slate-600'} group-hover:scale-110 transition-transform`}>
                <metric.icon size={22} />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{metric.label}</span>
            </div>
            <p className="text-3xl font-bold text-slate-800">{metric.value}</p>
          </div>
        ))}
      </div>

      {/* AI Insights Banner */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-start gap-4">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur">
            <Sparkles size={28} className="text-yellow-300" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2">AI Underwriting Insights</h3>
            <p className="text-white/80 text-sm max-w-2xl">
              Today's analysis suggests a 15% increase in Graded Benefit qualifications due to recent health questionnaire trends in the Southeast region.
            </p>
            <button className="mt-4 btn-white text-sm py-2">View Full Report</button>
          </div>
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="card-flat overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-lg">Recent Applications</h3>
          <button onClick={() => setActiveTab("applications")} className="text-sm text-cyan-600 font-semibold hover:text-cyan-700 flex items-center gap-1">
            View All <ArrowRight size={16} />
          </button>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs tracking-wider">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Applicant</th>
              <th className="px-6 py-4">Plan</th>
              <th className="px-6 py-4">Premium</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSubmissions.slice(0, 5).map((row) => (
              <tr key={row.id} className="hover:bg-cyan-50/30 transition-colors cursor-pointer" onClick={() => setSelectedApp(row)}>
                <td className="px-6 py-4 font-mono text-slate-500 text-xs">{row.id}</td>
                <td className="px-6 py-4 font-semibold text-slate-800">{row.name}</td>
                <td className="px-6 py-4 text-slate-600">{row.plan}</td>
                <td className="px-6 py-4 font-medium">${parseFloat(row.premium || 0).toFixed(2)}</td>
                <td className="px-6 py-4"><StatusBadge status={row.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════
  // RENDER: PERFORMANCE PAGE - APPLICATION LIFECYCLE FUNNEL
  // ═══════════════════════════════════════════════════════════════
  const renderAnalytics = () => {
    // Calculate funnel metrics
    const funnelData = {
      leads: analyticsData.counts.leads,
      applications: analyticsData.counts.submitted + analyticsData.counts.underwriting + analyticsData.counts.issued + analyticsData.counts.paid + analyticsData.counts.notTaken + analyticsData.counts.declined + analyticsData.counts.lapsed,
      underwriting: analyticsData.counts.underwriting,
      issued: analyticsData.counts.issued + analyticsData.counts.paid + analyticsData.counts.notTaken + analyticsData.counts.lapsed,
      rejected: analyticsData.counts.declined,
      paid: analyticsData.counts.paid,
      notTaken: analyticsData.counts.notTaken,
      lapsed: analyticsData.counts.lapsed,
    };

    // Calculate conversion rates
    const leadToApp = funnelData.leads > 0 ? ((funnelData.applications / funnelData.leads) * 100).toFixed(1) : 0;
    const appToIssued = funnelData.applications > 0 ? ((funnelData.issued / funnelData.applications) * 100).toFixed(1) : 0;
    const issuedToPaid = funnelData.issued > 0 ? ((funnelData.paid / funnelData.issued) * 100).toFixed(1) : 0;
    const paidToLapsed = funnelData.paid > 0 ? ((funnelData.lapsed / (funnelData.paid + funnelData.lapsed)) * 100).toFixed(1) : 0;

    // Bar widths for funnel visualization (percentage of max width)
    const maxWidth = 700;
    const leadWidth = maxWidth;
    const appWidth = funnelData.leads > 0 ? Math.max(300, (funnelData.applications / Math.max(funnelData.leads, 1)) * maxWidth) : 600;
    const branchWidth = funnelData.applications > 0 ? Math.max(150, (funnelData.issued / Math.max(funnelData.applications, 1)) * appWidth / 3) : 180;

    return (
      <div className="animate-fade-in space-y-6">
        {/* Header with Time Filter */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-sm gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
              <Layers className="text-white" size={24} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-xl">Application Lifecycle Funnel</h2>
              <p className="text-sm text-slate-500">Track your final expense applications through each stage</p>
            </div>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {["Daily", "Weekly", "Monthly", "Quarterly", "YTD"].map((period) => (
              <button
                key={period}
                onClick={() => setTimeFilter(period)}
                className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${
                  timeFilter === period ? "bg-white text-cyan-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Funnel Visualization - Main Column */}
          <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h3 className="font-bold text-slate-800 text-lg mb-8 flex items-center gap-2">
              <GitMerge className="text-cyan-600" size={20} />
              Conversion Funnel
            </h3>

            {/* Funnel Stages */}
            <div className="space-y-4 pl-4">
              {/* Stage 1: Lead */}
              <div className="funnel-stage funnel-animate funnel-animate-delay-1">
                <div className={`funnel-stage-bar funnel-lead text-white`} style={{ width: `${leadWidth}px` }}>
                  <div className="flex items-center gap-3">
                    <CircleDot size={22} />
                    <span className="font-bold text-lg">Lead</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black">{funnelData.leads}</span>
                    <span className="text-cyan-100 text-sm">100%</span>
                  </div>
                </div>
                <div className="funnel-connector text-cyan-500"></div>
              </div>

              {/* Arrow Indicator */}
              <div className="flex items-center pl-8 py-1">
                <ArrowDown className="text-slate-400" size={20} />
                <span className="ml-3 text-sm text-slate-500 font-medium">Agent submits application</span>
                <span className="ml-auto mr-20 text-sm font-bold text-cyan-600">{leadToApp}% conversion</span>
              </div>

              {/* Stage 2: Application */}
              <div className="funnel-stage funnel-animate funnel-animate-delay-2">
                <div className={`funnel-stage-bar funnel-application text-white`} style={{ width: `${appWidth}px` }}>
                  <div className="flex items-center gap-3">
                    <FileText size={22} />
                    <span className="font-bold text-lg">Application</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black">{funnelData.applications}</span>
                    <span className="text-blue-100 text-sm">{leadToApp}%</span>
                  </div>
                </div>
                <div className="funnel-connector text-blue-500"></div>
              </div>

              {/* Arrow Indicator - Branching */}
              <div className="flex items-center pl-8 py-1">
                <GitBranch className="text-slate-400" size={20} />
                <span className="ml-3 text-sm text-slate-500 font-medium">Application reviewed</span>
              </div>

              {/* Stage 3: Branch - Issued / Rejected / Underwriting */}
              <div className="funnel-branch funnel-animate funnel-animate-delay-3 justify-center gap-4 px-4">
                {/* Issued Branch */}
                <div className="relative group">
                  <div className={`funnel-stage-bar funnel-issued text-white cursor-pointer`} style={{ width: '200px', height: '55px' }}>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={18} />
                      <span className="font-bold">Issued</span>
                    </div>
                    <span className="text-2xl font-black">{funnelData.issued}</span>
                  </div>
                  <div className="funnel-connector text-emerald-500"></div>
                </div>

                {/* Rejected Branch */}
                <div className="relative group">
                  <div className={`funnel-stage-bar funnel-rejected text-white cursor-pointer`} style={{ width: '160px', height: '55px' }}>
                    <div className="flex items-center gap-2">
                      <XCircle size={18} />
                      <span className="font-bold">Rejected</span>
                    </div>
                    <span className="text-2xl font-black">{funnelData.rejected}</span>
                  </div>
                </div>

                {/* Underwriting Branch */}
                <div className="relative group">
                  <div className={`funnel-stage-bar funnel-underwriting text-white cursor-pointer`} style={{ width: '180px', height: '55px' }}>
                    <div className="flex items-center gap-2">
                      <Clock size={18} />
                      <span className="font-bold">Underwriting</span>
                    </div>
                    <span className="text-2xl font-black">{funnelData.underwriting}</span>
                  </div>
                </div>
              </div>

              {/* Arrow Indicator - After Issued */}
              <div className="flex items-center pl-8 py-1">
                <ArrowDown className="text-slate-400" size={20} />
                <span className="ml-3 text-sm text-slate-500 font-medium">Customer pays first premium & commissions paid</span>
                <span className="ml-auto mr-20 text-sm font-bold text-emerald-600">{issuedToPaid}% paid</span>
              </div>

              {/* Stage 4: Branch - Paid / Not Taken */}
              <div className="funnel-branch funnel-animate funnel-animate-delay-4 justify-center gap-6 px-4">
                {/* Paid */}
                <div className="relative group">
                  <div className={`funnel-stage-bar funnel-paid text-white cursor-pointer`} style={{ width: '240px', height: '55px' }}>
                    <div className="flex items-center gap-2">
                      <Banknote size={18} />
                      <span className="font-bold">Paid</span>
                    </div>
                    <span className="text-2xl font-black">{funnelData.paid}</span>
                  </div>
                  <div className="funnel-connector text-green-600"></div>
                </div>

                {/* Not Taken */}
                <div className="relative group">
                  <div className={`funnel-stage-bar funnel-not-taken text-white cursor-pointer`} style={{ width: '200px', height: '55px' }}>
                    <div className="flex items-center gap-2">
                      <X size={18} />
                      <span className="font-bold">Not Taken</span>
                    </div>
                    <span className="text-2xl font-black">{funnelData.notTaken}</span>
                  </div>
                </div>
              </div>

              {/* Arrow Indicator - After Paid */}
              <div className="flex items-center pl-8 py-1">
                <TrendingDown className="text-slate-400" size={20} />
                <span className="ml-3 text-sm text-slate-500 font-medium">Policy payment missed in future</span>
                <span className="ml-auto mr-20 text-sm font-bold text-red-500">{paidToLapsed}% lapsed</span>
              </div>

              {/* Stage 5: Lapsed */}
              <div className="funnel-stage funnel-animate funnel-animate-delay-5 justify-center">
                <div className={`funnel-stage-bar funnel-lapsed text-white`} style={{ width: '180px', height: '50px' }}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={18} />
                    <span className="font-bold">Lapsed</span>
                  </div>
                  <span className="text-2xl font-black">{funnelData.lapsed}</span>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-4">Stage Legend</p>
              <div className="flex flex-wrap gap-3">
                {[
                  { name: "Lead", color: "bg-cyan-500" },
                  { name: "Application", color: "bg-blue-500" },
                  { name: "Underwriting", color: "bg-purple-500" },
                  { name: "Issued", color: "bg-emerald-500" },
                  { name: "Rejected", color: "bg-red-500" },
                  { name: "Paid", color: "bg-green-600" },
                  { name: "Not Taken", color: "bg-amber-500" },
                  { name: "Lapsed", color: "bg-red-600" },
                ].map((item) => (
                  <div key={item.name} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-sm font-medium text-slate-600">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Metrics & Insights */}
          <div className="space-y-4">
            {/* Key Conversion Metrics */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white">
              <h3 className="font-bold flex items-center gap-2 mb-4 text-sm uppercase tracking-wider text-slate-400">
                <Target className="text-cyan-400" size={18} />
                Key Conversion Rates
              </h3>
              <div className="space-y-4">
                {/* Lead to Application */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-400 text-xs">Lead → Application</span>
                    <span className="text-lg font-bold">{leadToApp}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-700" style={{ width: `${leadToApp}%` }}></div>
                  </div>
                </div>

                {/* Application to Issued */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-400 text-xs">Application → Issued</span>
                    <span className="text-lg font-bold">{appToIssued}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-700" style={{ width: `${appToIssued}%` }}></div>
                  </div>
                </div>

                {/* Issued to Paid */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-400 text-xs">Issued → Paid</span>
                    <span className="text-lg font-bold">{issuedToPaid}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-green-600 rounded-full transition-all duration-700" style={{ width: `${issuedToPaid}%` }}></div>
                  </div>
                </div>

                {/* Retention Rate */}
                <div className="pt-3 mt-3 border-t border-slate-700">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-400 text-xs">Overall Retention</span>
                    <span className="text-lg font-bold text-green-400">{analyticsData.retentionRate}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-700" style={{ width: `${analyticsData.retentionRate}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stage Breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                <BarChart3 className="text-blue-600" size={18} />
                Breakdown ({timeFilter})
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: "Leads", count: funnelData.leads, color: "cyan", icon: CircleDot },
                  { name: "Apps", count: funnelData.applications, color: "blue", icon: FileText },
                  { name: "Undrwrt", count: funnelData.underwriting, color: "purple", icon: Clock },
                  { name: "Issued", count: funnelData.issued, color: "emerald", icon: CheckCircle2 },
                  { name: "Paid", count: funnelData.paid, color: "green", icon: Banknote },
                  { name: "Reject", count: funnelData.rejected, color: "red", icon: XCircle },
                  { name: "Pass", count: funnelData.notTaken, color: "amber", icon: X },
                  { name: "Lapsed", count: funnelData.lapsed, color: "red", icon: AlertTriangle },
                ].map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-md ${COLOR_CLASSES[item.color]?.bg || 'bg-slate-100'} ${COLOR_CLASSES[item.color]?.text || 'text-slate-600'}`}>
                        <item.icon size={14} />
                      </div>
                      <span className="text-xs font-semibold text-slate-700">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-800">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium Revenue */}
            <div className="bg-gradient-to-br from-emerald-600 to-green-700 rounded-2xl p-5 text-white shadow-lg shadow-emerald-900/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg">
                  <DollarSign size={18} />
                </div>
                <span className="font-bold text-sm uppercase tracking-wider">Annual Premium Value</span>
              </div>
              <p className="text-3xl font-black tracking-tight">
                ${analyticsData.totalPremium.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-emerald-100 text-xs mt-1 opacity-80">From Issued & Paid policies ({timeFilter})</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER: APPLICATIONS LIST
  // ═══════════════════════════════════════════════════════════════
  const renderApplications = () => (
    <div className="animate-fade-in h-full flex flex-col">
      <div className="card-flat flex-1 flex flex-col overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-lg">All Applications</h3>
          <div className="flex gap-3">
            <button className="btn-ghost py-2"><Filter size={16} /> Filter</button>
            <button className="btn-ghost py-2"><Download size={16} /> Export</button>
          </div>
        </div>
        <div className="flex-1 overflow-auto scrollbar-thin">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs tracking-wider sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Applicant</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Plan Type</th>
                <th className="px-6 py-4">Premium</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubmissions.map((row) => (
                <tr key={row.id} className="hover:bg-cyan-50/30 transition-colors group">
                  <td className="px-6 py-4 font-mono text-slate-500 text-xs">{row.id}</td>
                  <td className="px-6 py-4 font-semibold text-slate-800">{row.name}</td>
                  <td className="px-6 py-4 text-slate-500">{row.date}</td>
                  <td className="px-6 py-4 text-slate-600">{row.plan}</td>
                  <td className="px-6 py-4 font-medium">${parseFloat(row.premium || 0).toFixed(2)}</td>
                  <td className="px-6 py-4"><StatusBadge status={row.status} /></td>
                  <td className="px-6 py-4">
                    <button onClick={() => setSelectedApp(row)} className="opacity-0 group-hover:opacity-100 p-2 hover:bg-slate-100 rounded-lg transition-all">
                      <MoreHorizontal size={18} className="text-slate-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════
  // RENDER: CUSTOMERS DIRECTORY
  // ═══════════════════════════════════════════════════════════════
  const renderCustomers = () => (
    <div className="animate-fade-in h-full flex flex-col">
      <div className="card-flat flex-1 flex flex-col overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2">
            <Users className="text-cyan-600" size={24} />
            <h3 className="font-bold text-slate-800 text-lg">Customer Directory</h3>
          </div>
          <button className="btn-accent py-2"><Download size={16} /> Export CSV</button>
        </div>
        <div className="flex-1 overflow-auto scrollbar-thin">
          {customers.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              <Users size={48} className="mx-auto mb-4 opacity-50" />
              <p>No customers yet. Submit an application to see customers here.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs tracking-wider sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4">Customer ID</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Policies</th>
                  <th className="px-6 py-4">LTV</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-cyan-50/30 transition-colors group">
                    <td className="px-6 py-4 font-mono text-slate-500">{cust.id}</td>
                    <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                        {cust.name?.split(" ").map((n) => n[0]).join("") || "?"}
                      </div>
                      {cust.name}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      <div className="flex items-center gap-2"><Phone size={12} /> {cust.phone}</div>
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
    </div>
  );

  // ═══════════════════════════════════════════════════════════════
  // RENDER: AI RISK CENTER
  // ═══════════════════════════════════════════════════════════════
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
            <p className="text-green-600 font-bold flex items-center justify-end gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Online
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Risk Heatmap */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Risk Distribution Heatmap</h3>
            <div className="grid grid-cols-6 gap-2 h-40">
              {[...Array(24)].map((_, i) => {
                const risk = Math.random();
                const color = risk > 0.8 ? "bg-red-500" : risk > 0.5 ? "bg-orange-400" : risk > 0.3 ? "bg-yellow-300" : "bg-green-400";
                return <div key={i} className={`rounded-md ${color} opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}></div>;
              })}
            </div>
          </div>

          {/* AI Alerts */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-700">Recent AI Alerts</div>
            <div className="divide-y divide-slate-100">
              {[
                { msg: "Velocity Check: Multiple applications from IP 192.168.1.1", time: "10 min ago", severity: "high" },
                { msg: "Inconsistency: BMI does not match age/weight average", time: "45 min ago", severity: "medium" },
                { msg: "Pattern Detected: Similar beneficiary across 3 applications", time: "2 hours ago", severity: "medium" },
              ].map((alert, i) => (
                <div key={i} className="p-4 flex items-start gap-4 hover:bg-slate-50">
                  <div className={`p-2 rounded-lg ${alert.severity === "high" ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"}`}>
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

        {/* Auto-Decision Rate Card */}
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Zap size={24} className="text-yellow-300" />
            <h3 className="font-bold">Auto-Decision Rate</h3>
          </div>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-5xl font-bold">78%</span>
            <span className="text-purple-200 mb-1">of apps</span>
          </div>
          <p className="text-sm text-purple-200">
            System is automatically processing majority of standard immediate benefit applications.
          </p>
          <div className="mt-6 pt-4 border-t border-white/20">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-purple-200">Processing Speed</span>
              <span className="font-bold">2.3s avg</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-purple-200">Accuracy Rate</span>
              <span className="font-bold">99.2%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════
  // RENDER: FULL APPLICATION DETAIL MODAL
  // ═══════════════════════════════════════════════════════════════
  const renderDetailModal = () => {
    const formatDate = (dateStr) => {
      if (!dateStr) return "N/A";
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return `${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getDate().toString().padStart(2, "0")}/${d.getFullYear()}`;
      } catch {
        return dateStr;
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm animate-fade-in">
        <div className="w-full max-w-5xl bg-white h-full shadow-2xl overflow-y-auto scrollbar-thin animate-slide-right flex flex-col">
          {/* Header */}
          <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-8 py-6 flex justify-between items-start shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl">
                <FileText size={32} />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {selectedApp.name || selectedApp.firstName + " " + selectedApp.lastName}
                  </h2>
                  <StatusBadge status={selectedApp.status} />
                  {/* Status Change Dropdown */}
                  <select
                    value={selectedApp.status}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      const updated = { ...selectedApp, status: newStatus };
                      onUpdateSubmission(updated);
                      setSelectedApp(updated);
                    }}
                    className="ml-2 border border-slate-300 rounded-lg px-2 py-1 text-sm font-bold text-slate-700 cursor-pointer hover:border-cyan-400 focus:outline-none focus:border-cyan-500"
                  >
                    {APP_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                  <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">ID: {selectedApp.id}</span>
                  <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(selectedApp.date)}</span>
                  <span className="flex items-center gap-1"><MapPin size={14} /> {selectedApp.state || "N/A"}</span>
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

          {/* Content */}
          <div className="p-8 space-y-8 bg-slate-50/50 flex-1">
            {/* Top Row: Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase">Coverage</p>
                <p className="text-2xl font-bold text-emerald-600">${(selectedApp.faceAmount || 0).toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase">Monthly Premium</p>
                <p className="text-2xl font-bold text-slate-800">${parseFloat(selectedApp.premium || 0).toFixed(2)}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm md:col-span-2 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Carrier</p>
                  <CarrierLogo carrier={selectedApp.carrier || "American Amicable"} size="lg" />
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase">Plan</p>
                  <p className="text-lg font-bold text-cyan-600">{selectedApp.plan}</p>
                </div>
              </div>
            </div>

            {/* Main Information Grid - 3 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Column 1: Personal & Contact */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                    <User size={20} className="text-cyan-500" /> Personal Information
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    <DataField label="Full Name" value={`${selectedApp.firstName || selectedApp.name} ${selectedApp.middleName || ""} ${selectedApp.lastName || ""}`} />
                    <DataField label="Date of Birth" value={formatDate(selectedApp.dob)} />
                    <DataField label="Age" value={selectedApp.age} />
                    <DataField label="State of Birth" value={selectedApp.stateOfBirth} />
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
                    <MapPin size={20} className="text-orange-500" /> Contact Details
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    <DataField label="Address" value={selectedApp.address} />
                    <div className="grid grid-cols-2 gap-2">
                      <DataField label="City" value={selectedApp.city} />
                      <DataField label="State" value={selectedApp.state} />
                    </div>
                    <DataField label="Zip Code" value={selectedApp.zip} />
                    <DataField label="Phone" value={selectedApp.phone} />
                  </div>
                </div>

                {/* Owner Section */}
                {selectedApp.ownerName && (
                  <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                      <Users size={20} className="text-indigo-500" /> Policy Owner
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
                    <Heart size={20} className="text-red-500" /> Beneficiaries
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase">Primary</div>
                      <DataField label="Name" value={selectedApp.primaryBenName} />
                      <div className="mt-2 text-xs text-slate-500 flex gap-2">
                        <span className="font-bold">Rel:</span> {selectedApp.primaryBenRel || "N/A"}
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm relative overflow-hidden opacity-80">
                      <div className="absolute top-0 right-0 bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase">Contingent</div>
                      <DataField label="Name" value={selectedApp.contingentBenName} />
                      <div className="mt-2 text-xs text-slate-500 flex gap-2">
                        <span className="font-bold">Rel:</span> {selectedApp.contingentBenRel || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                    <CreditCard size={20} className="text-emerald-500" /> Banking & Payment
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    <DataField label="Name on Account" value={selectedApp.accountName} />
                    <DataField label="Account Type" value={selectedApp.accountType} />
                    <DataField label="Bank Name" value={selectedApp.bankName} />
                    <DataField label="Bank Address" value={selectedApp.bankAddress} />
                    <DataField label="Routing Number" value={selectedApp.routing} />
                    <DataField label="Account Number" value={selectedApp.accountNum} />
                    <DataField label="Draft Schedule" value={selectedApp.draftSchedule === "ss_payment" ? "Social Security" : "Specific Date"} />
                    <DataField label="Draft Date" value={selectedApp.draftDate} />
                  </div>
                </div>
              </div>

              {/* Column 3: Health & Status */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                    <Stethoscope size={20} className="text-purple-500" /> Health & Underwriting
                  </h3>
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3">
                    <DataField label="Physician" value={selectedApp.physicianName} />
                    <DataField label="Tobacco Use" value={selectedApp.tobacco === true ? "YES" : "NO"} />

                    {/* Knockout Questions */}
                    <div className="border-t border-slate-100 pt-3">
                      <p className="text-xs font-bold text-red-600 uppercase mb-2">Knockout Questions (1-3)</p>
                      <div className="space-y-1 text-sm">
                        {[{ q: "Q1", val: selectedApp.q1 }, { q: "Q2", val: selectedApp.q2 }, { q: "Q3", val: selectedApp.q3 }].map(({ q, val }) => (
                          <div key={q} className="flex justify-between">
                            <span>{q}</span>
                            <span className={val ? "text-red-600 font-bold" : "text-green-600"}>{val ? "YES" : "NO"}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ROP Questions */}
                    <div className="border-t border-slate-100 pt-3">
                      <p className="text-xs font-bold text-yellow-600 uppercase mb-2">ROP Questions (4-7)</p>
                      <div className="space-y-1 text-sm">
                        {[{ q: "Q4", val: selectedApp.q4 }, { q: "Q5", val: selectedApp.q5 }, { q: "Q6", val: selectedApp.q6 }, { q: "Q7a", val: selectedApp.q7a }, { q: "Q7b", val: selectedApp.q7b }, { q: "Q7c", val: selectedApp.q7c }, { q: "Q7d", val: selectedApp.q7d }].map(({ q, val }) => (
                          <div key={q} className="flex justify-between">
                            <span>{q}</span>
                            <span className={val ? "text-yellow-600 font-bold" : "text-green-600"}>{val ? "YES" : "NO"}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Graded Questions */}
                    <div className="border-t border-slate-100 pt-3">
                      <p className="text-xs font-bold text-blue-600 uppercase mb-2">Graded Questions (8)</p>
                      <div className="space-y-1 text-sm">
                        {[{ q: "Q8a", val: selectedApp.q8a }, { q: "Q8b", val: selectedApp.q8b }, { q: "Q8c", val: selectedApp.q8c }].map(({ q, val }) => (
                          <div key={q} className="flex justify-between">
                            <span>{q}</span>
                            <span className={val ? "text-blue-600 font-bold" : "text-green-600"}>{val ? "YES" : "NO"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coverage Options */}
                <div>
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                    <Shield size={20} className="text-purple-600" /> Coverage Options
                  </h3>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-slate-600">Willing to Accept</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${selectedApp.willingToAccept ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                        {selectedApp.willingToAccept ? "YES" : "NO"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-600">Existing Insurance</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${selectedApp.hasExisting ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
                        {selectedApp.hasExisting ? "YES" : "NO"}
                      </span>
                    </div>
                    {selectedApp.hasExisting && (
                      <div className="flex justify-between items-center mt-2 pl-4 border-l-2 border-slate-200">
                        <span className="text-sm text-slate-500">Will Replace?</span>
                        <span className={`font-bold ${selectedApp.willReplace ? "text-red-600" : "text-slate-600"}`}>
                          {selectedApp.willReplace ? "YES" : "NO"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Agent Actions */}
                <div>
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                    <Shield size={20} className="text-cyan-600" /> Agent Actions
                  </h3>
                  <div className="space-y-2">
                    <button className="w-full py-3 bg-cyan-600 text-white font-bold rounded-lg shadow-md hover:bg-cyan-700 transition flex items-center justify-center gap-2">
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
    );
  };

  // ═══════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-700/50">
          <Logo size="small" />
          <p className="text-xs text-slate-500 uppercase tracking-widest mt-2 text-center">Admin Portal</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase mb-3 px-4">Main Menu</p>
          <NavItem id="overview" icon={LayoutDashboard} label="Dashboard" />

          <p className="text-xs font-bold text-slate-500 uppercase mt-6 mb-3 px-4">Analytics</p>
          <NavItem id="analytics" icon={PieChart} label="Performance" />
          <NavItem id="ai-risk" icon={BrainCircuit} label="AI Risk Center" />

          <p className="text-xs font-bold text-slate-500 uppercase mt-6 mb-3 px-4">Management</p>
          <NavItem id="applications" icon={FileText} label="Applications" />
          <NavItem id="customers" icon={Users} label="Customers" />
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <button onClick={onLogout} className="nav-item w-full text-red-400 hover:bg-red-500/10 hover:text-red-300">
            <LogOut size={20} />
            <span>Sign Out</span>
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
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0 z-10">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-bold text-slate-800 capitalize">{activeTab.replace("-", " ")}</h2>
            <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Ask AI: 'Show pending apps...'"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-2.5 w-80 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 focus:bg-white transition-all"
              />
              <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-500 opacity-0 group-focus-within:opacity-100 transition-opacity" size={16} />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2.5 text-slate-400 hover:text-cyan-600 hover:bg-slate-50 rounded-xl transition-all">
              <Bell size={22} />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white flex items-center justify-center font-bold shadow-lg shadow-cyan-500/30">
              AD
            </div>
          </div>
        </header>

        {/* ═══════════════════════════════════════════════════════════
            CONTENT AREA - CORRECT TAB ROUTING
            ═══════════════════════════════════════════════════════════ */}
        <div className="flex-1 overflow-auto p-6 scrollbar-thin">
          {activeTab === "overview" && renderOverview()}
          {activeTab === "analytics" && renderAnalytics()}
          {activeTab === "applications" && renderApplications()}
          {activeTab === "customers" && renderCustomers()}
          {activeTab === "ai-risk" && renderAIRiskCenter()}
        </div>
      </main>

      {/* Detail Modal */}
      {selectedApp && renderDetailModal()}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// HOME SCREEN - PROFESSIONAL LANDING
// ═══════════════════════════════════════════════════════════════════

const HomeScreen = ({ onNavigate, isAuthenticated }) => (
  <div className="view-contained items-center justify-center bg-gradient-hero p-8 relative">
    {/* Decorative Background Elements */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse-soft" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse-soft" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[150px]" />
    </div>

    {/* Main Content */}
    <div className="relative max-w-6xl w-full mx-auto">
      {/* Logo Header */}
      <div className="text-center mb-16 animate-fade-in">
        <img
          src="/amerben.png"
          alt="American Beneficiary"
          className="h-20 mx-auto mb-6 drop-shadow-2xl"
        />
        <p className="text-slate-400 text-xl font-medium tracking-wide">
          Insurance Management Platform
        </p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-emerald-400 text-sm font-medium">System Online</span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Customer Application Card */}
        <button
          onClick={() => onNavigate("app")}
          className="group p-10 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 hover:bg-white/10 hover:border-cyan-500/50 transition-all duration-500 text-left relative overflow-hidden"
        >
          {/* Hover Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-cyan-500/0 group-hover:from-cyan-500/10 group-hover:to-transparent transition-all duration-500 rounded-3xl" />
          
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl shadow-cyan-500/30">
              <User size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">New Application</h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Start a new insurance application for a customer with our streamlined process.
            </p>
            <span className="inline-flex items-center gap-2 text-cyan-400 font-semibold group-hover:gap-3 transition-all">
              Start Now <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </button>

        {/* Call Center Card */}
        <button
          onClick={() => onNavigate("callpop")}
          className="group p-10 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 hover:bg-white/10 hover:border-purple-500/50 transition-all duration-500 text-left relative overflow-hidden"
        >
          {/* Badge */}
          <div className="absolute top-6 right-6 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-xs font-bold text-white shadow-lg">
            NEW
          </div>
          
          {/* Hover Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/10 group-hover:to-transparent transition-all duration-500 rounded-3xl" />
          
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl shadow-purple-500/30">
              <Phone size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Call Center</h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Full-featured agent dialer with 3-way calling and screen pop integration.
            </p>
            <span className="inline-flex items-center gap-2 text-purple-400 font-semibold group-hover:gap-3 transition-all">
              Open Dialer <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </button>

        {/* Admin Portal Card */}
        <button
          onClick={() => onNavigate("admin")}
          className="group p-10 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 hover:bg-white/10 hover:border-emerald-500/50 transition-all duration-500 text-left relative overflow-hidden"
        >
          {/* Hover Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/10 group-hover:to-transparent transition-all duration-500 rounded-3xl" />
          
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl shadow-emerald-500/30">
              <LayoutDashboard size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Admin Portal</h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Manage applications, view analytics, and access AI-powered insights.
            </p>
            <span className="inline-flex items-center gap-2 text-emerald-400 font-semibold group-hover:gap-3 transition-all">
              {isAuthenticated ? "Go to Dashboard" : "Login"} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </button>
      </div>

      {/* Footer Stats */}
      <div className="mt-16 flex items-center justify-center gap-12 text-center">
        {[
          { label: "Active Policies", value: "2,847" },
          { label: "This Month", value: "+127" },
          { label: "Success Rate", value: "94.2%" },
        ].map((stat, i) => (
          <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
            <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// SUCCESS SCREEN
// ═══════════════════════════════════════════════════════════════════

const SuccessScreen = ({ submission, onNavigate }) => (
  <div className="view-contained items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50 to-cyan-50 p-6">
    {/* Decorative Elements */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-emerald-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-cyan-200/30 rounded-full blur-3xl" />
    </div>

    <div className="relative max-w-md w-full animate-scale-in">
      <div className="card-flat p-12 text-center">
        {/* Success Icon */}
        <div className="relative mx-auto mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40">
            <CheckCircle size={48} className="text-white" />
          </div>
          {/* Animated Rings */}
          <div className="absolute inset-0 w-24 h-24 border-4 border-emerald-300 rounded-full animate-ping opacity-20" />
        </div>

        <h2 className="text-3xl font-bold text-slate-800 mb-3">Application Submitted!</h2>
        <p className="text-slate-500 mb-2 text-lg">
          Thank you, <span className="font-semibold text-slate-700">{submission?.firstName}</span>.
        </p>
        
        {/* Application ID */}
        <div className="inline-flex items-center gap-2 bg-slate-100 px-5 py-2.5 rounded-xl mb-8">
          <span className="text-slate-500 text-sm">Application ID:</span>
          <span className="font-mono font-bold text-slate-800">{submission?.id}</span>
        </div>

        {/* Next Steps */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-8 text-left">
          <h3 className="font-bold text-emerald-800 mb-2 flex items-center gap-2">
            <Sparkles size={18} /> What's Next?
          </h3>
          <ul className="text-sm text-emerald-700 space-y-1">
            <li>• Application will be reviewed within 24-48 hours</li>
            <li>• You'll receive a confirmation email shortly</li>
            <li>• Our underwriting team may contact you for additional information</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button onClick={() => onNavigate("home")} className="btn-accent w-full py-4 text-lg">
            Return Home
          </button>
          <button onClick={() => onNavigate("admin")} className="btn-ghost w-full">
            View in Dashboard
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// MAIN APP CONTROLLER
// ═══════════════════════════════════════════════════════════════════

export default function App() {
  const [view, setView] = useState("home");
  const [submissions, setSubmissions] = useState([]);
  const [lastSubmission, setLastSubmission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check auth on mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem("authToken", token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
    setView("home");
  };

  // Load applications from API
  const loadApplications = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const data = await api.getApplications();
      setSubmissions(data);
    } catch (error) {
      console.error("Failed to load applications:", error);
      if (error.message === "Unauthorized" || error.message.includes("401") || error.message.includes("403")) {
        setIsAuthenticated(false);
        localStorage.removeItem("authToken");
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadApplications();
    }
  }, [isAuthenticated, loadApplications]);

  const handleAppSubmit = async (data) => {
    try {
      const newApp = {
        ...data,
        name: `${data.firstName} ${data.lastName}`.trim(),
        status: "Lead",
      };

      await api.createApplication(newApp);
      setLastSubmission(newApp);
      setView("success");
      
      if (isAuthenticated) {
        loadApplications();
      }
    } catch (error) {
      console.error("Failed to submit application:", error);
      alert("Failed to submit application. Please try again.");
    }
  };

  const handleUpdateSubmission = async (updatedData) => {
    try {
      await api.updateApplication(updatedData.id, updatedData);
      setSubmissions((prev) =>
        prev.map((sub) => (sub.id === updatedData.id ? updatedData : sub))
      );
    } catch (error) {
      console.error("Failed to update application:", error);
    }
  };

  // Route rendering
  if (view === "home") {
    return <HomeScreen onNavigate={setView} isAuthenticated={isAuthenticated} />;
  }

  if (view === "callpop") {
    return <CallPopApp />;
  }

  if (view === "app") {
    return <CustomerForm onComplete={handleAppSubmit} />;
  }

  if (view === "success") {
    return <SuccessScreen submission={lastSubmission} onNavigate={setView} />;
  }

  if (view === "admin") {
    if (!isAuthenticated) {
      return (
        <>
          <button
            onClick={() => setView("home")}
            className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-xl rounded-xl text-white/70 hover:text-white hover:bg-white/20 transition-all border border-white/10"
          >
            <ChevronLeft size={18} /> Back
          </button>
          <Login onLogin={handleLogin} />
        </>
      );
    }
    return (
      <AdminDashboard
        submissions={submissions}
        onLogout={handleLogout}
        onUpdateSubmission={handleUpdateSubmission}
      />
    );
  }

  return null;
}