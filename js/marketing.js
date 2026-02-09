// ================================
// Marketing Campaign Calculator
// Sandile SystemsWorks
// ================================

// Auto-calc on any input change
document.addEventListener('input', calcMarketing);

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
function calcMarketing() {
  const campaigns = v('marketing-campaigns');
  const budget = v('marketing-budget');
  const revenue = v('marketing-revenue');
  const staff = v('marketing-staff');
  const fixed = v('marketing-fixed');
  const variable = v('marketing-variable');

  const totalCosts = budget + staff + fixed + variable;
  const profit = revenue - totalCosts;

  // Outputs
  money('marketing-total-revenue', revenue);
  money('marketing-total-costs', totalCosts);
  money('marketing-profit', profit);

  money('marketing-revenue-per-campaign', campaigns ? revenue / campaigns : 0);
  money('marketing-cost-per-campaign', campaigns ? totalCosts / campaigns : 0);

  percent('marketing-roi', totalCosts ? (profit / totalCosts) * 100 : 0);
  percent('marketing-margin', revenue ? (profit / revenue) * 100 : 0);

  // 🔴🟢 PROFIT COLOR (LOCKED)
  const profitEl = document.getElementById('marketing-profit');
  if (!profitEl) return;

  profitEl.classList.remove('profit-positive', 'profit-negative');

  if (profit > 0) {
    profitEl.classList.add('profit-positive');
  } else if (profit < 0) {
    profitEl.classList.add('profit-negative');
  }
}

// ---------------- RESET ----------------
function resetAll() {
  document.querySelectorAll('.input-section input').forEach((i) => {
    i.value = '';
  });
  calcMarketing();
}

// Initial render
calcMarketing();
