// ==========================================================================
// MORTGAGE-ABILTY.COM APPLICATION ENGINE
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
const elOneTimeExtra = document.getElementById('one-time-extra');
const elOneTimeMonth = document.getElementById('one-time-month');
const elPropertyTax = document.getElementById('property-tax');
const elPropertyTaxSlider = document.getElementById('property-tax-slider');
const elHomeInsurance = document.getElementById('home-insurance');
const elHomeInsuranceSlider = document.getElementById('home-insurance-slider');

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

// Scenario & Storage DOM Elements
const elBtnSaveScenario = document.getElementById('btn-save-scenario');
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

// Terms & Disclaimer Modal DOM Elements
const elBtnOpenDisclaimer = document.getElementById('btn-open-disclaimer');
const elModalDisclaimer = document.getElementById('modal-disclaimer');
const elBtnCloseDisclaimer = document.getElementById('btn-close-disclaimer');
const elBtnXCloseDisclaimer = document.getElementById('btn-x-close-disclaimer');

const STORAGE_KEYS = {
  SCENARIOS: 'mortgagability_scenarios',
  CURRENT_STATE: 'mortgagability_current_state'
};

let currentScenarioId = null;

// Loan structure state
let activeLoanPreset = '30-fixed';
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
  armAdjustedRate = 7.5
) {
  const principal = Math.max(0, homePrice - downPayment);
  const initialMonthlyRate = (annualRate / 100) / 12;
  const adjustedMonthlyRate = (armAdjustedRate / 100) / 12;
  const standardTermMonths = termYears * 12;
  const armFixedMonths = Math.min(standardTermMonths, Math.max(1, armFixedYears * 12));

  const baseMonthlyPayment = calculateMonthlyPayment(principal, annualRate, termYears);
  let adjustedMonthlyPayment = baseMonthlyPayment;

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
    let appliedExtra = extraMonthly;
    if (m === oneTimeMonth) {
      appliedExtra += oneTimeExtra;
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
      cumulativeInterest: accTotalInterest
    });

    accBalance = endingBalance;
    m++;
  }

  // Calculate summaries
  const stdTotalPaid = principal + stdTotalInterest;
  const accTotalPaid = principal + accTotalInterest;
  const interestSaved = Math.max(0, stdTotalInterest - accTotalInterest);
  
  const stdMonths = standardSchedule.length;
  const accMonths = acceleratedSchedule.length;
  const monthsSaved = Math.max(0, stdMonths - accMonths);

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
      standardTotalInterest: stdTotalInterest,
      standardTotalPaid: stdTotalPaid,
      acceleratedTotalInterest: accTotalInterest,
      acceleratedTotalPaid: accTotalPaid,
      interestSaved: interestSaved,
      standardMonths: stdMonths,
      acceleratedMonths: accMonths,
      monthsSaved: monthsSaved
    }
  };
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

  // Base payment and total payment (including extra monthly, tax, and insurance)
  const homePrice = parseFloat(elHomePrice.value) || 0;
  const propTaxRate = parseFloat(elPropertyTax.value) || 0;
  const insRate = parseFloat(elHomeInsurance.value) || 0;
  
  const monthlyTax = (homePrice * (propTaxRate / 100)) / 12;
  const monthlyInsurance = (homePrice * (insRate / 100)) / 12;
  
  const standardPITI = summary.baseMonthlyPayment + monthlyTax + monthlyInsurance;
  elKpiStandardPayment.textContent = formatCurrency(standardPITI);
  
  const totalMonthlyPITIWithExtra = standardPITI + parseFloat(elExtraMonthly.value || 0);
  elKpiTotalPayment.textContent = formatCurrency(totalMonthlyPITIWithExtra);

  // Update breakdown values
  elBreakdownPi.textContent = formatCurrency(summary.baseMonthlyPayment);
  elBreakdownTax.textContent = formatCurrency(monthlyTax);
  elBreakdownIns.textContent = formatCurrency(monthlyInsurance);

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
  
  elKpiNetCashFlow.textContent = formatCurrency(netCashFlow);
  
  const dti = takeHome > 0 ? ((totalMonthlyPITIWithExtra + expenses) / takeHome) * 100 : 0;
  elKpiDtiRatio.textContent = `${dti.toFixed(1)}%`;
  
  // Color code Cash Flow card based on affordability
  if (netCashFlow < 0) {
    elKpiCashFlowCard.className = "kpi-card danger";
  } else {
    elKpiCashFlowCard.className = "kpi-card success";
  }

  // Interest saved and paid
  elKpiInterestSaved.textContent = formatCurrency(summary.interestSaved);
  elKpiInterestPaid.textContent = formatCurrency(summary.acceleratedTotalInterest);
  elKpiStandardInterestPaid.textContent = formatCurrency(summary.standardTotalInterest);
  
  const savingsRate = summary.standardTotalInterest > 0 
    ? (summary.interestSaved / summary.standardTotalInterest) * 100 
    : 0;
  elKpiInterestSavingsRate.textContent = `${savingsRate.toFixed(1)}%`;

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

  // Re-render chart and table
  renderChart();
  renderTable();
}

/**
 * Renders the Chart.js visualizer.
 */
function renderChart() {
  const ctx = document.getElementById('payoff-chart').getContext('2d');
  
  // If chart exists, destroy it to refresh completely
  if (chartInstance) {
    chartInstance.destroy();
  }

  const standardData = currentSchedule.standard;
  const acceleratedData = currentSchedule.accelerated;

  const maxMonths = Math.max(standardData.length, acceleratedData.length);
  const labels = [];
  
  const standardBalanceDataset = [];
  const acceleratedBalanceDataset = [];
  const standardInterestDataset = [];
  const acceleratedInterestDataset = [];

  const today = new Date();
  const startYear = today.getFullYear();
  const startMonth = today.getMonth() + 1; // 0-indexed + 1 = next month

  for (let m = 0; m <= maxMonths; m += Math.max(1, Math.round(maxMonths / 30))) {
    const date = new Date(startYear, startMonth + m, 1);
    const label = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    labels.push(label);

    // Standard Schedule Data points
    const stdPoint = standardData.find(item => item.month === m) || 
                     (m > standardData.length ? standardData[standardData.length - 1] : null);
    
    if (stdPoint) {
      standardBalanceDataset.push(stdPoint.endingBalance);
      standardInterestDataset.push(stdPoint.cumulativeInterest);
    } else if (m === 0) {
      standardBalanceDataset.push(currentSchedule.summary.principal);
      standardInterestDataset.push(0);
    } else {
      standardBalanceDataset.push(0);
      standardInterestDataset.push(currentSchedule.summary.standardTotalInterest);
    }

    // Accelerated Schedule Data points
    const accPoint = acceleratedData.find(item => item.month === m) ||
                     (m > acceleratedData.length ? acceleratedData[acceleratedData.length - 1] : null);

    if (accPoint) {
      acceleratedBalanceDataset.push(accPoint.endingBalance);
      acceleratedInterestDataset.push(accPoint.cumulativeInterest);
    } else if (m === 0) {
      acceleratedBalanceDataset.push(currentSchedule.summary.principal);
      acceleratedInterestDataset.push(0);
    } else {
      acceleratedBalanceDataset.push(0);
      acceleratedInterestDataset.push(currentSchedule.summary.acceleratedTotalInterest);
    }
  }

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Accelerated Principal Balance',
          data: acceleratedBalanceDataset,
          borderColor: '#10b981', // Emerald
          backgroundColor: 'transparent',
          fill: false,
          tension: 0.25,
          borderWidth: 3,
          pointRadius: 0,
          pointHoverRadius: 5
        },
        {
          label: 'Standard Principal Balance',
          data: standardBalanceDataset,
          borderColor: '#6366f1', // Indigo
          backgroundColor: 'transparent',
          fill: false,
          tension: 0.25,
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0,
          pointHoverRadius: 4
        },
        {
          label: 'Accelerated Cumulative Interest',
          data: acceleratedInterestDataset,
          borderColor: '#fbbf24', // Amber
          backgroundColor: 'transparent',
          fill: false,
          tension: 0.25,
          borderWidth: 3,
          pointRadius: 0,
          pointHoverRadius: 5
        },
        {
          label: 'Standard Cumulative Interest',
          data: standardInterestDataset,
          borderColor: '#f43f5e', // Rose
          backgroundColor: 'transparent',
          fill: false,
          tension: 0.25,
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0,
          pointHoverRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#f3f4f6',
            font: {
              family: 'Plus Jakarta Sans',
              size: 11
            }
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += formatCurrency(context.parsed.y);
              }
              return label;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.05)'
          },
          ticks: {
            color: '#9ca3af',
            font: {
              family: 'Plus Jakarta Sans',
              size: 10
            }
          }
        },
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.05)'
          },
          ticks: {
            color: '#9ca3af',
            font: {
              family: 'Plus Jakarta Sans',
              size: 10
            },
            callback: function(value) {
              return '$' + value.toLocaleString();
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
  return {
    homePrice: parseFloat(elHomePrice.value) || 0,
    downPayment: parseFloat(elDownPayment.value) || 0,
    downPaymentPercent: parseFloat(elDownPaymentPercent.value) || 0,
    closingCosts: parseFloat(elClosingCosts.value) || 0,
    closingCostsPercent: parseFloat(elClosingCostsPercent.value) || 0,
    interestRate: parseFloat(elInterestRate.value) || 0,
    loanTerm: parseFloat(elLoanTerm.value) || 30,
    extraMonthly: parseFloat(elExtraMonthly.value) || 0,
    oneTimeExtra: parseFloat(elOneTimeExtra.value) || 0,
    oneTimeMonth: parseInt(elOneTimeMonth.value) || 1,
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
  if (state.interestRate !== undefined) {
    elInterestRate.value = state.interestRate;
    elInterestSlider.value = state.interestRate;
  }
  if (state.loanTerm !== undefined) {
    elLoanTerm.value = state.loanTerm;
    elTermSlider.value = state.loanTerm;
  }
  if (state.extraMonthly !== undefined) {
    elExtraMonthly.value = state.extraMonthly;
    elExtraMonthlySlider.value = state.extraMonthly;
  }
  if (state.oneTimeExtra !== undefined) elOneTimeExtra.value = state.oneTimeExtra;
  if (state.oneTimeMonth !== undefined) elOneTimeMonth.value = state.oneTimeMonth;
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

  if (elArmSettingsPanel) {
    const isArm = isArmLoan || (activeLoanPreset && activeLoanPreset.endsWith('-arm'));
    elArmSettingsPanel.style.display = isArm ? 'flex' : 'none';
  }

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

  updateScenarioCommentsBanner(activeScenObj);
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

// ==========================================================================
// DYNAMIC SYNCING & EVENT HANDLERS
// ==========================================================================

function recalculate() {
  const homePrice = parseFloat(elHomePrice.value) || 0;
  const downPayment = parseFloat(elDownPayment.value) || 0;
  const interestRate = parseFloat(elInterestRate.value) || 0;
  const termYears = parseFloat(elLoanTerm.value) || 30;
  const extraMonthly = parseFloat(elExtraMonthly.value) || 0;
  const oneTimeExtra = parseFloat(elOneTimeExtra.value) || 0;
  const oneTimeMonth = parseInt(elOneTimeMonth.value) || 1;

  const isArm = isArmLoan || activeLoanPreset.endsWith('-arm');
  const armFixedYears = parseFloat(elArmFixedTerm ? elArmFixedTerm.value : 5) || 5;
  const armAdjustedRate = parseFloat(elArmAdjustedRate ? elArmAdjustedRate.value : 7.5) || 7.5;

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
    armAdjustedRate
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

function setupEventHandlers() {
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
      presetButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const preset = btn.getAttribute('data-preset');
      activeLoanPreset = preset;

      if (preset === '30-fixed') {
        isArmLoan = false;
        elLoanTerm.value = 30;
        elTermSlider.value = 30;
        if (elArmSettingsPanel) elArmSettingsPanel.style.display = 'none';
        if (elLabelInterestRate) elLabelInterestRate.textContent = 'Interest Rate';
      } else if (preset === '15-fixed') {
        isArmLoan = false;
        elLoanTerm.value = 15;
        elTermSlider.value = 15;
        if (elArmSettingsPanel) elArmSettingsPanel.style.display = 'none';
        if (elLabelInterestRate) elLabelInterestRate.textContent = 'Interest Rate';
      } else if (preset === '5-arm') {
        isArmLoan = true;
        elLoanTerm.value = 30;
        elTermSlider.value = 30;
        if (elArmFixedTerm && elArmFixedTermSlider) {
          elArmFixedTerm.value = 5;
          elArmFixedTermSlider.value = 5;
        }
        if (elArmSettingsPanel) elArmSettingsPanel.style.display = 'flex';
        if (elLabelInterestRate) elLabelInterestRate.textContent = 'Initial Rate';
      } else if (preset === '7-arm') {
        isArmLoan = true;
        elLoanTerm.value = 30;
        elTermSlider.value = 30;
        if (elArmFixedTerm && elArmFixedTermSlider) {
          elArmFixedTerm.value = 7;
          elArmFixedTermSlider.value = 7;
        }
        if (elArmSettingsPanel) elArmSettingsPanel.style.display = 'flex';
        if (elLabelInterestRate) elLabelInterestRate.textContent = 'Initial Rate';
      } else if (preset === '10-arm') {
        isArmLoan = true;
        elLoanTerm.value = 30;
        elTermSlider.value = 30;
        if (elArmFixedTerm && elArmFixedTermSlider) {
          elArmFixedTerm.value = 10;
          elArmFixedTermSlider.value = 10;
        }
        if (elArmSettingsPanel) elArmSettingsPanel.style.display = 'flex';
        if (elLabelInterestRate) elLabelInterestRate.textContent = 'Initial Rate';
      } else if (preset === 'custom') {
        if (elArmSettingsPanel) elArmSettingsPanel.style.display = isArmLoan ? 'flex' : 'none';
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
  linkSliderAndInput(elInterestRate, elInterestSlider);

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
  elOneTimeExtra.addEventListener('input', recalculate);
  elOneTimeMonth.addEventListener('input', recalculate);



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
}

// ==========================================================================
// APPLICATION INITIALIZATION
// ==========================================================================

function init() {
  // Set up range limits dynamic maxes
  const initialPrice = parseFloat(elHomePrice.value) || 450000;
  elDownPaymentSlider.max = initialPrice;
  elClosingCostsSlider.max = Math.max(100000, Math.round(initialPrice * 0.1));

  // Initialize event handlers
  setupEventHandlers();

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

// Export functions for testing
export {
  calculateMonthlyPayment,
  calculateAmortizationSchedules,
  formatCurrency,
  init,
  recalculate,
  saveScenario,
  loadScenario,
  deleteScenario,
  getSavedScenarios,
  restoreCurrentState,
  STORAGE_KEYS
};
