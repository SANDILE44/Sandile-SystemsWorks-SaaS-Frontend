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
  return isFinite(n) ? n.toFixed(2) + "%" : "0.00%";
};

/* ================= SAFE DIVISION ================= */
const safeDivide = (a, b) => (!b || !isFinite(a / b)) ? 0 : a / b;

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

  const i = getInputs();

  if (i.units <= 0 || i.price <= 0) {
    renderEmpty();
    return;
  }

  const revenue = i.units * i.price;
  const materialTotal = i.units * i.material;

  const totalCosts = materialTotal + i.labor + i.fixed + i.operational;
  const profit = revenue - totalCosts;

  const margin = safeDivide(profit, revenue) * 100;
  const roi = safeDivide(profit, totalCosts) * 100;

  const costPerUnit = safeDivide(totalCosts, i.units);
  const profitPerUnit = safeDivide(profit, i.units);

  const breakEvenUnits =
    (i.price - i.material) > 0
      ? Math.ceil((i.labor + i.fixed + i.operational) / (i.price - i.material))
      : 0;

  let status = "PROFIT";
  let action = "Healthy operation.";

  if (profit <= 0) {
    status = "LOSS";
    action = "Costs exceed revenue — adjust pricing or costs.";
  } else if (margin < 10) {
    status = "RISK";
    action = "Low margin — high risk operation.";
  } else if (margin < 20) {
    status = "NEUTRAL";
    action = "Moderate performance — optimize.";
  }

  latestData = {
    revenue,
    totalCosts,
    profit,
    margin,
    roi,
    costPerUnit,
    profitPerUnit,
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

  /* ================= CLEAN CLASS SYSTEM ================= */
  status.classList.remove("profit", "loss", "neutral");

  if (d.status === "PROFIT") status.classList.add("profit");
  else if (d.status === "LOSS") status.classList.add("loss");
  else status.classList.add("neutral");
}

/* ================= EMPTY ================= */
function renderEmpty() {
  ["revenue","totalCosts","profit","costPerUnit","profitPerUnit","margin","roi","breakeven"]
    .forEach(id => $(id) && ($(id).textContent = "—"));

  $("status").textContent = "—";
  $("decisionAdvice").textContent = "";
}

/* ================= RESET ================= */
function resetAll() {
  document.querySelectorAll(".input-section input").forEach(i => i.value = "");
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

/* ================= EDIT HYDRATION (FIXED) ================= */
function hydrateEdit() {

  const edit = localStorage.getItem("editDeal");
  if (!edit) return;

  try {
    const d = JSON.parse(edit);
    const i = d.inputs || {};

    $("mfg-units").value = i.units || 0;
    $("mfg-price").value = i.price || 0;
    $("mfg-material").value = i.material || 0;
    $("mfg-labor").value = i.labor || 0;
    $("mfg-fixed").value = i.fixed || 0;
    $("mfg-operational").value = i.operational || 0;

    localStorage.removeItem("editDeal");

    setTimeout(runManufacturing, 100);

  } catch (e) {
    console.error("Edit load failed:", e);
  }
}

  /* ================= EXPORT CSV ================= */
function exportManufacturingCSV() {

  if (!latestData) {
    alert("Run calculation first");
    return;
  }

  const i = getInputs();
  const d = latestData;

  const rows = [
    ["Field", "Value"],

    ["Units", i.units],
    ["Price", i.price],
    ["Material Cost", i.material],
    ["Labor", i.labor],
    ["Fixed", i.fixed],
    ["Operational", i.operational],

    ["Revenue", d.revenue],
    ["Total Costs", d.totalCosts],
    ["Profit", d.profit],
    ["Margin %", d.margin],
    ["ROI %", d.roi],
    ["Break-even Units", d.breakEvenUnits],

    ["Status", d.status],
    ["Action", d.action]
  ];

  const csv = rows.map(r => r.join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "manufacturing-report.csv";
  a.click();

  URL.revokeObjectURL(url);
}

    /* ================= EXPORT Report ================= */
  function exportManufacturingReport() {

  if (!latestData) {
    alert("Run calculation first");
    return;
  }

  const i = getInputs();
  const d = latestData;

  const html = `
  <html>
  <head>
    <title>Manufacturing Report</title>
    <style>
      body { font-family: Arial; padding: 30px; }
      .box { border: 1px solid #ddd; padding: 10px; margin-top: 10px; }
    </style>
  </head>
  <body>

    <h1>Manufacturing Report</h1>
    <div>${new Date().toLocaleString()}</div>

    <div class="box">
      <h3>Inputs</h3>
      <div>Units: ${i.units}</div>
      <div>Price: ${i.price}</div>
      <div>Material: ${i.material}</div>
    </div>

    <div class="box">
      <h3>Results</h3>
      <div>Revenue: ${d.revenue}</div>
      <div>Profit: ${d.profit}</div>
      <div>Margin: ${d.margin}%</div>
      <div>ROI: ${d.roi}%</div>
      <div>Status: ${d.status}</div>
    </div>

  </body>
  </html>
  `;

  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
}
/* ================= EVENTS ================= */
document.addEventListener("DOMContentLoaded", () => {

  document.querySelectorAll(".input-section input").forEach(i => {
    i.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(runManufacturing, 250);
    });
  });

  $("resetBtn")?.addEventListener("click", resetAll);
  $("saveDealBtn")?.addEventListener("click", saveDeal);
  $("exportCsvBtn")?.addEventListener("click", exportManufacturingCSV);
$("exportReportBtn")?.addEventListener("click", exportManufacturingReport);

  hydrateEdit();   // ⭐ THIS FIXES YOUR ISSUE

  runManufacturing();
});

})();
