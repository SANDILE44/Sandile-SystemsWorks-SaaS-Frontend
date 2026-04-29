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
  const n = Number(v) || 0;
  const val = Math.abs(n) <= 1 ? n * 100 : n;
  return val.toFixed(2) + "%";
};

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

/* ================= CALCULATOR API ================= */
async function apiPost(url, body) {
  return await api(url, "POST", body);
}

/* ================= CLASS HELPERS ================= */
function setClass(el, cls) {
  if (!el) return;
  el.className = `output-value ${cls || ""}`;
}

/* ================= MAIN CALC ================= */
async function runRestaurant() {

  const data = await apiPost("/api/calculators/restaurant/operations", {
    tables: +$("tables")?.value || 0,
    coversPerTable: +$("covers")?.value || 0,
    avgCheck: +$("check")?.value || 0,
    foodPct: +$("foodPercent")?.value || 0,
    labor: +$("labor")?.value || 0,
    fixed: +$("fixed")?.value || 0,
    days: +$("days")?.value || 0
  });

  if (!data) return;

  latestData = data;

  $("dailyCovers").textContent = data.dailyCovers ?? 0;
  $("revenue").textContent = money(data.monthlyRevenue);
  $("foodCost").textContent = money(data.foodCost);
  $("totalCosts").textContent = money(data.totalCosts);
  $("profit").textContent = money(data.profit);
  $("margin").textContent = percent(data.margin);
  $("breakeven").textContent = data.breakevenCovers ?? 0;
  $("profitCover").textContent = money(data.profitPerCover);
  $("monthly").textContent = money(data.monthlyProfit);
  $("annual").textContent = money(data.annualProfit);
  $("ratio").textContent = percent(data.costRatio);

  const status = $("status");
  const advice = $("decisionAdvice");

  status.textContent = data.decision || "—";
  advice.textContent = data.advice || "";

  status.className =
    data.riskLevel === "High" ? "loss"
    : data.riskLevel === "Medium" ? "neutral"
    : "profit";

  setClass(
    $("profit"),
    data.profit >= 0 ? "profit-positive" : "profit-negative"
  );

  setClass(
    $("margin"),
    data.margin < 10 ? "profit-negative"
    : data.margin < 20 ? "margin-medium"
    : "margin-strong"
  );

  renderInsights(data.insights);
}

/* ================= INSIGHTS ================= */
function renderInsights(insights) {

  const container = $("stepsContainer");
  if (!container || !insights) return;

  const titles = {
    summary: "📊 Summary",
    profitability: "💰 Profitability",
    costs: "📉 Costs",
    operations: "⚙ Operations",
    growth: "🚀 Growth"
  };

  container.innerHTML = Object.entries(insights)
    .map(([key, items]) => {

      const content = items.map(i => `
        <div class="step">
          <strong>${i.title}</strong>
          <div>${i.message}</div>
        </div>
      `).join("");

      return `
        <div class="insight-group">
          <details>
            <summary>${titles[key] || key}</summary>
            <div style="margin-top:10px;">
              ${content}
            </div>
          </details>
        </div>
      `;
    })
    .join("");
}

/* ================= RESET ================= */
function resetAll() {

  document.querySelectorAll(".input-section input")
    .forEach(i => i.value = "");

  latestData = null;

  [
    "dailyCovers","revenue","foodCost","totalCosts",
    "ratio","profit","margin","profitCover",
    "monthly","annual","breakeven"
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
  $("stepsContainer").innerHTML = "";
}

/* ================= SAVE / UPDATE DEAL ================= */
async function saveDeal() {

  if (!latestData) {
    alert("Run calculator first before saving");
    return;
  }

  const editId = localStorage.getItem("editDealId");

  const payload = {
    type: "restaurant",
    inputs: {
      tables: $("tables").value,
      covers: $("covers").value,
      check: $("check").value,
      foodPercent: $("foodPercent").value,
      labor: $("labor").value,
      fixed: $("fixed").value,
      days: $("days").value
    },
    results: {
      profit: latestData.profit,
      margin: latestData.margin,
      monthlyRevenue: latestData.monthlyRevenue
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

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {

  document.querySelectorAll(".input-section input")
    .forEach(i => i.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(runRestaurant, 300);
    }));

  $("resetBtn")?.addEventListener("click", resetAll);
  $("saveDealBtn")?.addEventListener("click", saveDeal);

  /* ================= LOAD EDIT MODE ================= */
  const editDeal = JSON.parse(localStorage.getItem("editDeal"));

  if (editDeal) {
    $("tables").value = editDeal.inputs?.tables || "";
    $("covers").value = editDeal.inputs?.covers || "";
    $("check").value = editDeal.inputs?.check || "";
    $("foodPercent").value = editDeal.inputs?.foodPercent || "";
    $("labor").value = editDeal.inputs?.labor || "";
    $("fixed").value = editDeal.inputs?.fixed || "";
    $("days").value = editDeal.inputs?.days || "";

    runRestaurant();
  }

  runRestaurant();
});

})();
