// ==========================================================================
// MORTGAGE-ABILITY.COM CHART VISUALIZER COMPONENT
// ==========================================================================

import { COMPARE_SCENARIO_COLORS } from '../constants.js';
import { getSavedScenarios } from '../features/scenarios.js';
import { calculateAmortizationSchedules } from '../core/calculations.js';
import {
  getChartInstance,
  setChartInstance,
  getActiveZoomPreset,
  getActiveChartViews,
  getIsCompareMode,
  getCompareSelectedIds,
  getMaxCompareCount,
  isMobileViewport
} from '../core/state.js';

export function renderCompareControls(onCompareSelectionChange) {
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
        const btnSaveModal = document.getElementById('btn-save-scenario');
        if (btnSaveModal) btnSaveModal.click();
      });
    }
    if (countBadge) countBadge.textContent = `0 / ${maxAllowed} selected`;
    return;
  }

  let selectedIds = getCompareSelectedIds();
  if (selectedIds.length > maxAllowed) {
    selectedIds = selectedIds.slice(0, maxAllowed);
  }

  chipsGrid.innerHTML = '';
  const isLimitReached = selectedIds.length >= maxAllowed;

  savedScenarios.forEach((scen, idx) => {
    const isSelected = selectedIds.includes(scen.id);
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

    chipEl.addEventListener('click', () => {
      if (isChipDisabled && !isSelected) return;

      let currentIds = getCompareSelectedIds();
      if (isSelected) {
        currentIds = currentIds.filter(id => id !== scen.id);
      } else {
        if (currentIds.length < maxAllowed) {
          currentIds.push(scen.id);
        }
      }
      if (typeof onCompareSelectionChange === 'function') {
        onCompareSelectionChange(currentIds);
      }
    });

    chipsGrid.appendChild(chipEl);
  });

  if (countBadge) {
    countBadge.textContent = `${selectedIds.length} / ${maxAllowed} selected`;
  }
}

export function renderChart(currentSchedule) {
  const chartCanvas = document.getElementById('payoff-chart');
  if (!chartCanvas || typeof Chart === 'undefined') return;
  const ctx = chartCanvas.getContext('2d');

  let instance = getChartInstance();
  if (instance) {
    instance.destroy();
  }

  const isLight = typeof document !== 'undefined' && document.documentElement && document.documentElement.getAttribute('data-theme') === 'light';
  const chartTextColor = isLight ? '#334155' : '#f3f4f6';
  const chartMutedColor = isLight ? '#64748b' : '#9ca3af';
  const chartGridColor = isLight ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.05)';

  const schedule = currentSchedule || { standard: [], accelerated: [], summary: {} };
  const standardData = schedule.standard || [];
  const acceleratedData = schedule.accelerated || [];
  const summary = schedule.summary || {};

  const fullMaxMonths = Math.max(standardData.length, acceleratedData.length, 12);
  const activeZoomPreset = getActiveZoomPreset();

  let targetMaxMonths = fullMaxMonths;
  if (activeZoomPreset === '5Y') targetMaxMonths = Math.min(60, fullMaxMonths);
  else if (activeZoomPreset === '10Y') targetMaxMonths = Math.min(120, fullMaxMonths);
  else if (activeZoomPreset === '15Y') targetMaxMonths = Math.min(180, fullMaxMonths);

  const activeChartViews = getActiveChartViews();
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

  const newChart = new Chart(ctx, {
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

  setChartInstance(newChart);
}
