(() => {
  const $ = (id) => document.getElementById(id);

  const money = (v) =>
    'R' +
    (Number(v) || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const percent = (v) => (Number(v) || 0).toFixed(2) + '%';

  let t;

  /* =========================
     LIVE UPDATE (debounce)
  ========================= */
  function updateLogistics() {
    clearTimeout(t);
    t = setTimeout(runLogistics, 300);
  }

  /* =========================
     MAIN CALCULATION
  ========================= */
  async function runLogistics() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return location.replace('login.html');

      const res = await fetch(`${API_BASE}/api/calculators/logistics/business`, {
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
      });

      if (res.status === 403) return location.replace('payment.html');
      if (!res.ok) return;

      const d = await res.json();

      /* ===== CORE RESULTS ===== */
      $('log-shipments-output').textContent = d.shipments || 0;
      $('log-total-revenue').textContent = money(d.totalRevenue);
      $('log-total-costs').textContent = money(d.totalCosts);
      $('log-profit').textContent = money(d.profit);
      $('log-per-shipment').textContent = money(d.costPerShipment);
      $('log-revenue-per-shipment').textContent = money(
        d.revenuePerShipment
      );
      $('log-margin').textContent = percent(d.margin);
      $('log-roi').textContent = percent(d.roi);

      /* ===== DECISION OUTPUTS ===== */
      $('log-profit-per-shipment').textContent = money(
        d.profitPerShipment
      );

      $('log-breakeven-shipments').textContent =
        d.breakEvenShipments || 0;

      $('log-annual-profit').textContent = money(d.annualProfit);

      $('log-fuel-pct').textContent = percent(d.fuelPercent);
      $('log-labor-pct').textContent = percent(d.laborPercent);
      $('log-maintenance-pct').textContent = percent(
        d.maintenancePercent
      );

      // safe fixed %
      const fixedPct =
        d.totalCosts > 0
          ? 100 -
            (d.fuelPercent || 0) -
            (d.laborPercent || 0) -
            (d.maintenancePercent || 0)
          : 0;

      $('log-fixed-pct').textContent = percent(fixedPct);

      /* ===== PROFIT / LOSS STATUS (FIXED) ===== */
      const statusEl = $('log-status');

      const status = (d.status || 'Break-even')
        .toString()
        .trim()
        .toLowerCase();

      statusEl.classList.remove('profit', 'loss', 'neutral');

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
    } catch (err) {
      console.error('Logistics calculator error:', err);
    }
  }

  /* =========================
     RESET BUTTON
  ========================= */
  $('resetBtn')?.addEventListener('click', () => {
    document.querySelectorAll('.input-section input').forEach((i) => {
      i.value = '';
    });

    $('log-shipments-output').textContent = '0';
    $('log-total-revenue').textContent = 'R0.00';
    $('log-total-costs').textContent = 'R0.00';
    $('log-profit').textContent = 'R0.00';
    $('log-per-shipment').textContent = 'R0.00';
    $('log-revenue-per-shipment').textContent = 'R0.00';
    $('log-roi').textContent = '0.00%';
    $('log-margin').textContent = '0.00%';

    $('log-status').textContent = '—';
    $('log-status').classList.remove('profit', 'loss', 'neutral');

    $('log-profit-per-shipment').textContent = 'R0.00';
    $('log-breakeven-shipments').textContent = '0';
    $('log-annual-profit').textContent = 'R0.00';
    $('log-fuel-pct').textContent = '0.00%';
    $('log-labor-pct').textContent = '0.00%';
    $('log-maintenance-pct').textContent = '0.00%';
    $('log-fixed-pct').textContent = '0.00%';
  });

  /* =========================
     INPUT LISTENERS
  ========================= */
  document
    .querySelectorAll('.input-section input')
    .forEach((i) => i.addEventListener('input', updateLogistics));

  /* =========================
     INITIAL LOAD
  ========================= */
  runLogistics();
})();
