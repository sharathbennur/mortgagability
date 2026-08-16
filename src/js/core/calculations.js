// ==========================================================================
// MORTGAGE-ABILITY.COM FINANCIAL MATH & AMORTIZATION ENGINE
// ==========================================================================

/**
 * Calculates standard monthly Principal and Interest (P&I) payment.
 * Formula: M = P * [ i(1 + i)^n ] / [ (1 + i)^n - 1 ]
 * @param {number} principal
 * @param {number} annualRate
 * @param {number} termYears
 * @returns {number}
 */
export function calculateMonthlyPayment(principal, annualRate, termYears) {
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
 * Helper to sum one-time extra payments for a specific month.
 * Supports both array of payments [{ amount, month }] and single (oneTimeExtra, oneTimeMonth).
 * @param {Array|number} oneTimeExtra
 * @param {number} oneTimeMonth
 * @param {number} month
 * @returns {number}
 */
export function getLumpSumForMonth(oneTimeExtra, oneTimeMonth, month) {
  if (Array.isArray(oneTimeExtra)) {
    return oneTimeExtra
      .filter(item => parseInt(item.month) === month)
      .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  }
  if (typeof oneTimeExtra === 'number' && oneTimeExtra > 0) {
    return month === oneTimeMonth ? oneTimeExtra : 0;
  }
  return 0;
}

/**
 * Helper to calculate total sum of all one-time extra payments.
 * @param {Array|number} oneTimeExtra
 * @returns {number}
 */
export function getTotalLumpSumAmount(oneTimeExtra) {
  if (Array.isArray(oneTimeExtra)) {
    return oneTimeExtra.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  }
  return parseFloat(oneTimeExtra) || 0;
}

/**
 * Helper to compute net loan principal after subtracting any recast lump sum
 * amount AND any scheduled one-time extra prepayments.
 * @param {number} homePrice
 * @param {number} downPayment
 * @param {boolean} isRecast
 * @param {number} recastAmount
 * @param {Array|number} scheduledOneTimePayments
 * @returns {number}
 */
export function getNetLoanPrincipal(homePrice, downPayment, isRecast = false, recastAmount = 0, scheduledOneTimePayments = []) {
  const price = parseFloat(homePrice) || 0;
  const dp = parseFloat(downPayment) || 0;
  const baseLoanAmt = Math.max(0, price - dp);

  const recastLumpSum = isRecast ? (parseFloat(recastAmount) || 0) : 0;
  const oneTimeLumpSum = getTotalLumpSumAmount(scheduledOneTimePayments);

  return Math.max(0, baseLoanAmt - recastLumpSum - oneTimeLumpSum);
}

/**
 * Generates both standard and accelerated amortization schedules.
 * Supports both fixed-rate loans and ARM (Adjustable-Rate Mortgages).
 */
export function calculateAmortizationSchedules(
  homePrice,
  downPayment,
  annualRate,
  termYears,
  extraMonthly,
  oneTimeExtra,
  oneTimeMonth,
  isArm = false,
  armFixedYears = 5,
  armAdjustedRate = 7.5,
  scheduledOneTimePayments = [],
  isRecast = false,
  recastAmount = 50000,
  recastMonth = 60
) {
  const principal = Math.max(0, homePrice - downPayment);
  const initialMonthlyRate = (annualRate / 100) / 12;
  const adjustedMonthlyRate = (armAdjustedRate / 100) / 12;
  const standardTermMonths = termYears * 12;
  const armFixedMonths = Math.min(standardTermMonths, Math.max(1, armFixedYears * 12));

  const baseMonthlyPayment = calculateMonthlyPayment(principal, annualRate, termYears);
  let adjustedMonthlyPayment = baseMonthlyPayment;

  const isRecastActive = !!isRecast && recastAmount > 0 && recastMonth > 0 && recastMonth < standardTermMonths;
  let recastNewPayment = null;

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

    // Check for Recast at specified month
    if (isRecastActive && m === recastMonth) {
      const recastLump = Math.min(stdBalance - principalPaid, recastAmount);
      principalPaid += recastLump;
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

    // Recalculate base payment starting next month after recast
    if (isRecastActive && m === recastMonth && stdBalance > 0) {
      const remainingTermMonths = Math.max(1, standardTermMonths - recastMonth);
      const activeRate = (isArm && m >= armFixedMonths) ? armAdjustedRate : annualRate;
      stdBasePayment = calculateMonthlyPayment(stdBalance, activeRate, remainingTermMonths / 12);
      recastNewPayment = stdBasePayment;
    }
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
    let appliedExtra = extraMonthly + getLumpSumForMonth(oneTimeExtra, oneTimeMonth, m);

    // Apply recast lump sum at recastMonth
    let isRecastAppliedThisMonth = false;
    if (isRecastActive && m === recastMonth) {
      isRecastAppliedThisMonth = true;
      appliedExtra += recastAmount;
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
      cumulativeInterest: accTotalInterest,
      isRecastMonth: isRecastAppliedThisMonth
    });

    accBalance = endingBalance;

    // Recalculate base payment starting next month after recast
    if (isRecastActive && m === recastMonth && accBalance > 0) {
      const remainingTermMonths = Math.max(1, standardTermMonths - recastMonth);
      const activeRate = (isArm && m >= armFixedMonths) ? armAdjustedRate : annualRate;
      accBasePayment = calculateMonthlyPayment(accBalance, activeRate, remainingTermMonths / 12);
      if (!recastNewPayment) recastNewPayment = accBasePayment;
    }

    m++;
  }

  // Calculate summaries
  const stdTotalPaid = principal + stdTotalInterest;
  const accTotalPaid = principal + accTotalInterest;
  const interestSaved = Math.max(0, stdTotalInterest - accTotalInterest);

  const stdMonths = standardSchedule.length;
  const accMonths = acceleratedSchedule.length;
  const monthsSaved = Math.max(0, stdMonths - accMonths);

  // Breakdown of Interest Savings by Source
  let savingsMonthlyAllocated = 0;
  let savingsLumpSumAllocated = 0;

  const hasLumpSum = getTotalLumpSumAmount(oneTimeExtra) > 0 || isRecastActive;

  if (interestSaved > 0) {
    if (extraMonthly > 0 && hasLumpSum) {
      const interestWithMonthlyOnly = simulateTotalInterest(principal, annualRate, termYears, extraMonthly, 0, oneTimeMonth, isArm, armFixedYears, armAdjustedRate);
      const interestWithLumpOnly = simulateTotalInterest(principal, annualRate, termYears, 0, oneTimeExtra, oneTimeMonth, isArm, armFixedYears, armAdjustedRate);

      const standaloneMonthly = Math.max(0, stdTotalInterest - interestWithMonthlyOnly);
      const standaloneLump = Math.max(0, stdTotalInterest - interestWithLumpOnly);
      const totalStandalone = standaloneMonthly + standaloneLump;

      if (totalStandalone > 0) {
        savingsMonthlyAllocated = (standaloneMonthly / totalStandalone) * interestSaved;
        savingsLumpSumAllocated = interestSaved - savingsMonthlyAllocated;
      } else {
        savingsMonthlyAllocated = interestSaved;
        savingsLumpSumAllocated = 0;
      }
    } else if (extraMonthly > 0) {
      savingsMonthlyAllocated = interestSaved;
      savingsLumpSumAllocated = 0;
    } else if (hasLumpSum) {
      savingsMonthlyAllocated = 0;
      savingsLumpSumAllocated = interestSaved;
    }
  }

  // Calculate milestone event months
  let pmiDropMonth = null;
  const downPercent = homePrice > 0 ? (downPayment / homePrice) * 100 : 0;
  if (downPercent < 20 && homePrice > 0) {
    const target80Balance = homePrice * 0.8;
    const pmiRow = acceleratedSchedule.find(r => r.endingBalance <= target80Balance) ||
      standardSchedule.find(r => r.endingBalance <= target80Balance);
    if (pmiRow) {
      pmiDropMonth = pmiRow.month;
    }
  }

  const armResetMonth = isArm ? armFixedMonths : null;
  const acceleratedPayoffMonth = (monthsSaved > 0 && accMonths < stdMonths) ? accMonths : null;

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
      isRecast: isRecastActive,
      recastAmount: isRecastActive ? recastAmount : 0,
      recastMonth: isRecastActive ? recastMonth : null,
      recastNewPayment: isRecastActive ? (recastNewPayment || baseMonthlyPayment) : null,
      standardTotalInterest: stdTotalInterest,
      standardTotalPaid: stdTotalPaid,
      acceleratedTotalInterest: accTotalInterest,
      acceleratedTotalPaid: accTotalPaid,
      interestSaved: interestSaved,
      savingsMonthlyAllocated: savingsMonthlyAllocated,
      savingsLumpSumAllocated: savingsLumpSumAllocated,
      standardMonths: stdMonths,
      acceleratedMonths: accMonths,
      monthsSaved: monthsSaved,
      pmiDropMonth: pmiDropMonth,
      armResetMonth: armResetMonth,
      acceleratedPayoffMonth: acceleratedPayoffMonth
    }
  };
}

/**
 * Lightweight simulation helper to compute total interest under specified extra payment conditions.
 */
export function simulateTotalInterest(principal, initialRate, termYears, extraMonthly = 0, oneTimeExtra = 0, oneTimeMonth = 12, isArm = false, armFixedYears = 5, armAdjustedRate = 8) {
  let balance = principal;
  let totalInterest = 0;
  const initialMonthlyRate = (initialRate / 100) / 12;
  const adjustedMonthlyRate = (armAdjustedRate / 100) / 12;
  const armFixedMonths = armFixedYears * 12;
  let basePayment = initialMonthlyRate === 0 ? principal / (termYears * 12) : calculateMonthlyPayment(principal, initialRate, termYears);

  let m = 1;
  while (balance > 0 && m <= 600) {
    if (isArm && m === armFixedMonths + 1) {
      const remainingTermYears = Math.max(1, termYears - (armFixedMonths / 12));
      basePayment = calculateMonthlyPayment(balance, armAdjustedRate, remainingTermYears);
    }
    const currentRate = (isArm && m > armFixedMonths) ? adjustedMonthlyRate : initialMonthlyRate;
    const interestPaid = balance * currentRate;
    let scheduledPayment = basePayment;
    let basePrincipalPaid = scheduledPayment - interestPaid;
    if (balance + interestPaid < scheduledPayment) {
      basePrincipalPaid = balance;
    }
    if (basePrincipalPaid < 0) basePrincipalPaid = 0;

    let appliedExtra = extraMonthly + getLumpSumForMonth(oneTimeExtra, oneTimeMonth, m);
    let remainingAfterBase = balance - basePrincipalPaid;
    if (appliedExtra > remainingAfterBase) appliedExtra = remainingAfterBase;

    totalInterest += interestPaid;
    balance = Math.max(0, balance - (basePrincipalPaid + appliedExtra));
    m++;
  }
  return totalInterest;
}

/**
 * Calculates the extra monthly payment required to achieve the target payoff term.
 */
export function calculateTargetExtraPayment(
  targetYears = 15,
  annualRate = 6.5,
  currentSchedule = { standard: [], accelerated: [], summary: {} },
  currentExtraMonthly = 0,
  isTargetPrincipalUserModified = false,
  customTargetPrincipal = 0
) {
  const targetMonths = targetYears * 12;
  const monthlyRate = (annualRate / 100) / 12;
  const baseMonthlyPayment = currentSchedule.summary ? (currentSchedule.summary.baseMonthlyPayment || 0) : 0;

  if (isTargetPrincipalUserModified && customTargetPrincipal > 0) {
    if (customTargetPrincipal <= 0 || targetMonths <= 0) {
      return { extraRequired: 0, requiredTotalPnI: baseMonthlyPayment + currentExtraMonthly };
    }
    let requiredTotalPnI = 0;
    if (monthlyRate === 0) {
      requiredTotalPnI = customTargetPrincipal / targetMonths;
    } else {
      requiredTotalPnI = (customTargetPrincipal * (monthlyRate * Math.pow(1 + monthlyRate, targetMonths))) /
        (Math.pow(1 + monthlyRate, targetMonths) - 1);
    }
    const extraRequired = Math.max(0, requiredTotalPnI - baseMonthlyPayment);
    return { extraRequired, requiredTotalPnI };
  }

  // Automatic calculation based on accelerated schedule balance at targetMonths
  const accSchedule = currentSchedule.accelerated || [];

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
