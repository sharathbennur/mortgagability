// ==========================================================================
// MORTGAGE-ABILITY.COM KPI CARDS & DASHBOARD UI COMPONENT
// ==========================================================================

import { formatCurrency } from '../formatters.js';

let pitiDonutChartInstance = null;

export function updatePmiAlertBanner(monthlyPmi, onSet20PercentDown) {
  const container = document.getElementById('pmi-alert-container');
  if (!container) return;

  const elHp = document.getElementById('home-price');
  const elDp = document.getElementById('down-payment');
  const elDpPct = document.getElementById('down-payment-percent');

  const homePrice = parseFloat(elHp ? elHp.value : 0) || 450000;
  const downPayment = parseFloat(elDp ? elDp.value : 0) || 90000;
  const downPaymentPct = parseFloat(elDpPct ? elDpPct.value : 0) || 20;

  const target20Amt = Math.round(homePrice * 0.20);
  const shortfall = Math.max(0, target20Amt - downPayment);

  if (downPaymentPct < 20.0 || downPayment < target20Amt) {
    const formattedShortfall = formatCurrency(shortfall);
    const formattedMonthlyPmi = formatCurrency(monthlyPmi);
    const formattedTarget20 = formatCurrency(target20Amt);

    container.innerHTML = `
      <div class="pmi-alert-content warning">
        <div class="pmi-alert-header">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <span><strong>PMI Required</strong> (&lt; 20% Down Payment)</span>
        </div>
        <div class="pmi-alert-body">
          Adds <strong>${formattedMonthlyPmi}/mo</strong> in Private Mortgage Insurance until 80% LTV is reached. Add <strong>${formattedShortfall}</strong> more down payment to eliminate PMI.
        </div>
        <button type="button" class="btn-set-20-dp" id="btn-set-20-dp" title="Set down payment to 20% to eliminate PMI">
          <i class="fa-solid fa-arrow-up"></i> Set Down Payment to 20% (${formattedTarget20})
        </button>
      </div>
    `;
    container.style.display = 'block';

    const btnSet20 = document.getElementById('btn-set-20-dp');
    if (btnSet20 && typeof onSet20PercentDown === 'function') {
      btnSet20.addEventListener('click', onSet20PercentDown);
    }
  } else {
    container.innerHTML = `
      <div class="pmi-alert-content success">
        <div class="pmi-alert-header">
          <i class="fa-solid fa-circle-check"></i>
          <span><strong>20%+ Down Payment: PMI Waived!</strong></span>
        </div>
        <div class="pmi-alert-body">
          You save upfront lender insurance fees (~0.5%/yr of loan principal).
        </div>
      </div>
    `;
    container.style.display = 'block';
  }
}

export function renderPitiDonutChart(pi, tax, ins, pmi = 0) {
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
    // Graceful fallback for environments without canvas context
  }

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

export function updateMobileSummaryBar(monthlyPiti, termStr, netCashFlow, interestPaid, interestSaved, extraMonthly) {
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
