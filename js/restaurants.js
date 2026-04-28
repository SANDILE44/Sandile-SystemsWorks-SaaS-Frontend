(() => {

const $ = id => document.getElementById(id);

let latestData = null; // 🔥 holds latest calculator result

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

  latestData = data; // 🔥 SAVE FOR BUTTON

  /* ================= UI ================= */
  $("dailyCovers").textContent = data.dailyCovers ?? 0;
  $("revenue").textContent = money(data.monthlyRevenue);

  $("foodCost").textContent = money(data.foodCost);
  $("totalCosts").textContent = money(data.totalCosts);

  const ratioEl = $("ratio");
  ratioEl.textContent = percent(data.costRatio ?? 0);

  setClass(
    ratioEl,
    data.costRatio > 80 ? "profit-negative"
    : data.costRatio > 60 ? "margin-medium"
    : "profit-positive"
  );

  const profitEl = $("profit");
  profitEl.textContent = money(data.profit);
  setClass(profitEl, data.profit >= 0 ? "profit-positive" : "profit-negative");

  const marginEl = $("margin");
  marginEl.textContent = percent(data.margin);

  setClass(
    marginEl,
    data.margin < 10 ? "profit-negative"
    : data.margin < 20 ? "margin-medium"
    : "margin-strong"
  );

  $("profitCover").textContent = money(data.profitPerCover);
  $("monthly").textContent = money(data.monthlyProfit);
  $("annual").textContent = money(data.annualProfit);
  $("breakeven").textContent = data.breakevenCovers ?? 0;

  /* ================= DECISION ================= */
  $("status").textContent = data.decision || "—";
  $("decisionAdvice").textContent = data.advice || "—";

  $("status").className =
    data.riskLevel === "High" ? "loss"
    : data.riskLevel === "Medium" ? "neutral"
    : "profit";

  /* ================= INSIGHTS ================= */
  const stepsContainer = $("stepsContainer");

  if (stepsContainer && data.insights) {

    const sectionTitles = {
      summary: "📊 Summary",
      profitability: "💰 Profitability",
      costs: "📉 Costs",
      operations: "⚙ Operations",
      growth: "🚀 Growth"
    };

    stepsContainer.innerHTML = Object.entries(data.insights)
      .map(([key, items]) => `
        <div class="insight-group">
          <div class="insight-header"
               onclick="this.nextElementSibling.classList.toggle('open')">
            ${sectionTitles[key] || key}
          </div>

          <div class="insight-body">
            ${items.map(i => `
              <div class="step">
                <strong>${i.title}</strong>
                <div>${i.message}</div>
              </div>
            `).join("")}
          </div>
        </div>
      `).join("");
  }
}

/* ================= SAVE DEAL BUTTON ================= */
$("saveDealBtn")?.addEventListener("click", async () => {

  if (!latestData) {
    alert("Run calculator first before saving");
    return;
  }

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

  const res = await apiPost("/api/saved-deals", payload);

  if (res) {
    alert("Deal saved successfully");
  } else {
    alert("Failed to save deal");
  }
});

/* ================= EVENTS ================= */
document
  .querySelectorAll(".input-section input")
  .forEach(i => i.addEventListener("input", update));

/* ================= RESET ================= */
$("resetBtn")?.addEventListener("click", () => {

  document
    .querySelectorAll(".input-section input")
    .forEach(i => i.value = "");

  latestData = null;

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

  $("status").textContent = "—";
  $("status").className = "";
  $("decisionAdvice").textContent = "";
  $("stepsContainer").innerHTML = "";
});

/* ================= INIT ================= */
runRestaurant();

})();