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
    const res = await fetch(`${API_BASE}/api/calculators/rnd/investment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        cost: +$('rd-cost').value || 0,
        years: +$('rd-years').value || 0,
        revenue: +$('rd-revenue').value || 0,
        operating: +$('rd-operating').value || 0,
      }),
    });

    if (res.status === 403) return location.replace('payment.html');
    if (!res.ok) return;

    const d = await res.json();

    $('rd-profit').textContent = money(d.annualProfit);
    $('rd-monthly').textContent = money(d.monthlyProfit);
    $('rd-net').textContent = money(d.netGain);
    $('rd-annualized').textContent = money(d.annualizedGain);
    $('rd-roi').textContent = percent(d.roi);
    $('rd-payback').textContent =
      d.payback !== null ? d.payback.toFixed(1) : '—';
  }

  document
    .querySelectorAll('input')
    .forEach((i) => i.addEventListener('input', update));

  update();
})();
