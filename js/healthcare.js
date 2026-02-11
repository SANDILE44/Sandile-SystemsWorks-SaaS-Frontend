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

  function updateClinic() {
    clearTimeout(t);
    t = setTimeout(runClinic, 300);
  }

  async function runClinic() {
    const token = localStorage.getItem('token');

    const res = await fetch(`${API_BASE}/api/calculators/healthcare/clinic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        patientsPerDay: +$('clinic-patients').value || 0,
        fee: +$('clinic-fee').value || 0,
        days: +$('clinic-working-days').value || 0,
        staff: +$('clinic-staff').value || 0,
        supplies: +$('clinic-supplies').value || 0,
        fixed: +$('clinic-fixed').value || 0,
      }),
    });

    if (res.status === 403) return location.replace('payment.html');
    if (!res.ok) return;

    const d = await res.json();

    $('clinic-monthly-patients').textContent =
      d.monthlyPatients.toLocaleString();
    $('clinic-revenue').textContent = money(d.revenue);
    $('clinic-total-costs').textContent = money(d.totalCosts);

    const p = $('clinic-profit');
    p.textContent = money(d.profit);
    p.className = 'output-value ' + (d.profit >= 0 ? 'positive' : 'negative');

    $('clinic-per-patient').textContent = money(d.costPerPatient);
    $('clinic-revenue-per-patient').textContent = money(d.revenuePerPatient);
    $('clinic-margin').textContent = percent(d.margin);
    $('clinic-roi').textContent = percent(d.roi);
  }

  [
    'clinic-patients',
    'clinic-fee',
    'clinic-working-days',
    'clinic-staff',
    'clinic-supplies',
    'clinic-fixed',
  ].forEach((id) => $(id)?.addEventListener('input', updateClinic));
})();
