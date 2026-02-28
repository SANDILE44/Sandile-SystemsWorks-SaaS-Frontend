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

  /* =========================================================
     MONTHLY LOGISTICS CALCULATOR (API BASED)
  ========================================================== */

  function updateMonthly() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runMonthly, 300);
  }

  async function runMonthly() {
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

      $('log-total-revenue').textContent = money(d.totalRevenue);
      $('log-total-costs').textContent = money(d.totalCosts);
      $('log-profit').textContent = money(d.profit);
      $('log-margin').textContent = percent(d.margin);
      $('log-breakeven-shipments').textContent =
        d.breakEvenShipments ?? 0;
      $('log-risk-level').textContent = d.riskLevel || '—';
      $('log-recommended-price').textContent =
        money(d.recommendedPricePerShipment);
      $('log-advice').textContent = d.advice || '—';

    } catch (err) {
      console.error('Monthly logistics error:', err);
    }
  }

  /* =========================================================
     SHIPMENT RISK ENGINE (LOCAL DECISION ENGINE)
  ========================================================== */

  function calculateShipment() {
    const get = (id) => +($(id)?.value) || 0;

    const quote = get('ship-quote');
    const minMargin = get('ship-min-margin');
    const buffer = get('ship-buffer');

    const distance = get('ship-distance');
    const fuelPerKm = get('ship-fuel-km');
    const vehiclePerKm = get('ship-vehicle-km');
    const loadFactor = get('ship-load-factor') || 100;

    const drivingHours = get('ship-driving-hours');
    const waitHours = get('ship-wait-hours');
    const driverRate = get('ship-driver-rate');

    const tolls = get('ship-tolls');
    const permits = get('ship-permits');
    const otherFees = get('ship-other-fees');

    const cargoValue = get('ship-cargo-value');
    const insuranceRate = get('ship-insurance');

    const duties = get('ship-duties');
    const handling = get('ship-handling');
    const passThrough = get('ship-pass-through');

    /* ---------- COST CALCULATION ---------- */

    const fuelCost = distance * fuelPerKm;
    const vehicleCost = distance * vehiclePerKm;
    const timeCost = (drivingHours + waitHours) * driverRate;
    const insuranceCost = (insuranceRate / 100) * cargoValue;

    const baseCost =
      fuelCost +
      vehicleCost +
      timeCost +
      tolls +
      permits +
      otherFees +
      insuranceCost +
      duties +
      handling +
      passThrough;

    /* ---------- LOAD FACTOR ---------- */

    const loadMultiplier =
      loadFactor > 0 ? 100 / loadFactor : 1;

    const totalCost = baseCost * loadMultiplier;

    const profit = quote - totalCost;
    const margin =
      quote > 0 ? (profit / quote) * 100 : 0;

    const requiredMargin = minMargin + buffer;

    /* ---------- SAFE RECOMMENDED QUOTE ---------- */

    let recommendedQuote = totalCost;

    if (
      requiredMargin > 0 &&
      requiredMargin < 100
    ) {
      recommendedQuote =
        totalCost /
        (1 - requiredMargin / 100);
    }

    /* ---------- DECISION ---------- */

    let decision = 'REVIEW';
    let explanation =
      'Shipment requires review before approval.';

    if (margin >= requiredMargin) {
      decision = 'APPROVE';
      explanation =
        'Shipment meets required margin and safety buffer.';
    } else if (margin < minMargin) {
      decision = 'REJECT';
      explanation =
        'Shipment does not meet minimum margin requirement.';
    }

    /* ---------- OUTPUT ---------- */

    $('ship-total-cost').textContent =
      money(totalCost);

    $('ship-profit').textContent =
      money(profit);

    $('ship-margin').textContent =
      percent(margin);

    $('ship-min-quote').textContent =
      money(recommendedQuote);

    $('ship-decision').textContent =
      decision;

    $('ship-reason').textContent =
      explanation;
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

    // Shipment inputs
    document
      .querySelectorAll('.advanced-module input')
      .forEach((i) =>
        i.addEventListener('input', calculateShipment)
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
        calculateShipment();
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
     INITIALIZE
  ========================================================== */

  bindEvents();
  runMonthly();
})();
