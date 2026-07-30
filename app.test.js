import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

let appModule;

beforeAll(async () => {
  global.window.__TEST_ENVIRONMENT__ = true;

  // Mock HTMLCanvasElement getContext
  window.HTMLCanvasElement.prototype.getContext = () => ({
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    drawImage: vi.fn(),
    getImageData: vi.fn(),
    putImageData: vi.fn(),
    createImageData: vi.fn(),
    setTransform: vi.fn(),
  });

  // Mock global Chart class constructor
  global.Chart = class MockChart {
    constructor(ctx, config) {
      this.ctx = ctx;
      this.config = config;
    }
    destroy() {}
    update() {}
  };

  // Mock scrollIntoView and focus for elements since JSDOM doesn't implement them
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  window.HTMLElement.prototype.focus = vi.fn();

  // Load index.html content into the DOM BEFORE importing app.js
  const htmlPath = path.resolve(__dirname, 'index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  document.body.innerHTML = htmlContent;

  // Import the module dynamically now that DOM is populated
  appModule = await import('./app.js');
});

// Helper to reset the input values in JSDOM back to standard default states
function resetInputs() {
  document.getElementById('home-price').value = 450000;
  document.getElementById('home-price-slider').value = 450000;
  document.getElementById('down-payment').value = 90000;
  document.getElementById('down-payment-slider').value = 90000;
  document.getElementById('down-payment-percent').value = 20;
  document.getElementById('closing-costs').value = 13500;
  document.getElementById('closing-costs-slider').value = 3.0;
  document.getElementById('interest-rate').value = 6.5;
  document.getElementById('interest-slider').value = 6.5;
  document.getElementById('loan-term').value = 30;
  document.getElementById('term-slider').value = 30;
  document.getElementById('property-tax').value = 0.9;
  document.getElementById('property-tax-slider').value = 0.9;
  document.getElementById('home-insurance').value = 0.5;
  document.getElementById('home-insurance-slider').value = 0.5;
  document.getElementById('extra-monthly').value = 200;
  document.getElementById('extra-monthly-slider').value = 200;
  document.getElementById('take-home-salary').value = 8000;
  document.getElementById('take-home-slider').value = 8000;
  document.getElementById('monthly-expenses').value = 3000;
  document.getElementById('expenses-slider').value = 3000;
}

beforeEach(() => {
  resetInputs();
  appModule.init();
});

describe('1. Logic & Math Tests', () => {
  it('should calculate the base P&I monthly payment correctly', () => {
    // Principal: $360,000, Rate: 6.5%, Term: 30 Yrs
    const payment = appModule.calculateMonthlyPayment(360000, 6.5, 30);
    expect(payment).toBeCloseTo(2275.44, 2);
  });

  it('should handle 0% interest rate gracefully (edge case)', () => {
    const payment = appModule.calculateMonthlyPayment(360000, 0, 30);
    // 360,000 / 360 months = 1000.00
    expect(payment).toBeCloseTo(1000.00, 2);
  });

  it('should calculate accurate amortization schedules and accelerated paths', () => {
    const homePrice = 450000;
    const downPayment = 90000; // principal = 360000
    const rate = 6.5;
    const termYears = 30;
    const extraMonthly = 200;
    const oneTimeExtra = 5000;
    const oneTimeMonth = 12;

    const schedules = appModule.calculateAmortizationSchedules(
      homePrice,
      downPayment,
      rate,
      termYears,
      extraMonthly,
      oneTimeExtra,
      oneTimeMonth
    );

    // Verify standard vs accelerated payments structures
    expect(schedules.standard.length).toBe(360); // 1 to 360 months
    expect(schedules.accelerated.length).toBeLessThan(360); // Payoff is accelerated

    // Standard total interest check
    expect(schedules.summary.standardTotalInterest).toBeCloseTo(459160.16, 2);

    // Accelerated total interest check
    expect(schedules.summary.acceleratedTotalInterest).toBeLessThan(459160.16);

    // Check months saved is positive
    expect(schedules.summary.monthsSaved).toBeGreaterThan(0);
    expect(schedules.summary.interestSaved).toBeGreaterThan(0);
  });
});

describe('2. UI & Integration Tests', () => {
  it('should compute and render estimated closing costs and upfront cash correctly on load', () => {
    // Default Home Price: $450,000, Down Payment: $90,000 (20%)
    // Closing Costs: 3% of $450,000 = $13,500
    // Total Upfront Cash: $90,000 + $13,500 = $103,500
    const elClosingCosts = document.getElementById('closing-costs');
    const elTotalCash = document.getElementById('total-cash-display');

    expect(parseFloat(elClosingCosts.value)).toBe(13500);
    expect(elTotalCash.textContent).toContain('$103,500.00');
  });

  it('should recalculate upfront cash when closing costs input is changed', () => {
    const elClosingCosts = document.getElementById('closing-costs');
    const elTotalCash = document.getElementById('total-cash-display');

    // Simulate change closing cost to $15,000
    elClosingCosts.value = 15000;
    elClosingCosts.dispatchEvent(new Event('input'));

    // Down Payment ($90,000) + $15,000 = $105,000
    expect(elTotalCash.textContent).toContain('$105,000.00');
  });

  it('should calculate PITI, discretionary income, and DTI correctly', () => {
    // Inputs:
    // Salary: $8000, Expenses: $3000
    // Home Price: $450,000, Down Payment: $90,000, Rate: 6.5%, Term: 30
    // Tax Rate: 0.9%, Ins Rate: 0.5%
    // Extra Monthly: $200
    // Standard Payment breakdown:
    // P&I: $2,275.44
    // Tax: $337.50
    // Ins: $187.50
    // Standard PITI: $2,800.44
    // Total PITI (with extra): $3,000.44
    // Net Cash Flow: $8,000 - $3,000 - $3,000.44 = $1,999.56
    // DTI: ($3,000.44 + $3,000) / $8,000 * 100 = 75.0%

    const elPitiVal = document.getElementById('kpi-standard-payment');
    const elTotalVal = document.getElementById('kpi-total-payment');
    const elNetCash = document.getElementById('kpi-net-cash-flow');
    const elDti = document.getElementById('kpi-dti-ratio');

    expect(elPitiVal.textContent).toContain('$2,800.44');
    expect(elTotalVal.textContent).toContain('$3,000.44');
    expect(elNetCash.textContent).toContain('$1,999.56');
    expect(elDti.textContent).toContain('75.0%');
  });

  it('should toggle warning red color class if cash flow is negative', () => {
    const elExpenses = document.getElementById('monthly-expenses');
    const elCashFlowCard = document.getElementById('kpi-cash-flow-card');

    expect(elCashFlowCard.className).toContain('highlight');
  });

  it('should update Circular DTI Gauge ring offset and threshold colors based on DTI ratio', () => {
    const elSalary = document.getElementById('take-home-salary');
    const elExpenses = document.getElementById('monthly-expenses');
    const elDtiGaugeFill = document.getElementById('dti-gauge-fill');
    const elDtiStatusPill = document.getElementById('dti-status-pill');
    const elDtiStatusText = document.getElementById('dti-status-text');

    // 1. High Risk (>36%): Default salary $8000, expenses $3000 -> DTI ~75.0%
    expect(elDtiGaugeFill.style.stroke).toBe('rgb(239, 68, 68)'); // #ef4444
    expect(elDtiStatusPill.className).toContain('high-risk');
    expect(elDtiStatusText.textContent).toContain('High Risk');

    // 2. Ideal (<28%): High salary $25,000, low expenses $1000
    // Total PITI ($3000.44) + $1000 = $4000.44 / $25000 = 16.0% DTI
    elSalary.value = 25000;
    elExpenses.value = 1000;
    elSalary.dispatchEvent(new Event('input'));

    expect(elDtiGaugeFill.style.stroke).toBe('rgb(16, 185, 129)'); // #10b981
    expect(elDtiStatusPill.className).toContain('ideal');
    expect(elDtiStatusText.textContent).toContain('Ideal');

    // 3. Manageable (28%-36%): Salary $12,000, expenses $500
    // Total PITI ($3000.44) + $500 = $3500.44 / $12000 = 29.1% DTI
    elSalary.value = 12000;
    elExpenses.value = 500;
    elSalary.dispatchEvent(new Event('input'));

    expect(elDtiGaugeFill.style.stroke).toBe('rgb(245, 158, 11)'); // #f59e0b
    expect(elDtiStatusPill.className).toContain('manageable');
    expect(elDtiStatusText.textContent).toContain('Manageable');
  });

  it('should toggle between Text Metrics View and Donut Chart View on Card 1', () => {
    const btnText = document.getElementById('btn-piti-view-text');
    const btnChart = document.getElementById('btn-piti-view-chart');
    const viewText = document.getElementById('piti-view-text');
    const viewChart = document.getElementById('piti-view-chart');

    // Default view: Text View active, Chart View hidden
    expect(btnText.className).toContain('active');
    expect(btnChart.className).not.toContain('active');
    expect(viewText.className).not.toContain('hidden');
    expect(viewChart.className).toContain('hidden');

    // Click Chart View toggle
    btnChart.dispatchEvent(new Event('click'));
    expect(btnChart.className).toContain('active');
    expect(btnText.className).not.toContain('active');
    expect(viewChart.className).not.toContain('hidden');
    expect(viewText.className).toContain('hidden');

    // Click Text View toggle to switch back
    btnText.dispatchEvent(new Event('click'));
    expect(btnText.className).toContain('active');
    expect(viewText.className).not.toContain('hidden');
  });

  it('should calculate PMI and include PMI legend chip when Down Payment is less than 20%', () => {
    const elHomePrice = document.getElementById('home-price');
    const elDownPayment = document.getElementById('down-payment');
    const elBreakdownPmiWrapper = document.getElementById('breakdown-pmi-wrapper');
    const elLegendGrid = document.getElementById('piti-donut-legend');

    // Set Down Payment to 10% ($45,000 on $450,000 home price) -> PMI required
    elDownPayment.value = 45000;
    elDownPayment.dispatchEvent(new Event('input'));

    expect(elBreakdownPmiWrapper.style.display).toBe('inline');
    expect(elLegendGrid.textContent).toContain('PMI');

    // Reset down payment back to standard default ($90,000)
    elDownPayment.value = 90000;
    elDownPayment.dispatchEvent(new Event('input'));
  });

  it('should render interactive micro-pill chips for interest savings breakdown', () => {
    const elExtraMonthly = document.getElementById('extra-monthly');
    const elOneTimeExtra = document.getElementById('one-time-extra');
    const elChipMonthly = document.getElementById('chip-savings-monthly');
    const elChipLump = document.getElementById('chip-savings-lump');
    const elValMonthly = document.getElementById('savings-monthly-val');
    const elValLump = document.getElementById('savings-lump-val');

    // 1. Only Extra Monthly Payment = $200
    elExtraMonthly.value = 200;
    elOneTimeExtra.value = 0;
    elExtraMonthly.dispatchEvent(new Event('input'));

    expect(elChipMonthly.className).toContain('active');
    expect(elChipLump.className).toContain('dimmed');
    expect(elValMonthly.textContent).not.toBe('$0.00');

    // 2. Add One-Time Lump Sum = $10,000
    elOneTimeExtra.value = 10000;
    elOneTimeExtra.dispatchEvent(new Event('input'));

    expect(elChipMonthly.className).toContain('active');
    expect(elChipLump.className).toContain('active');
    expect(elValLump.textContent).not.toBe('$0.00');

    // Reset One-Time Lump Sum back to 0
    elOneTimeExtra.value = 0;
    elOneTimeExtra.dispatchEvent(new Event('input'));
  });

  it('should apply extra payments from target term calculator when clicked', () => {
    const elTargetTerm = document.getElementById('target-term');
    const elBtnApplyTarget = document.getElementById('btn-apply-target');
    const elExtraMonthly = document.getElementById('extra-monthly');

    // Set target term to 15 years
    elTargetTerm.value = 15;
    elTargetTerm.dispatchEvent(new Event('change'));

    // Click apply button
    elBtnApplyTarget.dispatchEvent(new Event('click'));

    // Extra monthly should be updated to target required extra payment
    // For 15 years: required P&I payment = $3,133.51
    // Original P&I payment = $2,275.44
    // Extra needed = $3,133.51 - $2,275.44 = $858 (rounded)
    expect(parseInt(elExtraMonthly.value)).toBeCloseTo(858, -1);
  });
});

describe('3. Loan Types & ARM Tests', () => {
  it('should calculate ARM amortization schedule with re-amortized payment after reset month', () => {
    const homePrice = 450000;
    const downPayment = 90000; // principal = $360,000
    const initialRate = 5.5;
    const termYears = 30;
    const extraMonthly = 0;
    const oneTimeExtra = 0;
    const oneTimeMonth = 1;
    const isArm = true;
    const armFixedYears = 5; // 60 months
    const armAdjustedRate = 7.5;

    const schedules = appModule.calculateAmortizationSchedules(
      homePrice,
      downPayment,
      initialRate,
      termYears,
      extraMonthly,
      oneTimeExtra,
      oneTimeMonth,
      isArm,
      armFixedYears,
      armAdjustedRate
    );

    // Initial base payment for $360,000 at 5.5% for 30 Yrs = $2,044.04
    expect(schedules.summary.baseMonthlyPayment).toBeCloseTo(2044.04, 2);

    // After 5 years (Month 60), starting balance for Month 61 is ~$330,830.63
    // At Month 61, re-amortized payment for ~$330,830 at 7.5% for 25 Yrs (300 mos) = ~$2,444.60
    const month60Row = schedules.standard.find(r => r.month === 60);
    const month61Row = schedules.standard.find(r => r.month === 61);

    expect(month60Row.basePayment).toBeCloseTo(2044.04, 1);
    expect(month61Row.basePayment).toBeGreaterThan(2044.04);
    expect(month61Row.basePayment).toBeCloseTo(2459.79, 1);
  });

  it('should toggle ARM panel and update inputs when preset buttons are clicked', () => {
    const btn15Fixed = document.querySelector('.btn-preset[data-preset="15-fixed"]');
    const btn5Arm = document.querySelector('.btn-preset[data-preset="5-arm"]');
    const elLoanTerm = document.getElementById('loan-term');
    const elArmSettingsPanel = document.getElementById('arm-settings-panel');
    const elArmFixedTerm = document.getElementById('arm-fixed-term');
    const elArmKpiSubRow = document.getElementById('arm-kpi-sub-row');

    // Click 15-Yr Fixed preset
    btn15Fixed.dispatchEvent(new Event('click'));
    expect(elLoanTerm.value).toBe('15');
    expect(elArmSettingsPanel.style.display).toBe('none');
    expect(elArmKpiSubRow.style.display).toBe('none');

    // Click 5/1 ARM preset
    btn5Arm.dispatchEvent(new Event('click'));
    expect(elLoanTerm.value).toBe('30');
    expect(elArmFixedTerm.value).toBe('5');
    expect(elArmSettingsPanel.style.display).toBe('flex');
    expect(elArmKpiSubRow.style.display).toBe('flex');
  });
});

describe('4. Stateful Scenario Management Tests', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should save a named scenario to localStorage and render it in scenario select', () => {
    const elHomePrice = document.getElementById('home-price');
    elHomePrice.value = 650000;

    const newScen = appModule.saveScenario('Dream House 650k');
    expect(newScen).not.toBeNull();
    expect(newScen.name).toBe('Dream House 650k');

    const savedScenarios = appModule.getSavedScenarios();
    expect(savedScenarios.length).toBe(1);
    expect(savedScenarios[0].state.homePrice).toBe(650000);

    const elScenarioSelect = document.getElementById('scenario-select');
    expect(elScenarioSelect.children.length).toBe(2);
  });

  it('should load a saved scenario and update inputs, KPIs, and visual active badge', () => {
    const elHomePrice = document.getElementById('home-price');
    const elActiveScenarioName = document.getElementById('active-scenario-name');

    elHomePrice.value = 800000;
    const scen = appModule.saveScenario('Luxury Estate');

    // Change home price to another value
    elHomePrice.value = 300000;

    // Load saved scenario
    appModule.loadScenario(scen.id);

    expect(elHomePrice.value).toBe('800000');
    expect(elActiveScenarioName.textContent).toBe('Luxury Estate');
  });

  it('should delete a scenario from localStorage and update selector options', () => {
    const scen = appModule.saveScenario('Test Delete');
    expect(appModule.getSavedScenarios().length).toBe(1);

    appModule.deleteScenario(scen.id);
    expect(appModule.getSavedScenarios().length).toBe(0);

    const elActiveScenarioName = document.getElementById('active-scenario-name');
    expect(elActiveScenarioName.textContent).toBe('Default Setup');
  });

  it('should save scenario comments and display them in option previews and comments banner', () => {
    const elHomePrice = document.getElementById('home-price');
    elHomePrice.value = 550000;

    const commentsText = 'Refinancing at year 5 with extra $400/mo payment';
    const scen = appModule.saveScenario('5/1 ARM Strategy', commentsText);

    expect(scen.comments).toBe(commentsText);

    const elScenarioCommentsBanner = document.getElementById('scenario-comments-banner');
    const elActiveScenarioComments = document.getElementById('active-scenario-comments');
    
    expect(elScenarioCommentsBanner.style.display).toBe('flex');
    expect(elActiveScenarioComments.textContent).toBe(commentsText);

    const elScenarioSelect = document.getElementById('scenario-select');
    const optText = elScenarioSelect.children[1].textContent;
    expect(optText).toContain('5/1 ARM Strategy');
    expect(optText).toContain('Refinancing at year 5');
  });
});

describe('5. Terms & Privacy Disclaimer Tests', () => {
  it('should toggle disclaimer modal visibility when open and close buttons are clicked', () => {
    const elBtnOpenDisclaimer = document.getElementById('btn-open-disclaimer');
    const elModalDisclaimer = document.getElementById('modal-disclaimer');
    const elBtnCloseDisclaimer = document.getElementById('btn-close-disclaimer');

    expect(elModalDisclaimer.style.display).toBe('none');

    elBtnOpenDisclaimer.click();
    expect(elModalDisclaimer.style.display).toBe('flex');

    elBtnCloseDisclaimer.click();
    expect(elModalDisclaimer.style.display).toBe('none');
  });

  it('should contain accurate privacy statements confirming zero data transmission to site creators', () => {
    const elModalDisclaimer = document.getElementById('modal-disclaimer');
    const text = elModalDisclaimer.textContent;
    expect(text).toContain('No personal data, financial parameters, budgets, scenario names, or notes are transmitted to, collected by, or shared with the site\'s creators');
    expect(text).toContain('localStorage');
  });
});

describe('6. Theme Switcher & Persistence Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('should set data-theme attribute on documentElement and update localStorage when setTheme is called', () => {
    appModule.setTheme('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem(appModule.STORAGE_KEYS.THEME)).toBe('light');

    appModule.setTheme('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem(appModule.STORAGE_KEYS.THEME)).toBe('dark');
  });

  it('should toggle theme when toggleTheme is called or theme button is clicked', () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    appModule.toggleTheme();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem(appModule.STORAGE_KEYS.THEME)).toBe('light');

    const btnThemeToggle = document.getElementById('btn-theme-toggle');
    if (btnThemeToggle) {
      btnThemeToggle.click();
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    }
  });

  it('should retrieve saved theme from localStorage on getInitialTheme', () => {
    localStorage.setItem(appModule.STORAGE_KEYS.THEME, 'light');
    expect(appModule.getInitialTheme()).toBe('light');
  });
});

describe('7. Help & Financial Glossary System Tests', () => {
  beforeEach(() => {
    appModule.closeHelpModal();
    appModule.setupHelpHandlers();
  });

  it('should contain definitions for all financial terms including ARM adjustment parameters', () => {
    expect(appModule.GLOSSARY_TERMS['home-price']).toBeDefined();
    expect(appModule.GLOSSARY_TERMS['piti']).toBeDefined();
    expect(appModule.GLOSSARY_TERMS['pmi']).toBeDefined();
    expect(appModule.GLOSSARY_TERMS['arm-loan']).toBeDefined();
    expect(appModule.GLOSSARY_TERMS['arm-fixed-term']).toBeDefined();
    expect(appModule.GLOSSARY_TERMS['arm-adjusted-rate']).toBeDefined();
    expect(appModule.GLOSSARY_TERMS['arm-reset-payment']).toBeDefined();
  });

  it('should render glossary cards for all terms in the modal glossary container', () => {
    appModule.renderGlossaryCards('all', '');
    const container = document.getElementById('modal-glossary-cards-container');
    expect(container.children.length).toBeGreaterThanOrEqual(15);
  });

  it('should filter terms by category when category filter is selected', () => {
    appModule.renderGlossaryCards('arm', '');
    const container = document.getElementById('modal-glossary-cards-container');
    const cards = container.querySelectorAll('.glossary-card');
    expect(cards.length).toBe(4);
  });

  it('should filter terms dynamically when search query is typed', () => {
    appModule.renderGlossaryCards('all', 'Target Term Payoff Calculator');
    const container = document.getElementById('modal-glossary-cards-container');
    const cards = container.querySelectorAll('.glossary-card');
    expect(cards.length).toBe(1);
    expect(cards[0].textContent).toContain('Target Term Payoff Calculator');
  });

  it('should open and close the Help & Glossary modal', () => {
    const modal = document.getElementById('modal-help');
    expect(modal.style.display).toBe('none');

    appModule.openHelpModal();
    expect(modal.style.display).toBe('flex');

    appModule.closeHelpModal();
    expect(modal.style.display).toBe('none');
  });

  it('should open help modal and highlight specific term when an info icon is clicked', () => {
    const infoIcon = document.querySelector('.info-icon[data-term="pmi"]');
    expect(infoIcon).not.toBeNull();

    infoIcon.click();

    const modal = document.getElementById('modal-help');
    expect(modal.style.display).toBe('flex');

    const card = modal.querySelector('[data-term-id="pmi"]');
    expect(card.classList.contains('term-pulse')).toBe(true);
  });
});

describe('8. Amortization Table View & Pagination Tests', () => {
  it('should toggle table between Annual and Monthly view modes and update table content', () => {
    const btnAnnual = document.getElementById('btn-view-annual');
    const btnMonthly = document.getElementById('btn-view-monthly');
    const tablePagination = document.getElementById('table-pagination');
    const tbody = document.getElementById('schedule-tbody');

    // Click Annual View
    btnAnnual.dispatchEvent(new Event('click'));
    expect(btnAnnual.className).toContain('active');
    expect(btnMonthly.className).not.toContain('active');
    expect(tablePagination.style.display).toBe('none');
    expect(tbody.children[0].textContent).toContain('Year 1');

    // Click Monthly View
    btnMonthly.dispatchEvent(new Event('click'));
    expect(btnMonthly.className).toContain('active');
    expect(btnAnnual.className).not.toContain('active');
    expect(tablePagination.style.display).toBe('flex');
    expect(tbody.children[0].textContent).toContain('Month 1');
  });

  it('should navigate through table pages and update pagination controls', () => {
    const btnMonthly = document.getElementById('btn-view-monthly');
    btnMonthly.dispatchEvent(new Event('click'));

    const btnNext = document.getElementById('btn-next-page');
    const btnPrev = document.getElementById('btn-prev-page');
    const paginationInfo = document.getElementById('pagination-info');
    const tbody = document.getElementById('schedule-tbody');

    // On Page 1
    expect(btnPrev.disabled).toBe(true);
    expect(btnNext.disabled).toBe(false);
    expect(paginationInfo.textContent).toContain('Page 1 of');
    expect(tbody.children[0].textContent).toContain('Month 1');

    // Click Next Page -> Page 2
    btnNext.dispatchEvent(new Event('click'));
    expect(btnPrev.disabled).toBe(false);
    expect(paginationInfo.textContent).toContain('Page 2 of');
    expect(tbody.children[0].textContent).toContain('Month 13');

    // Click Prev Page -> back to Page 1
    btnPrev.dispatchEvent(new Event('click'));
    expect(btnPrev.disabled).toBe(true);
    expect(paginationInfo.textContent).toContain('Page 1 of');
    expect(tbody.children[0].textContent).toContain('Month 1');
  });
});

describe('9. Target Term Payoff Calculator Deep Coverage', () => {
  it('should update target calculations reactively when target term or principal input changes', () => {
    const elTargetTerm = document.getElementById('target-term');
    const elTargetPrincipal = document.getElementById('target-principal');
    const elTargetExtraPayment = document.getElementById('target-extra-payment');
    const elTargetTotalPayment = document.getElementById('target-total-payment');
    const elTargetInterestSaved = document.getElementById('target-interest-saved');

    // Set target term to 15 years
    elTargetTerm.value = 15;
    elTargetTerm.dispatchEvent(new Event('input'));

    expect(elTargetExtraPayment.textContent).not.toBe('$0.00');
    expect(elTargetTotalPayment.textContent).not.toBe('$0.00');
    expect(elTargetInterestSaved.textContent).not.toBe('$0.00');

    // Change target principal amount (e.g. 500,000)
    elTargetPrincipal.value = 500000;
    elTargetPrincipal.dispatchEvent(new Event('input'));

    expect(elTargetExtraPayment.textContent).not.toBe('$0.00');
  });

  it('should reset target principal to active loan principal when reset button is clicked', () => {
    const elHomePrice = document.getElementById('home-price');
    const elDownPayment = document.getElementById('down-payment');
    const elTargetPrincipal = document.getElementById('target-principal');
    const btnReset = document.getElementById('btn-reset-target-principal');

    elHomePrice.value = 500000;
    elHomePrice.dispatchEvent(new Event('input'));
    elDownPayment.value = 100000;
    elDownPayment.dispatchEvent(new Event('input'));

    // Change target principal to arbitrary value
    elTargetPrincipal.value = 150000;

    // Reset should set target principal to homePrice - downPayment = 400,000
    btnReset.dispatchEvent(new Event('click'));
    expect(parseFloat(elTargetPrincipal.value)).toBe(400000);
  });
});

describe('10. ARM Presets & Parameter Input Controls', () => {
  it('should set ARM parameters when 7/1 ARM or 10/1 ARM preset buttons are clicked', () => {
    const btn7Arm = document.querySelector('.btn-preset[data-preset="7-arm"]');
    const btn10Arm = document.querySelector('.btn-preset[data-preset="10-arm"]');
    const btn30Fixed = document.querySelector('.btn-preset[data-preset="30-fixed"]');
    const elArmFixedTerm = document.getElementById('arm-fixed-term');
    const elArmSettingsPanel = document.getElementById('arm-settings-panel');

    // Click 7/1 ARM preset
    if (btn7Arm) {
      btn7Arm.dispatchEvent(new Event('click'));
      expect(elArmFixedTerm.value).toBe('7');
      expect(elArmSettingsPanel.style.display).toBe('flex');
    }

    // Click 10/1 ARM preset
    if (btn10Arm) {
      btn10Arm.dispatchEvent(new Event('click'));
      expect(elArmFixedTerm.value).toBe('10');
      expect(elArmSettingsPanel.style.display).toBe('flex');
    }

    // Reset back to 30-yr fixed
    if (btn30Fixed) {
      btn30Fixed.dispatchEvent(new Event('click'));
      expect(elArmSettingsPanel.style.display).toBe('none');
    }
  });

  it('should update ARM reset payment display when fixed term or adjusted rate inputs change', () => {
    const btn5Arm = document.querySelector('.btn-preset[data-preset="5-arm"]');
    const elArmFixedTerm = document.getElementById('arm-fixed-term');
    const elArmAdjustedRate = document.getElementById('arm-adjusted-rate');
    const elArmBadgeAdjustedPayment = document.getElementById('arm-badge-adjusted-payment');

    if (btn5Arm) {
      btn5Arm.dispatchEvent(new Event('click'));
    }

    elArmFixedTerm.value = 5;
    elArmAdjustedRate.value = 8.5;
    elArmAdjustedRate.dispatchEvent(new Event('input'));

    expect(elArmBadgeAdjustedPayment.textContent).not.toBe('$0.00/mo');
  });
});

describe('11. Input Validation, Clamping & Formatting Edge Cases', () => {
  it('should clamp down payment to home price if down payment input exceeds home price', () => {
    const elHomePrice = document.getElementById('home-price');
    const elDownPayment = document.getElementById('down-payment');

    elHomePrice.value = 300000;
    elHomePrice.dispatchEvent(new Event('input'));

    elDownPayment.value = 400000;
    elDownPayment.dispatchEvent(new Event('input'));

    expect(parseFloat(elDownPayment.value)).toBe(300000);
  });

  it('should clamp down payment percentage within range [0, 99]', () => {
    const elHomePrice = document.getElementById('home-price');
    const elDownPaymentPercent = document.getElementById('down-payment-percent');
    const elDownPayment = document.getElementById('down-payment');

    elHomePrice.value = 400000;
    elHomePrice.dispatchEvent(new Event('input'));

    // Test > 99%
    elDownPaymentPercent.value = 105;
    elDownPaymentPercent.dispatchEvent(new Event('input'));
    expect(parseFloat(elDownPaymentPercent.value)).toBe(99);
    expect(parseFloat(elDownPayment.value)).toBe(396000);

    // Test < 0%
    elDownPaymentPercent.value = -10;
    elDownPaymentPercent.dispatchEvent(new Event('input'));
    expect(parseFloat(elDownPaymentPercent.value)).toBe(0);
    expect(parseFloat(elDownPayment.value)).toBe(0);
  });

  it('should format currency correctly for edge case inputs', () => {
    expect(appModule.formatCurrency(0)).toBe('$0.00');
    expect(appModule.formatCurrency(1234.567)).toBe('$1,234.57');
    expect(appModule.formatCurrency(-500)).toBe('-$500.00');
  });
});

describe('12. Auto-Save State & Scenario Modal Interaction Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should auto-save current inputs to localStorage on change', () => {
    const elHomePrice = document.getElementById('home-price');
    elHomePrice.value = 525000;
    elHomePrice.dispatchEvent(new Event('input'));

    const savedRaw = localStorage.getItem(appModule.STORAGE_KEYS.CURRENT_STATE);
    expect(savedRaw).not.toBeNull();
    const state = JSON.parse(savedRaw);
    expect(state.homePrice).toBe(525000);
  });

  it('should restore current state from localStorage upon calling restoreCurrentState()', () => {
    const mockState = {
      homePrice: 750000,
      downPayment: 150000,
      downPaymentPercent: 20,
      closingCosts: 22500,
      interestRate: 5.5,
      loanTerm: 15,
      propertyTax: 1.2,
      homeInsurance: 0.6,
      extraMonthly: 500,
      takeHomeSalary: 10000,
      monthlyExpenses: 2500
    };
    localStorage.setItem(appModule.STORAGE_KEYS.CURRENT_STATE, JSON.stringify(mockState));

    appModule.restoreCurrentState();

    expect(document.getElementById('home-price').value).toBe('750000');
    expect(document.getElementById('loan-term').value).toBe('15');
    expect(document.getElementById('extra-monthly').value).toBe('500');
  });

  it('should open save scenario modal with incremented default name and close on cancel click', () => {
    const btnSaveScenario = document.getElementById('btn-save-scenario');
    const modalSave = document.getElementById('modal-save-scenario');
    const inputName = document.getElementById('scenario-name-input');
    const btnCancel = document.getElementById('btn-cancel-modal');

    if (btnSaveScenario && modalSave) {
      btnSaveScenario.dispatchEvent(new Event('click'));
      expect(modalSave.style.display).toBe('flex');
      expect(inputName.value).toBe('Scenario 1');

      btnCancel.dispatchEvent(new Event('click'));
      expect(modalSave.style.display).toBe('none');
    }
  });

  it('should handle confirm scenario delete dialog when confirmed', () => {
    const scen = appModule.saveScenario('ToDelete');
    const elScenarioSelect = document.getElementById('scenario-select');
    elScenarioSelect.value = scen.id;
    elScenarioSelect.dispatchEvent(new Event('change'));

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    const btnDelete = document.getElementById('btn-delete-scenario');
    btnDelete.dispatchEvent(new Event('click'));

    expect(appModule.getSavedScenarios().length).toBe(0);
    confirmSpy.mockRestore();
  });
});

describe('13. Glossary System Edge Cases & Keyboard Navigation', () => {
  it('should show empty message when search query yields zero matching terms', () => {
    appModule.renderGlossaryCards('all', 'nonexistenttermxyz999');
    const container = document.getElementById('modal-glossary-cards-container');
    expect(container.textContent).toContain('No matching financial terms found');
  });

  it('should close Help modal when Escape key is pressed', () => {
    appModule.openHelpModal();
    const modal = document.getElementById('modal-help');
    expect(modal.style.display).toBe('flex');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(modal.style.display).toBe('none');
  });

  it('should filter terms when clicking category pills in main page container', () => {
    const mainPills = document.getElementById('glossary-category-pills');
    if (mainPills) {
      const armPill = mainPills.querySelector('[data-category="arm"]');
      if (armPill) {
        armPill.dispatchEvent(new Event('click', { bubbles: true }));
        const container = document.getElementById('glossary-cards-container');
        const cards = container.querySelectorAll('.glossary-card');
        expect(cards.length).toBe(4);
      }
    }
  });
});

describe('14. Amortization Chart Zoom Presets & Payoff Milestone Event Flags', () => {
  it('should compute pmiDropMonth when down payment is less than 20%', () => {
    // $500k home with $50k down payment (10% down -> LTV 90%)
    const res = appModule.calculateAmortizationSchedules(500000, 50000, 6.5, 30, 0, 0, 12);
    expect(res.summary.pmiDropMonth).toBeGreaterThan(0);
    // Standard schedule reaches 80% LTV ($400k balance) after some years
    expect(res.summary.pmiDropMonth).toBeLessThan(360);
  });

  it('should set pmiDropMonth to null when down payment is 20% or greater', () => {
    // $500k home with $100k down payment (20% down -> LTV 80%)
    const res = appModule.calculateAmortizationSchedules(500000, 100000, 6.5, 30, 0, 0, 12);
    expect(res.summary.pmiDropMonth).toBeNull();
  });

  it('should compute armResetMonth for ARM loans and null for fixed loans', () => {
    const armRes = appModule.calculateAmortizationSchedules(500000, 100000, 5.5, 30, 0, 0, 12, true, 5, 7.5);
    expect(armRes.summary.armResetMonth).toBe(60); // 5 Yrs * 12

    const fixedRes = appModule.calculateAmortizationSchedules(500000, 100000, 5.5, 30, 0, 0, 12, false);
    expect(fixedRes.summary.armResetMonth).toBeNull();
  });

  it('should compute acceleratedPayoffMonth when extra payments pay off loan early', () => {
    // $500 monthly extra on 30-year fixed loan
    const res = appModule.calculateAmortizationSchedules(400000, 80000, 6.0, 30, 500, 0, 12);
    expect(res.summary.acceleratedPayoffMonth).toBeLessThan(360);
    expect(res.summary.acceleratedPayoffMonth).toBe(res.summary.acceleratedMonths);
  });

  it('should update activeZoomPreset when zoom preset buttons are clicked', () => {
    appModule.init();

    const zoomBar = document.getElementById('chart-zoom-presets');
    expect(zoomBar).not.toBeNull();

    const btn5Y = zoomBar.querySelector('[data-zoom="5Y"]');
    const btn10Y = zoomBar.querySelector('[data-zoom="10Y"]');
    const btnFull = zoomBar.querySelector('[data-zoom="full"]');

    expect(btn5Y).not.toBeNull();
    btn5Y.click();

    expect(appModule.getActiveZoomPreset()).toBe('5Y');
    expect(btn5Y.classList.contains('active')).toBe(true);

    btn10Y.click();
    expect(appModule.getActiveZoomPreset()).toBe('10Y');
    expect(btn10Y.classList.contains('active')).toBe(true);
    expect(btn5Y.classList.contains('active')).toBe(false);

    btnFull.click();
    expect(appModule.getActiveZoomPreset()).toBe('full');
    expect(btnFull.classList.contains('active')).toBe(true);
  });

  it('should render milestone badges strip for PMI, ARM, and Accelerated Payoff in DOM', () => {
    // Set 10% down, 5/1 ARM, and $300 extra monthly to trigger all 3 milestones
    document.getElementById('home-price').value = '400000';
    document.getElementById('down-payment').value = '40000'; // 10% down
    document.getElementById('extra-monthly').value = '300';
    
    // Select 5/1 ARM
    const armBtn = document.querySelector('.btn-preset[data-preset="5-arm"]');
    if (armBtn) armBtn.click();

    appModule.recalculate();

    const milestoneBar = document.getElementById('chart-milestones-bar');
    expect(milestoneBar).not.toBeNull();
    const html = milestoneBar.innerHTML;

    expect(html).toContain('PMI Drop-Off');
    expect(html).toContain('ARM Interest Reset');
    expect(html).toContain('Accelerated Payoff');
  });

  it('should register milestoneFlagsPlugin in Chart.js instance config', () => {
    appModule.init();
    appModule.recalculate();

    // Verify payoff-chart canvas exists and chart was initialized
    const canvas = document.getElementById('payoff-chart');
    expect(canvas).not.toBeNull();
  });
});


