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
    'school-students',
    'school-tuition',
    'school-staff',
    'school-facilities',
    'school-supplies',
    'school-fixed',
  ];

  /* ================= CALCULATION ================= */
  function updateEducation() {
    const students = n(document.getElementById('school-students').value);
    const tuition = n(document.getElementById('school-tuition').value);

    const staff = n(document.getElementById('school-staff').value);
    const facilities = n(document.getElementById('school-facilities').value);
    const supplies = n(document.getElementById('school-supplies').value);
    const fixed = n(document.getElementById('school-fixed').value);

    /* ---------- revenue ---------- */
    const totalRevenue = students * tuition;

    /* ---------- costs (annualized monthly items) ---------- */
    const annualCosts =
      staff * 12 + facilities * 12 + supplies * 12 + fixed * 12;

    /* ---------- profit ---------- */
    const profit = totalRevenue - annualCosts;

    const costPerStudent = students > 0 ? annualCosts / students : 0;
    const revenuePerStudent = students > 0 ? totalRevenue / students : 0;

    const roi = annualCosts ? (profit / annualCosts) * 100 : 0;
    const margin = totalRevenue ? (profit / totalRevenue) * 100 : 0;

    /* ================= OUTPUTS ================= */
    document.getElementById('school-students-output').textContent =
      students.toLocaleString();

    document.getElementById('school-revenue').textContent = money(totalRevenue);

    document.getElementById('school-total-costs').textContent =
      money(annualCosts);

    const profitEl = document.getElementById('school-profit');
    profitEl.textContent = money(profit);
    profitEl.className =
      'output-value ' + (profit >= 0 ? 'positive' : 'negative');

    document.getElementById('school-per-student').textContent =
      money(costPerStudent);

    document.getElementById('school-revenue-per-student').textContent =
      money(revenuePerStudent);

    document.getElementById('school-roi').textContent = percent(roi);

    document.getElementById('school-margin').textContent = percent(margin);
  }

  /* ================= EVENTS ================= */
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateEducation);
  });

  document.getElementById('resetBtn')?.addEventListener('click', () => {
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    updateEducation();
  });

  /* ================= INIT ================= */
  updateEducation();
});
