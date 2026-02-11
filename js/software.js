// ================================
// Software Profitability Calculator (BACKEND AUTHORITY)
// Sandile SystemsWorks
// ================================

document.addEventListener('input', calcSoftware);
document.getElementById('resetBtn')?.addEventListener('click', resetAll);

// ---------------- HELPERS ----------------
function v(id) {
  return Number(document.getElementById(id)?.value) || 0;
}

function money(id, value) {
  const el = document.getElementById(id);
  if (!el) return;

  el.textContent = (Number(value) || 0).toLocaleString('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  });
}

function percent(id, value) {
  const el = document.getElementById(id);
  if (!el) return;

  el.textContent = (Number(value) || 0).toFixed(2) + '%';
}

// ✅ Shared helper (INSIDE this file so nothing is missing)
async function callCalculator(endpoint, payload) {
  const token = localStorage.getItem('token');

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (res.status === 403) {
    window.location.replace('payment.html');
    return null;
  }

  if (!res.ok) return null;

  return res.json();
}

// ---------------- MAIN CALC ----------------
async function calcSoftware() {
  const data = await callCalculator(
    `${API_BASE}/api/calculators/software/business`,
    {
      units: v('software-units'),
      price: v('software-price'),
      dev: v('software-dev-cost'),
      labor: v('software-labor'),
      ops: v('software-operational'),
    }
  );

  if (!data) return;

  document.getElementById('software-units-output').textContent = data.units;

  money('software-revenue', data.revenue);
  money('software-dev-cost-output', v('software-dev-cost'));
  money('software-labor-output', v('software-labor'));
  money('software-operational-output', v('software-operational'));
  money('software-total-costs', data.totalCosts);
  money('software-net-profit', data.profit);

  percent('software-margin', data.margin);
  percent('software-roi', data.roi);

  const profitEl = document.getElementById('software-net-profit');
  profitEl?.classList.remove('profit-positive', 'profit-negative');
  if (data.profit > 0) profitEl?.classList.add('profit-positive');
  if (data.profit < 0) profitEl?.classList.add('profit-negative');
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
