(() => {
  const $ = (id) => document.getElementById(id);
  const money = (v) => `R${(Number(v) || 0).toFixed(2)}`;
  const percent = (v) => `${(Number(v) || 0).toFixed(2)}%`;

  let t;
  function update() {
    clearTimeout(t);
    t = setTimeout(run, 300);
  }

  async function run() {
    const res = await fetch(`${API_BASE}/api/calculators/energy/production`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        volume: +$('production-volume').value || 0,
        price: +$('price-per-barrel').value || 0,
        opex: +$('operational-expenses').value || 0,
        capex: +$('capex').value || 0,
        fixed: +$('fixed-costs').value || 0,
      }),
    });

    if (res.status === 403) return location.replace('payment.html');
    if (!res.ok) return;

    const d = await res.json();

    $('total-revenue').textContent = money(d.revenue);
    $('total-costs').textContent = money(d.totalCosts);
    $('profit-loss').textContent = money(d.profit);
    $('revenue-per-barrel').textContent = money(d.revenuePerUnit);
    $('cost-per-barrel').textContent = money(d.costPerUnit);
    $('roi').textContent = percent(d.roi);
    $('margin').textContent = percent(d.margin);
  }

  document
    .querySelectorAll('input')
    .forEach((i) => i.addEventListener('input', update));
})();
