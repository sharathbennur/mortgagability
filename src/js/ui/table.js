// ==========================================================================
// MORTGAGE-ABILITY.COM AMORTIZATION TABLE COMPONENT
// ==========================================================================

import { formatCurrency } from '../formatters.js';

export function getAnnualSchedule(acceleratedSchedule = []) {
  const annual = [];
  if (!acceleratedSchedule || acceleratedSchedule.length === 0) return annual;

  let currentYear = 1;
  let yearStartingBalance = acceleratedSchedule[0].startingBalance;
  let yearBasePayment = 0;
  let yearExtraPayment = 0;
  let yearInterest = 0;
  let yearPrincipal = 0;

  acceleratedSchedule.forEach((row, index) => {
    yearBasePayment += row.basePayment;
    yearExtraPayment += row.extraPayment;
    yearInterest += row.interestPaid;
    yearPrincipal += row.principalPaid;

    if (row.month % 12 === 0 || index === acceleratedSchedule.length - 1) {
      annual.push({
        year: currentYear,
        startingBalance: yearStartingBalance,
        basePayment: yearBasePayment,
        extraPayment: yearExtraPayment,
        interestPaid: yearInterest,
        principalPaid: yearPrincipal,
        endingBalance: row.endingBalance
      });

      currentYear++;
      yearStartingBalance = row.endingBalance;
      yearBasePayment = 0;
      yearExtraPayment = 0;
      yearInterest = 0;
      yearPrincipal = 0;
    }
  });

  return annual;
}

export function renderTable(
  currentSchedule = { accelerated: [] },
  activeTableViewMode = 'annual',
  currentTablePage = 1,
  rowsPerPage = 12,
  onPageChange
) {
  const elScheduleTbody = document.getElementById('schedule-tbody');
  const elTablePagination = document.getElementById('table-pagination');
  const elBtnPrevPage = document.getElementById('btn-prev-page');
  const elBtnNextPage = document.getElementById('btn-next-page');
  const elPaginationInfo = document.getElementById('pagination-info');

  if (!elScheduleTbody) return;

  elScheduleTbody.innerHTML = '';

  const isAnnual = activeTableViewMode === 'annual';
  let data = [];

  if (isAnnual) {
    data = getAnnualSchedule(currentSchedule.accelerated || []);
    if (elTablePagination) elTablePagination.style.display = 'none';
  } else {
    data = currentSchedule.accelerated || [];
    if (elTablePagination) elTablePagination.style.display = 'flex';
  }

  if (data.length === 0) {
    elScheduleTbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No schedule data available.</td></tr>`;
    return;
  }

  let displayData = data;
  let activePage = currentTablePage;

  if (!isAnnual) {
    const totalPages = Math.ceil(data.length / rowsPerPage);
    activePage = Math.max(1, Math.min(activePage, totalPages));

    if (elBtnPrevPage) elBtnPrevPage.disabled = activePage === 1;
    if (elBtnNextPage) elBtnNextPage.disabled = activePage === totalPages;
    if (elPaginationInfo) elPaginationInfo.textContent = `Page ${activePage} of ${totalPages}`;

    const startIndex = (activePage - 1) * rowsPerPage;
    displayData = data.slice(startIndex, startIndex + rowsPerPage);
  }

  displayData.forEach(row => {
    const tr = document.createElement('tr');
    const label = isAnnual ? `Year ${row.year}` : `Month ${row.month}`;
    const extraClass = row.extraPayment > 0 ? 'text-success font-semibold' : 'text-muted';

    tr.innerHTML = `
      <td class="text-center font-semibold">${label}</td>
      <td class="text-right">${formatCurrency(row.startingBalance)}</td>
      <td class="text-right">${formatCurrency(row.basePayment)}</td>
      <td class="text-right ${extraClass}">${row.extraPayment > 0 ? '+' + formatCurrency(row.extraPayment) : '$0.00'}</td>
      <td class="text-right text-warning">${formatCurrency(row.interestPaid)}</td>
      <td class="text-right text-primary">${formatCurrency(row.principalPaid)}</td>
      <td class="text-right font-semibold">${formatCurrency(row.endingBalance)}</td>
    `;
    elScheduleTbody.appendChild(tr);
  });
}

export function exportScheduleToCSV(currentSchedule, activeTableViewMode) {
  const isAnnual = activeTableViewMode === 'annual';
  const data = isAnnual ? getAnnualSchedule(currentSchedule.accelerated || []) : (currentSchedule.accelerated || []);

  if (data.length === 0) return;

  let csvContent = "data:text/csv;charset=utf-8,";
  const headers = isAnnual
    ? ["Year", "Starting Balance", "Base P&I Payment", "Extra Principal Payment", "Interest Paid", "Principal Paid", "Ending Balance"]
    : ["Month", "Starting Balance", "Scheduled P&I Payment", "Extra Payment Applied", "Interest Paid", "Principal Paid", "Ending Balance"];

  csvContent += headers.join(",") + "\n";

  data.forEach(row => {
    const label = isAnnual ? row.year : row.month;
    const line = [
      label,
      row.startingBalance.toFixed(2),
      row.basePayment.toFixed(2),
      row.extraPayment.toFixed(2),
      row.interestPaid.toFixed(2),
      row.principalPaid.toFixed(2),
      row.endingBalance.toFixed(2)
    ];
    csvContent += line.join(",") + "\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `mortgage_schedule_${isAnnual ? 'annual' : 'monthly'}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
