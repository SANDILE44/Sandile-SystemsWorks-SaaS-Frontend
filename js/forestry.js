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

  function updateForestry() {
    clearTimeout(t);
    t = setTimeout(runForestry, 300);
  }

  async function runForestry() {
    const token = localStorage.getItem('token');

    const res = await fetch(`${API_BASE}/api/calculators/forestry/business`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        volume: +$('forestry-volume').value || 0,
        price: +$('forestry-price').value || 0,
        labor: +$('forestry-labor').value || 0,
        equipment: +$('forestry-equipment').value || 0,
        replanting: +$('forestry-replanting').value || 0,
        fixed: +$('forestry-fixed').value || 0,
        months: +$('forestry-months').value || 1,
      }),
    });

    if (res.status === 403) return location.replace('payment.html');
    if (!res.ok) return;

    const d = await res.json();

    $('forestry-volume-output').textContent = d.volume.toLocaleString() + ' m³';
    $('forestry-revenue').textContent = money(d.revenue);
    $('forestry-total-costs').textContent = money(d.totalCosts);

    const p = $('forestry-profit');
    p.textContent = money(d.profit);
    p.className = 'output-value ' + (d.profit >= 0 ? 'positive' : 'negative');

    $('forestry-profit-per-unit').textContent = money(d.profitPerUnit);
    $('forestry-margin').textContent = percent(d.margin);
    $('forestry-roi').textContent = percent(d.roi);
    $('forestry-breakeven').textContent = d.breakevenVolume.toFixed(2) + ' m³';
    $('forestry-annual-profit').textContent = money(d.annualProfit);
  }

  [
    'forestry-volume',
    'forestry-price',
    'forestry-labor',
    'forestry-equipment',
    'forestry-replanting',
    'forestry-fixed',
    'forestry-months',
  ].forEach((id) => $(id)?.addEventListener('input', updateForestry));
})();
