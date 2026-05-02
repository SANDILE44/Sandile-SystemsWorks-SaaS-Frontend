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

const percent = (v) =>
  (Number(v) || 0).toFixed(2) + "%";

/* ================= API ================= */
async function api(url, method = "GET", body = null) {

  const token = localStorage.getItem("token");
  if (!token) return location.replace("login.html");

  try {
    const res = await fetch(`${API_BASE}${url}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: body ? JSON.stringify(body) : null
    });

    if (res.status === 401) {
      localStorage.removeItem("token");
      location.replace("login.html");
      return null;
    }

    if (!res.ok) return null;

    return await res.json();

  } catch (err) {
    console.error("API error:", err);
    return null;
  }
}

async function apiPost(url, body) {
  return await api(url, "POST", body);
}

/* ================= CLASS HELPER ================= */
function setClass(el, cls) {
  if (!el) return;
  el.className = `output-value ${cls || ""}`;
}

/* ================= MAIN CALC ================= */
async function runConsulting() {

  const data = await apiPost("/api/calculators/consulting/project", {
    hours: +$("consult-hours")?.value || 0,
    rate: +$("consult-rate")?.value || 0,
    expenses: +$("consult-expenses")?.value || 0,
    labor: +$("consult-labor")?.value || 0,
    fixed: +$("consult-fixed")?.value || 0,
    discountPct: +$("consult-discount")?.value || 0,
    otHours: +$("consult-overtime-hours")?.value || 0,
    otRate: +$("consult-overtime-rate")?.value || 0,
    variableCosts: +$("consult-variable-costs")?.value || 0,
    contingencyPct: +$("consult-contingency")?.value || 0
  });

  if (!data) return;

  latestData = data;

  /* ================= OUTPUTS ================= */
  $("consult-revenue").textContent = money(data.totalRevenue);
  $("consult-revenue-after-discount").textContent = money(data.revenueAfterDiscount);
  $("consult-overtime-output").textContent = money(data.overtimeRevenue);

  $("consult-contingency-output").textContent = money(data.contingencyAmount);
  $("consult-cost-hour").textContent = money(data.costPerHour);
  $("consult-costs").textContent = money(data.totalCosts);

  $("consult-profit").textContent = money(data.profit);
  $("consult-profit-hour").textContent = money(data.profitPerHour);
  $("consult-margin").textContent = percent(data.margin);
  $("consult-roi").textContent = percent(data.roi);

  $("consult-breakeven").textContent =
    (data.breakevenHours || 0).toFixed(2);

  /* ================= STATUS (FIXED) ================= */
  const status = $("status");
  const advice = $("decisionAdvice");

  status.textContent = data.decision || "—";
  advice.textContent = data.advice || "";

  status.className =
    data.riskLevel === "High" ? "loss"
    : data.riskLevel === "Medium" ? "neutral"
    : "profit";

  /* ================= COLORS ================= */
  setClass(
    $("consult-profit"),
    data.profit >= 0 ? "profit-positive" : "profit-negative"
  );

  setClass(
    $("consult-margin"),
    data.margin < 10 ? "profit-negative"
    : data.margin < 20 ? "margin-medium"
    : "margin-strong"
  );

  /* ================= STEPS ================= */
  renderSteps(data.steps);
}

/* ================= STEPS ================= */
function renderSteps(steps) {

  const container = $("consult-steps");
  if (!container || !steps) return;

  container.innerHTML = steps.map((s, i) => `
    <div class="step">
      <strong>Step ${i + 1}</strong>
      <div>${s}</div>
    </div>
  `).join("");
}

/* ================= RESET ================= */
function resetAll() {

  document.querySelectorAll(".input-section input")
    .forEach(i => i.value = "");

  latestData = null;

  [
    "consult-revenue","consult-revenue-after-discount",
    "consult-overtime-output","consult-contingency-output",
    "consult-cost-hour","consult-costs",
    "consult-profit","consult-profit-hour",
    "consult-margin","consult-roi",
    "consult-breakeven"
  ].forEach(id => {
    const el = $(id);
    if (el) {
      el.textContent = "—";
      el.className = "output-value";
    }
  });

  $("status").textContent = "—";
  $("status").className = "";
  $("decisionAdvice").textContent = "";
  $("consult-steps").innerHTML = "";
}

  /* ================= EXPORT CSV ================= */
function exportCSV() {
  if (!latestData) return alert("Run calculator first");

  const i = {
    hours: $("consult-hours").value,
    rate: $("consult-rate").value,
    expenses: $("consult-expenses").value,
    labor: $("consult-labor").value,
    fixed: $("consult-fixed").value,
    discount: $("consult-discount").value,
    otHours: $("consult-overtime-hours").value,
    otRate: $("consult-overtime-rate").value,
    variableCosts: $("consult-variable-costs").value,
    contingency: $("consult-contingency").value
  };

  const rows = [
    ["Field", "Value"],

    ["Hours", i.hours],
    ["Rate", i.rate],
    ["Expenses", i.expenses],
    ["Labor", i.labor],
    ["Fixed", i.fixed],
    ["Discount %", i.discount],
    ["Overtime Hours", i.otHours],
    ["Overtime Rate", i.otRate],
    ["Variable Costs", i.variableCosts],
    ["Contingency %", i.contingency],

    ["Total Revenue", latestData.totalRevenue],
    ["Revenue After Discount", latestData.revenueAfterDiscount],
    ["Profit", latestData.profit],
    ["Margin %", latestData.margin],
    ["ROI %", latestData.roi],
    ["Break-even Hours", latestData.breakevenHours]
  ];

  const csv = rows.map(r => r.join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "consulting-report.csv";
  a.click();

  URL.revokeObjectURL(url);
}

  /* ================= EXPORT REPORT ================= */
function exportReport() {
  if (!latestData) return alert("Run calculator first");

  const html = `
  <html>
  <head>
    <title>Consulting Report</title>
    <style>
      body { font-family: Arial; padding: 30px; }
      h1 { margin-bottom: 10px; }
      .box { border: 1px solid #ddd; padding: 10px; margin-top: 10px; }
    </style>
  </head>

  <body>

    <h1>Consulting Project Report</h1>
    <p>${new Date().toLocaleString()}</p>

    <div class="box">
      <strong>Revenue:</strong> ${latestData.totalRevenue}<br/>
      <strong>After Discount:</strong> ${latestData.revenueAfterDiscount}<br/>
      <strong>Profit:</strong> ${latestData.profit}<br/>
      <strong>Margin:</strong> ${latestData.margin}%<br/>
      <strong>ROI:</strong> ${latestData.roi}%<br/>
      <strong>Break-even Hours:</strong> ${latestData.breakevenHours}
    </div>

    <div class="box">
      <strong>Decision:</strong> ${latestData.decision}<br/>
      <strong>Advice:</strong> ${latestData.advice}
    </div>

  </body>
  </html>
  `;

  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
}

/* ================= SAVE / UPDATE ================= */
async function saveDeal() {

  if (!latestData) {
    alert("Run calculator first");
    return;
  }

  const editId = localStorage.getItem("editDealId");

  const payload = {
    type: "consulting",
    inputs: {
      hours: $("consult-hours").value,
      rate: $("consult-rate").value,
      expenses: $("consult-expenses").value,
      labor: $("consult-labor").value,
      fixed: $("consult-fixed").value,
      discount: $("consult-discount").value,
      otHours: $("consult-overtime-hours").value,
      otRate: $("consult-overtime-rate").value,
      variableCosts: $("consult-variable-costs").value,
      contingency: $("consult-contingency").value
    },
    results: {
      profit: latestData.profit,
      margin: latestData.margin,
      revenue: latestData.totalRevenue
    }
  };

  const url = editId
    ? `/api/saved-deals/${editId}`
    : "/api/saved-deals";

  const method = editId ? "PUT" : "POST";

  const res = await api(url, method, payload);

  if (res) {
    alert(editId ? "Deal updated" : "Deal saved");

    localStorage.removeItem("editDeal");
    localStorage.removeItem("editDealId");
  } else {
    alert("Failed to save deal");
  }
}

/* ================= EVENTS ================= */
function update() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(runConsulting, 300);
}

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {

  document.querySelectorAll(".input-section input")
    .forEach(i => i.addEventListener("input", update));

  $("resetBtn")?.addEventListener("click", resetAll);
  $("saveDealBtn")?.addEventListener("click", saveDeal);
  $("exportCsvBtn")?.addEventListener("click", exportCSV);
$("exportReportBtn")?.addEventListener("click", exportReport);

  const editDeal = JSON.parse(localStorage.getItem("editDeal"));

  if (editDeal && editDeal.type === "consulting") {

    $("consult-hours").value = editDeal.inputs?.hours || "";
    $("consult-rate").value = editDeal.inputs?.rate || "";
    $("consult-expenses").value = editDeal.inputs?.expenses || "";
    $("consult-labor").value = editDeal.inputs?.labor || "";
    $("consult-fixed").value = editDeal.inputs?.fixed || "";
    $("consult-discount").value = editDeal.inputs?.discount || "";
    $("consult-overtime-hours").value = editDeal.inputs?.otHours || "";
    $("consult-overtime-rate").value = editDeal.inputs?.otRate || "";
    $("consult-variable-costs").value = editDeal.inputs?.variableCosts || "";
    $("consult-contingency").value = editDeal.inputs?.contingency || "";

    const hasEdit = localStorage.getItem("editDeal");

if (hasEdit) {
  runConsulting();
}
  }

  runConsulting();
});

})();
