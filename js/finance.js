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

  function updateFinance() {
    clearTimeout(t);
    t = setTimeout(runFinance, 300);
  }

  async function runFinance() {
    const token = localStorage.getItem('token');

    const res = await fetch(`${API_BASE}/api/calculators/finance/business`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        clients: +$('fin-clients').value || 0,
        fee: +$('fin-fee').value || 0,
        staff: +$('fin-staff').value || 0,
        technology: +$('fin-technology').value || 0,
        fixed: +$('fin-fixed').value || 0,
        operational: +$('fin-operational').value || 0,
      }),
    });

    if (res.status === 403) return location.replace('payment.html');
    if (!res.ok) return;

    const d = await res.json();

    $('fin-clients-output').textContent = d.clients.toLocaleString();

    $('fin-revenue').textContent = money(d.revenue);
    $('fin-total-costs').textContent = money(d.totalCosts);

    const p = $('fin-profit');
    p.textContent = money(d.profit);
    p.className = 'output-value ' + (d.profit >= 0 ? 'positive' : 'negative');

    $('fin-per-client').textContent = money(d.profitPerClient);

    $('fin-cost-per-client').textContent = money(d.costPerClient);

    $('fin-roi').textContent = percent(d.roi);
    $('fin-margin').textContent = percent(d.margin);
  }

  [
    'fin-clients',
    'fin-fee',
    'fin-staff',
    'fin-technology',
    'fin-fixed',
    'fin-operational',
  ].forEach((id) => $(id)?.addEventListener('input', updateFinance));
})();
