// restaurants.js

// --- HELPER FUNCTIONS ---
function money(value) {
  return "R" + Number(value).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function percent(value) {
  return Number(value).toFixed(2) + "%";
}

function applyStatusColor(element, status) {
  element.classList.remove("profit", "loss", "neutral");
  if (status === "profit") element.classList.add("profit");
  else if (status === "loss") element.classList.add("loss");
  else element.classList.add("neutral");
}

// --- DOM ELEMENTS ---
const tablesInput = document.getElementById("tables");
const coversInput = document.getElementById("covers");
const checkInput = document.getElementById("check");
const foodPercentInput = document.getElementById("foodPercent");
const laborInput = document.getElementById("labor");
const fixedInput = document.getElementById("fixed");
const daysInput = document.getElementById("days");

const dailyCoversOutput = document.getElementById("dailyCovers");
const revenueOutput = document.getElementById("revenue");
const foodCostOutput = document.getElementById("foodCost");
const totalCostsOutput = document.getElementById("totalCosts");
const profitOutput = document.getElementById("profit");
const marginOutput = document.getElementById("margin");
const ratioOutput = document.getElementById("ratio");
const profitCoverOutput = document.getElementById("profitCover");
const breakevenOutput = document.getElementById("breakeven");
const monthlyOutput = document.getElementById("monthly");
const annualOutput = document.getElementById("annual");

const statusOutput = document.getElementById("status");
const decisionAdviceOutput = document.getElementById("decisionAdvice");

const resetBtn = document.getElementById("resetBtn");

// --- CALCULATION FUNCTION ---
function calculate() {
  const tables = Number(tablesInput.value) || 0;
  const covers = Number(coversInput.value) || 0;
  const check = Number(checkInput.value) || 0;
  const foodPercent = Number(foodPercentInput.value) || 0;
  const labor = Number(laborInput.value) || 0;
  const fixed = Number(fixedInput.value) || 0;
  const days = Number(daysInput.value) || 0;

  // --- Revenue ---
  const dailyCovers = tables * covers;
  const monthlyRevenue = dailyCovers * check * days;

  // --- Costs ---
  const foodCost = (foodPercent / 100) * monthlyRevenue;
  const totalCosts = foodCost + labor + fixed;
  const costRatio = monthlyRevenue ? (totalCosts / monthlyRevenue) * 100 : 0;

  // --- Profit ---
  const profit = monthlyRevenue - totalCosts;
  const profitMargin = monthlyRevenue ? (profit / monthlyRevenue) * 100 : 0;
  const profitPerCover = dailyCovers ? profit / (dailyCovers * days) : 0;

  // --- Break-even ---
  const breakevenCovers = check ? totalCosts / (check * days) : 0;

  // --- Monthly & Annual ---
  const monthlyProfit = profit;
  const annualProfit = monthlyProfit * 12;

  // --- Update DOM ---
  dailyCoversOutput.textContent = dailyCovers;
  revenueOutput.textContent = money(monthlyRevenue);
  foodCostOutput.textContent = money(foodCost);
  totalCostsOutput.textContent = money(totalCosts);
  profitOutput.textContent = money(profit);
  marginOutput.textContent = percent(profitMargin);
  ratioOutput.textContent = percent(costRatio);
  profitCoverOutput.textContent = money(profitPerCover);
  breakevenOutput.textContent = Math.ceil(breakevenCovers);
  monthlyOutput.textContent = money(monthlyProfit);
  annualOutput.textContent = money(annualProfit);

  // --- Decision logic ---
  let status = "neutral";
  let advice = "Review your costs and pricing.";
  if (profit > 0) {
    status = "profit";
    advice = "Your restaurant is profitable! Consider growth or investment.";
  } else if (profit < 0) {
    status = "loss";
    advice = "You are operating at a loss. Reduce costs or increase revenue.";
  }
  statusOutput.textContent = status === "neutral" ? "Break-even" : status === "profit" ? "Profit" : "Loss";
  applyStatusColor(statusOutput, status);
  decisionAdviceOutput.textContent = advice;
}

// --- EVENT LISTENERS ---
[tablesInput, coversInput, checkInput, foodPercentInput, laborInput, fixedInput, daysInput].forEach(input => {
  input.addEventListener("input", calculate);
});

// --- RESET BUTTON ---
resetBtn.addEventListener("click", () => {
  [tablesInput, coversInput, checkInput, foodPercentInput, laborInput, fixedInput, daysInput].forEach(i => i.value = "");
  calculate();
});

// --- INITIAL CALCULATION ---
calculate();