import React, { useState, useEffect, useMemo, useCallback } from "react";
import { api } from "./api";
import CallPopApp from "./CallPopApp";
import {
  User,
  MapPin,
  Calendar,
  Heart,
  DollarSign,
  Activity,
  Users,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  FileText,
  CreditCard,
  Shield,
  Stethoscope,
  LayoutDashboard,
  Search,
  Bell,
  PieChart,
  TrendingUp,
  Filter,
  MoreHorizontal,
  Download,
  Sparkles,
  BrainCircuit,
  X,
  LogOut,
  Mail,
  Phone,
  Zap,
  AlertOctagon,
  BarChart3,
  Target,
  Save,
  RefreshCw,
  Copy,
  ExternalLink,
  Printer,
  Trash2,
  ArrowRight,
  ArrowDown,
  ArrowDownRight,
  GitBranch,
  Layers,
  ChevronDown,
  TrendingDown,
  CircleDot,
  GitMerge,
  Banknote,
  XCircle,
  Clock,
  CheckCircle2,
  Eye,
  MessageCircle,
  PhoneCall,
  Bot,
  Send,
  Headphones,
  History,
  Tag,
  Plus,
  Star,
  AlertCircle,
  UserCheck,
  PhoneOutgoing,
  MessageSquare,
  CalendarClock,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS & CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

const STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
];
const RELATIONSHIPS = [
  "Spouse",
  "Child",
  "Parent",
  "Partner",
  "Friend",
  "Relative",
  "Other",
];
const APP_STATUSES = [
  "Lead",
  "Submitted",
  "Underwriting",
  "Issued",
  "Paid",
  "Not Taken",
  "Declined",
  "Lapsed",
];

const CARRIERS = {
  "American Amicable": ["Level", "Graded", "ROP"],
  Corebridge: ["Guaranteed Issue"],
  TransAmerica: ["Level", "Graded"],
  Aflac: ["Level", "Modified"],
  SBLI: ["Level", "Modified"],
  CICA: ["Level", "Guaranteed Issue"],
  GTL: ["Graded"],
  AHL: ["Level", "Graded"],
  "Royal Neighbors": ["Level", "Graded"],
  Gerber: ["Guaranteed Issue"],
  "Mutual of Omaha": ["Level", "Graded"],
};

const CARRIER_CONFIG = {
  Aflac: { annualFee: 48, monthlyFactor: 0.0875, hasTobacco: true },
  SBLI: { annualFee: 48, monthlyFactor: 0.087, hasTobacco: true },
  CICA: { annualFee: 48, monthlyFactor: 0.087, hasTobacco: false },
  GTL: { annualFee: 48, monthlyFactor: 0.08333, hasTobacco: false },
  Corebridge: {
    annualFee: 0,
    monthlyFactor: 0,
    hasTobacco: false,
    directLookup: true,
  },
  TransAmerica: { annualFee: 48, monthlyFactor: 0.0875, hasTobacco: true },
  "American Amicable": {
    annualFee: 30,
    monthlyFactor: 0.088,
    hasTobacco: true,
  },
  AHL: { annualFee: 120, monthlyFactor: 0.0875, hasTobacco: true },
  "Royal Neighbors": { annualFee: 30, monthlyFactor: 0.087, hasTobacco: true },
  Gerber: { annualFee: 11, monthlyFactor: 0.083334, hasTobacco: false },
  "Mutual of Omaha": { annualFee: 36, monthlyFactor: 0.089, hasTobacco: true },
};

const CARRIER_LOGOS = {
  Aflac: "/logos/aflac.png",
  "American Amicable": "/logos/amam.png",
  CICA: "/logos/cica.png",
  Corebridge: "/logos/corebridge.png",
  GTL: "/logos/gtl.png",
  SBLI: "/logos/sbli.png",
  TransAmerica: "/logos/trans.png",
  AHL: "/logos/ahl.png",
  "Royal Neighbors": "/logos/royal.png",
  Gerber: "/logos/gerber.png",
  "Mutual of Omaha": "/logos/mutual.png",
};

const HEIGHT_OPTIONS = [];
for (let ft = 4; ft <= 7; ft++) {
  for (let inch = 0; inch <= 11; inch++) {
    HEIGHT_OPTIONS.push(`${ft}'${inch}"`);
  }
}

const INITIAL_DATA = {
  carrier: "",
  planType: "",
  monthlyPremium: "",
  firstName: "",
  middleName: "",
  lastName: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  phone: "",
  dob: "",
  age: "",
  stateOfBirth: "",
  ssn: "",
  height: "5'9\"",
  weight: 170,
  gender: "",
  ownerName: "",
  ownerRel: "",
  ownerSsn: "",
  ownerAddress: "",
  primaryBenName: "",
  primaryBenRel: "",
  contingentBenName: "",
  contingentBenRel: "",
  faceAmount: 15000,
  willingToAccept: false,
  tobacco: null,
  hasExisting: null,
  willReplace: null,
  physicianName: "",
  q1: null,
  q2: null,
  q3: null,
  q4: null,
  q5: null,
  q6: null,
  q7a: null,
  q7b: null,
  q7c: null,
  q7d: null,
  q8a: null,
  q8b: null,
  q8c: null,
  accountName: "",
  accountType: "checking",
  bankName: "",
  bankAddress: "",
  routing: "",
  accountNum: "",
  draftSchedule: "ss_payment",
  draftDate: "",
};

// ═══════════════════════════════════════════════════════════════════
// RATE TABLES (Keeping all your existing rate tables)
// ═══════════════════════════════════════════════════════════════════

const AFLAC_RATES = {
  45: { maleNS: 28.97, maleSm: 45.4, femaleNS: 24, femaleSm: 36.7 },
  46: { maleNS: 29.87, maleSm: 45.83, femaleNS: 24.41, femaleSm: 37.05 },
  47: { maleNS: 30.78, maleSm: 46.29, femaleNS: 24.81, femaleSm: 37.43 },
  48: { maleNS: 31.68, maleSm: 46.76, femaleNS: 25.22, femaleSm: 37.81 },
  49: { maleNS: 32.59, maleSm: 47.23, femaleNS: 25.62, femaleSm: 38.19 },
  50: { maleNS: 33.49, maleSm: 47.71, femaleNS: 26.03, femaleSm: 38.57 },
  51: { maleNS: 34.58, maleSm: 50, femaleNS: 26.6, femaleSm: 40.17 },
  52: { maleNS: 35.67, maleSm: 52.28, femaleNS: 27.16, femaleSm: 41.77 },
  53: { maleNS: 36.75, maleSm: 54.57, femaleNS: 27.73, femaleSm: 43.37 },
  54: { maleNS: 37.84, maleSm: 56.85, femaleNS: 28.29, femaleSm: 44.97 },
  55: { maleNS: 38.93, maleSm: 59.14, femaleNS: 28.86, femaleSm: 46.57 },
  56: { maleNS: 40.5, maleSm: 61.42, femaleNS: 30.04, femaleSm: 48.17 },
  57: { maleNS: 42.08, maleSm: 63.71, femaleNS: 31.23, femaleSm: 49.77 },
  58: { maleNS: 43.66, maleSm: 66, femaleNS: 32.42, femaleSm: 51.37 },
  59: { maleNS: 45.23, maleSm: 68.28, femaleNS: 33.61, femaleSm: 52.97 },
  60: { maleNS: 46.81, maleSm: 70.57, femaleNS: 34.8, femaleSm: 54.57 },
  61: { maleNS: 49.24, maleSm: 75.48, femaleNS: 36.93, femaleSm: 57.31 },
  62: { maleNS: 51.67, maleSm: 80.4, femaleNS: 39.06, femaleSm: 60.06 },
  63: { maleNS: 54.11, maleSm: 85.31, femaleNS: 41.2, femaleSm: 62.8 },
  64: { maleNS: 56.54, maleSm: 90.23, femaleNS: 43.33, femaleSm: 65.54 },
  65: { maleNS: 58.98, maleSm: 95.14, femaleNS: 45.47, femaleSm: 68.29 },
  66: { maleNS: 62.67, maleSm: 100.06, femaleNS: 48.21, femaleSm: 71.03 },
  67: { maleNS: 66.37, maleSm: 104.97, femaleNS: 50.95, femaleSm: 73.77 },
  68: { maleNS: 70.07, maleSm: 109.89, femaleNS: 53.69, femaleSm: 76.52 },
  69: { maleNS: 73.76, maleSm: 114.8, femaleNS: 56.43, femaleSm: 79.26 },
  70: { maleNS: 77.46, maleSm: 119.72, femaleNS: 59.17, femaleSm: 82 },
  71: { maleNS: 83.85, maleSm: 131.6, femaleNS: 65.11, femaleSm: 91.14 },
  72: { maleNS: 90.25, maleSm: 143.49, femaleNS: 71.04, femaleSm: 100.29 },
  73: { maleNS: 96.64, maleSm: 155.37, femaleNS: 76.98, femaleSm: 109.43 },
  74: { maleNS: 103.03, maleSm: 167.26, femaleNS: 82.92, femaleSm: 118.57 },
  75: { maleNS: 109.42, maleSm: 179.14, femaleNS: 88.85, femaleSm: 127.72 },
  76: { maleNS: 122.23, maleSm: 191.03, femaleNS: 96.63, femaleSm: 136.86 },
  77: { maleNS: 135.03, maleSm: 202.91, femaleNS: 104.4, femaleSm: 146 },
  78: { maleNS: 147.83, maleSm: 214.8, femaleNS: 112.17, femaleSm: 155.15 },
  79: { maleNS: 160.63, maleSm: 226.69, femaleNS: 119.94, femaleSm: 164.29 },
  80: { maleNS: 173.43, maleSm: 238.57, femaleNS: 127.72, femaleSm: 173.43 },
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
  62: { maleNS: 62.3, maleSm: 86.9, femaleNS: 50, femaleSm: 66.65 },
  63: { maleNS: 65.25, maleSm: 91.4, femaleNS: 52.45, femaleSm: 69.95 },
  64: { maleNS: 68.2, maleSm: 95.9, femaleNS: 54.9, femaleSm: 73.25 },
  65: { maleNS: 71.15, maleSm: 100.4, femaleNS: 57.35, femaleSm: 76.55 },
  66: { maleNS: 76.2, maleSm: 108.5, femaleNS: 61.8, femaleSm: 83.5 },
  67: { maleNS: 81.25, maleSm: 116.6, femaleNS: 66.25, femaleSm: 90.45 },
  68: { maleNS: 86.3, maleSm: 124.7, femaleNS: 70.7, femaleSm: 97.4 },
  69: { maleNS: 91.35, maleSm: 132.8, femaleNS: 75.15, femaleSm: 104.35 },
  70: { maleNS: 96.4, maleSm: 140.9, femaleNS: 79.6, femaleSm: 111.3 },
  71: { maleNS: 105.1, maleSm: 153.2, femaleNS: 86.85, femaleSm: 121.15 },
  72: { maleNS: 113.8, maleSm: 165.5, femaleNS: 94.1, femaleSm: 131 },
  73: { maleNS: 122.5, maleSm: 177.8, femaleNS: 101.35, femaleSm: 140.85 },
  74: { maleNS: 131.2, maleSm: 190.1, femaleNS: 108.6, femaleSm: 150.7 },
  75: { maleNS: 139.9, maleSm: 202.4, femaleNS: 115.85, femaleSm: 160.55 },
  76: { maleNS: 153.2, maleSm: 219.1, femaleNS: 126.9, femaleSm: 172.95 },
  77: { maleNS: 166.5, maleSm: 235.8, femaleNS: 137.95, femaleSm: 185.35 },
  78: { maleNS: 179.8, maleSm: 252.5, femaleNS: 149, femaleSm: 197.75 },
  79: { maleNS: 193.1, maleSm: 269.2, femaleNS: 160.05, femaleSm: 210.15 },
  80: { maleNS: 206.4, maleSm: 285.9, femaleNS: 171.1, femaleSm: 222.55 },
  81: { maleNS: 223.1, maleSm: 310.2, femaleNS: 184.6, femaleSm: 241.2 },
  82: { maleNS: 239.8, maleSm: 334.5, femaleNS: 198.1, femaleSm: 259.85 },
  83: { maleNS: 256.5, maleSm: 358.8, femaleNS: 211.6, femaleSm: 278.5 },
  84: { maleNS: 273.2, maleSm: 383.1, femaleNS: 225.1, femaleSm: 297.15 },
  85: { maleNS: 289.9, maleSm: 407.4, femaleNS: 238.6, femaleSm: 315.8 },
};

const CICA_RATES = {
  45: { male: 32.38, female: 30.03 },
  46: { male: 33.63, female: 31.21 },
  47: { male: 34.89, female: 32.39 },
  48: { male: 36.24, female: 33.64 },
  49: { male: 37.67, female: 34.9 },
  50: { male: 39.11, female: 36.25 },
  51: { male: 40.72, female: 37.68 },
  52: { male: 42.74, female: 39.12 },
  53: { male: 44.92, female: 40.63 },
  54: { male: 47.21, female: 42.54 },
  55: { male: 49.63, female: 44.61 },
  56: { male: 52.39, female: 46.77 },
  57: { male: 55.03, female: 49.05 },
  58: { male: 57.78, female: 51.66 },
  59: { male: 60.68, female: 54.13 },
  60: { male: 63.71, female: 56.7 },
  61: { male: 66.9, female: 59.41 },
  62: { male: 70.25, female: 62.22 },
  63: { male: 73.76, female: 65.18 },
  64: { male: 77.46, female: 68.28 },
  65: { male: 83.12, female: 72.04 },
  66: { male: 89.2, female: 76.36 },
  67: { male: 95.72, female: 80.94 },
  68: { male: 102.72, female: 85.8 },
  69: { male: 110.22, female: 90.94 },
  70: { male: 118.28, female: 96.4 },
  71: { male: 126.93, female: 102.18 },
  72: { male: 136.21, female: 108.31 },
  73: { male: 146.17, female: 114.81 },
  74: { male: 156.85, female: 121.7 },
  75: { male: 168.32, female: 129 },
  76: { male: 180.62, female: 136.74 },
  77: { male: 193.83, female: 144.95 },
  78: { male: 208, female: 153.65 },
  79: { male: 223.08, female: 164.4 },
  80: { male: 239.25, female: 175.91 },
  81: { male: 256.6, female: 188.22 },
  82: { male: 275.2, female: 201.4 },
  83: { male: 295.15, female: 215.5 },
  84: { male: 316.55, female: 230.58 },
  85: { male: 339.5, female: 246.72 },
};

const GTL_RATES = {
  40: { male: 55, female: 40 },
  41: { male: 56, female: 40 },
  42: { male: 57, female: 40 },
  43: { male: 58, female: 40 },
  44: { male: 59, female: 40 },
  45: { male: 60, female: 40 },
  46: { male: 60, female: 40 },
  47: { male: 60, female: 40 },
  48: { male: 60, female: 40 },
  49: { male: 60, female: 40 },
  50: { male: 61, female: 41 },
  51: { male: 62, female: 42 },
  52: { male: 63, female: 44 },
  53: { male: 64, female: 46 },
  54: { male: 65, female: 49 },
  55: { male: 67, female: 51 },
  56: { male: 70, female: 53 },
  57: { male: 72, female: 55 },
  58: { male: 73, female: 56 },
  59: { male: 75, female: 58 },
  60: { male: 78, female: 60 },
  61: { male: 81, female: 63 },
  62: { male: 86, female: 66 },
  63: { male: 90, female: 70 },
  64: { male: 95, female: 72 },
  65: { male: 100, female: 73 },
  66: { male: 104, female: 77 },
  67: { male: 108, female: 80 },
  68: { male: 112, female: 83 },
  69: { male: 116, female: 86 },
  70: { male: 120, female: 90 },
  71: { male: 132, female: 98 },
  72: { male: 142, female: 107 },
  73: { male: 152, female: 115 },
  74: { male: 162, female: 124 },
  75: { male: 172, female: 132 },
  76: { male: 200, female: 150 },
  77: { male: 225, female: 170 },
  78: { male: 250, female: 190 },
  79: { male: 275, female: 200 },
  80: { male: 290, female: 210 },
  81: { male: 300, female: 220 },
  82: { male: 320, female: 230 },
  83: { male: 340, female: 240 },
  84: { male: 360, female: 250 },
  85: { male: 375, female: 260 },
  86: { male: 400, female: 280 },
  87: { male: 420, female: 300 },
  88: { male: 440, female: 330 },
  89: { male: 450, female: 360 },
};

const TRANSAMERICA_RATES = {
  18: { maleNS: 20.44, maleSm: 24.37, femaleNS: 18.69, femaleSm: 19.25 },
  19: { maleNS: 20.73, maleSm: 25.33, femaleNS: 19, femaleSm: 20.06 },
  20: { maleNS: 21.03, maleSm: 26.31, femaleNS: 19.31, femaleSm: 20.89 },
  21: { maleNS: 21.63, maleSm: 27.23, femaleNS: 19.5, femaleSm: 21.57 },
  22: { maleNS: 22.25, maleSm: 28.17, femaleNS: 19.69, femaleSm: 22.27 },
  23: { maleNS: 22.88, maleSm: 29.15, femaleNS: 19.89, femaleSm: 22.99 },
  24: { maleNS: 23.53, maleSm: 30.17, femaleNS: 20.08, femaleSm: 23.74 },
  25: { maleNS: 24.2, maleSm: 31.22, femaleNS: 20.28, femaleSm: 24.51 },
  26: { maleNS: 24.03, maleSm: 31.19, femaleNS: 20.32, femaleSm: 24.97 },
  27: { maleNS: 23.87, maleSm: 31.16, femaleNS: 20.36, femaleSm: 25.44 },
  28: { maleNS: 23.7, maleSm: 31.14, femaleNS: 20.4, femaleSm: 25.91 },
  29: { maleNS: 23.53, maleSm: 31.11, femaleNS: 20.45, femaleSm: 26.4 },
  30: { maleNS: 23.37, maleSm: 31.09, femaleNS: 20.49, femaleSm: 26.9 },
  31: { maleNS: 23.61, maleSm: 31.85, femaleNS: 20.53, femaleSm: 27 },
  32: { maleNS: 23.86, maleSm: 32.64, femaleNS: 20.57, femaleSm: 27.1 },
  33: { maleNS: 24.11, maleSm: 33.44, femaleNS: 20.61, femaleSm: 27.2 },
  34: { maleNS: 24.37, maleSm: 34.27, femaleNS: 20.65, femaleSm: 27.3 },
  35: { maleNS: 24.62, maleSm: 35.11, femaleNS: 20.69, femaleSm: 27.4 },
  36: { maleNS: 25.77, maleSm: 36.96, femaleNS: 21.61, femaleSm: 28.73 },
  37: { maleNS: 26.98, maleSm: 38.9, femaleNS: 22.58, femaleSm: 30.13 },
  38: { maleNS: 28.24, maleSm: 40.94, femaleNS: 23.58, femaleSm: 31.59 },
  39: { maleNS: 29.56, maleSm: 43.08, femaleNS: 24.63, femaleSm: 33.13 },
  40: { maleNS: 30.94, maleSm: 45.34, femaleNS: 25.73, femaleSm: 34.74 },
  41: { maleNS: 32.38, maleSm: 47.72, femaleNS: 26.87, femaleSm: 36.43 },
  42: { maleNS: 33.9, maleSm: 50.23, femaleNS: 28.07, femaleSm: 38.2 },
  43: { maleNS: 35.48, maleSm: 52.86, femaleNS: 29.32, femaleSm: 40.06 },
  44: { maleNS: 37.14, maleSm: 55.64, femaleNS: 30.62, femaleSm: 42 },
  45: { maleNS: 38.1, maleSm: 58.55, femaleNS: 31.98, femaleSm: 44.05 },
  46: { maleNS: 38.97, maleSm: 60.05, femaleNS: 32.57, femaleSm: 45.07 },
  47: { maleNS: 39.84, maleSm: 61.5, femaleNS: 33.16, femaleSm: 46.11 },
  48: { maleNS: 40.26, maleSm: 62.32, femaleNS: 33.57, femaleSm: 46.75 },
  49: { maleNS: 40.68, maleSm: 63.15, femaleNS: 33.92, femaleSm: 47.18 },
  50: { maleNS: 41.11, maleSm: 63.95, femaleNS: 34.27, femaleSm: 47.63 },
  51: { maleNS: 42.55, maleSm: 65.96, femaleNS: 35.11, femaleSm: 49.12 },
  52: { maleNS: 44.11, maleSm: 68, femaleNS: 36.07, femaleSm: 50.66 },
  53: { maleNS: 45.69, maleSm: 71.42, femaleNS: 36.9, femaleSm: 52.9 },
  54: { maleNS: 47.25, maleSm: 73.44, femaleNS: 37.6, femaleSm: 54.13 },
  55: { maleNS: 48.68, maleSm: 75.31, femaleNS: 38.28, femaleSm: 55.39 },
  56: { maleNS: 50.39, maleSm: 79.27, femaleNS: 39.58, femaleSm: 57.84 },
  57: { maleNS: 51.38, maleSm: 83.44, femaleNS: 39.83, femaleSm: 60.4 },
  58: { maleNS: 52.42, maleSm: 87.83, femaleNS: 40.27, femaleSm: 63.08 },
  59: { maleNS: 53.68, maleSm: 92.44, femaleNS: 41.3, femaleSm: 65.88 },
  60: { maleNS: 55.96, maleSm: 97.3, femaleNS: 43.38, femaleSm: 68.8 },
  61: { maleNS: 58.43, maleSm: 102.41, femaleNS: 46.64, femaleSm: 71.85 },
  62: { maleNS: 62.15, maleSm: 107.8, femaleNS: 49.92, femaleSm: 75.03 },
  63: { maleNS: 64.62, maleSm: 113.46, femaleNS: 52.45, femaleSm: 78.36 },
  64: { maleNS: 68, maleSm: 119.43, femaleNS: 54.8, femaleSm: 81.83 },
  65: { maleNS: 70.69, maleSm: 125.7, femaleNS: 55.78, femaleSm: 85.45 },
  66: { maleNS: 74.86, maleSm: 133.01, femaleNS: 59.54, femaleSm: 90.56 },
  67: { maleNS: 79.78, maleSm: 140.75, femaleNS: 62.27, femaleSm: 95.98 },
  68: { maleNS: 84.67, maleSm: 148.93, femaleNS: 65.49, femaleSm: 101.72 },
  69: { maleNS: 89.57, maleSm: 157.59, femaleNS: 68.19, femaleSm: 107.8 },
  70: { maleNS: 95.88, maleSm: 166.76, femaleNS: 71.58, femaleSm: 112.81 },
  71: { maleNS: 101.83, maleSm: 176.45, femaleNS: 76.38, femaleSm: 120.59 },
  72: { maleNS: 109.18, maleSm: 186.71, femaleNS: 80.03, femaleSm: 128.32 },
  73: { maleNS: 116.53, maleSm: 197.57, femaleNS: 85.97, femaleSm: 135.99 },
  74: { maleNS: 123.89, maleSm: 209.06, femaleNS: 90.72, femaleSm: 144.12 },
  75: { maleNS: 131.96, maleSm: 221.22, femaleNS: 95.67, femaleSm: 152.74 },
  76: { maleNS: 144.8, maleSm: 236.27, femaleNS: 106.97, femaleSm: 164.44 },
  77: { maleNS: 157.11, maleSm: 252.34, femaleNS: 117.59, femaleSm: 177.04 },
  78: { maleNS: 169.53, maleSm: 269.51, femaleNS: 128.54, femaleSm: 190.6 },
  79: { maleNS: 182.27, maleSm: 287.85, femaleNS: 139.83, femaleSm: 205.2 },
  80: { maleNS: 196.15, maleSm: 307.44, femaleNS: 151.99, femaleSm: 220.92 },
  81: { maleNS: 210.78, maleSm: 328.36, femaleNS: 164.52, femaleSm: 237.84 },
  82: { maleNS: 227.78, maleSm: 350.7, femaleNS: 179.81, femaleSm: 256.06 },
  83: { maleNS: 246.16, maleSm: 374.56, femaleNS: 196.52, femaleSm: 275.67 },
  84: { maleNS: 266.01, maleSm: 400.05, femaleNS: 214.78, femaleSm: 296.79 },
  85: { maleNS: 287.46, maleSm: 427.27, femaleNS: 233.96, femaleSm: 319.53 },
};

const AMAM_RATES = {
  50: { maleNS: 32.96, maleSm: 43.12, femaleNS: 27.3, femaleSm: 32.55 },
  51: { maleNS: 34.9, maleSm: 45.03, femaleNS: 29.36, femaleSm: 33.62 },
  52: { maleNS: 36.67, maleSm: 47.09, femaleNS: 30.58, femaleSm: 35.34 },
  53: { maleNS: 39.14, maleSm: 49.42, femaleNS: 32.21, femaleSm: 37.29 },
  54: { maleNS: 40.94, maleSm: 51.61, femaleNS: 33.74, femaleSm: 38.73 },
  55: { maleNS: 42.49, maleSm: 53.82, femaleNS: 35.28, femaleSm: 40.94 },
  56: { maleNS: 44.18, maleSm: 56.05, femaleNS: 36.42, femaleSm: 42.23 },
  57: { maleNS: 45.32, maleSm: 58.29, femaleNS: 37.7, femaleSm: 44.2 },
  58: { maleNS: 47.64, maleSm: 61.08, femaleNS: 38.77, femaleSm: 45.91 },
  59: { maleNS: 49.5, maleSm: 63.35, femaleNS: 40.17, femaleSm: 47.7 },
  60: { maleNS: 50.47, maleSm: 65.82, femaleNS: 40.48, femaleSm: 49.01 },
  61: { maleNS: 53.38, maleSm: 70.04, femaleNS: 42.85, femaleSm: 51.46 },
  62: { maleNS: 56.09, maleSm: 73.13, femaleNS: 44.5, femaleSm: 54.08 },
  63: { maleNS: 58.71, maleSm: 76.01, femaleNS: 46.44, femaleSm: 56.85 },
  64: { maleNS: 61.8, maleSm: 79.64, femaleNS: 48.5, femaleSm: 59.78 },
  65: { maleNS: 64.89, maleSm: 83.43, femaleNS: 50.47, femaleSm: 62.57 },
  66: { maleNS: 69.24, maleSm: 88.51, femaleNS: 53.59, femaleSm: 65.88 },
  67: { maleNS: 73.78, maleSm: 93.22, femaleNS: 56.34, femaleSm: 69.33 },
  68: { maleNS: 78.7, maleSm: 98.88, femaleNS: 59.45, femaleSm: 72.1 },
  69: { maleNS: 83.12, maleSm: 104.55, femaleNS: 62.52, femaleSm: 77.12 },
  70: { maleNS: 86.53, maleSm: 108.72, femaleNS: 65.61, femaleSm: 79.02 },
  71: { maleNS: 92.03, maleSm: 115.15, femaleNS: 69.53, femaleSm: 83.2 },
  72: { maleNS: 97.83, maleSm: 121.93, femaleNS: 73.65, femaleSm: 87.61 },
  73: { maleNS: 104.4, maleSm: 129.6, femaleNS: 78.84, femaleSm: 92.61 },
  74: { maleNS: 111.76, maleSm: 137.51, femaleNS: 83.69, femaleSm: 97.75 },
  75: { maleNS: 119.74, maleSm: 147.55, femaleNS: 89.87, femaleSm: 104.29 },
  76: { maleNS: 128.75, maleSm: 157.59, femaleNS: 95.83, femaleSm: 112.49 },
  77: { maleNS: 138.02, maleSm: 168.1, femaleNS: 101.29, femaleSm: 120 },
  78: { maleNS: 150.28, maleSm: 180.87, femaleNS: 108.15, femaleSm: 127.85 },
  79: { maleNS: 161.92, maleSm: 191.58, femaleNS: 116.6, femaleSm: 139.06 },
  80: { maleNS: 174.07, maleSm: 203.53, femaleNS: 126.18, femaleSm: 150.62 },
  81: { maleNS: 187.87, maleSm: 216.3, femaleNS: 135.75, femaleSm: 164.14 },
  82: { maleNS: 202.91, maleSm: 229.56, femaleNS: 146.26, femaleSm: 179.51 },
  83: { maleNS: 217.02, maleSm: 246.08, femaleNS: 158.11, femaleSm: 195.69 },
  84: { maleNS: 232.78, maleSm: 266.64, femaleNS: 170.98, femaleSm: 214.76 },
  85: { maleNS: 248.49, maleSm: 289.69, femaleNS: 185.66, femaleSm: 236.13 },
};

const COREBRIDGE_RATES = {
  50: {
    male: {
      5000: 31.43,
      10000: 60.85,
      15000: 90.27,
      20000: 119.7,
      25000: 149.12,
    },
    female: {
      5000: 21.94,
      10000: 41.88,
      15000: 61.81,
      20000: 86.79,
      25000: 107.98,
    },
  },
  51: {
    male: {
      5000: 32.08,
      10000: 62.17,
      15000: 92.25,
      20000: 137.28,
      25000: 171.1,
    },
    female: {
      5000: 22.82,
      10000: 43.63,
      15000: 64.45,
      20000: 96.04,
      25000: 119.55,
    },
  },
  52: {
    male: {
      5000: 32.59,
      10000: 63.18,
      15000: 93.77,
      20000: 139.58,
      25000: 173.98,
    },
    female: {
      5000: 23.45,
      10000: 44.9,
      15000: 66.35,
      20000: 98.93,
      25000: 123.16,
    },
  },
  53: {
    male: {
      5000: 33.01,
      10000: 64.02,
      15000: 95.02,
      20000: 141.45,
      25000: 176.31,
    },
    female: {
      5000: 24.12,
      10000: 46.24,
      15000: 68.36,
      20000: 101.98,
      25000: 126.98,
    },
  },
  54: {
    male: {
      5000: 33.45,
      10000: 64.9,
      15000: 96.35,
      20000: 141.51,
      25000: 176.39,
    },
    female: {
      5000: 25.38,
      10000: 48.76,
      15000: 72.15,
      20000: 108.02,
      25000: 134.52,
    },
  },
  55: {
    male: {
      5000: 34.36,
      10000: 66.72,
      15000: 99.08,
      20000: 147.18,
      25000: 183.48,
    },
    female: {
      5000: 26.3,
      10000: 50.61,
      15000: 74.91,
      20000: 112.02,
      25000: 139.53,
    },
  },
  56: {
    male: {
      5000: 35.33,
      10000: 68.65,
      15000: 101.98,
      20000: 151.42,
      25000: 188.78,
    },
    female: {
      5000: 27.33,
      10000: 52.67,
      15000: 78,
      20000: 116.51,
      25000: 145.14,
    },
  },
  57: {
    male: {
      5000: 36.24,
      10000: 70.49,
      15000: 104.73,
      20000: 155.37,
      25000: 193.71,
    },
    female: {
      5000: 28.13,
      10000: 54.26,
      15000: 80.39,
      20000: 120.03,
      25000: 149.54,
    },
  },
  58: {
    male: {
      5000: 37.09,
      10000: 72.17,
      15000: 107.26,
      20000: 159.02,
      25000: 198.27,
    },
    female: {
      5000: 28.95,
      10000: 55.89,
      15000: 82.84,
      20000: 123.6,
      25000: 154,
    },
  },
  59: {
    male: {
      5000: 37.6,
      10000: 73.2,
      15000: 108.8,
      20000: 161.26,
      25000: 201.07,
    },
    female: {
      5000: 29.7,
      10000: 57.4,
      15000: 85.09,
      20000: 126.88,
      25000: 158.11,
    },
  },
  60: {
    male: {
      5000: 38.05,
      10000: 74.09,
      15000: 110.14,
      20000: 162.51,
      25000: 202.64,
    },
    female: {
      5000: 30.3,
      10000: 58.61,
      15000: 86.91,
      20000: 129.49,
      25000: 161.36,
    },
  },
  61: {
    male: {
      5000: 40.78,
      10000: 79.56,
      15000: 118.34,
      20000: 174.2,
      25000: 217.25,
    },
    female: {
      5000: 32.08,
      10000: 62.17,
      15000: 92.25,
      20000: 137.28,
      25000: 171.1,
    },
  },
  62: {
    male: {
      5000: 43.59,
      10000: 85.18,
      15000: 126.77,
      20000: 186.3,
      25000: 232.37,
    },
    female: {
      5000: 31.83,
      10000: 61.67,
      15000: 91.5,
      20000: 135.87,
      25000: 169.34,
    },
  },
  63: {
    male: {
      5000: 46.38,
      10000: 90.77,
      15000: 135.15,
      20000: 198.3,
      25000: 247.38,
    },
    female: {
      5000: 33.71,
      10000: 65.42,
      15000: 97.13,
      20000: 144.35,
      25000: 179.94,
    },
  },
  64: {
    male: {
      5000: 49.01,
      10000: 96.02,
      15000: 143.03,
      20000: 209.76,
      25000: 261.7,
    },
    female: {
      5000: 35.12,
      10000: 68.23,
      15000: 101.34,
      20000: 150.49,
      25000: 187.61,
    },
  },
  65: {
    male: {
      5000: 50.42,
      10000: 98.83,
      15000: 147.24,
      20000: 217.26,
      25000: 271.07,
    },
    female: {
      5000: 37.11,
      10000: 72.22,
      15000: 107.32,
      20000: 159.21,
      25000: 198.51,
    },
  },
  66: {
    male: {
      5000: 52.43,
      10000: 102.87,
      15000: 153.3,
      20000: 226.21,
      25000: 282.27,
    },
    female: {
      5000: 39.01,
      10000: 76.01,
      15000: 113.02,
      20000: 167.45,
      25000: 208.81,
    },
  },
  67: {
    male: {
      5000: 54.1,
      10000: 106.2,
      15000: 158.3,
      20000: 233.99,
      25000: 291.98,
    },
    female: {
      5000: 40.57,
      10000: 79.15,
      15000: 117.72,
      20000: 174.31,
      25000: 217.38,
    },
  },
  68: {
    male: {
      5000: 55.76,
      10000: 109.52,
      15000: 163.27,
      20000: 241.31,
      25000: 301.14,
    },
    female: {
      5000: 42.03,
      10000: 82.06,
      15000: 122.09,
      20000: 180.66,
      25000: 225.33,
    },
  },
  69: {
    male: {
      5000: 57.27,
      10000: 112.54,
      15000: 167.81,
      20000: 247.75,
      25000: 309.18,
    },
    female: {
      5000: 43.39,
      10000: 84.78,
      15000: 126.17,
      20000: 186.49,
      25000: 232.61,
    },
  },
  70: {
    male: {
      5000: 58.68,
      10000: 115.36,
      15000: 172.04,
      20000: 253.35,
      25000: 316.19,
    },
    female: {
      5000: 44.74,
      10000: 87.47,
      15000: 130.2,
      20000: 192.47,
      25000: 240.09,
    },
  },
  71: {
    male: {
      5000: 63.98,
      10000: 125.96,
      15000: 187.94,
      20000: 276.47,
      25000: 345.09,
    },
    female: {
      5000: 49.06,
      10000: 96.12,
      15000: 143.19,
      20000: 211.31,
      25000: 263.64,
    },
  },
  72: {
    male: {
      5000: 69.17,
      10000: 136.33,
      15000: 203.5,
      20000: 298.98,
      25000: 373.23,
    },
    female: {
      5000: 53.17,
      10000: 104.34,
      15000: 155.51,
      20000: 229.26,
      25000: 286.08,
    },
  },
  73: {
    male: {
      5000: 74.04,
      10000: 146.08,
      15000: 218.11,
      20000: 320.36,
      25000: 399.94,
    },
    female: {
      5000: 57.11,
      10000: 112.22,
      15000: 167.33,
      20000: 246.5,
      25000: 307.62,
    },
  },
  74: {
    male: {
      5000: 78.58,
      10000: 155.17,
      15000: 231.75,
      20000: 340.17,
      25000: 424.71,
    },
    female: {
      5000: 60.74,
      10000: 119.48,
      15000: 178.22,
      20000: 262.07,
      25000: 327.09,
    },
  },
  75: {
    male: {
      5000: 82.47,
      10000: 162.95,
      15000: 243.42,
      20000: 357.15,
      25000: 445.94,
    },
    female: {
      5000: 63.98,
      10000: 125.96,
      15000: 187.94,
      20000: 276.47,
      25000: 345.09,
    },
  },
  76: {
    male: {
      5000: 96.25,
      10000: 190.49,
      15000: 284.74,
      20000: 405.68,
      25000: 506.6,
    },
    female: {
      5000: 73.17,
      10000: 144.35,
      15000: 215.52,
      20000: 316.29,
      25000: 394.86,
    },
  },
  77: {
    male: {
      5000: 109.5,
      10000: 217,
      15000: 324.5,
      20000: 436.15,
      25000: 544.69,
    },
    female: {
      5000: 81.83,
      10000: 161.67,
      15000: 241.5,
      20000: 353.8,
      25000: 441.75,
    },
  },
  78: {
    male: {
      5000: 112.9,
      10000: 223.8,
      15000: 334.71,
      20000: 451.99,
      25000: 564.49,
    },
    female: {
      5000: 89.93,
      10000: 177.87,
      15000: 265.8,
      20000: 389.71,
      25000: 486.64,
    },
  },
  79: {
    male: {
      5000: 113.13,
      10000: 224.27,
      15000: 335.4,
      20000: 452.43,
      25000: 565.04,
    },
    female: {
      5000: 97.5,
      10000: 193.01,
      15000: 288.51,
      20000: 424.12,
      25000: 529.64,
    },
  },
  80: {
    male: {
      5000: 113.36,
      10000: 224.71,
      15000: 336.07,
      20000: 452.9,
      25000: 565.62,
    },
    female: {
      5000: 104.21,
      10000: 206.42,
      15000: 308.62,
      20000: 447.41,
      25000: 558.76,
    },
  },
};

// Modified/Graded Rate Tables
const AFLAC_MODIFIED_RATES = {
  45: { male: 45.99, female: 36.29 },
  46: { male: 47.25, female: 36.86 },
  47: { male: 49.77, female: 37.98 },
  48: { male: 52.28, female: 39.15 },
  49: { male: 58.57, female: 42.57 },
  50: { male: 64.86, female: 52.28 },
  51: { male: 68.51, female: 54.57 },
  52: { male: 72.18, female: 56.85 },
  53: { male: 75.83, female: 59.14 },
  54: { male: 79.5, female: 61.43 },
  55: { male: 83.14, female: 63.71 },
  56: { male: 86.8, female: 66 },
  57: { male: 90.46, female: 68.28 },
  58: { male: 94.12, female: 70.57 },
  59: { male: 97.77, female: 72.85 },
  60: { male: 101.43, female: 75.14 },
  61: { male: 66.61, female: 48.5 },
  62: { male: 70.41, female: 51.56 },
  63: { male: 74.21, female: 54.63 },
  64: { male: 78.02, female: 57.68 },
  65: { male: 81.82, female: 60.73 },
  66: { male: 87.8, female: 64.98 },
  67: { male: 93.79, female: 69.24 },
  68: { male: 99.78, female: 73.5 },
  69: { male: 105.76, female: 77.75 },
  70: { male: 111.75, female: 82.01 },
  71: { male: 121.01, female: 89.22 },
  72: { male: 130.27, female: 96.43 },
  73: { male: 139.53, female: 103.64 },
  74: { male: 148.79, female: 110.85 },
  75: { male: 158.06, female: 118.05 },
};

const SBLI_MODIFIED_RATES = {
  50: { maleNS: 52.9, maleSm: 77.9, femaleNS: 41.8, femaleSm: 60.05 },
  51: { maleNS: 55.05, maleSm: 82.4, femaleNS: 43.25, femaleSm: 63.35 },
  52: { maleNS: 57.2, maleSm: 86.9, femaleNS: 44.7, femaleSm: 66.65 },
  53: { maleNS: 59.35, maleSm: 91.4, femaleNS: 46.15, femaleSm: 69.95 },
  54: { maleNS: 61.5, maleSm: 95.9, femaleNS: 47.6, femaleSm: 73.25 },
  55: { maleNS: 63.65, maleSm: 100.4, femaleNS: 49.05, femaleSm: 76.55 },
  56: { maleNS: 66.5, maleSm: 104.45, femaleNS: 51.25, femaleSm: 80.05 },
  57: { maleNS: 69.35, maleSm: 108.5, femaleNS: 53.45, femaleSm: 83.5 },
  58: { maleNS: 72.2, maleSm: 112.55, femaleNS: 55.65, femaleSm: 86.95 },
  59: { maleNS: 75.05, maleSm: 116.6, femaleNS: 57.85, femaleSm: 90.45 },
  60: { maleNS: 77.9, maleSm: 120.65, femaleNS: 60.05, femaleSm: 93.9 },
  61: { maleNS: 82.4, maleSm: 126.75, femaleNS: 63.35, femaleSm: 99.15 },
  62: { maleNS: 86.9, maleSm: 132.8, femaleNS: 66.65, femaleSm: 104.35 },
  63: { maleNS: 91.4, maleSm: 138.85, femaleNS: 69.95, femaleSm: 109.6 },
  64: { maleNS: 95.9, maleSm: 144.9, femaleNS: 73.25, femaleSm: 114.85 },
  65: { maleNS: 100.4, maleSm: 150.95, femaleNS: 76.55, femaleSm: 120.05 },
  66: { maleNS: 108.5, maleSm: 163.2, femaleNS: 83.5, femaleSm: 128.6 },
  67: { maleNS: 116.6, maleSm: 175.45, femaleNS: 90.45, femaleSm: 137.15 },
  68: { maleNS: 124.7, maleSm: 187.7, femaleNS: 97.4, femaleSm: 145.7 },
  69: { maleNS: 132.8, maleSm: 199.95, femaleNS: 104.35, femaleSm: 154.25 },
  70: { maleNS: 140.9, maleSm: 212.2, femaleNS: 111.3, femaleSm: 162.8 },
  71: { maleNS: 153.2, maleSm: 229, femaleNS: 121.15, femaleSm: 177 },
  72: { maleNS: 165.5, maleSm: 245.8, femaleNS: 131, femaleSm: 191.2 },
  73: { maleNS: 177.8, maleSm: 262.6, femaleNS: 140.85, femaleSm: 205.4 },
  74: { maleNS: 190.1, maleSm: 279.4, femaleNS: 150.7, femaleSm: 219.6 },
  75: { maleNS: 202.4, maleSm: 296.2, femaleNS: 160.55, femaleSm: 233.8 },
};

const CICA_GI_RATES = {
  40: { male: 62.7, female: 59.4 },
  41: { male: 63.04, female: 59.76 },
  42: { male: 63.38, female: 60.12 },
  43: { male: 63.72, female: 60.48 },
  44: { male: 64.06, female: 60.84 },
  45: { male: 64.4, female: 61.2 },
  46: { male: 64.74, female: 61.56 },
  47: { male: 65.08, female: 61.92 },
  48: { male: 65.42, female: 62.28 },
  49: { male: 65.76, female: 62.64 },
  50: { male: 66.09, female: 63 },
  51: { male: 66.43, female: 63.36 },
  52: { male: 66.77, female: 63.72 },
  53: { male: 67.11, female: 64.08 },
  54: { male: 67.45, female: 64.44 },
  55: { male: 67.79, female: 64.8 },
  56: { male: 72.84, female: 69.41 },
  57: { male: 78.25, female: 74.35 },
  58: { male: 84.07, female: 79.64 },
  59: { male: 90.32, female: 85.3 },
  60: { male: 97.04, female: 91.37 },
  61: { male: 104.26, female: 97.87 },
  62: { male: 112.01, female: 104.84 },
  63: { male: 120.34, female: 112.3 },
  64: { male: 129.29, female: 120.29 },
  65: { male: 138.91, female: 128.85 },
  66: { male: 149.24, female: 138.01 },
  67: { male: 160.33, female: 147.83 },
  68: { male: 172.26, female: 158.35 },
  69: { male: 185.07, female: 169.62 },
  70: { male: 198.83, female: 181.68 },
  71: { male: 204.62, female: 190.86 },
  72: { male: 210.42, female: 200.04 },
  73: { male: 216.21, female: 209.22 },
  74: { male: 222, female: 218.4 },
  75: { male: 232.83, female: 229.05 },
  76: { male: 244.58, female: 240.61 },
  77: { male: 257.27, female: 253.1 },
  78: { male: 270.89, female: 266.5 },
  79: { male: 284.86, female: 280.23 },
  80: { male: 299.07, female: 294.21 },
  81: { male: 318.97, female: 318.97 },
  82: { male: 338.76, female: 338.76 },
  83: { male: 358.55, female: 358.55 },
  84: { male: 378.34, female: 378.34 },
  85: { male: 397.67, female: 397.67 },
};

const TRANSAMERICA_GRADED_RATES = {
  50: { maleNS: 63.06, maleSm: 61.91, femaleNS: 67.53, femaleSm: 83.14 },
  51: { maleNS: 63.19, maleSm: 62.69, femaleNS: 70.37, femaleSm: 85.75 },
  52: { maleNS: 64.57, maleSm: 65.28, femaleNS: 73.34, femaleSm: 88.4 },
  53: { maleNS: 65.97, maleSm: 67.88, femaleNS: 76.42, femaleSm: 92.85 },
  54: { maleNS: 67.41, maleSm: 70.49, femaleNS: 79.64, femaleSm: 95.47 },
  55: { maleNS: 68.87, maleSm: 72.47, femaleNS: 82.99, femaleSm: 97.9 },
  56: { maleNS: 69.35, maleSm: 80.12, femaleNS: 83.03, femaleSm: 103.05 },
  57: { maleNS: 69.8, maleSm: 82.68, femaleNS: 83.07, femaleSm: 108.47 },
  58: { maleNS: 70.2, maleSm: 85.33, femaleNS: 83.11, femaleSm: 114.18 },
  59: { maleNS: 70.56, maleSm: 86.33, femaleNS: 85.64, femaleSm: 120.17 },
  60: { maleNS: 70.87, maleSm: 87.03, femaleNS: 89.44, femaleSm: 126.49 },
  61: { maleNS: 74.06, maleSm: 89.4, femaleNS: 93.41, femaleSm: 133.13 },
  62: { maleNS: 77.38, maleSm: 94.15, femaleNS: 97.54, femaleSm: 140.14 },
  63: { maleNS: 80.84, maleSm: 99.12, femaleNS: 101.87, femaleSm: 147.5 },
  64: { maleNS: 84.43, maleSm: 104.3, femaleNS: 106.38, femaleSm: 155.26 },
  65: { maleNS: 88.17, maleSm: 109.71, femaleNS: 111.09, femaleSm: 163.41 },
  66: { maleNS: 93.53, maleSm: 117.01, femaleNS: 117.73, femaleSm: 172.91 },
  67: { maleNS: 99.21, maleSm: 124.8, femaleNS: 124.77, femaleSm: 182.98 },
  68: { maleNS: 105.23, maleSm: 133.11, femaleNS: 132.24, femaleSm: 193.61 },
  69: { maleNS: 111.63, maleSm: 141.97, femaleNS: 140.14, femaleSm: 204.87 },
  70: { maleNS: 118.41, maleSm: 151.42, femaleNS: 146.65, femaleSm: 216.79 },
  71: { maleNS: 124.13, maleSm: 161.46, femaleNS: 156.77, femaleSm: 229.39 },
  72: { maleNS: 130.12, maleSm: 172.17, femaleNS: 166.82, femaleSm: 242.72 },
  73: { maleNS: 136.37, maleSm: 183.59, femaleNS: 176.79, femaleSm: 256.84 },
  74: { maleNS: 142.91, maleSm: 195.77, femaleNS: 187.36, femaleSm: 271.78 },
  75: { maleNS: 149.73, maleSm: 208.75, femaleNS: 198.56, femaleSm: 287.59 },
  76: { maleNS: 159.9, maleSm: 220.26, femaleNS: 213.77, femaleSm: 307.15 },
  77: { maleNS: 170.19, maleSm: 231.96, femaleNS: 230.15, femaleSm: 328.04 },
  78: { maleNS: 180.63, maleSm: 243.84, femaleNS: 240.02, femaleSm: 336.59 },
  79: { maleNS: 191.19, maleSm: 255.92, femaleNS: 242.14, femaleSm: 338.7 },
  80: { maleNS: 201.89, maleSm: 268.18, femaleNS: 244.28, femaleSm: 340.82 },
};

const AMAM_GRADED_RATES = {
  50: { maleNS: 40.1, maleSm: 60.54, femaleNS: 31.6, femaleSm: 39.42 },
  51: { maleNS: 42.35, maleSm: 63.59, femaleNS: 33.24, femaleSm: 41.7 },
  52: { maleNS: 44.61, maleSm: 66.64, femaleNS: 34.88, femaleSm: 43.99 },
  53: { maleNS: 47.16, maleSm: 70.09, femaleNS: 36.73, femaleSm: 46.58 },
  54: { maleNS: 49.72, maleSm: 73.54, femaleNS: 38.58, femaleSm: 49.16 },
  55: { maleNS: 52.27, maleSm: 76.99, femaleNS: 40.43, femaleSm: 51.76 },
  56: { maleNS: 54.51, maleSm: 80.07, femaleNS: 42.11, femaleSm: 54.62 },
  57: { maleNS: 56.86, maleSm: 83.32, femaleNS: 43.88, femaleSm: 57.63 },
  58: { maleNS: 59.33, maleSm: 86.73, femaleNS: 45.73, femaleSm: 60.79 },
  59: { maleNS: 61.91, maleSm: 90.3, femaleNS: 47.68, femaleSm: 64.11 },
  60: { maleNS: 63.91, maleSm: 93.06, femaleNS: 49.18, femaleSm: 66.67 },
  61: { maleNS: 67.32, maleSm: 97.77, femaleNS: 51.75, femaleSm: 71.04 },
  62: { maleNS: 71.08, maleSm: 102.96, femaleNS: 54.58, femaleSm: 75.86 },
  63: { maleNS: 74.96, maleSm: 108.31, femaleNS: 57.49, femaleSm: 80.83 },
  64: { maleNS: 79.08, maleSm: 113.99, femaleNS: 60.58, femaleSm: 86.11 },
  65: { maleNS: 83.43, maleSm: 120, femaleNS: 63.86, femaleSm: 91.67 },
  66: { maleNS: 89.84, maleSm: 127.56, femaleNS: 68.27, femaleSm: 97.27 },
  67: { maleNS: 96.82, maleSm: 135.81, femaleNS: 73.08, femaleSm: 103.39 },
  68: { maleNS: 104.25, maleSm: 144.57, femaleNS: 78.19, femaleSm: 109.89 },
  69: { maleNS: 112.25, maleSm: 154.02, femaleNS: 83.7, femaleSm: 115.36 },
  70: { maleNS: 116.03, maleSm: 158.49, femaleNS: 86.3, femaleSm: 120.21 },
  71: { maleNS: 123.89, maleSm: 167.77, femaleNS: 91.71, femaleSm: 127.72 },
  72: { maleNS: 133.9, maleSm: 178.25, femaleNS: 97.82, femaleSm: 134.86 },
  73: { maleNS: 144.2, maleSm: 190.28, femaleNS: 104.83, femaleSm: 143.78 },
  74: { maleNS: 155.02, maleSm: 204.35, femaleNS: 113.3, femaleSm: 152.18 },
  75: { maleNS: 166.09, maleSm: 217.59, femaleNS: 120.77, femaleSm: 164.03 },
  76: { maleNS: 179.53, maleSm: 237.11, femaleNS: 129.78, femaleSm: 174.29 },
  77: { maleNS: 196.73, maleSm: 255.76, femaleNS: 140.6, femaleSm: 180.79 },
  78: { maleNS: 215.27, maleSm: 274.12, femaleNS: 154.5, femaleSm: 193.5 },
  79: { maleNS: 234.33, maleSm: 295.71, femaleNS: 167.38, femaleSm: 207.22 },
  80: { maleNS: 254.2, maleSm: 313.12, femaleNS: 182.31, femaleSm: 224.54 },
  81: { maleNS: 269.86, maleSm: 316.15, femaleNS: 197.76, femaleSm: 238.85 },
  82: { maleNS: 283.87, maleSm: 320.54, femaleNS: 213.21, femaleSm: 258.06 },
  83: { maleNS: 296.64, maleSm: 325.48, femaleNS: 227.63, femaleSm: 278.28 },
  84: { maleNS: 307.97, maleSm: 336.06, femaleNS: 241.02, femaleSm: 301.39 },
  85: { maleNS: 312.35, maleSm: 359.73, femaleNS: 248.49, femaleSm: 328.83 },
};

const AMAM_ROP_RATES = {
  50: { maleNS: 47.26, maleSm: 71.47, femaleNS: 38.07, femaleSm: 44.57 },
  51: { maleNS: 49.51, maleSm: 75.83, femaleNS: 40.14, femaleSm: 47.38 },
  52: { maleNS: 51.76, maleSm: 79.54, femaleNS: 42.21, femaleSm: 49.99 },
  53: { maleNS: 54.3, maleSm: 83.74, femaleNS: 44.55, femaleSm: 52.94 },
  54: { maleNS: 56.85, maleSm: 87.95, femaleNS: 46.89, femaleSm: 55.9 },
  55: { maleNS: 59.1, maleSm: 90.87, femaleNS: 49.03, femaleSm: 58.59 },
  56: { maleNS: 62.07, maleSm: 95.45, femaleNS: 51.49, femaleSm: 62.21 },
  57: { maleNS: 65.21, maleSm: 99.83, femaleNS: 54.09, femaleSm: 66.01 },
  58: { maleNS: 68.51, maleSm: 104.43, femaleNS: 56.83, femaleSm: 69.69 },
  59: { maleNS: 71.96, maleSm: 109.25, femaleNS: 59.69, femaleSm: 73.86 },
  60: { maleNS: 74.63, maleSm: 112.46, femaleNS: 61.89, femaleSm: 77.08 },
  61: { maleNS: 79.19, maleSm: 118.79, femaleNS: 65.67, femaleSm: 82.57 },
  62: { maleNS: 84.22, maleSm: 125.76, femaleNS: 69.82, femaleSm: 88.62 },
  63: { maleNS: 89.4, maleSm: 132.96, femaleNS: 74.12, femaleSm: 94.87 },
  64: { maleNS: 94.44, maleSm: 139.29, femaleNS: 78.29, femaleSm: 101.03 },
  65: { maleNS: 99.75, maleSm: 146.59, femaleNS: 82.69, femaleSm: 107.5 },
  66: { maleNS: 106.46, maleSm: 155.29, femaleNS: 88.61, femaleSm: 115.05 },
  67: { maleNS: 113.79, maleSm: 165.56, femaleNS: 94.65, femaleSm: 122.74 },
  68: { maleNS: 121.62, maleSm: 175.74, femaleNS: 100.62, femaleSm: 130.3 },
  69: { maleNS: 129.48, maleSm: 185.9, femaleNS: 106.56, femaleSm: 139.72 },
  70: { maleNS: 133.2, maleSm: 190.71, femaleNS: 109.08, femaleSm: 143.89 },
  71: { maleNS: 141.58, maleSm: 201.14, femaleNS: 115.89, femaleSm: 152.54 },
  72: { maleNS: 151.05, maleSm: 212.92, femaleNS: 123.58, femaleSm: 162.31 },
  73: { maleNS: 161.15, maleSm: 225.91, femaleNS: 131.78, femaleSm: 173.52 },
  74: { maleNS: 170.68, maleSm: 238.15, femaleNS: 139.52, femaleSm: 184.95 },
  75: { maleNS: 183.24, maleSm: 255.41, femaleNS: 149.73, femaleSm: 199.91 },
  76: { maleNS: 197.86, maleSm: 271.5, femaleNS: 160.46, femaleSm: 219.34 },
  77: { maleNS: 215.62, maleSm: 280.96, femaleNS: 166.36, femaleSm: 229.32 },
  78: { maleNS: 234.14, maleSm: 299.45, femaleNS: 177.92, femaleSm: 248.83 },
  79: { maleNS: 253.37, maleSm: 319.42, femaleNS: 190.4, femaleSm: 268.69 },
  80: { maleNS: 271.98, maleSm: 337.76, femaleNS: 203.79, femaleSm: 287.23 },
  81: { maleNS: 287.61, maleSm: 362.12, femaleNS: 219.16, femaleSm: 312.71 },
  82: { maleNS: 303.16, maleSm: 389.82, femaleNS: 234.41, femaleSm: 341.67 },
  83: { maleNS: 319.58, maleSm: 415.13, femaleNS: 250.24, femaleSm: 372.16 },
  84: { maleNS: 347.84, maleSm: 448.15, femaleNS: 270.85, femaleSm: 406.99 },
  85: { maleNS: 381.41, maleSm: 487.35, femaleNS: 295.31, femaleSm: 448.38 },
};

// AHL Level Rates (ages 50-85, tobacco differentiated)
const AHL_RATES = {
  50: { maleNS: 36.98, maleSm: 49.24, femaleNS: 28.46, femaleSm: 42.91 },
  51: { maleNS: 38.83, maleSm: 51.1, femaleNS: 29.31, femaleSm: 44.81 },
  52: { maleNS: 40.77, maleSm: 53.21, femaleNS: 30.19, femaleSm: 47.08 },
  53: { maleNS: 42.41, maleSm: 55.52, femaleNS: 31.1, femaleSm: 49.5 },
  54: { maleNS: 44.1, maleSm: 57.99, femaleNS: 32.03, femaleSm: 51.97 },
  55: { maleNS: 45.42, maleSm: 60.61, femaleNS: 32.99, femaleSm: 54.47 },
  56: { maleNS: 45.88, maleSm: 63.38, femaleNS: 33.98, femaleSm: 57.01 },
  57: { maleNS: 46.34, maleSm: 66.31, femaleNS: 35, femaleSm: 59.64 },
  58: { maleNS: 47.26, maleSm: 69.43, femaleNS: 36.05, femaleSm: 62.39 },
  59: { maleNS: 48.68, maleSm: 72.76, femaleNS: 37.49, femaleSm: 65.31 },
  60: { maleNS: 50.63, maleSm: 76.33, femaleNS: 38.99, femaleSm: 68.42 },
  61: { maleNS: 53.46, maleSm: 80.18, femaleNS: 40.03, femaleSm: 71.74 },
  62: { maleNS: 56.23, maleSm: 84.34, femaleNS: 41.44, femaleSm: 75.28 },
  63: { maleNS: 59.02, maleSm: 88.85, femaleNS: 43.17, femaleSm: 79 },
  64: { maleNS: 61.9, maleSm: 93.75, femaleNS: 45.18, femaleSm: 82.89 },
  65: { maleNS: 64.92, maleSm: 99.09, femaleNS: 47.45, femaleSm: 86.91 },
  66: { maleNS: 68.16, maleSm: 104.9, femaleNS: 49.97, femaleSm: 91.04 },
  67: { maleNS: 71.7, maleSm: 111.25, femaleNS: 52.73, femaleSm: 95.26 },
  68: { maleNS: 75.59, maleSm: 118.17, femaleNS: 55.76, femaleSm: 99.57 },
  69: { maleNS: 79.91, maleSm: 125.74, femaleNS: 59.08, femaleSm: 103.98 },
  70: { maleNS: 84.74, maleSm: 134.02, femaleNS: 62.74, femaleSm: 108.55 },
  71: { maleNS: 90.14, maleSm: 143.09, femaleNS: 66.79, femaleSm: 113.36 },
  72: { maleNS: 96.19, maleSm: 153.04, femaleNS: 71.3, femaleSm: 118.51 },
  73: { maleNS: 102.97, maleSm: 163.96, femaleNS: 76.35, femaleSm: 124.15 },
  74: { maleNS: 110.54, maleSm: 175.98, femaleNS: 82.04, femaleSm: 130.45 },
  75: { maleNS: 118.98, maleSm: 189.22, femaleNS: 88.48, femaleSm: 137.59 },
  76: { maleNS: 128.37, maleSm: 203.82, femaleNS: 95.78, femaleSm: 145.75 },
  77: { maleNS: 138.79, maleSm: 219.93, femaleNS: 104.09, femaleSm: 155.11 },
  78: { maleNS: 150.31, maleSm: 237.73, femaleNS: 113.55, femaleSm: 165.8 },
  79: { maleNS: 163.01, maleSm: 257.39, femaleNS: 124.32, femaleSm: 177.87 },
  80: { maleNS: 176.97, maleSm: 279.13, femaleNS: 136.58, femaleSm: 191.29 },
  81: { maleNS: 191.13, maleSm: 303.14, femaleNS: 148.87, femaleSm: 205.86 },
  82: { maleNS: 206.42, maleSm: 329.65, femaleNS: 160.78, femaleSm: 221.2 },
  83: { maleNS: 222.93, maleSm: 358.87, femaleNS: 172.04, femaleSm: 236.65 },
  84: { maleNS: 240.77, maleSm: 391.04, femaleNS: 184.08, femaleSm: 251.23 },
  85: { maleNS: 260.03, maleSm: 426.39, femaleNS: 195.12, femaleSm: 263.57 },
};

// AHL Graded Rates (ages 50-80, tobacco differentiated)
const AHL_GRADED_RATES = {
  50: { maleNS: 57.44, maleSm: 81.81, femaleNS: 46.87, femaleSm: 73.42 },
  51: { maleNS: 62.64, maleSm: 86.58, femaleNS: 48.81, femaleSm: 78.28 },
  52: { maleNS: 69.05, maleSm: 91.35, femaleNS: 50.75, femaleSm: 83.14 },
  53: { maleNS: 74.6, maleSm: 96.12, femaleNS: 52.68, femaleSm: 88 },
  54: { maleNS: 79.59, maleSm: 100.89, femaleNS: 54.62, femaleSm: 92.86 },
  55: { maleNS: 83.45, maleSm: 105.66, femaleNS: 56.56, femaleSm: 97.72 },
  56: { maleNS: 86.13, maleSm: 111.5, femaleNS: 58.44, femaleSm: 102.91 },
  57: { maleNS: 88.12, maleSm: 117.34, femaleNS: 60.33, femaleSm: 108.1 },
  58: { maleNS: 89.47, maleSm: 123.18, femaleNS: 62.21, femaleSm: 113.3 },
  59: { maleNS: 90.23, maleSm: 129.02, femaleNS: 64.1, femaleSm: 118.49 },
  60: { maleNS: 90.45, maleSm: 134.86, femaleNS: 65.98, femaleSm: 123.68 },
  61: { maleNS: 91.31, maleSm: 143.12, femaleNS: 68.49, femaleSm: 131.61 },
  62: { maleNS: 92.18, maleSm: 151.37, femaleNS: 71.01, femaleSm: 139.53 },
  63: { maleNS: 93.04, maleSm: 159.63, femaleNS: 73.51, femaleSm: 147.46 },
  64: { maleNS: 93.91, maleSm: 167.88, femaleNS: 76.04, femaleSm: 155.38 },
  65: { maleNS: 94.77, maleSm: 176.14, femaleNS: 78.55, femaleSm: 163.31 },
  66: { maleNS: 101.51, maleSm: 187.24, femaleNS: 83.74, femaleSm: 171.92 },
  67: { maleNS: 108.25, maleSm: 198.34, femaleNS: 88.94, femaleSm: 180.53 },
  68: { maleNS: 114.98, maleSm: 209.44, femaleNS: 94.13, femaleSm: 189.13 },
  69: { maleNS: 121.72, maleSm: 220.54, femaleNS: 99.33, femaleSm: 197.74 },
  70: { maleNS: 128.46, maleSm: 231.64, femaleNS: 104.52, femaleSm: 206.35 },
  71: { maleNS: 138.46, maleSm: 248.95, femaleNS: 111.76, femaleSm: 215.85 },
  72: { maleNS: 148.46, maleSm: 266.26, femaleNS: 118.99, femaleSm: 225.35 },
  73: { maleNS: 158.46, maleSm: 283.56, femaleNS: 126.23, femaleSm: 234.84 },
  74: { maleNS: 168.46, maleSm: 300.87, femaleNS: 133.46, femaleSm: 244.34 },
  75: { maleNS: 178.46, maleSm: 318.18, femaleNS: 140.7, femaleSm: 253.84 },
  76: { maleNS: 193.2, maleSm: 351.84, femaleNS: 153.14, femaleSm: 274.87 },
  77: { maleNS: 207.95, maleSm: 385.51, femaleNS: 165.58, femaleSm: 295.89 },
  78: { maleNS: 222.69, maleSm: 419.17, femaleNS: 178.02, femaleSm: 316.92 },
  79: { maleNS: 237.44, maleSm: 452.84, femaleNS: 190.46, femaleSm: 337.94 },
  80: { maleNS: 252.18, maleSm: 486.5, femaleNS: 202.9, femaleSm: 358.97 },
};

// Royal Neighbors Level Rates (ages 50-85, tobacco differentiated)
const ROYAL_NEIGHBORS_RATES = {
  50: { maleNS: 42.58, maleSm: 56.54, femaleNS: 35.7, femaleSm: 50.35 },
  51: { maleNS: 44.1, maleSm: 58.64, femaleNS: 36.59, femaleSm: 51.66 },
  52: { maleNS: 45.62, maleSm: 60.74, femaleNS: 37.49, femaleSm: 52.97 },
  53: { maleNS: 47.2, maleSm: 62.9, femaleNS: 38.38, femaleSm: 54.34 },
  54: { maleNS: 48.72, maleSm: 65, femaleNS: 39.27, femaleSm: 55.65 },
  55: { maleNS: 50.24, maleSm: 67.1, femaleNS: 40.16, femaleSm: 56.96 },
  56: { maleNS: 51.14, maleSm: 68.57, femaleNS: 40.32, femaleSm: 57.33 },
  57: { maleNS: 51.98, maleSm: 70.09, femaleNS: 40.48, femaleSm: 57.7 },
  58: { maleNS: 52.87, maleSm: 71.56, femaleNS: 40.64, femaleSm: 58.07 },
  59: { maleNS: 53.71, maleSm: 73.08, femaleNS: 40.79, femaleSm: 58.43 },
  60: { maleNS: 54.6, maleSm: 74.55, femaleNS: 40.95, femaleSm: 58.8 },
  61: { maleNS: 56.6, maleSm: 78.12, femaleNS: 42.42, femaleSm: 60.95 },
  62: { maleNS: 58.59, maleSm: 81.69, femaleNS: 43.89, femaleSm: 63.11 },
  63: { maleNS: 60.59, maleSm: 85.26, femaleNS: 45.36, femaleSm: 65.21 },
  64: { maleNS: 62.58, maleSm: 88.83, femaleNS: 46.83, femaleSm: 67.36 },
  65: { maleNS: 64.58, maleSm: 92.4, femaleNS: 48.3, femaleSm: 69.51 },
  66: { maleNS: 68.25, maleSm: 98.7, femaleNS: 50.82, femaleSm: 73.03 },
  67: { maleNS: 71.93, maleSm: 105, femaleNS: 53.34, femaleSm: 76.55 },
  68: { maleNS: 75.6, maleSm: 111.3, femaleNS: 55.86, femaleSm: 80.12 },
  69: { maleNS: 79.28, maleSm: 117.6, femaleNS: 58.38, femaleSm: 83.63 },
  70: { maleNS: 82.95, maleSm: 123.9, femaleNS: 60.9, femaleSm: 87.15 },
  71: { maleNS: 91.14, maleSm: 134.61, femaleNS: 66.47, femaleSm: 93.35 },
  72: { maleNS: 99.33, maleSm: 145.32, femaleNS: 72.03, femaleSm: 99.54 },
  73: { maleNS: 107.52, maleSm: 156.03, femaleNS: 77.6, femaleSm: 105.74 },
  74: { maleNS: 115.71, maleSm: 166.74, femaleNS: 83.16, femaleSm: 111.93 },
  75: { maleNS: 123.9, maleSm: 177.45, femaleNS: 88.73, femaleSm: 118.13 },
  76: { maleNS: 133.88, maleSm: 188.79, femaleNS: 95.76, femaleSm: 126.42 },
  77: { maleNS: 143.85, maleSm: 200.13, femaleNS: 102.8, femaleSm: 134.72 },
  78: { maleNS: 153.83, maleSm: 211.47, femaleNS: 109.83, femaleSm: 143.01 },
  79: { maleNS: 163.8, maleSm: 222.81, femaleNS: 116.87, femaleSm: 151.31 },
  80: { maleNS: 173.78, maleSm: 234.15, femaleNS: 123.9, femaleSm: 159.6 },
  81: { maleNS: 187.32, maleSm: 252.63, femaleNS: 132.72, femaleSm: 171.36 },
  82: { maleNS: 200.87, maleSm: 271.11, femaleNS: 141.54, femaleSm: 183.12 },
  83: { maleNS: 214.41, maleSm: 289.59, femaleNS: 150.36, femaleSm: 194.88 },
  84: { maleNS: 227.96, maleSm: 308.07, femaleNS: 159.18, femaleSm: 206.64 },
  85: { maleNS: 241.5, maleSm: 326.55, femaleNS: 168, femaleSm: 218.4 },
};

// Royal Neighbors Graded Rates (ages 50-85, tobacco differentiated)
const ROYAL_NEIGHBORS_GRADED_RATES = {
  50: { maleNS: 63.89, maleSm: 75.92, femaleNS: 50.09, femaleSm: 56.28 },
  51: { maleNS: 65.42, maleSm: 77.86, femaleNS: 51.19, femaleSm: 58.01 },
  52: { maleNS: 66.94, maleSm: 79.8, femaleNS: 52.29, femaleSm: 59.75 },
  53: { maleNS: 68.46, maleSm: 81.69, femaleNS: 53.34, femaleSm: 61.43 },
  54: { maleNS: 69.98, maleSm: 83.63, femaleNS: 54.44, femaleSm: 63.16 },
  55: { maleNS: 71.51, maleSm: 85.58, femaleNS: 55.55, femaleSm: 64.89 },
  56: { maleNS: 72.56, maleSm: 87.15, femaleNS: 55.86, femaleSm: 65.57 },
  57: { maleNS: 73.55, maleSm: 88.73, femaleNS: 56.23, femaleSm: 66.26 },
  58: { maleNS: 74.6, maleSm: 90.3, femaleNS: 56.54, femaleSm: 66.89 },
  59: { maleNS: 75.6, maleSm: 91.88, femaleNS: 56.91, femaleSm: 67.57 },
  60: { maleNS: 76.65, maleSm: 93.45, femaleNS: 57.23, femaleSm: 68.25 },
  61: { maleNS: 80.43, maleSm: 97.23, femaleNS: 59.75, femaleSm: 71.72 },
  62: { maleNS: 84.21, maleSm: 101.01, femaleNS: 62.27, femaleSm: 75.18 },
  63: { maleNS: 87.99, maleSm: 104.79, femaleNS: 64.79, femaleSm: 78.65 },
  64: { maleNS: 91.77, maleSm: 108.57, femaleNS: 67.31, femaleSm: 82.11 },
  65: { maleNS: 95.55, maleSm: 112.35, femaleNS: 69.83, femaleSm: 85.58 },
  66: { maleNS: 102.69, maleSm: 120.49, femaleNS: 74.55, femaleSm: 90.93 },
  67: { maleNS: 109.83, maleSm: 128.63, femaleNS: 79.28, femaleSm: 96.29 },
  68: { maleNS: 116.97, maleSm: 136.71, femaleNS: 84, femaleSm: 101.64 },
  69: { maleNS: 124.11, maleSm: 144.85, femaleNS: 88.73, femaleSm: 107 },
  70: { maleNS: 131.25, maleSm: 152.99, femaleNS: 93.45, femaleSm: 112.35 },
  71: { maleNS: 143.22, maleSm: 168.05, femaleNS: 102.48, femaleSm: 122.43 },
  72: { maleNS: 155.19, maleSm: 183.12, femaleNS: 111.51, femaleSm: 132.51 },
  73: { maleNS: 167.16, maleSm: 198.24, femaleNS: 120.54, femaleSm: 142.59 },
  74: { maleNS: 179.13, maleSm: 213.31, femaleNS: 129.57, femaleSm: 152.67 },
  75: { maleNS: 191.1, maleSm: 228.38, femaleNS: 138.6, femaleSm: 162.75 },
  76: { maleNS: 205.8, maleSm: 242.34, femaleNS: 150.15, femaleSm: 174.3 },
  77: { maleNS: 220.5, maleSm: 256.31, femaleNS: 161.7, femaleSm: 185.85 },
  78: { maleNS: 235.2, maleSm: 270.27, femaleNS: 173.25, femaleSm: 197.4 },
  79: { maleNS: 249.9, maleSm: 284.24, femaleNS: 184.8, femaleSm: 208.95 },
  80: { maleNS: 264.6, maleSm: 298.2, femaleNS: 196.35, femaleSm: 220.5 },
  81: { maleNS: 285.18, maleSm: 319.83, femaleNS: 210, femaleSm: 236.25 },
  82: { maleNS: 305.76, maleSm: 341.46, femaleNS: 223.65, femaleSm: 252 },
  83: { maleNS: 326.34, maleSm: 363.09, femaleNS: 237.3, femaleSm: 267.75 },
  84: { maleNS: 346.92, maleSm: 384.72, femaleNS: 250.95, femaleSm: 283.5 },
  85: { maleNS: 367.5, maleSm: 406.35, femaleNS: 264.6, femaleSm: 299.25 },
};

// Gerber Guaranteed Issue Rates (ages 50-80, gender only)
const GERBER_GI_RATES = {
  50: { male: 41.47, female: 30.64 },
  51: { male: 42.89, female: 31.72 },
  52: { male: 44.33, female: 32.82 },
  53: { male: 45.78, female: 33.94 },
  54: { male: 47.25, female: 35.08 },
  55: { male: 48.74, female: 36.24 },
  56: { male: 50.25, female: 37.42 },
  57: { male: 51.78, female: 38.62 },
  58: { male: 53.33, female: 39.84 },
  59: { male: 54.9, female: 41.08 },
  60: { male: 56.49, female: 42.34 },
  61: { male: 61.38, female: 45.3 },
  62: { male: 66.31, female: 48.3 },
  63: { male: 71.27, female: 51.33 },
  64: { male: 76.27, female: 54.4 },
  65: { male: 81.31, female: 57.5 },
  66: { male: 88.2, female: 61.62 },
  67: { male: 95.15, female: 65.78 },
  68: { male: 102.15, female: 69.98 },
  69: { male: 109.2, female: 74.22 },
  70: { male: 116.3, female: 78.5 },
  71: { male: 127.8, female: 84.7 },
  72: { male: 139.4, female: 90.98 },
  73: { male: 151.1, female: 97.34 },
  74: { male: 162.9, female: 103.78 },
  75: { male: 174.8, female: 110.3 },
  76: { male: 188.9, female: 118.3 },
  77: { male: 203.2, female: 126.42 },
  78: { male: 217.7, female: 134.66 },
  79: { male: 232.4, female: 143.02 },
  80: { male: 271.7, female: 176.7 },
};

// Mutual of Omaha Level Rates (ages 45-85, tobacco differentiated)
const MUTUAL_OF_OMAHA_RATES = {
  45: { maleNS: 26.86, maleSm: 37.1, femaleNS: 21.8, femaleSm: 29.28 },
  46: { maleNS: 27.5, maleSm: 37.62, femaleNS: 22.27, femaleSm: 29.66 },
  47: { maleNS: 28.24, maleSm: 38.29, femaleNS: 22.69, femaleSm: 29.91 },
  48: { maleNS: 29.06, maleSm: 39.03, femaleNS: 23.2, femaleSm: 30.71 },
  49: { maleNS: 29.99, maleSm: 39.88, femaleNS: 23.91, femaleSm: 31.14 },
  50: { maleNS: 30.87, maleSm: 39.4, femaleNS: 23.71, femaleSm: 31.84 },
  51: { maleNS: 31.73, maleSm: 40.75, femaleNS: 24.57, femaleSm: 33.45 },
  52: { maleNS: 32.44, maleSm: 42.21, femaleNS: 25.41, femaleSm: 34.69 },
  53: { maleNS: 33.18, maleSm: 46.07, femaleNS: 26.11, femaleSm: 36.18 },
  54: { maleNS: 34.87, maleSm: 47.94, femaleNS: 26.83, femaleSm: 37.6 },
  55: { maleNS: 36.79, maleSm: 50.08, femaleNS: 27.53, femaleSm: 39.79 },
  56: { maleNS: 38.42, maleSm: 52.53, femaleNS: 28.52, femaleSm: 41.07 },
  57: { maleNS: 39.98, maleSm: 54.89, femaleNS: 30.09, femaleSm: 42.65 },
  58: { maleNS: 41.59, maleSm: 57.35, femaleNS: 31.04, femaleSm: 43.93 },
  59: { maleNS: 43.41, maleSm: 60.13, femaleNS: 32.02, femaleSm: 45.4 },
  60: { maleNS: 45.57, maleSm: 63.41, femaleNS: 33.33, femaleSm: 47.17 },
  61: { maleNS: 48.55, maleSm: 67.5, femaleNS: 35.18, femaleSm: 49.75 },
  62: { maleNS: 51.53, maleSm: 72.49, femaleNS: 36.92, femaleSm: 52.33 },
  63: { maleNS: 53.95, maleSm: 76.13, femaleNS: 38.78, femaleSm: 54.9 },
  64: { maleNS: 56.6, maleSm: 81.34, femaleNS: 40.63, femaleSm: 57.48 },
  65: { maleNS: 59.86, maleSm: 86.1, femaleNS: 42.48, femaleSm: 60.06 },
  66: { maleNS: 63.65, maleSm: 92.38, femaleNS: 45.21, femaleSm: 64.06 },
  67: { maleNS: 67.39, maleSm: 98.68, femaleNS: 47.93, femaleSm: 67.86 },
  68: { maleNS: 71.5, maleSm: 104.97, femaleNS: 50.66, femaleSm: 71.9 },
  69: { maleNS: 75.94, maleSm: 110.4, femaleNS: 53.49, femaleSm: 75.56 },
  70: { maleNS: 80.23, maleSm: 117.03, femaleNS: 56.22, femaleSm: 80.08 },
  71: { maleNS: 84.95, maleSm: 125.62, femaleNS: 59.55, femaleSm: 85.19 },
  72: { maleNS: 90.77, maleSm: 132.83, femaleNS: 62.08, femaleSm: 91.53 },
  73: { maleNS: 96.92, maleSm: 142.57, femaleNS: 67.8, femaleSm: 96.99 },
  74: { maleNS: 102.99, maleSm: 150.16, femaleNS: 72.56, femaleSm: 102.99 },
  75: { maleNS: 108.73, maleSm: 159.26, femaleNS: 77.76, femaleSm: 108.71 },
  76: { maleNS: 116.67, maleSm: 176.22, femaleNS: 84.32, femaleSm: 119.01 },
  77: { maleNS: 124.64, maleSm: 191.87, femaleNS: 90.23, femaleSm: 128.46 },
  78: { maleNS: 133.63, maleSm: 205.46, femaleNS: 95.77, femaleSm: 138.54 },
  79: { maleNS: 141.93, maleSm: 217.08, femaleNS: 101.36, femaleSm: 147.19 },
  80: { maleNS: 153.4, maleSm: 228.16, femaleNS: 107, femaleSm: 148.24 },
  81: { maleNS: 164.88, maleSm: 242.26, femaleNS: 115.74, femaleSm: 161.61 },
  82: { maleNS: 176.36, maleSm: 264.29, femaleNS: 124.44, femaleSm: 176.8 },
  83: { maleNS: 188.56, maleSm: 282.36, femaleNS: 132.7, femaleSm: 188.27 },
  84: { maleNS: 200.76, maleSm: 298.41, femaleNS: 140.84, femaleSm: 198.17 },
  85: { maleNS: 212.96, maleSm: 314.31, femaleNS: 149.1, femaleSm: 212.52 },
};

// Mutual of Omaha Graded Rates (ages 45-80, tobacco differentiated but same values)
const MUTUAL_OF_OMAHA_GRADED_RATES = {
  45: { maleNS: 37.89, maleSm: 37.89, femaleNS: 28.56, femaleSm: 28.56 },
  46: { maleNS: 38.9, maleSm: 38.9, femaleNS: 28.9, femaleSm: 28.9 },
  47: { maleNS: 39.8, maleSm: 39.8, femaleNS: 29.13, femaleSm: 29.13 },
  48: { maleNS: 41.37, maleSm: 41.37, femaleNS: 30.25, femaleSm: 30.25 },
  49: { maleNS: 42.38, maleSm: 42.38, femaleNS: 30.7, femaleSm: 30.7 },
  50: { maleNS: 43.5, maleSm: 43.5, femaleNS: 31.26, femaleSm: 31.26 },
  51: { maleNS: 44.51, maleSm: 44.51, femaleNS: 32.83, femaleSm: 32.83 },
  52: { maleNS: 46.65, maleSm: 46.65, femaleNS: 33.96, femaleSm: 33.96 },
  53: { maleNS: 48.78, maleSm: 48.78, femaleNS: 35.53, femaleSm: 35.53 },
  54: { maleNS: 49.9, maleSm: 49.9, femaleNS: 37.1, femaleSm: 37.1 },
  55: { maleNS: 51.48, maleSm: 51.48, femaleNS: 39.23, femaleSm: 39.23 },
  56: { maleNS: 51.93, maleSm: 51.93, femaleNS: 40.81, femaleSm: 40.81 },
  57: { maleNS: 54.06, maleSm: 54.06, femaleNS: 42.94, femaleSm: 42.94 },
  58: { maleNS: 55.18, maleSm: 55.18, femaleNS: 45.07, femaleSm: 45.07 },
  59: { maleNS: 57.32, maleSm: 57.32, femaleNS: 46.65, femaleSm: 46.65 },
  60: { maleNS: 59.45, maleSm: 59.45, femaleNS: 48.78, femaleSm: 48.78 },
  61: { maleNS: 62.6, maleSm: 62.6, femaleNS: 50.35, femaleSm: 50.35 },
  62: { maleNS: 64.73, maleSm: 64.73, femaleNS: 53.05, femaleSm: 53.05 },
  63: { maleNS: 66.86, maleSm: 66.86, femaleNS: 54.62, femaleSm: 54.62 },
  64: { maleNS: 69, maleSm: 69, femaleNS: 56.19, femaleSm: 56.19 },
  65: { maleNS: 71.58, maleSm: 71.58, femaleNS: 57.77, femaleSm: 57.77 },
  66: { maleNS: 75.29, maleSm: 75.29, femaleNS: 60.46, femaleSm: 60.46 },
  67: { maleNS: 80.68, maleSm: 80.68, femaleNS: 63.16, femaleSm: 63.16 },
  68: { maleNS: 85.96, maleSm: 85.96, femaleNS: 67.87, femaleSm: 67.87 },
  69: { maleNS: 89.55, maleSm: 89.55, femaleNS: 71.58, femaleSm: 71.58 },
  70: { maleNS: 93.03, maleSm: 93.03, femaleNS: 75.29, femaleSm: 75.29 },
  71: { maleNS: 96.96, maleSm: 96.96, femaleNS: 81.13, femaleSm: 81.13 },
  72: { maleNS: 101.23, maleSm: 101.23, femaleNS: 87.53, femaleSm: 87.53 },
  73: { maleNS: 105.72, maleSm: 105.72, femaleNS: 93.37, femaleSm: 93.37 },
  74: { maleNS: 113.47, maleSm: 113.47, femaleNS: 97.64, femaleSm: 97.64 },
  75: { maleNS: 121.11, maleSm: 121.11, femaleNS: 104.6, femaleSm: 104.6 },
  76: { maleNS: 128.75, maleSm: 128.75, femaleNS: 111.68, femaleSm: 111.68 },
  77: { maleNS: 136.5, maleSm: 136.5, femaleNS: 118.64, femaleSm: 118.64 },
  78: { maleNS: 144.14, maleSm: 144.14, femaleNS: 123.25, femaleSm: 123.25 },
  79: { maleNS: 151.77, maleSm: 151.77, femaleNS: 127.74, femaleSm: 127.74 },
  80: { maleNS: 159.52, maleSm: 159.52, femaleNS: 132.23, femaleSm: 132.23 },
};

const calculateMonthlyPremium = (
  carrier,
  age,
  gender,
  tobacco,
  faceAmount,
  planType = "Level"
) => {
  const config = CARRIER_CONFIG[carrier];
  if (!config) return null;

  let rateTable, rate;
  const isMale = gender === "Male";
  const isSmoker = tobacco === true;

  // Helper function to get rate from table with tobacco differentiation
  const getRateWithTobacco = (table) => {
    if (!table) return null;
    return isMale
      ? isSmoker
        ? table.maleSm
        : table.maleNS
      : isSmoker
      ? table.femaleSm
      : table.femaleNS;
  };

  // Helper function to get rate from table without tobacco (male/female only)
  const getRateNoTobacco = (table) => {
    if (!table) return null;
    return isMale ? table.male : table.female;
  };

  switch (carrier) {
    case "Aflac":
      if (planType === "Modified") {
        rateTable = AFLAC_MODIFIED_RATES[age];
        rate = getRateNoTobacco(rateTable);
      } else {
        rateTable = AFLAC_RATES[age];
        rate = getRateWithTobacco(rateTable);
      }
      break;

    case "SBLI":
      if (planType === "Modified") {
        rateTable = SBLI_MODIFIED_RATES[age];
        rate = getRateWithTobacco(rateTable);
      } else {
        rateTable = SBLI_RATES[age];
        rate = getRateWithTobacco(rateTable);
      }
      break;

    case "CICA":
      if (planType === "Guaranteed Issue") {
        rateTable = CICA_GI_RATES[age];
        rate = getRateNoTobacco(rateTable);
      } else {
        rateTable = CICA_RATES[age];
        rate = getRateNoTobacco(rateTable);
      }
      break;

    case "GTL":
      rateTable = GTL_RATES[age];
      rate = getRateNoTobacco(rateTable);
      break;

    case "TransAmerica":
      if (planType === "Graded") {
        rateTable = TRANSAMERICA_GRADED_RATES[age];
        rate = getRateWithTobacco(rateTable);
      } else {
        rateTable = TRANSAMERICA_RATES[age];
        rate = getRateWithTobacco(rateTable);
      }
      break;

    case "American Amicable":
      if (planType === "Graded") {
        rateTable = AMAM_GRADED_RATES[age];
        rate = getRateWithTobacco(rateTable);
      } else if (planType === "ROP") {
        rateTable = AMAM_ROP_RATES[age];
        rate = getRateWithTobacco(rateTable);
      } else {
        rateTable = AMAM_RATES[age];
        rate = getRateWithTobacco(rateTable);
      }
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

    case "AHL":
      if (planType === "Graded") {
        rateTable = AHL_GRADED_RATES[age];
      } else {
        rateTable = AHL_RATES[age];
      }
      rate = getRateWithTobacco(rateTable);
      break;

    case "Royal Neighbors":
      if (planType === "Graded") {
        rateTable = ROYAL_NEIGHBORS_GRADED_RATES[age];
      } else {
        rateTable = ROYAL_NEIGHBORS_RATES[age];
      }
      rate = getRateWithTobacco(rateTable);
      break;

    case "Gerber":
      rateTable = GERBER_GI_RATES[age];
      rate = getRateNoTobacco(rateTable);
      break;

    case "Mutual of Omaha": {
      if (planType === "Graded") {
        rateTable = MUTUAL_OF_OMAHA_GRADED_RATES[age];
        if (!rateTable) return null;
        rate = getRateWithTobacco(rateTable);
        if (!rate) return null;
        // Graded plan uses different fee (12 instead of 36)
        const units = faceAmount / 1000;
        const annualBase = rate * units;
        const totalAnnual = annualBase + 12; // Special graded fee
        const withFactor = totalAnnual + totalAnnual * 0.089;
        return Math.round((withFactor / 12) * 100) / 100;
      } else {
        rateTable = MUTUAL_OF_OMAHA_RATES[age];
        rate = getRateWithTobacco(rateTable);
      }
      break;
    }

    default:
      return null;
  }

  if (!rate) return null;

  const units = faceAmount / 1000;
  const annualBase = rate * units;

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
  cyan: {
    bg: "bg-cyan-50",
    text: "text-cyan-600",
    border: "border-cyan-200",
    icon: "text-cyan-500",
  },
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
    icon: "text-emerald-500",
  },
  purple: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    border: "border-purple-200",
    icon: "text-purple-500",
  },
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
    icon: "text-blue-500",
  },
  orange: {
    bg: "bg-orange-50",
    text: "text-orange-600",
    border: "border-orange-200",
    icon: "text-orange-500",
  },
  green: {
    bg: "bg-green-50",
    text: "text-green-600",
    border: "border-green-200",
    icon: "text-green-500",
  },
  indigo: {
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    border: "border-indigo-200",
    icon: "text-indigo-500",
  },
  violet: {
    bg: "bg-violet-50",
    text: "text-violet-600",
    border: "border-violet-200",
    icon: "text-violet-500",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
    icon: "text-amber-500",
  },
  red: {
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
    icon: "text-red-500",
  },
};

// Logo Component
const Logo = ({ size = "default" }) => {
  const sizeClasses = { small: "h-6", default: "h-8", large: "h-12" };
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
  <div className="flex items-start justify-between mb-2">
    <div className="flex items-start gap-2">
      <div className="section-icon p-1.5">
        <Icon size={16} className="text-cyan-600" strokeWidth={2} />
      </div>
      <div>
        <h2 className="section-title text-base">{title}</h2>
        {subtitle && <p className="section-subtitle text-xs">{subtitle}</p>}
      </div>
    </div>
    {action}
  </div>
);

// Input Component
const Input = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  icon: Icon,
  className = "",
  dark = false,
  ...props
}) => (
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
const Select = ({
  label,
  value,
  onChange,
  options,
  className = "",
  dark = false,
}) => (
  <div className={`flex flex-col gap-2 ${className}`}>
    {label && <label className={dark ? "label-dark" : "label"}>{label}</label>}
    <select
      value={value}
      onChange={onChange}
      className={
        dark ? "input-dark appearance-none cursor-pointer pr-10" : "select"
      }
    >
      <option value="">Select...</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

// Yes/No Toggle Component
const YesNo = ({ label, value, onChange, compact = false }) => (
  <div
    className={`bg-white rounded-lg border border-slate-100 shadow-sm ${
      compact ? "p-2.5" : "p-3"
    } hover:border-slate-200 transition-all`}
  >
    <div className="flex items-center justify-between gap-3">
      <p
        className={`font-medium text-slate-700 flex-1 ${
          compact ? "text-xs" : "text-sm"
        }`}
      >
        {label}
      </p>
      <div className="flex gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={
            value === true
              ? "toggle-btn toggle-btn-yes"
              : "toggle-btn toggle-btn-inactive"
          }
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={
            value === false
              ? "toggle-btn toggle-btn-no"
              : "toggle-btn toggle-btn-inactive"
          }
        >
          No
        </button>
      </div>
    </div>
  </div>
);

// Step Indicator Component
const StepIndicator = ({ currentStep, totalSteps, labels = [] }) => (
  <div className="flex items-center justify-center gap-1.5">
    {[...Array(totalSteps)].map((_, idx) => (
      <React.Fragment key={idx}>
        <div className="flex flex-col items-center gap-1">
          <div
            className={`step-dot ${
              idx + 1 === currentStep
                ? "step-dot-current"
                : idx + 1 < currentStep
                ? "step-dot-complete"
                : "step-dot-pending"
            }`}
          >
            {idx + 1 < currentStep ? <CheckCircle size={14} /> : idx + 1}
          </div>
        </div>
        {idx < totalSteps - 1 && (
          <div
            className={`step-connector ${
              idx + 1 < currentStep
                ? "step-connector-complete"
                : "step-connector-pending"
            }`}
          />
        )}
      </React.Fragment>
    ))}
  </div>
);

// Carrier Logo Component
const CarrierLogo = ({ carrier, size = "md", className = "" }) => {
  const sizeClasses = {
    xs: "h-8 max-w-[100px]",
    sm: "h-12 max-w-[140px]",
    md: "h-14 max-w-[160px]",
    lg: "h-16 max-w-[200px]",
    xl: "h-20 max-w-[240px]",
  };

  const logoSrc = CARRIER_LOGOS[carrier];

  if (!logoSrc) {
    return (
      <span className={`font-bold text-slate-700 ${className}`}>{carrier}</span>
    );
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
          <button
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {copied ? (
              <CheckCircle size={16} className="text-emerald-500" />
            ) : (
              <Copy size={16} className="text-slate-400 hover:text-cyan-500" />
            )}
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
    <span
      className={`badge ${
        styles[status] || "bg-slate-100 text-slate-600 border-slate-200"
      }`}
    >
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
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Welcome Back
            </h2>
            <p className="text-slate-500">
              Enter your credentials to access the admin portal
            </p>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-accent"
            >
              {loading ? (
                <RefreshCw size={20} className="animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
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
  const [sortMethod, setSortMethod] = useState("lowest");
  const [filterPlanType, setFilterPlanType] = useState("All");
  const totalSteps = 8;

  const update = (field, val) => setData((prev) => ({ ...prev, [field]: val }));

  const stepLabels = [
    "Carrier",
    "Policy",
    "Personal",
    "Beneficiary",
    "Health",
    "Coverage",
    "Payment",
    "Review",
  ];

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
      return {
        status: "standard",
        plan: "Guaranteed Issue",
        message: `${data.carrier} - Guaranteed Issue`,
      };
    }

    const isKnockout = [data.q1, data.q2, data.q3].some((a) => a === true);
    if (isKnockout) {
      return {
        status: "ineligible",
        plan: "Not Eligible",
        message: data.carrier
          ? `${data.carrier} - Not Eligible`
          : "Not Eligible",
      };
    }

    const isROP = [
      data.q4,
      data.q5,
      data.q6,
      data.q7a,
      data.q7b,
      data.q7c,
      data.q7d,
    ].some((a) => a === true);
    if (isROP) {
      return {
        status: "modified",
        plan: "Return of Premium",
        message: data.carrier
          ? `${data.carrier} - Return of Premium`
          : "Return of Premium",
      };
    }

    const isGraded = [data.q8a, data.q8b, data.q8c].some((a) => a === true);
    if (isGraded) {
      return {
        status: "graded",
        plan: "Graded",
        message: data.carrier ? `${data.carrier} - Graded` : "Graded",
      };
    }

    return {
      status: "standard",
      plan: "Level",
      message: data.carrier ? `${data.carrier} - Level` : "Level",
    };
  }, [data]);

  // Auto-switch to Corebridge when any health question is "Yes"
  useEffect(() => {
    const healthQuestions = [
      data.q1,
      data.q2,
      data.q3,
      data.q4,
      data.q5,
      data.q6,
      data.q7a,
      data.q7b,
      data.q7c,
      data.q7d,
      data.q8a,
      data.q8b,
      data.q8c,
    ];
    const anyYes = healthQuestions.some((q) => q === true);

    if (anyYes && data.carrier !== "Corebridge") {
      update("carrier", "Corebridge");
      update("planType", "Guaranteed Issue");
      const age = parseInt(data.age);
      if (age && data.gender && data.faceAmount) {
        const corebridgePremium = calculateMonthlyPremium(
          "Corebridge",
          age,
          data.gender,
          data.tobacco,
          data.faceAmount,
          "Guaranteed Issue"
        );
        if (corebridgePremium) {
          update("monthlyPremium", corebridgePremium.toFixed(2));
        }
      }
    }
  }, [
    data.q1,
    data.q2,
    data.q3,
    data.q4,
    data.q5,
    data.q6,
    data.q7a,
    data.q7b,
    data.q7c,
    data.q7d,
    data.q8a,
    data.q8b,
    data.q8c,
    data.carrier,
    data.age,
    data.gender,
    data.tobacco,
    data.faceAmount,
  ]);

  // Step 1: Carrier Selection
  const renderCarrierSelect = () => (
    <div className="animate-slide-up">
      <SectionTitle
        icon={Shield}
        title="Select Your Carrier"
        subtitle="Choose from our trusted insurance partners"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.keys(CARRIERS).map((c) => (
          <button
            key={c}
            onClick={() => {
              update("carrier", c);
              update("planType", "");
            }}
            className={`relative p-4 rounded-xl border-2 transition-all duration-300 group ${
              data.carrier === c
                ? "border-cyan-500 bg-cyan-50 shadow-lg glow-cyan"
                : "border-slate-200 bg-white hover:border-cyan-300 hover:shadow-md"
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 flex items-center justify-center">
                <CarrierLogo carrier={c} size="sm" />
              </div>
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                  data.carrier === c
                    ? "border-cyan-500 bg-cyan-500"
                    : "border-slate-300 group-hover:border-cyan-400"
                }`}
              >
                {data.carrier === c && (
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                )}
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

    // Calculate quotes using default/first plan type for each carrier (for comparison grid)
    const carrierQuotes =
      age && data.gender
        ? {
            Aflac: calculateMonthlyPremium(
              "Aflac",
              age,
              data.gender,
              data.tobacco,
              data.faceAmount,
              CARRIERS["Aflac"][0] // Level
            ),
            SBLI: calculateMonthlyPremium(
              "SBLI",
              age,
              data.gender,
              data.tobacco,
              data.faceAmount,
              CARRIERS["SBLI"][0] // Level
            ),
            CICA: calculateMonthlyPremium(
              "CICA",
              age,
              data.gender,
              data.tobacco,
              data.faceAmount,
              CARRIERS["CICA"][0] // Level
            ),
            GTL: calculateMonthlyPremium(
              "GTL",
              age,
              data.gender,
              data.tobacco,
              data.faceAmount,
              CARRIERS["GTL"][0] // Graded
            ),
            TransAmerica: calculateMonthlyPremium(
              "TransAmerica",
              age,
              data.gender,
              data.tobacco,
              data.faceAmount,
              CARRIERS["TransAmerica"][0] // Level
            ),
            Corebridge: calculateMonthlyPremium(
              "Corebridge",
              age,
              data.gender,
              data.tobacco,
              data.faceAmount,
              CARRIERS["Corebridge"][0] // Guaranteed Issue
            ),
            "American Amicable": calculateMonthlyPremium(
              "American Amicable",
              age,
              data.gender,
              data.tobacco,
              data.faceAmount,
              CARRIERS["American Amicable"][0] // Level
            ),
            AHL: calculateMonthlyPremium(
              "AHL",
              age,
              data.gender,
              data.tobacco,
              data.faceAmount,
              CARRIERS["AHL"][0] // Level
            ),
            "Royal Neighbors": calculateMonthlyPremium(
              "Royal Neighbors",
              age,
              data.gender,
              data.tobacco,
              data.faceAmount,
              CARRIERS["Royal Neighbors"][0] // Level
            ),
            Gerber: calculateMonthlyPremium(
              "Gerber",
              age,
              data.gender,
              data.tobacco,
              data.faceAmount,
              CARRIERS["Gerber"][0] // Guaranteed Issue
            ),
            "Mutual of Omaha": calculateMonthlyPremium(
              "Mutual of Omaha",
              age,
              data.gender,
              data.tobacco,
              data.faceAmount,
              CARRIERS["Mutual of Omaha"][0] // Level
            ),
          }
        : {};

    // Calculate quote for selected carrier + plan type
    const selectedCarrierQuote =
      data.carrier && age && data.gender
        ? calculateMonthlyPremium(
            data.carrier,
            age,
            data.gender,
            data.tobacco,
            data.faceAmount,
            data.planType || CARRIERS[data.carrier][0]
          )
        : null;

    return (
      <div className="animate-slide-up">
        {/* Clean Policy Control Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6 p-1">
          <div className="flex flex-wrap lg:flex-nowrap items-center divide-x divide-slate-100">
            
            {/* 1. Date of Birth Section */}
            <div className="px-4 py-2 flex-shrink-0 flex items-center gap-3">
              <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                <Calendar size={18} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Birth Date</label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={data.dob}
                    onChange={handleDobChange}
                    className="border-none p-0 text-sm font-semibold text-slate-700 focus:ring-0 w-32 font-mono"
                  />
                  {data.age && (
                    <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-md">
                      {data.age} yrs
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Gender Selection */}
            <div className="px-4 py-2 flex-shrink-0">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Gender</label>
              <div className="flex gap-1">
                 {["Male", "Female"].map((g) => (
                  <button
                    key={g}
                    onClick={() => update("gender", g)}
                    className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all border ${
                      data.gender === g
                        ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Tobacco Selection */}
            <div className="px-4 py-2 flex-shrink-0">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Tobacco</label>
              <div className="flex gap-1">
                <button
                  onClick={() => update("tobacco", false)}
                  className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all border ${
                    !data.tobacco
                       ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  No
                </button>
                <button
                  onClick={() => update("tobacco", true)}
                  className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all border ${
                    data.tobacco
                      ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  Yes
                </button>
              </div>
            </div>

            {/* 4. Coverage Slider */}
            <div className="px-6 py-2 flex-grow min-w-[300px]">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Coverage Amount</label>
                <span className="text-lg font-bold text-slate-800 tracking-tight">
                  ${data.faceAmount.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="5000"
                max="50000"
                step="1000"
                value={data.faceAmount}
                onChange={(e) => update("faceAmount", parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-800 hover:accent-cyan-600 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Policy Type + Premium Display - Combined Row */}
        {data.carrier && (
          <div className="mb-3 flex flex-wrap gap-3 items-stretch">
            {/* Policy Type Selection */}
            <div className="flex-1 min-w-[200px]">
              <label className="label mb-1 block text-sm">Policy Type</label>
              <div className="flex gap-2">
                {CARRIERS[data.carrier].map((policy) => {
                  const planQuote =
                    age && data.gender
                      ? calculateMonthlyPremium(
                          data.carrier,
                          age,
                          data.gender,
                          data.tobacco,
                          data.faceAmount,
                          policy
                        )
                      : null;
                  return (
                    <button
                      key={policy}
                      onClick={() => {
                        update("planType", policy);
                        if (planQuote) {
                          update("monthlyPremium", planQuote.toFixed(2));
                        }
                      }}
                      className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all flex flex-col items-center ${
                        data.planType === policy
                          ? "bg-cyan-500 text-white shadow-lg glow-cyan"
                          : "bg-white border-2 border-slate-200 text-slate-600 hover:border-cyan-300"
                      }`}
                    >
                      <span>{policy}</span>
                      {planQuote && (
                        <span
                          className={`text-xs ${
                            data.planType === policy
                              ? "text-cyan-100"
                              : "text-cyan-600 font-bold"
                          }`}
                        >
                          ${planQuote.toFixed(2)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Premium Display - Compact */}
            {selectedCarrierQuote && (
              <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-xl px-4 py-2 border border-emerald-200 flex items-center gap-4">
                <div>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                    Monthly Premium
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-emerald-700">
                      ${data.monthlyPremium || selectedCarrierQuote.toFixed(2)}
                    </span>
                    <span className="text-emerald-600 text-sm">/mo</span>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <CarrierLogo carrier={data.carrier} size="sm" />
                  <p className="text-xs text-emerald-600 mt-1">
                    {data.planType || "Select plan"}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Carrier Quote Comparison - Professional Grid */}
        {data.age && data.gender && (
          <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header & Controls */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} className="text-cyan-400" />
                  <span className="text-sm font-semibold text-white">
                    Compare Rates
                  </span>
                </div>

                {/* Sort & Filter Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Plan Filter */}
                  <select
                    value={filterPlanType}
                    onChange={(e) => setFilterPlanType(e.target.value)}
                    className="bg-slate-700 text-white text-xs font-medium border-none rounded-lg py-1.5 pl-2 pr-6 focus:ring-1 focus:ring-cyan-500"
                  >
                    <option value="All">All Plans</option>
                    <option value="Level">Level</option>
                    <option value="Graded">Graded</option>
                    <option value="Modified">Modified</option>
                    <option value="Guaranteed Issue">Guaranteed Issue</option>
                  </select>

                  {/* Sort Control */}
                  <div className="flex bg-slate-900/50 p-0.5 rounded-lg border border-slate-600/50">
                    <button
                      onClick={() => setSortMethod("lowest")}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${
                        sortMethod === "lowest"
                          ? "bg-cyan-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                      title="Lowest Price"
                    >
                      Lowest
                    </button>
                    <button
                      onClick={() => setSortMethod("highest")}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${
                        sortMethod === "highest"
                          ? "bg-cyan-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                      title="Highest Price"
                    >
                      Highest
                    </button>
                    <button
                      onClick={() => setSortMethod("alpha")}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${
                        sortMethod === "alpha"
                          ? "bg-cyan-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                      title="Alphabetical"
                    >
                      A-Z
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Carrier Grid - Premium 2-Row Layout */}
            <div className="p-4 bg-slate-50/50">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {Object.keys(CARRIERS)
                  .filter((carrier) => {
                    // Filter logic
                    if (filterPlanType === "All") return true;
                    return CARRIERS[carrier].includes(filterPlanType);
                  })
                  .sort((a, b) => {
                    // Sort logic
                    if (sortMethod === "alpha") return a.localeCompare(b);
                    
                    const quoteA = carrierQuotes[a] || (sortMethod === "lowest" ? 999999 : -1);
                    const quoteB = carrierQuotes[b] || (sortMethod === "lowest" ? 999999 : -1);
                    
                    if (sortMethod === "lowest") return quoteA - quoteB;
                    if (sortMethod === "highest") return quoteB - quoteA;
                    return 0;
                  })
                  .map((carrier) => {
                    // Determine which plan type to use for the quote
                    // If filtering by specific plan, use that plan. Otherwise use default logic or current selection.
                    let displayQuote = carrierQuotes[carrier];
                    
                    // Re-calculate if a specific filter is applied, to show THAT plan's price
                    if (filterPlanType !== "All" && CARRIERS[carrier].includes(filterPlanType)) {
                        const calculated = calculateMonthlyPremium(
                            carrier, 
                            age, 
                            data.gender, 
                            data.tobacco, 
                            data.faceAmount, 
                            filterPlanType
                        );
                        if (calculated) displayQuote = calculated;
                    }

                    const isSelected = data.carrier === carrier;
                    const isLowest = displayQuote && Object.keys(CARRIERS).every(c => {
                         const cQuote = carrierQuotes[c]; // This comparison logic for "lowest badge" is simplified
                         return !cQuote || displayQuote <= cQuote;
                    });
                  
                    return (
                      <button
                        key={carrier}
                        onClick={() => {
                          update("carrier", carrier);
                          // If filtering, auto-select that plan type
                          update("planType", filterPlanType !== "All" ? filterPlanType : "");
                          if (displayQuote) update("monthlyPremium", displayQuote.toFixed(2));
                        }}
                        disabled={!displayQuote}
                        className={`relative group flex flex-col items-center justify-between p-2 h-24 rounded-xl transition-all duration-200 ${
                          isSelected
                            ? "bg-cyan-50 border-2 border-cyan-500 shadow-sm z-10"
                            : displayQuote
                            ? "bg-white border border-slate-200 hover:border-cyan-300 hover:shadow-md hover:-translate-y-0.5"
                            : "bg-slate-50 border border-slate-100 opacity-40 grayscale cursor-not-allowed"
                        }`}
                      >
                         {/* Selected Checkmark */}
                        {isSelected && (
                        <div className="absolute top-1 right-1 text-cyan-500">
                          <CheckCircle size={14} fill="currentColor" className="text-white" />
                        </div>
                        )}

                        {/* Lowest Price Badge - Only show if sorting by lowest or default */}
                        {sortMethod === "lowest" && isLowest && !isSelected && (
                          <div className="absolute -top-1.5 -right-1 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-px rounded-full shadow-sm z-20">
                            BEST
                          </div>
                        )}
                        
                        {/* Logo Container - No Inversion */}
                        <div className="flex-1 flex items-center justify-center w-full px-1">
                          <CarrierLogo carrier={carrier} size="md" />
                        </div>
                        
                        {/* Price Tag - Smaller Font */}
                        {displayQuote ? (
                          <div className="w-full text-center mt-1 pt-1 border-t border-slate-100">
                            <div className="flex items-baseline justify-center gap-0.5">
                              <span className="text-[10px] text-slate-400 font-medium">$</span>
                              <span className={`text-base font-bold tracking-tight ${isSelected ? "text-cyan-700" : "text-slate-700"}`}>
                                {displayQuote.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full text-center mt-auto">
                            <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded-full">N/A</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
              </div>
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

      <div className="space-y-3">
        {/* Name Row */}
        <div className="grid grid-cols-6 gap-3">
          <Input
            label="First Name"
            value={data.firstName}
            onChange={(e) => update("firstName", e.target.value)}
            required
            className="col-span-2"
          />
          <Input
            label="Middle"
            value={data.middleName}
            onChange={(e) => update("middleName", e.target.value)}
            className="col-span-1"
          />
          <Input
            label="Last Name"
            value={data.lastName}
            onChange={(e) => update("lastName", e.target.value)}
            required
            className="col-span-2"
          />
          <Input
            label="Phone"
            type="tel"
            value={data.phone}
            onChange={(e) => update("phone", e.target.value)}
            required
            className="col-span-1"
          />
        </div>

        {/* Address Row */}
        <div className="grid grid-cols-6 gap-3">
          <Input
            label="Street Address"
            value={data.address}
            onChange={(e) => update("address", e.target.value)}
            className="col-span-3"
          />
          <Input
            label="City"
            value={data.city}
            onChange={(e) => update("city", e.target.value)}
            className="col-span-2"
          />
          <Select
            label="State"
            options={STATES}
            value={data.state}
            onChange={(e) => update("state", e.target.value)}
            className="col-span-1"
          />
        </div>

        {/* Demographics Row */}
        <div className="grid grid-cols-6 gap-3">
          <Input
            label="Zip Code"
            value={data.zip}
            onChange={(e) => update("zip", e.target.value)}
            className="col-span-1"
          />
          <Select
            label="Birth State"
            options={STATES}
            value={data.stateOfBirth}
            onChange={(e) => update("stateOfBirth", e.target.value)}
            className="col-span-1"
          />
          <Input
            label="SSN"
            placeholder="XXX-XX-XXXX"
            value={data.ssn}
            onChange={(e) => update("ssn", e.target.value)}
            required
            className="col-span-2"
          />
          <Select
            label="Height"
            options={HEIGHT_OPTIONS}
            value={data.height}
            onChange={(e) => update("height", e.target.value)}
            className="col-span-1"
          />
          <Input
            label="Weight (lbs)"
            type="number"
            value={data.weight}
            onChange={(e) => update("weight", parseInt(e.target.value) || 0)}
            className="col-span-1"
          />
        </div>

        {/* Owner Section */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <p className="font-bold text-slate-700 mb-3 flex items-center gap-2 text-sm">
            <Users size={16} className="text-slate-500" />
            Policy Owner (if different from insured)
          </p>
          <div className="grid grid-cols-4 gap-3">
            <Input
              label="Owner Name"
              value={data.ownerName}
              onChange={(e) => update("ownerName", e.target.value)}
            />
            <Select
              label="Relationship"
              options={RELATIONSHIPS}
              value={data.ownerRel}
              onChange={(e) => update("ownerRel", e.target.value)}
            />
            <Input
              label="Owner SSN"
              value={data.ownerSsn}
              onChange={(e) => update("ownerSsn", e.target.value)}
            />
            <Input
              label="Owner Address"
              value={data.ownerAddress}
              onChange={(e) => update("ownerAddress", e.target.value)}
            />
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

      <div className="grid grid-cols-2 gap-4">
        {/* Primary */}
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-4 border-2 border-cyan-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
              <Heart size={16} className="text-white" fill="currentColor" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                Primary Beneficiary
              </h3>
              <p className="text-xs text-slate-500">Required</p>
            </div>
          </div>
          <div className="space-y-3">
            <Input
              label="Full Name"
              value={data.primaryBenName}
              onChange={(e) => update("primaryBenName", e.target.value)}
              required
            />
            <Select
              label="Relationship"
              options={RELATIONSHIPS}
              value={data.primaryBenRel}
              onChange={(e) => update("primaryBenRel", e.target.value)}
            />
          </div>
        </div>

        {/* Contingent */}
        <div className="bg-slate-50 rounded-xl p-4 border-2 border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-slate-400 rounded-lg flex items-center justify-center">
              <Users size={16} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                Contingent Beneficiary
              </h3>
              <p className="text-xs text-slate-500">Optional backup</p>
            </div>
          </div>
          <div className="space-y-3">
            <Input
              label="Full Name"
              value={data.contingentBenName}
              onChange={(e) => update("contingentBenName", e.target.value)}
            />
            <Select
              label="Relationship"
              options={RELATIONSHIPS}
              value={data.contingentBenRel}
              onChange={(e) => update("contingentBenRel", e.target.value)}
            />
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
        <Input
          label="Physician Name (if applicable)"
          value={data.physicianName}
          onChange={(e) => update("physicianName", e.target.value)}
        />
      </div>

      {/* Knockout Questions */}
      <div className="bg-red-50 rounded-2xl p-5 border border-red-200 mb-4">
        <h3 className="font-bold text-red-800 mb-4 flex items-center gap-2">
          <AlertTriangle size={18} /> Critical Questions (1-3)
        </h3>
        <div className="space-y-3">
          <YesNo
            label="1. Currently hospitalized, nursing facility, wheelchair, oxygen, hospice, amputation, cancer, or need ADL assistance?"
            value={data.q1}
            onChange={(v) => update("q1", v)}
            compact
          />
          <YesNo
            label="2. Advised for organ transplant, dialysis, CHF, Alzheimer's, ALS, or terminal condition?"
            value={data.q2}
            onChange={(v) => update("q2", v)}
            compact
          />
          <YesNo
            label="3. Diagnosed with AIDS, ARC, immune deficiency, or HIV positive?"
            value={data.q3}
            onChange={(v) => update("q3", v)}
            compact
          />
        </div>
      </div>

      {/* ROP Questions */}
      <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 mb-4">
        <h3 className="font-bold text-amber-800 mb-4">
          Questions 4-7 (Return of Premium)
        </h3>
        <div className="space-y-3">
          <YesNo
            label="4. Diabetes complications or insulin before age 50?"
            value={data.q4}
            onChange={(v) => update("q4", v)}
            compact
          />
          <YesNo
            label="5. Renal insufficiency, kidney disease, or multiple cancers?"
            value={data.q5}
            onChange={(v) => update("q5", v)}
            compact
          />
          <YesNo
            label="6. Past 2 years: testing/surgery not completed?"
            value={data.q6}
            onChange={(v) => update("q6", v)}
            compact
          />
          <YesNo
            label="7a. Past 2 years: angina, stroke, COPD, Hepatitis C, or oxygen?"
            value={data.q7a}
            onChange={(v) => update("q7a", v)}
            compact
          />
          <YesNo
            label="7b. Heart attack, aneurysm, or heart/brain surgery?"
            value={data.q7b}
            onChange={(v) => update("q7b", v)}
            compact
          />
          <YesNo
            label="7c. Any cancer (excl. basal cell)?"
            value={data.q7c}
            onChange={(v) => update("q7c", v)}
            compact
          />
          <YesNo
            label="7d. Illegal drugs or alcohol abuse?"
            value={data.q7d}
            onChange={(v) => update("q7d", v)}
            compact
          />
        </div>
      </div>

      {/* Graded Questions */}
      <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200">
        <h3 className="font-bold text-blue-800 mb-4">
          Question 8 (Graded Plan)
        </h3>
        <div className="space-y-3">
          <YesNo
            label="8a. Past 3 years: stroke, heart attack, aneurysm, heart surgery?"
            value={data.q8a}
            onChange={(v) => update("q8a", v)}
            compact
          />
          <YesNo
            label="8b. Cancer, emphysema, COPD, cirrhosis, liver disease?"
            value={data.q8b}
            onChange={(v) => update("q8b", v)}
            compact
          />
          <YesNo
            label="8c. Paralysis, cerebral palsy, MS, seizures, Parkinson's?"
            value={data.q8c}
            onChange={(v) => update("q8c", v)}
            compact
          />
        </div>
      </div>

      {/* Eligibility Display */}
      <div
        className={`mt-4 p-4 rounded-xl flex items-center gap-3 ${
          eligibility.status === "ineligible"
            ? "bg-red-100 text-red-900"
            : eligibility.status === "modified"
            ? "bg-amber-100 text-amber-900"
            : eligibility.status === "graded"
            ? "bg-blue-100 text-blue-900"
            : "bg-emerald-100 text-emerald-900"
        }`}
      >
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

      <div className="card-dark p-5 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
              Your Eligible Plan
            </p>
            <h2 className="text-2xl font-bold">
              {data.planType || "Not Selected"}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Based on your health profile
            </p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-sm">Coverage Amount</p>
            <p className="text-3xl font-bold text-cyan-400">
              ${data.faceAmount.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
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
          <div className="ml-4 border-l-4 border-cyan-500 pl-4">
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

      <div className="grid grid-cols-2 gap-3 mb-3">
        <Input
          label="Name on Account"
          value={data.accountName}
          onChange={(e) => update("accountName", e.target.value)}
        />
        <Select
          label="Account Type"
          options={["Checking", "Savings"]}
          value={data.accountType}
          onChange={(e) => update("accountType", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <Input
          label="Bank Name"
          value={data.bankName}
          onChange={(e) => update("bankName", e.target.value)}
        />
        <Input
          label="Bank Address"
          value={data.bankAddress}
          onChange={(e) => update("bankAddress", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <Input
          label="Routing Number"
          value={data.routing}
          onChange={(e) => update("routing", e.target.value)}
        />
        <Input
          label="Account Number"
          value={data.accountNum}
          onChange={(e) => update("accountNum", e.target.value)}
        />
      </div>

      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <h3 className="font-bold text-slate-700 mb-3 text-sm">
          Draft Schedule
        </h3>
        <YesNo
          label="Would you like your draft to coincide with your Social Security payment schedule?"
          value={data.draftSchedule === "ss_payment"}
          onChange={(v) =>
            update("draftSchedule", v ? "ss_payment" : "specific_date")
          }
        />
        <div className="mt-3">
          <Select
            label={
              data.draftSchedule === "ss_payment"
                ? "Social Security Draft Day"
                : "Requested Draft Day"
            }
            options={
              data.draftSchedule === "ss_payment"
                ? [
                    "1st of Month",
                    "3rd of Month",
                    "2nd Wednesday",
                    "3rd Wednesday",
                    "4th Wednesday",
                  ]
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

      <div className="card-flat overflow-hidden mb-4">
        {/* Summary Header */}
        <div className="card-dark p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs">Applicant</p>
              <h2 className="text-xl font-bold">
                {data.firstName} {data.lastName}
              </h2>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-xs">Monthly Premium</p>
              <p className="text-2xl font-bold text-cyan-400">
                ${data.monthlyPremium || "0.00"}
              </p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-4 grid grid-cols-3 gap-3">
          <DataField label="Carrier" value={data.carrier} copyable={false} />
          <DataField label="Plan Type" value={data.planType} copyable={false} />
          <DataField
            label="Face Amount"
            value={`$${data.faceAmount.toLocaleString()}`}
            copyable={false}
          />
          <DataField
            label="Primary Beneficiary"
            value={data.primaryBenName}
            copyable={false}
          />
          <DataField label="Bank" value={data.bankName} copyable={false} />
          <DataField
            label="Draft Date"
            value={data.draftDate}
            copyable={false}
          />
        </div>
      </div>

      <button
        onClick={() =>
          onComplete({
            ...data,
            id: `APP-${new Date().getFullYear()}-${Math.floor(
              Math.random() * 10000
            )}`,
            status: "Lead",
            date: new Date().toISOString().split("T")[0],
            premium:
              data.monthlyPremium || (data.faceAmount * 0.003).toFixed(2),
            plan: data.planType,
            name: `${data.firstName} ${data.lastName}`,
          })
        }
        className="w-full btn-accent py-3 text-base"
      >
        <CheckCircle size={20} />
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
    <div
      className={`${
        isScrollableStep ? "view-scrollable" : "view-contained"
      } bg-gradient-to-br from-slate-50 to-slate-100`}
    >
      <div className="max-w-5xl mx-auto px-6 py-2 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-1 shrink-0">
          <Logo />
          <StepIndicator
            currentStep={step}
            totalSteps={totalSteps}
            labels={stepLabels}
          />
        </div>

        {/* Content Area */}
        <div className={`flex-1 ${isScrollableStep ? "" : "overflow-hidden"}`}>
          <div
            className={`card-flat p-4 ${
              isScrollableStep ? "" : "h-full overflow-auto"
            }`}
          >
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
        <div className="flex justify-between items-center pt-2 shrink-0">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className="btn-ghost disabled:opacity-0"
          >
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

const AdminDashboard = ({
  submissions,
  onLogout,
  onUpdateSubmission,
  onDeleteSubmission,
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);
  const [timeFilter, setTimeFilter] = useState("YTD");
  const [notification, setNotification] = useState(null);
  const [prevSubmissionCount, setPrevSubmissionCount] = useState(0);

  // ═══════════════════════════════════════════════════════════════
  // CRM STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════
  const [selectedCrmCustomer, setSelectedCrmCustomer] = useState(null);
  const [customerNotes, setCustomerNotes] = useState({});
  const [newNote, setNewNote] = useState("");
  const [crmSearchTerm, setCrmSearchTerm] = useState("");

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
        message: `${
          newApp.name || newApp.firstName + " " + newApp.lastName
        } submitted a new application`,
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
      const name =
        sub.name || `${sub.firstName || ""} ${sub.lastName || ""}`.trim();
      if (!customerMap[name]) {
        customerMap[name] = {
          id: `CUST-${
            sub.id?.slice(-4) ||
            Math.random().toString(36).slice(-4).toUpperCase()
          }`,
          name,
          email: sub.email || "N/A",
          phone: sub.phone || "N/A",
          policies: 0,
          ltv: 0,
          status: sub.status,
          submissionIds: [],
        };
      }
      customerMap[name].policies += 1;
      customerMap[name].ltv += parseFloat(sub.premium || 0) * 12;
      customerMap[name].submissionIds.push(sub.id);
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
      if (timeFilter === "Daily")
        return d.toDateString() === now.toDateString();
      if (timeFilter === "Weekly")
        return (now - d) / (1000 * 60 * 60 * 24) <= 7;
      if (timeFilter === "Monthly")
        return (now - d) / (1000 * 60 * 60 * 24) <= 30;
      if (timeFilter === "Quarterly")
        return (now - d) / (1000 * 60 * 60 * 24) <= 90;
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
    const retentionRate =
      retentionBase > 0 ? ((activeCount / retentionBase) * 100).toFixed(1) : 0;
    const appsToIssue =
      counts.applications > 0
        ? ((activeCount / counts.applications) * 100).toFixed(1)
        : 0;

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
          {
            label: "Total Apps",
            value: submissions.length,
            icon: FileText,
            color: "cyan",
          },
          {
            label: "Issued/Paid",
            value: analyticsData.counts.issued + analyticsData.counts.paid,
            icon: Shield,
            color: "emerald",
          },
          {
            label: "Underwriting",
            value: analyticsData.counts.underwriting,
            icon: Activity,
            color: "orange",
          },
          {
            label: "Avg Premium",
            value:
              submissions.length > 0
                ? `$${(
                    submissions.reduce(
                      (sum, s) => sum + parseFloat(s.premium || 0),
                      0
                    ) / submissions.length
                  ).toFixed(2)}`
                : "$0.00",
            icon: DollarSign,
            color: "purple",
          },
        ].map((metric, i) => (
          <div key={i} className="metric-card group">
            <div className="flex justify-between items-start mb-3">
              <div
                className={`p-3 rounded-xl ${
                  COLOR_CLASSES[metric.color]?.bg || "bg-slate-50"
                } ${
                  COLOR_CLASSES[metric.color]?.text || "text-slate-600"
                } group-hover:scale-110 transition-transform`}
              >
                <metric.icon size={22} />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {metric.label}
              </span>
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
              Today's analysis suggests a 15% increase in Graded Benefit
              qualifications due to recent health questionnaire trends in the
              Southeast region.
            </p>
            <button className="mt-4 btn-white text-sm py-2">
              View Full Report
            </button>
          </div>
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="card-flat overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-lg">
            Recent Applications
          </h3>
          <button
            onClick={() => setActiveTab("applications")}
            className="text-sm text-cyan-600 font-semibold hover:text-cyan-700 flex items-center gap-1"
          >
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
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSubmissions.slice(0, 5).map((row) => (
              <tr
                key={row.id}
                className="hover:bg-cyan-50/30 transition-colors cursor-pointer"
                onClick={() => setSelectedApp(row)}
              >
                <td className="px-6 py-4 font-mono text-slate-500 text-xs">
                  {row.id}
                </td>
                <td className="px-6 py-4 font-semibold text-slate-800">
                  {row.name}
                </td>
                <td className="px-6 py-4 text-slate-600">{row.plan}</td>
                <td className="px-6 py-4 font-medium">
                  ${parseFloat(row.premium || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={row.status} />
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedApp(row);
                    }}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-cyan-600 transition-colors"
                  >
                    <Eye size={18} />
                  </button>
                </td>
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
      applications:
        analyticsData.counts.submitted +
        analyticsData.counts.underwriting +
        analyticsData.counts.issued +
        analyticsData.counts.paid +
        analyticsData.counts.notTaken +
        analyticsData.counts.declined +
        analyticsData.counts.lapsed,
      underwriting: analyticsData.counts.underwriting,
      issued:
        analyticsData.counts.issued +
        analyticsData.counts.paid +
        analyticsData.counts.notTaken +
        analyticsData.counts.lapsed,
      rejected: analyticsData.counts.declined,
      paid: analyticsData.counts.paid,
      notTaken: analyticsData.counts.notTaken,
      lapsed: analyticsData.counts.lapsed,
    };

    // Calculate conversion rates
    const leadToApp =
      funnelData.leads > 0
        ? ((funnelData.applications / funnelData.leads) * 100).toFixed(1)
        : 0;
    const appToIssued =
      funnelData.applications > 0
        ? ((funnelData.issued / funnelData.applications) * 100).toFixed(1)
        : 0;
    const issuedToPaid =
      funnelData.issued > 0
        ? ((funnelData.paid / funnelData.issued) * 100).toFixed(1)
        : 0;
    const paidToLapsed =
      funnelData.paid > 0
        ? (
            (funnelData.lapsed / (funnelData.paid + funnelData.lapsed)) *
            100
          ).toFixed(1)
        : 0;

    // Bar widths for funnel visualization (percentage of max width)
    const maxWidth = 700;
    const leadWidth = maxWidth;
    const appWidth =
      funnelData.leads > 0
        ? Math.max(
            300,
            (funnelData.applications / Math.max(funnelData.leads, 1)) * maxWidth
          )
        : 600;
    const branchWidth =
      funnelData.applications > 0
        ? Math.max(
            150,
            ((funnelData.issued / Math.max(funnelData.applications, 1)) *
              appWidth) /
              3
          )
        : 180;

    return (
      <div className="animate-fade-in space-y-6">
        {/* Header with Time Filter */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-sm gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
              <Layers className="text-white" size={24} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-xl">
                Application Lifecycle Funnel
              </h2>
              <p className="text-sm text-slate-500">
                Track your final expense applications through each stage
              </p>
            </div>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {["Daily", "Weekly", "Monthly", "Quarterly", "YTD"].map(
              (period) => (
                <button
                  key={period}
                  onClick={() => setTimeFilter(period)}
                  className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${
                    timeFilter === period
                      ? "bg-white text-cyan-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {period}
                </button>
              )
            )}
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
                <div
                  className={`funnel-stage-bar funnel-lead text-white`}
                  style={{ width: `${leadWidth}px` }}
                >
                  <div className="flex items-center gap-3">
                    <CircleDot size={22} />
                    <span className="font-bold text-lg">Lead</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black">
                      {funnelData.leads}
                    </span>
                    <span className="text-cyan-100 text-sm">100%</span>
                  </div>
                </div>
                <div className="funnel-connector text-cyan-500"></div>
              </div>

              {/* Arrow Indicator */}
              <div className="flex items-center pl-8 py-1">
                <ArrowDown className="text-slate-400" size={20} />
                <span className="ml-3 text-sm text-slate-500 font-medium">
                  Agent submits application
                </span>
                <span className="ml-auto mr-20 text-sm font-bold text-cyan-600">
                  {leadToApp}% conversion
                </span>
              </div>

              {/* Stage 2: Application */}
              <div className="funnel-stage funnel-animate funnel-animate-delay-2">
                <div
                  className={`funnel-stage-bar funnel-application text-white`}
                  style={{ width: `${appWidth}px` }}
                >
                  <div className="flex items-center gap-3">
                    <FileText size={22} />
                    <span className="font-bold text-lg">Application</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black">
                      {funnelData.applications}
                    </span>
                    <span className="text-blue-100 text-sm">{leadToApp}%</span>
                  </div>
                </div>
                <div className="funnel-connector text-blue-500"></div>
              </div>

              {/* Arrow Indicator - Branching */}
              <div className="flex items-center pl-8 py-1">
                <GitBranch className="text-slate-400" size={20} />
                <span className="ml-3 text-sm text-slate-500 font-medium">
                  Application reviewed
                </span>
              </div>

              {/* Stage 3: Branch - Issued / Rejected / Underwriting */}
              <div className="funnel-branch funnel-animate funnel-animate-delay-3 justify-center gap-4 px-4">
                {/* Issued Branch */}
                <div className="relative group">
                  <div
                    className={`funnel-stage-bar funnel-issued text-white cursor-pointer`}
                    style={{ width: "200px", height: "55px" }}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={18} />
                      <span className="font-bold">Issued</span>
                    </div>
                    <span className="text-2xl font-black">
                      {funnelData.issued}
                    </span>
                  </div>
                  <div className="funnel-connector text-emerald-500"></div>
                </div>

                {/* Rejected Branch */}
                <div className="relative group">
                  <div
                    className={`funnel-stage-bar funnel-rejected text-white cursor-pointer`}
                    style={{ width: "160px", height: "55px" }}
                  >
                    <div className="flex items-center gap-2">
                      <XCircle size={18} />
                      <span className="font-bold">Rejected</span>
                    </div>
                    <span className="text-2xl font-black">
                      {funnelData.rejected}
                    </span>
                  </div>
                </div>

                {/* Underwriting Branch */}
                <div className="relative group">
                  <div
                    className={`funnel-stage-bar funnel-underwriting text-white cursor-pointer`}
                    style={{ width: "180px", height: "55px" }}
                  >
                    <div className="flex items-center gap-2">
                      <Clock size={18} />
                      <span className="font-bold">Underwriting</span>
                    </div>
                    <span className="text-2xl font-black">
                      {funnelData.underwriting}
                    </span>
                  </div>
                </div>
              </div>

              {/* Arrow Indicator - After Issued */}
              <div className="flex items-center pl-8 py-1">
                <ArrowDown className="text-slate-400" size={20} />
                <span className="ml-3 text-sm text-slate-500 font-medium">
                  Customer pays first premium & commissions paid
                </span>
                <span className="ml-auto mr-20 text-sm font-bold text-emerald-600">
                  {issuedToPaid}% paid
                </span>
              </div>

              {/* Stage 4: Branch - Paid / Not Taken */}
              <div className="funnel-branch funnel-animate funnel-animate-delay-4 justify-center gap-6 px-4">
                {/* Paid */}
                <div className="relative group">
                  <div
                    className={`funnel-stage-bar funnel-paid text-white cursor-pointer`}
                    style={{ width: "240px", height: "55px" }}
                  >
                    <div className="flex items-center gap-2">
                      <Banknote size={18} />
                      <span className="font-bold">Paid</span>
                    </div>
                    <span className="text-2xl font-black">
                      {funnelData.paid}
                    </span>
                  </div>
                  <div className="funnel-connector text-green-600"></div>
                </div>

                {/* Not Taken */}
                <div className="relative group">
                  <div
                    className={`funnel-stage-bar funnel-not-taken text-white cursor-pointer`}
                    style={{ width: "200px", height: "55px" }}
                  >
                    <div className="flex items-center gap-2">
                      <X size={18} />
                      <span className="font-bold">Not Taken</span>
                    </div>
                    <span className="text-2xl font-black">
                      {funnelData.notTaken}
                    </span>
                  </div>
                </div>
              </div>

              {/* Arrow Indicator - After Paid */}
              <div className="flex items-center pl-8 py-1">
                <TrendingDown className="text-slate-400" size={20} />
                <span className="ml-3 text-sm text-slate-500 font-medium">
                  Policy payment missed in future
                </span>
                <span className="ml-auto mr-20 text-sm font-bold text-red-500">
                  {paidToLapsed}% lapsed
                </span>
              </div>

              {/* Stage 5: Lapsed */}
              <div className="funnel-stage funnel-animate funnel-animate-delay-5 justify-center">
                <div
                  className={`funnel-stage-bar funnel-lapsed text-white`}
                  style={{ width: "180px", height: "50px" }}
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={18} />
                    <span className="font-bold">Lapsed</span>
                  </div>
                  <span className="text-2xl font-black">
                    {funnelData.lapsed}
                  </span>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-4">
                Stage Legend
              </p>
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
                  <div
                    key={item.name}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg"
                  >
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-sm font-medium text-slate-600">
                      {item.name}
                    </span>
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
                    <span className="text-slate-400 text-xs">
                      Lead → Application
                    </span>
                    <span className="text-lg font-bold">{leadToApp}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-700"
                      style={{ width: `${leadToApp}%` }}
                    ></div>
                  </div>
                </div>

                {/* Application to Issued */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-400 text-xs">
                      Application → Issued
                    </span>
                    <span className="text-lg font-bold">{appToIssued}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-700"
                      style={{ width: `${appToIssued}%` }}
                    ></div>
                  </div>
                </div>

                {/* Issued to Paid */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-400 text-xs">
                      Issued → Paid
                    </span>
                    <span className="text-lg font-bold">{issuedToPaid}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-green-600 rounded-full transition-all duration-700"
                      style={{ width: `${issuedToPaid}%` }}
                    ></div>
                  </div>
                </div>

                {/* Retention Rate */}
                <div className="pt-3 mt-3 border-t border-slate-700">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-400 text-xs">
                      Overall Retention
                    </span>
                    <span className="text-lg font-bold text-green-400">
                      {analyticsData.retentionRate}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-700"
                      style={{ width: `${analyticsData.retentionRate}%` }}
                    ></div>
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
                  {
                    name: "Leads",
                    count: funnelData.leads,
                    color: "cyan",
                    icon: CircleDot,
                  },
                  {
                    name: "Apps",
                    count: funnelData.applications,
                    color: "blue",
                    icon: FileText,
                  },
                  {
                    name: "Undrwrt",
                    count: funnelData.underwriting,
                    color: "purple",
                    icon: Clock,
                  },
                  {
                    name: "Issued",
                    count: funnelData.issued,
                    color: "emerald",
                    icon: CheckCircle2,
                  },
                  {
                    name: "Paid",
                    count: funnelData.paid,
                    color: "green",
                    icon: Banknote,
                  },
                  {
                    name: "Reject",
                    count: funnelData.rejected,
                    color: "red",
                    icon: XCircle,
                  },
                  {
                    name: "Pass",
                    count: funnelData.notTaken,
                    color: "amber",
                    icon: X,
                  },
                  {
                    name: "Lapsed",
                    count: funnelData.lapsed,
                    color: "red",
                    icon: AlertTriangle,
                  },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-100"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-1.5 rounded-md ${
                          COLOR_CLASSES[item.color]?.bg || "bg-slate-100"
                        } ${
                          COLOR_CLASSES[item.color]?.text || "text-slate-600"
                        }`}
                      >
                        <item.icon size={14} />
                      </div>
                      <span className="text-xs font-semibold text-slate-700">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-slate-800">
                      {item.count}
                    </span>
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
                <span className="font-bold text-sm uppercase tracking-wider">
                  Annual Premium Value
                </span>
              </div>
              <p className="text-3xl font-black tracking-tight">
                $
                {analyticsData.totalPremium.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-emerald-100 text-xs mt-1 opacity-80">
                From Issued & Paid policies ({timeFilter})
              </p>
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
            <button className="btn-ghost py-2">
              <Filter size={16} /> Filter
            </button>
            <button className="btn-ghost py-2">
              <Download size={16} /> Export
            </button>
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
                <tr
                  key={row.id}
                  className="hover:bg-cyan-50/30 transition-colors group cursor-pointer"
                  onClick={() => setSelectedApp(row)}
                >
                  <td className="px-6 py-4 font-mono text-slate-500 text-xs">
                    {row.id}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-800">
                    {row.name}
                  </td>
                  <td className="px-6 py-4 text-slate-500">{row.date}</td>
                  <td className="px-6 py-4 text-slate-600">{row.plan}</td>
                  <td className="px-6 py-4 font-medium">
                    ${parseFloat(row.premium || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            window.confirm(
                              "Are you sure you want to delete this application?"
                            )
                          ) {
                            onDeleteSubmission(row.id);
                            if (selectedApp?.id === row.id)
                              setSelectedApp(null);
                          }
                        }}
                        className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                        title="Delete Application"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedApp(row);
                        }}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-cyan-600"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
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
  // RENDER: AI-POWERED CRM
  // ═══════════════════════════════════════════════════════════════

  // Health Score Calculation (based on actual customer data)
  const calculateHealthScore = (customer) => {
    let score = 100;
    const custSubmissions = submissions.filter((s) =>
      customer.submissionIds.includes(s.id)
    );

    // Deduct for non-active statuses
    custSubmissions.forEach((sub) => {
      if (sub.status === "Lapsed") score -= 30;
      else if (sub.status === "Not Taken") score -= 20;
      else if (sub.status === "Declined") score -= 25;
      else if (sub.status === "Lead") score -= 5;
    });

    // Bonus for multiple policies
    if (customer.policies > 1) score += 10;

    // Bonus for high LTV
    if (customer.ltv > 2000) score += 10;
    else if (customer.ltv > 1000) score += 5;

    return Math.max(0, Math.min(100, score));
  };

  // Retention Risk Classification
  const getRetentionRisk = (healthScore) => {
    if (healthScore >= 80)
      return { level: "low", label: "Low Risk", class: "retention-low" };
    if (healthScore >= 50)
      return { level: "medium", label: "Medium", class: "retention-medium" };
    return { level: "high", label: "High Risk", class: "retention-high" };
  };

  // Health Score Ring Component
  const HealthScoreRing = ({ score }) => {
    const circumference = 2 * Math.PI * 20;
    const offset = circumference - (score / 100) * circumference;
    const color = score >= 80 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";

    return (
      <div className="health-score-ring">
        <svg width="52" height="52" viewBox="0 0 52 52">
          <circle
            cx="26"
            cy="26"
            r="20"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="4"
          />
          <circle
            cx="26"
            cy="26"
            r="20"
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
        </svg>
        <span className="score-value" style={{ color }}>
          {score}
        </span>
      </div>
    );
  };

  // Filter customers by search
  const filteredCrmCustomers = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(crmSearchTerm.toLowerCase()) ||
      c.phone?.includes(crmSearchTerm) ||
      c.email?.toLowerCase().includes(crmSearchTerm.toLowerCase())
  );

  // Get customer's submissions for timeline
  const getCustomerSubmissions = (customer) => {
    return submissions.filter((s) => customer.submissionIds.includes(s.id));
  };

  // Add note handler
  const handleAddNote = () => {
    if (!newNote.trim() || !selectedCrmCustomer) return;
    const now = new Date().toISOString();
    setCustomerNotes((prev) => ({
      ...prev,
      [selectedCrmCustomer.id]: [
        ...(prev[selectedCrmCustomer.id] || []),
        { text: newNote, timestamp: now },
      ],
    }));
    setNewNote("");
  };

  // AI Insights calculations
  const atRiskCustomers = customers.filter((c) => calculateHealthScore(c) < 50);
  const readyToUpsell = customers.filter((c) => {
    const score = calculateHealthScore(c);
    return score >= 80 && c.policies === 1 && c.ltv > 500;
  });

  const renderCustomers = () => (
    <div className="animate-fade-in h-full flex flex-col">
      <div className="crm-container flex-1 rounded-2xl overflow-hidden border border-slate-200 shadow-lg">
        {/* Left Sidebar - Customer List */}
        <div className="crm-sidebar">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg">
                  <Users className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Customer CRM</h3>
                  <p className="text-xs text-slate-500">
                    {customers.length} total customers
                  </p>
                </div>
              </div>
              <button className="btn-accent py-2 px-3 text-xs">
                <Plus size={14} /> Add
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search customers..."
                value={crmSearchTerm}
                onChange={(e) => setCrmSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
              />
            </div>
          </div>

          {/* AI Insights Mini Panel */}
          <div className="p-3 bg-gradient-to-r from-slate-900 to-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="ai-pulse-indicator" />
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                AI Insights
              </span>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 bg-white/10 rounded-lg px-3 py-2">
                <div className="text-lg font-black text-white">
                  {atRiskCustomers.length}
                </div>
                <div className="text-xs text-slate-400">At Risk</div>
              </div>
              <div className="flex-1 bg-white/10 rounded-lg px-3 py-2">
                <div className="text-lg font-black text-emerald-400">
                  {readyToUpsell.length}
                </div>
                <div className="text-xs text-slate-400">Upsell Ready</div>
              </div>
              <div className="flex-1 bg-white/10 rounded-lg px-3 py-2">
                <div className="text-lg font-black text-cyan-400">
                  {
                    customers.filter((c) => calculateHealthScore(c) >= 80)
                      .length
                  }
                </div>
                <div className="text-xs text-slate-400">Healthy</div>
              </div>
            </div>
          </div>

          {/* Customer List */}
          <div className="flex-1 overflow-auto scrollbar-thin">
            {filteredCrmCustomers.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Users size={40} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">No customers found</p>
              </div>
            ) : (
              filteredCrmCustomers.map((cust) => {
                const healthScore = calculateHealthScore(cust);
                const risk = getRetentionRisk(healthScore);
                const isSelected = selectedCrmCustomer?.id === cust.id;

                return (
                  <div
                    key={cust.id}
                    onClick={() => setSelectedCrmCustomer(cust)}
                    className={`customer-card ${
                      isSelected ? "customer-card-selected" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <HealthScoreRing score={healthScore} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-800 truncate">
                            {cust.name}
                          </span>
                          <span className={`retention-badge ${risk.class}`}>
                            {risk.level === "high" && <AlertCircle size={10} />}
                            {risk.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Phone size={10} /> {cust.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText size={10} /> {cust.policies}{" "}
                            {cust.policies === 1 ? "policy" : "policies"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="stat-pill">
                            <DollarSign size={10} /> ${cust.ltv.toFixed(0)} LTV
                          </span>
                          <StatusBadge status={cust.status} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel - Customer Detail */}
        <div className="crm-detail-panel">
          {!selectedCrmCustomer ? (
            <div className="crm-empty-state">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-6">
                <UserCheck size={40} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">
                Select a Customer
              </h3>
              <p className="text-slate-500 max-w-sm">
                Choose a customer from the list to view their profile,
                communication history, and AI-powered retention insights.
              </p>

              {/* SignalWire Integration Banner */}
              <div className="mt-8 signalwire-banner max-w-md">
                <div className="status-dot" />
                <div className="flex-1">
                  <div className="font-bold text-sm">
                    SignalWire Integration Ready
                  </div>
                  <div className="text-xs text-blue-200">
                    Voice & SMS automation pending configuration
                  </div>
                </div>
                <Bot size={24} className="text-blue-200" />
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto scrollbar-thin animate-slide-in-right">
              {/* Customer Profile Header */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-2xl font-black shadow-xl">
                      {selectedCrmCustomer.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "?"}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold mb-1">
                        {selectedCrmCustomer.name}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-slate-300">
                        <span className="flex items-center gap-1">
                          <Phone size={14} /> {selectedCrmCustomer.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail size={14} /> {selectedCrmCustomer.email}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCrmCustomer(null)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-4 mt-6">
                  {[
                    {
                      label: "Health Score",
                      value: calculateHealthScore(selectedCrmCustomer),
                      icon: Heart,
                      color: "cyan",
                    },
                    {
                      label: "Policies",
                      value: selectedCrmCustomer.policies,
                      icon: FileText,
                      color: "emerald",
                    },
                    {
                      label: "Lifetime Value",
                      value: `$${selectedCrmCustomer.ltv.toFixed(0)}`,
                      icon: DollarSign,
                      color: "purple",
                    },
                    {
                      label: "Status",
                      value: selectedCrmCustomer.status,
                      icon: Activity,
                      color: "amber",
                    },
                  ].map((stat, idx) => (
                    <div
                      key={idx}
                      className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <stat.icon
                          size={16}
                          className={`text-${stat.color}-400`}
                        />
                        <span className="text-xs text-slate-400 uppercase tracking-wider">
                          {stat.label}
                        </span>
                      </div>
                      <div className="text-xl font-bold">{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Communication Hub */}
                <div className="comm-hub animate-fade-in-up stagger-1">
                  <div className="flex items-center gap-2 mb-4">
                    <Bot className="text-purple-600" size={20} />
                    <h3 className="font-bold text-slate-800">
                      AI Communication Hub
                    </h3>
                    <span className="ml-auto text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                      SignalWire Ready
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    <button
                      className="comm-action-btn comm-btn-call"
                      onClick={() =>
                        alert("SignalWire Voice Call integration coming soon!")
                      }
                    >
                      <PhoneOutgoing size={24} />
                      <span>Call Now</span>
                    </button>
                    <button
                      className="comm-action-btn comm-btn-sms"
                      onClick={() =>
                        alert("SignalWire SMS integration coming soon!")
                      }
                    >
                      <MessageSquare size={24} />
                      <span>Send SMS</span>
                    </button>
                    <button
                      className="comm-action-btn comm-btn-email"
                      onClick={() =>
                        window.open(`mailto:${selectedCrmCustomer.email}`)
                      }
                    >
                      <Mail size={24} />
                      <span>Email</span>
                    </button>
                    <button
                      className="comm-action-btn comm-btn-schedule"
                      onClick={() => alert("Schedule follow-up coming soon!")}
                    >
                      <CalendarClock size={24} />
                      <span>Schedule</span>
                    </button>
                  </div>

                  {/* SignalWire Status */}
                  <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <Zap size={16} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-slate-700">
                        SignalWire Integration
                      </div>
                      <div className="text-xs text-slate-500">
                        Configure API keys to enable AI Voice & SMS automation
                      </div>
                    </div>
                    <button className="text-xs font-bold text-blue-600 hover:text-blue-700 px-3 py-1.5 bg-white rounded-lg border border-blue-200 hover:border-blue-300 transition-colors">
                      Configure
                    </button>
                  </div>
                </div>

                {/* Activity Timeline */}
                <div className="bg-white rounded-xl border border-slate-100 p-5 animate-fade-in-up stagger-2">
                  <div className="flex items-center gap-2 mb-4">
                    <History className="text-cyan-600" size={20} />
                    <h3 className="font-bold text-slate-800">
                      Activity Timeline
                    </h3>
                  </div>

                  <div className="activity-timeline">
                    {getCustomerSubmissions(selectedCrmCustomer)
                      .slice(0, 5)
                      .map((sub, idx) => {
                        const dotClass =
                          sub.status === "Paid"
                            ? "timeline-dot-success"
                            : sub.status === "Lapsed" ||
                              sub.status === "Declined"
                            ? "timeline-dot-danger"
                            : sub.status === "Lead"
                            ? "timeline-dot-warning"
                            : "timeline-dot-primary";
                        return (
                          <div key={sub.id} className="timeline-item">
                            <div className={`timeline-dot ${dotClass}`} />
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium text-slate-800 text-sm">
                                  {sub.status === "Lead"
                                    ? "Lead Created"
                                    : sub.status === "Submitted"
                                    ? "Application Submitted"
                                    : sub.status === "Paid"
                                    ? "Policy Paid"
                                    : `Status: ${sub.status}`}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {sub.carrier} - {sub.plan || "Final Expense"}{" "}
                                  • ${parseFloat(sub.premium || 0).toFixed(2)}
                                  /mo
                                </div>
                              </div>
                              <div className="text-xs text-slate-400">
                                {new Date(sub.date).toLocaleDateString(
                                  "en-US",
                                  { month: "short", day: "numeric" }
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                    {getCustomerSubmissions(selectedCrmCustomer).length ===
                      0 && (
                      <div className="text-center text-slate-400 py-4 text-sm">
                        No activity recorded yet
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes Section */}
                <div className="bg-white rounded-xl border border-slate-100 p-5 animate-fade-in-up stagger-3">
                  <div className="flex items-center gap-2 mb-4">
                    <Tag className="text-amber-600" size={20} />
                    <h3 className="font-bold text-slate-800">
                      Notes & Follow-ups
                    </h3>
                  </div>

                  {/* Add Note */}
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="Add a note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleAddNote()}
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                    />
                    <button
                      onClick={handleAddNote}
                      className="btn-accent py-2 px-4"
                    >
                      <Send size={16} />
                    </button>
                  </div>

                  {/* Notes List */}
                  <div className="space-y-3 max-h-48 overflow-auto scrollbar-thin">
                    {(customerNotes[selectedCrmCustomer.id] || [])
                      .slice()
                      .reverse()
                      .map((note, idx) => (
                        <div key={idx} className="note-card pl-5">
                          <p className="text-sm text-slate-700">{note.text}</p>
                          <p className="text-xs text-amber-700 mt-1">
                            {new Date(note.timestamp).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      ))}

                    {(!customerNotes[selectedCrmCustomer.id] ||
                      customerNotes[selectedCrmCustomer.id].length === 0) && (
                      <div className="text-center text-slate-400 py-4 text-sm">
                        No notes yet. Add your first note above.
                      </div>
                    )}
                  </div>
                </div>

                {/* Policy Overview */}
                <div className="bg-white rounded-xl border border-slate-100 p-5 animate-fade-in-up stagger-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="text-emerald-600" size={20} />
                    <h3 className="font-bold text-slate-800">
                      Policy Overview
                    </h3>
                  </div>

                  <div className="grid gap-3">
                    {getCustomerSubmissions(selectedCrmCustomer).map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-100 hover:border-cyan-200 transition-colors cursor-pointer"
                        onClick={() => setSelectedApp(sub)}
                      >
                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                          {CARRIER_LOGOS[sub.carrier] ? (
                            <img
                              src={CARRIER_LOGOS[sub.carrier]}
                              alt={sub.carrier}
                              className="h-8 w-auto object-contain"
                            />
                          ) : (
                            <Shield className="text-slate-400" size={20} />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-slate-800">
                            {sub.carrier || "Unknown Carrier"}
                          </div>
                          <div className="text-sm text-slate-500">
                            {sub.plan || "Final Expense"} • $
                            {parseFloat(sub.faceAmount || 0).toLocaleString()}{" "}
                            Coverage
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-cyan-600">
                            ${parseFloat(sub.premium || 0).toFixed(2)}/mo
                          </div>
                          <StatusBadge status={sub.status} />
                        </div>
                        <ChevronRight className="text-slate-400" size={20} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delete Customer */}
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          `Are you sure you want to delete ${selectedCrmCustomer.name} and all their applications?`
                        )
                      ) {
                        selectedCrmCustomer.submissionIds.forEach((id) =>
                          onDeleteSubmission(id)
                        );
                        setSelectedCrmCustomer(null);
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                    Delete Customer
                  </button>
                </div>
              </div>
            </div>
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
          <p className="text-slate-500 mt-1">
            Real-time fraud detection and underwriting analysis.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-xs text-slate-400 uppercase font-bold">
              System Status
            </p>
            <p className="text-green-600 font-bold flex items-center justify-end gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>{" "}
              Online
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Risk Heatmap */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">
              Risk Distribution Heatmap
            </h3>
            <div className="grid grid-cols-6 gap-2 h-40">
              {[...Array(24)].map((_, i) => {
                const risk = Math.random();
                const color =
                  risk > 0.8
                    ? "bg-red-500"
                    : risk > 0.5
                    ? "bg-orange-400"
                    : risk > 0.3
                    ? "bg-yellow-300"
                    : "bg-green-400";
                return (
                  <div
                    key={i}
                    className={`rounded-md ${color} opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
                  ></div>
                );
              })}
            </div>
          </div>

          {/* AI Alerts */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-700">
              Recent AI Alerts
            </div>
            <div className="divide-y divide-slate-100">
              {[
                {
                  msg: "Velocity Check: Multiple applications from IP 192.168.1.1",
                  time: "10 min ago",
                  severity: "high",
                },
                {
                  msg: "Inconsistency: BMI does not match age/weight average",
                  time: "45 min ago",
                  severity: "medium",
                },
                {
                  msg: "Pattern Detected: Similar beneficiary across 3 applications",
                  time: "2 hours ago",
                  severity: "medium",
                },
              ].map((alert, i) => (
                <div
                  key={i}
                  className="p-4 flex items-start gap-4 hover:bg-slate-50"
                >
                  <div
                    className={`p-2 rounded-lg ${
                      alert.severity === "high"
                        ? "bg-red-100 text-red-600"
                        : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    <AlertOctagon size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 text-sm">
                      {alert.msg}
                    </p>
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
            System is automatically processing majority of standard immediate
            benefit applications.
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
    const formatDate = (dateStr, keepTime = false) => {
      if (!dateStr) return "N/A";
      if (keepTime && dateStr.includes(",")) return dateStr;
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr; // Invalid date
        if (keepTime) {
          return d.toLocaleString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          });
        }
        return `${(d.getMonth() + 1).toString().padStart(2, "0")}/${d
          .getDate()
          .toString()
          .padStart(2, "0")}/${d.getFullYear()}`;
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
                    {selectedApp.name ||
                      selectedApp.firstName + " " + selectedApp.lastName}
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
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                  <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                    ID: {selectedApp.id}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} /> {formatDate(selectedApp.date, true)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={14} /> {selectedApp.state || "N/A"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200 transition-colors">
                <Printer size={18} /> Print
              </button>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-2 hover:bg-slate-100 text-slate-400 hover:text-red-500 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8 bg-slate-50/50 flex-1">
            {/* Top Row: Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase">
                  Coverage
                </p>
                <p className="text-2xl font-bold text-emerald-600">
                  ${(selectedApp.faceAmount || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase">
                  Monthly Premium
                </p>
                <p className="text-2xl font-bold text-slate-800">
                  ${parseFloat(selectedApp.premium || 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm md:col-span-2 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">
                    Carrier
                  </p>
                  <CarrierLogo
                    carrier={selectedApp.carrier || "American Amicable"}
                    size="lg"
                  />
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase">
                    Plan
                  </p>
                  <p className="text-lg font-bold text-cyan-600">
                    {selectedApp.plan}
                  </p>
                </div>
              </div>
            </div>

            {/* Main Information Grid - 3 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Column 1: Personal & Contact */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                    <User size={20} className="text-cyan-500" /> Personal
                    Information
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    <DataField
                      label="Full Name"
                      value={`${selectedApp.firstName || selectedApp.name} ${
                        selectedApp.middleName || ""
                      } ${selectedApp.lastName || ""}`}
                    />
                    <DataField
                      label="Date of Birth"
                      value={formatDate(selectedApp.dob)}
                    />
                    <DataField label="Age" value={selectedApp.age} />
                    <DataField
                      label="State of Birth"
                      value={selectedApp.stateOfBirth}
                    />
                    <DataField label="SSN" value={selectedApp.ssn} />
                    <DataField label="Gender" value={selectedApp.gender} />
                    <div className="grid grid-cols-2 gap-2">
                      <DataField label="Height" value={selectedApp.height} />
                      <DataField
                        label="Weight"
                        value={
                          selectedApp.weight
                            ? `${selectedApp.weight} lbs`
                            : null
                        }
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                    <MapPin size={20} className="text-orange-500" /> Contact
                    Details
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
                      <Users size={20} className="text-indigo-500" /> Policy
                      Owner
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      <DataField
                        label="Owner Name"
                        value={selectedApp.ownerName}
                      />
                      <DataField
                        label="Relationship"
                        value={selectedApp.ownerRel}
                      />
                      <DataField
                        label="Owner SSN"
                        value={selectedApp.ownerSsn}
                      />
                      <DataField
                        label="Owner Address"
                        value={selectedApp.ownerAddress}
                      />
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
                      <div className="absolute top-0 right-0 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase">
                        Primary
                      </div>
                      <DataField
                        label="Name"
                        value={selectedApp.primaryBenName}
                      />
                      <div className="mt-2 text-xs text-slate-500 flex gap-2">
                        <span className="font-bold">Rel:</span>{" "}
                        {selectedApp.primaryBenRel || "N/A"}
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm relative overflow-hidden opacity-80">
                      <div className="absolute top-0 right-0 bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase">
                        Contingent
                      </div>
                      <DataField
                        label="Name"
                        value={selectedApp.contingentBenName}
                      />
                      <div className="mt-2 text-xs text-slate-500 flex gap-2">
                        <span className="font-bold">Rel:</span>{" "}
                        {selectedApp.contingentBenRel || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                    <CreditCard size={20} className="text-emerald-500" />{" "}
                    Banking & Payment
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    <DataField
                      label="Name on Account"
                      value={selectedApp.accountName}
                    />
                    <DataField
                      label="Account Type"
                      value={selectedApp.accountType}
                    />
                    <DataField label="Bank Name" value={selectedApp.bankName} />
                    <DataField
                      label="Bank Address"
                      value={selectedApp.bankAddress}
                    />
                    <DataField
                      label="Routing Number"
                      value={selectedApp.routing}
                    />
                    <DataField
                      label="Account Number"
                      value={selectedApp.accountNum}
                    />
                    <DataField
                      label="Draft Schedule"
                      value={
                        selectedApp.draftSchedule === "ss_payment"
                          ? "Social Security"
                          : "Specific Date"
                      }
                    />
                    <DataField
                      label="Draft Date"
                      value={selectedApp.draftDate}
                    />
                  </div>
                </div>
              </div>

              {/* Column 3: Health & Status */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                    <Stethoscope size={20} className="text-purple-500" /> Health
                    & Underwriting
                  </h3>
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3">
                    <DataField
                      label="Physician"
                      value={selectedApp.physicianName}
                    />
                    <DataField
                      label="Tobacco Use"
                      value={selectedApp.tobacco === true ? "YES" : "NO"}
                    />

                    {/* Knockout Questions */}
                    <div className="border-t border-slate-100 pt-3">
                      <p className="text-xs font-bold text-red-600 uppercase mb-2">
                        Knockout Questions (1-3)
                      </p>
                      <div className="space-y-1 text-sm">
                        {[
                          { q: "Q1", val: selectedApp.q1 },
                          { q: "Q2", val: selectedApp.q2 },
                          { q: "Q3", val: selectedApp.q3 },
                        ].map(({ q, val }) => (
                          <div key={q} className="flex justify-between">
                            <span>{q}</span>
                            <span
                              className={
                                val
                                  ? "text-red-600 font-bold"
                                  : "text-green-600"
                              }
                            >
                              {val ? "YES" : "NO"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ROP Questions */}
                    <div className="border-t border-slate-100 pt-3">
                      <p className="text-xs font-bold text-yellow-600 uppercase mb-2">
                        ROP Questions (4-7)
                      </p>
                      <div className="space-y-1 text-sm">
                        {[
                          { q: "Q4", val: selectedApp.q4 },
                          { q: "Q5", val: selectedApp.q5 },
                          { q: "Q6", val: selectedApp.q6 },
                          { q: "Q7a", val: selectedApp.q7a },
                          { q: "Q7b", val: selectedApp.q7b },
                          { q: "Q7c", val: selectedApp.q7c },
                          { q: "Q7d", val: selectedApp.q7d },
                        ].map(({ q, val }) => (
                          <div key={q} className="flex justify-between">
                            <span>{q}</span>
                            <span
                              className={
                                val
                                  ? "text-yellow-600 font-bold"
                                  : "text-green-600"
                              }
                            >
                              {val ? "YES" : "NO"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Graded Questions */}
                    <div className="border-t border-slate-100 pt-3">
                      <p className="text-xs font-bold text-blue-600 uppercase mb-2">
                        Graded Questions (8)
                      </p>
                      <div className="space-y-1 text-sm">
                        {[
                          { q: "Q8a", val: selectedApp.q8a },
                          { q: "Q8b", val: selectedApp.q8b },
                          { q: "Q8c", val: selectedApp.q8c },
                        ].map(({ q, val }) => (
                          <div key={q} className="flex justify-between">
                            <span>{q}</span>
                            <span
                              className={
                                val
                                  ? "text-blue-600 font-bold"
                                  : "text-green-600"
                              }
                            >
                              {val ? "YES" : "NO"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coverage Options */}
                <div>
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                    <Shield size={20} className="text-purple-600" /> Coverage
                    Options
                  </h3>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-slate-600">
                        Willing to Accept
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ${
                          selectedApp.willingToAccept
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {selectedApp.willingToAccept ? "YES" : "NO"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-600">
                        Existing Insurance
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ${
                          selectedApp.hasExisting
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {selectedApp.hasExisting ? "YES" : "NO"}
                      </span>
                    </div>
                    {selectedApp.hasExisting && (
                      <div className="flex justify-between items-center mt-2 pl-4 border-l-2 border-slate-200">
                        <span className="text-sm text-slate-500">
                          Will Replace?
                        </span>
                        <span
                          className={`font-bold ${
                            selectedApp.willReplace
                              ? "text-red-600"
                              : "text-slate-600"
                          }`}
                        >
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
          <p className="text-xs text-slate-500 uppercase tracking-widest mt-2 text-center">
            Admin Portal
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase mb-3 px-4">
            Main Menu
          </p>
          <NavItem id="overview" icon={LayoutDashboard} label="Dashboard" />

          <p className="text-xs font-bold text-slate-500 uppercase mt-6 mb-3 px-4">
            Analytics
          </p>
          <NavItem id="analytics" icon={PieChart} label="Performance" />
          <NavItem id="ai-risk" icon={BrainCircuit} label="AI Risk Center" />

          <p className="text-xs font-bold text-slate-500 uppercase mt-6 mb-3 px-4">
            Management
          </p>
          <NavItem id="applications" icon={FileText} label="Applications" />
          <NavItem id="customers" icon={Users} label="Customers" />
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <button
            onClick={onLogout}
            className="nav-item w-full text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
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
                  <p className="text-white/90 text-sm mt-1">
                    {notification.message}
                  </p>
                  <button
                    onClick={() => {
                      setSelectedApp(notification.app);
                      setNotification(null);
                    }}
                    className="mt-3 px-4 py-2 bg-white text-emerald-700 font-bold rounded-lg text-sm hover:bg-emerald-50 transition-colors"
                  >
                    View Application
                  </button>
                </div>
                <button
                  onClick={() => setNotification(null)}
                  className="text-white/70 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0 z-10">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-bold text-slate-800 capitalize">
              {activeTab.replace("-", " ")}
            </h2>
            <div className="relative flex-1 max-w-md group">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder="Ask AI: 'Show pending apps...'"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-2.5 w-80 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 focus:bg-white transition-all"
              />
              <Sparkles
                className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-500 opacity-0 group-focus-within:opacity-100 transition-opacity"
                size={16}
              />
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
      <div
        className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse-soft"
        style={{ animationDelay: "1s" }}
      />
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
          <span className="text-emerald-400 text-sm font-medium">
            System Online
          </span>
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
            <h2 className="text-2xl font-bold text-white mb-3">
              New Application
            </h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Start a new insurance application for a customer with our
              streamlined process.
            </p>
            <span className="inline-flex items-center gap-2 text-cyan-400 font-semibold group-hover:gap-3 transition-all">
              Start Now{" "}
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
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
              Full-featured agent dialer with 3-way calling and screen pop
              integration.
            </p>
            <span className="inline-flex items-center gap-2 text-purple-400 font-semibold group-hover:gap-3 transition-all">
              Open Dialer{" "}
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
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
              Manage applications, view analytics, and access AI-powered
              insights.
            </p>
            <span className="inline-flex items-center gap-2 text-emerald-400 font-semibold group-hover:gap-3 transition-all">
              {isAuthenticated ? "Go to Dashboard" : "Login"}{" "}
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
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
          <div
            key={i}
            className="animate-fade-in"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">
              {stat.label}
            </p>
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

        <h2 className="text-3xl font-bold text-slate-800 mb-3">
          Application Submitted!
        </h2>
        <p className="text-slate-500 mb-2 text-lg">
          Thank you,{" "}
          <span className="font-semibold text-slate-700">
            {submission?.firstName}
          </span>
          .
        </p>

        {/* Application ID */}
        <div className="inline-flex items-center gap-2 bg-slate-100 px-5 py-2.5 rounded-xl mb-8">
          <span className="text-slate-500 text-sm">Application ID:</span>
          <span className="font-mono font-bold text-slate-800">
            {submission?.id}
          </span>
        </div>

        {/* Next Steps */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-8 text-left">
          <h3 className="font-bold text-emerald-800 mb-2 flex items-center gap-2">
            <Sparkles size={18} /> What's Next?
          </h3>
          <ul className="text-sm text-emerald-700 space-y-1">
            <li>• Application will be reviewed within 24-48 hours</li>
            <li>• You'll receive a confirmation email shortly</li>
            <li>
              • Our underwriting team may contact you for additional information
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => onNavigate("home")}
            className="btn-accent w-full py-4 text-lg"
          >
            Return Home
          </button>
          <button
            onClick={() => onNavigate("admin")}
            className="btn-ghost w-full"
          >
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
      if (
        error.message === "Unauthorized" ||
        error.message.includes("401") ||
        error.message.includes("403")
      ) {
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
        date: new Date().toLocaleString("en-US", {
          timeZone: "America/New_York",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
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

  const handleDeleteSubmission = async (id) => {
    try {
      await api.deleteApplication(id);
      setSubmissions((prev) => prev.filter((sub) => sub.id !== id));
    } catch (error) {
      console.error("Failed to delete application:", error);
      alert("Failed to delete application");
    }
  };

  // Route rendering
  if (view === "home") {
    return (
      <HomeScreen onNavigate={setView} isAuthenticated={isAuthenticated} />
    );
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
        onDeleteSubmission={handleDeleteSubmission}
      />
    );
  }

  return null;
}
