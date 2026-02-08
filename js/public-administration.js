document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('dept-budget')) return;

  const n = (id) => parseFloat(document.getElementById(id)?.value) || 0;
  const money = (v) => `R${v.toFixed(2)}`;
  const percent = (v) => `${v.toFixed(2)}%`;

  function calculate() {
    const budget = n('dept-budget');
    const staff = n('staff-count');
    const ops = n('operational-costs');
    const programs = n('program-costs');
    const efficiency = n('efficiency-rate');

    const totalExpenses = ops + programs;
    const remaining = budget - totalExpenses;

    document.getElementById('total-expenses').textContent =
      money(totalExpenses);
    document.getElementById('net-budget').textContent = money(remaining);
    document.getElementById('cost-per-staff').textContent = money(
      staff ? totalExpenses / staff : 0
    );
    document.getElementById('program-efficiency').textContent =
      percent(efficiency);
  }

  document
    .querySelectorAll('input')
    .forEach((i) => i.addEventListener('input', calculate));

  calculate();
});
