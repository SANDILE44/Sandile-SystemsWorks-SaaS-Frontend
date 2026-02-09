// ================================
// IT Services Profitability Calculator
// Sandile SystemsWorks
// ================================

// Auto-calc on input
document.addEventListener('input', calcIT);

// Reset
document.getElementById('resetBtn')?.addEventListener('click', resetAll);

// ---------------- HELPERS ----------------
function v(id) {
  return Number(document.getElementById(id)?.value) || 0;
}

function money(id, value) {
  const el = document.getElementById(id);
  if (!el) return;

  el.textContent = value.toLocaleString('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  });
}

function percent(id, value) {
  const el = document.getElementById(id);
  if (!el) return;

  el.textContent = value.toFixed(2) + '%';
}

// ---------------- MAIN CALC ----------------
function calcIT() {
  const hours = v('it-hours');
  const rate = v('it-hourly-rate');

  const labor = v('it-labor-cost');
  const software = v('it-software-cost');
  const fixed = v('it-fixed-cost');

  const revenue = hours * rate;
  const totalCosts = labor + software + fixed;
  const profit = revenue - totalCosts;

  // Outputs
  money('it-revenue', revenue);
  money('it-total-costs', totalCosts);
  money('it-profit', profit);

  money('it-profit-hour', hours ? profit / hours : 0);
  percent('it-margin', revenue ? (profit / revenue) * 100 : 0);
  percent('it-roi', totalCosts ? (profit / totalCosts) * 100 : 0);

  document.getElementById('it-breakeven').textContent = rate
    ? (totalCosts / rate).toFixed(1)
    : '0';

  // Assumption: one project per month
  money('it-monthly', profit);
  money('it-annual', profit * 12);

  // Profit color
  const profitEl = document.getElementById('it-profit');
  profitEl.classList.remove('profit-positive', 'profit-negative');

  if (profit > 0) profitEl.classList.add('profit-positive');
  if (profit < 0) profitEl.classList.add('profit-negative');
}

// ---------------- RESET ----------------
function resetAll() {
  document.querySelectorAll('.input-section input').forEach((i) => {
    i.value = '';
  });
  calcIT();
}

// Initial render
calcIT();
