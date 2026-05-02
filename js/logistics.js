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
   MONTHLY ENGINE
===================================================== */

async function runMonthly() {

  const inputs = {
    shipments: +$("log-shipments")?.value || 0,
    revenuePer: +$("log-revenue")?.value || 0,
    fuel: +$("log-fuel")?.value || 0,
    labor: +$("log-labor")?.value || 0,
    maintenance: +$("log-maintenance")?.value || 0,
    fixed: +$("log-fixed")?.value || 0
  };

  const data = await apiPost("/api/calculators/logistics/business", inputs);
  if (!data) return;

  /* ================= UI MAP ================= */
  setText("log-total-revenue", money(data.totalRevenue));
  setText("log-total-costs", money(data.totalCosts));
  setText("log-profit", money(data.profit));
  setText("log-per-shipment", money(data.costPerShipment));
  setText("log-profit-per-shipment", money(data.profitPerShipment));
  setText("log-margin", percent(data.margin));
  setText("log-annual-profit", money(data.annualProfit));
  setText("log-risk-level", data.riskLevel);
  setText("log-safety", data.safetyStatus);

  /* ================= COLORS (KEEP YOUR STYLE) ================= */
  setClass($("log-profit"),
    data.profit >= 0 ? "profit-positive" : "profit-negative"
  );

  setClass($("log-risk-level"),
    data.riskLevel === "Low" ? "risk-low" :
    data.riskLevel === "Medium" ? "risk-medium" : "risk-high"
  );

  renderSteps("log-steps", data.steps);

  /* ================= SAVE (EDITABLE) ================= */
  $("saveOperationsBtn")?.onclick = () => {
    saveDeal("operations", {
      inputs,
      results: {
        profit: data.profit,
        margin: data.margin
      }
    });
  };
}

/* =====================================================
   SHIPMENT ENGINE
===================================================== */

async function runShipment() {

  const inputs = {
    quote: +$("ship-quote")?.value || 0,
    distance: +$("ship-distance")?.value || 0
  };

  const data = await apiPost("/api/calculators/logistics/shipment", inputs);
  if (!data) return;

  setText("ship-total-cost", money(data.totalCost));
  setText("ship-profit", money(data.profit));
  setText("ship-margin", percent(data.margin));
  setText("ship-decision", data.decision);

  setClass($("ship-profit"),
    data.profit >= 0 ? "profit-positive" : "profit-negative"
  );

  setClass($("ship-margin"),
    data.margin >= 20 ? "margin-strong" :
    data.margin >= 10 ? "margin-medium" : "margin-low"
  );

  setClass($("ship-decision"),
    data.decision === "APPROVE" ? "decision-approve" :
    data.decision === "REJECT" ? "decision-reject" : "decision-review"
  );

  renderSteps("ship-steps", data.steps);

  $("saveShipmentBtn")?.onclick = () => {
    saveDeal("shipment", { inputs, results: data });
  };
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
    saveDeal("freight", { inputs, results: data });
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
