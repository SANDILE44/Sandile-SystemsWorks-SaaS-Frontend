// ================================
// SaaS Calculator Logic
// Sandile SystemsWorks
// ================================

// Auto-calculate on any input change
document.addEventListener('input', calcSaaS);

// Reset button
document.getElementById('resetBtn')?.addEventListener('click', resetAll);

// ---------------- HELPERS ----------------
function n(id) {
  return Number(document.getElementById(id)?.value) || 0;
}

function setCurrency(id, value) {
  const el = document.getElementById(id);
  if (!el) return;

  el.textContent = value.toLocaleString('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  });
}

function setPercent(id, value) {
  const el = document.getElementById(id);
  if (!el) return;

  el.textContent = value.toFixed(2) + '%';
}

// ---------------- MAIN CALC ----------------
function calcSaaS() {
  const mrr = n('saas-mrr');
  const churnRate = n('saas-churn') / 100;

  const dev = n('saas-dev');
  const infra = n('saas-infrastructure');
  const support = n('saas-support');
  const marketing = n('saas-marketing');

  const totalCosts = dev + infra + support + marketing;
  const churnLoss = mrr * churnRate;
  const netMRR = mrr - churnLoss;
  const profit = netMRR - totalCosts;

  // ---------- OUTPUTS ----------
  setCurrency('saas-mrr-output', mrr);
  setCurrency('saas-net-mrr', netMRR);
  setCurrency('saas-churn-impact', churnLoss);
  setCurrency('saas-total-costs', totalCosts);
  setCurrency('saas-profit', profit);

  setPercent('saas-margin', mrr ? (profit / mrr) * 100 : 0);
  setPercent('saas-roi', totalCosts ? (profit / totalCosts) * 100 : 0);

  // ---------- RUNWAY ----------
  const runwayEl = document.getElementById('saas-runway');
  if (profit < 0 && totalCosts > 0) {
    runwayEl.textContent = Math.floor(mrr / totalCosts);
  } else {
    runwayEl.textContent = '∞';
  }

  // ---------- PROFIT COLOR ----------
  const profitEl = document.getElementById('saas-profit');
  profitEl.classList.remove('profit-positive', 'profit-negative');

  if (profit > 0) profitEl.classList.add('profit-positive');
  if (profit < 0) profitEl.classList.add('profit-negative');
}

// ---------------- RESET ----------------
function resetAll() {
  document.querySelectorAll('.input-section input').forEach((i) => {
    i.value = '';
  });

  calcSaaS();
}

// Initial render
calcSaaS();
