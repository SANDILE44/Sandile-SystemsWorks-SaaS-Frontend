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
      `${API_BASE}/api/calculators/public-administration/operations`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          budget: +$('dept-budget').value || 0,
          staffCount: +$('staff-count').value || 0,
          operationalCosts: +$('operational-costs').value || 0,
          programCosts: +$('program-costs').value || 0,
          efficiencyRate: +$('efficiency-rate').value || 0,
        }),
      }
    );

    if (res.status === 403) {
      location.replace('payment.html');
      return;
    }
    if (!res.ok) return;

    const d = await res.json();

    $('total-expenses').textContent = money(d.totalExpenses);

    $('net-budget').textContent = money(d.remainingBudget);

    $('cost-per-staff').textContent = money(d.costPerStaff);

    $('program-efficiency').textContent = percent(d.efficiencyRate);
  }

  document
    .querySelectorAll('input')
    .forEach((i) => i.addEventListener('input', update));

  update();
})();
