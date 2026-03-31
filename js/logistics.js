(() => {

/* ===============================
HELPERS
=============================== */

const $ = id => document.getElementById(id);

const money = v => (Number(v) || 0).toLocaleString(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const percent = v => {
  const n = Number(v) || 0;
  return (Math.abs(n) <= 1 ? n * 100 : n).toFixed(2) + "%";
};

let debounceTimer;

/* ===============================
API POST HELPER
=============================== */

async function apiPost(url, body){
  const token = localStorage.getItem("token");
  if(!token) { location.replace("login.html"); return null; }

  try{
    const res = await fetch(`${API_BASE}${url}`,{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        Authorization:`Bearer ${token}`
      },
      body:JSON.stringify(body)
    });

    if(res.status === 401){
      localStorage.removeItem("token");
      location.replace("login.html");
      return null;
    }

    if(res.status === 403){
      location.replace("payment.html");
      return null;
    }

    if(!res.ok) return null;
    return await res.json();

  }catch(err){
    console.error("API error", err);
    return null;
  }
}

/* ===============================
CLASS HELPER
=============================== */

function setClass(el, extra){
  if(!el) return;
  el.className = `output-value ${extra || ""}`;
}

/* ===============================
STEP RENDERER
=============================== */

function renderSteps(containerId, steps){
  const container = $(containerId);
  if(!container) return;

  if(!steps || !Array.isArray(steps)) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = steps.map(s => {
    if(typeof s === "string") return `<li>${s}</li>`;
    // If it's an object, try to stringify or format nicely
    if(typeof s === "object") {
      return `<li>${Object.entries(s).map(([k,v]) => `<strong>${k}:</strong> ${v}`).join(", ")}</li>`;
    }
    return `<li>${s}</li>`;
  }).join("");
}

/* ===============================
MONTHLY OPERATIONS
=============================== */

function updateMonthly(){ clearTimeout(debounceTimer); debounceTimer = setTimeout(runMonthly,300); }

async function runMonthly(){
  const data = await apiPost("/api/calculators/logistics/business",{
    shipments: +$("log-shipments")?.value || 0,
    revenuePer: +$("log-revenue")?.value || 0,
    fuel: +$("log-fuel")?.value || 0,
    labor: +$("log-labor")?.value || 0,
    maintenance: +$("log-maintenance")?.value || 0,
    fixed: +$("log-fixed")?.value || 0
  });
  if(!data) return;

  const map = {
    "log-shipments-output": data.shipments ?? 0,
    "log-total-revenue": money(data.totalRevenue),
    "log-total-costs": money(data.totalCosts),
    "log-profit": money(data.profit),
    "log-per-shipment": money(data.costPerShipment),
    "log-revenue-per-shipment": money(data.revenuePerShipment),
    "log-profit-per-shipment": money(data.profitPerShipment),
    "log-margin": percent(data.margin),
    "log-roi": percent(data.roi),
    "log-breakeven-shipments": data.breakEvenShipments ?? 0,
    "log-annual-profit": money(data.annualProfit),
    "log-fuel-pct": percent(data.fuelPercent),
    "log-labor-pct": percent(data.laborPercent),
    "log-maintenance-pct": percent(data.maintenancePercent),
    "log-fixed-pct": percent(data.fixedPercent),
    "log-status": data.status || "—",
    "log-risk-level": data.riskLevel || "—",
    "log-recommended-price": money(data.recommendedPricePerShipment),
    "log-safety": data.safetyStatus || "—",
    "log-advice": data.advice || "—"
  };

  Object.entries(map).forEach(([id, value]) => {
    const el = $(id);
    if(el) el.textContent = value;
  });

  const risk = (data.riskLevel || "").toLowerCase();
  setClass($("log-risk-level"), risk === "low" ? "risk-low" : risk === "medium" ? "risk-medium" : "risk-high");
  setClass($("log-profit"), data.profit >= 0 ? "profit-positive" : "profit-negative");

  // Render step-by-step guidance
  renderSteps("log-steps", data.steps);
}

/* ===============================
SHIPMENT CALCULATOR
=============================== */

async function runShipment(){
  const data = await apiPost("/api/calculators/logistics/shipment",{
    quote: +$("ship-quote")?.value || 0,
    minMargin: +$("ship-min-margin")?.value || 0,
    buffer: +$("ship-buffer")?.value || 0,
    distance: +$("ship-distance")?.value || 0,
    fuelPerKm: +$("ship-fuel-km")?.value || 0,
    vehiclePerKm: +$("ship-vehicle-km")?.value || 0,
    loadFactor: +$("ship-load-factor")?.value || 100,
    drivingHours: +$("ship-driving-hours")?.value || 0,
    waitHours: +$("ship-wait-hours")?.value || 0,
    driverRate: +$("ship-driver-rate")?.value || 0,
    tolls: +$("ship-tolls")?.value || 0,
    permits: +$("ship-permits")?.value || 0,
    otherFees: +$("ship-other-fees")?.value || 0,
    cargoValue: +$("ship-cargo-value")?.value || 0,
    insuranceRate: +$("ship-insurance-rate")?.value || 0,
    duties: +$("ship-duties")?.value || 0,
    handling: +$("ship-handling")?.value || 0,
    passThrough: +$("ship-pass-through")?.value || 0
  });
  if(!data) return;

  const map = {
    "ship-total-cost": money(data.totalCost),
    "ship-profit": money(data.profit),
    "ship-margin": percent(data.margin),
    "ship-min-quote": money(data.recommendedMinQuote),
    "ship-decision": data.decision,
    "ship-reason": data.reason
  };
  Object.entries(map).forEach(([id, value]) => {
    const el = $(id);
    if(el) el.textContent = value;
  });

  const decision = (data.decision || "").toUpperCase();
  setClass($("ship-decision"), decision === "APPROVE" ? "decision-approve" : decision === "REJECT" ? "decision-reject" : "decision-review");
  setClass($("ship-profit"), data.profit >= 0 ? "profit-positive" : "profit-negative");
  const margin = Number(data.margin) || 0;
  setClass($("ship-margin"), margin >= 20 ? "margin-strong" : margin >= 10 ? "margin-medium" : "margin-low");

  renderSteps("ship-steps", data.steps);
}

/* ===============================
FREIGHT CALCULATOR
=============================== */

async function runFreight(){
  const data = await apiPost("/api/calculators/logistics/freight",{
    quote: +$("freight-quote")?.value || 0,
    cargoValue: +$("freight-cargo-value")?.value || 0,
    insuranceRate: +$("freight-insurance-rate")?.value || 0,
    freightCost: +$("freight-cost")?.value || 0,
    fuelSurcharge: +$("freight-fuel-surcharge")?.value || 0,
    dutyRate: +$("freight-duty-rate")?.value || 0,
    customsFees: +$("freight-customs-fees")?.value || 0,
    portFees: +$("freight-port-fees")?.value || 0,
    handlingFees: +$("freight-handling-fees")?.value || 0,
    inlandTransport: +$("freight-inland-transport")?.value || 0,
    tollCosts: +$("freight-toll-costs")?.value || 0,
    otherCosts: +$("freight-other-costs")?.value || 0
  });
  if(!data) return;

  const map = {
    "freight-insurance-cost": money(data.insuranceCost),
    "freight-duties": money(data.duties),
    "freight-total-cost": money(data.totalCost),
    "freight-profit": money(data.profit),
    "freight-margin": percent(data.margin),
    "freight-breakeven": money(data.breakEvenQuote),
    "freight-decision": data.decision,
    "freight-reason": data.reason,
    "freight-risk": data.riskLevel
  };
  Object.entries(map).forEach(([id, value]) => {
    const el = $(id);
    if(el) el.textContent = value;
  });

  const decision = (data.decision || "").toUpperCase();
  setClass($("freight-decision"), decision === "APPROVE" ? "decision-approve" : decision === "REJECT" ? "decision-reject" : "decision-review");
  setClass($("freight-profit"), data.profit >= 0 ? "profit-positive" : "profit-negative");
  const margin = Number(data.margin) || 0;
  setClass($("freight-margin"), margin >= 20 ? "margin-strong" : margin >= 10 ? "margin-medium" : "margin-low");
  const risk = (data.riskLevel || "").toLowerCase();
  setClass($("freight-risk"), risk === "low" ? "freight-risk-low" : risk === "medium" ? "freight-risk-medium" : "freight-risk-high");

  renderSteps("freight-steps", data.steps);
}

/* ===============================
EVENT BINDING
=============================== */

function bindEvents(){
  document.querySelectorAll("#operations-panel input").forEach(i => i.addEventListener("input", updateMonthly));
  document.querySelectorAll("#shipment-panel input").forEach(i => i.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runShipment, 300);
  }));
  document.querySelectorAll("#freight-panel input").forEach(i => i.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runFreight, 300);
  }));
}

bindEvents();

})();