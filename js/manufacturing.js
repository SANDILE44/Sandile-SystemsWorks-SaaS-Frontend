document.addEventListener('DOMContentLoaded', () => {
  const n = (v) => parseFloat(v) || 0;
  const money = (v) => 'R' + v.toFixed(2);
  const percent = (v) => (v || 0).toFixed(2) + '%';

  function calcMfg() {
    const units = n(document.getElementById('mfg-units').value);
    const price = n(document.getElementById('mfg-price').value);
    const material = n(document.getElementById('mfg-material').value);
    const labor = n(document.getElementById('mfg-labor').value);
    const fixed = n(document.getElementById('mfg-fixed').value);
    const operational = n(document.getElementById('mfg-operational').value);

    const revenue = units * price;
    const totalCosts = units * material + labor + fixed + operational;
    const profit = revenue - totalCosts;

    document.getElementById('mfg-units-output').textContent = units;
    document.getElementById('mfg-revenue').textContent = money(revenue);
    document.getElementById('mfg-total-costs').textContent = money(totalCosts);
    document.getElementById('mfg-cost-per-unit').textContent = money(
      totalCosts / units || 0
    );
    document.getElementById('mfg-revenue-per-unit').textContent = money(price);
    document.getElementById('mfg-profit-per-unit').textContent = money(
      profit / units || 0
    );
    document.getElementById('mfg-profit').textContent = money(profit);
    document.getElementById('mfg-breakeven').textContent = Math.ceil(
      fixed / (price - material) || 0
    );
    document.getElementById('mfg-roi').textContent = percent(
      (profit / totalCosts) * 100
    );
    document.getElementById('mfg-margin').textContent = percent(
      (profit / revenue) * 100
    );
    document.getElementById('mfg-monthly-revenue').textContent = money(revenue);
    document.getElementById('mfg-annual-revenue').textContent = money(
      revenue * 12
    );
  }

  document
    .querySelectorAll('input')
    .forEach((i) => i.addEventListener('input', calcMfg));

  document.getElementById('resetBtn').onclick = () => {
    document.querySelectorAll('input').forEach((i) => (i.value = ''));
    calcMfg();
  };

  calcMfg();
});
