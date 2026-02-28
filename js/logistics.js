(() => {
  const $ = (id) => document.getElementById(id);

  const money = (v) =>
    'R' +
    (Number(v) || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const percent = (v) =>
    (Number(v) || 0).toFixed(2) + '%';

  let debounceTimer;

  /* =========================================================
     AUTH + API HELPER
  ========================================================== */

  async function apiPost(url, body) {
    const token = localStorage.getItem('token');
    if (!token) {
      location.replace('login.html');
      return null;
    }

    const res = await fetch(
      `${API_BASE}${url}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );

    if (res.status === 401) {
      localStorage.removeItem('token');
      location.replace('login.html');
      return null;
    }

    if (res.status === 403) {
      location.replace('payment.html');
      return null;
    }

    if (!res.ok) return null;

    return res.json();
  }

  /* =========================================================
     MONTHLY CALCULATOR (BACKEND)
  ========================================================== */

  function updateMonthly() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runMonthly, 300);
  }

  async function runMonthly() {
    const data = await apiPost(
      '/api/calculators/logistics/business',
      {
        shipments: +$('log-shipments')?.value || 0,
        revenuePer: +$('log-revenue')?.value || 0,
        fuel: +$('log-fuel')?.value || 0,
        labor: +$('log-labor')?.value || 0,
        maintenance: +$('log-maintenance')?.value || 0,
        fixed: +$('log-fixed')?.value || 0,
      }
    );

    if (!data) return;

    $('log-total-revenue').textContent =
      money(data.totalRevenue);

    $('log-total-costs').textContent =
      money(data.totalCosts);

    $('log-profit').textContent =
      money(data.profit);

    $('log-margin').textContent =
      percent(data.margin);

    $('log-breakeven-shipments').textContent =
      data.breakEvenShipments ?? 0;

    $('log-risk-level').textContent =
      data.riskLevel || '—';

    $('log-recommended-price').textContent =
      money(data.recommendedPricePerShipment);

    $('log-advice').textContent =
      data.advice || '—';
  }

  /* =========================================================
     SHIPMENT CALCULATOR (BACKEND)
  ========================================================== */

  async function runShipment() {
    const data = await apiPost(
      '/api/calculators/logistics/shipment',
      {
        quote: +$('ship-quote')?.value || 0,
        minMargin: +$('ship-min-margin')?.value || 0,
        buffer: +$('ship-buffer')?.value || 0,
        distance: +$('ship-distance')?.value || 0,
        fuelPerKm: +$('ship-fuel-km')?.value || 0,
        vehiclePerKm:
          +$('ship-vehicle-km')?.value || 0,
        loadFactor:
          +$('ship-load-factor')?.value || 100,
        drivingHours:
          +$('ship-driving-hours')?.value || 0,
        waitHours:
          +$('ship-wait-hours')?.value || 0,
        driverRate:
          +$('ship-driver-rate')?.value || 0,
        tolls: +$('ship-tolls')?.value || 0,
        permits: +$('ship-permits')?.value || 0,
        otherFees:
          +$('ship-other-fees')?.value || 0,
        cargoValue:
          +$('ship-cargo-value')?.value || 0,
        insuranceRate:
          +$('ship-insurance')?.value || 0,
        duties: +$('ship-duties')?.value || 0,
        handling:
          +$('ship-handling')?.value || 0,
        passThrough:
          +$('ship-pass-through')?.value || 0,
      }
    );

    if (!data) return;

    $('ship-total-cost').textContent =
      money(data.totalCost);

    $('ship-profit').textContent =
      money(data.profit);

    $('ship-margin').textContent =
      percent(data.margin);

    $('ship-min-quote').textContent =
      money(data.recommendedMinQuote);

    $('ship-decision').textContent =
      data.decision;

    $('ship-reason').textContent =
      data.reason;
  }

  /* =========================================================
     EVENT BINDING
  ========================================================== */

  function bindEvents() {
    // Monthly inputs
    document
      .querySelectorAll(
        '.calculator-container:not(.advanced-module) input'
      )
      .forEach((i) =>
        i.addEventListener('input', updateMonthly)
      );

    // Shipment inputs (debounced)
document
  .querySelectorAll('.advanced-module input')
  .forEach((i) =>
    i.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(runShipment, 300);
    })
  );

    // Reset
    $('resetBtn')?.addEventListener(
      'click',
      () => {
        document
          .querySelectorAll(
            '.calculator-container input'
          )
          .forEach((i) => (i.value = ''));

        runMonthly();
        runShipment();
      }
    );

    // Logout
    $('logoutBtn')?.addEventListener(
      'click',
      () => {
        localStorage.removeItem('token');
        location.replace('login.html');
      }
    );
  }

  /* =========================================================
     INIT
  ========================================================== */

  bindEvents();
  runMonthly();
})();

