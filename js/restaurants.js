(() => {
  const $ = (id) => document.getElementById(id);
  const money = (v) => `R${(Number(v) || 0).toFixed(2)}`;
  const percent = (v) => `${(Number(v) || 0).toFixed(2)}%`;

  let t;
  const update = () => {
    clearTimeout(t);
    t = setTimeout(run, 300);
  };

  async function run() {
    const res = await fetch(
      `${API_BASE}/api/calculators/restaurant/operations`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          tables: +$('tables').value || 0,
          coversPerTable: +$('covers').value || 0,
          avgCheck: +$('check').value || 0,
          foodPct: +$('foodPercent').value || 0,
          labor: +$('labor').value || 0,
          fixed: +$('fixed').value || 0,
          days: +$('days').value || 0,
        }),
      }
    );

    if (res.status === 403) return location.replace('payment.html');
    if (!res.ok) return;

    const d = await res.json();

    $('dailyCovers').textContent = d.dailyCovers;
    $('revenue').textContent = money(d.monthlyRevenue);
    $('foodCost').textContent = money(d.foodCost);
    $('totalCosts').textContent = money(d.totalCosts);
    $('profit').textContent = money(d.profit);
    $('margin').textContent = percent(d.margin);
    $('ratio').textContent = percent(d.costRatio);
    $('profitCover').textContent = money(d.profitPerCover);
    $('breakeven').textContent =
      d.breakevenCovers ?? '—';
    $('monthly').textContent = money(d.monthlyProfit);
    $('annual').textContent = money(d.annualProfit);
  }

  document
    .querySelectorAll('input')
    .forEach((i) => i.addEventListener('input', update));
})();
