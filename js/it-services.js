(() => {
  const $ = (id) => document.getElementById(id);

  const money = (v) =>
    v.toLocaleString('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    });

  const percent = (v) => (Number(v) || 0).toFixed(2) + '%';

  let t;

  function updateIT() {
    clearTimeout(t);
    t = setTimeout(runIT, 300);
  }

  async function runIT() {
    const token = localStorage.getItem('token');

    const res = await fetch(`${API_BASE}/api/calculators/it/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        hours: +$('it-hours').value || 0,
        rate: +$('it-hourly-rate').value || 0,
        labor: +$('it-labor-cost').value || 0,
        software: +$('it-software-cost').value || 0,
        fixed: +$('it-fixed-cost').value || 0,
      }),
    });

    if (res.status === 403) return location.replace('payment.html');
    if (!res.ok) return;

    const d = await res.json();

    $('it-revenue').textContent = money(d.revenue);
    $('it-total-costs').textContent = money(d.totalCosts);
    $('it-profit').textContent = money(d.profit);
    $('it-profit-hour').textContent = money(d.profitPerHour);
    $('it-margin').textContent = percent(d.margin);
    $('it-roi').textContent = percent(d.roi);
    $('it-breakeven').textContent = d.breakevenHours.toFixed(1);
    $('it-monthly').textContent = money(d.monthlyProfit);
    $('it-annual').textContent = money(d.annualProfit);
  }

  document
    .querySelectorAll('.input-section input')
    .forEach((i) => i.addEventListener('input', updateIT));
})();
