// ==========================================================================
// MORTGAGE-ABILITY.COM TARGET PAYOFF CALCULATOR MODULE
// ==========================================================================

import { formatCurrency } from '../formatters.js';
import { getLumpSumForMonth } from '../core/calculations.js';

export function calculateTargetExtraPayment(
  currentSchedule,
  isTargetPrincipalUserModified,
  targetTermYears,
  annualRate,
  currentExtraMonthly,
  targetPrincipalVal,
  getScheduledOneTimePaymentsFn
) {
  const targetYears = parseFloat(targetTermYears) || 15;
  const targetMonths = targetYears * 12;
  const rate = parseFloat(annualRate) || 0;
  const monthlyRate = (rate / 100) / 12;
  const summary = currentSchedule ? currentSchedule.summary : {};
  const baseMonthlyPayment = summary ? (summary.baseMonthlyPayment || 0) : 0;

  if (isTargetPrincipalUserModified && targetPrincipalVal !== undefined) {
    const customP = parseFloat(targetPrincipalVal) || 0;
    if (customP <= 0 || targetMonths <= 0) {
      return { extraRequired: 0, requiredTotalPnI: baseMonthlyPayment + currentExtraMonthly };
    }
    let requiredTotalPnI = 0;
    if (monthlyRate === 0) {
      requiredTotalPnI = customP / targetMonths;
    } else {
      requiredTotalPnI = (customP * (monthlyRate * Math.pow(1 + monthlyRate, targetMonths))) /
        (Math.pow(1 + monthlyRate, targetMonths) - 1);
    }
    const extraRequired = Math.max(0, requiredTotalPnI - baseMonthlyPayment);
    return { extraRequired, requiredTotalPnI };
  }

  const accSchedule = currentSchedule ? (currentSchedule.accelerated || []) : [];

  if (targetMonths <= 0 || accSchedule.length === 0) {
    return { extraRequired: 0, requiredTotalPnI: baseMonthlyPayment + currentExtraMonthly };
  }

  let targetP = 0;
  if (targetMonths <= accSchedule.length) {
    const idx = targetMonths - 1;
    targetP = accSchedule[idx] ? accSchedule[idx].endingBalance : 0;
  }

  if (targetP <= 0) {
    return { extraRequired: 0, requiredTotalPnI: baseMonthlyPayment + currentExtraMonthly, targetP: 0 };
  }

  let x = 0;
  if (monthlyRate === 0) {
    x = targetP / targetMonths;
  } else {
    const factor = Math.pow(1 + monthlyRate, targetMonths) - 1;
    x = factor > 0 ? (targetP * monthlyRate) / factor : 0;
  }

  const extraRequired = currentExtraMonthly + x;
  const requiredTotalPnI = baseMonthlyPayment + extraRequired;

  return { extraRequired, requiredTotalPnI, targetP };
}

export function updateTargetTermCalculator(
  currentSchedule,
  isTargetPrincipalUserModified,
  getScheduledOneTimePaymentsFn
) {
  const elTargetTerm = document.getElementById('target-term');
  const elInterestRate = document.getElementById('interest-rate');
  const elExtraMonthly = document.getElementById('extra-monthly');
  const elTargetPrincipal = document.getElementById('target-principal');
  const elTargetExtraPayment = document.getElementById('target-extra-payment');
  const elTargetTotalPayment = document.getElementById('target-total-payment');
  const elTargetInterestPaid = document.getElementById('target-interest-paid');
  const elTargetInterestSaved = document.getElementById('target-interest-saved');
  const elHomePrice = document.getElementById('home-price');
  const elDownPayment = document.getElementById('down-payment');
  const elPropertyTax = document.getElementById('property-tax');
  const elHomeInsurance = document.getElementById('home-insurance');

  const targetYears = parseFloat(elTargetTerm ? elTargetTerm.value : 15) || 15;
  const targetMonths = targetYears * 12;
  const annualRate = parseFloat(elInterestRate ? elInterestRate.value : 0) || 0;
  const currentExtraMonthly = parseFloat(elExtraMonthly ? elExtraMonthly.value : 0) || 0;
  const targetPrincipalVal = elTargetPrincipal ? elTargetPrincipal.value : undefined;

  const { extraRequired, requiredTotalPnI } = calculateTargetExtraPayment(
    currentSchedule,
    isTargetPrincipalUserModified,
    targetYears,
    annualRate,
    currentExtraMonthly,
    targetPrincipalVal,
    getScheduledOneTimePaymentsFn
  );

  if (elTargetExtraPayment) {
    elTargetExtraPayment.textContent = formatCurrency(extraRequired);
  }

  const homePrice = parseFloat(elHomePrice ? elHomePrice.value : 0) || 0;
  const propTaxRate = parseFloat(elPropertyTax ? elPropertyTax.value : 0) || 0;
  const insRate = parseFloat(elHomeInsurance ? elHomeInsurance.value : 0) || 0;
  const monthlyTax = (homePrice * (propTaxRate / 100)) / 12;
  const monthlyInsurance = (homePrice * (insRate / 100)) / 12;

  if (elTargetTotalPayment) {
    elTargetTotalPayment.textContent = formatCurrency(requiredTotalPnI + monthlyTax + monthlyInsurance);
  }

  const price = parseFloat(elHomePrice ? elHomePrice.value : 0) || 0;
  const dp = parseFloat(elDownPayment ? elDownPayment.value : 0) || 0;
  const startingPrincipal = Math.max(0, price - dp);

  let targetBalance = startingPrincipal;
  let targetTotalInterest = 0;
  const monthlyRate = (annualRate / 100) / 12;
  const scheduledPayments = typeof getScheduledOneTimePaymentsFn === 'function' ? getScheduledOneTimePaymentsFn() : [];

  for (let m = 1; m <= targetMonths; m++) {
    if (targetBalance <= 0) break;
    const interest = targetBalance * monthlyRate;
    let extra = extraRequired + getLumpSumForMonth(scheduledPayments, 12, m);
    let principal = requiredTotalPnI + extra - interest;
    if (targetBalance < principal) principal = targetBalance;
    targetBalance -= principal;
    targetTotalInterest += interest;
  }

  if (elTargetInterestPaid) {
    elTargetInterestPaid.textContent = formatCurrency(targetTotalInterest);
  }

  const stdInterest = currentSchedule && currentSchedule.summary ? (currentSchedule.summary.standardTotalInterest || 0) : 0;
  const targetInterestSaved = Math.max(0, stdInterest - targetTotalInterest);
  if (elTargetInterestSaved) {
    elTargetInterestSaved.textContent = formatCurrency(targetInterestSaved);
  }
}
