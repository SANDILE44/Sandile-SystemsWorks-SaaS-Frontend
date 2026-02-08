document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('energy-capacity')) return;

  const n = (id) => parseFloat(document.getElementById(id)?.value) || 0;
  const money = (v) => `R${v.toFixed(2)}`;
  const percent = (v) => `${v.toFixed(2)}%`;

  function calculate() {
    const install = n('energy-install');
    const maintenance = n('energy-maintenance');
    const revenue = n('energy-revenue');
    const years = n('energy-life');

    const totalCosts = install + maintenance * years;
    const totalRevenue = revenue * years;
    const profit = totalRevenue - totalCosts;

    document.getElementById('energy-total-costs').textContent =
      money(totalCosts);
    document.getElementById('energy-total-revenue').textContent =
      money(totalRevenue);
    document.getElementById('energy-profit').textContent = money(profit);
    document.getElementById('energy-roi').textContent = percent(
      install ? (profit / install) * 100 : 0
    );
    document.getElementById('energy-payback').textContent = revenue
      ? Math.ceil(install / revenue)
      : 0;
  }

  document
    .querySelectorAll('input')
    .forEach((i) => i.addEventListener('input', calculate));

  calculate();
});
