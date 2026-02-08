document.addEventListener('DOMContentLoaded', () => {
  const n = (v) => parseFloat(v) || 0;
  const money = (v) => 'R' + v.toFixed(2);
  const percent = (v) => (v || 0).toFixed(2) + '%';

  function calcMedia() {
    const content = n(document.getElementById('media-content').value);
    const ad = n(document.getElementById('media-ad-revenue').value);
    const subs = n(document.getElementById('media-subscriptions').value);
    const staff = n(document.getElementById('media-staff').value);
    const fixed = n(document.getElementById('media-fixed').value);
    const variable = n(document.getElementById('media-variable').value);

    const revenue = ad + subs;
    const costs = staff + fixed + variable;
    const profit = revenue - costs;

    document.getElementById('media-revenue').textContent = money(revenue);
    document.getElementById('media-total-costs').textContent = money(costs);
    document.getElementById('media-profit').textContent = money(profit);
    document.getElementById('media-revenue-per-content').textContent = money(
      revenue / content || 0
    );
    document.getElementById('media-cost-per-content').textContent = money(
      costs / content || 0
    );
    document.getElementById('media-roi').textContent = percent(
      (profit / costs) * 100
    );
    document.getElementById('media-margin').textContent = percent(
      (profit / revenue) * 100
    );
    document.getElementById('media-breakeven').textContent = Math.ceil(
      costs / (revenue / content) || 0
    );
    document.getElementById('media-monthly').textContent = money(profit);
    document.getElementById('media-annual').textContent = money(profit * 12);
  }

  document
    .querySelectorAll('input')
    .forEach((i) => i.addEventListener('input', calcMedia));

  document.getElementById('media-reset').onclick = () => {
    document.querySelectorAll('input').forEach((i) => (i.value = ''));
    calcMedia();
  };

  calcMedia();
});
