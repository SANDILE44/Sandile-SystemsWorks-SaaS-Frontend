document.addEventListener('DOMContentLoaded', () => {
  const n = (v) => parseFloat(v) || 0;

  const money = (v) =>
    'R' +
    Number(v).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const percent = (v) => Number(v).toFixed(2) + '%';

  function calcLogistics() {
    const shipments = n(document.getElementById('log-shipments').value);
    const revenuePer = n(document.getElementById('log-revenue').value);
    const fuel = n(document.getElementById('log-fuel').value);
    const labor = n(document.getElementById('log-labor').value);
    const maintenance = n(document.getElementById('log-maintenance').value);
    const fixed = n(document.getElementById('log-fixed').value);

    const totalRevenue = shipments * revenuePer;
    const totalCosts = fuel + labor + maintenance + fixed;
    const profit = totalRevenue - totalCosts;

    document.getElementById('log-shipments-output').textContent = shipments;
    document.getElementById('log-total-revenue').textContent =
      money(totalRevenue);
    document.getElementById('log-total-costs').textContent = money(totalCosts);
    document.getElementById('log-profit').textContent = money(profit);
    document.getElementById('log-per-shipment').textContent = money(
      totalCosts / shipments || 0
    );
    document.getElementById('log-revenue-per-shipment').textContent =
      money(revenuePer);
    document.getElementById('log-margin').textContent = percent(
      (profit / totalRevenue) * 100 || 0
    );
    document.getElementById('log-roi').textContent = percent(
      (profit / totalCosts) * 100 || 0
    );
  }

  document
    .querySelectorAll('input')
    .forEach((i) => i.addEventListener('input', calcLogistics));

  document.getElementById('resetBtn')?.addEventListener('click', () => {
    document.querySelectorAll('input').forEach((i) => (i.value = ''));
    calcLogistics();
  });

  calcLogistics();
});
