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

  function updateFB() {
    clearTimeout(t);
    t = setTimeout(runFB, 300);
  }

  async function runFB() {
    const token = localStorage.getItem('token');

    const res = await fetch(
      `${API_BASE}/api/calculators/food-beverage/business`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          units: +$('fb-units').value || 0,
          price: +$('fb-price').value || 0,
          ingredients: +$('fb-ingredients').value || 0,
          labor: +$('fb-labor').value || 0,
          equipment: +$('fb-equipment').value || 0,
          fixed: +$('fb-fixed').value || 0,
        }),
      }
    );

    if (res.status === 403) return location.replace('payment.html');
    if (!res.ok) return;

    const d = await res.json();

    $('fb-units-output').textContent = d.units.toLocaleString();
    $('fb-revenue').textContent = money(d.revenue);
    $('fb-total-costs').textContent = money(d.totalCosts);

    const p = $('fb-profit');
    p.textContent = money(d.profit);
    p.className = 'output-value ' + (d.profit >= 0 ? 'positive' : 'negative');

    $('fb-profit-per-unit').textContent = money(d.profitPerUnit);
    $('fb-margin').textContent = percent(d.margin);
    $('fb-revenue-unit').textContent = money(d.revenuePerUnit);

    $('fb-monthly-revenue').textContent = money(d.monthlyRevenue);
    $('fb-annual-revenue').textContent = money(d.annualRevenue);
    $('fb-annual-profit').textContent = money(d.annualProfit);
  }

  [
    'fb-units',
    'fb-price',
    'fb-ingredients',
    'fb-labor',
    'fb-equipment',
    'fb-fixed',
  ].forEach((id) => $(id)?.addEventListener('input', updateFB));
})();
