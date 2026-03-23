(() => {
  const $ = (id) => document.getElementById(id);

  const money = (v) =>
    (Number(v) || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const percent = (v) => `${(Number(v) || 0).toFixed(2)}%`;

  const API_BASE = 'https://your-backend-domain.com'; // <-- set your backend URL here

  let t;

  const update = () => {
    clearTimeout(t);
    t = setTimeout(run, 300);
  };

  async function run() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return location.replace('login.html');

      const res = await fetch(`${API_BASE}/api/calculators/restaurant/operations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tables: Number($('tables')?.value) || 0,
          coversPerTable: Number($('covers')?.value) || 0,
          avgCheck: Number($('check')?.value) || 0,
          foodPct: Number($('foodPercent')?.value) || 0,
          labor: Number($('labor')?.value) || 0,
          fixed: Number($('fixed')?.value) || 0,
          days: Number($('days')?.value) || 0,
        }),
      });

      if (res.status === 403) return location.replace('payment.html');
      if (!res.ok) throw new Error('Failed to fetch calculator data');

      const d = await res.json();

      $('dailyCovers').textContent = d.dailyCovers || 0;
      $('revenue').textContent = money(d.monthlyRevenue);
      $('foodCost').textContent = money(d.foodCost);
      $('totalCosts').textContent = money(d.totalCosts);
      $('profit').textContent = money(d.profit);
      $('margin').textContent = percent(d.margin);
      $('ratio').textContent = percent(d.costRatio);
      $('profitCover').textContent = money(d.profitPerCover);
      $('breakeven').textContent = d.breakevenCovers ?? 0;
      $('monthly').textContent = money(d.monthlyProfit);
      $('annual').textContent = money(d.annualProfit);

      const statusEl = $('status');
      const adviceEl = $('decisionAdvice');

      if (statusEl) {
        statusEl.classList.remove('profit', 'loss', 'neutral');
        if (d.profit > 0) statusEl.classList.add('profit');
        else if (d.profit < 0) statusEl.classList.add('loss');
        else statusEl.classList.add('neutral');

        statusEl.textContent =
          d.profit > 0 ? 'Profitable' : d.profit < 0 ? 'Loss' : 'Break-even';
      }

      if (adviceEl) {
        adviceEl.textContent =
          d.margin < 10
            ? '⚠️ Margin is low — increase pricing or reduce costs.'
            : d.margin < 20
            ? '⚡ Healthy but can improve with better cost control.'
            : '✅ Strong profitability zone.';
      }
    } catch (err) {
      console.error('Restaurant calculator error:', err);
      alert('Error fetching calculator results. Check console.');
    }
  }

  $('resetBtn')?.addEventListener('click', () => {
    document.querySelectorAll('.input-section input').forEach((i) => (i.value = ''));

    [
      'dailyCovers',
      'revenue',
      'foodCost',
      'totalCosts',
      'profit',
      'margin',
      'ratio',
      'profitCover',
      'breakeven',
      'monthly',
      'annual',
      'status',
      'decisionAdvice',
    ].forEach((id) => {
      if ($(id)) {
        $(id).textContent =
          id === 'status' ? '—' : id.includes('R') ? 'R0.00' : 0;
        $(id).classList?.remove('profit', 'loss', 'neutral');
      }
    });
  });

  document.querySelectorAll('.input-section input').forEach((i) =>
    i.addEventListener('input', update)
  );

  run();
})();