(() => {

  /* ===============================
     HELPERS
  ================================ */

  const $ = (id) => document.getElementById(id);

  const money = (v) =>
    'R' + (Number(v) || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const percent = (v) =>
    (Number(v) || 0).toFixed(2) + '%';


  /* ===============================
     DEBOUNCE SYSTEM
  ================================ */

  let timer;

  function debounceRun() {
    clearTimeout(timer);
    timer = setTimeout(runCalculation, 300);
  }


  /* ===============================
     COLOR HELPER
  ================================ */

  function applyColor(el, type) {
    if (!el) return;

    el.classList.remove('positive', 'negative', 'caution');

    if (type) el.classList.add(type);
  }


  /* ===============================
     MAIN CALCULATION
  ================================ */

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


      /* ===== PAYMENT GUARD ===== */

      if (res.status === 403) {
        return location.replace('payment.html');
      }

      if (!res.ok) return;

      const d = await res.json();


      /* ===============================
         UPDATE OUTPUT VALUES
      ================================ */

      $('const-total-costs').textContent = money(d.totalCosts);

      const profitEl = $('const-profit');
      profitEl.textContent = money(d.profit);

      applyColor(
        profitEl,
        d.profit >= 0 ? 'positive' : 'negative'
      );


      const marginEl = $('const-margin');
      marginEl.textContent = percent(d.margin);

      if (d.margin < 10) applyColor(marginEl, 'negative');
      else if (d.margin < 20) applyColor(marginEl, 'caution');
      else applyColor(marginEl, 'positive');


      const roiEl = $('const-roi');
      roiEl.textContent = percent(d.roi);

      if (d.roi < 0) applyColor(roiEl, 'negative');
      else if (d.roi < 10) applyColor(roiEl, 'caution');
      else applyColor(roiEl, 'positive');


      $('const-breakeven').textContent = money(d.breakEvenRevenue);
      $('const-monthly-profit').textContent = money(d.monthlyProfit);
      $('const-annual-profit').textContent = money(d.annualProfit);


      /* ===============================
         DECISION ENGINE
      ================================ */

      const statusEl = $('decision-status');
      const riskEl = $('risk-warning');
      const adviceEl = $('decision-advice');

      applyColor(statusEl, null);

      if (d.profit <= 0) {

        statusEl.textContent = '❌ High Risk';
        applyColor(statusEl, 'negative');

        riskEl.textContent =
          'This contract results in a loss. Costs exceed contract value.';

        adviceEl.textContent =
          'DO NOT TAKE unless pricing is renegotiated.';

      }

      else if (d.margin < 10) {

        statusEl.textContent = '⚠ Low Margin';
        applyColor(statusEl, 'caution');

        riskEl.textContent =
          'Very thin margin. Small overruns can eliminate profit.';

        adviceEl.textContent =
          'Proceed only with strict cost control and risk buffer.';

      }

      else if (d.margin < 20) {

        statusEl.textContent = '🟡 Moderate Margin';
        applyColor(statusEl, 'caution');

        riskEl.textContent =
          'Acceptable margin but limited safety buffer.';

        adviceEl.textContent =
          'Monitor material and labor closely.';

      }

      else {

        statusEl.textContent = '✅ Strong Project';
        applyColor(statusEl, 'positive');

        riskEl.textContent =
          'Healthy margin with buffer against overruns.';

        adviceEl.textContent =
          'Project is financially sound.';

      }

    }

    catch (err) {
      console.error('Construction calculator error:', err);
    }

  }


  /* ===============================
     INPUT LISTENERS
  ================================ */

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


  /* ===============================
     RESET BUTTON
  ================================ */

  $('resetBtn')?.addEventListener('click', () => {

    [
      'const-value',
      'const-material',
      'const-labor',
      'const-equipment',
      'const-fixed',
      'const-duration',
    ].forEach((id) => {
      const el = $(id);
      if (el) el.value = '';
    });


    const defaults = {
      'const-total-costs': 'R0.00',
      'const-profit': 'R0.00',
      'const-margin': '0.00%',
      'const-roi': '0.00%',
      'const-breakeven': 'R0.00',
      'const-monthly-profit': 'R0.00',
      'const-annual-profit': 'R0.00',
      'decision-status': '—',
      'risk-warning': '',
      'decision-advice': '',
    };

    Object.entries(defaults).forEach(([id, value]) => {
      const el = $(id);
      if (!el) return;

      el.textContent = value;
      el.classList.remove('positive', 'negative', 'caution');
    });

  });


  /* ===============================
     LOGOUT BUTTON
  ================================ */

  $('logoutBtn')?.addEventListener('click', () => {

    localStorage.removeItem('token');
    window.location.replace('login.html');

  });

})();