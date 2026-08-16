// ==========================================================================
// MORTGAGE-ABILITY.COM SCENARIOS & COMPARISON ENGINE
// ==========================================================================

import { STORAGE_KEYS, DEFAULT_PRESET_RATES } from '../constants.js';
import { formatCurrency } from '../formatters.js';
import { calculateAmortizationSchedules } from '../core/calculations.js';
import {
  setScheduledOneTimePayments,
  renderOneTimePaymentsList
} from './payoff-simulator.js';

let compareModalSelectedIds = [];

export function getSavedScenarios() {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_KEYS.SCENARIOS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load scenarios from localStorage:", e);
    return [];
  }
}

export function saveScenariosToStorage(scenarios) {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.SCENARIOS, JSON.stringify(scenarios));
  } catch (e) {
    console.error("Failed to save scenarios to localStorage:", e);
  }
}

export function autoSaveCurrentState(serializeCurrentStateFn) {
  try {
    if (typeof localStorage === 'undefined') return;
    const state = serializeCurrentStateFn();
    localStorage.setItem(STORAGE_KEYS.CURRENT_STATE, JSON.stringify(state));
  } catch (e) {
    // Ignore restricted storage environment errors
  }
}

export function openCompareModal(serializeCurrentStateFn) {
  const modal = document.getElementById('modal-compare-scenarios');
  if (!modal) return;

  const scenarios = getSavedScenarios();
  const currentState = serializeCurrentStateFn();
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

export function closeCompareModal() {
  const modal = document.getElementById('modal-compare-scenarios');
  if (modal) {
    modal.style.display = 'none';
  }
}

export function renderCompareModalChips(allScenarios) {
  const chipsContainer = document.getElementById('compare-selection-chips');
  if (!chipsContainer) return;

  chipsContainer.innerHTML = '';
  allScenarios.forEach((s) => {
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

export function renderCompareMatrix(allScenarios, onLoadScenarioHandler) {
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
  addRow('Loan Principal Amount', d => formatCurrency(d.summary.loanAmount || (d.state.homePrice - d.state.downPayment)));
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
  addRow('Time Saved', d => d.summary.monthsSaved > 0 ? `<span class="text-success fw-bold">${Math.floor(d.summary.monthsSaved / 12)} Yrs ${d.summary.monthsSaved % 12} Mos</span>` : '0 Mos');

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
      if (id && typeof onLoadScenarioHandler === 'function') {
        onLoadScenarioHandler(id);
        closeCompareModal();
      }
    });
  });
}
