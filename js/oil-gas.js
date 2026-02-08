document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('production-volume')) return;

  const n = (id) => parseFloat(document.getElementById(id)?.value) || 0;
  const money = (v) => `R${v.toFixed(2)}`;
  const percent = (v) => `${v.toFixed(2)}%`;

  function calculate() {
    const volume = n('production-volume');
    const price = n('price-per-barrel');
    const opex = n('operational-expenses');
    const capex = n('capex');
    const fixed = n('fixed-costs');

    const revenue = volume * price;
    const costs = opex + capex + fixed;
    const profit = revenue - costs;

    document.getElementById('total-revenue').textContent = money(revenue);
    document.getElementById('total-costs').textContent = money(costs);
    document.getElementById('profit-loss').textContent = money(profit);
    document.getElementById('revenue-per-barrel').textContent = money(
      volume ? revenue / volume : 0
    );
    document.getElementById('cost-per-barrel').textContent = money(
      volume ? costs / volume : 0
    );
    document.getElementById('roi').textContent = percent(
      costs ? (profit / costs) * 100 : 0
    );
    document.getElementById('margin').textContent = percent(
      revenue ? (profit / revenue) * 100 : 0
    );
  }

  document
    .querySelectorAll('input')
    .forEach((i) => i.addEventListener('input', calculate));

  calculate();
});
