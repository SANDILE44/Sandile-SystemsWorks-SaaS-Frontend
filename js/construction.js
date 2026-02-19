(() => {

  const $ = (id) => document.getElementById(id);

  const money = (v) =>
    'R' + (Number(v) || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const percent = (v) =>
    (Number(v) || 0).toFixed(2) + '%';

  let timer;

  function debounceRun() {
    clearTimeout(timer);
    timer = setTimeout(runCalculation, 300);
  }

  async function runCalculation() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(
        `${API_BASE}/api/calculators/construction/project`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            value: +$('const-value').value || 0,
            material: +$('const-material').value || 0,
            laborMonthly: +$('const-labor').value || 0,
            equipmentMonthly: +$('const-equipment').value || 0,
            fixedMonthly: +$('const-fixed').value || 0,
            months: +$('const-duration').value || 0,
          }),
        }
      );

      if (res.status === 403) {
        return location.replace('payment.html');
      }

      if (!res.ok) return;

      const d = await res.json();

      $('const-total-costs').textContent = money(d.totalCosts);

      const profitEl = $('const-profit');
      profitEl.textContent = money(d.profit);
      profitEl.className =
        'output-value ' + (d.profit >= 0 ? 'positive' : 'negative');

      $('const-margin').textContent = percent(d.margin);
      $('const-roi').textContent = percent(d.roi);
      $('const-breakeven').textContent = money(d.breakEvenRevenue);
      $('const-monthly-profit').textContent = money(d.monthlyProfit);
      $('const-annual-profit').textContent = money(d.annualProfit);

      /* ===== DECISION LOGIC ===== */

      const statusEl = $('decision-status');
      const riskEl = $('risk-warning');
      const adviceEl = $('decision-advice');

      if (d.profit <= 0) {
        statusEl.textContent = '❌ High Risk';
        statusEl.className = 'output-value negative';
        riskEl.textContent =
          'This contract results in a loss. Costs exceed contract value.';
        adviceEl.textContent =
          'DO NOT TAKE unless pricing is renegotiated.';
      }
      else if (d.margin < 10) {
        statusEl.textContent = '⚠ Low Margin';
        statusEl.className = 'output-value caution';
        riskEl.textContent =
          'Very thin margin. Small overruns can eliminate profit.';
        adviceEl.textContent =
          'Proceed only with strict cost control and risk buffer.';
      }
      else if (d.margin < 20) {
        statusEl.textContent = '🟡 Moderate Margin';
        statusEl.className = 'output-value';
        riskEl.textContent =
          'Acceptable margin but limited safety buffer.';
        adviceEl.textContent =
          'Monitor material and labor closely.';
      }
      else {
        statusEl.textContent = '✅ Strong Project';
        statusEl.className = 'output-value positive';
        riskEl.textContent =
          'Healthy margin with buffer against overruns.';
        adviceEl.textContent =
          'Project is financially sound.';
      }

    } catch (err) {
      console.error(err);
    }
  }

  /* ===== INPUT LISTENERS ===== */

  [
    'const-value',
    'const-material',
    'const-labor',
    'const-equipment',
    'const-fixed',
    'const-duration',
  ].forEach((id) =>
    $(id)?.addEventListener('input', debounceRun)
  );

  /* ===== RESET BUTTON ===== */

  $('resetBtn')?.addEventListener('click', () => {

    [
      'const-value',
      'const-material',
      'const-labor',
      'const-equipment',
      'const-fixed',
      'const-duration',
    ].forEach((id) => {
      if ($(id)) $(id).value = '';
    });

    [
      'const-total-costs',
      'const-profit',
      'const-margin',
      'const-roi',
      'const-breakeven',
      'const-monthly-profit',
      'const-annual-profit',
      'decision-status',
      'risk-warning',
      'decision-advice'
    ].forEach((id) => {
      if ($(id)) $(id).textContent = id.includes('status') ? '—' : '';
    });

  });

  /* ===== LOGOUT BUTTON ===== */

  $('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.replace('login.html');
  });

})();
