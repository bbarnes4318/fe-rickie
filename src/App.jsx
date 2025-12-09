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
  "Submitted", "Underwriting", "Issued", "Paid", "Not Taken", "Lapsed"
];

const PLAN_TYPES = [
  "Immediate Death Benefit", "Graded Death Benefit", "Return of Premium Death Benefit"
];

const CARRIERS = {
  "American Amicable": ["Level", "Graded", "Modified"],
  "Corebridge": ["Guaranteed Issue", "Simplified Issue"],
  "TransAmerica": ["Level", "Graded"],
  "Aflac": ["Level", "Graded", "Return of Premium"],
  "SBLI": ["Level", "Graded", "Return of Premium"],
  "CICA": ["Level", "Graded", "Return of Premium"],
  "GTL": ["Level", "Graded", "Return of Premium"]
};

// Carrier fee and monthly factor configuration (from rating.xlsx Key sheet)
const CARRIER_CONFIG = {
  "Aflac": { annualFee: 48, monthlyFactor: 0.0875, hasTobacco: true },
  "SBLI": { annualFee: 48, monthlyFactor: 0.087, hasTobacco: true },
  "CICA": { annualFee: 0, monthlyFactor: 1, hasTobacco: false },
  "GTL": { annualFee: 48, monthlyFactor: 0.08333, hasTobacco: false },
  "TransAmerica": { annualFee: 48, monthlyFactor: 0.0875, hasTobacco: true }
};

// Rate tables: cost per $1000 of death benefit (from rating.xlsx)
// Aflac: ages 45-80, smoker/non-smoker
const AFLAC_RATES = {
  45: { maleNS: 28.97, maleSm: 45.40, femaleNS: 24.00, femaleSm: 36.70 },
  46: { maleNS: 29.87, maleSm: 45.83, femaleNS: 24.41, femaleSm: 37.05 },
  47: { maleNS: 30.78, maleSm: 46.29, femaleNS: 24.81, femaleSm: 37.43 },
  48: { maleNS: 31.68, maleSm: 46.76, femaleNS: 25.22, femaleSm: 37.81 },
  49: { maleNS: 32.59, maleSm: 47.23, femaleNS: 25.62, femaleSm: 38.19 },
  50: { maleNS: 33.49, maleSm: 47.71, femaleNS: 26.03, femaleSm: 38.57 },
  51: { maleNS: 34.58, maleSm: 50.00, femaleNS: 26.60, femaleSm: 40.17 },
  52: { maleNS: 35.67, maleSm: 52.28, femaleNS: 27.16, femaleSm: 41.77 },
  53: { maleNS: 36.75, maleSm: 54.57, femaleNS: 27.73, femaleSm: 43.37 },
  54: { maleNS: 37.84, maleSm: 56.85, femaleNS: 28.29, femaleSm: 44.97 },
  55: { maleNS: 38.93, maleSm: 59.14, femaleNS: 28.86, femaleSm: 46.57 },
  56: { maleNS: 40.50, maleSm: 61.42, femaleNS: 30.04, femaleSm: 48.17 },
  57: { maleNS: 42.08, maleSm: 63.71, femaleNS: 31.23, femaleSm: 49.77 },
  58: { maleNS: 43.66, maleSm: 66.00, femaleNS: 32.42, femaleSm: 51.37 },
  59: { maleNS: 45.23, maleSm: 68.28, femaleNS: 33.61, femaleSm: 52.97 },
  60: { maleNS: 46.81, maleSm: 70.57, femaleNS: 34.80, femaleSm: 54.57 },
  61: { maleNS: 49.24, maleSm: 75.48, femaleNS: 36.93, femaleSm: 57.31 },
  62: { maleNS: 51.67, maleSm: 80.40, femaleNS: 39.06, femaleSm: 60.06 },
  63: { maleNS: 54.11, maleSm: 85.31, femaleNS: 41.20, femaleSm: 62.80 },
  64: { maleNS: 56.54, maleSm: 90.22, femaleNS: 43.33, femaleSm: 65.54 },
  65: { maleNS: 58.97, maleSm: 95.14, femaleNS: 45.46, femaleSm: 68.28 },
  66: { maleNS: 62.71, maleSm: 101.37, femaleNS: 48.42, femaleSm: 72.65 },
  67: { maleNS: 66.45, maleSm: 107.60, femaleNS: 51.37, femaleSm: 77.02 },
  68: { maleNS: 70.19, maleSm: 113.82, femaleNS: 54.33, femaleSm: 81.39 },
  69: { maleNS: 73.93, maleSm: 120.05, femaleNS: 57.28, femaleSm: 85.76 },
  70: { maleNS: 77.68, maleSm: 126.28, femaleNS: 60.24, femaleSm: 90.14 },
  71: { maleNS: 82.28, maleSm: 133.54, femaleNS: 64.16, femaleSm: 95.54 },
  72: { maleNS: 86.88, maleSm: 140.80, femaleNS: 68.08, femaleSm: 100.94 },
  73: { maleNS: 91.48, maleSm: 148.06, femaleNS: 72.00, femaleSm: 106.34 },
  74: { maleNS: 96.08, maleSm: 155.32, femaleNS: 75.92, femaleSm: 111.74 },
  75: { maleNS: 100.69, maleSm: 162.58, femaleNS: 79.84, femaleSm: 117.14 },
  76: { maleNS: 107.56, maleSm: 173.31, femaleNS: 85.35, femaleSm: 124.48 },
  77: { maleNS: 114.44, maleSm: 184.03, femaleNS: 90.86, femaleSm: 131.82 },
  78: { maleNS: 121.31, maleSm: 194.76, femaleNS: 96.37, femaleSm: 139.16 },
  79: { maleNS: 128.19, maleSm: 205.48, femaleNS: 101.88, femaleSm: 146.50 },
  80: { maleNS: 135.06, maleSm: 216.21, femaleNS: 107.39, femaleSm: 153.84 }
};

// SBLI: ages 50-85, smoker/non-smoker
const SBLI_RATES = {
  50: { maleNS: 38.90, maleSm: 52.90, femaleNS: 30.85, femaleSm: 41.80 },
  51: { maleNS: 40.35, maleSm: 55.05, femaleNS: 32.05, femaleSm: 43.25 },
  52: { maleNS: 41.80, maleSm: 57.20, femaleNS: 33.25, femaleSm: 44.70 },
  53: { maleNS: 43.25, maleSm: 59.35, femaleNS: 34.45, femaleSm: 46.15 },
  54: { maleNS: 44.70, maleSm: 61.50, femaleNS: 35.65, femaleSm: 47.60 },
  55: { maleNS: 46.15, maleSm: 63.65, femaleNS: 36.85, femaleSm: 49.05 },
  56: { maleNS: 48.20, maleSm: 66.50, femaleNS: 38.50, femaleSm: 51.25 },
  57: { maleNS: 50.25, maleSm: 69.35, femaleNS: 40.15, femaleSm: 53.45 },
  58: { maleNS: 52.30, maleSm: 72.20, femaleNS: 41.80, femaleSm: 55.65 },
  59: { maleNS: 54.35, maleSm: 75.05, femaleNS: 43.45, femaleSm: 57.85 },
  60: { maleNS: 56.40, maleSm: 77.90, femaleNS: 45.10, femaleSm: 60.05 },
  61: { maleNS: 59.35, maleSm: 82.40, femaleNS: 47.55, femaleSm: 63.35 },
  62: { maleNS: 62.30, maleSm: 86.90, femaleNS: 50.00, femaleSm: 66.65 },
  63: { maleNS: 65.25, maleSm: 91.40, femaleNS: 52.45, femaleSm: 69.95 },
  64: { maleNS: 68.20, maleSm: 95.90, femaleNS: 54.90, femaleSm: 73.25 },
  65: { maleNS: 71.15, maleSm: 100.40, femaleNS: 57.35, femaleSm: 76.55 },
  66: { maleNS: 76.20, maleSm: 108.50, femaleNS: 61.80, femaleSm: 83.50 },
  67: { maleNS: 81.25, maleSm: 116.60, femaleNS: 66.25, femaleSm: 90.45 },
  68: { maleNS: 86.30, maleSm: 124.70, femaleNS: 70.70, femaleSm: 97.40 },
  69: { maleNS: 91.35, maleSm: 132.80, femaleNS: 75.15, femaleSm: 104.35 },
  70: { maleNS: 96.40, maleSm: 140.90, femaleNS: 79.60, femaleSm: 111.30 },
  71: { maleNS: 103.35, maleSm: 151.55, femaleNS: 85.55, femaleSm: 120.05 },
  72: { maleNS: 110.30, maleSm: 162.20, femaleNS: 91.50, femaleSm: 128.80 },
  73: { maleNS: 117.25, maleSm: 172.85, femaleNS: 97.45, femaleSm: 137.55 },
  74: { maleNS: 124.20, maleSm: 183.50, femaleNS: 103.40, femaleSm: 146.30 },
  75: { maleNS: 131.15, maleSm: 194.15, femaleNS: 109.35, femaleSm: 155.05 },
  76: { maleNS: 140.40, maleSm: 208.05, femaleNS: 117.15, femaleSm: 166.35 },
  77: { maleNS: 149.65, maleSm: 221.95, femaleNS: 124.95, femaleSm: 177.65 },
  78: { maleNS: 158.90, maleSm: 235.85, femaleNS: 132.75, femaleSm: 188.95 },
  79: { maleNS: 168.15, maleSm: 249.75, femaleNS: 140.55, femaleSm: 200.25 },
  80: { maleNS: 177.40, maleSm: 263.65, femaleNS: 148.35, femaleSm: 211.55 },
  81: { maleNS: 189.30, maleSm: 281.00, femaleNS: 158.75, femaleSm: 225.55 },
  82: { maleNS: 201.20, maleSm: 298.35, femaleNS: 169.15, femaleSm: 239.55 },
  83: { maleNS: 213.10, maleSm: 315.70, femaleNS: 179.55, femaleSm: 253.55 },
  84: { maleNS: 225.00, maleSm: 333.05, femaleNS: 189.95, femaleSm: 267.55 },
  85: { maleNS: 236.90, maleSm: 350.40, femaleNS: 200.35, femaleSm: 281.55 }
};

// CICA: ages 45-85, gender only (no tobacco)
const CICA_RATES = {
  45: { male: 32.38, female: 30.03 },
  46: { male: 33.63, female: 31.21 },
  47: { male: 34.89, female: 32.39 },
  48: { male: 36.24, female: 33.64 },
  49: { male: 37.67, female: 34.90 },
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
  60: { male: 63.71, female: 56.70 },
  61: { male: 66.90, female: 59.41 },
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
  80: { male: 169.06, female: 145.40 },
  81: { male: 177.51, female: 152.52 },
  82: { male: 186.39, female: 160.00 },
  83: { male: 195.71, female: 167.85 },
  84: { male: 205.49, female: 176.09 },
  85: { male: 215.77, female: 184.74 }
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
  89: { male: 358, female: 277 }
};

// TransAmerica: ages 18-80, smoker/non-smoker
const TRANSAMERICA_RATES = {
  18: { maleNS: 27.21, maleSm: 31.68, femaleNS: 24.30, femaleSm: 25.05 },
  19: { maleNS: 27.27, maleSm: 32.93, femaleNS: 24.70, femaleSm: 26.08 },
  20: { maleNS: 27.34, maleSm: 34.20, femaleNS: 25.10, femaleSm: 27.89 },
  21: { maleNS: 28.12, maleSm: 35.40, femaleNS: 25.35, femaleSm: 28.68 },
  22: { maleNS: 28.93, maleSm: 36.62, femaleNS: 25.60, femaleSm: 29.10 },
  23: { maleNS: 29.74, maleSm: 37.90, femaleNS: 25.86, femaleSm: 29.89 },
  24: { maleNS: 30.59, maleSm: 39.22, femaleNS: 26.10, femaleSm: 30.86 },
  25: { maleNS: 30.92, maleSm: 39.89, femaleNS: 26.36, femaleSm: 31.86 },
  26: { maleNS: 31.24, maleSm: 40.55, femaleNS: 26.42, femaleSm: 32.46 },
  27: { maleNS: 31.31, maleSm: 40.62, femaleNS: 26.47, femaleSm: 33.07 },
  28: { maleNS: 31.39, maleSm: 40.70, femaleNS: 26.52, femaleSm: 33.68 },
  29: { maleNS: 31.48, maleSm: 40.79, femaleNS: 26.59, femaleSm: 34.32 },
  30: { maleNS: 31.58, maleSm: 40.89, femaleNS: 26.64, femaleSm: 34.97 },
  31: { maleNS: 31.69, maleSm: 41.41, femaleNS: 27.36, femaleSm: 35.10 },
  32: { maleNS: 31.81, maleSm: 42.43, femaleNS: 28.18, femaleSm: 35.23 },
  33: { maleNS: 32.03, maleSm: 43.47, femaleNS: 29.02, femaleSm: 35.36 },
  34: { maleNS: 32.71, maleSm: 44.55, femaleNS: 29.66, femaleSm: 35.49 },
  35: { maleNS: 33.22, maleSm: 45.64, femaleNS: 30.16, femaleSm: 35.62 },
  36: { maleNS: 34.48, maleSm: 48.05, femaleNS: 31.43, femaleSm: 37.35 },
  37: { maleNS: 35.53, maleSm: 50.57, femaleNS: 32.48, femaleSm: 39.17 },
  38: { maleNS: 36.71, maleSm: 53.22, femaleNS: 33.48, femaleSm: 41.07 },
  39: { maleNS: 38.43, maleSm: 56.00, femaleNS: 34.45, femaleSm: 43.07 },
  40: { maleNS: 40.22, maleSm: 58.94, femaleNS: 35.33, femaleSm: 45.16 },
  41: { maleNS: 42.09, maleSm: 62.04, femaleNS: 36.99, femaleSm: 47.36 },
  42: { maleNS: 44.07, maleSm: 65.30, femaleNS: 38.68, femaleSm: 49.66 },
  43: { maleNS: 46.12, maleSm: 68.72, femaleNS: 40.48, femaleSm: 52.08 },
  44: { maleNS: 48.28, maleSm: 72.33, femaleNS: 42.44, femaleSm: 54.60 },
  45: { maleNS: 51.81, maleSm: 76.12, femaleNS: 48.51, femaleSm: 57.27 },
  46: { maleNS: 56.80, maleSm: 78.07, femaleNS: 52.95, femaleSm: 58.91 },
  47: { maleNS: 56.30, maleSm: 79.95, femaleNS: 62.54, femaleSm: 58.20 },
  48: { maleNS: 59.95, maleSm: 81.02, femaleNS: 66.48, femaleSm: 59.72 },
  49: { maleNS: 62.93, maleSm: 82.10, femaleNS: 66.67, femaleSm: 61.13 },
  50: { maleNS: 63.06, maleSm: 83.14, femaleNS: 67.53, femaleSm: 61.91 },
  51: { maleNS: 63.19, maleSm: 85.75, femaleNS: 70.37, femaleSm: 62.69 },
  52: { maleNS: 64.57, maleSm: 88.40, femaleNS: 73.34, femaleSm: 65.28 },
  53: { maleNS: 65.97, maleSm: 92.85, femaleNS: 76.42, femaleSm: 67.88 },
  54: { maleNS: 67.41, maleSm: 95.47, femaleNS: 79.64, femaleSm: 70.49 },
  55: { maleNS: 68.87, maleSm: 97.90, femaleNS: 82.99, femaleSm: 72.47 },
  56: { maleNS: 69.35, maleSm: 103.05, femaleNS: 83.03, femaleSm: 80.12 },
  57: { maleNS: 69.80, maleSm: 108.47, femaleNS: 83.07, femaleSm: 82.68 },
  58: { maleNS: 70.20, maleSm: 114.18, femaleNS: 83.11, femaleSm: 85.33 },
  59: { maleNS: 70.56, maleSm: 120.17, femaleNS: 85.64, femaleSm: 86.33 },
  60: { maleNS: 70.87, maleSm: 126.49, femaleNS: 89.44, femaleSm: 87.03 },
  61: { maleNS: 74.06, maleSm: 133.13, femaleNS: 93.41, femaleSm: 89.40 },
  62: { maleNS: 77.38, maleSm: 140.14, femaleNS: 97.54, femaleSm: 94.15 },
  63: { maleNS: 80.84, maleSm: 147.50, femaleNS: 101.87, femaleSm: 99.12 },
  64: { maleNS: 84.43, maleSm: 155.26, femaleNS: 106.38, femaleSm: 104.30 },
  65: { maleNS: 88.17, maleSm: 163.41, femaleNS: 111.09, femaleSm: 109.71 },
  66: { maleNS: 93.53, maleSm: 172.91, femaleNS: 117.73, femaleSm: 117.01 },
  67: { maleNS: 99.21, maleSm: 182.98, femaleNS: 124.77, femaleSm: 124.80 },
  68: { maleNS: 105.23, maleSm: 193.61, femaleNS: 132.24, femaleSm: 133.11 },
  69: { maleNS: 111.63, maleSm: 204.87, femaleNS: 140.14, femaleSm: 141.97 },
  70: { maleNS: 118.41, maleSm: 216.79, femaleNS: 146.65, femaleSm: 151.42 },
  71: { maleNS: 124.13, maleSm: 229.39, femaleNS: 156.77, femaleSm: 161.46 },
  72: { maleNS: 130.12, maleSm: 242.72, femaleNS: 166.82, femaleSm: 172.17 },
  73: { maleNS: 136.37, maleSm: 256.84, femaleNS: 176.79, femaleSm: 183.59 },
  74: { maleNS: 142.91, maleSm: 271.78, femaleNS: 187.36, femaleSm: 195.77 },
  75: { maleNS: 149.73, maleSm: 287.59, femaleNS: 198.56, femaleSm: 208.75 },
  76: { maleNS: 159.90, maleSm: 307.15, femaleNS: 213.77, femaleSm: 220.26 },
  77: { maleNS: 170.19, maleSm: 328.04, femaleNS: 230.15, femaleSm: 231.96 },
  78: { maleNS: 180.63, maleSm: 336.59, femaleNS: 240.02, femaleSm: 243.84 },
  79: { maleNS: 191.19, maleSm: 338.70, femaleNS: 242.14, femaleSm: 255.92 },
  80: { maleNS: 201.89, maleSm: 340.82, femaleNS: 244.28, femaleSm: 268.18 }
};

// Calculate monthly premium based on carrier, age, gender, tobacco, and face amount
const calculateMonthlyPremium = (carrier, age, gender, tobacco, faceAmount) => {
  const config = CARRIER_CONFIG[carrier];
  if (!config) return null;

  let rateTable, rate;
  const isMale = gender === 'Male';
  const isSmoker = tobacco === true;

  switch (carrier) {
    case 'Aflac':
      rateTable = AFLAC_RATES[age];
      if (!rateTable) return null;
      rate = isMale 
        ? (isSmoker ? rateTable.maleSm : rateTable.maleNS)
        : (isSmoker ? rateTable.femaleSm : rateTable.femaleNS);
      break;
    case 'SBLI':
      rateTable = SBLI_RATES[age];
      if (!rateTable) return null;
      rate = isMale
        ? (isSmoker ? rateTable.maleSm : rateTable.maleNS)
        : (isSmoker ? rateTable.femaleSm : rateTable.femaleNS);
      break;
    case 'CICA':
      rateTable = CICA_RATES[age];
      if (!rateTable) return null;
      rate = isMale ? rateTable.male : rateTable.female;
      break;
    case 'GTL':
      rateTable = GTL_RATES[age];
      if (!rateTable) return null;
      rate = isMale ? rateTable.male : rateTable.female;
      break;
    case 'TransAmerica':
      rateTable = TRANSAMERICA_RATES[age];
      if (!rateTable) return null;
      rate = isMale
        ? (isSmoker ? rateTable.maleSm : rateTable.maleNS)
        : (isSmoker ? rateTable.femaleSm : rateTable.femaleNS);
      break;
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
  const withFactor = totalAnnual + (totalAnnual * config.monthlyFactor);
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
  phone: '',
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

// Date formatter helper
const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}/${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
};

const Logo = ({ small = false }) => (
  <div className={`flex items-center justify-center ${small ? 'mb-2' : 'mb-6'}`}>
    <img 
      src="/amerben.png" 
      alt="American Beneficiary" 
      className={`${small ? 'h-8' : 'h-16'} w-auto object-contain`} 
    />
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

// --- Component: Login Form ---
const Login = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const data = await api.login(password);
      if (data.success) {
        onLogin(data.token);
      }
    } catch (err) {
      setError(err.message || 'Login failed');
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
          <p className="text-slate-500">Enter your secure password to continue.</p>
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
            {loading ? <RefreshCw size={20} className="animate-spin"/> : 'Login'}
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

  const renderPolicySelect = () => {
    // Calculate quotes for each carrier with rates
    const age = parseInt(data.age);
    const carrierQuotes = (age && data.gender) ? {
      'Aflac': calculateMonthlyPremium('Aflac', age, data.gender, data.tobacco, data.faceAmount),
      'SBLI': calculateMonthlyPremium('SBLI', age, data.gender, data.tobacco, data.faceAmount),
      'CICA': calculateMonthlyPremium('CICA', age, data.gender, data.tobacco, data.faceAmount),
      'GTL': calculateMonthlyPremium('GTL', age, data.gender, data.tobacco, data.faceAmount),
      'TransAmerica': calculateMonthlyPremium('TransAmerica', age, data.gender, data.tobacco, data.faceAmount)
    } : {};

    const selectedCarrierQuote = data.carrier && CARRIER_CONFIG[data.carrier] ? carrierQuotes[data.carrier] : null;
    const hasCarrierRates = ['Aflac', 'SBLI', 'CICA', 'GTL', 'TransAmerica'].includes(data.carrier);

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
      <SectionTitle icon={FileText} title="Policy & Premium" subtitle="Configure the policy details." />
      
      {/* Required fields for quote calculation */}
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 mb-6">
        <h3 className="font-bold text-blue-800 mb-4">Customer Information for Quote</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Input type="date" label="Date of Birth" value={data.dob} onChange={handleDobChange} required />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase">Age (Auto-calculated)</label>
            <div className="p-3 bg-white border border-slate-200 rounded-lg font-bold text-slate-700">
              {data.age || 'Enter DOB'}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase">Gender <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              <button
                onClick={() => update('gender', 'Male')}
                className={`flex-1 p-3 rounded-lg font-bold transition-all ${data.gender === 'Male' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                Male
              </button>
              <button
                onClick={() => update('gender', 'Female')}
                className={`flex-1 p-3 rounded-lg font-bold transition-all ${data.gender === 'Female' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                Female
              </button>
            </div>
          </div>
        </div>

        {/* Tobacco Question - only show for carriers that use tobacco rates */}
        <div className="p-3 bg-white rounded-lg border border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <p className="font-medium text-slate-800">Have you used tobacco in any form during the past 12 months?</p>
              <p className="text-sm text-slate-500 mt-1">(Excluding occasional pipe and cigar use)</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => update('tobacco', true)}
                className={`px-6 py-2 rounded-lg font-bold transition-all ${data.tobacco === true ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                Yes
              </button>
              <button
                onClick={() => update('tobacco', false)}
                className={`px-6 py-2 rounded-lg font-bold transition-all ${data.tobacco === false ? 'bg-slate-700 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                No
              </button>
            </div>
          </div>
        </div>

        {/* Coverage Amount */}
        <div className="mt-4">
          <label className="text-xs font-semibold text-slate-500 uppercase block mb-2">Coverage Amount (Face Value) <span className="text-red-500">*</span></label>
          <div className="flex items-center gap-4">
            <input 
              type="range" 
              min="5000" 
              max="50000" 
              step="1000" 
              value={data.faceAmount} 
              onChange={(e) => update('faceAmount', parseInt(e.target.value))} 
              className="flex-1 h-3 bg-white rounded-lg appearance-none cursor-pointer accent-blue-600 border border-slate-200" 
            />
            <div className="px-4 py-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-800 min-w-32 text-center">
              ${data.faceAmount.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="text-sm font-bold text-slate-700 block mb-2">Select Policy Type</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.carrier && CARRIERS[data.carrier].map((policy) => (
            <button
              key={policy}
              onClick={() => {
                update('planType', policy);
                // Auto-set premium if we have a calculated quote
                if (selectedCarrierQuote) {
                  update('monthlyPremium', selectedCarrierQuote.toFixed(2));
                }
              }}
              className={`p-4 rounded-lg border-2 text-sm font-bold transition-all ${data.planType === policy ? 'border-blue-600 bg-blue-600 text-white shadow-md' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {policy}
            </button>
          ))}
          {!data.carrier && <p className="text-slate-500 italic">Please select a carrier first.</p>}
        </div>
      </div>

      {/* Calculated Quote Display for carriers with rate tables */}
      {hasCarrierRates && (
        <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 mb-6">
          <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
            <DollarSign size={20} />
            Calculated Quote - {data.carrier}
          </h3>
          {selectedCarrierQuote ? (
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-green-700">${selectedCarrierQuote.toFixed(2)}</div>
              <div className="text-green-600 text-sm">
                <p>/month</p>
                <p className="text-xs mt-1">
                  Based on: Age {data.age}, {data.gender}{CARRIER_CONFIG[data.carrier]?.hasTobacco ? `, ${data.tobacco ? 'Tobacco' : 'Non-Tobacco'}` : ''}, ${data.faceAmount.toLocaleString()} coverage
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-yellow-100 text-yellow-800 rounded-lg text-sm flex items-center gap-2">
              <AlertTriangle size={16} />
              {!data.age ? 'Please enter date of birth to calculate quote.' : 
               !data.gender ? 'Please select gender to calculate quote.' :
               `Age ${data.age} is outside the rate range for ${data.carrier}. Please select a different carrier.`}
            </div>
          )}
        </div>
      )}

      {/* Compare Quotes Section */}
      {data.age && data.gender && (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6">
          <h3 className="font-bold text-slate-700 mb-3">Compare Monthly Premium Quotes</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {['Aflac', 'SBLI', 'CICA', 'GTL', 'TransAmerica'].map(carrier => {
              const quote = carrierQuotes[carrier];
              const isSelected = data.carrier === carrier;
              return (
                <button
                  key={carrier}
                  onClick={() => { update('carrier', carrier); update('planType', ''); if (quote) update('monthlyPremium', quote.toFixed(2)); }}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    isSelected 
                      ? 'border-blue-600 bg-blue-50' 
                      : quote ? 'border-slate-200 hover:border-blue-300 hover:bg-white' : 'border-slate-100 bg-slate-100 opacity-50'
                  }`}
                  disabled={!quote}
                >
                  <p className={`text-sm font-bold ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>{carrier}</p>
                  {quote ? (
                    <p className={`text-lg font-bold ${isSelected ? 'text-blue-600' : 'text-green-600'}`}>${quote.toFixed(2)}</p>
                  ) : (
                    <p className="text-xs text-slate-400">N/A for age {data.age}</p>
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {CARRIER_CONFIG[data.carrier]?.hasTobacco 
              ? `Rates shown for ${data.tobacco ? 'Tobacco' : 'Non-Tobacco'} users.` 
              : data.carrier && CARRIER_CONFIG[data.carrier] 
                ? 'Tobacco status does not affect rates for this carrier.'
                : ''}
          </p>
        </div>
      )}

      <div className="mb-6">
         <Input 
            label="Monthly Premium ($)" 
            type="number" 
            placeholder="0.00" 
            value={data.monthlyPremium} 
            onChange={(e) => update('monthlyPremium', e.target.value)} 
            className="md:w-1/2"
         />
         {hasCarrierRates && selectedCarrierQuote && data.monthlyPremium !== selectedCarrierQuote.toFixed(2) && (
           <button 
             onClick={() => update('monthlyPremium', selectedCarrierQuote.toFixed(2))}
             className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
           >
             <RefreshCw size={14} /> Use calculated rate: ${selectedCarrierQuote.toFixed(2)}
           </button>
         )}
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
  };

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
          <Input label="Phone Number" type="tel" placeholder="(555) 555-5555" value={data.phone} onChange={(e) => update('phone', e.target.value)} required />
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
    if (step === 2) {
      if (!data.planType) { alert("Please select a policy type."); return; }
      if (!data.dob || !data.age) { alert("Please enter date of birth."); return; }
      if (!data.gender) { alert("Please select gender."); return; }
      if (data.tobacco === null) { alert("Please answer the tobacco question."); return; }
      // Premium check - allow if monthlyPremium is set OR if we're on a carrier without rate tables
      const hasRates = ['Aflac', 'SBLI', 'CICA', 'GTL', 'TransAmerica'].includes(data.carrier);
      if (hasRates && !data.monthlyPremium) { alert("Please select a carrier from the quote comparison or enter a premium manually."); return; }
    }
    if (step === 7 && (!data.accountNum || !data.routing || !data.draftDate)) { alert("Please complete all banking details including Draft Date."); return; }
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
      'Submitted': 'bg-blue-100 text-blue-700 border-blue-200',
      'Underwriting': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      'Issued': 'bg-green-100 text-green-700 border-green-200',
      'Paid': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'Not Taken': 'bg-slate-100 text-slate-500 border-slate-200',
      'Lapsed': 'bg-red-50 text-red-600 border-red-200',
      // Legacy statuses for backwards compatibility
      'Approved': 'bg-green-100 text-green-700 border-green-200',
      'Paid & Issued': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'Active': 'bg-blue-100 text-blue-700 border-blue-200',
      'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200'
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
      submitted: filtered.filter(s => s.status === 'Submitted').length,
      underwriting: filtered.filter(s => s.status === 'Underwriting').length,
      issued: filtered.filter(s => s.status === 'Issued').length,
      paid: filtered.filter(s => s.status === 'Paid').length,
      notTaken: filtered.filter(s => s.status === 'Not Taken').length,
      lapsed: filtered.filter(s => s.status === 'Lapsed').length,
    };

    const activeCount = counts.issued + counts.paid;
    const retentionBase = activeCount + counts.notTaken + counts.lapsed;
    const retentionRate = retentionBase > 0 ? ((activeCount / retentionBase) * 100).toFixed(1) : 0;
    const appsToIssue = counts.applications > 0 ? ((activeCount / counts.applications) * 100).toFixed(1) : 0;

    return { counts, retentionRate, appsToIssue };
  }, [submissions, timeFilter]);

  // --- Renderers ---

  const renderOverview = () => (
    <div className="animate-fade-in space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         {[
           { label: 'Total Apps', val: submissions.length, icon: FileText, color: 'blue' },
           { label: 'Issued/Paid', val: analyticsData.counts.issued + analyticsData.counts.paid, icon: Shield, color: 'green' },
           { label: 'Underwriting', val: analyticsData.counts.underwriting, icon: Activity, color: 'orange' },
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
           <div className="flex items-center justify-center mb-2">
             <img src="/amerben.png" alt="American Beneficiary" className="h-12 w-auto object-contain" />
           </div>
           <p className="text-xs text-slate-400 uppercase tracking-widest text-center">Admin Portal</p>
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
                            <select
                              value={editData.status || selectedApp.status}
                              onChange={(e) => {
                                const newStatus = e.target.value;
                                setEditData(prev => ({ ...prev, status: newStatus }));
                                onUpdateSubmission({ ...selectedApp, status: newStatus });
                                setSelectedApp(prev => ({ ...prev, status: newStatus }));
                              }}
                              className="ml-2 border border-slate-300 rounded-lg px-2 py-1 text-sm font-bold text-slate-700 cursor-pointer hover:border-blue-400 focus:outline-none focus:border-blue-500"
                            >
                              {APP_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                         </div>
                         <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">ID: {selectedApp.id}</span>
                            <span className="flex items-center gap-1"><Calendar size={14}/> {formatDate(selectedApp.date)}</span>
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
                               <DataField 
                                  label={selectedApp.draftSchedule === 'ss_payment' ? "SS Payment Day" : "Draft Date"} 
                                  value={selectedApp.draftDate} 
                               />
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

                           {/* Riders & Coverage Options */}
                           <div>
                             <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                               <Shield size={20} className="text-purple-600"/> Coverage Options
                             </h3>
                             <div className="space-y-4">
                               <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                  <div className="flex justify-between items-center mb-2">
                                     <span className="text-sm font-bold text-slate-600">Willing to Accept</span>
                                     <span className={`px-2 py-0.5 rounded text-xs font-bold ${selectedApp.willingToAccept ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {selectedApp.willingToAccept ? 'YES' : 'NO'}
                                     </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                     <span className="text-sm font-bold text-slate-600">Existing Insurance</span>
                                     <span className={`px-2 py-0.5 rounded text-xs font-bold ${selectedApp.hasExisting ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {selectedApp.hasExisting ? 'YES' : 'NO'}
                                     </span>
                                  </div>
                                  {selectedApp.hasExisting && (
                                     <div className="flex justify-between items-center mt-2 pl-4 border-l-2 border-slate-200">
                                       <span className="text-sm text-slate-500">Will Replace?</span>
                                       <span className={`font-bold ${selectedApp.willReplace ? 'text-red-600' : 'text-slate-600'}`}>
                                          {selectedApp.willReplace ? 'YES' : 'NO'}
                                       </span>
                                     </div>
                                  )}
                               </div>

                               {(selectedApp.grandchildCount > 0 || selectedApp.grandchildUnits > 0) && (
                                 <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                                    <p className="text-xs font-bold text-purple-700 uppercase mb-2">Grandchild Rider</p>
                                    <div className="grid grid-cols-2 gap-2">
                                       <DataField label="Children" value={selectedApp.grandchildCount} />
                                       <DataField label="Units" value={selectedApp.grandchildUnits} />
                                    </div>
                                 </div>
                               )}
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check auth on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem('authToken', token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setView('home');
  };

  // Load applications from API
  const loadApplications = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const data = await api.getApplications();
      setSubmissions(data);
    } catch (error) {
      console.error('Failed to load applications:', error);
      if (error.message === 'Unauthorized' || error.message.includes('401') || error.message.includes('403')) {
        setIsAuthenticated(false);
        localStorage.removeItem('authToken');
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
        status: 'Pending'
      };
      
      await api.createApplication(newApp);
      setLastSubmission(newApp);
      setView('success');
      // If we are logged in, reload the list
      if (isAuthenticated) {
        loadApplications();
      }
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
              <button className="mt-6 px-6 py-2 bg-white border border-slate-300 text-slate-700 rounded-full font-bold hover:bg-slate-50 group-hover:bg-blue-600 group-hover:border-transparent group-hover:text-white transition-all">
                {isAuthenticated ? 'Go to Dashboard' : 'Login'}
              </button>
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
             <button onClick={() => setView('admin')} className="w-full py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold">
                View in Dashboard
             </button>
           </div>
         </div>
      </div>
    );
  }

  if (view === 'admin') {
    if (!isAuthenticated) {
      return (
        <>
           <div className="fixed top-4 left-4 z-50">
             <button onClick={() => setView('home')} className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm text-slate-600 hover:text-slate-900 font-bold text-sm">
                <ChevronLeft size={16}/> Back
             </button>
           </div>
           <Login onLogin={handleLogin} />
        </>
      );
    }
    return <AdminDashboard submissions={submissions} onLogout={handleLogout} onUpdateSubmission={handleUpdateSubmission} />;
  }

  return null;
}