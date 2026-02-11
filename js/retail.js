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
      `${API_BASE}/api/calculators/retail/business`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          units: +$('retail-units').value || 0,
          cost: +$('retail-cost').value || 0,
          price: +$('retail-price').value || 0,
          fixed: +$('retail-fixed').value || 0,
          labor: +$('retail-labor').value || 0,
          operational: +$('retail-operational').value || 0,
        }),
      }
    );

    if (res.status === 403) return location.replace('payment.html');
    if (!res.ok) return;

    const d = await res.json();

    $('revenue').textContent = money(d.revenue);
    $('cogs').textContent = money(d.cogs);
    $('gross').textContent = money(d.gross);
    $('totalCosts').textContent = money(d.totalCosts);
    $('profit').textContent = money(d.profit);
    $('margin').textContent = percent(d.margin);
    $('markup').textContent = percent(d.markup);
    $('roi').textContent = percent(d.roi);
    $('ratio').textContent = percent(d.ratio);
    $('breakeven').textContent =
      d.breakeven ?? '—';
    $('profitUnit').textContent =
      money(d.profitPerUnit);
    $('monthly').textContent =
      money(d.monthlyProfit);
    $('annual').textContent =
      money(d.annualProfit);
  }

  document
    .querySelectorAll('input')
    .forEach((i) => i.addEventListener('input', update));
})();
