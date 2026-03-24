(() => {

/* ===============================
HELPERS
=============================== */

const $ = (id) => document.getElementById(id);

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

let debounceTimer;


/* ===============================
API HELPER
=============================== */

async function apiPost(url, body) {

  const token = localStorage.getItem("token");

  if (!token) {
    location.replace("login.html");
    return null;
  }

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
DEBOUNCE RUNNER
=============================== */

function update() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(runRestaurant, 300);
}


/* ===============================
MAIN CALCULATION
=============================== */

async function runRestaurant() {

  const data = await apiPost("/api/calculators/restaurant/operations", {
    tables:        +$("tables")?.value      || 0,
    coversPerTable:+$("covers")?.value      || 0,
    avgCheck:      +$("check")?.value       || 0,
    foodPct:       +$("foodPercent")?.value || 0,
    labor:         +$("labor")?.value       || 0,
    fixed:         +$("fixed")?.value       || 0,
    days:          +$("days")?.value        || 0
  });

  if (!data) return;


  /* ===============================
  REVENUE
  =============================== */

  $("dailyCovers").textContent = data.dailyCovers ?? 0;

  $("revenue").textContent = money(data.monthlyRevenue);


  /* ===============================
  COSTS
  =============================== */

  $("foodCost").textContent  = money(data.foodCost);
  $("totalCosts").textContent = money(data.totalCosts);

  const ratioEl = $("ratio");
  ratioEl.textContent = percent(data.costRatio);

  if (data.costRatio > 80)
    setClass(ratioEl, "profit-negative");
  else if (data.costRatio > 60)
    setClass(ratioEl, "margin-medium");
  else
    setClass(ratioEl, "profit-positive");


  /* ===============================
  PROFIT
  =============================== */

  const profitEl = $("profit");
  profitEl.textContent = money(data.profit);

  if (data.profit >= 0)
    setClass(profitEl, "profit-positive");
  else
    setClass(profitEl, "profit-negative");


  const marginEl = $("margin");
  marginEl.textContent = percent(data.margin);

  if (data.margin < 10)
    setClass(marginEl, "profit-negative");
  else if (data.margin < 20)
    setClass(marginEl, "margin-medium");
  else
    setClass(marginEl, "margin-strong");


  const coverEl = $("profitCover");
  coverEl.textContent = money(data.profitPerCover);

  if (data.profitPerCover < 0)
    setClass(coverEl, "profit-negative");
  else if (data.profitPerCover < 10)
    setClass(coverEl, "margin-medium");
  else
    setClass(coverEl, "profit-positive");


  $("monthly").textContent = money(data.monthlyProfit);
  $("annual").textContent  = money(data.annualProfit);


  /* ===============================
  BREAKEVEN
  =============================== */

  $("breakeven").textContent = data.breakevenCovers ?? 0;


  /* ===============================
  DECISION ENGINE
  =============================== */

  const statusEl = $("status");
  const adviceEl = $("decisionAdvice");

  if (data.profit <= 0) {

    statusEl.textContent = "❌ Restaurant Losing Money";
    statusEl.className = "loss";

    if (adviceEl)
      adviceEl.textContent = data.advice ||
        "Costs are higher than revenue. Increase pricing or reduce food and labor costs.";

  } else if (data.margin < 10) {

    statusEl.textContent = "⚠ Dangerous Margin";
    statusEl.className = "loss";

    if (adviceEl)
      adviceEl.textContent = data.advice ||
        "Profit margin is too small. Any cost increase could cause losses.";

  } else if (data.margin < 20) {

    statusEl.textContent = "🟡 Moderate Profitability";
    statusEl.className = "neutral";

    if (adviceEl)
      adviceEl.textContent = data.advice ||
        "Restaurant is profitable but margin can improve.";

  } else {

    statusEl.textContent = "🟢 Strong Restaurant Profitability";
    statusEl.className = "profit";

    if (adviceEl)
      adviceEl.textContent = data.advice ||
        "Healthy restaurant margins. Scaling could significantly increase profits.";

  }

}


/* ===============================
EVENT BINDING
=============================== */

document
  .querySelectorAll(".input-section input")
  .forEach(i => i.addEventListener("input", update));


/* ===============================
RESET
=============================== */

$("resetBtn")?.addEventListener("click", () => {

  document
    .querySelectorAll(".input-section input")
    .forEach(i => i.value = "");

  const ids = [
    "dailyCovers","revenue","foodCost","totalCosts",
    "ratio","profit","margin","profitCover",
    "monthly","annual","breakeven"
  ];

  ids.forEach(id => {
    const el = $(id);
    if (el) {
      el.textContent = "—";
      el.className = "output-value";
    }
  });

  const statusEl = $("status");
  if (statusEl) {
    statusEl.textContent = "—";
    statusEl.className = "";
  }

  const adviceEl = $("decisionAdvice");
  if (adviceEl) adviceEl.textContent = "";

});

})();
