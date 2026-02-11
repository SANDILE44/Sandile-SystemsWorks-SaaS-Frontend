// ================================
// Telecom Profitability Calculator (BACKEND AUTHORITY)
// Sandile SystemsWorks
// ================================

document.addEventListener('input', calcTelecom);

// ---------------- HELPERS ----------------
function g(id) {
  return Number(document.getElementById(id)?.value) || 0;
}

function r(id, n) {
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
async function calcTelecom() {
  const data = await callCalculator(
    `${API_BASE}/api/calculators/telecom/business`,
    {
      subs: g('telecom-subscribers'),
      price: g('telecom-price'),
      infra: g('telecom-infra'),
      labor: g('telecom-labor'),
      ops: g('telecom-operational'),
    }
  );

  if (!data) return;

  document.getElementById('telecom-subscribers-output').textContent = data.subs;

  r('telecom-revenue', data.revenue);
  r('telecom-total-costs', data.totalCosts);
  r('telecom-net-profit', data.profit);
  r('telecom-monthly', data.monthlyProfit);
  r('telecom-annualized', data.annualProfit);

  document.getElementById('telecom-margin').textContent =
    (Number(data.margin) || 0).toFixed(2) + '%';

  document.getElementById('telecom-roi').textContent =
    (Number(data.roi) || 0).toFixed(2) + '%';
}

// Initial render
calcTelecom();
