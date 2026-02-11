(() => {
  const $ = (id) => document.getElementById(id);

  const money = (v) =>
    'R' +
    (Number(v) || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const percent = (v) => (Number(v) || 0).toFixed(2) + '%';

  let timer;

  function updateVehicle() {
    clearTimeout(timer);
    timer = setTimeout(runVehicle, 300);
  }

  async function runVehicle() {
    const token = localStorage.getItem('token');

    const res = await fetch(`${API_BASE}/api/calculators/transport/vehicle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        units: +$('vehicle-units').value || 0,
        costPerUnit: +$('vehicle-cost').value || 0,
        pricePerUnit: +$('vehicle-price').value || 0,
        fixed: +$('vehicle-fixed').value || 0,
        labor: +$('vehicle-labor').value || 0,
        operational: +$('vehicle-operational').value || 0,
      }),
    });

    if (res.status === 403) return window.location.replace('payment.html');
    if (!res.ok) return;

    const d = await res.json();

    $('vehicle-revenue').textContent = money(d.revenue);
    $('vehicle-cogs').textContent = money(d.cogs);
    $('vehicle-gross').textContent = money(d.grossProfit);
    $('vehicle-total-costs').textContent = money(d.totalCosts);

    const profitEl = $('vehicle-profit');
    profitEl.textContent = money(d.netProfit);
    profitEl.className =
      'output-value ' + (d.netProfit >= 0 ? 'positive' : 'negative');

    $('vehicle-margin').textContent = percent(d.margin);
    $('vehicle-markup').textContent = percent(d.markup);
    $('vehicle-roi').textContent = percent(d.roi);

    $('vehicle-breakeven').textContent = d.breakevenUnits.toFixed(2);

    $('vehicle-revenue-unit').textContent = money(d.revenuePerUnit);

    $('vehicle-cost-contribution').textContent = percent(d.costContribution);

    $('vehicle-monthly-revenue').textContent = money(d.monthlyRevenue);

    $('vehicle-annual-revenue').textContent = money(d.annualRevenue);

    $('vehicle-annual-profit').textContent = money(d.annualProfit);
  }

  [
    'vehicle-units',
    'vehicle-cost',
    'vehicle-price',
    'vehicle-fixed',
    'vehicle-labor',
    'vehicle-operational',
  ].forEach((id) => $(id)?.addEventListener('input', updateVehicle));
})();
