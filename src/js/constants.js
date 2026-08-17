// ==========================================================================
// MORTGAGE-ABILITY.COM CONSTANTS
// ==========================================================================

export const STORAGE_KEYS = {
  SCENARIOS: 'mortgagability_scenarios',
  CURRENT_STATE: 'mortgagability_current_state',
  THEME: 'mortgagability_theme',
  MODE: 'mortgagability_simple_mode',
  HAS_SEEN_ONBOARDING: 'mortgagability_has_seen_onboarding'
};

export const DEFAULT_INPUT_VALUES = {
  'home-price': 450000,
  'down-payment': 90000,
  'down-payment-percent': 20,
  'closing-costs': 13500,
  'closing-costs-percent': 3.0,
  'interest-rate': 6.5,
  'loan-term': 30,
  'property-tax': 0.9,
  'home-insurance': 0.5,
  'arm-fixed-term': 5,
  'arm-adjusted-rate': 7.5,
  'take-home-salary': 8000,
  'monthly-expenses': 3000,
  'extra-monthly': 200,
  'recast-amount': 50000,
  'recast-month': 60
};

export const NON_RESETTABLE_FIELDS = new Set([
  'home-price',
  'down-payment',
  'down-payment-percent',
  'interest-rate',
  'take-home-salary',
  'monthly-expenses'
]);

export const DEFAULT_PRESET_RATES = {
  '30-fixed': 6.5,
  '15-fixed': 5.75,
  '5-arm': 6.0,
  '7-arm': 6.125,
  '10-arm': 6.25,
  'custom': 6.5
};

export const COMPARE_SCENARIO_COLORS = [
  { color: '#6366f1', lightColor: '#4f46e5', bg: 'rgba(99, 102, 241, 0.12)', bgLight: '#eef2ff' },
  { color: '#10b981', lightColor: '#059669', bg: 'rgba(16, 185, 129, 0.12)', bgLight: '#ecfdf5' },
  { color: '#f59e0b', lightColor: '#d97706', bg: 'rgba(245, 158, 11, 0.12)', bgLight: '#fffbeb' },
  { color: '#a855f7', lightColor: '#9333ea', bg: 'rgba(168, 85, 247, 0.12)', bgLight: '#faf5ff' }
];

export const MAX_COMPARE_COUNT = 4;
