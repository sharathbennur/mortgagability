// ==========================================================================
// MORTGAGE-ABILITY.COM MAIN APPLICATION ENTRY POINT
// ==========================================================================

import {
  STORAGE_KEYS,
  DEFAULT_INPUT_VALUES,
  DEFAULT_PRESET_RATES,
  NON_RESETTABLE_FIELDS,
  COMPARE_SCENARIO_COLORS
} from './constants.js';

import {
  formatCurrency,
  formatPercent,
  formatYearsAndMonths
} from './formatters.js';

import {
  calculateMonthlyPayment,
  getNetLoanPrincipal,
  getLumpSumForMonth,
  getTotalLumpSumAmount,
  calculateAmortizationSchedules
} from './core/calculations.js';

import {
  getCurrentSchedule,
  setCurrentSchedule,
  getChartInstance,
  setChartInstance,
  getActiveTableViewMode,
  setActiveTableViewMode,
  getCurrentTablePage,
  setCurrentTablePage,
  getRowsPerPage,
  getActiveZoomPreset,
  setActiveZoomPreset,
  getActiveChartViews,
  getActiveChartView,
  setActiveChartViews,
  getIsCompareMode,
  setIsCompareMode,
  getCompareSelectedIds,
  setCompareSelectedIds,
  getIsSimpleMode,
  setIsSimpleMode,
  getIsTargetPrincipalUserModified,
  setIsTargetPrincipalUserModified,
  getCurrentScenarioId,
  setCurrentScenarioId,
  getActiveLoanPreset,
  setActiveLoanPreset,
  getLoanPresetRates,
  setLoanPresetRates,
  getIsArmLoan,
  setIsArmLoan,
  getInitialTheme,
  setTheme,
  toggleTheme,
  getInitialMode,
  setSimpleMode,
  toggleSimpleMode,
  isMobileViewport,
  getMaxCompareCount
} from './core/state.js';

import {
  GLOSSARY_TERMS,
  renderGlossaryCards,
  highlightTermCard,
  openHelpModal,
  closeHelpModal,
  setupHelpHandlers
} from './features/glossary.js';

import {
  getScheduledOneTimePayments,
  setScheduledOneTimePayments,
  renderOneTimePaymentsList,
  setupOneTimePaymentsHandlers
} from './features/payoff-simulator.js';

import {
  calculateTargetExtraPayment,
  updateTargetTermCalculator
} from './features/target-payoff.js';

import {
  getSavedScenarios,
  saveScenariosToStorage,
  autoSaveCurrentState,
  openCompareModal,
  closeCompareModal,
  renderCompareModalChips,
  renderCompareMatrix
} from './features/scenarios.js';

import { getElements } from './ui/dom-elements.js';

import {
  getAnnualSchedule,
  renderTable,
  exportScheduleToCSV
} from './ui/table.js';

import {
  updatePmiAlertBanner,
  renderPitiDonutChart,
  updateMobileSummaryBar
} from './ui/kpi-cards.js';

import {
  renderCompareControls,
  renderChart
} from './ui/charts.js';

import {
  setupAccordions,
  updateAccordionSummaries
} from './ui/accordions.js';

export {
  // Constants & Utilities
  STORAGE_KEYS,
  DEFAULT_INPUT_VALUES,
  DEFAULT_PRESET_RATES,
  NON_RESETTABLE_FIELDS,
  COMPARE_SCENARIO_COLORS,
  formatCurrency,
  formatPercent,
  formatYearsAndMonths,

  // Calculations
  calculateMonthlyPayment,
  getNetLoanPrincipal,
  getLumpSumForMonth,
  getTotalLumpSumAmount,
  calculateAmortizationSchedules,

  // State
  getCurrentSchedule,
  setCurrentSchedule,
  getInitialTheme,
  setTheme,
  toggleTheme,
  getInitialMode,
  setSimpleMode,
  toggleSimpleMode,
  getCompareSelectedIds,
  setCompareSelectedIds,
  getMaxCompareCount,

  // Features
  GLOSSARY_TERMS,
  renderGlossaryCards,
  openHelpModal,
  closeHelpModal,
  setupHelpHandlers,
  getScheduledOneTimePayments,
  setScheduledOneTimePayments,
  renderOneTimePaymentsList,
  setupOneTimePaymentsHandlers,
  calculateTargetExtraPayment,
  updateTargetTermCalculator,
  getSavedScenarios,
  saveScenariosToStorage,
  autoSaveCurrentState,
  openCompareModal,
  closeCompareModal,
  renderCompareModalChips,
  renderCompareMatrix,

  // UI Components
  getElements,
  getAnnualSchedule,
  renderTable,
  exportScheduleToCSV,
  updatePmiAlertBanner,
  renderPitiDonutChart,
  updateMobileSummaryBar,
  renderCompareControls,
  renderChart,
  setupAccordions,
  updateAccordionSummaries
};
