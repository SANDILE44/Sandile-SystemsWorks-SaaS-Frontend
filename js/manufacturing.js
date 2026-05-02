(() => {

const $ = (id) => document.getElementById(id);

const API_BASE = "https://sandile-systemsworks-saas-backend-2.onrender.com";

let debounceTimer;
let latestData = null;

/* ================= FORMATTERS ================= */
const money = (v) =>
  (Number(v) || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

const percent = (v) => {
  const n = Number(v);
  if (!isFinite(n)) return "0.00%";
  return n.toFixed(2) + "%";
};

/* ================= SAFE DIVISION ================= */
function safeDivide(a, b) {
  if (!isFinite(a) || !isFinite(b) || b === 0) return 0;
  return a / b;
}

/* ================= INPUTS ================= */
function getInputs() {
  return {
    units: +$("mfg-units")?.value || 0,
    price: +$("mfg-price")?.value || 0,
    material: +$("mfg-material")?.value || 0,
    labor: +$("mfg-labor")?.value || 0,
    fixed: +$("mfg-fixed")?.value || 0,
    operational: +$("mfg-operational")?.value || 0
  };
}

/* ================= ENGINE ================= */
function runManufacturing() {

  const {
    units,
    price,
    material,
    labor,
    fixed,
    operational
  } = getInputs();

  /* ================= GUARD ================= */
  if (units <= 0 || price <= 0) {
    renderEmpty();
    return;
  }

  /* ================= REVENUE ================= */
  const revenue = units * price;

  /* ================= COST STRUCTURE ================= */
  const materialTotal = units * material;

  const totalFixedCosts =
    labor +
    fixed +
    operational;

  const totalCosts = materialTotal + totalFixedCosts;

  /* ================= PROFIT ================= */
  const profit = revenue - totalCosts;

  /* ================= UNIT ECONOMICS ================= */
  const costPerUnit = safeDivide(totalCosts, units);
  const profitPerUnit = safeDivide(profit, units);

  /* ================= PERFORMANCE ================= */
  const margin = safeDivide(profit, revenue) * 100;
  const roi = safeDivide(profit, totalCosts) * 100;

  /* ================= BREAK EVEN ================= */
  const contributionPerUnit = price - material;

  const breakEvenUnits =
    contributionPerUnit > 0
      ? Math.ceil(totalFixedCosts / contributionPerUnit)
      : 0;

  /* ================= STATUS ================= */
  let status = "PROFIT";
  let action = "Healthy operation.";

  if (profit <= 0) {
    status = "LOSS";
    action = "Costs exceed revenue — adjust pricing or reduce costs.";
  } 
  else if (margin < 10) {
    status = "RISK";
    action = "Low margin — optimize production efficiency.";
  } 
  else if (margin < 20) {
    status = "STABLE";
    action = "Moderate profitability — room for improvement.";
  }

  latestData = {
    revenue,
    totalCosts,
    profit,
    costPerUnit,
    profitPerUnit,
    margin,
    roi,
    breakEvenUnits,
    status,
    action
  };

  render(latestData);
}

/* ================= RENDER ================= */
function render(d) {

  $("revenue").textContent = money(d.revenue);
  $("totalCosts").textContent = money(d.totalCosts);
  $("profit").textContent = money(d.profit);

  $("costPerUnit").textContent = money(d.costPerUnit);
  $("profitPerUnit").textContent = money(d.profitPerUnit);

  $("margin").textContent = percent(d.margin);
  $("roi").textContent = percent(d.roi);

  $("breakeven").textContent = d.breakEvenUnits;

  const status = $("status");
  const advice = $("decisionAdvice");

  status.textContent = d.status;
  advice.textContent = d.action;

  status.classList.remove("profit", "loss", "neutral");

  status.classList.add(
    d.status === "LOSS"
      ? "loss"
      : d.status === "RISK"
      ? "neutral"
      : "profit"
  );
}

/* ================= EMPTY STATE ================= */
function renderEmpty() {

  ["revenue","totalCosts","profit","costPerUnit","profitPerUnit","margin","roi","breakeven"]
    .forEach(id => {
      const el = $(id);
      if (el) el.textContent = "—";
    });

  $("status").textContent = "—";
  $("decisionAdvice").textContent = "";
}

/* ================= RESET ================= */
function resetAll() {

  document.querySelectorAll(".input-section input")
    .forEach(i => i.value = "");

  latestData = null;
  renderEmpty();
}

/* ================= SAVE ================= */
async function saveDeal() {

  if (!latestData) return alert("Run calculation first");

  const token = localStorage.getItem("token");

  const payload = {
    type: "manufacturing",
    inputs: getInputs(),
    results: {
      revenue: latestData.revenue,
      profit: latestData.profit,
      margin: latestData.margin,
      roi: latestData.roi
    }
  };

  await fetch(`${API_BASE}/api/saved-deals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  alert("Deal saved");
}

/* ================= EVENTS ================= */
document.addEventListener("DOMContentLoaded", () => {

  document.querySelectorAll(".input-section input")
    .forEach(i => i.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(runManufacturing, 250);
    }));

  $("resetBtn")?.addEventListener("click", resetAll);
  $("saveDealBtn")?.addEventListener("click", saveDeal);

  runManufacturing();
});

})();
