// ==========================================================================
// MORTGAGE-ABILITY.COM STATE MANAGEMENT MODULE
// ==========================================================================

import { STORAGE_KEYS, DEFAULT_PRESET_RATES } from '../constants.js';

// Application State Variables
let currentSchedule = {
  standard: [],
  accelerated: [],
  summary: {}
};

let chartInstance = null;
let activeTableViewMode = 'annual'; // 'annual' or 'monthly'
let currentTablePage = 1;
const rowsPerPage = 12; // 1 year of months per page for monthly view
let activeZoomPreset = 'full'; // '5Y', '10Y', '15Y', or 'full'
let activeChartViews = ['balance']; // Multi-select array of views e.g. ['balance', 'interest']
let activeChartView = 'balance'; // Kept for backwards compatibility
let isCompareMode = false;
let compareSelectedIds = [];
let isSimpleMode = false;
let isTargetPrincipalUserModified = false;
let currentScenarioId = null;

// Loan Structure State
let activeLoanPreset = '30-fixed';
let loanPresetRates = { ...DEFAULT_PRESET_RATES };
let isArmLoan = false;

// Getters & Setters
export function getCurrentSchedule() {
  return currentSchedule;
}

export function setCurrentSchedule(schedule) {
  currentSchedule = schedule;
}

export function getChartInstance() {
  return chartInstance;
}

export function setChartInstance(instance) {
  chartInstance = instance;
}

export function getActiveTableViewMode() {
  return activeTableViewMode;
}

export function setActiveTableViewMode(mode) {
  activeTableViewMode = mode;
}

export function getCurrentTablePage() {
  return currentTablePage;
}

export function setCurrentTablePage(page) {
  currentTablePage = page;
}

export function getRowsPerPage() {
  return rowsPerPage;
}

export function getActiveZoomPreset() {
  return activeZoomPreset;
}

export function setActiveZoomPreset(preset) {
  activeZoomPreset = preset || 'full';
}

export function getActiveChartViews() {
  return [...activeChartViews];
}

export function getActiveChartView() {
  return activeChartView;
}

export function setActiveChartViews(views) {
  if (Array.isArray(views)) {
    activeChartViews = views.length > 0 ? [...views] : ['balance'];
  } else if (typeof views === 'string') {
    if (activeChartViews.includes(views)) {
      if (activeChartViews.length > 1) {
        activeChartViews = activeChartViews.filter(v => v !== views);
      }
    } else {
      activeChartViews.push(views);
    }
  }
  activeChartView = activeChartViews[0] || 'balance';
}

export function getIsCompareMode() {
  return isCompareMode;
}

export function setIsCompareMode(val) {
  isCompareMode = !!val;
}

export function getCompareSelectedIds() {
  return [...compareSelectedIds];
}

export function setCompareSelectedIds(ids) {
  compareSelectedIds = Array.isArray(ids) ? [...ids] : [];
}

export function getIsSimpleMode() {
  return isSimpleMode;
}

export function setIsSimpleMode(val) {
  isSimpleMode = !!val;
}

export function getIsTargetPrincipalUserModified() {
  return isTargetPrincipalUserModified;
}

export function setIsTargetPrincipalUserModified(val) {
  isTargetPrincipalUserModified = !!val;
}

export function getCurrentScenarioId() {
  return currentScenarioId;
}

export function setCurrentScenarioId(id) {
  currentScenarioId = id;
}

export function getActiveLoanPreset() {
  return activeLoanPreset;
}

export function setActiveLoanPreset(preset) {
  activeLoanPreset = preset;
}

export function getLoanPresetRates() {
  return { ...loanPresetRates };
}

export function setLoanPresetRates(rates) {
  loanPresetRates = { ...rates };
}

export function getIsArmLoan() {
  return isArmLoan;
}

export function setIsArmLoan(val) {
  isArmLoan = !!val;
}

// Theme functions
export function getInitialTheme() {
  try {
    if (typeof localStorage !== 'undefined') {
      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }
    }
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
  } catch (e) {
    // Ignore browser storage/media query access errors
  }
  return 'light';
}

export function setTheme(theme, onChartRender) {
  const currentTheme = theme === 'light' ? 'light' : 'dark';
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }

  const elThemeToggleIcon = document.getElementById('theme-toggle-icon');
  if (elThemeToggleIcon) {
    if (currentTheme === 'light') {
      elThemeToggleIcon.className = 'fa-solid fa-sun';
      if (elThemeToggleIcon.parentElement) {
        elThemeToggleIcon.parentElement.setAttribute('title', 'Switch to Dark Theme');
        elThemeToggleIcon.parentElement.setAttribute('aria-label', 'Switch to Dark Theme');
      }
    } else {
      elThemeToggleIcon.className = 'fa-solid fa-moon';
      if (elThemeToggleIcon.parentElement) {
        elThemeToggleIcon.parentElement.setAttribute('title', 'Switch to Light Theme');
        elThemeToggleIcon.parentElement.setAttribute('aria-label', 'Switch to Light Theme');
      }
    }
  }

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.THEME, currentTheme);
    }
  } catch (e) {
    // Ignore storage restriction errors
  }

  if (chartInstance && typeof onChartRender === 'function') {
    onChartRender();
  }
}

export function toggleTheme(onChartRender) {
  const activeTheme = (typeof document !== 'undefined' && document.documentElement)
    ? document.documentElement.getAttribute('data-theme') || 'dark'
    : 'dark';
  const newTheme = activeTheme === 'light' ? 'dark' : 'light';
  setTheme(newTheme, onChartRender);
}

// Simple Mode functions
export function setSimpleMode(enabled) {
  isSimpleMode = !!enabled;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.MODE, isSimpleMode ? 'true' : 'false');
    }
  } catch (e) {
    // Ignore storage restriction errors
  }

  if (typeof document !== 'undefined') {
    if (document.body) {
      document.body.classList.toggle('simple-mode', isSimpleMode);
    }

    const elBtnModeToggle = document.getElementById('btn-mode-toggle');
    const elModeToggleIcon = document.getElementById('mode-toggle-icon');
    const elModeToggleText = document.getElementById('mode-toggle-text');

    if (elBtnModeToggle) {
      if (isSimpleMode) {
        elBtnModeToggle.classList.add('active-simple-mode');
        if (elModeToggleIcon) elModeToggleIcon.className = 'fa-solid fa-sliders';
        if (elModeToggleText) elModeToggleText.textContent = 'Advanced Mode';
        elBtnModeToggle.setAttribute('title', 'Switch to Advanced Mode');
        elBtnModeToggle.setAttribute('aria-label', 'Switch to Advanced Mode');

        const btnText = document.getElementById('btn-piti-view-text');
        if (btnText) btnText.click();

        const activePresetBtn = document.querySelector('.btn-preset.active');
        if (activePresetBtn) {
          const presetVal = activePresetBtn.getAttribute('data-preset');
          if (presetVal && (presetVal.includes('arm') || presetVal === 'custom')) {
            const btn30Fixed = document.querySelector('.btn-preset[data-preset="30-fixed"]');
            if (btn30Fixed) btn30Fixed.click();
          }
        }
      } else {
        elBtnModeToggle.classList.remove('active-simple-mode');
        if (elModeToggleIcon) elModeToggleIcon.className = 'fa-solid fa-feather';
        if (elModeToggleText) elModeToggleText.textContent = 'Simple Mode';
        elBtnModeToggle.setAttribute('title', 'Switch to Simple Mode');
        elBtnModeToggle.setAttribute('aria-label', 'Switch to Simple Mode');
      }
    }
  }
}

export function toggleSimpleMode() {
  setSimpleMode(!isSimpleMode);
}

export function getInitialMode() {
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.MODE);
      if (saved === 'false') return false;
      if (saved === 'true') return true;
    }
  } catch (e) {
    // Fallback
  }
  return true;
}

export function isMobileViewport() {
  return typeof window !== 'undefined' && (window.innerWidth <= 768 || (window.matchMedia && window.matchMedia('(max-width: 768px)').matches));
}

export function getMaxCompareCount() {
  return isMobileViewport() ? 2 : 4;
}
