(() => {
  const $ = (id) => document.getElementById(id);

  const money = (v) =>
    'R' +
    (Number(v) || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const percent = (v) => `${(Number(v) || 0).toFixed(2)}%`;

  let t;

  /* =========================
     LIVE UPDATE (debounce)
  ========================= */
  const update = () => {
    clearTimeout(t);
    t = setTimeout(run, 300);
  };

  /* =========================
     MAIN CALCULATION
  ========================= */
  async function run() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return location.replace('login.html');

      const res = await fetch(
        `${API_BASE}/api/calculators/restaurant/operations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            tables: +$('tables')?.value || 0,
            coversPerTable: +$('covers')?.value || 0,
            avgCheck: +$('check')?.value || 0,
            foodPct: +$('foodPercent')?.value || 0,
            labor: +$('labor')?.value || 0,
            fixed: +$('fixed')?.value || 0,
            days: +$('days')?.value || 0,
          }),
        }
      );

      if (res.status === 403) return location.replace('payment.html');
      if (!res.ok) return;

      const d = await res.json();

      /* ===== CORE RESULTS ===== */
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

      /* ===== PROFIT / LOSS STATUS ===== */
      const statusEl = $('status');
      const adviceEl = $('decisionAdvice');

      if (statusEl) {
        statusEl.classList.remove('profit', 'loss', 'neutral');

        if (d.profit > 0) {
          statusEl.textContent = 'Profitable';
          statusEl.classList.add('profit');
        } else if (d.profit < 0) {
          statusEl.textContent = 'Loss';
          statusEl.classList.add('loss');
        } else {
          statusEl.textContent = 'Break-even';
          statusEl.classList.add('neutral');
        }
      }

      /* ===== DECISION ADVICE ===== */
      if (adviceEl) {
        if (d.margin < 10) {
          adviceEl.textContent =
            '⚠️ Margin is low — increase pricing or reduce costs.';
        } else if (d.margin < 20) {
          adviceEl.textContent =
            '⚡ Healthy but can improve with better cost control.';
        } else {
          adviceEl.textContent =
            '✅ Strong profitability zone.';
        }
      }
    } catch (err) {
      console.error('Restaurant calculator error:', err);
    }
  }

  /* =========================
     RESET BUTTON
  ========================= */
  $('resetBtn')?.addEventListener('click', () => {
    document.querySelectorAll('.input-section input').forEach((i) => {
      i.value = '';
    });

    $('dailyCovers').textContent = '0';
    $('revenue').textContent = 'R0.00';
    $('foodCost').textContent = 'R0.00';
    $('totalCosts').textContent = 'R0.00';
    $('profit').textContent = 'R0.00';
    $('margin').textContent = '0.00%';
    $('ratio').textContent = '0.00%';
    $('profitCover').textContent = 'R0.00';
    $('breakeven').textContent = '0';
    $('monthly').textContent = 'R0.00';
    $('annual').textContent = 'R0.00';

    if ($('status')) {
      $('status').textContent = '—';
      $('status').classList.remove('profit', 'loss', 'neutral');
    }

    if ($('decisionAdvice')) {
      $('decisionAdvice').textContent = '';
    }
  });

  /* =========================
     INPUT LISTENERS
  ========================= */
  document
    .querySelectorAll('.input-section input')
    .forEach((i) => i.addEventListener('input', update));

  /* =========================
     INITIAL LOAD
  ========================= */
  run();
})();
