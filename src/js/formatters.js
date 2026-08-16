// ==========================================================================
// MORTGAGE-ABILITY.COM FORMATTING UTILITIES
// ==========================================================================

/**
 * Formats a numeric value into USD currency format ($X,XXX.XX)
 * @param {number} val
 * @returns {string}
 */
export function formatCurrency(val) {
  const numericVal = Number.isFinite(Number(val)) ? Number(val) : 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericVal);
}

/**
 * Formats a decimal/percentage into formatted string (X.XX%)
 * @param {number} val
 * @param {number} decimals
 * @returns {string}
 */
export function formatPercent(val, decimals = 2) {
  const numericVal = Number.isFinite(Number(val)) ? Number(val) : 0;
  return `${numericVal.toFixed(decimals)}%`;
}

/**
 * Formats total months into years and months representation
 * @param {number} totalMonths
 * @returns {string}
 */
export function formatYearsMonths(totalMonths) {
  if (!totalMonths || totalMonths <= 0) return '0 yrs';
  const yrs = Math.floor(totalMonths / 12);
  const mos = Math.round(totalMonths % 12);
  
  if (yrs > 0 && mos > 0) {
    return `${yrs} yr${yrs > 1 ? 's' : ''} ${mos} mo${mos > 1 ? 's' : ''}`;
  } else if (yrs > 0) {
    return `${yrs} yr${yrs > 1 ? 's' : ''}`;
  } else {
    return `${mos} mo${mos > 1 ? 's' : ''}`;
  }
}
