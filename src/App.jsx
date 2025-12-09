import React, { useState, useEffect, useMemo, useCallback } from "react";
import { api } from "./api";
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
  Settings,
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
  ArrowUpRight,
  ArrowDownRight,
  Save,
  Edit3,
  RefreshCw,
  Copy,
  ExternalLink,
  Printer,
} from "lucide-react";

// --- Constants & Data ---

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
  "Submitted",
  "Underwriting",
  "Issued",
  "Paid",
  "Not Taken",
  "Lapsed",
];

const PLAN_TYPES = [
  "Immediate Death Benefit",
  "Graded Death Benefit",
  "Return of Premium Death Benefit",
];

const CARRIERS = {
  "American Amicable": ["Level", "Graded", "Modified"],
  Corebridge: ["Guaranteed Issue", "Simplified Issue"],
  TransAmerica: ["Level", "Graded"],
  Aflac: ["Level", "Graded", "Return of Premium"],
  SBLI: ["Level", "Graded", "Return of Premium"],
  CICA: ["Level", "Graded", "Return of Premium"],
  GTL: ["Level", "Graded", "Return of Premium"],
};

// Carrier fee and monthly factor configuration (from rating.xlsx Key sheet)
const CARRIER_CONFIG = {
  Aflac: { annualFee: 48, monthlyFactor: 0.0875, hasTobacco: true },
  SBLI: { annualFee: 48, monthlyFactor: 0.087, hasTobacco: true },
  CICA: { annualFee: 0, monthlyFactor: 0, hasTobacco: false },
  GTL: { annualFee: 48, monthlyFactor: 0.08333, hasTobacco: false },
  Corebridge: {
    annualFee: 0,
    monthlyFactor: 0,
    hasTobacco: false,
    directLookup: true,
  },
  TransAmerica: { annualFee: 0, monthlyFactor: 0.45, hasTobacco: true },
};

// Carrier logo mapping (located in /logos folder)
const CARRIER_LOGOS = {
  Aflac: "/logos/aflac.png",
  "American Amicable": "/logos/amam.png",
  CICA: "/logos/cica.png",
  Corebridge: "/logos/corebridge.png",
  GTL: "/logos/gtl.png",
  SBLI: "/logos/sbli.png",
  TransAmerica: "/logos/trans.png",
};

// CarrierLogo component for displaying carrier logos
const CarrierLogo = ({ carrier, size = "md", className = "" }) => {
  const sizeClasses = {
    xs: "h-4 max-w-[40px]",
    sm: "h-6 max-w-[60px]",
    md: "h-8 max-w-[80px]",
    lg: "h-10 max-w-[100px]",
    xl: "h-12 max-w-[120px]",
  };
  
  const logoSrc = CARRIER_LOGOS[carrier];
  
  if (!logoSrc) {
    // Fallback to text if no logo available
    return <span className={`font-bold ${className}`}>{carrier}</span>;
  }
  
  return (
    <img
      src={logoSrc}
      alt={`${carrier} logo`}
      className={`object-contain ${sizeClasses[size] || sizeClasses.md} ${className}`}
      title={carrier}
    />
  );
};

// Rate tables: cost per $1000 of death benefit (from rating.xlsx)
// Aflac: ages 45-80, smoker/non-smoker
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

// SBLI: ages 50-85, smoker/non-smoker
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

// CICA: ages 45-85, gender only (no tobacco)
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
  64: { male: 77.45, female: 68.28 },
  65: { male: 81.32, female: 71.54 },
  66: { male: 85.39, female: 74.97 },
  67: { male: 89.65, female: 78.57 },
  68: { male: 94.14, female: 82.35 },
  69: { male: 98.84, female: 86.31 },
  70: { male: 103.79, female: 90.47 },
  71: { male: 108.98, female: 94.84 },
  72: { male: 114.42, female: 99.42 },
  73: { male: 120.14, female: 104.23 },
  74: { male: 126.15, female: 109.28 },
  75: { male: 132.46, female: 114.59 },
  76: { male: 139.08, female: 120.16 },
  77: { male: 146.04, female: 126.02 },
  78: { male: 153.34, female: 132.17 },
  79: { male: 161.01, female: 138.62 },
  80: { male: 169.06, female: 145.4 },
  81: { male: 177.51, female: 152.52 },
  82: { male: 186.39, female: 160.0 },
  83: { male: 195.71, female: 167.85 },
  84: { male: 205.49, female: 176.09 },
  85: { male: 215.77, female: 184.74 },
};

// GTL: ages 40-89, gender only (no tobacco)
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
  61: { male: 81, female: 62 },
  62: { male: 84, female: 64 },
  63: { male: 87, female: 66 },
  64: { male: 91, female: 69 },
  65: { male: 95, female: 72 },
  66: { male: 100, female: 75 },
  67: { male: 105, female: 79 },
  68: { male: 110, female: 83 },
  69: { male: 116, female: 87 },
  70: { male: 122, female: 92 },
  71: { male: 129, female: 97 },
  72: { male: 136, female: 103 },
  73: { male: 144, female: 109 },
  74: { male: 152, female: 115 },
  75: { male: 161, female: 122 },
  76: { male: 170, female: 129 },
  77: { male: 180, female: 137 },
  78: { male: 190, female: 145 },
  79: { male: 201, female: 154 },
  80: { male: 213, female: 163 },
  81: { male: 226, female: 173 },
  82: { male: 239, female: 184 },
  83: { male: 253, female: 195 },
  84: { male: 268, female: 207 },
  85: { male: 284, female: 219 },
  86: { male: 301, female: 232 },
  87: { male: 319, female: 246 },
  88: { male: 338, female: 261 },
  89: { male: 358, female: 277 },
};

// TransAmerica: ages 18-85, smoker/non-smoker (from updated rating.xlsx)
const TRANSAMERICA_RATES = {
  18: { maleNS: 20.44, maleSm: 24.37, femaleNS: 18.69, femaleSm: 19.25 },
  19: { maleNS: 20.73, maleSm: 25.33, femaleNS: 19.0, femaleSm: 20.06 },
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
  31: { maleNS: 23.61, maleSm: 31.85, femaleNS: 20.53, femaleSm: 27.0 },
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
  44: { maleNS: 37.14, maleSm: 55.64, femaleNS: 30.62, femaleSm: 42.0 },
  45: { maleNS: 38.1, maleSm: 58.55, femaleNS: 31.98, femaleSm: 44.05 },
  46: { maleNS: 38.97, maleSm: 60.05, femaleNS: 32.57, femaleSm: 45.07 },
  47: { maleNS: 39.84, maleSm: 61.5, femaleNS: 33.16, femaleSm: 46.11 },
  48: { maleNS: 40.26, maleSm: 62.32, femaleNS: 33.57, femaleSm: 46.75 },
  49: { maleNS: 40.68, maleSm: 63.15, femaleNS: 33.92, femaleSm: 47.18 },
  50: { maleNS: 41.11, maleSm: 63.95, femaleNS: 34.27, femaleSm: 47.63 },
  51: { maleNS: 42.55, maleSm: 65.96, femaleNS: 35.11, femaleSm: 49.12 },
  52: { maleNS: 44.11, maleSm: 68.0, femaleNS: 36.07, femaleSm: 50.66 },
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
  64: { maleNS: 68.0, maleSm: 119.43, femaleNS: 54.8, femaleSm: 81.83 },
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

// Corebridge: ages 50-80, final monthly premiums by gender and coverage amount (Guaranteed Issue)
// No tobacco factor, no health factor - these are final monthly rates
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
      5000: 31.9,
      10000: 61.79,
      15000: 91.69,
      20000: 121.58,
      25000: 151.48,
    },
    female: {
      5000: 22.44,
      10000: 42.88,
      15000: 63.31,
      20000: 93.14,
      25000: 115.93,
    },
  },
  52: {
    male: {
      5000: 32.43,
      10000: 62.87,
      15000: 93.3,
      20000: 127.84,
      25000: 159.29,
    },
    female: {
      5000: 23.21,
      10000: 44.42,
      15000: 65.63,
      20000: 98.58,
      25000: 122.72,
    },
  },
  53: {
    male: {
      5000: 32.91,
      10000: 63.81,
      15000: 94.71,
      20000: 135.14,
      25000: 168.43,
    },
    female: {
      5000: 24.36,
      10000: 46.71,
      15000: 69.07,
      20000: 103.53,
      25000: 128.92,
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
      15000: 78.0,
      20000: 116.51,
      25000: 145.14,
    },
  },
  57: {
    male: {
      5000: 36.19,
      10000: 70.37,
      15000: 104.56,
      20000: 155.19,
      25000: 193.49,
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
      5000: 36.95,
      10000: 71.91,
      15000: 106.86,
      20000: 158.51,
      25000: 197.64,
    },
    female: {
      5000: 28.95,
      10000: 55.89,
      15000: 82.84,
      20000: 123.6,
      25000: 154.0,
    },
  },
  59: {
    male: {
      5000: 37.48,
      10000: 72.97,
      15000: 108.45,
      20000: 160.86,
      25000: 200.58,
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
      5000: 40.62,
      10000: 79.25,
      15000: 117.87,
      20000: 174.54,
      25000: 217.67,
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
      5000: 43.22,
      10000: 84.44,
      15000: 125.66,
      20000: 185.87,
      25000: 231.83,
    },
    female: {
      5000: 33.71,
      10000: 65.42,
      15000: 97.13,
      20000: 144.35,
      25000: 179.94,
    },
  },
  63: {
    male: {
      5000: 45.7,
      10000: 89.4,
      15000: 133.11,
      20000: 196.72,
      25000: 245.4,
    },
    female: {
      5000: 35.12,
      10000: 68.23,
      15000: 101.34,
      20000: 150.49,
      25000: 187.61,
    },
  },
  64: {
    male: {
      5000: 48.09,
      10000: 94.18,
      15000: 140.27,
      20000: 207.1,
      25000: 258.37,
    },
    female: {
      5000: 36.19,
      10000: 70.37,
      15000: 104.56,
      20000: 155.19,
      25000: 193.49,
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
      5000: 52.47,
      10000: 102.93,
      15000: 153.4,
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
      5000: 54.25,
      10000: 106.5,
      15000: 158.75,
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
      5000: 55.92,
      10000: 109.84,
      15000: 163.76,
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
      5000: 57.39,
      10000: 112.77,
      15000: 168.16,
      20000: 247.66,
      25000: 309.08,
    },
    female: {
      5000: 43.44,
      10000: 84.88,
      15000: 126.33,
      20000: 186.82,
      25000: 233.02,
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
      15000: 143.18,
      20000: 211.34,
      25000: 263.67,
    },
  },
  72: {
    male: {
      5000: 69.17,
      10000: 136.34,
      15000: 203.51,
      20000: 299.12,
      25000: 373.4,
    },
    female: {
      5000: 53.17,
      10000: 104.34,
      15000: 155.51,
      20000: 229.28,
      25000: 286.1,
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
      20000: 262.31,
      25000: 327.39,
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
      10000: 190.5,
      15000: 284.75,
      20000: 417.32,
      25000: 521.15,
    },
    female: {
      5000: 73.17,
      10000: 144.33,
      15000: 215.5,
      20000: 316.57,
      25000: 395.21,
    },
  },
  77: {
    male: {
      5000: 109.5,
      10000: 217.01,
      15000: 324.51,
      20000: 451.53,
      25000: 563.91,
    },
    female: {
      5000: 81.83,
      10000: 161.66,
      15000: 241.49,
      20000: 354.32,
      25000: 442.4,
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
      10000: 224.25,
      15000: 335.38,
      20000: 452.45,
      25000: 565.06,
    },
    female: {
      5000: 97.5,
      10000: 193.0,
      15000: 288.51,
      20000: 422.74,
      25000: 527.92,
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

// Calculate monthly premium based on carrier, age, gender, tobacco, and face amount
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
      rate = isMale
        ? isSmoker
          ? rateTable.maleSm
          : rateTable.maleNS
        : isSmoker
        ? rateTable.femaleSm
        : rateTable.femaleNS;
      break;
    case "SBLI":
      rateTable = SBLI_RATES[age];
      if (!rateTable) return null;
      rate = isMale
        ? isSmoker
          ? rateTable.maleSm
          : rateTable.maleNS
        : isSmoker
        ? rateTable.femaleSm
        : rateTable.femaleNS;
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
      rate = isMale
        ? isSmoker
          ? rateTable.maleSm
          : rateTable.maleNS
        : isSmoker
        ? rateTable.femaleSm
        : rateTable.femaleNS;
      break;
    case "Corebridge": {
      // Corebridge rates are final monthly premiums, direct lookup by age, gender, and coverage
      rateTable = COREBRIDGE_RATES[age];
      if (!rateTable) return null;
      const genderRates = isMale ? rateTable.male : rateTable.female;
      // Find the closest coverage amount (5000, 10000, 15000, 20000, 25000)
      const coverageAmounts = [5000, 10000, 15000, 20000, 25000];
      const closestAmount = coverageAmounts.reduce((prev, curr) =>
        Math.abs(curr - faceAmount) < Math.abs(prev - faceAmount) ? curr : prev
      );
      return genderRates[closestAmount]; // Return directly - already final monthly premium
    }
    default:
      return null;
  }

  // Formula from rate_calc.txt:
  // 1. Multiply rate by (faceAmount / 1000)
  // 2. Add annual policy fee
  // 3. Apply monthly factor: (totalAnnual * monthlyFactor) + totalAnnual
  // 4. Divide by 12 for monthly premium
  const units = faceAmount / 1000;
  const annualBase = rate * units;
  const totalAnnual = annualBase + config.annualFee;
  const withFactor = totalAnnual + totalAnnual * config.monthlyFactor;
  const monthlyPremium = withFactor / 12;

  return Math.round(monthlyPremium * 100) / 100; // Round to 2 decimal places
};

// Height options in ft'in" format
const HEIGHT_OPTIONS = [];
for (let ft = 4; ft <= 7; ft++) {
  for (let inch = 0; inch <= 11; inch++) {
    HEIGHT_OPTIONS.push(`${ft}'${inch}"`);
  }
}

const DRAFT_DATES = [
  "1st",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "6th",
  "7th",
  "8th",
  "9th",
  "10th",
  "11th",
  "12th",
  "13th",
  "14th",
  "15th",
  "16th",
  "17th",
  "18th",
  "19th",
  "20th",
  "21st",
  "22nd",
  "23rd",
  "24th",
  "25th",
  "26th",
  "27th",
  "28th",
  "2nd Wednesday",
  "3rd Wednesday",
  "4th Wednesday",
];

const INITIAL_DATA = {
  // Carrier & Policy
  carrier: "",
  planType: "",
  monthlyPremium: "",

  // Personal
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

  // Owner (if different)
  ownerName: "",
  ownerRel: "",
  ownerSsn: "",
  ownerAddress: "",

  // Beneficiaries
  primaryBenName: "",
  primaryBenRel: "",
  contingentBenName: "",
  contingentBenRel: "",

  // Plan (Legacy / Calculated)
  // planType: '', // Moved up
  faceAmount: 10000,
  willingToAccept: false,
  tobacco: null,

  // Riders
  grandchildRider: false,
  grandchildCount: 0,
  grandchildUnits: 0,
  childRider: false,
  childUnits: 0,
  childADB: false,
  childAmount: 0,

  // Existing Insurance
  hasExisting: null,
  willReplace: null,
  replacePolicyNum: "",
  replaceAmount: "",
  replaceReason: "",

  // Health (null = unanswered, true = yes, false = no)
  physicianName: "",
  q1: null,
  q2: null,
  q3: null, // Knockout
  q4: null,
  q5: null,
  q6: null,
  q7a: null,
  q7b: null,
  q7c: null,
  q7d: null, // ROP
  q8a: null,
  q8b: null,
  q8c: null, // Graded

  // Bank
  accountName: "",
  accountType: "checking",
  bankName: "",
  bankAddress: "",
  routing: "",
  accountNum: "",
  draftSchedule: "ss_payment", // or 'specific_date'
  draftDate: "",

  // Replacement specific
  discontinuing: null,
  usingFunds: null,
  replacements: [
    { insurer: "", insured: "", policyNum: "", replaceOrFinance: "" },
  ],
};

// Mock data removed - using API now

// --- Shared UI Components ---

// Date formatter helper
const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${(d.getMonth() + 1).toString().padStart(2, "0")}/${d
      .getDate()
      .toString()
      .padStart(2, "0")}/${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
};

const Logo = ({ small = false }) => (
  <div
    className={`flex items-center justify-center ${small ? "mb-1" : "mb-2"}`}
  >
    <img
      src="/amerben.png"
      alt="American Beneficiary"
      className={`${small ? "h-6" : "h-10"} w-auto object-contain`}
    />
  </div>
);

const SectionTitle = ({ icon: Icon, title, subtitle }) => (
  <div className="mb-3 border-b border-slate-200 pb-1">
    <div className="flex items-center gap-2 text-blue-900 mb-0.5">
      <Icon size={20} className="stroke-[2.5px]" />
      <h2 className="text-lg font-bold">{title}</h2>
    </div>
    {subtitle && <p className="text-xs text-slate-500 ml-7">{subtitle}</p>}
  </div>
);

const Input = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  className = "",
  required = false,
  ...props
}) => (
  <div className={`flex flex-col gap-0.5 ${className}`}>
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-800 font-medium placeholder:text-slate-400 text-sm"
      {...props}
    />
  </div>
);

const Select = ({ label, value, onChange, options, className = "" }) => (
  <div className={`flex flex-col gap-0.5 ${className}`}>
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
      {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white appearance-none text-slate-800 font-medium text-sm"
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-2.5 pointer-events-none text-slate-400">
        <ChevronRight className="rotate-90" size={14} />
      </div>
    </div>
  </div>
);

const YesNo = ({ label, value, onChange, subLabel }) => (
  <div className="p-2 bg-white border border-slate-100 rounded-lg shadow-sm mb-2">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
      <div className="flex-1">
        <p className="font-medium text-slate-800 text-sm">{label}</p>
        {subLabel && <p className="text-xs text-slate-500 mt-0.5">{subLabel}</p>}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onChange(true)}
          className={`px-4 py-1 rounded-lg font-bold transition-all text-sm ${
            value === true
              ? "bg-blue-600 text-white shadow-md"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          Yes
        </button>
        <button
          onClick={() => onChange(false)}
          className={`px-4 py-1 rounded-lg font-bold transition-all text-sm ${
            value === false
              ? "bg-slate-700 text-white shadow-md"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          No
        </button>
      </div>
    </div>
  </div>
);

const StepIndicator = ({ currentStep, totalSteps }) => (
  <div className="flex items-center justify-center gap-2 mb-3">
    {[...Array(totalSteps)].map((_, idx) => (
      <div
        key={idx}
        className={`h-2 rounded-full transition-all duration-500 ${
          idx + 1 === currentStep
            ? "w-8 bg-blue-600"
            : idx + 1 < currentStep
            ? "w-2 bg-green-500"
            : "w-2 bg-slate-200"
        }`}
      />
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
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1">
        {label}
      </span>
      <div className="flex items-center justify-between gap-2">
        <span
          className={`font-semibold text-slate-800 break-words ${
            !value && "text-slate-300 italic"
          }`}
        >
          {value || "N/A"}
        </span>
        {copyable && value && (
          <button
            onClick={handleCopy}
            className="text-slate-400 hover:text-blue-600 transition-colors"
            title="Copy to clipboard"
          >
            {copied ? (
              <CheckCircle size={16} className="text-green-500" />
            ) : (
              <Copy
                size={16}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

// --- Component: Login Form ---
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Agent Access</h2>
          <p className="text-slate-500">
            Enter your secure password to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <RefreshCw size={20} className="animate-spin" />
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Component: Customer Application Form ---

const CustomerForm = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState(INITIAL_DATA);

  const update = (field, val) => setData((prev) => ({ ...prev, [field]: val }));

  const eligibility = useMemo(() => {
    // Corebridge: Everyone is eligible, always Guaranteed Issue
    if (data.carrier === "Corebridge") {
      return {
        status: "standard",
        plan: "Guaranteed Issue",
        message: `${data.carrier} - Guaranteed Issue`,
      };
    }

    // For all other carriers, check health questions
    const isKnockout = [data.q1, data.q2, data.q3].some((a) => a === true);
    if (isKnockout) {
      return {
        status: "ineligible",
        plan: "Not Eligible",
        message: data.carrier
          ? `${data.carrier} - Not Eligible`
          : "Not Eligible based on health responses.",
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
          : "Qualifies for Return of Premium Plan.",
      };
    }

    const isGraded = [data.q8a, data.q8b, data.q8c].some((a) => a === true);
    if (isGraded) {
      return {
        status: "graded",
        plan: "Graded",
        message: data.carrier
          ? `${data.carrier} - Graded`
          : "Qualifies for Graded Death Benefit Plan.",
      };
    }

    // All questions No = Level/Immediate
    return {
      status: "standard",
      plan: "Level",
      message: data.carrier
        ? `${data.carrier} - Level`
        : "Qualifies for Level (Immediate Death Benefit) Plan.",
    };
  }, [data]);

  useEffect(() => {
    if (
      !data.carrier &&
      eligibility.status !== "ineligible" &&
      eligibility.plan !== data.planType
    ) {
      update("planType", eligibility.plan);
    }
  }, [eligibility, data.carrier]);

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
      // Calculate Corebridge premium if we have the required data
      const age = parseInt(data.age);
      if (age && data.gender && data.faceAmount) {
        const corebridgePremium = calculateMonthlyPremium(
          "Corebridge",
          age,
          data.gender,
          data.tobacco,
          data.faceAmount
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

  const handleSubmit = () => {
    onComplete({
      ...data,
      id: `APP-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
      status: "Pending",
      date: new Date().toISOString().split("T")[0],
      riskScore: Math.floor(Math.random() * 100),
      premium: data.monthlyPremium || (data.faceAmount * 0.003).toFixed(2),
      plan: data.planType, // Ensure dashboard compatibility
    });
  };

  const renderCarrierSelect = () => (
    <div className="animate-fade-in">
      <SectionTitle
        icon={Shield}
        title="Select Carrier"
        subtitle="Choose the insurance carrier."
      />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        {Object.keys(CARRIERS).map((c) => (
          <button
            key={c}
            onClick={() => {
              update("carrier", c);
              update("planType", "");
            }}
            className={`p-3 rounded-xl border-2 text-left transition-all flex items-center justify-between group ${
              data.carrier === c
                ? "border-blue-600 bg-blue-50"
                : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-center min-h-[32px]">
              <CarrierLogo carrier={c} size="md" />
            </div>
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                data.carrier === c
                  ? "border-blue-600 bg-blue-600"
                  : "border-slate-300"
              }`}
            >
              {data.carrier === c && (
                <div className="w-2 h-2 bg-white rounded-full" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderPolicySelect = () => {
    // Calculate quotes for each carrier with rates
    const age = parseInt(data.age);
    const carrierQuotes =
      age && data.gender
        ? {
            Aflac: calculateMonthlyPremium(
              "Aflac",
              age,
              data.gender,
              data.tobacco,
              data.faceAmount
            ),
            SBLI: calculateMonthlyPremium(
              "SBLI",
              age,
              data.gender,
              data.tobacco,
              data.faceAmount
            ),
            CICA: calculateMonthlyPremium(
              "CICA",
              age,
              data.gender,
              data.tobacco,
              data.faceAmount
            ),
            GTL: calculateMonthlyPremium(
              "GTL",
              age,
              data.gender,
              data.tobacco,
              data.faceAmount
            ),
            TransAmerica: calculateMonthlyPremium(
              "TransAmerica",
              age,
              data.gender,
              data.tobacco,
              data.faceAmount
            ),
            Corebridge: calculateMonthlyPremium(
              "Corebridge",
              age,
              data.gender,
              data.tobacco,
              data.faceAmount
            ),
          }
        : {};

    const selectedCarrierQuote =
      data.carrier && CARRIER_CONFIG[data.carrier]
        ? carrierQuotes[data.carrier]
        : null;
    const hasCarrierRates = [
      "Aflac",
      "SBLI",
      "CICA",
      "GTL",
      "TransAmerica",
      "Corebridge",
    ].includes(data.carrier);

    // Auto-calculate age from DOB
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

    return (
      <div className="animate-fade-in">
        <SectionTitle
          icon={FileText}
          title="Policy & Premium"
          subtitle="Configure the policy details."
        />

        {/* Customer Info Row - all inline */}
        <div className="p-2 bg-blue-50 rounded-lg border border-blue-200 mb-2">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 items-end">
            <Input
              type="date"
              label="Date of Birth"
              value={data.dob}
              onChange={handleDobChange}
              required
            />
            <div className="flex flex-col gap-0.5">
              <label className="text-xs font-semibold text-slate-500 uppercase">Age</label>
              <div className="p-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 text-sm text-center">
                {data.age || "-"}
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-xs font-semibold text-slate-500 uppercase">Gender *</label>
              <div className="flex gap-1">
                <button
                  onClick={() => update("gender", "Male")}
                  className={`flex-1 p-2 rounded-lg font-bold text-sm transition-all ${
                    data.gender === "Male"
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-slate-200 text-slate-600"
                  }`}
                >
                  M
                </button>
                <button
                  onClick={() => update("gender", "Female")}
                  className={`flex-1 p-2 rounded-lg font-bold text-sm transition-all ${
                    data.gender === "Female"
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-slate-200 text-slate-600"
                  }`}
                >
                  F
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-xs font-semibold text-slate-500 uppercase">Tobacco</label>
              <div className="flex gap-1">
                <button
                  onClick={() => update("tobacco", true)}
                  className={`flex-1 p-2 rounded-lg font-bold text-sm transition-all ${
                    data.tobacco === true
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-slate-200 text-slate-500"
                  }`}
                >
                  Yes
                </button>
                <button
                  onClick={() => update("tobacco", false)}
                  className={`flex-1 p-2 rounded-lg font-bold text-sm transition-all ${
                    data.tobacco === false
                      ? "bg-slate-700 text-white"
                      : "bg-white border border-slate-200 text-slate-500"
                  }`}
                >
                  No
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-0.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-500 uppercase">Coverage: ${data.faceAmount.toLocaleString()}</label>
              <input
                type="range"
                min="5000"
                max="50000"
                step="1000"
                value={data.faceAmount}
                onChange={(e) => update("faceAmount", parseInt(e.target.value))}
                className="h-8 bg-white rounded-lg appearance-none cursor-pointer accent-blue-600 border border-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Policy Type + Quote Display Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
          {/* Policy Types */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Policy Type</label>
            <div className="grid grid-cols-3 gap-1">
              {data.carrier &&
                CARRIERS[data.carrier].map((policy) => (
                  <button
                    key={policy}
                    onClick={() => {
                      update("planType", policy);
                      if (selectedCarrierQuote) {
                        update("monthlyPremium", selectedCarrierQuote.toFixed(2));
                      }
                    }}
                    className={`p-2 rounded-lg border-2 text-xs font-bold transition-all ${
                      data.planType === policy
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {policy}
                  </button>
                ))}
              {!data.carrier && (
                <p className="text-slate-500 italic text-sm col-span-3">Select a carrier first.</p>
              )}
            </div>
          </div>

          {/* Quote Display */}
          {hasCarrierRates && selectedCarrierQuote && (
            <div className="p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                  <CarrierLogo carrier={data.carrier} size="sm" />
                  <p className="text-2xl font-bold text-green-700">${selectedCarrierQuote.toFixed(2)}<span className="text-sm">/mo</span></p>
                </div>
                <div className="text-right text-xs text-green-600">
                  <p>Age {data.age}, {data.gender}</p>
                  <p>${data.faceAmount.toLocaleString()} coverage</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Compare Quotes - All 6 carriers in one row */}
        {data.age && data.gender && (
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-700">Compare Carriers</span>
              <span className="text-xs text-slate-500">{data.tobacco ? "Tobacco" : "Non-Tobacco"} rates</span>
            </div>
            <div className="grid grid-cols-6 gap-1">
              {["Aflac", "SBLI", "CICA", "GTL", "TransAmerica", "Corebridge"].map((carrier) => {
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
                    className={`p-1.5 rounded-lg border-2 text-center transition-all ${
                      isSelected
                        ? "border-blue-600 bg-blue-50"
                        : quote
                        ? "border-slate-200 hover:border-blue-300"
                        : "border-slate-100 bg-slate-100 opacity-50"
                    }`}
                    disabled={!quote}
                  >
                    <div className="flex items-center justify-center min-h-[24px] mb-1">
                      <CarrierLogo carrier={carrier} size="xs" />
                    </div>
                    {quote ? (
                      <p className={`text-sm font-bold ${isSelected ? "text-blue-600" : "text-green-600"}`}>
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

        {/* Monthly Premium Input */}
        <div className="flex items-end gap-2">
          <Input
            label="Monthly Premium ($)"
            type="number"
            placeholder="0.00"
            value={data.monthlyPremium}
            onChange={(e) => update("monthlyPremium", e.target.value)}
            className="flex-1"
          />
          {hasCarrierRates && selectedCarrierQuote && data.monthlyPremium !== selectedCarrierQuote.toFixed(2) && (
            <button
              onClick={() => update("monthlyPremium", selectedCarrierQuote.toFixed(2))}
              className="p-2 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 whitespace-nowrap"
            >
              <RefreshCw size={12} /> Use ${selectedCarrierQuote.toFixed(2)}
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderStep1 = () => {
    // Auto-calculate age from DOB
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

    return (
      <div className="animate-fade-in">
        <SectionTitle
          icon={User}
          title="Personal Information"
          subtitle="Tell us about the proposed insured."
        />
        
        {/* Row 1: Name fields */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-2">
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
            placeholder="(555) 555-5555"
            value={data.phone}
            onChange={(e) => update("phone", e.target.value)}
            required
          />
        </div>

        {/* Row 2: Address */}
        <div className="grid grid-cols-6 gap-2 mb-2">
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
          />
          <Select
            label="State"
            options={STATES}
            value={data.state}
            onChange={(e) => update("state", e.target.value)}
          />
          <Input
            label="Zip"
            value={data.zip}
            onChange={(e) => update("zip", e.target.value)}
          />
        </div>

        {/* Row 3: DOB, Age, State of Birth, SSN, Height, Weight */}
        <div className="grid grid-cols-6 gap-2 mb-2">
          <Input
            type="date"
            label="Date of Birth"
            value={data.dob}
            onChange={handleDobChange}
            required
          />
          <div className="flex flex-col gap-0.5">
            <label className="text-xs font-semibold text-slate-500 uppercase">Age</label>
            <div className="p-2 bg-slate-100 border border-slate-200 rounded-lg font-bold text-slate-700 text-sm text-center">
              {data.age || "-"}
            </div>
          </div>
          <Select
            label="Birth State"
            options={STATES}
            value={data.stateOfBirth}
            onChange={(e) => update("stateOfBirth", e.target.value)}
          />
          <Input
            label="SSN"
            placeholder="XXX-XX-XXXX"
            value={data.ssn}
            onChange={(e) => update("ssn", e.target.value)}
            required
          />
          <Select
            label="Height"
            options={HEIGHT_OPTIONS}
            value={data.height}
            onChange={(e) => update("height", e.target.value)}
          />
          <div className="flex flex-col gap-0.5">
            <label className="text-xs font-semibold text-slate-500 uppercase">Weight</label>
            <input
              type="number"
              min="50"
              max="500"
              value={data.weight}
              onChange={(e) => update("weight", parseInt(e.target.value) || 0)}
              className="p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium text-sm"
            />
          </div>
        </div>

        {/* Row 4: Gender + Owner Section side by side */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {/* Gender */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Gender</label>
            <div className="flex gap-2">
              {["Male", "Female"].map((g) => (
                <button
                  key={g}
                  onClick={() => update("gender", g)}
                  className={`flex-1 p-2 rounded-lg border-2 font-bold text-sm transition-all ${
                    data.gender === g
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-200 text-slate-400"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Owner Section - inline */}
          <div className="md:col-span-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs font-bold text-slate-600 mb-1">Policy Owner (if different)</p>
            <div className="grid grid-cols-4 gap-2">
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
                placeholder="XXX-XX-XXXX"
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
  };

  const renderStep2 = () => (
    <div className="animate-fade-in">
      <SectionTitle
        icon={Heart}
        title="Beneficiaries"
        subtitle="Designate your beneficiaries."
      />

      {/* Primary Beneficiary */}
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 mb-6">
        <h3 className="font-bold text-blue-800 mb-4">Primary Beneficiary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* Contingent Beneficiary */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6">
        <h3 className="font-bold text-slate-700 mb-2">
          Contingent Beneficiary (Optional)
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          This person will receive benefits if the primary beneficiary is unable
          to.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
  );

  const renderStep3 = () => (
    <div className="animate-fade-in">
      <SectionTitle
        icon={Stethoscope}
        title="Health Information"
        subtitle="Answer all questions honestly. Your answers determine plan eligibility."
      />

      <div className="mb-3">
        <Input
          label="Physician Name (if applicable)"
          value={data.physicianName}
          onChange={(e) => update("physicianName", e.target.value)}
        />
      </div>

      <div className="p-3 bg-red-50 rounded-lg border border-red-200 mb-3">
        <h3 className="font-bold text-red-800 mb-2 flex items-center gap-2 text-sm">
          <AlertTriangle size={16} /> Critical Questions (1-3)
        </h3>
        <p className="text-xs text-red-700 mb-2">
          If any "Yes", proposed insured is not eligible.
        </p>
        <YesNo
          label="1. Are you currently hospitalized, confined to nursing facility/bed/wheelchair, using oxygen, receiving Hospice care, had amputation from disease, have cancer (excl. basal cell), or need assistance with daily living?"
          value={data.q1}
          onChange={(v) => update("q1", v)}
        />

        <YesNo
          label="2. Advised for organ transplant, dialysis, CHF, Alzheimer's, dementia, ALS, or terminal condition?"
          value={data.q2}
          onChange={(v) => update("q2", v)}
        />
        <YesNo
          label="3. Diagnosed with AIDS, ARC, immune deficiency, or HIV positive?"
          value={data.q3}
          onChange={(v) => update("q3", v)}
        />
      </div>

      <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 mb-3">
        <h3 className="font-bold text-yellow-800 mb-2 text-sm">
          Questions 4-7 (Return of Premium)
        </h3>
        <YesNo
          label="4. Diabetes complications or insulin before age 50?"
          value={data.q4}
          onChange={(v) => update("q4", v)}
        />
        <YesNo
          label="5. Renal insufficiency, kidney disease, or multiple cancers?"
          value={data.q5}
          onChange={(v) => update("q5", v)}
        />
        <YesNo
          label="6. Past 2 years: testing/surgery not completed?"
          value={data.q6}
          onChange={(v) => update("q6", v)}
        />
        <YesNo
          label="7a. Past 2 years: angina, stroke, COPD, Hepatitis C, or oxygen?"
          value={data.q7a}
          onChange={(v) => update("q7a", v)}
        />
        <YesNo
          label="7b. Heart attack, aneurysm, or heart/brain surgery?"
          value={data.q7b}
          onChange={(v) => update("q7b", v)}
        />
        <YesNo
          label="7c. Any cancer (excl. basal cell)?"
          value={data.q7c}
          onChange={(v) => update("q7c", v)}
        />
        <YesNo
          label="7d. Illegal drugs or alcohol abuse?"
          value={data.q7d}
          onChange={(v) => update("q7d", v)}
        />
      </div>

      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 mb-3">
        <h3 className="font-bold text-blue-800 mb-2 text-sm">
          Question 8 (Graded Plan)
        </h3>
        <YesNo
          label="8a. Past 3 years: stroke, heart attack, aneurysm, heart surgery?"
          value={data.q8a}
          onChange={(v) => update("q8a", v)}
        />
        <YesNo
          label="8b. Cancer, emphysema, COPD, cirrhosis, liver disease?"
          value={data.q8b}
          onChange={(v) => update("q8b", v)}
        />
        <YesNo
          label="8c. Paralysis, cerebral palsy, MS, seizures, Parkinson's?"
          value={data.q8c}
          onChange={(v) => update("q8c", v)}
        />
      </div>

      {/* Eligibility and Carrier Display */}
      {(() => {
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

        if (anyYes) {
          // Calculate Corebridge premium
          const age = parseInt(data.age);
          const corebridgePremium =
            age && data.gender && data.faceAmount
              ? calculateMonthlyPremium(
                  "Corebridge",
                  age,
                  data.gender,
                  data.tobacco,
                  data.faceAmount
                )
              : null;

          return (
            <div className="mt-3 p-3 rounded-lg bg-blue-100 text-blue-900">
              <div className="flex items-center gap-3 mb-3">
                <Shield size={20} />
                <p className="font-bold">
                  Recommended Carrier: Corebridge - Guaranteed Issue
                </p>
              </div>
              {corebridgePremium ? (
                <div className="p-3 bg-white rounded-lg border border-blue-200">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-xs font-bold text-blue-600 uppercase">
                        Monthly Premium
                      </p>
                      <p className="text-2xl font-bold text-blue-800">
                        ${corebridgePremium.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-sm text-blue-600">
                      <p>Coverage: ${data.faceAmount.toLocaleString()}</p>
                      <p>
                        Age: {data.age} | {data.gender}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-blue-700">
                  Complete customer information to see premium.
                </p>
              )}
            </div>
          );
        }

        return (
          <div
            className={`mt-3 p-3 rounded-lg flex items-center gap-3 ${
              eligibility.status === "ineligible"
                ? "bg-red-100 text-red-900"
                : eligibility.status === "modified"
                ? "bg-yellow-100 text-yellow-900"
                : "bg-green-100 text-green-900"
            }`}
          >
            <Activity size={20} />
            <p className="font-bold">{eligibility.message}</p>
          </div>
        );
      })()}
    </div>
  );

  const renderStep4 = () => (
    <div className="animate-fade-in">
      <SectionTitle
        icon={DollarSign}
        title="Coverage & Options"
        subtitle="Select your plan details and additional options."
      />

      <div className="p-3 bg-slate-900 text-white rounded-xl shadow-lg mb-3">
        <h3 className="text-blue-300 font-bold uppercase text-xs mb-1">
          Eligible Plan
        </h3>
        <h2 className="text-xl font-bold">{data.planType}</h2>
        <p className="text-slate-400 text-xs">Based on your health profile.</p>
      </div>

      <div className="mb-3">
        <label className="text-xs font-semibold text-slate-500 uppercase block mb-2">
          Face Amount: ${data.faceAmount.toLocaleString()}
        </label>
        <input
          type="range"
          min="1000"
          max="50000"
          step="1000"
          value={data.faceAmount}
          onChange={(e) => update("faceAmount", parseInt(e.target.value))}
          className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>

      {/* Willing to Accept */}
      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 mb-3">
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={data.willingToAccept}
            onChange={(e) => update("willingToAccept", e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-blue-600"
          />
          <span className="text-xs text-slate-700">
            <strong>
              Check here if you are willing to accept any plan for which you
              qualify
            </strong>{" "}
            based on this application. The insurance may have a graded or return
            of premium death benefit for the first 2-3 years, a face amount less
            than indicated, and riders may not be available.
          </span>
        </label>
      </div>

      {/* Tobacco */}
      <YesNo
        label="During the past 12 months have you used tobacco in any form (excluding occasional pipe and cigar use)?"
        value={data.tobacco}
        onChange={(v) => update("tobacco", v)}
      />

      {/* Existing Insurance */}
      <YesNo
        label="Do you have existing life insurance or an annuity contract?"
        value={data.hasExisting}
        onChange={(v) => update("hasExisting", v)}
      />
      {data.hasExisting && (
        <div className="ml-6 mt-2">
          <YesNo
            label="Will you replace an existing life insurance policy or annuity?"
            value={data.willReplace}
            onChange={(v) => update("willReplace", v)}
          />
        </div>
      )}
    </div>
  );

  const renderStep5 = () => (
    <div className="animate-fade-in">
      <SectionTitle
        icon={CreditCard}
        title="Payment"
        subtitle="Bank Draft Setup"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
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

      {/* Draft Schedule */}
      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 mb-3">
        <h3 className="font-bold text-slate-700 mb-2 text-sm">Draft Schedule</h3>
        <YesNo
          label="Would you like your draft to coincide with your Social Security payment schedule?"
          value={data.draftSchedule === "ss_payment"}
          onChange={(v) =>
            update("draftSchedule", v ? "ss_payment" : "specific_date")
          }
        />

        {data.draftSchedule === "ss_payment" && (
          <div className="mt-2">
            <Select
              label="Social Security Draft Day"
              options={[
                "1st of Month",
                "3rd of Month",
                "2nd Wednesday",
                "3rd Wednesday",
                "4th Wednesday",
              ]}
              value={data.draftDate}
              onChange={(e) => update("draftDate", e.target.value)}
            />
          </div>
        )}

        {data.draftSchedule !== "ss_payment" && (
          <div className="mt-2">
            <Select
              label="Requested Draft Day (1st-28th)"
              options={[...Array(28).keys()].map((i) => `${i + 1}`)}
              value={data.draftDate}
              onChange={(e) => update("draftDate", e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderReview = () => (
    <div className="animate-fade-in">
      <SectionTitle
        icon={CheckCircle}
        title="Review"
        subtitle="Confirm and Submit"
      />
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4 border-b pb-4 mb-2">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">
              Carrier
            </span>
            <p className="font-bold text-slate-800">{data.carrier || "N/A"}</p>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">
              Premium
            </span>
            <p className="font-bold text-green-600 text-lg">
              ${data.monthlyPremium || (data.faceAmount * 0.003).toFixed(2)}/mo
            </p>
          </div>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="text-slate-500">Proposed Insured</span>
          <span className="font-bold">
            {data.firstName} {data.lastName}
          </span>
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
      <button
        onClick={handleSubmit}
        className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg text-lg"
      >
        Submit Application
      </button>
    </div>
  );

  const totalSteps = 8;
  const nextStep = () => {
    // Validation logic per step
    if (step === 1 && !data.carrier) {
      alert("Please select a carrier.");
      return;
    }
    if (step === 2) {
      if (!data.planType) {
        alert("Please select a policy type.");
        return;
      }
      if (!data.dob || !data.age) {
        alert("Please enter date of birth.");
        return;
      }
      if (!data.gender) {
        alert("Please select gender.");
        return;
      }
      if (data.tobacco === null) {
        alert("Please answer the tobacco question.");
        return;
      }
      // Premium check - allow if monthlyPremium is set OR if we're on a carrier without rate tables
      const hasRates = [
        "Aflac",
        "SBLI",
        "CICA",
        "GTL",
        "TransAmerica",
        "Corebridge",
      ].includes(data.carrier);
      if (hasRates && !data.monthlyPremium) {
        alert(
          "Please select a carrier from the quote comparison or enter a premium manually."
        );
        return;
      }
    }
    if (step === 7 && (!data.accountNum || !data.routing || !data.draftDate)) {
      alert("Please complete all banking details including Draft Date.");
      return;
    }
    setStep(Math.min(totalSteps, step + 1));
  };
  const prevStep = () => setStep(Math.max(1, step - 1));

  return (
    <div className="max-w-3xl mx-auto px-4 py-2 bg-white">
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
      <div className="mt-3 flex justify-between">
        <button
          onClick={prevStep}
          disabled={step === 1}
          className="px-6 py-2 text-slate-500 font-bold disabled:opacity-0"
        >
          Back
        </button>
        {step < 8 && (
          <button
            onClick={nextStep}
            className="px-6 py-2 bg-blue-900 text-white rounded-lg font-bold"
          >
            Next Step
          </button>
        )}
      </div>
    </div>
  );
};

// --- Component: Admin Dashboard ---

const AdminDashboard = ({ submissions, onLogout, onUpdateSubmission }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);
  const [timeFilter, setTimeFilter] = useState("YTD");
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [notification, setNotification] = useState(null);
  const [prevSubmissionCount, setPrevSubmissionCount] = useState(0);

  // Detect new applications and show notification
  useEffect(() => {
    if (submissions.length > prevSubmissionCount && prevSubmissionCount > 0) {
      const newApp = submissions[0]; // Latest app is at the top

      // Play notification sound
      const audio = new Audio(
        "data:audio/wav;base64,UklGRl4FAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YToFAACAgICAgICAgICAgICAgICA/v8AAP7/AAD+/wAA/v8AAP7/AAD+/wAA/v8AAP7/AAD+/wAA/v8AAP7/AAD+/wAA/v8AAP7/AAD+/wAAAAAAAP7/AAD+/wAA/v8AAP7/AAD+/wAA/v8AAP7/AAD+/wAA/v8AAP7/AAD+/wAA/v8AAP7/AAD+/wAA/v8AAP7/AAD+/wAA/v8AAP7/AAD+/wAA/v8AAP7/AAD+/wAA/v8AAP7/AAD+/wAAAAAAAAAAAACAgICAgICAgICAgICAgIA="
      );
      audio.volume = 0.5;
      audio.play().catch(() => {}); // Ignore if audio fails

      // Show visual notification
      setNotification({
        title: "New Application!",
        message: `${
          newApp.name || newApp.firstName + " " + newApp.lastName
        } submitted a new application`,
        app: newApp,
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
    return submissions.filter(
      (sub) =>
        sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [submissions, searchTerm]);

  const SidebarItem = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-1 ${
        activeTab === id
          ? "bg-blue-600 text-white shadow-md"
          : "text-slate-400 hover:bg-slate-800 hover:text-white"
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  const StatusBadge = ({ status }) => {
    const styles = {
      Submitted: "bg-blue-100 text-blue-700 border-blue-200",
      Underwriting: "bg-indigo-100 text-indigo-700 border-indigo-200",
      Issued: "bg-green-100 text-green-700 border-green-200",
      Paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
      "Not Taken": "bg-slate-100 text-slate-500 border-slate-200",
      Lapsed: "bg-red-50 text-red-600 border-red-200",
      // Legacy statuses for backwards compatibility
      Approved: "bg-green-100 text-green-700 border-green-200",
      "Paid & Issued": "bg-emerald-100 text-emerald-700 border-emerald-200",
      Active: "bg-blue-100 text-blue-700 border-blue-200",
      Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    };
    return (
      <span
        className={`px-2 py-1 rounded-md text-xs font-bold border whitespace-nowrap ${
          styles[status] || "bg-slate-100 text-slate-600"
        }`}
      >
        {status}
      </span>
    );
  };

  // --- Analytics Logic ---

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
      submitted: filtered.filter((s) => s.status === "Submitted").length,
      underwriting: filtered.filter((s) => s.status === "Underwriting").length,
      issued: filtered.filter((s) => s.status === "Issued").length,
      paid: filtered.filter((s) => s.status === "Paid").length,
      notTaken: filtered.filter((s) => s.status === "Not Taken").length,
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

    return { counts, retentionRate, appsToIssue };
  }, [submissions, timeFilter]);

  // --- Renderers ---

  const renderOverview = () => (
    <div className="animate-fade-in space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Apps",
            val: submissions.length,
            icon: FileText,
            color: "blue",
          },
          {
            label: "Issued/Paid",
            val: analyticsData.counts.issued + analyticsData.counts.paid,
            icon: Shield,
            color: "green",
          },
          {
            label: "Underwriting",
            val: analyticsData.counts.underwriting,
            icon: Activity,
            color: "orange",
          },
          {
            label: "Avg Premium",
            val:
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
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">
                {stat.label}
              </p>
              <h3 className="text-2xl font-bold text-slate-800">{stat.val}</h3>
            </div>
            <div
              className={`p-3 rounded-lg bg-${stat.color}-50 text-${stat.color}-600`}
            >
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
              Today's analysis suggests a 15% increase in Graded Benefit
              qualifications due to recent health questionnaire trends in the
              Southeast region.
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
          <button
            onClick={() => setActiveTab("applications")}
            className="text-sm text-blue-600 font-semibold hover:underline"
          >
            View All
          </button>
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
              <tr
                key={row.id}
                className="hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => setSelectedApp(row)}
              >
                <td className="px-6 py-4 font-mono text-slate-500">{row.id}</td>
                <td className="px-6 py-4 font-medium text-slate-800">
                  {row.name}
                </td>
                <td className="px-6 py-4 text-slate-600 truncate max-w-[150px]">
                  {row.plan}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={row.status} />
                </td>
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
          {["Daily", "Weekly", "Monthly", "Quarterly", "YTD"].map((period) => (
            <button
              key={period}
              onClick={() => setTimeFilter(period)}
              className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${
                timeFilter === period
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Applications",
            val: analyticsData.counts.applications,
            icon: FileText,
            color: "blue",
          },
          {
            label: "Underwriting",
            val: analyticsData.counts.underwriting,
            icon: Activity,
            color: "indigo",
          },
          {
            label: "Issued",
            val: analyticsData.counts.issued,
            icon: CheckCircle,
            color: "green",
          },
          {
            label: "Paid & Issued",
            val: analyticsData.counts.paidIssued,
            icon: DollarSign,
            color: "emerald",
          },
          {
            label: "Active",
            val: analyticsData.counts.active,
            icon: Shield,
            color: "blue",
          },
          {
            label: "Not Taken",
            val: analyticsData.counts.notTaken,
            icon: X,
            color: "slate",
          },
          {
            label: "Cancelled",
            val: analyticsData.counts.cancelled,
            icon: AlertOctagon,
            color: "orange",
          },
          {
            label: "Lapsed",
            val: analyticsData.counts.lapsed,
            icon: AlertTriangle,
            color: "red",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start mb-2">
              <div
                className={`p-2 rounded-lg bg-${stat.color}-50 text-${stat.color}-600`}
              >
                <stat.icon size={20} />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {stat.label}
              </span>
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
                <span className="text-2xl font-bold">
                  {analyticsData.retentionRate}%
                </span>
                <span className="text-xs text-green-400 font-bold bg-green-400/10 px-2 py-1 rounded">
                  +2.4% vs last year
                </span>
              </div>
              <p className="text-slate-300 font-medium">Retention Rate</p>
              <p className="text-xs text-slate-500 mt-1">
                Active / (Active + Cancelled + Lapsed)
              </p>
              <div className="w-full h-1.5 bg-slate-700 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${analyticsData.retentionRate}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <div className="flex justify-between items-end mb-2">
                <span className="text-2xl font-bold">
                  {analyticsData.appsToIssue}%
                </span>
                <span className="text-xs text-yellow-400 font-bold bg-yellow-400/10 px-2 py-1 rounded">
                  -1.2% vs last year
                </span>
              </div>
              <p className="text-slate-300 font-medium">Apps to Issue %</p>
              <p className="text-xs text-slate-500 mt-1">
                Active / Total Applications
              </p>
              <div className="w-full h-1.5 bg-slate-700 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${analyticsData.appsToIssue}%` }}
                ></div>
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
            <Filter size={16} /> Filter
          </button>
          <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-2">
            <Download size={16} /> Export
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
              <tr
                key={row.id}
                className="hover:bg-blue-50/50 transition-colors group"
              >
                <td className="px-6 py-4 font-mono text-slate-500">{row.id}</td>
                <td className="px-6 py-4 font-medium text-slate-800">
                  {row.name}
                </td>
                <td className="px-6 py-4 text-slate-500">{row.date}</td>
                <td className="px-6 py-4 text-slate-600 max-w-[200px] truncate">
                  {row.plan}
                </td>
                <td className="px-6 py-4 font-medium">
                  ${parseFloat(row.premium).toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={row.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => setSelectedApp(row)}
                    className="text-slate-400 hover:text-blue-600 p-1"
                  >
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
          <h3 className="font-bold text-slate-800 text-lg">
            Customer Directory
          </h3>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow hover:bg-blue-700 flex items-center gap-2">
          <Download size={16} /> Export CSV
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        {customers.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <Users size={48} className="mx-auto mb-4 opacity-50" />
            <p>
              No customers yet. Submit an application to see customers here.
            </p>
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
                <tr
                  key={cust.id}
                  className="hover:bg-blue-50/50 transition-colors group"
                >
                  <td className="px-6 py-4 font-mono text-slate-500">
                    {cust.id}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                      {cust.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "?"}
                    </div>
                    {cust.name}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    <div className="flex items-center gap-2">
                      <Mail size={12} /> {cust.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {cust.policies}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">
                    ${cust.ltv.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={cust.status} />
                  </td>
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

        <div className="bg-purple-600 text-white p-6 rounded-xl shadow-lg">
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
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0 transition-all">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center justify-center mb-2">
            <img
              src="/amerben.png"
              alt="American Beneficiary"
              className="h-12 w-auto object-contain"
            />
          </div>
          <p className="text-xs text-slate-400 uppercase tracking-widest text-center">
            Admin Portal
          </p>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <p className="text-xs font-bold text-slate-500 uppercase mb-3 pl-4">
            Main Menu
          </p>
          <SidebarItem id="overview" icon={LayoutDashboard} label="Dashboard" />

          <p className="text-xs font-bold text-slate-500 uppercase mt-6 mb-3 pl-4">
            Analytics
          </p>
          <SidebarItem id="analytics" icon={PieChart} label="Performance" />
          <SidebarItem
            id="ai-risk"
            icon={BrainCircuit}
            label="AI Risk Center"
          />

          <p className="text-xs font-bold text-slate-500 uppercase mt-6 mb-3 pl-4">
            Management
          </p>
          <SidebarItem id="applications" icon={FileText} label="Applications" />
          <SidebarItem id="customers" icon={Users} label="Customers" />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
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
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="text-xl font-bold text-slate-800 capitalize">
              {activeTab.replace("-", " ")}
            </h2>
            {/* AI Smart Search */}
            <div className="relative flex-1 max-w-md ml-8 group">
              <Search
                className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder="Ask AI: 'Show pending apps...'"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
              <Sparkles
                className="absolute right-3 top-2.5 text-purple-500 opacity-0 group-focus-within:opacity-100 transition-opacity"
                size={16}
              />
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
          {activeTab === "overview" && renderOverview()}
          {activeTab === "analytics" && renderAnalytics()}
          {activeTab === "applications" && renderApplications()}
          {activeTab === "customers" && renderCustomers()}
          {activeTab === "ai-risk" && renderAIRiskCenter()}
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
                      <h2 className="text-2xl font-bold text-slate-900">
                        {selectedApp.name ||
                          selectedApp.firstName + " " + selectedApp.lastName}
                      </h2>
                      <StatusBadge status={selectedApp.status} />
                      <select
                        value={editData.status || selectedApp.status}
                        onChange={(e) => {
                          const newStatus = e.target.value;
                          setEditData((prev) => ({
                            ...prev,
                            status: newStatus,
                          }));
                          onUpdateSubmission({
                            ...selectedApp,
                            status: newStatus,
                          });
                          setSelectedApp((prev) => ({
                            ...prev,
                            status: newStatus,
                          }));
                        }}
                        className="ml-2 border border-slate-300 rounded-lg px-2 py-1 text-sm font-bold text-slate-700 cursor-pointer hover:border-blue-400 focus:outline-none focus:border-blue-500"
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
                        <Calendar size={14} /> {formatDate(selectedApp.date)}
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

              <div className="p-8 space-y-8 bg-slate-50/50 flex-1">
                {/* Top Row: Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase">
                      Risk Score
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-2xl font-bold ${
                          selectedApp.riskScore > 50
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {selectedApp.riskScore || "Pending"}
                      </span>
                      <Activity size={16} className="text-slate-400" />
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase">
                      Monthly Premium
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl font-bold text-slate-800">
                        ${parseFloat(selectedApp.premium).toFixed(2)}
                      </span>
                      <DollarSign size={16} className="text-slate-400" />
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm md:col-span-2 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">
                        Carrier
                      </p>
                      <CarrierLogo carrier={selectedApp.carrier || "American Amicable"} size="lg" />
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-400 uppercase">
                        Plan
                      </p>
                      <p className="text-lg font-bold text-blue-600">
                        {selectedApp.plan}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Main Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Column 1: Personal & Policy */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                        <User size={20} className="text-blue-500" /> Personal
                        Information
                      </h3>
                      <div className="grid grid-cols-1 gap-2">
                        <DataField
                          label="Full Name"
                          value={`${
                            selectedApp.firstName || selectedApp.name
                          } ${selectedApp.middleName || ""} ${
                            selectedApp.lastName || ""
                          }`}
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
                          <DataField
                            label="Height"
                            value={selectedApp.height}
                          />
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
                        <DataField
                          label="Address"
                          value={selectedApp.address}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <DataField label="City" value={selectedApp.city} />
                          <DataField label="State" value={selectedApp.state} />
                        </div>
                        <DataField label="Zip Code" value={selectedApp.zip} />
                        <DataField
                          label="Phone"
                          value={selectedApp.phone || "(555) 000-0000"}
                        />
                        <DataField
                          label="Email"
                          value={selectedApp.email || "N/A"}
                        />
                      </div>
                    </div>

                    {/* Owner Section - only show if owner exists */}
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
                        <Heart size={20} className="text-red-500" />{" "}
                        Beneficiaries
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
                        <DataField
                          label="Bank Name"
                          value={selectedApp.bankName}
                        />
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
                          label={
                            selectedApp.draftSchedule === "ss_payment"
                              ? "SS Payment Day"
                              : "Draft Date"
                          }
                          value={selectedApp.draftDate}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Health & Status */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                        <Stethoscope size={20} className="text-purple-500" />{" "}
                        Health & Underwriting
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

                        <div className="border-t border-slate-100 pt-3">
                          <p className="text-xs font-bold text-red-600 uppercase mb-2">
                            Knockout Questions (1-3)
                          </p>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Q1</span>
                              <span
                                className={
                                  selectedApp.q1
                                    ? "text-red-600 font-bold"
                                    : "text-green-600"
                                }
                              >
                                {selectedApp.q1 ? "YES" : "NO"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Q2</span>
                              <span
                                className={
                                  selectedApp.q2
                                    ? "text-red-600 font-bold"
                                    : "text-green-600"
                                }
                              >
                                {selectedApp.q2 ? "YES" : "NO"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Q3</span>
                              <span
                                className={
                                  selectedApp.q3
                                    ? "text-red-600 font-bold"
                                    : "text-green-600"
                                }
                              >
                                {selectedApp.q3 ? "YES" : "NO"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-slate-100 pt-3">
                          <p className="text-xs font-bold text-yellow-600 uppercase mb-2">
                            ROP Questions (4-7)
                          </p>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Q4</span>
                              <span
                                className={
                                  selectedApp.q4
                                    ? "text-yellow-600 font-bold"
                                    : "text-green-600"
                                }
                              >
                                {selectedApp.q4 ? "YES" : "NO"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Q5</span>
                              <span
                                className={
                                  selectedApp.q5
                                    ? "text-yellow-600 font-bold"
                                    : "text-green-600"
                                }
                              >
                                {selectedApp.q5 ? "YES" : "NO"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Q6</span>
                              <span
                                className={
                                  selectedApp.q6
                                    ? "text-yellow-600 font-bold"
                                    : "text-green-600"
                                }
                              >
                                {selectedApp.q6 ? "YES" : "NO"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Q7a</span>
                              <span
                                className={
                                  selectedApp.q7a
                                    ? "text-yellow-600 font-bold"
                                    : "text-green-600"
                                }
                              >
                                {selectedApp.q7a ? "YES" : "NO"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Q7b</span>
                              <span
                                className={
                                  selectedApp.q7b
                                    ? "text-yellow-600 font-bold"
                                    : "text-green-600"
                                }
                              >
                                {selectedApp.q7b ? "YES" : "NO"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Q7c</span>
                              <span
                                className={
                                  selectedApp.q7c
                                    ? "text-yellow-600 font-bold"
                                    : "text-green-600"
                                }
                              >
                                {selectedApp.q7c ? "YES" : "NO"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Q7d</span>
                              <span
                                className={
                                  selectedApp.q7d
                                    ? "text-yellow-600 font-bold"
                                    : "text-green-600"
                                }
                              >
                                {selectedApp.q7d ? "YES" : "NO"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-slate-100 pt-3">
                          <p className="text-xs font-bold text-blue-600 uppercase mb-2">
                            Graded Questions (8)
                          </p>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Q8a</span>
                              <span
                                className={
                                  selectedApp.q8a
                                    ? "text-blue-600 font-bold"
                                    : "text-green-600"
                                }
                              >
                                {selectedApp.q8a ? "YES" : "NO"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Q8b</span>
                              <span
                                className={
                                  selectedApp.q8b
                                    ? "text-blue-600 font-bold"
                                    : "text-green-600"
                                }
                              >
                                {selectedApp.q8b ? "YES" : "NO"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Q8c</span>
                              <span
                                className={
                                  selectedApp.q8c
                                    ? "text-blue-600 font-bold"
                                    : "text-green-600"
                                }
                              >
                                {selectedApp.q8c ? "YES" : "NO"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Riders & Coverage Options */}
                    <div>
                      <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                        <Shield size={20} className="text-purple-600" />{" "}
                        Coverage Options
                      </h3>
                      <div className="space-y-4">
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

                        {(selectedApp.grandchildCount > 0 ||
                          selectedApp.grandchildUnits > 0) && (
                          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                            <p className="text-xs font-bold text-purple-700 uppercase mb-2">
                              Grandchild Rider
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              <DataField
                                label="Children"
                                value={selectedApp.grandchildCount}
                              />
                              <DataField
                                label="Units"
                                value={selectedApp.grandchildUnits}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                        <Shield size={20} className="text-blue-600" /> Agent
                        Actions
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
  const [view, setView] = useState("home"); // 'home', 'app', 'admin'
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
      // Create application object with name field for dashboard
      const newApp = {
        ...data,
        name: `${data.firstName} ${data.lastName}`.trim(),
        status: "Pending",
      };

      await api.createApplication(newApp);
      setLastSubmission(newApp);
      setView("success");
      // If we are logged in, reload the list
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

  // Intro Screen to choose path (for demo purposes)
  if (view === "home") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl shadow-2xl overflow-hidden min-h-[500px]">
          {/* Left: Customer Side */}
          <div
            className="p-10 flex flex-col justify-center items-center text-center border-r border-slate-100 group hover:bg-blue-50 transition-colors cursor-pointer"
            onClick={() => setView("app")}
          >
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform">
              <User size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Customer Application
            </h2>
            <p className="text-slate-500">
              Launch the smart application form for new insurance applicants.
            </p>
            <button className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full font-bold shadow-lg hover:shadow-blue-500/30 transition-shadow">
              Start App
            </button>
          </div>
          {/* Right: Admin Side */}
          <div
            className="p-10 flex flex-col justify-center items-center text-center group hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
            onClick={() => setView("admin")}
          >
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-700 group-hover:bg-slate-800 group-hover:text-white group-hover:scale-110 transition-transform">
              <LayoutDashboard size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 group-hover:text-white mb-2">
              Agent Dashboard
            </h2>
            <p className="text-slate-500 group-hover:text-slate-400">
              Login to the AI-powered backend to manage submissions and risks.
            </p>
            <button className="mt-6 px-6 py-2 bg-white border border-slate-300 text-slate-700 rounded-full font-bold hover:bg-slate-50 group-hover:bg-blue-600 group-hover:border-transparent group-hover:text-white transition-all">
              {isAuthenticated ? "Go to Dashboard" : "Login"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === "app") {
    return <CustomerForm onComplete={handleAppSubmit} />;
  }

  if (view === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full animate-fade-in">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Application Received
          </h2>
          <p className="text-slate-500 mb-6">
            Thank you, {lastSubmission?.firstName}. Your application ID is{" "}
            <span className="font-mono font-bold text-slate-700">
              {lastSubmission?.id}
            </span>
            .
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setView("home")}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold"
            >
              Return Home
            </button>
            <button
              onClick={() => setView("admin")}
              className="w-full py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold"
            >
              View in Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === "admin") {
    if (!isAuthenticated) {
      return (
        <>
          <div className="fixed top-4 left-4 z-50">
            <button
              onClick={() => setView("home")}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm text-slate-600 hover:text-slate-900 font-bold text-sm"
            >
              <ChevronLeft size={16} /> Back
            </button>
          </div>
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
