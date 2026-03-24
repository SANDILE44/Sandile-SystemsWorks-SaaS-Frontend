(() => {

const $ = (id) => document.getElementById(id);

const money = (v) =>
(Number(v) || 0).toLocaleString(undefined,{
minimumFractionDigits:2,
maximumFractionDigits:2
});

const percent = (v) =>
(Number(v) || 0).toFixed(2) + "%";

const API_BASE = "https://sandile-systemsworks-saas-backend-2.onrender.com";

let timer;


/* =========================
DEBOUNCE
========================= */

function update(){
clearTimeout(timer);
timer = setTimeout(run,300);
}


/* =========================
COLOR HELPER
========================= */

function applyColor(el,type){
if(!el) return;
el.classList.remove("positive","negative","caution");
if(type) el.classList.add(type);
}


/* =========================
MAIN CALCULATION
========================= */

async function run(){

const token = localStorage.getItem("token");
if(!token) return location.replace("login.html");

const res = await fetch(
`${API_BASE}/api/calculators/restaurant/operations`,
{
method:"POST",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
},
body:JSON.stringify({

tables:+$("tables")?.value || 0,
coversPerTable:+$("covers")?.value || 0,
avgCheck:+$("check")?.value || 0,
foodPct:+$("foodPercent")?.value || 0,
labor:+$("labor")?.value || 0,
fixed:+$("fixed")?.value || 0,
days:+$("days")?.value || 0

})
}
);

if(res.status === 403) return location.replace("payment.html");
if(!res.ok) return;

const d = await res.json();


/* =========================
UPDATE VALUES
========================= */

$("dailyCovers").textContent = d.dailyCovers;
$("revenue").textContent = money(d.monthlyRevenue);
$("foodCost").textContent = money(d.foodCost);
$("totalCosts").textContent = money(d.totalCosts);


/* =========================
PROFIT
========================= */

const profitEl = $("profit");

profitEl.textContent = money(d.profit);

applyColor(
profitEl,
d.profit >= 0 ? "positive" : "negative"
);


/* =========================
MARGIN
========================= */

const marginEl = $("margin");

marginEl.textContent = percent(d.margin);

if(d.margin < 10) applyColor(marginEl,"negative");
else if(d.margin < 20) applyColor(marginEl,"caution");
else applyColor(marginEl,"positive");


/* =========================
COST RATIO
========================= */

const ratioEl = $("ratio");

ratioEl.textContent = percent(d.costRatio);

if(d.costRatio > 80) applyColor(ratioEl,"negative");
else if(d.costRatio > 60) applyColor(ratioEl,"caution");
else applyColor(ratioEl,"positive");


/* =========================
PROFIT PER COVER
========================= */

const coverEl = $("profitCover");

coverEl.textContent = money(d.profitPerCover);

if(d.profitPerCover < 0)
applyColor(coverEl,"negative");
else if(d.profitPerCover < 10)
applyColor(coverEl,"caution");
else
applyColor(coverEl,"positive");


/* =========================
BREAKEVEN
========================= */

$("breakeven").textContent = d.breakevenCovers;

$("monthly").textContent = money(d.monthlyProfit);
$("annual").textContent = money(d.annualProfit);


/* =========================
DECISION ENGINE
========================= */

const status = $("status");
const advice = $("decisionAdvice");

if(d.profit <= 0){

status.textContent = "❌ Restaurant Losing Money";
applyColor(status,"negative");

advice.textContent =
"Costs are higher than revenue. Increase pricing or reduce food/labor costs.";

}
else if(d.margin < 10){

status.textContent = "⚠ Dangerous Margin";
applyColor(status,"negative");

advice.textContent =
"Profit margin is too small. Small cost increases could cause losses.";

}
else if(d.margin < 20){

status.textContent = "🟡 Moderate Profitability";
applyColor(status,"caution");

advice.textContent =
"Restaurant is profitable but margin can improve.";

}
else{

status.textContent = "✅ Strong Restaurant Profitability";
applyColor(status,"positive");

advice.textContent =
"Healthy restaurant margins. Scaling could increase profits.";

}

}


/* =========================
INPUT LISTENERS
========================= */

document
.querySelectorAll(".input-section input")
.forEach(i => i.addEventListener("input",update));


/* =========================
RESET
========================= */

$("resetBtn")?.addEventListener("click",()=>{

document
.querySelectorAll(".input-section input")
.forEach(i => i.value="");

run();

});

})();