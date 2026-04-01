(() => {

const $ = id => document.getElementById(id);

const money = v =>
  (Number(v) || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

const percent = v => {
  const n = Number(v) || 0;
  const val = Math.abs(n) <= 1 ? n * 100 : n;
  return val.toFixed(2) + "%";
};

let debounceTimer;

/* ================= API ================= */
async function apiPost(url, body) {
  const token = localStorage.getItem("token");
  if (!token) return location.replace("login.html");

  try {
    const res = await fetch(`${API_BASE}${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    if (res.status === 401) {
      localStorage.removeItem("token");
      return location.replace("login.html");
    }

    if (res.status === 403)
      return location.replace("payment.html");

    if (!res.ok) return null;

    return await res.json();

  } catch (err) {
    console.error("API error", err);
    return null;
  }
}

/* ================= CLASS HELPER ================= */
function setClass(el, cls) {
  if (!el) return;
  el.className = `output-value ${cls || ""}`;
}

/* ================= UPDATE ================= */
function update() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(runRestaurant, 300);
}

/* ================= MAIN ================= */
async function runRestaurant() {

  const data = await apiPost("/api/calculators/restaurant/operations", {
    tables:        +$("tables")?.value || 0,
    coversPerTable:+$("covers")?.value || 0,
    avgCheck:      +$("check")?.value || 0,
    foodPct:       +$("foodPercent")?.value || 0,
    labor:         +$("labor")?.value || 0,
    fixed:         +$("fixed")?.value || 0,
    days:          +$("days")?.value || 0
  });

  if (!data) return;

  /* ================= REVENUE ================= */
  $("dailyCovers").textContent = data.dailyCovers ?? 0;
  $("revenue").textContent = money(data.monthlyRevenue);

  /* ================= COSTS ================= */
  $("foodCost").textContent = money(data.foodCost);
  $("totalCosts").textContent = money(data.totalCosts);

  const ratioEl = $("ratio");
  ratioEl.textContent = percent(data.costRatio ?? 0);

  if (data.costRatio > 80) setClass(ratioEl, "profit-negative");
  else if (data.costRatio > 60) setClass(ratioEl, "margin-medium");
  else setClass(ratioEl, "profit-positive");

  /* ================= PROFIT ================= */
  const profitEl = $("profit");
  profitEl.textContent = money(data.profit);
  setClass(profitEl, data.profit >= 0 ? "profit-positive" : "profit-negative");

  const marginEl = $("margin");
  marginEl.textContent = percent(data.margin);

  if (data.margin < 10) setClass(marginEl, "profit-negative");
  else if (data.margin < 20) setClass(marginEl, "margin-medium");
  else setClass(marginEl, "margin-strong");

  const coverEl = $("profitCover");
  coverEl.textContent = money(data.profitPerCover);

  if (data.profitPerCover < 0) setClass(coverEl, "profit-negative");
  else if (data.profitPerCover < 10) setClass(coverEl, "margin-medium");
  else setClass(coverEl, "profit-positive");

  $("monthly").textContent = money(data.monthlyProfit);
  $("annual").textContent  = money(data.annualProfit);

  /* ================= BREAKEVEN ================= */
  $("breakeven").textContent = data.breakevenCovers ?? 0;

  /* ================= DECISION ================= */
  const statusEl = $("status");
  const adviceEl = $("decisionAdvice");

  if (data.profit <= 0) {
    statusEl.textContent = "❌ Restaurant Losing Money";
    statusEl.className = "loss";
    adviceEl.textContent = data.advice || "Costs higher than revenue.";

  } else if (data.margin < 10) {
    statusEl.textContent = "⚠ Dangerous Margin";
    statusEl.className = "loss";
    adviceEl.textContent = data.advice || "Margin too small.";

  } else if (data.margin < 20) {
    statusEl.textContent = "🟡 Moderate Profitability";
    statusEl.className = "neutral";
    adviceEl.textContent = data.advice || "Profitable but can improve.";

  } else {
    statusEl.textContent = "🟢 Strong Profitability";
    statusEl.className = "profit";
    adviceEl.textContent = data.advice || "Healthy margins.";
  }

  /* ================= STEPS ================= */
  const stepsContainer = $("stepsContainer");

  if (stepsContainer && Array.isArray(data.steps)) {
    stepsContainer.innerHTML = data.steps.map(s => `
      <div class="step">
        <strong>${s.step}:</strong>
        <div>${s.message}</div>
      </div>
    `).join("");
  }
}

/* ================= EVENTS ================= */
document
  .querySelectorAll(".input-section input")
  .forEach(i => i.addEventListener("input", update));

/* ================= RESET ================= */
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

  if ($("status")) {
    $("status").textContent = "—";
    $("status").className = "";
  }

  if ($("decisionAdvice"))
    $("decisionAdvice").textContent = "";

  if ($("stepsContainer"))
    $("stepsContainer").innerHTML = "";

});

})();