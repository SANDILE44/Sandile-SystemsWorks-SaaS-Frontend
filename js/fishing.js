(() => {
  const $ = (id) => document.getElementById(id);

  const money = (v) =>
    'R' +
    (Number(v) || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const percent = (v) => (Number(v) || 0).toFixed(2) + '%';

  let t;

  function updateFishing() {
    clearTimeout(t);
    t = setTimeout(runFishing, 300);
  }

  async function runFishing() {
    const token = localStorage.getItem('token');

    const res = await fetch(`${API_BASE}/api/calculators/fishing/business`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        catchKg: +$('fish-catch').value || 0,
        priceKg: +$('fish-price').value || 0,
        fuel: +$('fish-fuel').value || 0,
        labor: +$('fish-labor').value || 0,
        equipment: +$('fish-equipment').value || 0,
        fixed: +$('fish-fixed').value || 0,
      }),
    });

    if (res.status === 403) return location.replace('payment.html');
    if (!res.ok) return;

    const d = await res.json();

    $('fish-catch-output').textContent = d.catchKg.toLocaleString();

    $('fish-revenue').textContent = money(d.revenue);
    $('fish-total-costs').textContent = money(d.totalCosts);

    $('fish-breakeven').textContent = d.breakevenCatch.toFixed(2);

    const p = $('fish-profit');
    p.textContent = money(d.profit);
    p.className = 'output-value ' + (d.profit >= 0 ? 'positive' : 'negative');

    $('fish-profit-per-kg').textContent = money(d.profitPerKg);

    $('fish-margin').textContent = percent(d.margin);

    $('fish-monthly-revenue').textContent = money(d.monthlyRevenue);

    $('fish-annual-revenue').textContent = money(d.annualRevenue);
  }

  [
    'fish-catch',
    'fish-price',
    'fish-fuel',
    'fish-labor',
    'fish-equipment',
    'fish-fixed',
  ].forEach((id) => $(id)?.addEventListener('input', updateFishing));
})();
