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

    runConsulting();
  }

  runConsulting();
});

})();
