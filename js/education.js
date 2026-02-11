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

  function updateEducation() {
    clearTimeout(timer);
    timer = setTimeout(runEducation, 300);
  }

  async function runEducation() {
    const token = localStorage.getItem('token');

    const res = await fetch(`${API_BASE}/api/calculators/education/school`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        students: +$('school-students').value || 0,
        tuition: +$('school-tuition').value || 0,
        staff: +$('school-staff').value || 0,
        facilities: +$('school-facilities').value || 0,
        supplies: +$('school-supplies').value || 0,
        fixed: +$('school-fixed').value || 0,
      }),
    });

    if (res.status === 403) return location.replace('payment.html');
    if (!res.ok) return;

    const d = await res.json();

    $('school-students-output').textContent = d.students.toLocaleString();

    $('school-revenue').textContent = money(d.totalRevenue);
    $('school-total-costs').textContent = money(d.annualCosts);

    const p = $('school-profit');
    p.textContent = money(d.profit);
    p.className = 'output-value ' + (d.profit >= 0 ? 'positive' : 'negative');

    $('school-per-student').textContent = money(d.costPerStudent);
    $('school-revenue-per-student').textContent = money(d.revenuePerStudent);

    $('school-roi').textContent = percent(d.roi);
    $('school-margin').textContent = percent(d.margin);
  }

  [
    'school-students',
    'school-tuition',
    'school-staff',
    'school-facilities',
    'school-supplies',
    'school-fixed',
  ].forEach((id) => $(id)?.addEventListener('input', updateEducation));
})();
