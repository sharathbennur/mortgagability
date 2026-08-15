// ==========================================================================
// MORTGAGE-ABILITY.COM APPLICATION ENGINE
// ==========================================================================

// Global state variables
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
let activeChartView = 'balance'; // Kept for backwards compatibility (returns activeChartViews[0])
let isCompareMode = false;
let compareSelectedIds = [];
const COMPARE_SCENARIO_COLORS = [
  { color: '#6366f1', lightColor: '#4f46e5', bg: 'rgba(99, 102, 241, 0.12)', bgLight: '#eef2ff' },
  { color: '#10b981', lightColor: '#059669', bg: 'rgba(16, 185, 129, 0.12)', bgLight: '#ecfdf5' },
  { color: '#f59e0b', lightColor: '#d97706', bg: 'rgba(245, 158, 11, 0.12)', bgLight: '#fffbeb' },
  { color: '#a855f7', lightColor: '#9333ea', bg: 'rgba(168, 85, 247, 0.12)', bgLight: '#faf5ff' }
];
let scheduledOneTimePayments = [
  { id: 'default-1', amount: 5000, month: 12 }
];
let isSimpleMode = false;

// DOM Element Selections
const elHomePrice = document.getElementById('home-price');
const elHomePriceSlider = document.getElementById('home-price-slider');
const elDownPayment = document.getElementById('down-payment');
const elDownPaymentPercent = document.getElementById('down-payment-percent');
const elDownPaymentSlider = document.getElementById('down-payment-slider');
const elClosingCosts = document.getElementById('closing-costs');
const elClosingCostsPercent = document.getElementById('closing-costs-percent');
const elClosingCostsSlider = document.getElementById('closing-costs-slider');
const elTotalCashDisplay = document.getElementById('total-cash-display');
const elTakeHomeSalary = document.getElementById('take-home-salary');
const elTakeHomeSlider = document.getElementById('take-home-slider');
const elMonthlyExpenses = document.getElementById('monthly-expenses');
const elExpensesSlider = document.getElementById('expenses-slider');
const elLoanAmountDisplay = document.getElementById('loan-amount-display');
const elInterestRate = document.getElementById('interest-rate');
const elInterestSlider = document.getElementById('interest-slider');
const elLoanTerm = document.getElementById('loan-term');
const elTermSlider = document.getElementById('term-slider');
const elExtraMonthly = document.getElementById('extra-monthly');
const elExtraMonthlySlider = document.getElementById('extra-monthly-slider');
const elBtnResetPayoff = document.getElementById('btn-reset-payoff');
const elOneTimeExtra = document.getElementById('one-time-extra');
const elOneTimeMonth = document.getElementById('one-time-month');
const elPropertyTax = document.getElementById('property-tax');
const elPropertyTaxSlider = document.getElementById('property-tax-slider');
const elHomeInsurance = document.getElementById('home-insurance');
const elHomeInsuranceSlider = document.getElementById('home-insurance-slider');

// Loan Recast DOM Elements
const elEnableRecast = document.getElementById('enable-recast');
const elRecastCardBody = document.getElementById('recast-card-body');
const elRecastAmount = document.getElementById('recast-amount');
const elRecastAmountSlider = document.getElementById('recast-amount-slider');
const elRecastMonth = document.getElementById('recast-month');
const elRecastMonthSlider = document.getElementById('recast-month-slider');
const elRecastNewPayment = document.getElementById('recast-new-payment');
const elRecastMonthlySavings = document.getElementById('recast-monthly-savings');
const elRecastKpiSubRow = document.getElementById('recast-kpi-sub-row');
const elRecastKpiResetMo = document.getElementById('recast-kpi-reset-mo');
const elRecastKpiAdjustedPayment = document.getElementById('recast-kpi-adjusted-payment');
const elRecastCfSubRow = document.getElementById('recast-cf-sub-row');
const elRecastCfStartMo = document.getElementById('recast-cf-start-mo');
const elRecastCfValues = document.getElementById('recast-cf-values');
const elCfTableRowRecast = document.getElementById('cf-table-row-recast');
const elCfRecastMoText = document.getElementById('cf-recast-mo-text');
const elCfRecastPiti = document.getElementById('cf-recast-piti');
const elCfRecastNet = document.getElementById('cf-recast-net');
const elCfRecastDti = document.getElementById('cf-recast-dti');

// ARM & Loan Type DOM Elements
const elArmSettingsPanel = document.getElementById('arm-settings-panel');
const elArmFixedTerm = document.getElementById('arm-fixed-term');
const elArmFixedTermSlider = document.getElementById('arm-fixed-term-slider');
const elArmAdjustedRate = document.getElementById('arm-adjusted-rate');
const elArmAdjustedRateSlider = document.getElementById('arm-adjusted-rate-slider');
const elArmBadgeFixedYears = document.getElementById('arm-badge-fixed-years');
const elArmBadgeFixedRate = document.getElementById('arm-badge-fixed-rate');
const elArmBadgeFixedPayment = document.getElementById('arm-badge-fixed-payment');
const elArmBadgeResetStart = document.getElementById('arm-badge-reset-start');
const elArmBadgeResetEnd = document.getElementById('arm-badge-reset-end');
const elArmBadgeAdjustedRate = document.getElementById('arm-badge-adjusted-rate');
const elArmBadgeAdjustedPayment = document.getElementById('arm-badge-adjusted-payment');
const elArmKpiSubRow = document.getElementById('arm-kpi-sub-row');
const elArmKpiResetYr = document.getElementById('arm-kpi-reset-yr');
const elArmKpiAdjustedPayment = document.getElementById('arm-kpi-adjusted-payment');
const elLabelInterestRate = document.getElementById('label-interest-rate');

// DTI Circular Gauge DOM Elements
const elDtiGaugeFill = document.getElementById('dti-gauge-fill');
const elDtiStatusPill = document.getElementById('dti-status-pill');
const elDtiStatusText = document.getElementById('dti-status-text');
const elDtiStatusIcon = document.getElementById('dti-status-icon');
const elKpiDiscretionarySub = document.getElementById('kpi-discretionary-sub');

// Scenario & Storage DOM Elements
const elBtnSaveScenario = document.getElementById('btn-save-scenario');
const elBtnDuplicateScenario = document.getElementById('btn-duplicate-scenario');
const elScenarioSelect = document.getElementById('scenario-select');
const elBtnDeleteScenario = document.getElementById('btn-delete-scenario');
const elActiveScenarioName = document.getElementById('active-scenario-name');
const elScenarioCommentsBanner = document.getElementById('scenario-comments-banner');
const elActiveScenarioComments = document.getElementById('active-scenario-comments');
const elBannerScenarioTitle = document.getElementById('banner-scenario-title');

// Save Scenario Modal DOM Elements
const elModalSaveScenario = document.getElementById('modal-save-scenario');
const elScenarioNameInput = document.getElementById('scenario-name-input');
const elScenarioCommentsInput = document.getElementById('scenario-comments-input');
const elBtnCloseModal = document.getElementById('btn-close-modal');
const elBtnCancelModal = document.getElementById('btn-cancel-modal');
const elBtnConfirmSaveScenario = document.getElementById('btn-confirm-save-scenario');

// Theme Switcher DOM Elements
const elBtnThemeToggle = document.getElementById('btn-theme-toggle');
const elThemeToggleIcon = document.getElementById('theme-toggle-icon');

// Terms & Disclaimer Modal DOM Elements
const elBtnOpenDisclaimer = document.getElementById('btn-open-disclaimer');
const elModalDisclaimer = document.getElementById('modal-disclaimer');
const elBtnCloseDisclaimer = document.getElementById('btn-close-disclaimer');
const elBtnXCloseDisclaimer = document.getElementById('btn-x-close-disclaimer');

const STORAGE_KEYS = {
  SCENARIOS: 'mortgagability_scenarios',
  CURRENT_STATE: 'mortgagability_current_state',
  THEME: 'mortgagability_theme',
  MODE: 'mortgagability_simple_mode'
};

const DEFAULT_INPUT_VALUES = {
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

const NON_RESETTABLE_FIELDS = new Set([
  'home-price',
  'down-payment',
  'down-payment-percent',
  'interest-rate',
  'take-home-salary',
  'monthly-expenses'
]);

let currentScenarioId = null;

// Default interest rates by loan preset
const DEFAULT_PRESET_RATES = {
  '30-fixed': 6.5,
  '15-fixed': 5.75,
  '5-arm': 6.0,
  '7-arm': 6.125,
  '10-arm': 6.25,
  'custom': 6.5
};

// Loan structure state
let activeLoanPreset = '30-fixed';
let loanPresetRates = { ...DEFAULT_PRESET_RATES };
let isArmLoan = false;

// KPI Outputs
const elKpiStandardPayment = document.getElementById('kpi-standard-payment');
const elKpiTotalPayment = document.getElementById('kpi-total-payment');
const elKpiInterestSaved = document.getElementById('kpi-interest-saved');
const elKpiInterestPaid = document.getElementById('kpi-interest-paid');
const elKpiStandardInterestPaid = document.getElementById('kpi-standard-interest-paid');
const elKpiInterestSavingsRate = document.getElementById('kpi-interest-savings-rate');
const elKpiTimeSaved = document.getElementById('kpi-time-saved');
const elKpiPayoffTerm = document.getElementById('kpi-payoff-term');
const elKpiNetCashFlow = document.getElementById('kpi-net-cash-flow');
const elKpiDtiRatio = document.getElementById('kpi-dti-ratio');
const elKpiCashFlowCard = document.getElementById('kpi-cash-flow-card');
const elBreakdownPi = document.getElementById('breakdown-pi');
const elBreakdownTax = document.getElementById('breakdown-tax');
const elBreakdownIns = document.getElementById('breakdown-ins');

// Target Term Calculator Elements
const elTargetTerm = document.getElementById('target-term');
const elTargetTermSlider = document.getElementById('target-term-slider');
const elTargetPrincipal = document.getElementById('target-principal');
const elBtnResetTargetPrincipal = document.getElementById('btn-reset-target-principal');
const elTargetExtraPayment = document.getElementById('target-extra-payment');
const elTargetTotalPayment = document.getElementById('target-total-payment');
const elTargetInterestPaid = document.getElementById('target-interest-paid');
const elTargetInterestSaved = document.getElementById('target-interest-saved');
const elBtnApplyTarget = document.getElementById('btn-apply-target');

// Amortization Table Elements
const elBtnViewAnnual = document.getElementById('btn-view-annual');
const elBtnViewMonthly = document.getElementById('btn-view-monthly');
const elBtnExportCsv = document.getElementById('btn-export-csv');
const elScheduleTbody = document.getElementById('schedule-tbody');
const elTablePagination = document.getElementById('table-pagination');
const elBtnPrevPage = document.getElementById('btn-prev-page');
const elBtnNextPage = document.getElementById('btn-next-page');
const elPaginationInfo = document.getElementById('pagination-info');

// ==========================================================================
// FINANCIAL CALCULATION MATH FUNCTIONS
// ==========================================================================

/**
 * Calculates standard monthly Principal and Interest (P&I) payment.
 * Formula: M = P * [ i(1 + i)^n ] / [ (1 + i)^n - 1 ]
 */
function calculateMonthlyPayment(principal, annualRate, termYears) {
  if (principal <= 0) return 0;
  const monthlyRate = (annualRate / 100) / 12;
  const totalMonths = termYears * 12;

  if (monthlyRate === 0) {
    return principal / totalMonths;
  }

  return (
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1)
  );
}

/**
 * Helper to sum one-time extra payments for a specific month.
 * Supports both array of payments [{ amount, month }] and single (oneTimeExtra, oneTimeMonth).
 */
function getLumpSumForMonth(oneTimeExtra, oneTimeMonth, month) {
  if (Array.isArray(oneTimeExtra)) {
    return oneTimeExtra
      .filter(item => parseInt(item.month) === month)
      .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  }
  if (typeof oneTimeExtra === 'number' && oneTimeExtra > 0) {
    return month === oneTimeMonth ? oneTimeExtra : 0;
  }
  return 0;
}

/**
 * Helper to calculate total sum of all one-time extra payments.
 */
function getTotalLumpSumAmount(oneTimeExtra) {
  if (Array.isArray(oneTimeExtra)) {
    return oneTimeExtra.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  }
  return parseFloat(oneTimeExtra) || 0;
}

/**
 * Generates both standard and accelerated amortization schedules.
 * Supports both fixed-rate loans and ARM (Adjustable-Rate Mortgages).
 */
function calculateAmortizationSchedules(
  homePrice,
  downPayment,
  annualRate,
  termYears,
  extraMonthly,
  oneTimeExtra,
  oneTimeMonth,
  isArm = false,
  armFixedYears = 5,
  armAdjustedRate = 7.5,
  scheduledOneTimePayments = [],
  isRecast = false,
  recastAmount = 50000,
  recastMonth = 60
) {
  const principal = Math.max(0, homePrice - downPayment);
  const initialMonthlyRate = (annualRate / 100) / 12;
  const adjustedMonthlyRate = (armAdjustedRate / 100) / 12;
  const standardTermMonths = termYears * 12;
  const armFixedMonths = Math.min(standardTermMonths, Math.max(1, armFixedYears * 12));

  const baseMonthlyPayment = calculateMonthlyPayment(principal, annualRate, termYears);
  let adjustedMonthlyPayment = baseMonthlyPayment;

  const isRecastActive = !!isRecast && recastAmount > 0 && recastMonth > 0 && recastMonth < standardTermMonths;
  let recastNewPayment = null;

  // 1. Generate Standard Schedule
  const standardSchedule = [];
  let stdBalance = principal;
  let stdTotalInterest = 0;
  let stdBasePayment = baseMonthlyPayment;

  for (let m = 1; m <= standardTermMonths; m++) {
    if (stdBalance <= 0) break;

    // Check if ARM reset month reached
    if (isArm && m === armFixedMonths + 1) {
      const remainingTermYears = Math.max(1, termYears - (armFixedMonths / 12));
      stdBasePayment = calculateMonthlyPayment(stdBalance, armAdjustedRate, remainingTermYears);
      adjustedMonthlyPayment = stdBasePayment;
    }

    const currentRate = (isArm && m > armFixedMonths) ? adjustedMonthlyRate : initialMonthlyRate;
    const interestPaid = stdBalance * currentRate;
    let principalPaid = stdBasePayment - interestPaid;

    if (stdBalance + interestPaid < stdBasePayment) {
      principalPaid = stdBalance;
    }

    // Check for Recast at specified month
    if (isRecastActive && m === recastMonth) {
      const recastLump = Math.min(stdBalance - principalPaid, recastAmount);
      principalPaid += recastLump;
    }

    const endingBalance = Math.max(0, stdBalance - principalPaid);
    stdTotalInterest += interestPaid;

    standardSchedule.push({
      month: m,
      startingBalance: stdBalance,
      basePayment: principalPaid + interestPaid,
      extraPayment: 0,
      interestPaid: interestPaid,
      principalPaid: principalPaid,
      endingBalance: endingBalance,
      cumulativeInterest: stdTotalInterest
    });

    stdBalance = endingBalance;

    // Recalculate base payment starting next month after recast
    if (isRecastActive && m === recastMonth && stdBalance > 0) {
      const remainingTermMonths = Math.max(1, standardTermMonths - recastMonth);
      const activeRate = (isArm && m >= armFixedMonths) ? armAdjustedRate : annualRate;
      stdBasePayment = calculateMonthlyPayment(stdBalance, activeRate, remainingTermMonths / 12);
      recastNewPayment = stdBasePayment;
    }
  }

  // 2. Generate Accelerated Schedule
  const acceleratedSchedule = [];
  let accBalance = principal;
  let accTotalInterest = 0;
  let accBasePayment = baseMonthlyPayment;
  let m = 1;

  while (accBalance > 0 && m <= 600) { // Safety cutoff at 50 years
    // Check if ARM reset month reached for accelerated path
    if (isArm && m === armFixedMonths + 1) {
      const remainingTermYears = Math.max(1, termYears - (armFixedMonths / 12));
      accBasePayment = accBalance > 0
        ? calculateMonthlyPayment(accBalance, armAdjustedRate, remainingTermYears)
        : 0;
    }

    const currentRate = (isArm && m > armFixedMonths) ? adjustedMonthlyRate : initialMonthlyRate;
    const interestPaid = accBalance * currentRate;

    // Scheduled payment (interest + scheduled principal)
    let scheduledPayment = accBasePayment;
    let basePrincipalPaid = scheduledPayment - interestPaid;

    // Capping at remaining balance
    if (accBalance + interestPaid < scheduledPayment) {
      scheduledPayment = accBalance + interestPaid;
      basePrincipalPaid = accBalance;
    }
    if (basePrincipalPaid < 0) basePrincipalPaid = 0;

    // Determine extra payment
    let appliedExtra = extraMonthly + getLumpSumForMonth(oneTimeExtra, oneTimeMonth, m);

    // Apply recast lump sum at recastMonth
    let isRecastAppliedThisMonth = false;
    if (isRecastActive && m === recastMonth) {
      isRecastAppliedThisMonth = true;
      appliedExtra += recastAmount;
    }

    // Capping extra payments if balance is paid off early
    let remainingAfterBase = accBalance - basePrincipalPaid;
    if (appliedExtra > remainingAfterBase) {
      appliedExtra = remainingAfterBase;
    }

    const totalPrincipalPaid = basePrincipalPaid + appliedExtra;
    const endingBalance = Math.max(0, accBalance - totalPrincipalPaid);
    accTotalInterest += interestPaid;

    acceleratedSchedule.push({
      month: m,
      startingBalance: accBalance,
      basePayment: scheduledPayment,
      extraPayment: appliedExtra,
      interestPaid: interestPaid,
      principalPaid: totalPrincipalPaid,
      endingBalance: endingBalance,
      cumulativeInterest: accTotalInterest,
      isRecastMonth: isRecastAppliedThisMonth
    });

    accBalance = endingBalance;

    // Recalculate base payment starting next month after recast
    if (isRecastActive && m === recastMonth && accBalance > 0) {
      const remainingTermMonths = Math.max(1, standardTermMonths - recastMonth);
      const activeRate = (isArm && m >= armFixedMonths) ? armAdjustedRate : annualRate;
      accBasePayment = calculateMonthlyPayment(accBalance, activeRate, remainingTermMonths / 12);
      if (!recastNewPayment) recastNewPayment = accBasePayment;
    }

    m++;
  }

  // Calculate summaries
  const stdTotalPaid = principal + stdTotalInterest;
  const accTotalPaid = principal + accTotalInterest;
  const interestSaved = Math.max(0, stdTotalInterest - accTotalInterest);

  const stdMonths = standardSchedule.length;
  const accMonths = acceleratedSchedule.length;
  const monthsSaved = Math.max(0, stdMonths - accMonths);

  // Breakdown of Interest Savings by Source
  let savingsMonthlyAllocated = 0;
  let savingsLumpSumAllocated = 0;

  const hasLumpSum = getTotalLumpSumAmount(oneTimeExtra) > 0 || isRecastActive;

  if (interestSaved > 0) {
    if (extraMonthly > 0 && hasLumpSum) {
      const interestWithMonthlyOnly = simulateTotalInterest(principal, annualRate, termYears, extraMonthly, 0, oneTimeMonth, isArm, armFixedYears, armAdjustedRate);
      const interestWithLumpOnly = simulateTotalInterest(principal, annualRate, termYears, 0, oneTimeExtra, oneTimeMonth, isArm, armFixedYears, armAdjustedRate);

      const standaloneMonthly = Math.max(0, stdTotalInterest - interestWithMonthlyOnly);
      const standaloneLump = Math.max(0, stdTotalInterest - interestWithLumpOnly);
      const totalStandalone = standaloneMonthly + standaloneLump;

      if (totalStandalone > 0) {
        savingsMonthlyAllocated = (standaloneMonthly / totalStandalone) * interestSaved;
        savingsLumpSumAllocated = interestSaved - savingsMonthlyAllocated;
      } else {
        savingsMonthlyAllocated = interestSaved;
        savingsLumpSumAllocated = 0;
      }
    } else if (extraMonthly > 0) {
      savingsMonthlyAllocated = interestSaved;
      savingsLumpSumAllocated = 0;
    } else if (hasLumpSum) {
      savingsMonthlyAllocated = 0;
      savingsLumpSumAllocated = interestSaved;
    }
  }

  // Calculate milestone event months
  let pmiDropMonth = null;
  const downPercent = homePrice > 0 ? (downPayment / homePrice) * 100 : 0;
  if (downPercent < 20 && homePrice > 0) {
    const target80Balance = homePrice * 0.8;
    const pmiRow = acceleratedSchedule.find(r => r.endingBalance <= target80Balance) ||
      standardSchedule.find(r => r.endingBalance <= target80Balance);
    if (pmiRow) {
      pmiDropMonth = pmiRow.month;
    }
  }

  const armResetMonth = isArm ? armFixedMonths : null;
  const acceleratedPayoffMonth = (monthsSaved > 0 && accMonths < stdMonths) ? accMonths : null;

  return {
    standard: standardSchedule,
    accelerated: acceleratedSchedule,
    summary: {
      principal: principal,
      baseMonthlyPayment: baseMonthlyPayment,
      adjustedMonthlyPayment: isArm ? adjustedMonthlyPayment : baseMonthlyPayment,
      isArm: isArm,
      armFixedYears: armFixedYears,
      armAdjustedRate: armAdjustedRate,
      isRecast: isRecastActive,
      recastAmount: isRecastActive ? recastAmount : 0,
      recastMonth: isRecastActive ? recastMonth : null,
      recastNewPayment: isRecastActive ? (recastNewPayment || baseMonthlyPayment) : null,
      standardTotalInterest: stdTotalInterest,
      standardTotalPaid: stdTotalPaid,
      acceleratedTotalInterest: accTotalInterest,
      acceleratedTotalPaid: accTotalPaid,
      interestSaved: interestSaved,
      savingsMonthlyAllocated: savingsMonthlyAllocated,
      savingsLumpSumAllocated: savingsLumpSumAllocated,
      standardMonths: stdMonths,
      acceleratedMonths: accMonths,
      monthsSaved: monthsSaved,
      pmiDropMonth: pmiDropMonth,
      armResetMonth: armResetMonth,
      acceleratedPayoffMonth: acceleratedPayoffMonth
    }
  };
}

/**
 * Lightweight simulation helper to compute total interest under specified extra payment conditions.
 */
function simulateTotalInterest(principal, initialRate, termYears, extraMonthly = 0, oneTimeExtra = 0, oneTimeMonth = 12, isArm = false, armFixedYears = 5, armAdjustedRate = 8) {
  let balance = principal;
  let totalInterest = 0;
  const initialMonthlyRate = (initialRate / 100) / 12;
  const adjustedMonthlyRate = (armAdjustedRate / 100) / 12;
  const armFixedMonths = armFixedYears * 12;
  let basePayment = initialMonthlyRate === 0 ? principal / (termYears * 12) : calculateMonthlyPayment(principal, initialRate, termYears);

  let m = 1;
  while (balance > 0 && m <= 600) {
    if (isArm && m === armFixedMonths + 1) {
      const remainingTermYears = Math.max(1, termYears - (armFixedMonths / 12));
      basePayment = calculateMonthlyPayment(balance, armAdjustedRate, remainingTermYears);
    }
    const currentRate = (isArm && m > armFixedMonths) ? adjustedMonthlyRate : initialMonthlyRate;
    const interestPaid = balance * currentRate;
    let scheduledPayment = basePayment;
    let basePrincipalPaid = scheduledPayment - interestPaid;
    if (balance + interestPaid < scheduledPayment) {
      basePrincipalPaid = balance;
    }
    if (basePrincipalPaid < 0) basePrincipalPaid = 0;

    let appliedExtra = extraMonthly + getLumpSumForMonth(oneTimeExtra, oneTimeMonth, m);
    let remainingAfterBase = balance - basePrincipalPaid;
    if (appliedExtra > remainingAfterBase) appliedExtra = remainingAfterBase;

    totalInterest += interestPaid;
    balance = Math.max(0, balance - (basePrincipalPaid + appliedExtra));
    m++;
  }
  return totalInterest;
}

// ==========================================================================
// TARGET TERM CALCULATOR
// ==========================================================================

function updateTargetTermCalculator() {
  const targetYears = parseFloat(elTargetTerm.value) || 15;
  const targetPrincipal = parseFloat(elTargetPrincipal.value) || 0;
  const annualRate = parseFloat(elInterestRate.value) || 0;

  const monthlyRate = (annualRate / 100) / 12;
  const targetMonths = targetYears * 12;
  const originalBasePayment = currentSchedule.summary.baseMonthlyPayment || 0;

  // Calculate total monthly payment needed to pay off in target term
  let requiredTotalPayment = 0;
  if (targetPrincipal > 0) {
    if (monthlyRate === 0) {
      requiredTotalPayment = targetPrincipal / targetMonths;
    } else {
      requiredTotalPayment = (
        (targetPrincipal * (monthlyRate * Math.pow(1 + monthlyRate, targetMonths))) /
        (Math.pow(1 + monthlyRate, targetMonths) - 1)
      );
    }
  }

  // Extra monthly payment required is the difference
  let extraMonthlyRequired = Math.max(0, requiredTotalPayment - originalBasePayment);

  // If remaining principal is different from original principal, we compare with the base payment
  // corresponding to the original loan.
  elTargetExtraPayment.textContent = formatCurrency(extraMonthlyRequired);

  const homePrice = parseFloat(document.getElementById('home-price').value) || 0;
  const propTaxRate = parseFloat(elPropertyTax.value) || 0;
  const insRate = parseFloat(elHomeInsurance.value) || 0;
  const monthlyTax = (homePrice * (propTaxRate / 100)) / 12;
  const monthlyInsurance = (homePrice * (insRate / 100)) / 12;

  elTargetTotalPayment.textContent = formatCurrency(requiredTotalPayment + monthlyTax + monthlyInsurance);

  // Estimate interest under target schedule
  let targetBalance = targetPrincipal;
  let targetTotalInterest = 0;
  for (let m = 1; m <= targetMonths; m++) {
    const interest = targetBalance * monthlyRate;
    let principalPaid = requiredTotalPayment - interest;
    if (targetBalance + interest < requiredTotalPayment) {
      principalPaid = targetBalance;
    }
    targetBalance = Math.max(0, targetBalance - principalPaid);
    targetTotalInterest += interest;
    if (targetBalance <= 0) break;
  }

  elTargetInterestPaid.textContent = formatCurrency(targetTotalInterest);

  // Calculate savings vs base schedule
  // Find what the interest would be for the remaining principal under standard payments
  let baseInterestForRemaining = 0;
  let baseBalance = targetPrincipal;
  for (let m = 1; m <= (parseFloat(elLoanTerm.value) * 12); m++) {
    const interest = baseBalance * monthlyRate;
    let principalPaid = originalBasePayment - interest;
    if (principalPaid < 0) principalPaid = 0; // Avoid negative principal if interest is high
    if (baseBalance + interest < originalBasePayment) {
      principalPaid = baseBalance;
    }
    baseBalance = Math.max(0, baseBalance - principalPaid);
    baseInterestForRemaining += interest;
    if (baseBalance <= 0) break;
  }

  const interestSaved = Math.max(0, baseInterestForRemaining - targetTotalInterest);
  elTargetInterestSaved.textContent = formatCurrency(interestSaved);
}

// ==========================================================================
// RENDER & UI SYNC ACTIONS
// ==========================================================================

/**
 * Format helper for currency.
 */
function formatCurrency(val) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(val);
}

/**
 * Update UI metric cards and inputs displays.
 */
function updateUI() {
  const summary = currentSchedule.summary;

  // Sync loan amount display
  elLoanAmountDisplay.textContent = formatCurrency(summary.principal);

  // Sync total cash required display (down payment + closing costs)
  const dpVal = parseFloat(elDownPayment.value) || 0;
  const ccVal = parseFloat(elClosingCosts.value) || 0;
  elTotalCashDisplay.textContent = formatCurrency(dpVal + ccVal);

  // Base payment and total payment (including extra monthly, tax, insurance, and PMI)
  const homePrice = parseFloat(elHomePrice.value) || 0;
  const downPayment = parseFloat(elDownPayment.value) || 0;
  const loanPrincipal = Math.max(0, homePrice - downPayment);
  const downPercent = homePrice > 0 ? (downPayment / homePrice) * 100 : 0;
  const monthlyPmi = (downPercent < 20 && loanPrincipal > 0) ? (loanPrincipal * 0.005) / 12 : 0;

  const propTaxRate = parseFloat(elPropertyTax.value) || 0;
  const insRate = parseFloat(elHomeInsurance.value) || 0;

  const monthlyTax = (homePrice * (propTaxRate / 100)) / 12;
  const monthlyInsurance = (homePrice * (insRate / 100)) / 12;

  const standardPITI = summary.baseMonthlyPayment + monthlyTax + monthlyInsurance + monthlyPmi;
  elKpiStandardPayment.textContent = formatCurrency(standardPITI);

  const totalMonthlyPITIWithExtra = standardPITI + parseFloat(elExtraMonthly.value || 0);
  elKpiTotalPayment.textContent = formatCurrency(totalMonthlyPITIWithExtra);

  // Update breakdown values
  elBreakdownPi.textContent = formatCurrency(summary.baseMonthlyPayment);
  elBreakdownTax.textContent = formatCurrency(monthlyTax);
  elBreakdownIns.textContent = formatCurrency(monthlyInsurance);

  const elBreakdownPmi = document.getElementById('breakdown-pmi');
  const elBreakdownPmiWrapper = document.getElementById('breakdown-pmi-wrapper');
  if (elBreakdownPmiWrapper) {
    if (monthlyPmi > 0) {
      elBreakdownPmiWrapper.style.display = 'inline';
      if (elBreakdownPmi) elBreakdownPmi.textContent = formatCurrency(monthlyPmi);
    } else {
      elBreakdownPmiWrapper.style.display = 'none';
    }
  }

  // Render Interactive Donut Chart View
  renderPitiDonutChart(summary.baseMonthlyPayment, monthlyTax, monthlyInsurance, monthlyPmi);

  // Handle Recast KPI sub-row (Post-Recast PITI) in Card 1
  const postRecastPITI = (summary.isRecast && summary.recastNewPayment)
    ? summary.recastNewPayment + monthlyTax + monthlyInsurance + monthlyPmi
    : null;

  if (summary.isRecast && postRecastPITI) {
    if (elRecastKpiSubRow) elRecastKpiSubRow.style.display = 'flex';
    if (elRecastKpiResetMo) elRecastKpiResetMo.textContent = summary.recastMonth + 1;
    if (elRecastKpiAdjustedPayment) elRecastKpiAdjustedPayment.textContent = formatCurrency(postRecastPITI);
  } else {
    if (elRecastKpiSubRow) elRecastKpiSubRow.style.display = 'none';
  }

  // Handle ARM KPI sub-row & ARM Phase Badge displays
  if (summary.isArm) {
    if (elArmKpiSubRow) elArmKpiSubRow.style.display = 'flex';
    const resetPITI = summary.adjustedMonthlyPayment + monthlyTax + monthlyInsurance;
    if (elArmKpiResetYr) elArmKpiResetYr.textContent = summary.armFixedYears + 1;
    if (elArmKpiAdjustedPayment) elArmKpiAdjustedPayment.textContent = formatCurrency(resetPITI);

    const termYears = parseFloat(elLoanTerm.value) || 30;
    const initialRate = parseFloat(elInterestRate.value) || 0;
    const adjustedRate = parseFloat(elArmAdjustedRate ? elArmAdjustedRate.value : summary.armAdjustedRate) || 0;

    if (elArmBadgeFixedYears) elArmBadgeFixedYears.textContent = summary.armFixedYears;
    if (elArmBadgeFixedRate) elArmBadgeFixedRate.textContent = `${initialRate.toFixed(2)}%`;
    if (elArmBadgeFixedPayment) elArmBadgeFixedPayment.textContent = `${formatCurrency(summary.baseMonthlyPayment)}/mo`;

    if (elArmBadgeResetStart) elArmBadgeResetStart.textContent = summary.armFixedYears + 1;
    if (elArmBadgeResetEnd) elArmBadgeResetEnd.textContent = termYears;
    if (elArmBadgeAdjustedRate) elArmBadgeAdjustedRate.textContent = `${adjustedRate.toFixed(2)}%`;
    if (elArmBadgeAdjustedPayment) elArmBadgeAdjustedPayment.textContent = `${formatCurrency(summary.adjustedMonthlyPayment)}/mo`;
  } else {
    if (elArmKpiSubRow) elArmKpiSubRow.style.display = 'none';
  }

  // Net Cash Flow & DTI calculations using PITI
  const takeHome = parseFloat(elTakeHomeSalary.value) || 0;
  const expenses = parseFloat(elMonthlyExpenses.value) || 0;
  const netCashFlow = takeHome - expenses - totalMonthlyPITIWithExtra;

  if (elKpiNetCashFlow) elKpiNetCashFlow.textContent = formatCurrency(netCashFlow);
  if (elKpiDiscretionarySub) elKpiDiscretionarySub.textContent = formatCurrency(expenses);

  const elCfTableIncome = document.getElementById('cf-table-income');
  const elCfTablePiti = document.getElementById('cf-table-piti');
  const elCfTableNet = document.getElementById('cf-table-net');

  if (elCfTableIncome) elCfTableIncome.textContent = formatCurrency(takeHome);
  if (elCfTablePiti) elCfTablePiti.textContent = formatCurrency(totalMonthlyPITIWithExtra);
  if (elCfTableNet) elCfTableNet.textContent = formatCurrency(netCashFlow);

  const dti = takeHome > 0 ? ((totalMonthlyPITIWithExtra + expenses) / takeHome) * 100 : 0;
  if (elKpiDtiRatio) elKpiDtiRatio.textContent = `${dti.toFixed(1)}%`;

  // Handle Recast Net Cash Flow & DTI Displays (Card 2 Post-Recast Lifetime Stage)
  const postRecastPITIWithExtra = postRecastPITI !== null
    ? postRecastPITI + parseFloat(elExtraMonthly.value || 0)
    : null;

  const postRecastNetCashFlow = postRecastPITIWithExtra !== null
    ? takeHome - expenses - postRecastPITIWithExtra
    : null;

  const postRecastDti = (postRecastPITIWithExtra !== null && takeHome > 0)
    ? ((postRecastPITIWithExtra + expenses) / takeHome) * 100
    : null;

  if (summary.isRecast && postRecastNetCashFlow !== null && postRecastDti !== null) {
    if (elRecastCfSubRow) elRecastCfSubRow.style.display = 'flex';
    if (elRecastCfStartMo) elRecastCfStartMo.textContent = summary.recastMonth + 1;
    if (elRecastCfValues) {
      elRecastCfValues.textContent = `Net: ${formatCurrency(postRecastNetCashFlow)} | DTI: ${postRecastDti.toFixed(1)}%`;
    }

    if (elCfTableRowRecast) elCfTableRowRecast.style.display = 'table-row';
    if (elCfRecastMoText) elCfRecastMoText.textContent = summary.recastMonth + 1;
    if (elCfRecastPiti) elCfRecastPiti.textContent = formatCurrency(postRecastPITIWithExtra);
    if (elCfRecastNet) elCfRecastNet.textContent = formatCurrency(postRecastNetCashFlow);
    if (elCfRecastDti) elCfRecastDti.textContent = `${postRecastDti.toFixed(1)}%`;
  } else {
    if (elRecastCfSubRow) elRecastCfSubRow.style.display = 'none';
    if (elCfTableRowRecast) elCfTableRowRecast.style.display = 'none';
  }

  // Circular DTI SVG Gauge calculations
  // Circumference for r=38 is 2 * PI * 38 = 238.76
  const circumference = 238.76;
  const fillPercent = Math.min(100, Math.max(0, dti));
  const strokeOffset = circumference - (fillPercent / 100) * circumference;

  if (elDtiGaugeFill) {
    elDtiGaugeFill.style.strokeDashoffset = strokeOffset;
  }

  // Thresholds: Green (< 28% ideal), Yellow (28%–36% manageable), Red (> 36% high risk)
  if (dti < 28) {
    if (elDtiGaugeFill) {
      elDtiGaugeFill.style.stroke = '#10b981';
      elDtiGaugeFill.style.filter = 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.4))';
    }
    if (elDtiStatusPill) elDtiStatusPill.className = 'dti-status-pill ideal';
    if (elDtiStatusText) elDtiStatusText.textContent = 'Ideal (<28%)';
    if (elDtiStatusIcon) elDtiStatusIcon.className = 'fa-solid fa-shield-halved';
  } else if (dti <= 36) {
    if (elDtiGaugeFill) {
      elDtiGaugeFill.style.stroke = '#f59e0b';
      elDtiGaugeFill.style.filter = 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.4))';
    }
    if (elDtiStatusPill) elDtiStatusPill.className = 'dti-status-pill manageable';
    if (elDtiStatusText) elDtiStatusText.textContent = 'Manageable (28%–36%)';
    if (elDtiStatusIcon) elDtiStatusIcon.className = 'fa-solid fa-triangle-exclamation';
  } else {
    if (elDtiGaugeFill) {
      elDtiGaugeFill.style.stroke = '#ef4444';
      elDtiGaugeFill.style.filter = 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.4))';
    }
    if (elDtiStatusPill) elDtiStatusPill.className = 'dti-status-pill high-risk';
    if (elDtiStatusText) elDtiStatusText.textContent = 'High Risk (>36%)';
    if (elDtiStatusIcon) elDtiStatusIcon.className = 'fa-solid fa-triangle-exclamation';
  }

  // Color code Cash Flow card background based on affordability
  if (netCashFlow < 0) {
    elKpiCashFlowCard.className = 'kpi-card danger';
  } else {
    elKpiCashFlowCard.className = 'kpi-card highlight';
  }

  // Interest saved and paid
  elKpiInterestSaved.textContent = formatCurrency(summary.interestSaved);
  elKpiInterestPaid.textContent = formatCurrency(summary.acceleratedTotalInterest);
  elKpiStandardInterestPaid.textContent = formatCurrency(summary.standardTotalInterest);

  const elKpiSimpleInterestSaved = document.getElementById('kpi-simple-interest-saved');
  if (elKpiSimpleInterestSaved) {
    elKpiSimpleInterestSaved.textContent = formatCurrency(summary.interestSaved);
  }

  const savingsRate = summary.standardTotalInterest > 0
    ? (summary.interestSaved / summary.standardTotalInterest) * 100
    : 0;
  elKpiInterestSavingsRate.textContent = `${savingsRate.toFixed(1)}%`;

  // Update Savings Breakdown Micro-Pill Chips
  const elSavingsMonthlyVal = document.getElementById('savings-monthly-val');
  const elSavingsLumpVal = document.getElementById('savings-lump-val');
  const elChipMonthly = document.getElementById('chip-savings-monthly');
  const elChipLump = document.getElementById('chip-savings-lump');

  const extraMonthlyVal = parseFloat(elExtraMonthly.value) || 0;
  const oneTimeExtraVal = parseFloat(elOneTimeExtra.value) || 0;

  if (elSavingsMonthlyVal) {
    elSavingsMonthlyVal.textContent = formatCurrency(summary.savingsMonthlyAllocated || 0);
  }
  if (elSavingsLumpVal) {
    elSavingsLumpVal.textContent = formatCurrency(summary.savingsLumpSumAllocated || 0);
  }

  if (elChipMonthly) {
    if (extraMonthlyVal > 0) {
      elChipMonthly.classList.remove('dimmed');
      elChipMonthly.classList.add('active');
    } else {
      elChipMonthly.classList.add('dimmed');
      elChipMonthly.classList.remove('active');
    }
  }

  if (elChipLump) {
    if (oneTimeExtraVal > 0 || summary.isRecast) {
      elChipLump.classList.remove('dimmed');
      elChipLump.classList.add('active');
    } else {
      elChipLump.classList.add('dimmed');
      elChipLump.classList.remove('active');
    }
  }

  // Update Recast Live Impact Badge
  if (summary.isRecast && summary.recastNewPayment) {
    if (elRecastNewPayment) {
      elRecastNewPayment.textContent = formatCurrency(summary.recastNewPayment);
    }
    if (elRecastMonthlySavings) {
      const origBase = summary.baseMonthlyPayment || 0;
      const newBase = summary.recastNewPayment || 0;
      const savings = Math.max(0, origBase - newBase);
      elRecastMonthlySavings.textContent = `+${formatCurrency(savings)}/mo`;
    }
  }

  // Time saved display
  const monthsSaved = summary.monthsSaved;
  if (monthsSaved === 0) {
    elKpiTimeSaved.textContent = "0 Months";
  } else {
    const years = Math.floor(monthsSaved / 12);
    const months = monthsSaved % 12;
    let timeStr = "";
    if (years > 0) timeStr += `${years} Yr${years > 1 ? 's' : ''}`;
    if (months > 0) timeStr += `${timeStr ? ' ' : ''}${months} Mo${months > 1 ? 's' : ''}`;
    elKpiTimeSaved.textContent = timeStr;
  }

  // Payoff Term
  const accMonths = summary.acceleratedMonths;
  const years = Math.floor(accMonths / 12);
  const months = accMonths % 12;
  let termStr = "";
  if (years > 0) termStr += `${years} Yr${years > 1 ? 's' : ''}`;
  if (months > 0) termStr += `${termStr ? ' ' : ''}${months} Mo${months > 1 ? 's' : ''}`;
  elKpiPayoffTerm.textContent = termStr || "0 Mos";

  // Update Milestone Event Summary Badges
  updateMilestoneSummaryStrip();

  // Update Accordion Summary Badges & Mobile Floating Summary Bar
  updateAccordionSummaries();
  updateMobileSummaryBar(
    totalMonthlyPITIWithExtra,
    termStr,
    netCashFlow,
    summary.acceleratedTotalInterest,
    summary.interestSaved,
    extraMonthlyVal
  );

  // Re-render chart and table
  renderChart();
  renderTable();

  // Update field modified vs default indicator badges
  updateFieldModifiedIndicators();
}

/**
 * Renders milestone event flag badges above the chart.
 */
function updateMilestoneSummaryStrip() {
  const container = document.getElementById('chart-milestones-bar');
  if (!container) return;

  container.innerHTML = '';
  const milestonePills = [];
  const isLight = typeof document !== 'undefined' && document.documentElement && document.documentElement.getAttribute('data-theme') === 'light';

  const savedScenarios = getSavedScenarios();
  const activeSelectedScenarios = savedScenarios.filter(s => compareSelectedIds.includes(s.id));

  if (isCompareMode && activeSelectedScenarios.length >= 2) {
    activeSelectedScenarios.forEach((s, idx) => {
      const state = s.state || {};
      const homePrice = state.homePrice || 450000;
      const downPayment = state.downPayment || 90000;
      const interestRate = state.interestRate || 6.5;
      const loanTerm = state.loanTerm || 30;
      const extraMonthly = state.extraMonthly || 0;
      const oneTimeExtra = state.oneTimeExtra || 0;
      const oneTimeMonth = state.oneTimeMonth || 12;
      const isArmLoan = !!state.isArmLoan;
      const armFixedTerm = state.armFixedTerm || 5;
      const armAdjustedRate = state.armAdjustedRate || 7.5;
      const scheduledOneTimePayments = state.scheduledOneTimePayments || [];
      const isRecastEnabled = !!state.isRecastEnabled;
      const recastAmount = state.recastAmount || 50000;
      const recastMonth = state.recastMonth || 60;

      const sched = calculateAmortizationSchedules(
        homePrice,
        downPayment,
        interestRate,
        loanTerm,
        extraMonthly,
        oneTimeExtra,
        oneTimeMonth,
        isArmLoan,
        armFixedTerm,
        armAdjustedRate,
        scheduledOneTimePayments,
        isRecastEnabled,
        recastAmount,
        recastMonth
      );

      const summary = sched.summary || {};
      const colorObj = COMPARE_SCENARIO_COLORS[idx % COMPARE_SCENARIO_COLORS.length];
      const strokeColor = isLight ? colorObj.lightColor : colorObj.color;
      const bgColor = isLight ? colorObj.bgLight : colorObj.bg;
      const customStyle = `style="background: ${bgColor}; border-color: ${strokeColor}; color: ${strokeColor};"`;

      if (summary.pmiDropMonth) {
        const yr = (summary.pmiDropMonth / 12).toFixed(1);
        milestonePills.push(`
          <div class="milestone-badge pmi compare-badge" ${customStyle} title="[${s.name}] PMI cancels when LTV drops below 80%">
            <span>🚩</span>
            <span><strong>[${s.name}] PMI Drop:</strong> Month ${summary.pmiDropMonth} (${yr} Yrs)</span>
          </div>
        `);
      }

      if (summary.isArm && summary.armResetMonth) {
        milestonePills.push(`
          <div class="milestone-badge arm compare-badge" ${customStyle} title="[${s.name}] ARM interest rate reset">
            <span>⚡</span>
            <span><strong>[${s.name}] ARM Reset:</strong> Month ${summary.armResetMonth} (Yr ${summary.armFixedYears}) @ ${summary.armAdjustedRate.toFixed(2)}%</span>
          </div>
        `);
      }

      if (summary.isRecast && summary.recastMonth) {
        const yr = (summary.recastMonth / 12).toFixed(1);
        milestonePills.push(`
          <div class="milestone-badge recast compare-badge" ${customStyle} title="[${s.name}] Mortgage Recast">
            <span>🔄</span>
            <span><strong>[${s.name}] Loan Recast:</strong> Month ${summary.recastMonth} (${yr} Yrs) - $${Math.round(summary.recastAmount / 1000)}k</span>
          </div>
        `);
      }

      if (summary.acceleratedPayoffMonth) {
        const yr = (summary.acceleratedPayoffMonth / 12).toFixed(1);
        milestonePills.push(`
          <div class="milestone-badge payoff compare-badge" ${customStyle} title="[${s.name}] Accelerated Payoff">
            <span>🏁</span>
            <span><strong>[${s.name}] Payoff:</strong> Month ${summary.acceleratedPayoffMonth} (${yr} Yrs)</span>
          </div>
        `);
      }
    });
  } else {
    const summary = currentSchedule.summary || {};

    if (summary.pmiDropMonth) {
      const yr = (summary.pmiDropMonth / 12).toFixed(1);
      milestonePills.push(`
        <div class="milestone-badge pmi" title="PMI cancels when Loan-to-Value drops below 80%">
          <span>🚩</span>
          <span><strong>PMI Drop-Off:</strong> Month ${summary.pmiDropMonth} (${yr} Yrs)</span>
        </div>
      `);
    }

    if (summary.isArm && summary.armResetMonth) {
      milestonePills.push(`
        <div class="milestone-badge arm" title="ARM interest rate resets from initial rate to variable reset rate">
          <span>⚡</span>
          <span><strong>ARM Interest Reset:</strong> Month ${summary.armResetMonth} (Yr ${summary.armFixedYears}) @ ${summary.armAdjustedRate.toFixed(2)}%</span>
        </div>
      `);
    }

    if (summary.isRecast && summary.recastMonth) {
      const yr = (summary.recastMonth / 12).toFixed(1);
      milestonePills.push(`
        <div class="milestone-badge recast" title="Mortgage Recast: lump sum applied to lower monthly payments over remaining term">
          <span>🔄</span>
          <span><strong>Loan Recast:</strong> Month ${summary.recastMonth} (${yr} Yrs) - $${Math.round(summary.recastAmount / 1000)}k Lump Sum</span>
        </div>
      `);
    }

    if (summary.acceleratedPayoffMonth) {
      const yr = (summary.acceleratedPayoffMonth / 12).toFixed(1);
      milestonePills.push(`
        <div class="milestone-badge payoff" title="Loan is 100% paid off early via extra principal payments">
          <span>🏁</span>
          <span><strong>Accelerated Payoff:</strong> Month ${summary.acceleratedPayoffMonth} (${yr} Yrs)</span>
        </div>
      `);
    }
  }

  if (milestonePills.length > 0) {
    container.innerHTML = milestonePills.join('');
  } else {
    container.innerHTML = `
      <div class="milestone-badge" style="background: rgba(255,255,255,0.02); border-color: rgba(255,255,255,0.05); color: var(--text-muted); font-size: 0.72rem;">
        <i class="fa-solid fa-circle-info"></i> Standard fixed loan schedule without active milestone resets.
      </div>
    `;
  }
}

// ==========================================================================
// THEME SWITCHER STATE MANAGEMENT
// ==========================================================================

function getInitialTheme() {
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

function setTheme(theme) {
  const currentTheme = theme === 'light' ? 'light' : 'dark';
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }

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

  if (chartInstance) {
    renderChart();
  }
}

function toggleTheme() {
  const activeTheme = (typeof document !== 'undefined' && document.documentElement)
    ? document.documentElement.getAttribute('data-theme') || 'dark'
    : 'dark';
  const newTheme = activeTheme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
}

function setSimpleMode(enabled) {
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

        // Reset Monthly Payment card to Text view in Simple Mode
        const btnText = document.getElementById('btn-piti-view-text');
        if (btnText) btnText.click();

        // Switch to 30-fixed if an ARM or Custom preset was active
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

function toggleSimpleMode() {
  setSimpleMode(!isSimpleMode);
}

function getInitialMode() {
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

/**
 * Renders the Chart.js visualizer.
 */
function setZoomPreset(preset) {
  activeZoomPreset = preset || 'full';
  const zoomButtons = document.querySelectorAll('.btn-zoom-preset');
  zoomButtons.forEach(b => {
    if (b.getAttribute('data-zoom') === activeZoomPreset) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });
  renderChart();
}

function setChartViewPreset(view) {
  if (Array.isArray(view)) {
    activeChartViews = view.length > 0 ? [...view] : ['balance'];
  } else if (typeof view === 'string') {
    if (activeChartViews.includes(view)) {
      if (activeChartViews.length > 1) {
        activeChartViews = activeChartViews.filter(v => v !== view);
      }
    } else {
      activeChartViews.push(view);
    }
  }
  activeChartView = activeChartViews[0] || 'balance';

  const viewButtons = document.querySelectorAll('.btn-chart-view');
  viewButtons.forEach(b => {
    const v = b.getAttribute('data-view');
    if (activeChartViews.includes(v)) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });
  renderChart();
}

function getActiveChartView() {
  return activeChartView;
}

function getActiveChartViews() {
  return [...activeChartViews];
}

function isMobileViewport() {
  return typeof window !== 'undefined' && (window.innerWidth <= 768 || (window.matchMedia && window.matchMedia('(max-width: 768px)').matches));
}

function getMaxCompareCount() {
  return isMobileViewport() ? 2 : 4;
}

function getCompareMode() {
  return isCompareMode;
}

function getCompareSelectedIds() {
  return compareSelectedIds;
}

function setCompareSelectedIds(ids) {
  compareSelectedIds = ids || [];
  if (isCompareMode) {
    renderCompareControls();
    renderChart();
  }
}

function toggleCompareMode(forceState) {
  isCompareMode = typeof forceState === 'boolean' ? forceState : !isCompareMode;
  const btnToggle = document.getElementById('btn-toggle-compare');
  const compareBar = document.getElementById('compare-scenarios-bar');

  if (btnToggle) {
    if (isCompareMode) {
      btnToggle.classList.add('active');
    } else {
      btnToggle.classList.remove('active');
    }
  }

  if (compareBar) {
    compareBar.style.display = isCompareMode ? 'flex' : 'none';
  }

  if (isCompareMode) {
    const saved = getSavedScenarios();
    const maxAllowed = getMaxCompareCount();
    if (compareSelectedIds.length === 0 && saved.length > 0) {
      compareSelectedIds = saved.slice(0, maxAllowed).map(s => s.id);
    } else {
      const validIds = compareSelectedIds.filter(id => saved.some(s => s.id === id));
      compareSelectedIds = validIds.slice(0, maxAllowed);
    }
    renderCompareControls();
  }

  renderChart();
}

function renderCompareControls() {
  const chipsGrid = document.getElementById('compare-chips-grid');
  const countBadge = document.getElementById('compare-count-badge');
  const limitLabel = document.getElementById('compare-limit-label');
  if (!chipsGrid) return;

  const maxAllowed = getMaxCompareCount();
  if (limitLabel) {
    limitLabel.textContent = `(Select 2–${maxAllowed} scenarios${isMobileViewport() ? ', max 2 on mobile' : ''})`;
  }

  const savedScenarios = getSavedScenarios();

  if (savedScenarios.length < 2) {
    chipsGrid.innerHTML = `
      <div class="compare-empty-state">
        <span><i class="fa-solid fa-triangle-exclamation"></i> Compare Mode requires at least 2 saved scenarios. Save your current setup as a scenario to compare!</span>
        <button type="button" id="btn-quick-save-compare" class="btn btn-xs btn-primary">
          <i class="fa-solid fa-bookmark"></i> Save Current Setup
        </button>
      </div>
    `;
    const btnQuickSave = document.getElementById('btn-quick-save-compare');
    if (btnQuickSave) {
      btnQuickSave.addEventListener('click', () => {
        openSaveScenarioModal();
      });
    }
    if (countBadge) countBadge.textContent = `0 / ${maxAllowed} selected`;
    return;
  }

  if (compareSelectedIds.length > maxAllowed) {
    compareSelectedIds = compareSelectedIds.slice(0, maxAllowed);
  }

  chipsGrid.innerHTML = '';
  const isLimitReached = compareSelectedIds.length >= maxAllowed;

  savedScenarios.forEach((scen, idx) => {
    const isSelected = compareSelectedIds.includes(scen.id);
    const colorObj = COMPARE_SCENARIO_COLORS[idx % COMPARE_SCENARIO_COLORS.length];
    const isLight = typeof document !== 'undefined' && document.documentElement && document.documentElement.getAttribute('data-theme') === 'light';
    const isChipDisabled = !isSelected && isLimitReached;

    const state = scen.state || {};
    const priceStr = state.homePrice ? `$${Math.round(state.homePrice / 1000)}k` : '';
    const rateStr = state.interestRate ? `${state.interestRate}%` : '';
    const termStr = state.loanTerm ? `${state.loanTerm}Y` : '';
    const metricsStr = [priceStr, termStr, rateStr].filter(Boolean).join(' | ');

    const chipEl = document.createElement('div');
    chipEl.className = `compare-chip ${isSelected ? 'selected' : ''} ${isChipDisabled ? 'disabled' : ''}`;

    if (isSelected) {
      chipEl.style.setProperty('--chip-color', isLight ? colorObj.lightColor : colorObj.color);
      chipEl.style.setProperty('--chip-bg', colorObj.bg);
      chipEl.style.setProperty('--chip-bg-light', colorObj.bgLight);
    }

    chipEl.innerHTML = `
      <div class="compare-chip-top">
        <div class="compare-chip-name">
          <span class="compare-chip-color-dot" style="background-color: ${isLight ? colorObj.lightColor : colorObj.color};"></span>
          <span>${scen.name}</span>
        </div>
        <input type="checkbox" class="compare-chip-checkbox" data-id="${scen.id}" ${isSelected ? 'checked' : ''} ${isChipDisabled ? 'disabled' : ''}>
      </div>
      <div class="compare-chip-metrics">
        <span>${metricsStr || 'Custom Parameters'}</span>
        ${state.isArmLoan ? '<span class="text-warning" style="font-weight: 600;">(ARM)</span>' : ''}
      </div>
    `;

    chipEl.addEventListener('click', (e) => {
      if (isChipDisabled && !isSelected) return;

      if (isSelected) {
        compareSelectedIds = compareSelectedIds.filter(id => id !== scen.id);
      } else {
        if (compareSelectedIds.length < maxAllowed) {
          compareSelectedIds.push(scen.id);
        }
      }
      renderCompareControls();
      renderChart();
    });

    chipsGrid.appendChild(chipEl);
  });

  if (countBadge) {
    countBadge.textContent = `${compareSelectedIds.length} / ${maxAllowed} selected`;
  }
}

function renderChart() {
  const chartCanvas = document.getElementById('payoff-chart');
  if (!chartCanvas) return;
  const ctx = chartCanvas.getContext('2d');

  if (chartInstance) {
    chartInstance.destroy();
  }

  const isLight = typeof document !== 'undefined' && document.documentElement && document.documentElement.getAttribute('data-theme') === 'light';
  const chartTextColor = isLight ? '#334155' : '#f3f4f6';
  const chartMutedColor = isLight ? '#64748b' : '#9ca3af';
  const chartGridColor = isLight ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.05)';

  const standardData = currentSchedule.standard || [];
  const acceleratedData = currentSchedule.accelerated || [];
  const summary = currentSchedule.summary || {};

  const fullMaxMonths = Math.max(standardData.length, acceleratedData.length, 12);

  let targetMaxMonths = fullMaxMonths;
  if (activeZoomPreset === '5Y') targetMaxMonths = Math.min(60, fullMaxMonths);
  else if (activeZoomPreset === '10Y') targetMaxMonths = Math.min(120, fullMaxMonths);
  else if (activeZoomPreset === '15Y') targetMaxMonths = Math.min(180, fullMaxMonths);

  const isAnnualOnly = activeChartViews.length === 1 && activeChartViews[0] === 'annual';

  const sampleStep = isAnnualOnly
    ? 12
    : Math.max(1, Math.round(targetMaxMonths / 30));

  const sampledMonthSet = new Set();
  for (let m = isAnnualOnly ? 12 : 0; m <= targetMaxMonths; m += sampleStep) {
    sampledMonthSet.add(m);
  }
  sampledMonthSet.add(targetMaxMonths);

  if (summary.pmiDropMonth && summary.pmiDropMonth <= targetMaxMonths) {
    sampledMonthSet.add(summary.pmiDropMonth);
  }
  if (summary.armResetMonth && summary.armResetMonth <= targetMaxMonths) {
    sampledMonthSet.add(summary.armResetMonth);
  }
  if (summary.recastMonth && summary.recastMonth <= targetMaxMonths) {
    sampledMonthSet.add(summary.recastMonth);
  }
  if (summary.acceleratedPayoffMonth && summary.acceleratedPayoffMonth <= targetMaxMonths) {
    sampledMonthSet.add(summary.acceleratedPayoffMonth);
  }

  const sortedMonths = Array.from(sampledMonthSet).sort((a, b) => a - b);

  const labels = [];
  const today = new Date();
  const startYear = today.getFullYear();
  const startMonth = today.getMonth() + 1;

  sortedMonths.forEach(m => {
    if (isAnnualOnly) {
      const yearNum = Math.ceil(m / 12);
      labels.push(`Year ${yearNum}`);
    } else {
      const date = new Date(startYear, startMonth + m, 1);
      labels.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
    }
  });

  let datasets = [];
  let isBarPresent = false;
  let isLinePresent = false;

  const createGradient = (colorStart, colorEnd) => {
    if (typeof ctx.createLinearGradient === 'function') {
      const gradient = ctx.createLinearGradient(0, 0, 0, 350);
      if (gradient && gradient.addColorStop) {
        gradient.addColorStop(0, colorStart);
        gradient.addColorStop(1, colorEnd);
        return gradient;
      }
    }
    return colorStart;
  };

  if (activeChartViews.includes('balance')) {
    isLinePresent = true;
    const accBalancePoints = [];
    const stdBalancePoints = [];

    sortedMonths.forEach(m => {
      const accPoint = acceleratedData.find(item => item.month === m) ||
        (m > acceleratedData.length ? acceleratedData[acceleratedData.length - 1] : null);
      const stdPoint = standardData.find(item => item.month === m) ||
        (m > standardData.length ? standardData[standardData.length - 1] : null);

      accBalancePoints.push(accPoint ? accPoint.endingBalance : (m === 0 ? (summary.principal || 0) : 0));
      stdBalancePoints.push(stdPoint ? stdPoint.endingBalance : (m === 0 ? (summary.principal || 0) : 0));
    });

    const accGradient = createGradient(
      isLight ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.35)',
      isLight ? 'rgba(16, 185, 129, 0.01)' : 'rgba(16, 185, 129, 0.01)'
    );

    datasets.push(
      {
        type: 'line',
        label: 'Accelerated Balance',
        data: accBalancePoints,
        borderColor: '#10b981',
        backgroundColor: accGradient,
        fill: true,
        tension: 0.25,
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 6
      },
      {
        type: 'line',
        label: 'Standard Balance',
        data: stdBalancePoints,
        borderColor: isLight ? '#4f46e5' : '#6366f1',
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.25,
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        pointHoverRadius: 5
      }
    );
  }

  if (activeChartViews.includes('interest')) {
    isLinePresent = true;
    const accInterestPoints = [];
    const stdInterestPoints = [];

    sortedMonths.forEach(m => {
      const accPoint = acceleratedData.find(item => item.month === m) ||
        (m > acceleratedData.length ? acceleratedData[acceleratedData.length - 1] : null);
      const stdPoint = standardData.find(item => item.month === m) ||
        (m > standardData.length ? standardData[standardData.length - 1] : null);

      accInterestPoints.push(accPoint ? accPoint.cumulativeInterest : (m === 0 ? 0 : (summary.acceleratedTotalInterest || 0)));
      stdInterestPoints.push(stdPoint ? stdPoint.cumulativeInterest : (m === 0 ? 0 : (summary.standardTotalInterest || 0)));
    });

    const interestGradient = createGradient(
      isLight ? 'rgba(245, 158, 11, 0.25)' : 'rgba(245, 158, 11, 0.35)',
      isLight ? 'rgba(245, 158, 11, 0.01)' : 'rgba(245, 158, 11, 0.01)'
    );

    datasets.push(
      {
        type: 'line',
        label: 'Accelerated Cumulative Interest',
        data: accInterestPoints,
        borderColor: '#f59e0b',
        backgroundColor: interestGradient,
        fill: true,
        tension: 0.25,
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 6
      },
      {
        type: 'line',
        label: 'Standard Cumulative Interest',
        data: stdInterestPoints,
        borderColor: '#ef4444',
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.25,
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        pointHoverRadius: 5
      }
    );
  }

  if (activeChartViews.includes('monthly')) {
    isBarPresent = true;
    const principalPoints = [];
    const interestPoints = [];
    const escrowPoints = [];

    sortedMonths.forEach(m => {
      const accPoint = acceleratedData.find(item => item.month === m);
      if (accPoint) {
        principalPoints.push(accPoint.principalPaid);
        interestPoints.push(accPoint.interestPaid);
        escrowPoints.push(accPoint.taxInsurancePmi || 0);
      } else {
        principalPoints.push(0);
        interestPoints.push(0);
        escrowPoints.push(0);
      }
    });

    datasets.push(
      {
        type: 'bar',
        label: 'Principal Payment',
        data: principalPoints,
        backgroundColor: '#10b981',
        borderRadius: 4
      },
      {
        type: 'bar',
        label: 'Interest Payment',
        data: interestPoints,
        backgroundColor: '#ef4444',
        borderRadius: 4
      },
      {
        type: 'bar',
        label: 'Tax, Insurance & Escrow',
        data: escrowPoints,
        backgroundColor: '#0ea5e9',
        borderRadius: 4
      }
    );
  }

  if (activeChartViews.includes('annual')) {
    isBarPresent = true;
    const annualPrincipal = [];
    const annualInterest = [];

    sortedMonths.forEach(m => {
      const yearStartMonth = Math.max(1, m - 11);
      const yearPoints = acceleratedData.filter(item => item.month >= yearStartMonth && item.month <= m);

      const yrP = yearPoints.reduce((sum, item) => sum + (item.principalPaid || 0), 0);
      const yrI = yearPoints.reduce((sum, item) => sum + (item.interestPaid || 0), 0);

      annualPrincipal.push(yrP);
      annualInterest.push(yrI);
    });

    datasets.push(
      {
        type: 'bar',
        label: 'Annual Principal Paid',
        data: annualPrincipal,
        backgroundColor: '#10b981',
        borderRadius: 4
      },
      {
        type: 'bar',
        label: 'Annual Interest Paid',
        data: annualInterest,
        backgroundColor: '#f59e0b',
        borderRadius: 4
      }
    );
  }

  const chartType = (isBarPresent && !isLinePresent) ? 'bar' : 'line';

  const milestoneFlagsPlugin = {
    id: 'milestoneFlagsPlugin',
    afterDatasetsDraw(chart) {
      if (!chart.scales || !chart.scales.x || !chart.scales.y) return;
      const { ctx, chartArea, scales } = chart;
      if (!chartArea || !scales.x || !scales.y) return;

      const top = chartArea.top;
      const bottom = chartArea.bottom;
      const left = chartArea.left;
      const right = chartArea.right;

      const activeMilestones = [];
      if (summary.pmiDropMonth && summary.pmiDropMonth <= targetMaxMonths) {
        activeMilestones.push({
          month: summary.pmiDropMonth,
          label: '🚩 PMI Drop',
          color: '#ef4444',
          bgColor: isLight ? '#fef2f2' : 'rgba(239, 68, 68, 0.2)'
        });
      }
      if (summary.isArm && summary.armResetMonth && summary.armResetMonth <= targetMaxMonths) {
        activeMilestones.push({
          month: summary.armResetMonth,
          label: `⚡ ARM Reset (${summary.armAdjustedRate.toFixed(1)}%)`,
          color: '#f59e0b',
          bgColor: isLight ? '#fffbeb' : 'rgba(245, 158, 11, 0.2)'
        });
      }
      if (summary.isRecast && summary.recastMonth && summary.recastMonth <= targetMaxMonths) {
        activeMilestones.push({
          month: summary.recastMonth,
          label: `🔄 Recast`,
          color: '#0ea5e9',
          bgColor: isLight ? '#f0f9ff' : 'rgba(14, 165, 233, 0.2)'
        });
      }
      if (summary.acceleratedPayoffMonth && summary.acceleratedPayoffMonth <= targetMaxMonths) {
        activeMilestones.push({
          month: summary.acceleratedPayoffMonth,
          label: '🏁 Paid Off',
          color: '#10b981',
          bgColor: isLight ? '#ecfdf5' : 'rgba(16, 185, 129, 0.2)'
        });
      }

      if (activeMilestones.length === 0) return;

      ctx.save();
      const drawnPills = [];
      activeMilestones.forEach(ms => {
        const pointIdx = sortedMonths.indexOf(ms.month);
        if (pointIdx === -1) return;

        const xPos = scales.x.getPixelForValue(pointIdx);
        if (xPos < left || xPos > right) return;

        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = ms.color;
        ctx.lineWidth = 1.5;
        ctx.moveTo(xPos, top);
        ctx.lineTo(xPos, bottom);
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
        const textWidth = ctx.measureText(ms.label).width;
        const pillPaddingH = 6;
        const pillHeight = 18;
        const pillWidth = textWidth + (pillPaddingH * 2);

        let stackLevel = 0;
        drawnPills.forEach(dp => {
          if (Math.abs(dp.xPos - xPos) < 75) {
            stackLevel = Math.max(stackLevel, dp.stackLevel + 1);
          }
        });

        let pillY = top + 6 + (stackLevel * 22);
        if (pillY + pillHeight > bottom - 10) {
          pillY = bottom - pillHeight - 6;
        }
        let pillX = xPos - (pillWidth / 2);
        pillX = Math.max(left + 2, Math.min(pillX, right - pillWidth - 2));

        drawnPills.push({ xPos, stackLevel });

        ctx.fillStyle = ms.bgColor;
        ctx.strokeStyle = ms.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 4);
        } else {
          ctx.rect(pillX, pillY, pillWidth, pillHeight);
        }
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = ms.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ms.label, pillX + (pillWidth / 2), pillY + (pillHeight / 2));
      });
      ctx.restore();
    }
  };

  chartInstance = new Chart(ctx, {
    type: chartType,
    data: {
      labels: labels,
      datasets: datasets
    },
    plugins: [milestoneFlagsPlugin],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: chartTextColor,
            font: {
              family: 'Plus Jakarta Sans',
              size: 11
            }
          }
        }
      },
      scales: {
        x: {
          stacked: (isBarPresent && !isLinePresent),
          grid: {
            color: chartGridColor
          },
          ticks: {
            color: chartMutedColor,
            font: {
              family: 'Plus Jakarta Sans',
              size: 10
            }
          }
        },
        y: {
          stacked: (isBarPresent && !isLinePresent),
          grid: {
            color: chartGridColor
          },
          ticks: {
            color: chartMutedColor,
            font: {
              family: 'Plus Jakarta Sans',
              size: 10
            },
            callback: function (value) {
              if (!isLinePresent && activeChartViews.length === 1 && activeChartViews[0] === 'monthly') {
                return '$' + Math.round(value);
              }
              return '$' + (value / 1000).toFixed(0) + 'k';
            }
          }
        }
      }
    }
  });
}

/**
 * Generates annual grouped schedule data.
 */
function getAnnualSchedule() {
  const data = currentSchedule.accelerated;
  const annual = [];

  let currentYear = 1;
  let yearStartingBalance = data.length > 0 ? data[0].startingBalance : 0;
  let yearBasePayment = 0;
  let yearExtraPayment = 0;
  let yearInterest = 0;
  let yearPrincipal = 0;

  data.forEach((row, index) => {
    yearBasePayment += row.basePayment;
    yearExtraPayment += row.extraPayment;
    yearInterest += row.interestPaid;
    yearPrincipal += row.principalPaid;

    // Check if end of year or last row
    if (row.month % 12 === 0 || index === data.length - 1) {
      annual.push({
        year: currentYear,
        startingBalance: yearStartingBalance,
        basePayment: yearBasePayment,
        extraPayment: yearExtraPayment,
        interestPaid: yearInterest,
        principalPaid: yearPrincipal,
        endingBalance: row.endingBalance
      });

      // Reset for next year
      currentYear++;
      yearStartingBalance = row.endingBalance;
      yearBasePayment = 0;
      yearExtraPayment = 0;
      yearInterest = 0;
      yearPrincipal = 0;
    }
  });

  return annual;
}

/**
 * Render the amortization table.
 */
function renderTable() {
  elScheduleTbody.innerHTML = '';

  const isAnnual = activeTableViewMode === 'annual';
  let data = [];

  if (isAnnual) {
    data = getAnnualSchedule();
    elTablePagination.style.display = 'none'; // No pagination for annual (usually only 15-30 rows)
  } else {
    data = currentSchedule.accelerated;
    elTablePagination.style.display = 'flex'; // Show pagination for monthly
  }

  if (data.length === 0) {
    elScheduleTbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No schedule data available.</td></tr>`;
    return;
  }

  // Calculate pages for monthly
  let displayData = data;
  if (!isAnnual) {
    const totalPages = Math.ceil(data.length / rowsPerPage);
    // Clamp current page
    currentTablePage = Math.max(1, Math.min(currentTablePage, totalPages));

    // Update pagination controls
    elBtnPrevPage.disabled = currentTablePage === 1;
    elBtnNextPage.disabled = currentTablePage === totalPages;
    elPaginationInfo.textContent = `Page ${currentTablePage} of ${totalPages}`;

    const startIndex = (currentTablePage - 1) * rowsPerPage;
    displayData = data.slice(startIndex, startIndex + rowsPerPage);
  }

  // Render rows
  displayData.forEach(row => {
    const tr = document.createElement('tr');

    // Label (Month X or Year Y)
    const label = isAnnual ? `Year ${row.year}` : `Month ${row.month}`;

    // Check if extra payment was made
    const extraClass = row.extraPayment > 0 ? 'text-success font-semibold' : 'text-muted';

    tr.innerHTML = `
      <td class="text-center font-semibold">${label}</td>
      <td class="text-right">${formatCurrency(row.startingBalance)}</td>
      <td class="text-right">${formatCurrency(row.basePayment)}</td>
      <td class="text-right ${extraClass}">${row.extraPayment > 0 ? '+' + formatCurrency(row.extraPayment) : '$0.00'}</td>
      <td class="text-right text-warning">${formatCurrency(row.interestPaid)}</td>
      <td class="text-right text-primary">${formatCurrency(row.principalPaid)}</td>
      <td class="text-right font-semibold">${formatCurrency(row.endingBalance)}</td>
    `;
    elScheduleTbody.appendChild(tr);
  });
}

// ==========================================================================
// EXPORT TO CSV FUNCTIONALITY
// ==========================================================================

function exportScheduleToCSV() {
  const isAnnual = activeTableViewMode === 'annual';
  const data = isAnnual ? getAnnualSchedule() : currentSchedule.accelerated;

  if (data.length === 0) return;

  let csvContent = "data:text/csv;charset=utf-8,";

  // Headers
  const headers = isAnnual
    ? ["Year", "Starting Balance", "Base P&I Payment", "Extra Principal Payment", "Interest Paid", "Principal Paid", "Ending Balance"]
    : ["Month", "Starting Balance", "Scheduled P&I Payment", "Extra Payment Applied", "Interest Paid", "Principal Paid", "Ending Balance"];

  csvContent += headers.join(",") + "\n";

  // Rows
  data.forEach(row => {
    const label = isAnnual ? row.year : row.month;
    const line = [
      label,
      row.startingBalance.toFixed(2),
      row.basePayment.toFixed(2),
      row.extraPayment.toFixed(2),
      row.interestPaid.toFixed(2),
      row.principalPaid.toFixed(2),
      row.endingBalance.toFixed(2)
    ];
    csvContent += line.join(",") + "\n";
  });

  // Download trigger
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `mortgage_schedule_${isAnnual ? 'annual' : 'monthly'}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ==========================================================================
// SCENARIO & STATE PERSISTENCE ENGINE
// ==========================================================================

function getSavedScenarios() {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_KEYS.SCENARIOS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load scenarios from localStorage:", e);
    return [];
  }
}

function saveScenariosToStorage(scenarios) {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.SCENARIOS, JSON.stringify(scenarios));
  } catch (e) {
    console.error("Failed to save scenarios to localStorage:", e);
  }
}

function serializeCurrentState() {
  const currentInterest = parseFloat(elInterestRate.value) || 0;
  const rates = { ...DEFAULT_PRESET_RATES, ...loanPresetRates };
  rates[activeLoanPreset] = currentInterest;

  return {
    homePrice: parseFloat(elHomePrice.value) || 0,
    downPayment: parseFloat(elDownPayment.value) || 0,
    downPaymentPercent: parseFloat(elDownPaymentPercent.value) || 0,
    closingCosts: parseFloat(elClosingCosts.value) || 0,
    closingCostsPercent: parseFloat(elClosingCostsPercent.value) || 0,
    interestRate: currentInterest,
    loanPresetRates: rates,
    loanTerm: parseFloat(elLoanTerm.value) || 30,
    extraMonthly: parseFloat(elExtraMonthly.value) || 0,
    scheduledOneTimePayments: scheduledOneTimePayments,
    oneTimeExtra: getTotalLumpSumAmount(scheduledOneTimePayments),
    oneTimeMonth: scheduledOneTimePayments.length > 0 ? scheduledOneTimePayments[0].month : 12,
    isRecastEnabled: elEnableRecast ? elEnableRecast.checked : false,
    recastAmount: parseFloat(elRecastAmount ? elRecastAmount.value : 50000) || 50000,
    recastMonth: parseInt(elRecastMonth ? elRecastMonth.value : 60) || 60,
    propertyTax: parseFloat(elPropertyTax.value) || 0,
    homeInsurance: parseFloat(elHomeInsurance.value) || 0,
    takeHomeSalary: parseFloat(elTakeHomeSalary.value) || 0,
    monthlyExpenses: parseFloat(elMonthlyExpenses.value) || 0,
    activeLoanPreset: activeLoanPreset,
    isArmLoan: isArmLoan,
    armFixedTerm: parseFloat(elArmFixedTerm ? elArmFixedTerm.value : 5) || 5,
    armAdjustedRate: parseFloat(elArmAdjustedRate ? elArmAdjustedRate.value : 7.5) || 7.5
  };
}

function setArmSettingsPanelVisible(show) {
  const armPanel = document.getElementById('arm-settings-panel');
  const armAccordionGroup = document.getElementById('accordion-arm-group');
  if (armPanel) armPanel.style.display = show ? 'flex' : 'none';
  if (armAccordionGroup) armAccordionGroup.style.display = show ? 'block' : 'none';
}

function applyStateObject(state) {
  if (!state) return;

  if (state.homePrice !== undefined) {
    elHomePrice.value = state.homePrice;
    elHomePriceSlider.value = state.homePrice;
    elDownPaymentSlider.max = state.homePrice;
    elClosingCostsSlider.max = Math.max(100000, Math.round(state.homePrice * 0.1));
  }
  if (state.downPayment !== undefined) {
    elDownPayment.value = state.downPayment;
    elDownPaymentSlider.value = state.downPayment;
  }
  if (state.downPaymentPercent !== undefined) {
    elDownPaymentPercent.value = state.downPaymentPercent;
  }
  if (state.closingCosts !== undefined) {
    elClosingCosts.value = state.closingCosts;
    elClosingCostsSlider.value = state.closingCosts;
  }
  if (state.closingCostsPercent !== undefined) {
    elClosingCostsPercent.value = state.closingCostsPercent;
  }

  if (state.loanPresetRates && typeof state.loanPresetRates === 'object') {
    loanPresetRates = { ...DEFAULT_PRESET_RATES, ...state.loanPresetRates };
  } else {
    loanPresetRates = { ...DEFAULT_PRESET_RATES };
    if (state.activeLoanPreset && state.interestRate !== undefined) {
      loanPresetRates[state.activeLoanPreset] = parseFloat(state.interestRate) || 6.5;
    }
  }

  if (state.activeLoanPreset) {
    activeLoanPreset = state.activeLoanPreset;
    const presetButtons = document.querySelectorAll('.btn-preset');
    presetButtons.forEach(b => {
      if (b.getAttribute('data-preset') === activeLoanPreset) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });
  }

  const activeRate = (loanPresetRates && loanPresetRates[activeLoanPreset] !== undefined)
    ? loanPresetRates[activeLoanPreset]
    : (state.interestRate !== undefined ? parseFloat(state.interestRate) : (DEFAULT_PRESET_RATES[activeLoanPreset] || 6.5));

  elInterestRate.value = activeRate;
  if (elInterestSlider) elInterestSlider.value = activeRate;
  loanPresetRates[activeLoanPreset] = activeRate;

  if (state.loanTerm !== undefined) {
    elLoanTerm.value = state.loanTerm;
    elTermSlider.value = state.loanTerm;
  }
  if (state.extraMonthly !== undefined) {
    elExtraMonthly.value = state.extraMonthly;
    elExtraMonthlySlider.value = state.extraMonthly;
  }
  if (state.scheduledOneTimePayments && Array.isArray(state.scheduledOneTimePayments)) {
    scheduledOneTimePayments = state.scheduledOneTimePayments.map(p => ({
      id: p.id || (Date.now() + Math.random()).toString(),
      amount: parseFloat(p.amount) || 0,
      month: parseInt(p.month) || 12
    }));
  } else if (state.oneTimeExtra !== undefined) {
    const amt = parseFloat(state.oneTimeExtra) || 0;
    const mo = parseInt(state.oneTimeMonth) || 12;
    scheduledOneTimePayments = amt > 0 ? [{ id: 'default-1', amount: amt, month: mo }] : [];
  }
  renderOneTimePaymentsList();
  if (state.isRecastEnabled !== undefined && elEnableRecast) {
    elEnableRecast.checked = !!state.isRecastEnabled;
    if (elRecastCardBody) {
      elRecastCardBody.style.display = elEnableRecast.checked ? 'flex' : 'none';
    }
  }
  if (state.recastAmount !== undefined && elRecastAmount) {
    elRecastAmount.value = state.recastAmount;
    if (elRecastAmountSlider) elRecastAmountSlider.value = state.recastAmount;
  }
  if (state.recastMonth !== undefined && elRecastMonth) {
    elRecastMonth.value = state.recastMonth;
    if (elRecastMonthSlider) elRecastMonthSlider.value = state.recastMonth;
  }
  if (state.propertyTax !== undefined) {
    elPropertyTax.value = state.propertyTax;
    elPropertyTaxSlider.value = state.propertyTax;
  }
  if (state.homeInsurance !== undefined) {
    elHomeInsurance.value = state.homeInsurance;
    elHomeInsuranceSlider.value = state.homeInsurance;
  }
  if (state.takeHomeSalary !== undefined) {
    elTakeHomeSalary.value = state.takeHomeSalary;
    elTakeHomeSlider.value = state.takeHomeSalary;
  }
  if (state.monthlyExpenses !== undefined) {
    elMonthlyExpenses.value = state.monthlyExpenses;
    elExpensesSlider.value = state.monthlyExpenses;
  }

  if (state.activeLoanPreset) {
    activeLoanPreset = state.activeLoanPreset;
    const presetButtons = document.querySelectorAll('.btn-preset');
    presetButtons.forEach(b => {
      if (b.getAttribute('data-preset') === activeLoanPreset) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });
  }

  if (state.isArmLoan !== undefined) {
    isArmLoan = state.isArmLoan;
  }

  const isArm = isArmLoan || (activeLoanPreset && activeLoanPreset.endsWith('-arm'));
  setArmSettingsPanelVisible(isArm);

  if (state.armFixedTerm !== undefined && elArmFixedTerm && elArmFixedTermSlider) {
    elArmFixedTerm.value = state.armFixedTerm;
    elArmFixedTermSlider.value = state.armFixedTerm;
  }

  if (state.armAdjustedRate !== undefined && elArmAdjustedRate && elArmAdjustedRateSlider) {
    elArmAdjustedRate.value = state.armAdjustedRate;
    elArmAdjustedRateSlider.value = state.armAdjustedRate;
  }
}

function autoSaveCurrentState() {
  try {
    if (typeof localStorage === 'undefined') return;
    const state = serializeCurrentState();
    localStorage.setItem(STORAGE_KEYS.CURRENT_STATE, JSON.stringify(state));
  } catch (e) {
    // Ignore restricted storage environment errors
  }
}

function restoreCurrentState() {
  try {
    if (typeof localStorage === 'undefined') return;
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_STATE);
    if (raw) {
      const state = JSON.parse(raw);
      applyStateObject(state);
    }
  } catch (e) {
    console.error("Failed to restore current state:", e);
  }
}

function getDefaultValueForField(fieldId, currentHomePrice = 450000) {
  if (fieldId === 'closing-costs') {
    return Math.round(currentHomePrice * (DEFAULT_INPUT_VALUES['closing-costs-percent'] / 100));
  }
  if (fieldId === 'down-payment') {
    return Math.round(currentHomePrice * (DEFAULT_INPUT_VALUES['down-payment-percent'] / 100));
  }
  if (fieldId === 'interest-rate') {
    return DEFAULT_PRESET_RATES[activeLoanPreset] !== undefined ? DEFAULT_PRESET_RATES[activeLoanPreset] : 6.5;
  }
  return DEFAULT_INPUT_VALUES[fieldId];
}

function resetToDefaults() {
  // Preserve current core user inputs: Home Price, Down Payment, Interest Rate, Take-Home Salary, Monthly Expenses
  const elHp = document.getElementById('home-price');
  const elDp = document.getElementById('down-payment');
  const elDpPct = document.getElementById('down-payment-percent');
  const elIr = document.getElementById('interest-rate');
  const elSal = document.getElementById('take-home-salary');
  const elExp = document.getElementById('monthly-expenses');

  const currentHomePrice = elHp && !isNaN(parseFloat(elHp.value)) ? parseFloat(elHp.value) : 450000;
  const currentDownPayment = elDp && !isNaN(parseFloat(elDp.value)) ? parseFloat(elDp.value) : 90000;
  const currentDownPaymentPercent = elDpPct && !isNaN(parseFloat(elDpPct.value)) ? parseFloat(elDpPct.value) : 20;
  const currentInterestRate = elIr && !isNaN(parseFloat(elIr.value)) ? parseFloat(elIr.value) : 6.5;
  const currentTakeHomeSalary = elSal && !isNaN(parseFloat(elSal.value)) ? parseFloat(elSal.value) : 8000;
  const currentMonthlyExpenses = elExp && !isNaN(parseFloat(elExp.value)) ? parseFloat(elExp.value) : 3000;

  // Calculate default closing costs dollar amount dynamically based on currentHomePrice (3.0%)
  const defaultClosingCostsPct = DEFAULT_INPUT_VALUES['closing-costs-percent'];
  const defaultClosingCostsAmt = Math.round(currentHomePrice * (defaultClosingCostsPct / 100));

  loanPresetRates = { ...DEFAULT_PRESET_RATES };
  loanPresetRates['30-fixed'] = currentInterestRate;

  const defaultState = {
    homePrice: currentHomePrice,
    downPayment: currentDownPayment,
    downPaymentPercent: currentDownPaymentPercent,
    interestRate: currentInterestRate,
    loanPresetRates: { ...loanPresetRates },
    takeHomeSalary: currentTakeHomeSalary,
    monthlyExpenses: currentMonthlyExpenses,

    // Reset secondary options & settings to defaults based on current home price:
    closingCosts: defaultClosingCostsAmt,
    closingCostsPercent: defaultClosingCostsPct,
    loanTerm: 30,
    extraMonthly: 200,
    scheduledOneTimePayments: [],
    oneTimeExtra: 0,
    isRecastEnabled: false,
    recastAmount: 50000,
    recastMonth: 60,
    propertyTax: 0.9,
    homeInsurance: 0.5,
    activeLoanPreset: '30-fixed',
    isArmLoan: false,
    armFixedTerm: 5,
    armAdjustedRate: 7.5
  };

  applyStateObject(defaultState);

  activeLoanPreset = '30-fixed';
  const presetButtons = document.querySelectorAll('.btn-preset');
  presetButtons.forEach(b => {
    if (b.getAttribute('data-preset') === '30-fixed') {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });

  currentScenarioId = null;
  if (elActiveScenarioName) elActiveScenarioName.textContent = 'Default Setup';
  if (elScenarioCommentsBanner) elScenarioCommentsBanner.style.display = 'none';

  setZoomPreset('full');

  recalculate();
  autoSaveCurrentState();
}

function updateFieldModifiedIndicators() {
  const elHp = document.getElementById('home-price');
  const currentHomePrice = elHp && !isNaN(parseFloat(elHp.value)) ? parseFloat(elHp.value) : 450000;

  const fields = [
    { id: 'home-price' },
    { id: 'down-payment', pairedId: 'down-payment-percent' },
    { id: 'closing-costs', pairedId: 'closing-costs-percent' },
    { id: 'interest-rate' },
    { id: 'loan-term' },
    { id: 'property-tax' },
    { id: 'home-insurance' },
    { id: 'take-home-salary' },
    { id: 'monthly-expenses' },
    { id: 'extra-monthly' },
    { id: 'recast-amount' },
    { id: 'recast-month' },
    { id: 'arm-fixed-term' },
    { id: 'arm-adjusted-rate' }
  ];

  fields.forEach(field => {
    const el = document.getElementById(field.id);
    if (!el) return;

    const currentVal = parseFloat(el.value);
    const defaultVal = getDefaultValueForField(field.id, currentHomePrice);
    let isModified = Math.abs((isNaN(currentVal) ? 0 : currentVal) - defaultVal) > 0.005;

    if (field.pairedId) {
      const pairedEl = document.getElementById(field.pairedId);
      if (pairedEl) {
        const pairedCurrent = parseFloat(pairedEl.value);
        const pairedDefault = DEFAULT_INPUT_VALUES[field.pairedId];
        if (Math.abs((isNaN(pairedCurrent) ? 0 : pairedCurrent) - pairedDefault) > 0.05) {
          isModified = true;
        }
      }
    }

    let label = document.querySelector(`label[for="${field.id}"]`);
    if (!label) {
      const inputGroup = el.closest('.input-group') || el.closest('.form-field-group');
      if (inputGroup) label = inputGroup.querySelector('label');
    }
    if (!label) return;

    let tag = label.querySelector('.field-status-tag');
    if (!tag) {
      tag = document.createElement('span');
      label.appendChild(tag);
    }

    const isNonResettable = NON_RESETTABLE_FIELDS.has(field.id);

    if (isModified) {
      tag.className = `field-status-tag modified ${isNonResettable ? '' : 'resettable'}`;
      if (isNonResettable) {
        tag.innerHTML = `Modified`;
        tag.setAttribute('title', 'Modified from default value');
        tag.removeAttribute('data-reset-field');
      } else {
        let formattedDefault = '';
        if (field.id === 'closing-costs') {
          formattedDefault = `$${defaultVal.toLocaleString()} (${DEFAULT_INPUT_VALUES['closing-costs-percent']}%)`;
        } else if (field.id.includes('rate') || field.id.includes('tax') || field.id.includes('insurance')) {
          formattedDefault = `${defaultVal}%`;
        } else if (field.id.includes('term') || field.id.includes('month')) {
          formattedDefault = `${defaultVal}`;
        } else {
          formattedDefault = `$${defaultVal.toLocaleString()}`;
        }
        tag.innerHTML = `Modified <i class="fa-solid fa-arrow-rotate-left"></i>`;
        tag.setAttribute('title', `Click to reset field to default (${formattedDefault})`);
        tag.setAttribute('data-reset-field', field.id);
      }
    } else {
      tag.className = 'field-status-tag default';
      tag.innerHTML = 'Default';
      tag.setAttribute('title', 'Using default value');
      tag.removeAttribute('data-reset-field');
    }
  });

  // Preset indicator
  const presetContainer = document.getElementById('loan-preset-container');
  if (presetContainer) {
    const inputGroup = presetContainer.closest('.input-group');
    if (inputGroup) {
      const label = inputGroup.querySelector('label');
      if (label) {
        let tag = label.querySelector('.field-status-tag');
        if (!tag) {
          tag = document.createElement('span');
          label.appendChild(tag);
        }
        const isModified = activeLoanPreset !== '30-fixed';
        if (isModified) {
          tag.className = 'field-status-tag modified resettable';
          tag.innerHTML = `Modified <i class="fa-solid fa-arrow-rotate-left"></i>`;
          tag.setAttribute('title', 'Click to reset loan type to 30-Yr Fixed');
          tag.setAttribute('data-reset-field', 'preset');
        } else {
          tag.className = 'field-status-tag default';
          tag.innerHTML = 'Default';
          tag.setAttribute('title', 'Using default value');
          tag.removeAttribute('data-reset-field');
        }
      }
    }
  }
}

function resetSingleFieldToDefault(fieldId) {
  if (NON_RESETTABLE_FIELDS.has(fieldId)) return;

  if (fieldId === 'preset') {
    const btn30 = document.querySelector('.btn-preset[data-preset="30-fixed"]');
    if (btn30) btn30.click();
    return;
  }

  const elHp = document.getElementById('home-price');
  const currentHomePrice = elHp && !isNaN(parseFloat(elHp.value)) ? parseFloat(elHp.value) : 450000;

  const patch = {};

  if (fieldId === 'closing-costs' || fieldId === 'closing-costs-percent') {
    const defaultPct = DEFAULT_INPUT_VALUES['closing-costs-percent'];
    const defaultAmt = Math.round(currentHomePrice * (defaultPct / 100));
    patch['closingCosts'] = defaultAmt;
    patch['closingCostsPercent'] = defaultPct;
  } else if (fieldId === 'down-payment' || fieldId === 'down-payment-percent') {
    const defaultPct = DEFAULT_INPUT_VALUES['down-payment-percent'];
    const defaultAmt = Math.round(currentHomePrice * (defaultPct / 100));
    patch['downPayment'] = defaultAmt;
    patch['downPaymentPercent'] = defaultPct;
  } else if (fieldId === 'interest-rate') {
    const defaultRate = DEFAULT_PRESET_RATES[activeLoanPreset] !== undefined ? DEFAULT_PRESET_RATES[activeLoanPreset] : 6.5;
    loanPresetRates[activeLoanPreset] = defaultRate;
    patch['interestRate'] = defaultRate;
  } else {
    const defaultVal = DEFAULT_INPUT_VALUES[fieldId];
    if (defaultVal === undefined) return;

    const camelKey = fieldId.replace(/-([a-z])/g, g => g[1].toUpperCase());
    patch[camelKey] = defaultVal;

    if (fieldId === 'recast-amount') {
      patch['recastAmount'] = DEFAULT_INPUT_VALUES['recast-amount'];
    }
  }

  applyStateObject(patch);
  recalculate();
  autoSaveCurrentState();
}

function updateScenarioCommentsBanner(scenario) {
  if (!elScenarioCommentsBanner) return;

  if (scenario && scenario.comments && scenario.comments.trim()) {
    elScenarioCommentsBanner.style.display = 'flex';
    if (elBannerScenarioTitle) elBannerScenarioTitle.textContent = `Notes for "${scenario.name}":`;
    if (elActiveScenarioComments) elActiveScenarioComments.textContent = scenario.comments.trim();
  } else {
    elScenarioCommentsBanner.style.display = 'none';
  }
}

function toggleScenarioDropdown() {
  const menu = document.getElementById('scenario-dropdown-menu');
  const pill = document.getElementById('active-scenario-pill');
  if (menu) {
    const isHidden = menu.style.display === 'none';
    closeAllScenarioMenus();
    if (isHidden) {
      menu.style.display = 'flex';
      if (pill) pill.classList.add('open');
    }
  }
}

function closeScenarioDropdown() {
  const menu = document.getElementById('scenario-dropdown-menu');
  const pill = document.getElementById('active-scenario-pill');
  if (menu) menu.style.display = 'none';
  if (pill) pill.classList.remove('open');
}

function toggleScenarioOverflowMenu() {
  const menu = document.getElementById('scenario-overflow-menu');
  if (menu) {
    const isHidden = menu.style.display === 'none';
    closeAllScenarioMenus();
    if (isHidden) {
      menu.style.display = 'flex';
    }
  }
}

function closeScenarioOverflowMenu() {
  const menu = document.getElementById('scenario-overflow-menu');
  if (menu) menu.style.display = 'none';
}

function closeAllScenarioMenus() {
  closeScenarioDropdown();
  closeScenarioOverflowMenu();
}

function renderScenarioOptions() {
  if (!elScenarioSelect) return;

  const scenarios = getSavedScenarios();
  elScenarioSelect.innerHTML = '<option value="">-- Saved Scenarios --</option>';

  let activeScenObj = null;

  scenarios.forEach(scen => {
    const opt = document.createElement('option');
    opt.value = scen.id;

    let text = scen.name;
    if (scen.comments && scen.comments.trim()) {
      const snippet = scen.comments.trim().length > 30
        ? scen.comments.trim().substring(0, 27) + '...'
        : scen.comments.trim();
      text += ` — "${snippet}"`;
    }
    text += ` (${scen.dateStr || 'Saved'})`;

    opt.textContent = text;
    if (scen.comments) {
      opt.title = `${scen.name}\nNotes: ${scen.comments}`;
    }

    if (scen.id === currentScenarioId) {
      opt.selected = true;
      activeScenObj = scen;
    }
    elScenarioSelect.appendChild(opt);
  });

  if (elBtnDeleteScenario) {
    elBtnDeleteScenario.disabled = !elScenarioSelect.value;
  }

  // Sync active scenario pill label
  if (elActiveScenarioName) {
    elActiveScenarioName.textContent = activeScenObj ? activeScenObj.name : 'Default Setup';
  }

  // Populate Custom Scenario Dropdown List (Option 1)
  const elScenarioDropdownList = document.getElementById('scenario-dropdown-list');
  if (elScenarioDropdownList) {
    elScenarioDropdownList.innerHTML = '';

    // Add Default Setup item
    const defaultItem = document.createElement('div');
    defaultItem.className = `scenario-dropdown-item ${!currentScenarioId ? 'active-item' : ''}`;
    defaultItem.innerHTML = `
      <div class="scenario-item-info">
        <span class="scenario-item-name"><i class="fa-solid fa-house-chimney text-muted"></i> Default Setup</span>
        <span class="scenario-item-sub">Initial parameters</span>
      </div>
    `;
    defaultItem.addEventListener('click', () => {
      currentScenarioId = null;
      if (elScenarioSelect) elScenarioSelect.value = '';
      if (elActiveScenarioName) elActiveScenarioName.textContent = 'Default Setup';
      renderScenarioOptions();
      recalculate();
      closeScenarioDropdown();
    });
    elScenarioDropdownList.appendChild(defaultItem);

    if (scenarios.length > 0) {
      scenarios.forEach(scen => {
        const item = document.createElement('div');
        const isActive = scen.id === currentScenarioId;
        item.className = `scenario-dropdown-item ${isActive ? 'active-item' : ''}`;

        const commentsSnippet = scen.comments && scen.comments.trim()
          ? (scen.comments.trim().length > 30 ? scen.comments.trim().substring(0, 27) + '...' : scen.comments.trim())
          : (scen.dateStr || 'Saved');

        item.innerHTML = `
          <div class="scenario-item-info" data-id="${scen.id}">
            <span class="scenario-item-name">${scen.name}</span>
            <span class="scenario-item-sub">${commentsSnippet}</span>
          </div>
          <div class="scenario-item-actions">
            <button type="button" class="btn-scenario-inline-dup" title="Duplicate Scenario" data-id="${scen.id}">
              <i class="fa-solid fa-copy"></i>
            </button>
            <button type="button" class="btn-scenario-inline-del" title="Delete Scenario" data-id="${scen.id}">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        `;

        item.querySelector('.scenario-item-info').addEventListener('click', () => {
          loadScenario(scen.id);
          closeScenarioDropdown();
        });

        item.querySelector('.btn-scenario-inline-dup').addEventListener('click', (e) => {
          e.stopPropagation();
          duplicateScenario(scen.id);
          closeScenarioDropdown();
        });

        item.querySelector('.btn-scenario-inline-del').addEventListener('click', (e) => {
          e.stopPropagation();
          if (confirm(`Are you sure you want to delete "${scen.name}"?`)) {
            deleteScenario(scen.id);
          }
        });

        elScenarioDropdownList.appendChild(item);
      });
    }
  }

  updateScenarioCommentsBanner(activeScenObj);

  if (isCompareMode) {
    renderCompareControls();
  }
}

function saveScenario(name, comments = '') {
  if (!name || !name.trim()) return null;

  const scenarios = getSavedScenarios();
  const state = serializeCurrentState();
  const id = 'scen_' + Date.now();
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const newScenario = {
    id: id,
    name: name.trim(),
    comments: comments ? comments.trim() : '',
    dateStr: dateStr,
    createdAt: new Date().toISOString(),
    state: state
  };

  scenarios.push(newScenario);
  saveScenariosToStorage(scenarios);

  currentScenarioId = id;
  if (elActiveScenarioName) {
    elActiveScenarioName.textContent = newScenario.name;
  }

  renderScenarioOptions();
  return newScenario;
}

function loadScenario(id) {
  if (!id) return;
  const scenarios = getSavedScenarios();
  const found = scenarios.find(s => s.id === id);

  if (found) {
    currentScenarioId = id;
    applyStateObject(found.state);
    if (elActiveScenarioName) {
      elActiveScenarioName.textContent = found.name;
    }
    renderScenarioOptions();
    recalculate();
  }
}

function deleteScenario(id) {
  if (!id) return;
  let scenarios = getSavedScenarios();
  scenarios = scenarios.filter(s => s.id !== id);
  saveScenariosToStorage(scenarios);

  if (currentScenarioId === id) {
    currentScenarioId = null;
    if (elActiveScenarioName) {
      elActiveScenarioName.textContent = 'Default Setup';
    }
  }

  renderScenarioOptions();
}

function duplicateScenario(idToDuplicate) {
  const targetId = idToDuplicate || (elScenarioSelect ? elScenarioSelect.value : null) || currentScenarioId;
  const scenarios = getSavedScenarios();
  let baseName = 'Default Setup';
  let baseState = serializeCurrentState();
  let baseComments = '';

  if (targetId) {
    const found = scenarios.find(s => s.id === targetId);
    if (found) {
      baseName = found.name;
      baseState = JSON.parse(JSON.stringify(found.state));
      baseComments = found.comments || '';
    }
  } else if (currentScenarioId) {
    const found = scenarios.find(s => s.id === currentScenarioId);
    if (found) {
      baseName = found.name;
      baseState = JSON.parse(JSON.stringify(found.state));
      baseComments = found.comments || '';
    }
  }

  let dupName = `${baseName} (Copy)`;
  let counter = 2;
  while (scenarios.some(s => s.name === dupName)) {
    dupName = `${baseName} (Copy ${counter})`;
    counter++;
  }

  const newId = 'scen_' + Date.now();
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const duplicatedScenario = {
    id: newId,
    name: dupName,
    comments: baseComments,
    dateStr: dateStr,
    createdAt: new Date().toISOString(),
    state: baseState
  };

  scenarios.push(duplicatedScenario);
  saveScenariosToStorage(scenarios);

  currentScenarioId = newId;
  applyStateObject(baseState);
  if (elActiveScenarioName) {
    elActiveScenarioName.textContent = duplicatedScenario.name;
  }
  renderScenarioOptions();
  recalculate();

  return duplicatedScenario;
}

// ==========================================================================
// DYNAMIC SYNCING & EVENT HANDLERS
// ==========================================================================

function recalculate() {
  const homePrice = parseFloat(elHomePrice.value) || 0;
  const downPayment = parseFloat(elDownPayment.value) || 0;
  const interestRate = parseFloat(elInterestRate.value) || 0;
  const termYears = parseFloat(elLoanTerm.value) || 30;
  const extraMonthly = parseFloat(elExtraMonthly.value) || 0;
  const oneTimeExtra = (scheduledOneTimePayments && scheduledOneTimePayments.length > 0)
    ? scheduledOneTimePayments
    : (parseFloat(elOneTimeExtra ? elOneTimeExtra.value : 0) || 0);
  const oneTimeMonth = 12;

  const isArm = isArmLoan || activeLoanPreset.endsWith('-arm');
  const armFixedYears = parseFloat(elArmFixedTerm ? elArmFixedTerm.value : 5) || 5;
  const armAdjustedRate = parseFloat(elArmAdjustedRate ? elArmAdjustedRate.value : 7.5) || 7.5;

  const isRecast = elEnableRecast ? elEnableRecast.checked : false;
  const recastAmount = parseFloat(elRecastAmount ? elRecastAmount.value : 50000) || 50000;
  const recastMonth = parseInt(elRecastMonth ? elRecastMonth.value : 60) || 60;

  currentSchedule = calculateAmortizationSchedules(
    homePrice,
    downPayment,
    interestRate,
    termYears,
    extraMonthly,
    oneTimeExtra,
    oneTimeMonth,
    isArm,
    armFixedYears,
    armAdjustedRate,
    scheduledOneTimePayments,
    isRecast,
    recastAmount,
    recastMonth
  );

  updateUI();
  updateTargetTermCalculator();
  autoSaveCurrentState();
}

/**
 * Links range slider and number input box.
 */
function linkSliderAndInput(inputEl, sliderEl, callback) {
  if (!inputEl || !sliderEl) return;
  inputEl.addEventListener('input', () => {
    sliderEl.value = inputEl.value;
    if (callback) callback();
    recalculate();
  });

  sliderEl.addEventListener('input', () => {
    inputEl.value = sliderEl.value;
    if (callback) callback();
    recalculate();
  });
}

let eventHandlersInitialized = false;

function setupEventHandlers() {
  if (eventHandlersInitialized) return;
  eventHandlersInitialized = true;

  // Compare Scenarios Mode Toggle
  const btnToggleCompare = document.getElementById('btn-toggle-compare');
  if (btnToggleCompare) {
    btnToggleCompare.addEventListener('click', () => {
      toggleCompareMode();
    });
  }

  // Recast Control Sync
  if (elEnableRecast) {
    elEnableRecast.addEventListener('change', () => {
      if (elRecastCardBody) {
        elRecastCardBody.style.display = elEnableRecast.checked ? 'flex' : 'none';
      }
      recalculate();
    });
  }
  if (elRecastAmount && elRecastAmountSlider) {
    linkSliderAndInput(elRecastAmount, elRecastAmountSlider);
  }
  if (elRecastMonth && elRecastMonthSlider) {
    linkSliderAndInput(elRecastMonth, elRecastMonthSlider);
  }

  // Time Horizon Metric Presets
  const viewButtons = document.querySelectorAll('.btn-chart-view');
  viewButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.getAttribute('data-view') || 'balance';
      setChartViewPreset(view);
    });
  });

  // Time Horizon Zoom Presets
  const zoomButtons = document.querySelectorAll('.btn-zoom-preset');
  zoomButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const zoom = btn.getAttribute('data-zoom') || 'full';
      setZoomPreset(zoom);
    });
  });

  // ARM Sliders Sync
  if (elArmFixedTerm && elArmFixedTermSlider) {
    linkSliderAndInput(elArmFixedTerm, elArmFixedTermSlider);
  }
  if (elArmAdjustedRate && elArmAdjustedRateSlider) {
    linkSliderAndInput(elArmAdjustedRate, elArmAdjustedRateSlider);
  }

  // Loan Type Presets Sync
  const presetButtons = document.querySelectorAll('.btn-preset');
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Save current rate for active preset before switching
      loanPresetRates[activeLoanPreset] = parseFloat(elInterestRate.value) || 0;

      presetButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const preset = btn.getAttribute('data-preset');
      activeLoanPreset = preset;

      const rateForPreset = (loanPresetRates && loanPresetRates[preset] !== undefined)
        ? loanPresetRates[preset]
        : (DEFAULT_PRESET_RATES[preset] || 6.5);
      elInterestRate.value = rateForPreset;
      if (elInterestSlider) elInterestSlider.value = rateForPreset;

      if (preset === '30-fixed') {
        isArmLoan = false;
        elLoanTerm.value = 30;
        elTermSlider.value = 30;
        setArmSettingsPanelVisible(false);
        if (elLabelInterestRate) elLabelInterestRate.textContent = 'Interest Rate';
      } else if (preset === '15-fixed') {
        isArmLoan = false;
        elLoanTerm.value = 15;
        elTermSlider.value = 15;
        setArmSettingsPanelVisible(false);
        if (elLabelInterestRate) elLabelInterestRate.textContent = 'Interest Rate';
      } else if (preset === '5-arm') {
        isArmLoan = true;
        elLoanTerm.value = 30;
        elTermSlider.value = 30;
        if (elArmFixedTerm && elArmFixedTermSlider) {
          elArmFixedTerm.value = 5;
          elArmFixedTermSlider.value = 5;
        }
        setArmSettingsPanelVisible(true);
        if (elLabelInterestRate) elLabelInterestRate.textContent = 'Initial Rate';
      } else if (preset === '7-arm') {
        isArmLoan = true;
        elLoanTerm.value = 30;
        elTermSlider.value = 30;
        if (elArmFixedTerm && elArmFixedTermSlider) {
          elArmFixedTerm.value = 7;
          elArmFixedTermSlider.value = 7;
        }
        setArmSettingsPanelVisible(true);
        if (elLabelInterestRate) elLabelInterestRate.textContent = 'Initial Rate';
      } else if (preset === '10-arm') {
        isArmLoan = true;
        elLoanTerm.value = 30;
        elTermSlider.value = 30;
        if (elArmFixedTerm && elArmFixedTermSlider) {
          elArmFixedTerm.value = 10;
          elArmFixedTermSlider.value = 10;
        }
        setArmSettingsPanelVisible(true);
        if (elLabelInterestRate) elLabelInterestRate.textContent = 'Initial Rate';
      } else if (preset === 'custom') {
        setArmSettingsPanelVisible(isArmLoan);
      }

      recalculate();
    });
  });
  // 1. Home Price Sync
  linkSliderAndInput(elHomePrice, elHomePriceSlider, () => {
    // Update max of down payment and closing costs sliders when home price changes
    const price = parseFloat(elHomePrice.value) || 0;
    elDownPaymentSlider.max = price;
    elClosingCostsSlider.max = Math.max(100000, Math.round(price * 0.1));

    // Recalculate down payment dollar amount based on current percent
    const pct = parseFloat(elDownPaymentPercent.value) || 0;
    const newDp = Math.min(price, Math.round(price * (pct / 100)));
    elDownPayment.value = newDp;
    elDownPaymentSlider.value = newDp;

    // Recalculate closing costs dollar amount based on current percent
    const ccPct = parseFloat(elClosingCostsPercent.value) || 0;
    const newCc = Math.round(price * (ccPct / 100));
    elClosingCosts.value = newCc;
    elClosingCostsSlider.value = newCc;
  });

  // Closing Costs Sync (Dollar & Percent)
  elClosingCosts.addEventListener('input', () => {
    const price = parseFloat(elHomePrice.value) || 0;
    let cc = parseFloat(elClosingCosts.value) || 0;

    if (cc > price) {
      cc = price;
      elClosingCosts.value = cc;
    }

    elClosingCostsSlider.value = cc;

    // Update percent
    if (price > 0) {
      elClosingCostsPercent.value = ((cc / price) * 100).toFixed(1);
    } else {
      elClosingCostsPercent.value = 0;
    }
    recalculate();
  });

  elClosingCostsSlider.addEventListener('input', () => {
    const price = parseFloat(elHomePrice.value) || 0;
    const cc = parseFloat(elClosingCostsSlider.value) || 0;
    elClosingCosts.value = cc;

    // Update percent
    if (price > 0) {
      elClosingCostsPercent.value = ((cc / price) * 100).toFixed(1);
    } else {
      elClosingCostsPercent.value = 0;
    }
    recalculate();
  });

  elClosingCostsPercent.addEventListener('input', () => {
    const price = parseFloat(elHomePrice.value) || 0;
    let pct = parseFloat(elClosingCostsPercent.value) || 0;

    if (pct > 20) {
      pct = 20;
      elClosingCostsPercent.value = pct;
    } else if (pct < 0) {
      pct = 0;
      elClosingCostsPercent.value = pct;
    }

    const cc = Math.round(price * (pct / 100));
    elClosingCosts.value = cc;
    elClosingCostsSlider.value = cc;
    recalculate();
  });

  // 2. Down Payment Sync (Dollar & Percent)
  elDownPayment.addEventListener('input', () => {
    const price = parseFloat(elHomePrice.value) || 0;
    let dp = parseFloat(elDownPayment.value) || 0;

    if (dp > price) {
      dp = price;
      elDownPayment.value = dp;
    }

    elDownPaymentSlider.value = dp;

    // Update percent
    if (price > 0) {
      elDownPaymentPercent.value = ((dp / price) * 100).toFixed(1);
    } else {
      elDownPaymentPercent.value = 0;
    }
    recalculate();
  });

  elDownPaymentSlider.addEventListener('input', () => {
    const price = parseFloat(elHomePrice.value) || 0;
    const dp = parseFloat(elDownPaymentSlider.value) || 0;
    elDownPayment.value = dp;

    // Update percent
    if (price > 0) {
      elDownPaymentPercent.value = ((dp / price) * 100).toFixed(1);
    } else {
      elDownPaymentPercent.value = 0;
    }
    recalculate();
  });

  elDownPaymentPercent.addEventListener('input', () => {
    const price = parseFloat(elHomePrice.value) || 0;
    let pct = parseFloat(elDownPaymentPercent.value) || 0;

    if (pct > 99) {
      pct = 99;
      elDownPaymentPercent.value = pct;
    } else if (pct < 0) {
      pct = 0;
      elDownPaymentPercent.value = pct;
    }

    const dp = Math.round(price * (pct / 100));
    elDownPayment.value = dp;
    elDownPaymentSlider.value = dp;
    recalculate();
  });

  // 3. Interest Rate Sync
  linkSliderAndInput(elInterestRate, elInterestSlider, () => {
    loanPresetRates[activeLoanPreset] = parseFloat(elInterestRate.value) || 0;
  });

  // 4. Term Sync
  linkSliderAndInput(elLoanTerm, elTermSlider);

  // Property Tax Sync
  linkSliderAndInput(elPropertyTax, elPropertyTaxSlider);

  // Home Insurance Sync
  linkSliderAndInput(elHomeInsurance, elHomeInsuranceSlider);

  // 5. Extra Payments Sync
  linkSliderAndInput(elExtraMonthly, elExtraMonthlySlider);

  // 6. Budget Sync
  linkSliderAndInput(elTakeHomeSalary, elTakeHomeSlider);
  linkSliderAndInput(elMonthlyExpenses, elExpensesSlider);

  // 6. One-Time payments triggers
  if (elOneTimeExtra) elOneTimeExtra.addEventListener('input', recalculate);
  if (elOneTimeMonth) elOneTimeMonth.addEventListener('input', recalculate);

  // Reset Accelerate Payoff inputs
  if (elBtnResetPayoff) {
    elBtnResetPayoff.addEventListener('click', () => {
      // 1. Reset Extra Monthly Payment to 0
      if (elExtraMonthly) elExtraMonthly.value = 0;
      if (elExtraMonthlySlider) elExtraMonthlySlider.value = 0;

      // 2. Clear Scheduled One-Time Extra Payments & total input
      setScheduledOneTimePayments([]);
      if (elOneTimeExtra) elOneTimeExtra.value = 0;
      if (typeof renderOneTimePaymentsList === 'function') {
        renderOneTimePaymentsList();
      }

      // 3. Reset Recast Settings to 0 / OFF
      if (elEnableRecast) elEnableRecast.checked = false;
      if (elRecastCardBody) elRecastCardBody.style.display = 'none';
      if (elRecastAmount) elRecastAmount.value = 0;
      if (elRecastAmountSlider) elRecastAmountSlider.value = elRecastAmountSlider.min || 0;

      // 4. Recalculate
      recalculate();
    });
  }



  // Table View Toggles
  elBtnViewAnnual.addEventListener('click', () => {
    elBtnViewAnnual.classList.add('active');
    elBtnViewMonthly.classList.remove('active');
    activeTableViewMode = 'annual';
    renderTable();
  });

  elBtnViewMonthly.addEventListener('click', () => {
    elBtnViewMonthly.classList.add('active');
    elBtnViewAnnual.classList.remove('active');
    activeTableViewMode = 'monthly';
    currentTablePage = 1;
    renderTable();
  });

  // Table Pagination Click Handlers
  elBtnPrevPage.addEventListener('click', () => {
    if (currentTablePage > 1) {
      currentTablePage--;
      renderTable();
    }
  });

  elBtnNextPage.addEventListener('click', () => {
    currentTablePage++;
    renderTable();
  });

  // CSV Export Trigger
  elBtnExportCsv.addEventListener('click', exportScheduleToCSV);

  // Target Calculator Sync
  elTargetTerm.addEventListener('input', () => {
    elTargetTermSlider.value = elTargetTerm.value;
    updateTargetTermCalculator();
  });

  elTargetTermSlider.addEventListener('input', () => {
    elTargetTerm.value = elTargetTermSlider.value;
    updateTargetTermCalculator();
  });

  elTargetPrincipal.addEventListener('input', updateTargetTermCalculator);

  elBtnResetTargetPrincipal.addEventListener('click', () => {
    // Reset target principal to the currently active loan amount
    const price = parseFloat(elHomePrice.value) || 0;
    const dp = parseFloat(elDownPayment.value) || 0;
    const loanAmt = Math.max(0, price - dp);
    elTargetPrincipal.value = loanAmt;
    updateTargetTermCalculator();
  });

  elBtnApplyTarget.addEventListener('click', () => {
    // Calculate needed extra
    const targetYears = parseFloat(elTargetTerm.value) || 15;
    const targetPrincipal = parseFloat(elTargetPrincipal.value) || 0;
    const annualRate = parseFloat(elInterestRate.value) || 0;
    const monthlyRate = (annualRate / 100) / 12;
    const targetMonths = targetYears * 12;
    const originalBasePayment = currentSchedule.summary.baseMonthlyPayment || 0;

    let requiredTotalPayment = 0;
    if (targetPrincipal > 0) {
      if (monthlyRate === 0) {
        requiredTotalPayment = targetPrincipal / targetMonths;
      } else {
        requiredTotalPayment = (
          (targetPrincipal * (monthlyRate * Math.pow(1 + monthlyRate, targetMonths))) /
          (Math.pow(1 + monthlyRate, targetMonths) - 1)
        );
      }
    }

    const extraRequired = Math.round(Math.max(0, requiredTotalPayment - originalBasePayment));

    // Apply to UI parameters
    elExtraMonthly.value = extraRequired;
    elExtraMonthlySlider.value = extraRequired;
    recalculate();

    // Scroll smoothly to acceleration section in form
    elExtraMonthly.scrollIntoView({ behavior: 'smooth', block: 'center' });
    elExtraMonthly.focus();
  });

  // Scenario Management & Modal Listeners
  function openSaveModal() {
    if (!elModalSaveScenario) return;
    const count = getSavedScenarios().length + 1;
    if (elScenarioNameInput) {
      elScenarioNameInput.value = `Scenario ${count}`;
    }
    if (elScenarioCommentsInput) {
      elScenarioCommentsInput.value = '';
    }
    elModalSaveScenario.style.display = 'flex';
    if (elScenarioNameInput) {
      elScenarioNameInput.focus();
      elScenarioNameInput.select();
    }
  }

  function closeSaveModal() {
    if (elModalSaveScenario) {
      elModalSaveScenario.style.display = 'none';
    }
  }

  if (elBtnSaveScenario) {
    elBtnSaveScenario.addEventListener('click', openSaveModal);
  }

  if (elBtnCloseModal) elBtnCloseModal.addEventListener('click', closeSaveModal);
  if (elBtnCancelModal) elBtnCancelModal.addEventListener('click', closeSaveModal);

  if (elModalSaveScenario) {
    elModalSaveScenario.addEventListener('click', (e) => {
      if (e.target === elModalSaveScenario) closeSaveModal();
    });
  }

  if (elBtnConfirmSaveScenario) {
    elBtnConfirmSaveScenario.addEventListener('click', () => {
      const name = elScenarioNameInput ? elScenarioNameInput.value : '';
      const comments = elScenarioCommentsInput ? elScenarioCommentsInput.value : '';
      if (!name || !name.trim()) {
        if (elScenarioNameInput) elScenarioNameInput.focus();
        return;
      }
      saveScenario(name, comments);
      closeSaveModal();
    });
  }

  // Terms & Disclaimer Modal Handlers
  function openDisclaimerModal() {
    if (elModalDisclaimer) elModalDisclaimer.style.display = 'flex';
  }

  function closeDisclaimerModal() {
    if (elModalDisclaimer) elModalDisclaimer.style.display = 'none';
  }

  if (elBtnOpenDisclaimer) elBtnOpenDisclaimer.addEventListener('click', openDisclaimerModal);
  if (elBtnCloseDisclaimer) elBtnCloseDisclaimer.addEventListener('click', closeDisclaimerModal);
  if (elBtnXCloseDisclaimer) elBtnXCloseDisclaimer.addEventListener('click', closeDisclaimerModal);

  if (elModalDisclaimer) {
    elModalDisclaimer.addEventListener('click', (e) => {
      if (e.target === elModalDisclaimer) closeDisclaimerModal();
    });
  }

  if (elScenarioSelect) {
    elScenarioSelect.addEventListener('change', (e) => {
      const id = e.target.value;
      if (id) {
        loadScenario(id);
      }
      if (elBtnDeleteScenario) {
        elBtnDeleteScenario.disabled = !id;
      }
    });
  }

  if (elBtnDeleteScenario) {
    elBtnDeleteScenario.addEventListener('click', () => {
      const id = elScenarioSelect ? elScenarioSelect.value : null;
      if (id) {
        const scenarios = getSavedScenarios();
        const found = scenarios.find(s => s.id === id);
        const name = found ? found.name : 'this scenario';
        if (confirm(`Are you sure you want to delete "${name}"?`)) {
          deleteScenario(id);
        }
      }
    });
  }

  if (elBtnDuplicateScenario) {
    elBtnDuplicateScenario.addEventListener('click', () => {
      duplicateScenario();
    });
  }

  const elActiveScenarioPill = document.getElementById('active-scenario-pill');
  if (elActiveScenarioPill) {
    elActiveScenarioPill.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleScenarioDropdown();
    });
  }

  const elBtnQuickSaveDropdown = document.getElementById('btn-quick-save-dropdown');
  if (elBtnQuickSaveDropdown) {
    elBtnQuickSaveDropdown.addEventListener('click', (e) => {
      e.stopPropagation();
      closeScenarioDropdown();
      if (elModalSaveScenario) {
        elModalSaveScenario.style.display = 'flex';
        if (elScenarioNameInput) elScenarioNameInput.focus();
      }
    });
  }

  const elBtnMoreActions = document.getElementById('btn-scenario-more-actions');
  if (elBtnMoreActions) {
    elBtnMoreActions.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleScenarioOverflowMenu();
    });
  }

  const elOverflowSave = document.getElementById('overflow-item-save');
  if (elOverflowSave) {
    elOverflowSave.addEventListener('click', () => {
      closeAllScenarioMenus();
      if (elModalSaveScenario) {
        elModalSaveScenario.style.display = 'flex';
        if (elScenarioNameInput) elScenarioNameInput.focus();
      }
    });
  }

  const elOverflowDuplicate = document.getElementById('overflow-item-duplicate');
  if (elOverflowDuplicate) {
    elOverflowDuplicate.addEventListener('click', () => {
      closeAllScenarioMenus();
      duplicateScenario();
    });
  }

  const elOverflowCompare = document.getElementById('overflow-item-compare');
  if (elOverflowCompare) {
    elOverflowCompare.addEventListener('click', () => {
      closeAllScenarioMenus();
      openCompareModal();
    });
  }

  document.addEventListener('click', (e) => {
    const resetTag = e.target.closest('.field-status-tag.resettable');
    if (resetTag) {
      const fieldId = resetTag.getAttribute('data-reset-field');
      if (fieldId) {
        e.preventDefault();
        e.stopPropagation();
        resetSingleFieldToDefault(fieldId);
      }
    }
  });

  const elOverflowDelete = document.getElementById('overflow-item-delete');
  if (elOverflowDelete) {
    elOverflowDelete.addEventListener('click', () => {
      closeAllScenarioMenus();
      const id = currentScenarioId || (elScenarioSelect ? elScenarioSelect.value : null);
      if (id) {
        const scenarios = getSavedScenarios();
        const found = scenarios.find(s => s.id === id);
        const name = found ? found.name : 'this scenario';
        if (confirm(`Are you sure you want to delete "${name}"?`)) {
          deleteScenario(id);
        }
      }
    });
  }

  document.addEventListener('click', (e) => {
    const switcher = document.getElementById('scenario-switcher-wrapper');
    const overflow = document.getElementById('scenario-overflow-wrapper');
    if (switcher && !switcher.contains(e.target)) {
      closeScenarioDropdown();
    }
    if (overflow && !overflow.contains(e.target)) {
      closeScenarioOverflowMenu();
    }
  });

  if (elBtnThemeToggle) {
    elBtnThemeToggle.addEventListener('click', toggleTheme);
  }

  const elBtnResetDefaults = document.getElementById('btn-reset-defaults');
  if (elBtnResetDefaults) {
    elBtnResetDefaults.addEventListener('click', resetToDefaults);
  }

  const elBtnModeToggle = document.getElementById('btn-mode-toggle');
  if (elBtnModeToggle) {
    elBtnModeToggle.addEventListener('click', toggleSimpleMode);
  }

  const btnCompareScenarios = document.getElementById('btn-compare-scenarios');
  const btnCloseCompareModal = document.getElementById('btn-close-compare-modal');
  const btnXCloseCompare = document.getElementById('btn-x-close-compare');
  const modalCompare = document.getElementById('modal-compare-scenarios');
  const btnPrintCompare = document.getElementById('btn-print-compare');

  if (btnCompareScenarios) {
    btnCompareScenarios.addEventListener('click', openCompareModal);
  }
  if (btnCloseCompareModal) {
    btnCloseCompareModal.addEventListener('click', closeCompareModal);
  }
  if (btnXCloseCompare) {
    btnXCloseCompare.addEventListener('click', closeCompareModal);
  }
  if (modalCompare) {
    modalCompare.addEventListener('click', (e) => {
      if (e.target === modalCompare) closeCompareModal();
    });
  }
  if (btnPrintCompare) {
    btnPrintCompare.addEventListener('click', () => {
      if (typeof window !== 'undefined') window.print();
    });
  }

  setupPitiViewToggle();
  setupSavingsChipHandlers();
}

// ==========================================================================
// COMPARE SCENARIOS MODAL ENGINE
// ==========================================================================

let compareModalSelectedIds = [];

function openCompareModal() {
  const modal = document.getElementById('modal-compare-scenarios');
  if (!modal) return;

  const scenarios = getSavedScenarios();
  const currentState = serializeCurrentState();
  const allScenarios = [
    { id: 'current', name: 'Active Simulation (Current Inputs)', ...currentState, isCurrent: true },
    ...scenarios
  ];

  if (compareModalSelectedIds.length === 0 || compareModalSelectedIds.length < Math.min(4, allScenarios.length)) {
    compareModalSelectedIds = allScenarios.slice(0, 4).map(s => s.id);
  }

  modal.style.display = 'flex';
  renderCompareModalChips(allScenarios);
  renderCompareMatrix(allScenarios);
}

function closeCompareModal() {
  const modal = document.getElementById('modal-compare-scenarios');
  if (modal) {
    modal.style.display = 'none';
  }
}

function renderCompareModalChips(allScenarios) {
  const chipsContainer = document.getElementById('compare-selection-chips');
  if (!chipsContainer) return;

  chipsContainer.innerHTML = '';
  allScenarios.forEach((s, idx) => {
    const isSelected = compareModalSelectedIds.includes(s.id);
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = `compare-chip ${isSelected ? 'active' : ''}`;
    chip.setAttribute('data-id', s.id);
    chip.innerHTML = `
      <span class="chip-dot"></span>
      <span>${s.name}</span>
    `;

    chip.addEventListener('click', () => {
      if (isSelected) {
        if (compareModalSelectedIds.length <= 1) return;
        compareModalSelectedIds = compareModalSelectedIds.filter(id => id !== s.id);
      } else {
        if (compareModalSelectedIds.length >= 4) {
          compareModalSelectedIds.shift();
        }
        compareModalSelectedIds.push(s.id);
      }
      renderCompareModalChips(allScenarios);
      renderCompareMatrix(allScenarios);
    });

    chipsContainer.appendChild(chip);
  });
}

function renderCompareMatrix(allScenarios) {
  const wrapper = document.getElementById('compare-matrix-wrapper');
  if (!wrapper) return;

  const selectedScenarios = allScenarios.filter(s => compareModalSelectedIds.includes(s.id));
  if (selectedScenarios.length === 0) {
    wrapper.innerHTML = `<div class="p-4 text-center">No scenarios selected for comparison.</div>`;
    return;
  }

  const scenarioData = selectedScenarios.map(s => {
    const st = s.state || s;
    const homePrice = st.homePrice !== undefined ? parseFloat(st.homePrice) : 450000;
    const downPayment = st.downPayment !== undefined ? parseFloat(st.downPayment) : 90000;
    const downPaymentPercent = st.downPaymentPercent !== undefined ? parseFloat(st.downPaymentPercent) : (homePrice > 0 ? (downPayment / homePrice) * 100 : 20);
    const interestRate = st.interestRate !== undefined ? parseFloat(st.interestRate) : 6.5;
    const loanTerm = st.loanTerm !== undefined ? parseInt(st.loanTerm) : 30;
    const extraMonthly = st.extraMonthly !== undefined ? parseFloat(st.extraMonthly) : 0;
    const oneTimeExtra = st.oneTimeExtra !== undefined ? parseFloat(st.oneTimeExtra) : 0;
    const oneTimeMonth = st.oneTimeMonth !== undefined ? parseInt(st.oneTimeMonth) : 12;
    const propertyTax = st.propertyTax !== undefined ? parseFloat(st.propertyTax) : 1.2;
    const homeInsurance = st.homeInsurance !== undefined ? parseFloat(st.homeInsurance) : 0.5;
    const takeHomeSalary = st.takeHomeSalary !== undefined ? parseFloat(st.takeHomeSalary) : 0;
    const monthlyExpenses = st.monthlyExpenses !== undefined ? parseFloat(st.monthlyExpenses) : 0;
    const isArmLoan = !!st.isArmLoan;
    const armFixedTerm = st.armFixedTerm !== undefined ? parseInt(st.armFixedTerm) : 5;
    const armAdjustedRate = st.armAdjustedRate !== undefined ? parseFloat(st.armAdjustedRate) : 7.5;
    const scheduledOneTimePayments = st.scheduledOneTimePayments || [];
    const isRecastEnabled = !!st.isRecastEnabled;
    const recastAmount = st.recastAmount !== undefined ? parseFloat(st.recastAmount) : 50000;
    const recastMonth = st.recastMonth !== undefined ? parseInt(st.recastMonth) : 60;
    const closingCosts = st.closingCosts !== undefined ? parseFloat(st.closingCosts) : 13500;

    const schedule = calculateAmortizationSchedules(
      homePrice,
      downPayment,
      interestRate,
      loanTerm,
      extraMonthly,
      oneTimeExtra,
      oneTimeMonth,
      isArmLoan,
      armFixedTerm,
      armAdjustedRate,
      scheduledOneTimePayments,
      isRecastEnabled,
      recastAmount,
      recastMonth
    );

    const summary = schedule.summary;
    const monthlyTax = (homePrice * (propertyTax / 100)) / 12;
    const monthlyInsurance = (homePrice * (homeInsurance / 100)) / 12;
    const monthlyPmi = summary.monthlyPMI || 0;
    const totalPITI = summary.baseMonthlyPayment + monthlyTax + monthlyInsurance + monthlyPmi;
    const totalPITIWithExtra = totalPITI + extraMonthly;
    const netCashFlow = takeHomeSalary > 0 ? (takeHomeSalary - monthlyExpenses - totalPITIWithExtra) : 0;
    const dtiRatio = takeHomeSalary > 0 ? ((totalPITIWithExtra + monthlyExpenses) / takeHomeSalary) * 100 : 0;

    return {
      scenario: s,
      state: {
        homePrice,
        downPayment,
        downPaymentPercent,
        interestRate,
        loanTerm,
        extraMonthly,
        oneTimeExtra,
        oneTimeMonth,
        propertyTax,
        homeInsurance,
        takeHomeSalary,
        monthlyExpenses,
        isArmLoan,
        armFixedTerm,
        armAdjustedRate,
        scheduledOneTimePayments,
        isRecastEnabled,
        recastAmount,
        recastMonth,
        closingCosts
      },
      summary,
      metrics: {
        monthlyTax,
        monthlyInsurance,
        monthlyPmi,
        totalPITI,
        totalPITIWithExtra,
        netCashFlow,
        dtiRatio
      }
    };
  });

  let lowestInterest = Infinity;
  scenarioData.forEach(d => {
    if (d.summary.acceleratedTotalInterest < lowestInterest) {
      lowestInterest = d.summary.acceleratedTotalInterest;
    }
  });

  const colors = ['#6366f1', '#06b6d4', '#10b981', '#a855f7'];

  let html = `<table class="compare-matrix-table">
    <thead>
      <tr>
        <th class="metric-label-col">Financial Metric</th>`;

  scenarioData.forEach((d, idx) => {
    const c = colors[idx % colors.length];
    html += `<th class="scenario-col-header" style="border-top-color: ${c};">
      <div><strong>${d.scenario.name}</strong></div>
      ${!d.scenario.isCurrent ? `<button type="button" class="btn btn-xs btn-outline btn-apply-scenario-modal mt-1" data-id="${d.scenario.id}"><i class="fa-solid fa-check"></i> Apply</button>` : `<span class="badge badge-sm badge-info mt-1">Active</span>`}
    </th>`;
  });

  html += `</tr>
    </thead>
    <tbody>`;

  const addRow = (label, getValueFn) => {
    html += `<tr><td class="metric-label-cell">${label}</td>`;
    scenarioData.forEach(d => {
      html += `<td class="scenario-val-cell">${getValueFn(d)}</td>`;
    });
    html += `</tr>`;
  };

  const addCategoryHeader = (categoryName) => {
    html += `<tr class="category-header-row"><td colspan="${scenarioData.length + 1}">${categoryName}</td></tr>`;
  };

  // Section 1: Loan & Structure
  addCategoryHeader('Loan & Structure Parameters');
  addRow('Home Purchase Price', d => formatCurrency(d.state.homePrice));
  addRow('Down Payment', d => `${formatCurrency(d.state.downPayment)} (${d.state.downPaymentPercent.toFixed(1)}%)`);
  addRow('Loan Principal Amount', d => formatCurrency(d.summary.loanAmount));
  addRow('Interest Rate & Structure', d => d.state.isArmLoan ? `${d.state.interestRate}% (${d.state.armFixedTerm}/1 ARM Reset ${d.state.armAdjustedRate}%)` : `${d.state.interestRate}% Fixed`);
  addRow('Loan Term', d => `${d.state.loanTerm} Years`);

  // Section 2: Monthly Housing Obligation (PITI)
  addCategoryHeader('Monthly Housing Obligation (PITI)');
  addRow('Base Principal & Interest (P&I)', d => formatCurrency(d.summary.baseMonthlyPayment));
  addRow('Property Tax & Home Insurance', d => `${formatCurrency(d.metrics.monthlyTax + d.metrics.monthlyInsurance)}/mo`);
  addRow('PMI Monthly Cost', d => d.metrics.monthlyPmi > 0 ? formatCurrency(d.metrics.monthlyPmi) : '$0.00');
  addRow('Total Monthly Payment (PITI)', d => `<strong>${formatCurrency(d.metrics.totalPITI)}</strong>`);

  // Section 3: Payoff Acceleration & Savings Metrics
  addCategoryHeader('Payoff Acceleration & Savings Metrics');
  addRow('Extra Monthly Payment', d => d.state.extraMonthly > 0 ? formatCurrency(d.state.extraMonthly) : '$0.00');
  addRow('Scheduled Lump Sum Payments', d => d.state.oneTimeExtra > 0 ? formatCurrency(d.state.oneTimeExtra) : '$0.00');
  addRow('Total Interest Paid', d => {
    const val = formatCurrency(d.summary.acceleratedTotalInterest);
    const isBest = d.summary.acceleratedTotalInterest === lowestInterest && scenarioData.length > 1;
    return `<strong>${val}</strong>${isBest ? ` <span class="compare-best-badge"><i class="fa-solid fa-award"></i> Best Value</span>` : ''}`;
  });
  addRow('Total Interest Saved', d => `<span class="text-success fw-bold">${formatCurrency(d.summary.interestSaved)}</span>`);
  addRow('Actual Payoff Duration', d => `${Math.floor(d.summary.acceleratedMonths / 12)} Yrs ${d.summary.acceleratedMonths % 12} Mos`);
  addRow('Time Saved', d => d.summary.timeSavedMonths > 0 ? `<span class="text-success fw-bold">${Math.floor(d.summary.timeSavedMonths / 12)} Yrs ${d.summary.timeSavedMonths % 12} Mos</span>` : '0 Mos');

  // Section 4: Cash Flow & Upfront Requirements
  addCategoryHeader('Cash Flow & Upfront Capital Requirements');
  addRow('Upfront Cash Required', d => formatCurrency(d.state.downPayment + d.state.closingCosts));
  addRow('Debt-to-Income (DTI) Ratio', d => d.metrics.dtiRatio > 0 ? `${d.metrics.dtiRatio.toFixed(1)}%` : 'N/A');
  addRow('Net Monthly Cash Flow', d => {
    if (d.state.takeHomeSalary <= 0) return 'N/A';
    const cf = d.metrics.netCashFlow;
    const colorClass = cf < 0 ? 'text-danger' : 'text-success';
    return `<span class="${colorClass} fw-bold">${formatCurrency(cf)}</span>`;
  });

  html += `</tbody></table>`;
  wrapper.innerHTML = html;

  const applyBtns = wrapper.querySelectorAll('.btn-apply-scenario-modal');
  applyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (id) {
        loadScenario(id);
        closeCompareModal();
      }
    });
  });
}

// ==========================================================================
// PITI DONUT CHART & VIEW TOGGLE HELPERS
// ==========================================================================

let pitiDonutChartInstance = null;

function renderPitiDonutChart(pi, tax, ins, pmi = 0) {
  const canvas = document.getElementById('pitiDonutCanvas');
  if (!canvas || typeof Chart === 'undefined') return;

  const ctx = canvas.getContext('2d');
  if (pitiDonutChartInstance) {
    pitiDonutChartInstance.destroy();
  }

  const labels = ['P&I', 'Property Tax', 'Home Ins'];
  const data = [pi, tax, ins];
  const colors = ['#6366f1', '#06b6d4', '#8b5cf6'];

  if (pmi > 0) {
    labels.push('PMI');
    data.push(pmi);
    colors.push('#f43f5e');
  }

  try {
    pitiDonutChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '78%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (context) {
                const val = context.raw || 0;
                return `${context.label}: $${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
              }
            }
          }
        }
      }
    });
  } catch (e) {
    // Graceful fallback for environments without canvas 2d context
  }

  // Render HTML Legend Rows & Donut Center Total
  const legendGrid = document.getElementById('piti-donut-legend');
  const elDonutTotal = document.getElementById('piti-donut-total');
  const total = pi + tax + ins + pmi;

  if (elDonutTotal) {
    elDonutTotal.textContent = formatCurrency(total);
  }

  if (legendGrid) {
    legendGrid.innerHTML = labels.map((label, idx) => `
      <div class="legend-chip legend-row">
        <div class="legend-chip-left legend-meta">
          <span class="chip-dot legend-dot" style="background: ${colors[idx]};"></span>
          <span class="chip-label legend-label">${label}</span>
        </div>
        <strong class="chip-val legend-val">$${Math.round(data[idx]).toLocaleString()}</strong>
      </div>
    `).join('');
  }
}

function setupPitiViewToggle() {
  const btnText = document.getElementById('btn-piti-view-text');
  const btnChart = document.getElementById('btn-piti-view-chart');
  const viewText = document.getElementById('piti-view-text');
  const viewChart = document.getElementById('piti-view-chart');

  if (btnText && btnChart && viewText && viewChart) {
    btnText.addEventListener('click', () => {
      btnText.classList.add('active');
      btnChart.classList.remove('active');
      viewText.classList.remove('hidden');
      viewChart.classList.add('hidden');
    });

    btnChart.addEventListener('click', () => {
      btnChart.classList.add('active');
      btnText.classList.remove('active');
      viewChart.classList.remove('hidden');
      viewText.classList.add('hidden');
      recalculate();
    });
  }
}

function setupSavingsChipHandlers() {
  const elChipMonthly = document.getElementById('chip-savings-monthly');
  const elChipLump = document.getElementById('chip-savings-lump');
  const elExtraMonthly = document.getElementById('extra-monthly');
  const elOneTimeExtra = document.getElementById('one-time-extra');

  if (elChipMonthly && elExtraMonthly) {
    const handleMonthlyClick = () => {
      elExtraMonthly.focus();
      if (typeof elExtraMonthly.scrollIntoView === 'function') {
        elExtraMonthly.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };
    elChipMonthly.addEventListener('click', handleMonthlyClick);
    elChipMonthly.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleMonthlyClick();
      }
    });
  }

  if (elChipLump && elOneTimeExtra) {
    const handleLumpClick = () => {
      elOneTimeExtra.focus();
      if (typeof elOneTimeExtra.scrollIntoView === 'function') {
        elOneTimeExtra.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };
    elChipLump.addEventListener('click', handleLumpClick);
    elChipLump.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleLumpClick();
      }
    });
  }
}

// ==========================================================================
// PLAIN-ENGLISH HELP & FINANCIAL GLOSSARY ENGINE
// ==========================================================================

const GLOSSARY_TERMS = {
  'home-price': {
    title: 'Home Purchase Price',
    category: 'loan',
    icon: 'fa-house',
    definition: 'The total agreed sale price of the property you are purchasing before applying any down payment or mortgage financing.'
  },
  'down-payment': {
    title: 'Down Payment',
    category: 'loan',
    icon: 'fa-hand-holding-dollar',
    definition: 'Upfront cash paid towards the home purchase price. Providing 20% or more eliminates the requirement for Private Mortgage Insurance (PMI).'
  },
  'closing-costs': {
    title: 'Estimated Closing Costs',
    category: 'loan',
    icon: 'fa-receipt',
    definition: 'Upfront administrative fees paid at loan origination to lenders, title companies, appraisers, and local governments (typically 2% to 5% of home value).'
  },
  'loan-principal': {
    title: 'Loan Principal Amount',
    category: 'loan',
    icon: 'fa-piggy-bank',
    definition: 'The actual borrowed amount that you owe the lender, equal to Home Purchase Price minus Down Payment.'
  },
  'upfront-cash': {
    title: 'Total Upfront Cash Needed',
    category: 'loan',
    icon: 'fa-coins',
    definition: 'Total liquid cash required at closing, calculated as Down Payment plus Estimated Closing Costs.'
  },
  'loan-type': {
    title: 'Loan Type & Structure',
    category: 'loan',
    icon: 'fa-sliders',
    definition: 'The structure of your mortgage. Fixed-rate loans keep the exact same interest rate for 15 or 30 years. Adjustable-rate mortgages (ARMs) feature a fixed initial period before interest rates adjust periodically.'
  },
  'interest-rate': {
    title: 'Interest Rate',
    category: 'loan',
    icon: 'fa-percent',
    definition: 'The annual percentage fee charged by the lender for borrowing the principal loan balance.'
  },
  'loan-term': {
    title: 'Loan Term',
    category: 'loan',
    icon: 'fa-calendar-days',
    definition: 'The total planned duration of your mortgage in years (typically 15 or 30 years).'
  },
  'arm-loan': {
    title: 'Adjustable-Rate Mortgage (ARM)',
    category: 'arm',
    icon: 'fa-clock-rotate-left',
    definition: 'A mortgage where the interest rate is locked for an initial fixed period (e.g. 5, 7, or 10 years) and subsequently resets periodically based on benchmark market rates.'
  },
  'arm-fixed-term': {
    title: 'ARM Initial Fixed Period',
    category: 'arm',
    icon: 'fa-lock',
    definition: 'The number of initial years (e.g., 5, 7, or 10 years) during which your interest rate and monthly PITI payment are locked and guaranteed not to change.'
  },
  'arm-adjusted-rate': {
    title: 'ARM Projected Reset Rate',
    category: 'arm',
    icon: 'fa-chart-line',
    definition: 'The estimated annual interest rate expected to take effect after your initial fixed period ends and your loan rate adjusts to prevailing market levels.'
  },
  'arm-reset-payment': {
    title: 'ARM Re-Amortized Payment (Year 6+ PITI)',
    category: 'arm',
    icon: 'fa-arrows-rotate',
    definition: 'The recalculated monthly payment required to fully amortize the remaining principal balance over the remaining loan term at the new reset rate.'
  },
  'property-tax': {
    title: 'Property Tax Rate',
    category: 'payment',
    icon: 'fa-landmark',
    definition: 'Annual real estate taxes levied by local municipal or county government as a percentage of property valuation.'
  },
  'home-insurance': {
    title: 'Home Insurance Rate',
    category: 'payment',
    icon: 'fa-shield-halved',
    definition: 'Annual hazard insurance premium protecting your property against damage, expressed as a percentage of home value.'
  },
  'piti': {
    title: 'Monthly Payment (PITI)',
    category: 'payment',
    icon: 'fa-file-invoice-dollar',
    definition: 'Your total recurring monthly housing obligation: Principal (P), Interest (I), Property Taxes (T), and Hazard Insurance (I).'
  },
  'pmi': {
    title: 'Private Mortgage Insurance (PMI)',
    category: 'payment',
    icon: 'fa-user-shield',
    definition: 'Lender protection insurance required when down payment is less than 20%. Automatically cancels once your loan principal reaches 80% of original home value.'
  },
  'take-home-salary': {
    title: 'Take-Home Salary',
    category: 'budget',
    icon: 'fa-wallet',
    definition: 'Your net monthly income after payroll taxes and deductions, used to calculate net monthly cash flow and discretionary budget.'
  },
  'monthly-expenses': {
    title: 'Monthly Expenses & Debt Obligations',
    category: 'budget',
    icon: 'fa-credit-card',
    definition: 'Non-housing monthly recurring debt obligations (car payments, student loans, credit cards) used for Debt-to-Income (DTI) evaluation.'
  },
  'extra-monthly': {
    title: 'Extra Monthly Payment',
    category: 'payoff',
    icon: 'fa-calendar-check',
    definition: 'Additional principal paid every month beyond standard PITI to accelerate loan payoff and dramatically reduce total lifetime interest.'
  },
  'one-time-extra': {
    title: 'One-Time Lump Sum Payment',
    category: 'payoff',
    icon: 'fa-bolt',
    definition: 'A single lump-sum extra payment applied directly towards principal balance at a specific month.'
  },
  'interest-paid': {
    title: 'Total Interest Paid',
    category: 'payoff',
    icon: 'fa-chart-pie',
    definition: 'The total cumulative dollar amount paid purely in interest over the life of your mortgage.'
  },
  'interest-saved': {
    title: 'Total Interest Saved',
    category: 'payoff',
    icon: 'fa-piggy-bank',
    definition: 'Total interest dollars saved by applying extra monthly or one-time lump sum principal payments.'
  },
  'time-saved': {
    title: 'Time Saved / Accelerated Payoff',
    category: 'payoff',
    icon: 'fa-hourglass-half',
    definition: 'The number of years and months shaved off your original loan term as a result of extra principal prepayments.'
  },
  'net-cash-flow': {
    title: 'Net Cash Flow & DTI Ratio',
    category: 'budget',
    icon: 'fa-scale-balanced',
    definition: 'Remaining monthly income after paying all PITI housing costs and monthly debts, paired with your Debt-to-Income ratio (< 28% ideal, 28%–36% manageable, > 36% high risk).'
  },
  'target-term': {
    title: 'Target Term Payoff Calculator',
    category: 'payoff',
    icon: 'fa-bullseye',
    definition: 'A calculator that computes the exact extra monthly payment needed to eliminate remaining principal within your target timeline (e.g. 15 or 20 years).'
  },
  'recast': {
    title: 'Mortgage Recast',
    category: 'payoff',
    icon: 'fa-rotate',
    definition: 'Re-amortizing your mortgage after making a large lump-sum principal payment. The lender recalculates your lower monthly principal and interest payment based on the reduced balance while keeping your original loan term and interest rate intact.'
  }
};

function renderGlossaryCards(filterCategory = 'all', searchQuery = '') {
  const container = document.getElementById('glossary-cards-container');
  const modalContainer = document.getElementById('modal-glossary-cards-container');
  if (!container && !modalContainer) return;

  const query = searchQuery.trim().toLowerCase();

  const entries = Object.entries(GLOSSARY_TERMS).filter(([id, data]) => {
    const matchesCategory = filterCategory === 'all' || data.category === filterCategory;
    const matchesSearch = !query ||
      data.title.toLowerCase().includes(query) ||
      data.definition.toLowerCase().includes(query) ||
      id.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const categoryLabels = {
    loan: 'Loan Basics',
    payment: 'Payments & PMI',
    payoff: 'Payoff & Savings',
    budget: 'Budget & DTI',
    arm: 'ARM Loans'
  };

  const html = entries.map(([id, data]) => `
    <div class="glossary-card" id="glossary-card-${id}" data-term-id="${id}">
      <div class="glossary-card-top">
        <div class="glossary-card-title">
          <i class="fa-solid ${data.icon}"></i>
          <span>${data.title}</span>
        </div>
        <span class="glossary-tag">${categoryLabels[data.category] || data.category}</span>
      </div>
      <div class="glossary-card-body">
        ${data.definition}
      </div>
    </div>
  `).join('');

  if (container) container.innerHTML = html || '<p class="text-muted" style="grid-column: 1/-1; text-align: center; padding: 20px;">No matching financial terms found.</p>';
  if (modalContainer) modalContainer.innerHTML = html || '<p class="text-muted" style="grid-column: 1/-1; text-align: center; padding: 20px;">No matching financial terms found.</p>';
}

function highlightTermCard(termId) {
  if (!termId) return;

  // Remove existing pulses
  document.querySelectorAll('.term-pulse').forEach(el => el.classList.remove('term-pulse'));

  const cards = document.querySelectorAll(`[data-term-id="${termId}"]`);
  cards.forEach(card => {
    card.classList.add('term-pulse');
    setTimeout(() => card.classList.remove('term-pulse'), 3500);
  });
}

function openHelpModal(targetTermId = null) {
  const modal = document.getElementById('modal-help');
  if (!modal) return;

  // Reset modal category pills to 'All Terms'
  const pills = document.querySelectorAll('#modal-glossary-category-pills .category-pill');
  pills.forEach(p => {
    if (p.getAttribute('data-category') === 'all') p.classList.add('active');
    else p.classList.remove('active');
  });

  const searchInput = document.getElementById('modal-help-search');
  if (searchInput) searchInput.value = '';

  renderGlossaryCards('all', '');

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  if (targetTermId) {
    highlightTermCard(targetTermId);
    const modalContainer = document.getElementById('modal-glossary-cards-container');
    const targetCard = modalContainer ? modalContainer.querySelector(`[data-term-id="${targetTermId}"]`) : null;
    if (targetCard) {
      targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}

function closeHelpModal() {
  const modal = document.getElementById('modal-help');
  if (!modal) return;
  modal.style.display = 'none';
  document.body.style.overflow = '';
}

function setupHelpHandlers() {
  renderGlossaryCards();

  // Header Help Button
  const btnHelp = document.getElementById('btn-help-glossary');
  if (btnHelp) {
    btnHelp.addEventListener('click', () => openHelpModal());
  }

  // Close Modal Buttons
  const btnCloseHelp = document.getElementById('btn-close-help-modal');
  const btnXCloseHelp = document.getElementById('btn-x-close-help');
  const modalHelp = document.getElementById('modal-help');

  if (btnCloseHelp) btnCloseHelp.addEventListener('click', closeHelpModal);
  if (btnXCloseHelp) btnXCloseHelp.addEventListener('click', closeHelpModal);
  if (modalHelp) {
    modalHelp.addEventListener('click', (e) => {
      if (e.target === modalHelp) closeHelpModal();
    });
  }

  // Info Icon Click & Keyboard Nav
  document.addEventListener('click', (e) => {
    const icon = e.target.closest('.info-icon');
    if (icon) {
      const termId = icon.getAttribute('data-term');
      if (termId) {
        // Open Help Modal highlighting term
        openHelpModal(termId);
      }
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const icon = document.activeElement;
      if (icon && icon.classList.contains('info-icon')) {
        e.preventDefault();
        const termId = icon.getAttribute('data-term');
        if (termId) openHelpModal(termId);
      }
    }
    if (e.key === 'Escape') {
      closeHelpModal();
    }
  });

  // Search Filters
  const modalSearch = document.getElementById('modal-help-search');
  if (modalSearch) {
    modalSearch.addEventListener('input', (e) => {
      const activePill = document.querySelector('#modal-glossary-category-pills .category-pill.active');
      const cat = activePill ? activePill.getAttribute('data-category') : 'all';
      renderGlossaryCards(cat, e.target.value);
    });
  }

  const mainSearch = document.getElementById('glossary-search-input');
  if (mainSearch) {
    mainSearch.addEventListener('input', (e) => {
      renderGlossaryCards('all', e.target.value);
    });
  }

  // Category Pills (Modal & Page)
  const bindPills = (containerId) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.addEventListener('click', (e) => {
      const pill = e.target.closest('.category-pill');
      if (!pill) return;

      container.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const cat = pill.getAttribute('data-category');
      const searchInput = document.getElementById('modal-help-search') || document.getElementById('glossary-search-input');
      const query = searchInput ? searchInput.value : '';
      renderGlossaryCards(cat, query);
    });
  };

  bindPills('modal-glossary-category-pills');
  bindPills('glossary-category-pills');
}

// ==========================================================================
// ACCORDION PANELS & MOBILE SUMMARY BAR LOGIC
// ==========================================================================

function setupAccordionHandlers() {
  const container = document.querySelector('.accordion-container');
  if (container && container.dataset.accordionBound !== 'true') {
    container.dataset.accordionBound = 'true';
    container.addEventListener('click', (e) => {
      const header = e.target.closest('.accordion-header');
      if (!header) return;

      const group = header.closest('.accordion-group');
      if (group) {
        const isOpen = group.classList.contains('open');
        if (isOpen) {
          group.classList.remove('open');
          header.setAttribute('aria-expanded', 'false');
        } else {
          group.classList.add('open');
          header.setAttribute('aria-expanded', 'true');
        }
      }
    });
  }

  const btnJumpChart = document.getElementById('btn-mobile-jump-chart');
  if (btnJumpChart && btnJumpChart.dataset.bound !== 'true') {
    btnJumpChart.dataset.bound = 'true';
    btnJumpChart.addEventListener('click', () => {
      const chartSection = document.querySelector('.chart-panel') || document.getElementById('payoff-chart');
      if (chartSection) {
        chartSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}

function updateAccordionSummaries() {
  const badgeLoan = document.getElementById('badge-summary-loan');
  const badgeArm = document.getElementById('badge-summary-arm');
  const badgeBudget = document.getElementById('badge-summary-budget');
  const badgePayoff = document.getElementById('badge-summary-payoff');

  const homePrice = parseFloat(elHomePrice.value) || 0;
  const rate = parseFloat(elInterestRate.value) || 0;
  const term = parseInt(elLoanTerm.value, 10) || 30;

  const activePresetBtn = document.querySelector('.btn-preset.active');
  const presetType = activePresetBtn ? activePresetBtn.getAttribute('data-preset') : '';

  if (badgeLoan) {
    const formattedPrice = homePrice >= 1000000 ? `$${(homePrice / 1000000).toFixed(2)}M` : `$${Math.round(homePrice / 1000)}k`;
    let typeLabel = `${term}Y Fixed`;
    if (presetType && presetType.includes('arm')) {
      typeLabel = `${presetType.replace('-arm', '/1')} ARM`;
    }
    badgeLoan.textContent = `${formattedPrice} | ${typeLabel} @ ${rate}%`;
  }

  if (badgeArm) {
    const fixedYrs = parseInt(document.getElementById('arm-fixed-term')?.value, 10) || 5;
    const resetRate = parseFloat(document.getElementById('arm-adjusted-rate')?.value) || 7.5;
    badgeArm.textContent = `Fixed ${fixedYrs}Y @ ${rate}% → Reset ${resetRate}%`;
  }

  if (badgeBudget) {
    const salary = parseFloat(elTakeHomeSalary.value) || 0;
    const exp = parseFloat(elMonthlyExpenses.value) || 0;
    const fmtSalary = salary >= 1000 ? `$${(salary / 1000).toFixed(1)}k` : `$${salary}`;
    const fmtExp = exp >= 1000 ? `$${(exp / 1000).toFixed(1)}k` : `$${exp}`;
    badgeBudget.textContent = `${fmtSalary} Salary | ${fmtExp} Exp`;
  }

  if (badgePayoff) {
    const extraMo = parseFloat(elExtraMonthly.value) || 0;
    const oneTime = parseFloat(elOneTimeExtra.value) || 0;
    const parts = [];
    if (extraMo > 0) parts.push(`+$${extraMo}/mo`);
    if (oneTime > 0) parts.push(`$${oneTime >= 1000 ? (oneTime / 1000).toFixed(0) + 'k' : oneTime} Lump`);
    badgePayoff.textContent = parts.length > 0 ? parts.join(' | ') : '$0 Extra';
  }
}

function updateMobileSummaryBar(monthlyPiti, termStr, netCashFlow, interestPaid, interestSaved, extraMonthly) {
  const elMobilePiti = document.getElementById('mobile-kpi-piti');
  const elMobileTerm = document.getElementById('mobile-kpi-term');
  const elMobileCashflow = document.getElementById('mobile-kpi-cashflow');
  const elMobileInterestPaid = document.getElementById('mobile-kpi-interest-paid');
  const elMobileInterestSaved = document.getElementById('mobile-kpi-interest-saved');
  const elMobileExtraMonthly = document.getElementById('mobile-kpi-extra-monthly');

  if (elMobilePiti) elMobilePiti.textContent = formatCurrency(monthlyPiti);
  if (elMobileTerm) elMobileTerm.textContent = termStr || '0 Mos';
  if (elMobileCashflow) {
    elMobileCashflow.textContent = formatCurrency(netCashFlow);
    if (netCashFlow >= 0) {
      elMobileCashflow.className = 'mobile-metric-val success';
    } else {
      elMobileCashflow.className = 'mobile-metric-val danger';
    }
  }
  if (elMobileInterestPaid) {
    elMobileInterestPaid.textContent = formatCurrency(interestPaid || 0);
    elMobileInterestPaid.className = 'mobile-metric-val warning';
  }
  if (elMobileInterestSaved) {
    elMobileInterestSaved.textContent = formatCurrency(interestSaved || 0);
    if ((interestSaved || 0) > 0) {
      elMobileInterestSaved.className = 'mobile-metric-val success';
    } else {
      elMobileInterestSaved.className = 'mobile-metric-val';
    }
  }
  if (elMobileExtraMonthly) {
    const extraVal = extraMonthly || 0;
    elMobileExtraMonthly.textContent = extraVal > 0 ? `+${formatCurrency(extraVal)}/mo` : '$0/mo';
  }
}

// ==========================================================================
// APPLICATION INITIALIZATION
// ==========================================================================

function renderOneTimePaymentsList() {
  const listContainer = document.getElementById('onetime-payments-list');
  const countBadge = document.getElementById('onetime-list-count');
  const totalValEl = document.getElementById('modal-onetime-total-val');
  const mainInputEl = document.getElementById('one-time-extra');

  // Sort by month ascending
  scheduledOneTimePayments.sort((a, b) => a.month - b.month);

  const totalSum = getTotalLumpSumAmount(scheduledOneTimePayments);

  if (mainInputEl) mainInputEl.value = totalSum;
  if (totalValEl) totalValEl.textContent = formatCurrency(totalSum);
  if (countBadge) {
    countBadge.textContent = `${scheduledOneTimePayments.length} Payment${scheduledOneTimePayments.length === 1 ? '' : 's'}`;
  }

  if (!listContainer) return;

  if (scheduledOneTimePayments.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-onetime-state">
        <i class="fa-solid fa-calendar-minus" style="font-size: 1.5rem; margin-bottom: 6px; display: block;"></i>
        No one-time extra payments scheduled. Use the form above to add one!
      </div>
    `;
    return;
  }

  listContainer.innerHTML = scheduledOneTimePayments.map(item => {
    const yr = Math.floor((item.month - 1) / 12) + 1;
    const moRem = ((item.month - 1) % 12) + 1;
    const timeLabel = `Month ${item.month} (Yr ${yr}${moRem > 1 ? `, Mo ${moRem}` : ''})`;

    return `
      <div class="onetime-payment-row">
        <div class="onetime-payment-info">
          <span class="onetime-month-pill">${timeLabel}</span>
          <strong class="onetime-amount-val">${formatCurrency(item.amount)}</strong>
        </div>
        <button type="button" class="btn-delete-onetime" data-id="${item.id}" title="Remove payment">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `;
  }).join('');
}

let isOneTimePaymentsHandlersInitialized = false;

function setupOneTimePaymentsHandlers() {
  if (isOneTimePaymentsHandlersInitialized) return;
  isOneTimePaymentsHandlersInitialized = true;

  const btnManage = document.getElementById('btn-manage-onetime');
  const inputDisplay = document.getElementById('one-time-extra');
  const modal = document.getElementById('modal-onetime-payments');
  const btnCloseX = document.getElementById('btn-x-close-onetime');
  const btnClose = document.getElementById('btn-close-onetime-modal');
  const btnAdd = document.getElementById('btn-add-onetime-item');
  const inputAddAmount = document.getElementById('input-add-onetime-amount');
  const inputAddMonth = document.getElementById('input-add-onetime-month');
  const hintYear = document.getElementById('add-onetime-year-hint');
  const listContainer = document.getElementById('onetime-payments-list');

  const openModal = () => {
    if (modal) {
      modal.style.display = 'flex';
      renderOneTimePaymentsList();
    }
  };

  const closeModal = () => {
    if (modal) modal.style.display = 'none';
  };

  if (btnManage) btnManage.addEventListener('click', openModal);
  if (inputDisplay) inputDisplay.addEventListener('click', openModal);
  if (btnCloseX) btnCloseX.addEventListener('click', closeModal);
  if (btnClose) btnClose.addEventListener('click', closeModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  if (inputAddMonth && hintYear) {
    const updateYearHint = () => {
      const m = parseInt(inputAddMonth.value) || 1;
      const yr = Math.floor((m - 1) / 12) + 1;
      const moRem = ((m - 1) % 12) + 1;
      hintYear.textContent = moRem === 12 ? `(Yr ${yr})` : `(Yr ${yr}, Mo ${moRem})`;
    };
    inputAddMonth.addEventListener('input', updateYearHint);
    updateYearHint();
  }

  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      const amount = parseFloat(inputAddAmount ? inputAddAmount.value : 0) || 0;
      const month = parseInt(inputAddMonth ? inputAddMonth.value : 1) || 1;

      if (amount <= 0) return;

      scheduledOneTimePayments.push({
        id: Date.now().toString() + Math.random().toString().slice(2, 6),
        amount: amount,
        month: month
      });

      scheduledOneTimePayments.sort((a, b) => a.month - b.month);

      renderOneTimePaymentsList();
      recalculate();
    });
  }

  if (listContainer) {
    listContainer.addEventListener('click', (e) => {
      const btnDelete = e.target.closest('.btn-delete-onetime');
      if (!btnDelete) return;

      const idToDelete = btnDelete.getAttribute('data-id');
      scheduledOneTimePayments = scheduledOneTimePayments.filter(p => p.id !== idToDelete);

      renderOneTimePaymentsList();
      recalculate();
    });
  }
}

function getScheduledOneTimePayments() {
  return scheduledOneTimePayments;
}

function setScheduledOneTimePayments(payments) {
  scheduledOneTimePayments = payments || [];
  renderOneTimePaymentsList();
}

function init() {
  // Initialize theme and simple mode settings from saved preference or defaults
  setTheme(getInitialTheme());
  setSimpleMode(getInitialMode());

  // Set up range limits dynamic maxes
  const initialPrice = parseFloat(elHomePrice.value) || 450000;
  elDownPaymentSlider.max = initialPrice;
  elClosingCostsSlider.max = Math.max(100000, Math.round(initialPrice * 0.1));

  // Initialize event handlers
  setupEventHandlers();
  setupHelpHandlers();
  setupAccordionHandlers();
  setupOneTimePaymentsHandlers();

  // Restore saved scenarios list and last active session state
  restoreCurrentState();
  renderScenarioOptions();

  // Set up initial target principal to match initial loan principal
  const initialDp = parseFloat(elDownPayment.value) || 90000;
  elTargetPrincipal.value = (parseFloat(elHomePrice.value) || initialPrice) - initialDp;

  // Run initial calculations
  recalculate();
}

// Start application
if (typeof window !== 'undefined' && !window.__TEST_ENVIRONMENT__) {
  window.addEventListener('DOMContentLoaded', init);
}

function getActiveZoomPreset() {
  return activeZoomPreset;
}

// Export functions for testing
export {
  calculateMonthlyPayment,
  calculateAmortizationSchedules,
  formatCurrency,
  init,
  recalculate,
  saveScenario,
  duplicateScenario,
  loadScenario,
  deleteScenario,
  getSavedScenarios,
  restoreCurrentState,
  resetToDefaults,
  updateFieldModifiedIndicators,
  resetSingleFieldToDefault,
  getDefaultValueForField,
  DEFAULT_INPUT_VALUES,
  DEFAULT_PRESET_RATES,
  NON_RESETTABLE_FIELDS,
  getInitialTheme,
  setTheme,
  toggleTheme,
  getInitialMode,
  setSimpleMode,
  toggleSimpleMode,
  STORAGE_KEYS,
  GLOSSARY_TERMS,
  renderGlossaryCards,
  openHelpModal,
  closeHelpModal,
  setupHelpHandlers,
  setZoomPreset,
  getActiveZoomPreset,
  setChartViewPreset,
  getActiveChartView,
  getActiveChartViews,
  setupAccordionHandlers,
  updateAccordionSummaries,
  updateMobileSummaryBar,
  setupOneTimePaymentsHandlers,
  renderOneTimePaymentsList,
  getScheduledOneTimePayments,
  setScheduledOneTimePayments,
  toggleCompareMode,
  renderCompareControls,
  getCompareMode,
  getCompareSelectedIds,
  setCompareSelectedIds,
  getMaxCompareCount,
  openCompareModal,
  closeCompareModal,
  renderCompareMatrix
};
