(() => {
  const $ = id => document.getElementById(id);

  // Format numbers
  const money = v => (Number(v) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const percent = v => {
    const n = Number(v) || 0;
    const val = Math.abs(n) <= 1 ? n * 100 : n;
    return val.toFixed(2) + "%";
  };

  let debounceTimer;

  // Generate advice based on numbers
  function generateSteps(data) {
    const steps = [];

    // Step 1: Revenue check
    if (data.monthlyRevenue < data.totalCosts) {
      steps.push({
        step: "Revenue Check",
        message: `Revenue (R${money(data.monthlyRevenue)}) is less than costs (R${money(data.totalCosts)}). Consider increasing prices or attracting more customers.`
      });
    } else {
      steps.push({
        step: "Revenue Check",
        message: `Revenue covers costs. Keep monitoring daily sales.`
      });
    }

    // Step 2: Food Cost
    if (data.foodPct > 35) {
      steps.push({
        step: "Food Cost Control",
        message: `Food cost is high (${data.foodPct}%). Try renegotiating supplier prices or reducing waste.`
      });
    } else {
      steps.push({
        step: "Food Cost Control",
        message: `Food cost is healthy.`
      });
    }

    // Step 3: Profit Margin
    if (data.margin < 10) {
      steps.push({
        step: "Margin Alert",
        message: `Profit margin is very low (${percent(data.margin)}). Watch labor and fixed costs.`
      });
    } else if (data.margin < 20) {
      steps.push({
        step: "Margin Check",
        message: `Profit margin is moderate (${percent(data.margin)}). Consider improving efficiency.`
      });
    } else {
      steps.push({
        step: "Margin Check",
        message: `Profit margin is strong (${percent(data.margin)}). Good job!`
      });
    }

    // Step 4: Breakeven
    steps.push({
      step: "Breakeven Point",
      message: `You need at least ${data.breakevenCovers} customers per day to break even.`
    });

    return steps;
  }

  function update() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runRestaurant, 300);
  }

  function runRestaurant() {
    const tables = +$("tables")?.value || 0;
    const coversPerTable = +$("covers")?.value || 0;
    const avgCheck = +$("check")?.value || 0;
    const foodPct = +$("foodPercent")?.value || 0;
    const labor = +$("labor")?.value || 0;
    const fixed = +$("fixed")?.value || 0;
    const days = +$("days")?.value || 0;

    // Simple calculations
    const dailyCovers = tables * coversPerTable;
    const monthlyRevenue = dailyCovers * avgCheck * days;
    const foodCost = (foodPct / 100) * monthlyRevenue;
    const totalCosts = foodCost + labor + fixed;
    const profit = monthlyRevenue - totalCosts;
    const margin = monthlyRevenue ? profit / monthlyRevenue : 0;
    const profitPerCover = dailyCovers ? profit / dailyCovers : 0;
    const monthlyProfit = profit;
    const annualProfit = profit * 12;
    const breakevenCovers = avgCheck ? Math.ceil(totalCosts / (avgCheck * days)) : 0;

    const data = { dailyCovers, monthlyRevenue, foodCost, totalCosts, profit, margin, profitPerCover, monthlyProfit, annualProfit, breakevenCovers, foodPct };

    // Display outputs
    $("dailyCovers").textContent = dailyCovers;
    $("revenue").textContent = `R${money(monthlyRevenue)}`;
    $("foodCost").textContent = `R${money(foodCost)}`;
    $("totalCosts").textContent = `R${money(totalCosts)}`;
    $("ratio").textContent = percent(totalCosts / monthlyRevenue);
    $("profit").textContent = `R${money(profit)}`;
    $("margin").textContent = percent(margin);
    $("profitCover").textContent = `R${money(profitPerCover)}`;
    $("monthly").textContent = `R${money(monthlyProfit)}`;
    $("annual").textContent = `R${money(annualProfit)}`;
    $("breakeven").textContent = breakevenCovers;

    // Decision
    const statusEl = $("status");
    const adviceEl = $("decisionAdvice");
    if (profit <= 0) {
      statusEl.textContent = "❌ Restaurant Losing Money";
      statusEl.className = "loss";
      adviceEl.textContent = "Costs higher than revenue.";
    } else if (margin < 10) {
      statusEl.textContent = "⚠ Dangerous Margin";
      statusEl.className = "loss";
      adviceEl.textContent = "Margin too small. Watch costs.";
    } else if (margin < 20) {
      statusEl.textContent = "🟡 Moderate Profitability";
      statusEl.className = "neutral";
      adviceEl.textContent = "Profitable but margin can improve.";
    } else {
      statusEl.textContent = "🟢 Strong Profitability";
      statusEl.className = "profit";
      adviceEl.textContent = "Healthy margins. Scale if possible.";
    }

    // Steps
    const stepsContainer = $("stepsContainer");
    if (stepsContainer) {
      const steps = generateSteps(data);
      stepsContainer.innerHTML = steps.map(s => `<div class="step"><strong>${s.step}:</strong> ${s.message}</div>`).join('');
    }
  }

  // Event binding
  document.querySelectorAll(".input-section input").forEach(i => i.addEventListener("input", update));
  $("resetBtn")?.addEventListener("click", () => {
    document.querySelectorAll(".input-section input").forEach(i => i.value = "");
    const ids = ["dailyCovers","revenue","foodCost","totalCosts","ratio","profit","margin","profitCover","monthly","annual","breakeven"];
    ids.forEach(id => { const el = $(id); if(el){ el.textContent="—"; el.className="output-value"; }});
    $("status") && ($("status").textContent="—", $("status").className="");
    $("decisionAdvice") && ($("decisionAdvice").textContent="");
    $("stepsContainer") && ($("stepsContainer").innerHTML="");
  });
})();