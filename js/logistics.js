(() => {

/* =====================================================
   CORE
===================================================== */

const $ = (id) => document.getElementById(id);
const API_BASE = window.API_BASE || "";

/* ===============================
   FORMATTERS
=============================== */
const money = v =>
  (Number(v) || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

const percent = v => {
  const n = Number(v) || 0;
  return (Math.abs(n) <= 1 ? n * 100 : n).toFixed(2) + "%";
};

/* =====================================================
   API
===================================================== */

async function apiPost(url, body) {
  const token = localStorage.getItem("token");
  if (!token) return location.replace("login.html");

  const res = await fetch(`${API_BASE}${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });

  if (res.status === 401) return location.replace("login.html");
  if (res.status === 403) return location.replace("payment.html");
  if (!res.ok) return null;

  return res.json();
}

/* =====================================================
   UI HELPERS
===================================================== */

function setText(id, value) {
  const el = $(id);
  if (el) el.textContent = value ?? "—";
}

function setClass(el, cls) {
  if (!el) return;
  el.className = `output-value ${cls || ""}`;
}

function renderSteps(containerId, steps = []) {
  const el = $(containerId);
  if (!el) return;

  el.innerHTML = steps.map(s => `
    <li>
      <strong>${s.step}</strong>
      ${s.message}
    </li>
  `).join("");
}

/* =====================================================
   DEBOUNCE SYSTEM
===================================================== */

const timers = {};
function debounce(key, fn, delay = 300) {
  clearTimeout(timers[key]);
  timers[key] = setTimeout(fn, delay);
}

/* =====================================================
   SAVE SYSTEM (EDITABLE DEALS)
===================================================== */

function getSavedDeals(type) {
  return JSON.parse(localStorage.getItem(`deals_${type}`) || "[]");
}

function saveDeal(type, payload) {
  const deals = getSavedDeals(type);

  const deal = {
    id: Date.now(),
    date: new Date().toISOString(),
    ...payload
  };

  deals.push(deal);
  localStorage.setItem(`deals_${type}`, JSON.stringify(deals));

  return deal;
}

function updateDeal(type, id, payload) {
  let deals = getSavedDeals(type);

  deals = deals.map(d =>
    d.id === id ? { ...d, ...payload, updatedAt: new Date().toISOString() } : d
  );

  localStorage.setItem(`deals_${type}`, JSON.stringify(deals));
}

/* =====================================================
   MONTHLY OPERATIONS
===================================================== */

async function runMonthly() {
    const elShipments = $("log-shipments");
    if (!elShipments) return;

    const inputs = {
        shipments: parseFloat(elShipments.value) || 0,
        revenuePer: parseFloat($("log-revenue")?.value) || 0,
        fuel: parseFloat($("log-fuel")?.value) || 0,
        labor: parseFloat($("log-labor")?.value) || 0,
        maintenance: parseFloat($("log-maintenance")?.value) || 0,
        fixed: parseFloat($("log-fixed")?.value) || 0
    };

    const data = await apiPost("/api/calculators/logistics/business", inputs);
    if (!data) return;

    // Financial Overview
    setText("log-total-revenue", money(data.totalRevenue));
    setText("log-total-costs", money(data.totalCosts));
    setText("log-profit", money(data.profit));
    setText("log-status", data.status);
    setText("log-annual-profit", money(data.annualProfit));

    // Per Shipment Metrics
    setText("log-shipments-output", data.shipments);
    setText("log-revenue-per-shipment", money(data.revenuePerShipment));
    setText("log-per-shipment", money(data.costPerShipment));
    setText("log-profit-per-shipment", money(data.profitPerShipment));

    // Cost Breakdown
    setText("log-fuel-pct", percent(data.fuelPercent));
    setText("log-labor-pct", percent(data.laborPercent));
    setText("log-maintenance-pct", percent(data.maintenancePercent));
    setText("log-fixed-pct", percent(data.fixedPercent));

    // Risk
    setText("log-risk-level", data.riskLevel);
    setText("log-safety", data.safetyStatus);
    setText("log-recommended-price", money(data.recommendedPricePerShipment));
    setText("log-advice", data.advice);

    // Styling
    setClass(
        $("log-profit"),
        data.profit >= 0 ? "profit-positive" : "profit-negative"
    );

    setClass(
        $("log-risk-level"),
        `risk-${String(data.riskLevel).toLowerCase().replace(/\s+/g, "-")}`
    );

    setClass(
        $("log-safety"),
        `safety-${String(data.safetyStatus).toLowerCase().replace(/\s+/g, "-")}`
    );

    renderSteps("log-steps", data.steps || []);
}


/* =====================================================
   PER SHIPMENT
===================================================== */

async function runShipment() {

    const elQuote = $("ship-quote");
    if (!elQuote) return;

    const inputs = {

        quote: parseFloat(elQuote.value) || 0,

        minMargin: parseFloat($("ship-min-margin")?.value) || 0,
        buffer: parseFloat($("ship-buffer")?.value) || 0,

        distance: parseFloat($("ship-distance")?.value) || 0,
        fuelPerKm: parseFloat($("ship-fuel-km")?.value) || 0,
        vehiclePerKm: parseFloat($("ship-vehicle-km")?.value) || 0,
        loadFactor: parseFloat($("ship-load-factor")?.value) || 0,

        drivingHours: parseFloat($("ship-driving-hours")?.value) || 0,
        waitingHours: parseFloat($("ship-wait-hours")?.value) || 0,
        driverRate: parseFloat($("ship-driver-rate")?.value) || 0,

        tolls: parseFloat($("ship-tolls")?.value) || 0,
        permits: parseFloat($("ship-permits")?.value) || 0,
        otherFees: parseFloat($("ship-other-fees")?.value) || 0,

        cargoValue: parseFloat($("ship-cargo-value")?.value) || 0,
        insuranceRate: parseFloat($("ship-insurance")?.value) || 0,

        duties: parseFloat($("ship-duties")?.value) || 0,
        handling: parseFloat($("ship-handling")?.value) || 0,
        passThrough: parseFloat($("ship-pass-through")?.value) || 0
    };

    const data = await apiPost("/api/calculators/logistics/shipment", inputs);
    if (!data) return;

    // Results
    setText("ship-total-cost", money(data.totalCost));
    setText("ship-profit", money(data.profit));
    setText("ship-margin", percent(data.margin));
    setText("ship-min-quote", money(data.recommendedMinQuote));
    setText("ship-decision", data.decision);
    setText("ship-reason", data.reason);

    // Styling
    setClass(
        $("ship-profit"),
        data.profit >= 0 ? "profit-positive" : "profit-negative"
    );

    setClass(
        $("ship-decision"),
        `decision-${String(data.decision).toLowerCase().replace(/\s+/g, "-")}`
    );

    setClass(
        $("ship-margin"),
        data.margin >= 20
            ? "margin-strong"
            : data.margin >= 10
            ? "margin-medium"
            : "margin-low"
    );

    renderSteps("ship-steps", data.steps || []);
}
/* =====================================================
   FREIGHT ENGINE
===================================================== */

async function runFreight() {

  const inputs = {
    quote: +$("freight-quote")?.value || 0
  };

  const data = await apiPost("/api/calculators/logistics/freight", inputs);
  if (!data) return;

  setText("freight-total-cost", money(data.totalCost));
  setText("freight-profit", money(data.profit));
  setText("freight-margin", percent(data.margin));
  setText("freight-risk", data.riskLevel);

  setClass($("freight-profit"),
    data.profit >= 0 ? "profit-positive" : "profit-negative"
  );

  setClass($("freight-margin"),
    data.margin >= 20 ? "margin-strong" :
    data.margin >= 10 ? "margin-medium" : "margin-low"
  );

  setClass($("freight-risk"),
    data.riskLevel === "Low" ? "freight-risk-low" :
    data.riskLevel === "Medium" ? "freight-risk-medium" : "freight-risk-high"
  );

  renderSteps("freight-steps", data.steps);

  $("saveFreightBtn")?.onclick = () => {
    saveDeal("logistics-freight", { inputs, results: data });
  };
}

/* =====================================================
   EVENT BINDING (CLEAN + SCALABLE)
===================================================== */

function bind() {

  document.querySelectorAll("#operations-panel input")
    .forEach(i => i.addEventListener("input", () => debounce("m", runMonthly)));

  document.querySelectorAll("#shipment-panel input")
    .forEach(i => i.addEventListener("input", () => debounce("s", runShipment)));

  document.querySelectorAll("#freight-panel input")
    .forEach(i => i.addEventListener("input", () => debounce("f", runFreight)));
}

bind();

})();
