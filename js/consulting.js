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

  function updateConsulting() {
    clearTimeout(timer);
    timer = setTimeout(runConsulting, 300);
  }

  async function runConsulting() {
    const token = localStorage.getItem('token');

    const res = await fetch(`${API_BASE}/api/calculators/consulting/project`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        hours: +$('consult-hours').value || 0,
        rate: +$('consult-rate').value || 0,
        expenses: +$('consult-expenses').value || 0,
        labor: +$('consult-labor').value || 0,
        fixed: +$('consult-fixed').value || 0,
        discountPct: +$('consult-discount').value || 0,
        otHours: +$('consult-overtime-hours').value || 0,
        otRate: +$('consult-overtime-rate').value || 0,
        variableCosts: +$('consult-variable-costs').value || 0,
        contingencyPct: +$('consult-contingency').value || 0,
      }),
    });

    if (res.status === 403) return location.replace('payment.html');
    if (!res.ok) return;

    const d = await res.json();

    $('consult-revenue').textContent = money(d.totalRevenue);
    $('consult-discount-output').textContent = money(d.discountAmount);
    $('consult-revenue-after-discount').textContent = money(
      d.revenueAfterDiscount
    );

    $('consult-expenses-output').textContent = money(d.expenses || 0);
    $('consult-labor-output').textContent = money(d.labor || 0);
    $('consult-fixed-output').textContent = money(d.fixed || 0);

    $('consult-overtime-output').textContent = money(d.overtimeRevenue);
    $('consult-variable-output').textContent = money(d.variableCosts || 0);
    $('consult-contingency-output').textContent = money(d.contingencyAmount);

    $('consult-costs').textContent = money(d.totalCosts);

    const p = $('consult-profit');
    p.textContent = money(d.profit);
    p.className = 'output-value ' + (d.profit >= 0 ? 'positive' : 'negative');

    $('consult-profit-hour').textContent = money(d.profitPerHour);
    $('consult-margin').textContent = percent(d.margin);
    $('consult-roi').textContent = percent(d.roi);
    $('consult-breakeven').textContent = d.breakevenHours.toFixed(2);
  }

  [
    'consult-hours',
    'consult-rate',
    'consult-expenses',
    'consult-labor',
    'consult-fixed',
    'consult-discount',
    'consult-overtime-hours',
    'consult-overtime-rate',
    'consult-variable-costs',
    'consult-contingency',
  ].forEach((id) => $(id)?.addEventListener('input', updateConsulting));
})();
