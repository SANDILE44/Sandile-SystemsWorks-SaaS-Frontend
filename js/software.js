// ================================
// Software Profitability Calculator
// Sandile SystemsWorks
// ================================

// Auto-calculate on input
document.addEventListener('input', calcSoftware);

// Reset button
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
function calcSoftware() {
  const units = v('software-units');
  const price = v('software-price');

  const dev = v('software-dev-cost');
  const labor = v('software-labor');
  const ops = v('software-operational');

  const revenue = units * price;
  const totalCosts = dev + labor + ops;
  const profit = revenue - totalCosts;

  // Outputs
  document.getElementById('software-units-output').textContent = units;
  money('software-revenue', revenue);
  money('software-dev-cost-output', dev);
  money('software-labor-output', labor);
  money('software-operational-output', ops);
  money('software-total-costs', totalCosts);
  money('software-net-profit', profit);

  percent('software-margin', revenue ? (profit / revenue) * 100 : 0);
  percent('software-roi', totalCosts ? (profit / totalCosts) * 100 : 0);

  // Profit color
  const profitEl = document.getElementById('software-net-profit');
  profitEl.classList.remove('profit-positive', 'profit-negative');

  if (profit > 0) profitEl.classList.add('profit-positive');
  if (profit < 0) profitEl.classList.add('profit-negative');
}

// ---------------- RESET ----------------
function resetAll() {
  document.querySelectorAll('.input-section input').forEach((i) => {
    i.value = '';
  });

  calcSoftware();
}

// Initial render
calcSoftware();
