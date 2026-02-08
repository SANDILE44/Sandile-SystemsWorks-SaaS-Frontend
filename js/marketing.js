document.addEventListener('DOMContentLoaded', () => {
  const n = (v) => parseFloat(v) || 0;
  const money = (v) => 'R' + v.toFixed(2);
  const percent = (v) => (v || 0).toFixed(2) + '%';

  function calcMarketing() {
    const campaigns = n(document.getElementById('marketing-campaigns').value);
    const budget = n(document.getElementById('marketing-budget').value);
    const revenue = n(document.getElementById('marketing-revenue').value);
    const staff = n(document.getElementById('marketing-staff').value);
    const fixed = n(document.getElementById('marketing-fixed').value);
    const variable = n(document.getElementById('marketing-variable').value);

    const totalCosts = budget + staff + fixed + variable;
    const profit = revenue - totalCosts;

    document.getElementById('marketing-total-revenue').textContent =
      money(revenue);
    document.getElementById('marketing-total-costs').textContent =
      money(totalCosts);
    document.getElementById('marketing-profit').textContent = money(profit);
    document.getElementById('marketing-revenue-per-campaign').textContent =
      money(revenue / campaigns || 0);
    document.getElementById('marketing-cost-per-campaign').textContent = money(
      totalCosts / campaigns || 0
    );
    document.getElementById('marketing-roi').textContent = percent(
      (profit / totalCosts) * 100
    );
    document.getElementById('marketing-margin').textContent = percent(
      (profit / revenue) * 100
    );
  }

  document
    .querySelectorAll('input')
    .forEach((i) => i.addEventListener('input', calcMarketing));

  document.getElementById('resetBtn').onclick = () => {
    document.querySelectorAll('input').forEach((i) => (i.value = ''));
    calcMarketing();
  };

  calcMarketing();
});
