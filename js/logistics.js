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
async function apiPost(url, body) {
  const token = localStorage.getItem("token");
  if (!token) { location.replace("login.html"); return null; }

  try {
    const res = await fetch(`${API_BASE}${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    if (res.status === 401) {
      localStorage.removeItem("token");
      location.replace("login.html");
      return null;
    }

    if (res.status === 403) {
      location.replace("payment.html");
      return null;
    }

    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("API error", err);
    return null;
  }
}

/* ===============================
CLASS HELPER
=============================== */
function setClass(el, extra) {
  if (!el) return;
  el.className = `output-value ${extra || ""}`;
}

/* ===============================
STEP RENDERER
=============================== */
function renderSteps(containerId, steps) {
  const container = $(containerId);
  if (!container) return;

  if (!steps || !Array.isArray(steps)) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = steps.map(s => {
    let text = "";
    if (typeof s === "string") text = s;
    else if (typeof s === "object") {
      text = Object.entries(s).map(([k, v]) => `<strong>${k}:</strong> ${v}`).join(", ");
    }

    // Color-code values
    text = text.replace(/ROI\s*[:=]\s*([\d.]+)%/i, (m, val) => {
      const n = parseFloat(val);
      const cls = n >= 20 ? "profit-positive" : n >= 10 ? "margin-medium" : "profit-negative";
      return `ROI: <span class="${cls}">${val}%</span>`;
    });

    text = text.replace(/Profit\s*[:=]\s*([\d.]+)/i, (m, val) => {
      const n = parseFloat(val);
      return `Profit: <span class="${n >= 0 ? "profit-positive" : "profit-negative"}">${val}</span>`;
    });

    text = text.replace(/Margin\s*[:=]\s*([\d.]+)%/i, (m, val) => {
      const n = parseFloat(val);
      const cls = n >= 20 ? "margin-strong" : n >= 10 ? "margin-medium" : "margin-low";
      return `Margin: <span class="${cls}">${val}%</span>`;
    });

    text = text.replace(/Risk\s*[:=]\s*(Low|Medium|High)/i, (m, val) => {
      const cls = val.toLowerCase() === "low" ? "risk-low" :
                  val.toLowerCase() === "medium" ? "risk-medium" : "risk-high";
      return `Risk: <span class="${cls}">${val}</span>`;
    });

    text = text.replace(/Safety\s*[:=]\s*(Healthy|Risk|Critical)/i, (m, val) => {
      const cls = val.toLowerCase() === "healthy" ? "safety-healthy" :
                  val.toLowerCase() === "risk" ? "safety-risk" : "safety-critical";
      return `Safety: <span class="${cls}">${val}</span>`;
    });

    return `<li>${text}</li>`;
  }).join("");
}

/* ===============================
MONTHLY OPERATIONS
=============================== */
function updateMonthly() { clearTimeout(debounceTimer); debounceTimer = setTimeout(runMonthly, 300); }

async function runMonthly() {
  const data = await apiPost("/api/logistics/business", {
    shipments: +$("log-shipments")?.value || 0,
    revenuePer: +$("log-revenue")?.value || 0,
    fuel: +$("log-fuel")?.value || 0,
    labor: +$("log-labor")?.value || 0,
    maintenance: +$("log-maintenance")?.value || 0,
    fixed: +$("log-fixed")?.value || 0
  });
  if (!data) return;

  const map = {
    "log-shipments-output": data.shipments ?? 0,
    "log-total-revenue": money(data.totalRevenue),
    "log-total-costs": money(data.totalCosts),
    "log-profit": money(data.profit),
    "log-per-shipment": money(data.costPerShipment),
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
    if (el) el.textContent = value;
  });

  const risk = (data.riskLevel || "").toLowerCase();
  setClass($("log-risk-level"), risk === "low" ? "risk-low" : risk === "medium" ? "risk-medium" : "risk-high");
  setClass($("log-profit"), data.profit >= 0 ? "profit-positive" : "profit-negative");

  renderSteps("log-steps", data.steps);
}

/* ===============================
SHIPMENT & FREIGHT WRAPPERS
=============================== */
function debounceRun(fn, delay = 300) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(fn, delay);
}

async function runShipment() {
  const data = await apiPost("/api/logistics/shipment", Object.fromEntries(
    Array.from(document.querySelectorAll("#shipment-panel input")).map(i => [i.id.replace("ship-", ""), +i.value || 0])
  ));
  if (!data) return;

  const map = {
    "ship-total-cost": money(data.totalCost),
    "ship-profit": money(data.profit),
    "ship-margin": percent(data.margin),
    "ship-min-quote": money(data.recommendedMinQuote),
    "ship-decision": data.decision,
    "ship-reason": data.reason
  };
  Object.entries(map).forEach(([id, value]) => $(id)?.textContent = value);

  const decision = (data.decision || "").toUpperCase();
  setClass($("ship-decision"), decision === "APPROVE" ? "decision-approve" : decision === "REJECT" ? "decision-reject" : "decision-review");
  setClass($("ship-profit"), data.profit >= 0 ? "profit-positive" : "profit-negative");
  const margin = Number(data.margin) || 0;
  setClass($("ship-margin"), margin >= 20 ? "margin-strong" : margin >= 10 ? "margin-medium" : "margin-low");

  renderSteps("ship-steps", data.steps);
}

async function runFreight() {
  const data = await apiPost("/api/logistics/freight", Object.fromEntries(
    Array.from(document.querySelectorAll("#freight-panel input")).map(i => [i.id.replace("freight-", ""), +i.value || 0])
  ));
  if (!data) return;

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
  Object.entries(map).forEach(([id, value]) => $(id)?.textContent = value);

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
function bindEvents() {
  document.querySelectorAll("#operations-panel input").forEach(i => i.addEventListener("input", updateMonthly));
  document.querySelectorAll("#shipment-panel input").forEach(i => i.addEventListener("input", () => debounceRun(runShipment)));
  document.querySelectorAll("#freight-panel input").forEach(i => i.addEventListener("input", () => debounceRun(runFreight)));
}

bindEvents();

})();