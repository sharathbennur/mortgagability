// ==========================================================================
// MORTGAGE-ABILITY.COM PAYOFF SIMULATOR & ONE-TIME PAYMENTS MODULE
// ==========================================================================

import { formatCurrency } from '../formatters.js';
import { getTotalLumpSumAmount } from '../core/calculations.js';

let scheduledOneTimePayments = [
  { id: 'default-1', amount: 5000, month: 12 }
];

let isOneTimePaymentsHandlersInitialized = false;

export function getScheduledOneTimePayments() {
  return scheduledOneTimePayments;
}

export function setScheduledOneTimePayments(payments, onRecalculate) {
  scheduledOneTimePayments = Array.isArray(payments) ? payments : [];
  renderOneTimePaymentsList();
  if (typeof onRecalculate === 'function') {
    onRecalculate();
  }
}

export function renderOneTimePaymentsList() {
  const listContainer = document.getElementById('onetime-payments-list');
  const countBadge = document.getElementById('onetime-list-count');
  const totalValEl = document.getElementById('modal-onetime-total-val');
  const mainInputEl = document.getElementById('one-time-extra');

  // Sort by month ascending
  scheduledOneTimePayments.sort((a, b) => a.month - b.month);

  const totalSum = getTotalLumpSumAmount(scheduledOneTimePayments);

  if (mainInputEl) mainInputEl.value = totalSum;
  if (totalValEl) totalValEl.textContent = formatCurrency(totalSum);
  if (countBadge) {
    countBadge.textContent = `${scheduledOneTimePayments.length} Payment${scheduledOneTimePayments.length === 1 ? '' : 's'}`;
  }

  if (!listContainer) return;

  if (scheduledOneTimePayments.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-onetime-state">
        <i class="fa-solid fa-calendar-minus" style="font-size: 1.5rem; margin-bottom: 6px; display: block;"></i>
        No one-time extra payments scheduled. Use the form above to add one!
      </div>
    `;
    return;
  }

  listContainer.innerHTML = scheduledOneTimePayments.map(item => {
    const yr = Math.floor((item.month - 1) / 12) + 1;
    const moRem = ((item.month - 1) % 12) + 1;
    const timeLabel = `Month ${item.month} (Yr ${yr}${moRem > 1 ? `, Mo ${moRem}` : ''})`;

    return `
      <div class="onetime-payment-row">
        <div class="onetime-payment-info">
          <span class="onetime-month-pill">${timeLabel}</span>
          <strong class="onetime-amount-val">${formatCurrency(item.amount)}</strong>
        </div>
        <button type="button" class="btn-delete-onetime" data-id="${item.id}" title="Remove payment">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `;
  }).join('');
}

export function setupOneTimePaymentsHandlers(onRecalculate) {
  if (isOneTimePaymentsHandlersInitialized) return;
  isOneTimePaymentsHandlersInitialized = true;

  const btnManage = document.getElementById('btn-manage-onetime');
  const inputDisplay = document.getElementById('one-time-extra');
  const modal = document.getElementById('modal-onetime-payments');
  const btnCloseX = document.getElementById('btn-x-close-onetime');
  const btnClose = document.getElementById('btn-close-onetime-modal');
  const btnAdd = document.getElementById('btn-add-onetime-item');
  const inputAddAmount = document.getElementById('input-add-onetime-amount');
  const inputAddMonth = document.getElementById('input-add-onetime-month');
  const hintYear = document.getElementById('add-onetime-year-hint');
  const listContainer = document.getElementById('onetime-payments-list');

  const openModal = () => {
    if (modal) {
      modal.style.display = 'flex';
      renderOneTimePaymentsList();
    }
  };

  const closeModal = () => {
    if (modal) modal.style.display = 'none';
  };

  if (btnManage) btnManage.addEventListener('click', openModal);
  if (inputDisplay) inputDisplay.addEventListener('click', openModal);
  if (btnCloseX) btnCloseX.addEventListener('click', closeModal);
  if (btnClose) btnClose.addEventListener('click', closeModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  if (inputAddMonth && hintYear) {
    const updateYearHint = () => {
      const m = parseInt(inputAddMonth.value) || 1;
      const yr = Math.floor((m - 1) / 12) + 1;
      const moRem = ((m - 1) % 12) + 1;
      hintYear.textContent = moRem === 12 ? `(Yr ${yr})` : `(Yr ${yr}, Mo ${moRem})`;
    };
    inputAddMonth.addEventListener('input', updateYearHint);
    updateYearHint();
  }

  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      const amount = parseFloat(inputAddAmount ? inputAddAmount.value : 0) || 0;
      const month = parseInt(inputAddMonth ? inputAddMonth.value : 1) || 1;

      if (amount <= 0) return;

      scheduledOneTimePayments.push({
        id: Date.now().toString() + Math.random().toString().slice(2, 6),
        amount: amount,
        month: month
      });

      scheduledOneTimePayments.sort((a, b) => a.month - b.month);

      renderOneTimePaymentsList();
      if (typeof onRecalculate === 'function') {
        onRecalculate();
      }
    });
  }

  if (listContainer) {
    listContainer.addEventListener('click', (e) => {
      const btnDelete = e.target.closest('.btn-delete-onetime');
      if (!btnDelete) return;

      const idToDelete = btnDelete.getAttribute('data-id');
      scheduledOneTimePayments = scheduledOneTimePayments.filter(p => p.id !== idToDelete);

      renderOneTimePaymentsList();
      if (typeof onRecalculate === 'function') {
        onRecalculate();
      }
    });
  }
}
