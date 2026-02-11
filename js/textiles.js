// ================================
// Textiles Profitability Calculator (BACKEND AUTHORITY)
// Sandile SystemsWorks
// ================================

document.addEventListener('input', calcTextiles);
document.getElementById('textiles-reset')?.addEventListener('click', reset);

// ---------------- HELPERS ----------------
function x(id) {
  return Number(document.getElementById(id)?.value) || 0;
}

function z(id, n) {
  const el = document.getElementById(id);
  if (!el) return;

  el.textContent = (Number(n) || 0).toLocaleString('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  });
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
async function calcTextiles() {
  const data = await callCalculator(
    `${API_BASE}/api/calculators/textiles/business`,
    {
      units: x('textiles-units'),
      price: x('textiles-price'),
      material: x('textiles-material'),
      labor: x('textiles-labor'),
      fixed: x('textiles-fixed'),
      operational: x('textiles-operational'),
    }
  );

  if (!data) return;

  document.getElementById('textiles-units-output').textContent = data.units;

  z('textiles-revenue', data.revenue);
  z('textiles-material-total', data.materialTotal);
  z('textiles-total-costs', data.totalCosts);
  z('textiles-net-profit', data.profit);

  document.getElementById('textiles-margin').textContent =
    (Number(data.margin) || 0).toFixed(2) + '%';

  document.getElementById('textiles-roi').textContent =
    (Number(data.roi) || 0).toFixed(2) + '%';
}

function reset() {
  document.querySelectorAll('input').forEach((i) => (i.value = ''));
  calcTextiles();
}

// Initial render
calcTextiles();
