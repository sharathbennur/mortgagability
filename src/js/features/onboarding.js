// ==========================================================================
// MORTGAGE-ABILITY.COM HYBRID ONBOARDING MODULE (WIZARD + SPOTLIGHT TOUR)
// ==========================================================================

import { STORAGE_KEYS } from '../constants.js';
import { formatCurrency, formatPercent } from '../formatters.js';
import {
  setSimpleMode,
  setIsOnboardingActive,
  getHasSeenOnboarding,
  setHasSeenOnboarding,
  getIsSimpleMode
} from '../core/state.js';
import { GLOSSARY_TERMS } from './glossary.js';

let currentWizardStep = 1;
let currentSpotlightStep = 1;
const TOTAL_WIZARD_STEPS = 5;
const TOTAL_SPOTLIGHT_STEPS = 6;

// Spotlight Step Configuration
const SPOTLIGHT_STEPS = [
  {
    targetId: 'accordion-loan-group',
    title: '1. Your Loan Parameters Inputs',
    text: 'All the data you entered during the onboarding wizard (Home Price, Down Payment, Interest Rate, Term, Taxes & Insurance) has been loaded into these Loan Parameters inputs. You can tweak any value here anytime to instantly recalculate your entire mortgage schedule!'
  },
  {
    targetId: 'kpi-piti-card',
    title: '2. Monthly Payment Breakdown (PITI)',
    text: 'Here is your total monthly housing cost. Notice how the Principal, Interest, Taxes, Insurance, and PMI values you entered in the wizard are combined into one single monthly payment.'
  },
  {
    targetId: 'kpi-interest-paid-card',
    title: '3. Total Lifetime Interest Paid',
    text: 'This card shows the total cumulative dollar amount you will pay purely in interest over the life of your mortgage based on your selected rate and term.'
  },
  {
    targetId: 'chart-panel',
    title: '4. Amortization & Equity Trajectory',
    text: 'This interactive graph visualizes your remaining principal balance trajectory month-by-month as you build home equity over time.'
  },
  {
    targetId: 'table-panel',
    title: '5. Full Amortization Schedule Table',
    text: 'This detailed table breaks down every payment year-by-year or month-by-month. You can toggle views, see exact starting and ending balances, principal vs interest splits, and export your custom schedule to CSV!'
  },
  {
    targetId: 'navbar-utility-actions',
    title: '6. Advanced Mode & Help Glossary',
    text: "You're all set! When you're ready, click Advanced Mode to unlock ARM loan modeling, Monthly Budget & DTI ratios, Extra Payoff Accelerators, Target Term calculators, and Scenario Comparisons. Click any (i) info icon or Help & Glossary anytime!"
  }
];

// Helper to safely get form input values
function getInputValue(id, fallback = '') {
  const el = document.getElementById(id);
  return el ? el.value : fallback;
}

// Helper to safely set main form input values and dispatch input event
function setMainInputValue(id, value) {
  const el = document.getElementById(id);
  if (el) {
    el.value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

// Render Slide Content for Wizard Steps 1–5
function getWizardSlideHTML(step) {
  const homePrice = parseFloat(getInputValue('home-price', '450000')) || 450000;
  const downPayment = parseFloat(getInputValue('down-payment', '90000')) || 90000;
  const interestRate = parseFloat(getInputValue('interest-rate', '6.5')) || 6.5;
  const loanTerm = parseInt(getInputValue('loan-term', '30'), 10) || 30;
  const propertyTax = parseFloat(getInputValue('property-tax', '0.9')) || 0.9;
  const homeInsurance = parseFloat(getInputValue('home-insurance', '0.5')) || 0.5;
  const hoaFee = parseFloat(getInputValue('hoa-fee', '0')) || 0;

  const dpPercent = homePrice > 0 ? ((downPayment / homePrice) * 100).toFixed(1) : '20.0';
  const loanAmount = Math.max(0, homePrice - downPayment);
  const estClosingCosts = homePrice * 0.03;
  const totalUpfrontCash = downPayment + estClosingCosts;

  switch (step) {
    case 1:
      return `
        <div class="wizard-slide">
          <div class="wizard-slide-hero">
            <i class="fa-solid fa-house-laptop"></i>
            <h4>Welcome to Mortgage-Ability!</h4>
            <p>We've automatically activated <strong>Simple Mode</strong> to keep your mortgage calculation focused and clutter-free. Let's enter your loan parameters in 4 quick steps.</p>
          </div>
          <div class="wizard-accordion-card mt-3">
            <details class="wizard-details-accordion">
              <summary class="wizard-details-summary">
                <span><i class="fa-solid fa-circle-info text-primary"></i> What is Simple Mode?</span>
                <i class="fa-solid fa-chevron-down accordion-chevron"></i>
              </summary>
              <div class="wizard-details-content">
                <p>Simple Mode focuses purely on core purchase numbers (Home Price, Down Payment, Rate, Term, Escrow). Advanced features like ARM rate resets, DTI budgets, and extra payoff prepayments can be unlocked in 1-click anytime!</p>
              </div>
            </details>
          </div>
        </div>
      `;

    case 2:
      return `
        <div class="wizard-slide">
          <div class="wizard-input-guidance-grid">
            <div class="wizard-input-col">
              <h5 class="form-section-title"><i class="fa-solid fa-sliders"></i> Purchase & Down Payment</h5>
              <div class="input-group">
                <label for="wiz-home-price">Home Purchase Price ($)</label>
                <div class="input-wrapper prefix">
                  <span class="input-addon">$</span>
                  <input type="number" id="wiz-home-price" value="${homePrice}" min="10000" max="10000000" step="5000">
                </div>
              </div>
              <div class="input-group">
                <label for="wiz-down-payment">Down Payment ($)</label>
                <div class="input-wrapper prefix">
                  <span class="input-addon">$</span>
                  <input type="number" id="wiz-down-payment" value="${downPayment}" min="0" max="${homePrice}" step="1000">
                </div>
              </div>
            </div>

            <div class="wizard-guidance-card">
              <div class="guidance-title"><i class="fa-solid fa-book-open"></i> Financial Definitions & Hints</div>
              <div class="guidance-section">
                <h5>Home Price & Down Payment</h5>
                <p>${GLOSSARY_TERMS['home-price'] ? GLOSSARY_TERMS['home-price'].definition : 'Total agreed sale price of the home.'}</p>
              </div>
              <div class="guidance-section">
                <h5><i class="fa-solid fa-magnifying-glass"></i> How to Collect This Info:</h5>
                <p>Found on your MLS listing sheet, Zillow/Redfin estimate, or real estate agent offer sheet.</p>
              </div>
              <div class="guidance-tip-box">
                <i class="fa-solid fa-shield-halved"></i> <strong>20% PMI Rule:</strong> Down payments under 20% incur Private Mortgage Insurance (PMI). Providing 20%+ eliminates PMI fees!
              </div>
            </div>
          </div>
        </div>
      `;

    case 3:
      return `
        <div class="wizard-slide">
          <div class="wizard-input-guidance-grid">
            <div class="wizard-input-col">
              <h5 class="form-section-title"><i class="fa-solid fa-calendar-days"></i> Rate & Loan Duration</h5>
              <div class="input-group">
                <label for="wiz-interest-rate">Interest Rate (%)</label>
                <div class="input-wrapper suffix">
                  <input type="number" id="wiz-interest-rate" value="${interestRate}" min="0.1" max="25" step="0.125">
                  <span class="input-addon">%</span>
                </div>
              </div>
              <div class="input-group">
                <label>Loan Term (Years)</label>
                <div class="preset-button-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                  <button type="button" class="btn btn-sm ${loanTerm === 30 ? 'btn-primary' : 'btn-outline'} wiz-term-btn" data-term="30">30-Yr Fixed</button>
                  <button type="button" class="btn btn-sm ${loanTerm === 15 ? 'btn-primary' : 'btn-outline'} wiz-term-btn" data-term="15">15-Yr Fixed</button>
                </div>
              </div>
            </div>

            <div class="wizard-guidance-card">
              <div class="guidance-title"><i class="fa-solid fa-book-open"></i> Financial Definitions & Hints</div>
              <div class="guidance-section">
                <h5>Interest Rate & Term</h5>
                <p>${GLOSSARY_TERMS['interest-rate'] ? GLOSSARY_TERMS['interest-rate'].definition : 'Annual percentage fee charged by the lender.'}</p>
              </div>
              <div class="guidance-section">
                <h5><i class="fa-solid fa-magnifying-glass"></i> How to Collect This Info:</h5>
                <p>Found on Page 1, Section 1 of your official lender <strong>Loan Estimate</strong> form or daily mortgage rate sheet.</p>
              </div>
            </div>
          </div>
        </div>
      `;

    case 4:
      return `
        <div class="wizard-slide">
          <div class="wizard-input-guidance-grid">
            <div class="wizard-input-col">
              <h5 class="form-section-title"><i class="fa-solid fa-landmark"></i> Escrow & Property Taxes</h5>
              <div class="input-group">
                <label for="wiz-property-tax">Property Tax Rate (%/yr)</label>
                <div class="input-wrapper suffix">
                  <input type="number" id="wiz-property-tax" value="${propertyTax}" min="0" max="10" step="0.05">
                  <span class="input-addon">%</span>
                </div>
              </div>
              <div class="input-group">
                <label for="wiz-home-insurance">Home Insurance Rate (%/yr)</label>
                <div class="input-wrapper suffix">
                  <input type="number" id="wiz-home-insurance" value="${homeInsurance}" min="0" max="10" step="0.05">
                  <span class="input-addon">%</span>
                </div>
              </div>
            </div>

            <div class="wizard-guidance-card">
              <div class="guidance-title"><i class="fa-solid fa-book-open"></i> Financial Definitions & Hints</div>
              <div class="guidance-section">
                <h5>Property Taxes & Home Insurance</h5>
                <p>Property taxes and home insurance are collected into an escrow account and added directly to your monthly mortgage payment (PITI).</p>
              </div>
              <div class="guidance-section">
                <h5><i class="fa-solid fa-magnifying-glass"></i> How to Collect This Info:</h5>
                <p>Check your local County Tax Assessor database online or ask your home insurance broker for a binder estimate.</p>
              </div>
            </div>
          </div>
        </div>
      `;

    case 5:
      return `
        <div class="wizard-slide">
          <div class="wizard-slide-hero">
            <i class="fa-solid fa-circle-check text-success"></i>
            <h4>Ready to See Your Mortgage Breakdown!</h4>
            <p>Your inputs have been prepared. Here is a summary of your basic home financing parameters before we launch your interactive dashboard tour:</p>
          </div>
          <div class="wizard-recap-grid mt-3">
            <div class="recap-tile">
              <span class="recap-label">Home Purchase Price</span>
              <strong class="recap-val">${formatCurrency(homePrice)}</strong>
            </div>
            <div class="recap-tile">
              <span class="recap-label">Down Payment</span>
              <strong class="recap-val">${formatCurrency(downPayment)} (${dpPercent}%)</strong>
            </div>
            <div class="recap-tile">
              <span class="recap-label">Financed Principal</span>
              <strong class="recap-val">${formatCurrency(loanAmount)}</strong>
            </div>
            <div class="recap-tile">
              <span class="recap-label">Upfront Cash Needed</span>
              <strong class="recap-val text-primary">${formatCurrency(totalUpfrontCash)}</strong>
            </div>
          </div>
        </div>
      `;

    default:
      return '';
  }
}

// Attach Event Listeners to Inputs inside Wizard Slides
function setupWizardSlideListeners(step) {
  if (step === 2) {
    const wizHp = document.getElementById('wiz-home-price');
    const wizDp = document.getElementById('wiz-down-payment');
    if (wizHp) {
      wizHp.addEventListener('input', (e) => {
        setMainInputValue('home-price', e.target.value);
      });
    }
    if (wizDp) {
      wizDp.addEventListener('input', (e) => {
        setMainInputValue('down-payment', e.target.value);
      });
    }
  } else if (step === 3) {
    const wizRate = document.getElementById('wiz-interest-rate');
    if (wizRate) {
      wizRate.addEventListener('input', (e) => {
        setMainInputValue('interest-rate', e.target.value);
      });
    }
    document.querySelectorAll('.wiz-term-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const term = e.currentTarget.getAttribute('data-term');
        document.querySelectorAll('.wiz-term-btn').forEach(b => {
          b.classList.remove('btn-primary');
          b.classList.add('btn-outline');
        });
        e.currentTarget.classList.remove('btn-outline');
        e.currentTarget.classList.add('btn-primary');

        setMainInputValue('loan-term', term);

        // Click main preset button if available
        const mainPresetBtn = document.querySelector(`.btn-preset[data-preset="${term}-fixed"]`);
        if (mainPresetBtn) mainPresetBtn.click();
      });
    });
  } else if (step === 4) {
    const wizTax = document.getElementById('wiz-property-tax');
    const wizIns = document.getElementById('wiz-home-insurance');
    if (wizTax) {
      wizTax.addEventListener('input', (e) => {
        setMainInputValue('property-tax', e.target.value);
      });
    }
    if (wizIns) {
      wizIns.addEventListener('input', (e) => {
        setMainInputValue('home-insurance', e.target.value);
      });
    }
  }
}

// Render Wizard Modal State
function renderWizardStep(step) {
  currentWizardStep = step;
  const modal = document.getElementById('modal-onboarding-wizard');
  const bodyContainer = document.getElementById('wizard-body-container');
  const stepBadge = document.getElementById('wizard-step-badge');
  const progressFill = document.getElementById('wizard-progress-fill');
  const btnPrev = document.getElementById('btn-wizard-prev');
  const btnNext = document.getElementById('btn-wizard-next');

  if (!modal || !bodyContainer) return;

  if (stepBadge) stepBadge.textContent = `Step ${step} of ${TOTAL_WIZARD_STEPS}`;
  if (progressFill) progressFill.style.width = `${(step / TOTAL_WIZARD_STEPS) * 100}%`;

  // Update Stepper Dots
  document.querySelectorAll('#wizard-stepper-dots .step-dot').forEach(dot => {
    const dotStep = parseInt(dot.getAttribute('data-step'), 10);
    dot.classList.remove('active', 'completed');
    if (dotStep === step) {
      dot.classList.add('active');
    } else if (dotStep < step) {
      dot.classList.add('completed');
    }
  });

  // Body content
  bodyContainer.innerHTML = getWizardSlideHTML(step);
  setupWizardSlideListeners(step);

  // Buttons state
  if (btnPrev) {
    btnPrev.style.display = step === 1 ? 'none' : 'inline-flex';
  }
  if (btnNext) {
    if (step === TOTAL_WIZARD_STEPS) {
      btnNext.innerHTML = 'See My Mortgage Breakdown <i class="fa-solid fa-arrow-right"></i>';
      btnNext.className = 'btn btn-sm btn-success';
    } else {
      btnNext.innerHTML = 'Next <i class="fa-solid fa-arrow-right"></i>';
      btnNext.className = 'btn btn-sm btn-primary';
    }
  }
}

let handlersInitialized = false;

// Open Wizard Modal
export function openWizard() {
  currentWizardStep = 1;
  setSimpleMode(true);
  setIsOnboardingActive(true);

  const modal = document.getElementById('modal-onboarding-wizard');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    renderWizardStep(1);
  }
}

// Close Wizard Modal
export function closeWizard() {
  const modal = document.getElementById('modal-onboarding-wizard');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

// Transition Modal (Stage 1.5) Implementation
export function showTransitionModal() {
  closeWizard();
  setIsOnboardingActive(true);

  const modal = document.getElementById('modal-onboarding-transition');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

export function closeTransitionModal() {
  const modal = document.getElementById('modal-onboarding-transition');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

// Stage 2 Spotlight Tour Implementation
export function startSpotlightTour() {
  currentSpotlightStep = 1;
  closeWizard();
  closeTransitionModal();
  setIsOnboardingActive(true);

  const overlay = document.getElementById('onboarding-spotlight-overlay');
  const card = document.getElementById('onboarding-spotlight-card');

  if (overlay && card) {
    overlay.style.display = 'block';
    card.style.display = 'flex';
    renderSpotlightStep(1);
  }
}

export function endSpotlightTour() {
  const overlay = document.getElementById('onboarding-spotlight-overlay');
  const card = document.getElementById('onboarding-spotlight-card');

  // Clear highlight glow
  document.querySelectorAll('.spotlight-highlight').forEach(el => el.classList.remove('spotlight-highlight'));

  if (overlay) overlay.style.display = 'none';
  if (card) card.style.display = 'none';

  setIsOnboardingActive(false);
  setHasSeenOnboarding(true);
}

function renderSpotlightStep(step) {
  currentSpotlightStep = step;
  const stepConfig = SPOTLIGHT_STEPS[step - 1];
  if (!stepConfig) {
    endSpotlightTour();
    return;
  }

  // Remove existing highlight
  document.querySelectorAll('.spotlight-highlight').forEach(el => el.classList.remove('spotlight-highlight'));

  const targetEl = document.getElementById(stepConfig.targetId);
  const card = document.getElementById('onboarding-spotlight-card');
  const stepNumEl = document.getElementById('spotlight-step-num');
  const titleEl = document.getElementById('spotlight-title');
  const bodyEl = document.getElementById('spotlight-body-text');
  const btnPrev = document.getElementById('btn-spotlight-prev');
  const btnNext = document.getElementById('btn-spotlight-next');

  if (stepNumEl) stepNumEl.textContent = `${step}/${TOTAL_SPOTLIGHT_STEPS}`;
  if (titleEl) titleEl.textContent = stepConfig.title;
  if (bodyEl) bodyEl.textContent = stepConfig.text;

  if (btnPrev) btnPrev.style.display = step === 1 ? 'none' : 'inline-flex';
  if (btnNext) {
    btnNext.innerHTML = step === TOTAL_SPOTLIGHT_STEPS ? 'Finish Tour <i class="fa-solid fa-check"></i>' : 'Next <i class="fa-solid fa-chevron-right"></i>';
  }

  if (targetEl) {
    if (targetEl.classList.contains('accordion-group') && !targetEl.classList.contains('open')) {
      targetEl.classList.add('open');
    }
    targetEl.classList.add('spotlight-highlight');
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Position popover card relative to target element
    const positionCard = () => {
      if (!card) return;
      const rect = targetEl.getBoundingClientRect();
      const cardHeight = card.offsetHeight || 220;
      const cardWidth = card.offsetWidth || 340;

      let top = rect.bottom + 16;
      let left = rect.left + (rect.width / 2) - (cardWidth / 2);

      // Boundary check for viewport bottom
      if (top + cardHeight > window.innerHeight - 16) {
        top = Math.max(16, rect.top - cardHeight - 16);
      }
      if (top < 16) {
        top = Math.max(16, Math.min(window.innerHeight - cardHeight - 16, rect.top + 20));
      }

      // Boundary check for horizontal bounds
      left = Math.max(16, Math.min(window.innerWidth - cardWidth - 16, left));

      card.style.top = `${top}px`;
      card.style.left = `${left}px`;
    };

    positionCard();
    setTimeout(positionCard, 100);
    setTimeout(positionCard, 300);
    setTimeout(positionCard, 600);
  }
}

// Onboarding Initialization
export function initOnboarding(forceStart = false) {
  const hasSeen = getHasSeenOnboarding();
  if (forceStart || !hasSeen) {
    openWizard();
  }
}

// Setup Onboarding Event Handlers
export function setupOnboardingHandlers() {
  if (handlersInitialized) return;
  handlersInitialized = true;
  // Top Navbar Guide Button
  const btnGuide = document.getElementById('btn-start-onboarding');
  if (btnGuide) {
    btnGuide.addEventListener('click', () => initOnboarding(true));
  }

  // Wizard Navigation Handlers
  const btnXWizard = document.getElementById('btn-x-close-wizard');
  const btnSkipWizard = document.getElementById('btn-wizard-skip');
  const btnPrevWizard = document.getElementById('btn-wizard-prev');
  const btnNextWizard = document.getElementById('btn-wizard-next');

  if (btnXWizard) btnXWizard.addEventListener('click', () => { closeWizard(); setHasSeenOnboarding(true); });
  if (btnSkipWizard) btnSkipWizard.addEventListener('click', () => { closeWizard(); setHasSeenOnboarding(true); });
  if (btnPrevWizard) {
    btnPrevWizard.addEventListener('click', () => {
      if (currentWizardStep > 1) renderWizardStep(currentWizardStep - 1);
    });
  }
  if (btnNextWizard) {
    btnNextWizard.addEventListener('click', () => {
      if (currentWizardStep < TOTAL_WIZARD_STEPS) {
        renderWizardStep(currentWizardStep + 1);
      } else {
        showTransitionModal();
      }
    });
  }

  // Transition Screen Handler
  const btnStartSpotlightTour = document.getElementById('btn-start-spotlight-tour');
  if (btnStartSpotlightTour) {
    btnStartSpotlightTour.addEventListener('click', () => {
      closeTransitionModal();
      startSpotlightTour();
    });
  }

  // Spotlight Tour Handlers
  const btnXSpotlight = document.getElementById('btn-close-spotlight');
  const btnSkipSpotlight = document.getElementById('btn-spotlight-skip');
  const btnPrevSpotlight = document.getElementById('btn-spotlight-prev');
  const btnNextSpotlight = document.getElementById('btn-spotlight-next');

  if (btnXSpotlight) btnXSpotlight.addEventListener('click', endSpotlightTour);
  if (btnSkipSpotlight) btnSkipSpotlight.addEventListener('click', endSpotlightTour);
  if (btnPrevSpotlight) {
    btnPrevSpotlight.addEventListener('click', () => {
      if (currentSpotlightStep > 1) renderSpotlightStep(currentSpotlightStep - 1);
    });
  }
  if (btnNextSpotlight) {
    btnNextSpotlight.addEventListener('click', () => {
      if (currentSpotlightStep < TOTAL_SPOTLIGHT_STEPS) {
        renderSpotlightStep(currentSpotlightStep + 1);
      } else {
        endSpotlightTour();
      }
    });
  }
}
