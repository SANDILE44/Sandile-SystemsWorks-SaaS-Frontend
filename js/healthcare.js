document.addEventListener('DOMContentLoaded', () => {
  /* ================= HELPERS ================= */
  const n = (v) => parseFloat(v) || 0;

  const money = (v) =>
    'R' +
    Number(v).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const percent = (v) => Number(v).toFixed(2) + '%';

  /* ================= INPUT IDS ================= */
  const ids = [
    'clinic-patients',
    'clinic-fee',
    'clinic-working-days',
    'clinic-staff',
    'clinic-supplies',
    'clinic-fixed',
  ];

  /* ================= CALCULATION ================= */
  function updateClinic() {
    const patientsPerDay = n(document.getElementById('clinic-patients').value);
    const fee = n(document.getElementById('clinic-fee').value);
    const days = n(document.getElementById('clinic-working-days').value);
    const staff = n(document.getElementById('clinic-staff').value);
    const supplies = n(document.getElementById('clinic-supplies').value);
    const fixed = n(document.getElementById('clinic-fixed').value);

    const monthlyPatients = patientsPerDay * days;
    const revenue = monthlyPatients * fee;
    const totalCosts = staff + supplies + fixed;
    const profit = revenue - totalCosts;

    const costPerPatient = monthlyPatients ? totalCosts / monthlyPatients : 0;

    const revenuePerPatient = monthlyPatients ? revenue / monthlyPatients : 0;

    const margin = revenue ? (profit / revenue) * 100 : 0;
    const roi = totalCosts ? (profit / totalCosts) * 100 : 0;

    /* ================= OUTPUTS ================= */
    document.getElementById('clinic-monthly-patients').textContent =
      monthlyPatients.toLocaleString();

    document.getElementById('clinic-revenue').textContent = money(revenue);

    document.getElementById('clinic-total-costs').textContent =
      money(totalCosts);

    const profitEl = document.getElementById('clinic-profit');
    profitEl.textContent = money(profit);
    profitEl.className =
      'output-value ' + (profit >= 0 ? 'positive' : 'negative');

    document.getElementById('clinic-per-patient').textContent =
      money(costPerPatient);

    document.getElementById('clinic-revenue-per-patient').textContent =
      money(revenuePerPatient);

    document.getElementById('clinic-margin').textContent = percent(margin);

    document.getElementById('clinic-roi').textContent = percent(roi);
  }

  /* ================= EVENTS ================= */
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateClinic);
  });

  /* ================= RESET ================= */
  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      updateClinic();
    });
  }

  /* ================= INIT ================= */
  updateClinic();
});
