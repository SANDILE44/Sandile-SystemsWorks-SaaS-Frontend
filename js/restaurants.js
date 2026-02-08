document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('tables')) return;

  const n = (id) => parseFloat(document.getElementById(id)?.value) || 0;
  const money = (v) => `R${v.toFixed(2)}`;
  const percent = (v) => `${v.toFixed(2)}%`;

  function calc() {
    const tables = n('tables');
    const covers = n('covers');
    const check = n('check');
    const foodPct = n('foodPercent') / 100;
    const labor = n('labor');
    const fixed = n('fixed');
    const days = n('days');

    const dailyCovers = tables * covers;
    const monthlyRevenue = dailyCovers * check * days;
    const foodCost = monthlyRevenue * foodPct;
    const totalCosts = foodCost + labor + fixed;
    const profit = monthlyRevenue - totalCosts;

    document.getElementById('dailyCovers').textContent = dailyCovers;
    document.getElementById('revenue').textContent = money(monthlyRevenue);
    document.getElementById('foodCost').textContent = money(foodCost);
    document.getElementById('totalCosts').textContent = money(totalCosts);
    document.getElementById('profit').textContent = money(profit);
    document.getElementById('margin').textContent = percent(
      monthlyRevenue ? (profit / monthlyRevenue) * 100 : 0
    );
    document.getElementById('ratio').textContent = percent(
      monthlyRevenue ? (totalCosts / monthlyRevenue) * 100 : 0
    );
    document.getElementById('profitCover').textContent = money(
      dailyCovers ? profit / (dailyCovers * days) : 0
    );
    document.getElementById('breakeven').textContent =
      check > 0 ? Math.ceil(totalCosts / (check * days)) : '—';
    document.getElementById('monthly').textContent = money(profit);
    document.getElementById('annual').textContent = money(profit * 12);
  }

  document
    .querySelectorAll('input')
    .forEach((i) => i.addEventListener('input', calc));

  document.getElementById('resetBtn')?.addEventListener('click', () => {
    document.querySelectorAll('input').forEach((i) => (i.value = ''));
    calc();
  });

  calc();
});
