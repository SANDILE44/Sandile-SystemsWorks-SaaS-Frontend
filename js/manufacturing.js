(() => {
  const $ = (id) => document.getElementById(id);
  const money = (v) => 'R' + (Number(v) || 0).toFixed(2);
  const percent = (v) => (Number(v) || 0).toFixed(2) + '%';

  let t;
  function update() {
    clearTimeout(t);
    t = setTimeout(run, 300);
  }

  async function run() {
    const res = await fetch(
      `${API_BASE}/api/calculators/manufacturing/business`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          units: +$('mfg-units').value || 0,
          price: +$('mfg-price').value || 0,
          material: +$('mfg-material').value || 0,
          labor: +$('mfg-labor').value || 0,
          fixed: +$('mfg-fixed').value || 0,
          operational: +$('mfg-operational').value || 0,
        }),
      }
    );

    if (res.status === 403) return location.replace('payment.html');
    if (!res.ok) return;

    const d = await res.json();

    $('mfg-units-output').textContent = d.units;
    $('mfg-revenue').textContent = money(d.revenue);
    $('mfg-total-costs').textContent = money(d.totalCosts);
    $('mfg-cost-per-unit').textContent = money(d.costPerUnit);
    $('mfg-revenue-per-unit').textContent = money(d.revenue / d.units || 0);
    $('mfg-profit-per-unit').textContent = money(d.profitPerUnit);
    $('mfg-profit').textContent = money(d.profit);
    $('mfg-breakeven').textContent = d.breakeven;
    $('mfg-roi').textContent = percent(d.roi);
    $('mfg-margin').textContent = percent(d.margin);
    $('mfg-monthly-revenue').textContent = money(d.monthlyRevenue);
    $('mfg-annual-revenue').textContent = money(d.annualRevenue);
  }

  document
    .querySelectorAll('input')
    .forEach((i) => i.addEventListener('input', update));
})();
