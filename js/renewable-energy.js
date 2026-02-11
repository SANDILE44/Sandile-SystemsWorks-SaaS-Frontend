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
    const res = await fetch(`${API_BASE}/api/calculators/energy/renewable`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        install: +$('energy-install').value || 0,
        maintenance: +$('energy-maintenance').value || 0,
        revenue: +$('energy-revenue').value || 0,
        years: +$('energy-life').value || 0,
      }),
    });

    if (res.status === 403) return location.replace('payment.html');
    if (!res.ok) return;

    const d = await res.json();

    $('energy-total-costs').textContent = money(d.totalCosts);
    $('energy-total-revenue').textContent = money(d.totalRevenue);
    $('energy-profit').textContent = money(d.profit);
    $('energy-roi').textContent = percent(d.roi);
    $('energy-payback').textContent = d.payback !== null ? d.payback : '—';
  }

  document
    .querySelectorAll('input')
    .forEach((i) => i.addEventListener('input', update));

  update();
})();
