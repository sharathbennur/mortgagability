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

    // Default Net Cash Flow is positive ($1,999.56), card should be 'success'
    expect(elCashFlowCard.className).toContain('success');

    // Simulate high expenses making budget negative
    elExpenses.value = 6000;
    elExpenses.dispatchEvent(new Event('input'));

    // Net Cash Flow: $8,000 - $6,000 - $3,000.44 = -$1,000.44
    // Should toggle card class to 'danger'
    expect(elCashFlowCard.className).toContain('danger');
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
