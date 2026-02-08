document.addEventListener('DOMContentLoaded', () => {
  const n = (v) => parseFloat(v) || 0;

  const money = (v) =>
    'R' +
    Number(v).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const percent = (v) => Number(v).toFixed(2) + '%';

  function calcIT() {
    const hours = n(document.getElementById('it-hours').value);
    const rate = n(document.getElementById('it-hourly-rate').value);
    const labor = n(document.getElementById('it-labor-cost').value);
    const software = n(document.getElementById('it-software-cost').value);
    const fixed = n(document.getElementById('it-fixed-cost').value);

    const revenue = hours * rate;
    const totalCosts = labor + software + fixed;
    const profit = revenue - totalCosts;

    document.getElementById('it-revenue').textContent = money(revenue);
    document.getElementById('it-total-costs').textContent = money(totalCosts);
    document.getElementById('it-profit').textContent = money(profit);
    document.getElementById('it-profit-hour').textContent = money(
      profit / hours || 0
    );
    document.getElementById('it-margin').textContent = percent(
      (profit / revenue) * 100 || 0
    );
    document.getElementById('it-roi').textContent = percent(
      (profit / totalCosts) * 100 || 0
    );
    document.getElementById('it-breakeven').textContent = (
      totalCosts / rate || 0
    ).toFixed(1);
    document.getElementById('it-monthly').textContent = money(profit);
    document.getElementById('it-annual').textContent = money(profit * 12);
  }

  document
    .querySelectorAll('input')
    .forEach((i) => i.addEventListener('input', calcIT));

  document.getElementById('resetBtn')?.addEventListener('click', () => {
    document.querySelectorAll('input').forEach((i) => (i.value = ''));
    calcIT();
  });

  calcIT();
});
