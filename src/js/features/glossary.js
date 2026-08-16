// ==========================================================================
// MORTGAGE-ABILITY.COM FINANCIAL GLOSSARY & HELP SYSTEM
// ==========================================================================

export const GLOSSARY_TERMS = {
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
    definition: 'Upfront administrative fees paid at loan origination to lenders, title companies, appraisers, and local governments (typically 2% to 5% of home value).',
    range: '2.0% – 5.0% of home purchase price',
    searchUrl: 'https://www.google.com/search?q=current+average+mortgage+closing+costs',
    searchLabel: 'Search current closing cost rates on Google'
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
    definition: 'The structure of your mortgage. Fixed-rate loans keep the exact same interest rate for 15 or 30 years. Adjustable-rate mortgages (ARMs) feature a fixed initial period before interest rates adjust periodically.',
    range: '30-Yr Fixed: 5.50% – 7.50% | 15-Yr Fixed: 4.75% – 6.75% | ARMs: 5.00% – 7.00%',
    searchUrl: 'https://www.google.com/search?q=current+mortgage+rates+by+loan+type',
    searchLabel: 'Search current rates by loan type on Google'
  },
  'interest-rate': {
    title: 'Interest Rate',
    category: 'loan',
    icon: 'fa-percent',
    definition: 'The annual percentage fee charged by the lender for borrowing the principal loan balance.',
    range: '30-Yr Fixed: 5.50% – 7.50% | 15-Yr Fixed: 4.75% – 6.75% | 5/1 ARM: 5.00% – 7.00%',
    searchUrl: 'https://www.google.com/search?q=current+mortgage+interest+rates',
    searchLabel: 'Search current mortgage interest rates on Google'
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
    definition: 'A mortgage where the interest rate is locked for an initial fixed period (e.g. 5, 7, or 10 years) and subsequently resets periodically based on benchmark market rates.',
    range: 'Initial Fixed Period Rate: 5.00% – 7.00% | Projected Reset Rate: 6.00% – 9.50%',
    searchUrl: 'https://www.google.com/search?q=current+adjustable+rate+mortgage+rates',
    searchLabel: 'Search current ARM rates on Google'
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
    definition: 'The estimated annual interest rate expected to take effect after your initial fixed period ends and your loan rate adjusts to prevailing market levels.',
    range: '6.00% – 9.50% (SOFR Benchmark + Lender Margin with Rate Caps)',
    searchUrl: 'https://www.google.com/search?q=current+ARM+interest+rates+and+SOFR+margin',
    searchLabel: 'Search current ARM reset rates on Google'
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
    definition: 'Annual real estate taxes levied by local municipal or county government as a percentage of property valuation.',
    range: '0.50% – 2.50% of home value annually (US national avg ~1.1%)',
    searchUrl: 'https://www.google.com/search?q=current+average+property+tax+rate+by+state',
    searchLabel: 'Search current property tax rates on Google'
  },
  'home-insurance': {
    title: 'Home Insurance Rate',
    category: 'payment',
    icon: 'fa-shield-halved',
    definition: 'Annual hazard insurance premium protecting your property against damage, expressed as a percentage of home value.',
    range: '0.30% – 1.20% of home value annually (US national avg ~0.5%)',
    searchUrl: 'https://www.google.com/search?q=current+average+homeowner+insurance+rates+by+state',
    searchLabel: 'Search current home insurance rates on Google'
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
    definition: 'Lender protection insurance required when down payment is less than 20%. Automatically cancels once your loan principal reaches 80% of original home value.',
    range: '0.50% – 1.50% of loan balance annually',
    searchUrl: 'https://www.google.com/search?q=current+average+private+mortgage+insurance+rates',
    searchLabel: 'Search current PMI rates on Google'
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

export function renderGlossaryCards(filterCategory = 'all', searchQuery = '') {
  const container = document.getElementById('glossary-cards-container');
  const modalContainer = document.getElementById('modal-glossary-cards-container');
  if (!container && !modalContainer) return;

  const query = searchQuery.trim().toLowerCase();

  const entries = Object.entries(GLOSSARY_TERMS).filter(([id, data]) => {
    const matchesCategory = filterCategory === 'all' || data.category === filterCategory;
    const matchesSearch = !query ||
      data.title.toLowerCase().includes(query) ||
      data.definition.toLowerCase().includes(query) ||
      (data.range && data.range.toLowerCase().includes(query)) ||
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
        <p>${data.definition}</p>
        ${data.range ? `
          <div class="glossary-card-range">
            <i class="fa-solid fa-chart-line"></i>
            <span><strong>Average Realistic Range:</strong> ${data.range}</span>
          </div>
        ` : ''}
        ${data.searchUrl ? `
          <div class="glossary-card-search">
            <a href="${data.searchUrl}" target="_blank" rel="noopener noreferrer" class="glossary-search-link" title="Search current rates on Google in new tab">
              <i class="fa-brands fa-google"></i>
              <span>${data.searchLabel || 'Search current rates on Google'}</span>
              <i class="fa-solid fa-arrow-up-right-from-square external-icon"></i>
            </a>
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');

  if (container) container.innerHTML = html || '<p class="text-muted" style="grid-column: 1/-1; text-align: center; padding: 20px;">No matching financial terms found.</p>';
  if (modalContainer) modalContainer.innerHTML = html || '<p class="text-muted" style="grid-column: 1/-1; text-align: center; padding: 20px;">No matching financial terms found.</p>';
}

export function highlightTermCard(termId) {
  if (!termId) return;

  // Remove existing pulses
  document.querySelectorAll('.term-pulse').forEach(el => el.classList.remove('term-pulse'));

  const cards = document.querySelectorAll(`[data-term-id="${termId}"]`);
  cards.forEach(card => {
    card.classList.add('term-pulse');
    setTimeout(() => card.classList.remove('term-pulse'), 3500);
  });
}

export function openHelpModal(targetTermId = null) {
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

export function closeHelpModal() {
  const modal = document.getElementById('modal-help');
  if (!modal) return;
  modal.style.display = 'none';
  document.body.style.overflow = '';
}

export function setupHelpHandlers() {
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

  // Modal Help Category Pills
  const modalPillsContainer = document.getElementById('modal-glossary-category-pills');
  if (modalPillsContainer) {
    modalPillsContainer.addEventListener('click', (e) => {
      const pill = e.target.closest('.category-pill');
      if (pill) {
        modalPillsContainer.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const category = pill.getAttribute('data-category') || 'all';
        const searchInput = document.getElementById('modal-help-search');
        renderGlossaryCards(category, searchInput ? searchInput.value : '');
      }
    });
  }

  // Modal Help Search Input
  const modalSearchInput = document.getElementById('modal-help-search');
  if (modalSearchInput) {
    modalSearchInput.addEventListener('input', (e) => {
      const activePill = modalPillsContainer ? modalPillsContainer.querySelector('.category-pill.active') : null;
      const category = activePill ? activePill.getAttribute('data-category') : 'all';
      renderGlossaryCards(category, e.target.value);
    });
  }

  // Section Glossary Category Pills
  const sectionPillsContainer = document.getElementById('glossary-category-pills');
  if (sectionPillsContainer) {
    sectionPillsContainer.addEventListener('click', (e) => {
      const pill = e.target.closest('.category-pill');
      if (pill) {
        sectionPillsContainer.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const category = pill.getAttribute('data-category') || 'all';
        const searchInput = document.getElementById('glossary-search');
        renderGlossaryCards(category, searchInput ? searchInput.value : '');
      }
    });
  }

  // Section Glossary Search Input
  const sectionSearchInput = document.getElementById('glossary-search');
  if (sectionSearchInput) {
    sectionSearchInput.addEventListener('input', (e) => {
      const activePill = sectionPillsContainer ? sectionPillsContainer.querySelector('.category-pill.active') : null;
      const category = activePill ? activePill.getAttribute('data-category') : 'all';
      renderGlossaryCards(category, e.target.value);
    });
  }
}
