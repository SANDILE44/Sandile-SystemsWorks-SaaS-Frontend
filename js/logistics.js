(() => {
  const $ = (id) => document.getElementById(id);

  const money = (v) =>
    (Number(v) || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const percent = (v) => `${(Number(v) || 0).toFixed(2)}%`;

  let debounceTimer;

  async function apiPost(url, body) {
    const token = localStorage.getItem('token');

    if (!token) {
      location.replace('login.html');
      return null;
    }

    const res = await fetch(`${API_BASE}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

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

  function clearClasses(el) {
    if (!el) return;
    el.classList.remove(
      'profit-positive',
      'profit-negative',
      'margin-strong',
      'margin-medium',
      'margin-low',
      'decision-approve',
      'decision-review',
      'decision-reject',
      'risk-low',
      'risk-medium',
      'risk-high',
      'freight-risk-low',
      'freight-risk-medium',
      'freight-risk-high',
      'safety-healthy',
      'safety-risk',
      'safety-critical'
    );
  }

  function applyClass(el, className) {
    if (!el) return;
    clearClasses(el);
    el.classList.add(className);
  }

  function safeText(id, value) {
    const el = $(id);
    if (el) el.textContent = value;
  }

  function updateMonthly() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runMonthly, 300);
  }

  async function runMonthly() {
    const data = await apiPost('/api/calculators/logistics/business', {
      shipments: +$('log-shipments')?.value || 0,
      revenuePer: +$('log-revenue')?.value || 0,
      fuel: +$('log-fuel')?.value || 0,
      labor: +$('log-labor')?.value || 0,
      maintenance: +$('log-maintenance')?.value || 0,
      fixed: +$('log-fixed')?.value || 0,
    });

    if (!data) return;

    safeText('log-shipments-output', data.shipments ?? 0);
    safeText('log-total-revenue', money(data.totalRevenue));
    safeText('log-total-costs', money(data.totalCosts));
    safeText('log-profit', money(data.profit));
    safeText('log-per-shipment', money(data.costPerShipment));
    safeText('log-revenue-per-shipment', money(data.revenuePerShipment));
    safeText('log-profit-per-shipment', money(data.profitPerShipment));
    safeText('log-margin', percent(data.margin));
    safeText('log-roi', percent(data.roi));
    safeText('log-breakeven-shipments', data.breakEvenShipments ?? 0);
    safeText('log-annual-profit', money(data.annualProfit));

    safeText('log-fuel-pct', percent(data.fuelPercent));
    safeText('log-labor-pct', percent(data.laborPercent));
    safeText('log-maintenance-pct', percent(data.maintenancePercent));
    safeText('log-fixed-pct', percent(data.fixedPercent));

    safeText('log-status', data.status || '—');
    safeText('log-risk-level', data.riskLevel || '—');
    safeText('log-recommended-price', money(data.recommendedPricePerShipment));
    safeText('log-safety', data.safetyStatus || '—');
    safeText('log-advice', data.advice || '—');

    if (data.profit >= 0) {
      applyClass($('log-profit'), 'profit-positive');
    } else {
      applyClass($('log-profit'), 'profit-negative');
    }

    const margin = Number(data.margin) || 0;
    if (margin >= 20) {
      applyClass($('log-margin'), 'margin-strong');
    } else if (margin >= 10) {
      applyClass($('log-margin'), 'margin-medium');
    } else {
      applyClass($('log-margin'), 'margin-low');
    }

    const risk = (data.riskLevel || '').toLowerCase();
    if (risk === 'low') {
      applyClass($('log-risk-level'), 'risk-low');
    } else if (risk === 'medium') {
      applyClass($('log-risk-level'), 'risk-medium');
    } else if (risk === 'high') {
      applyClass($('log-risk-level'), 'risk-high');
    }

    const safety = (data.safetyStatus || '').toLowerCase();
    if (safety === 'healthy') {
      applyClass($('log-safety'), 'safety-healthy');
    } else if (safety === 'risk') {
      applyClass($('log-safety'), 'safety-risk');
    } else if (safety === 'critical') {
      applyClass($('log-safety'), 'safety-critical');
    }
  }

  async function runShipment() {
    const data = await apiPost('/api/calculators/logistics/shipment', {
      quote: +$('ship-quote')?.value || 0,
      minMargin: +$('ship-min-margin')?.value || 0,
      buffer: +$('ship-buffer')?.value || 0,
      distance: +$('ship-distance')?.value || 0,
      fuelPerKm: +$('ship-fuel-km')?.value || 0,
      vehiclePerKm: +$('ship-vehicle-km')?.value || 0,
      loadFactor: +$('ship-load-factor')?.value || 100,
      drivingHours: +$('ship-driving-hours')?.value || 0,
      waitHours: +$('ship-wait-hours')?.value || 0,
      driverRate: +$('ship-driver-rate')?.value || 0,
      tolls: +$('ship-tolls')?.value || 0,
      permits: +$('ship-permits')?.value || 0,
      otherFees: +$('ship-other-fees')?.value || 0,
      cargoValue: +$('ship-cargo-value')?.value || 0,
      insuranceRate: +$('ship-insurance')?.value || 0,
      duties: +$('ship-duties')?.value || 0,
      handling: +$('ship-handling')?.value || 0,
      passThrough: +$('ship-pass-through')?.value || 0,
    });

    if (!data) return;

    safeText('ship-total-cost', money(data.totalCost));
    safeText('ship-profit', money(data.profit));
    safeText('ship-margin', percent(data.margin));
    safeText('ship-min-quote', money(data.recommendedMinQuote));
    safeText('ship-decision', data.decision || '—');
    safeText('ship-reason', data.reason || '—');

    if (data.profit >= 0) {
      applyClass($('ship-profit'), 'profit-positive');
    } else {
      applyClass($('ship-profit'), 'profit-negative');
    }

    const margin = Number(data.margin) || 0;
    if (margin >= 20) {
      applyClass($('ship-margin'), 'margin-strong');
    } else if (margin >= 10) {
      applyClass($('ship-margin'), 'margin-medium');
    } else {
      applyClass($('ship-margin'), 'margin-low');
    }

    const decision = (data.decision || '').toUpperCase();
    if (decision === 'APPROVE') {
      applyClass($('ship-decision'), 'decision-approve');
    } else if (decision === 'REJECT') {
      applyClass($('ship-decision'), 'decision-reject');
    } else {
      applyClass($('ship-decision'), 'decision-review');
    }
  }

  async function runFreight() {
    const data = await apiPost('/api/calculators/logistics/freight', {
      quote: +$('freight-quote')?.value || 0,
      cargoValue: +$('freight-cargo-value')?.value || 0,
      insuranceRate: +$('freight-insurance-rate')?.value || 0,
      freightCost: +$('freight-cost')?.value || 0,
      fuelSurcharge: +$('freight-fuel-surcharge')?.value || 0,
      dutyRate: +$('freight-duty-rate')?.value || 0,
      customsFees: +$('freight-customs-fees')?.value || 0,
      portFees: +$('freight-port-fees')?.value || 0,
      handlingFees: +$('freight-handling-fees')?.value || 0,
      inlandTransport: +$('freight-inland-transport')?.value || 0,
      tollCosts: +$('freight-tolls')?.value || 0,
      otherCosts: +$('freight-other-costs')?.value || 0,
    });

    if (!data) return;

    safeText('freight-insurance-cost', money(data.insuranceCost));
    safeText('freight-duties', money(data.duties));
    safeText('freight-total-cost', money(data.totalCost));
    safeText('freight-profit', money(data.profit));
    safeText('freight-margin', percent(data.margin));
    safeText('freight-breakeven', money(data.breakEvenQuote));

    safeText('freight-decision', data.decision || '—');
    safeText('freight-reason', data.reason || '—');
    safeText('freight-risk', data.riskLevel || '—');

    if (data.profit >= 0) {
      applyClass($('freight-profit'), 'profit-positive');
    } else {
      applyClass($('freight-profit'), 'profit-negative');
    }

    const margin = Number(data.margin) || 0;
    if (margin >= 20) {
      applyClass($('freight-margin'), 'margin-strong');
    } else if (margin >= 10) {
      applyClass($('freight-margin'), 'margin-medium');
    } else {
      applyClass($('freight-margin'), 'margin-low');
    }

    const decision = (data.decision || '').toUpperCase();
    if (decision === 'APPROVE') {
      applyClass($('freight-decision'), 'decision-approve');
    } else if (decision === 'REJECT') {
      applyClass($('freight-decision'), 'decision-reject');
    } else {
      applyClass($('freight-decision'), 'decision-review');
    }

    const risk = (data.riskLevel || '').toLowerCase();
    if (risk === 'low') {
      applyClass($('freight-risk'), 'freight-risk-low');
    } else if (risk === 'medium') {
      applyClass($('freight-risk'), 'freight-risk-medium');
    } else if (risk === 'high') {
      applyClass($('freight-risk'), 'freight-risk-high');
    }
  }

  function bindEvents() {
    document.querySelectorAll('#operations-panel input').forEach((i) => {
      i.addEventListener('input', updateMonthly);
    });

    document.querySelectorAll('#shipment-panel input').forEach((i) => {
      i.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(runShipment, 300);
      });
    });

    document.querySelectorAll('#freight-panel input').forEach((i) => {
      i.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(runFreight, 300);
      });
    });
  }

  bindEvents();
})();