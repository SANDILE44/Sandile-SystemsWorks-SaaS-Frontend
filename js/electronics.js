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

  function updateElectronics() {
    clearTimeout(t);
    t = setTimeout(runElectronics, 300);
  }

  async function runElectronics() {
    const token = localStorage.getItem('token');

    const res = await fetch(
      `${API_BASE}/api/calculators/electronics/business`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          units: +$('elec-units').value || 0,
          costPerUnit: +$('elec-cost').value || 0,
          pricePerUnit: +$('elec-price').value || 0,
          fixed: +$('elec-fixed').value || 0,
          labor: +$('elec-labor').value || 0,
          operational: +$('elec-operational').value || 0,
        }),
      }
    );

    if (res.status === 403) return location.replace('payment.html');
    if (!res.ok) return;

    const d = await res.json();

    $('elec-units-output').textContent = d.units.toLocaleString();

    $('elec-revenue').textContent = money(d.revenue);
    $('elec-cogs').textContent = money(d.cogs);
    $('elec-total-costs').textContent = money(d.totalCosts);

    const p = $('elec-profit');
    p.textContent = money(d.profit);
    p.className = 'output-value ' + (d.profit >= 0 ? 'positive' : 'negative');

    $('elec-margin').textContent = percent(d.margin);
    $('elec-roi').textContent = percent(d.roi);
    $('elec-markup').textContent = percent(d.markup);

    $('elec-revenue-unit').textContent = money(d.revenuePerUnit);

    $('elec-cost-contribution').textContent = percent(d.costContribution);

    $('elec-monthly-revenue').textContent = money(d.monthlyRevenue);

    $('elec-annual-revenue').textContent = money(d.annualRevenue);

    $('elec-annual-profit').textContent = money(d.annualProfit);
  }

  [
    'elec-units',
    'elec-cost',
    'elec-price',
    'elec-fixed',
    'elec-labor',
    'elec-operational',
  ].forEach((id) => $(id)?.addEventListener('input', updateElectronics));
})();
