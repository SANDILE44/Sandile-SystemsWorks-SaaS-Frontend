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
  if (!isFinite(v)) return "0.00%";
  return (Number(v) || 0).toFixed(2) + "%";
};

/* ================= SAFE DIVISION ================= */
function safeDivide(a, b) {
  if (!b || !isFinite(a) || !isFinite(b)) return 0;
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

/* ================= MAIN ENGINE ================= */
function runManufacturing() {

  const {
    units,
    price,
    material,
    labor,
    fixed,
    operational
  } = getInputs();

  /* ===== REVENUE ===== */
  const revenue = units * price;

  /* ===== COSTS ===== */
  const materialTotal = units * material;

  // Treat these as TOTAL for production period (NOT per unit)
  const totalCosts =
    materialTotal +
    labor +
    fixed +
    operational;

  /* ===== PROFIT ===== */
  const profit = revenue - totalCosts;

  /* ===== UNIT ECONOMICS ===== */
  const costPerUnit = safeDivide(totalCosts, units);
  const profitPerUnit = safeDivide(profit, units);

  /* ===== PERFORMANCE ===== */
  const margin = safeDivide(profit, revenue) * 100;
  const roi = safeDivide(profit, totalCosts) * 100;

  /* ===== BREAK EVEN ===== */
  const breakEvenUnits = price > material
    ? Math.ceil((labor + fixed + operational) / (price - material))
    : 0;

  /* ===== DECISION ===== */
  let status = "PROFIT";
  let action = "Production is profitable.";

  if (profit <= 0) {
    status = "LOSS";
    action = "Increase price or reduce production costs immediately.";
  } else if (margin < 10) {
    status = "RISK";
    action = "Margins are weak. Improve efficiency.";
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

  /* ================= RENDER ================= */
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

/* ================= RESET ================= */
function resetAll() {
  document.querySelectorAll(".input-section input")
    .forEach(i => i.value = "");

  latestData = null;

  [
    "revenue","totalCosts","profit",
    "costPerUnit","profitPerUnit",
    "margin","roi","breakeven"
  ].forEach(id => {
    const el = $(id);
    if (el) el.textContent = "—";
  });

  $("status").textContent = "—";
  $("decisionAdvice").textContent = "";
}

/* ================= SAVE ================= */
async function saveDeal() {

  if (!latestData) return alert("Run first");

  const payload = {
    type: "manufacturing",
    inputs: getInputs(),
    results: {
      profit: latestData.profit,
      margin: latestData.margin,
      revenue: latestData.revenue
    }
  };

  const token = localStorage.getItem("token");

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
      debounceTimer = setTimeout(runManufacturing, 300);
    }));

  $("resetBtn")?.addEventListener("click", resetAll);
  $("saveDealBtn")?.addEventListener("click", saveDeal);

  runManufacturing();
});

})();
