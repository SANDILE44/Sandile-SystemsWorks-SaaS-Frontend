document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('retail-units')) return;

  const n = (id) => parseFloat(document.getElementById(id)?.value) || 0;
  const money = (v) => `R${v.toFixed(2)}`;
  const percent = (v) => `${v.toFixed(2)}%`;

  function calc() {
    const units = n('retail-units');
    const cost = n('retail-cost');
    const price = n('retail-price');
    const fixed = n('retail-fixed');
    const labor = n('retail-labor');
    const ops = n('retail-operational');

    const revenue = units * price;
    const cogs = units * cost;
    const gross = revenue - cogs;
    const totalCosts = cogs + fixed + labor + ops;
    const profit = revenue - totalCosts;

    document.getElementById('revenue').textContent = money(revenue);
    document.getElementById('cogs').textContent = money(cogs);
    document.getElementById('gross').textContent = money(gross);
    document.getElementById('totalCosts').textContent = money(totalCosts);
    document.getElementById('profit').textContent = money(profit);
    document.getElementById('margin').textContent = percent(
      revenue ? (profit / revenue) * 100 : 0
    );
    document.getElementById('markup').textContent = percent(
      cost ? ((price - cost) / cost) * 100 : 0
    );
    document.getElementById('roi').textContent = percent(
      totalCosts ? (profit / totalCosts) * 100 : 0
    );
    document.getElementById('ratio').textContent = percent(
      revenue ? (totalCosts / revenue) * 100 : 0
    );
    document.getElementById('breakeven').textContent =
      price > cost ? Math.ceil((fixed + labor + ops) / (price - cost)) : '—';
    document.getElementById('profitUnit').textContent = money(price - cost);
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
