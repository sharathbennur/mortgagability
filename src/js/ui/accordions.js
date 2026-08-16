// ==========================================================================
// MORTGAGE-ABILITY.COM ACCORDION COMPONENT
// ==========================================================================

export function setupAccordions() {
  const container = document.getElementById('calculator-accordions');
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

export function updateAccordionSummaries() {
  const badgeLoan = document.getElementById('badge-summary-loan');
  const badgeArm = document.getElementById('badge-summary-arm');
  const badgeBudget = document.getElementById('badge-summary-budget');
  const badgePayoff = document.getElementById('badge-summary-payoff');

  const elHomePrice = document.getElementById('home-price');
  const elInterestRate = document.getElementById('interest-rate');
  const elLoanTerm = document.getElementById('loan-term');
  const elTakeHomeSalary = document.getElementById('take-home-salary');
  const elMonthlyExpenses = document.getElementById('monthly-expenses');
  const elExtraMonthly = document.getElementById('extra-monthly');
  const elOneTimeExtra = document.getElementById('one-time-extra');

  const homePrice = parseFloat(elHomePrice ? elHomePrice.value : 0) || 0;
  const rate = parseFloat(elInterestRate ? elInterestRate.value : 0) || 0;
  const term = parseInt(elLoanTerm ? elLoanTerm.value : 30, 10) || 30;

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
    const salary = parseFloat(elTakeHomeSalary ? elTakeHomeSalary.value : 0) || 0;
    const exp = parseFloat(elMonthlyExpenses ? elMonthlyExpenses.value : 0) || 0;
    const fmtSalary = salary >= 1000 ? `$${(salary / 1000).toFixed(1)}k` : `$${salary}`;
    const fmtExp = exp >= 1000 ? `$${(exp / 1000).toFixed(1)}k` : `$${exp}`;
    badgeBudget.textContent = `${fmtSalary} Salary | ${fmtExp} Exp`;
  }

  if (badgePayoff) {
    const extraMo = parseFloat(elExtraMonthly ? elExtraMonthly.value : 0) || 0;
    const oneTime = parseFloat(elOneTimeExtra ? elOneTimeExtra.value : 0) || 0;
    const parts = [];
    if (extraMo > 0) parts.push(`+$${extraMo}/mo`);
    if (oneTime > 0) parts.push(`$${oneTime >= 1000 ? (oneTime / 1000).toFixed(0) + 'k' : oneTime} Lump`);
    badgePayoff.textContent = parts.length > 0 ? parts.join(' | ') : '$0 Extra';
  }
}
