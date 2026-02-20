(() => {
  const $ = (id) => document.getElementById(id);

  const money = (v) =>
    'R' +
    (Number(v) || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const percent = (v) => (Number(v) || 0).toFixed(2) + '%';

  let debounceTimer;

  function updateLogistics() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runLogistics, 300);
  }

  async function runLogistics() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return location.replace('login.html');

      const res = await fetch(
        `${API_BASE}/api/calculators/logistics/business`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            shipments: +$('log-shipments')?.value || 0,
            revenuePer: +$('log-revenue')?.value || 0,
            fuel: +$('log-fuel')?.value || 0,
            labor: +$('log-labor')?.value || 0,
            maintenance: +$('log-maintenance')?.value || 0,
            fixed: +$('log-fixed')?.value || 0,
          }),
        }
      );

      if (res.status === 401) {
        localStorage.removeItem('token');
        return location.replace('login.html');
      }

      if (res.status === 403) {
        return location.replace('payment.html');
      }

      if (!res.ok) return;

      const d = await res.json();

      /* ================= CORE ================= */
      $('log-shipments-output').textContent = d.shipments ?? 0;
      $('log-total-revenue').textContent = money(d.totalRevenue);
      $('log-total-costs').textContent = money(d.totalCosts);
      $('log-profit').textContent = money(d.profit);
      $('log-per-shipment').textContent = money(d.costPerShipment);
      $('log-revenue-per-shipment').textContent =
        money(d.revenuePerShipment);
      $('log-margin').textContent = percent(d.margin);
      $('log-roi').textContent = percent(d.roi);

      /* ================= DECISION ================= */
      $('log-profit-per-shipment').textContent =
        money(d.profitPerShipment);
      $('log-breakeven-shipments').textContent =
        d.breakEvenShipments ?? 0;
      $('log-annual-profit').textContent =
        money(d.annualProfit);

      $('log-fuel-pct').textContent = percent(d.fuelPercent);
      $('log-labor-pct').textContent = percent(d.laborPercent);
      $('log-maintenance-pct').textContent =
        percent(d.maintenancePercent);

      const fixedPct =
        d.totalCosts > 0
          ? Math.max(
              0,
              100 -
                (d.fuelPercent || 0) -
                (d.laborPercent || 0) -
                (d.maintenancePercent || 0)
            )
          : 0;

      $('log-fixed-pct').textContent = percent(fixedPct);

      /* ================= STATUS ================= */
      const statusEl = $('log-status');
      statusEl.classList.remove('profit', 'loss', 'neutral');

      const status = (d.status || '').toLowerCase();

      if (status === 'profitable') {
        statusEl.textContent = 'Profitable';
        statusEl.classList.add('profit');
      } else if (status === 'loss') {
        statusEl.textContent = 'Loss';
        statusEl.classList.add('loss');
      } else {
        statusEl.textContent = 'Break-even';
        statusEl.classList.add('neutral');
      }

      /* ================= RISK LEVEL ================= */
      const riskEl = $('log-risk-level');
      riskEl.classList.remove('low', 'medium', 'high');

      const risk = (d.riskLevel || '').toLowerCase();

      if (risk === 'low') {
        riskEl.classList.add('low');
      } else if (risk === 'medium') {
        riskEl.classList.add('medium');
      } else if (risk === 'high') {
        riskEl.classList.add('high');
      }

      riskEl.textContent = d.riskLevel || '—';

      /* ================= RECOMMENDED PRICE ================= */
      $('log-recommended-price').textContent =
        money(d.recommendedPricePerShipment);

      /* ================= SAFETY ================= */
      const safetyEl = $('log-safety');
      safetyEl.classList.remove('healthy', 'risk', 'critical');

      const safety = (d.safetyStatus || '').toLowerCase();

      if (safety === 'healthy') {
        safetyEl.classList.add('healthy');
      } else if (safety === 'at risk') {
        safetyEl.classList.add('risk');
      } else if (safety === 'critical') {
        safetyEl.classList.add('critical');
      }

      safetyEl.textContent = d.safetyStatus || '—';

      /* ================= ADVICE ================= */
      $('log-advice').textContent = d.advice || '';

    } catch (err) {
      console.error('Logistics calculator error:', err);
    }
  }

  /* ================= RESET ================= */
  $('resetBtn')?.addEventListener('click', () => {
    document
      .querySelectorAll('.input-section input')
      .forEach((i) => (i.value = ''));
    runLogistics();
  });

  /* ================= LOGOUT ================= */
  $('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('token');
    location.replace('login.html');
  });

  /* ================= INPUT LISTENERS ================= */
  document
    .querySelectorAll('.input-section input')
    .forEach((i) =>
      i.addEventListener('input', updateLogistics)
    );

  runLogistics();
})();
