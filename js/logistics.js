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

  function updateLogistics() {
    clearTimeout(t);
    t = setTimeout(runLogistics, 300);
  }

  async function runLogistics() {
    const token = localStorage.getItem('token');

    const res = await fetch(`${API_BASE}/api/calculators/logistics/business`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        shipments: +$('log-shipments').value || 0,
        revenuePer: +$('log-revenue').value || 0,
        fuel: +$('log-fuel').value || 0,
        labor: +$('log-labor').value || 0,
        maintenance: +$('log-maintenance').value || 0,
        fixed: +$('log-fixed').value || 0,
      }),
    });

    if (res.status === 403) return location.replace('payment.html');
    if (!res.ok) return;

    const d = await res.json();

    $('log-shipments-output').textContent = d.shipments;
    $('log-total-revenue').textContent = money(d.totalRevenue);
    $('log-total-costs').textContent = money(d.totalCosts);
    $('log-profit').textContent = money(d.profit);
    $('log-per-shipment').textContent = money(d.costPerShipment);
    $('log-margin').textContent = percent(d.margin);
    $('log-roi').textContent = percent(d.roi);
  }

  document
    .querySelectorAll('input')
    .forEach((i) => i.addEventListener('input', updateLogistics));
})();
