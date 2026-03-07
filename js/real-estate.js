(() => {

const $ = (id) => document.getElementById(id);

const money = (v) =>
(Number(v) || 0).toLocaleString(undefined,{
minimumFractionDigits:2,
maximumFractionDigits:2
});

const percent = (v) =>
(Number(v) || 0).toFixed(2) + "%";

let debounce;

/* ===============================
CLASS HELPER
================================*/

function setClass(el,cls){
if(!el) return;
el.className = `output-value ${cls}`;
}

/* ===============================
UPDATE HANDLER
================================*/

function update(){
clearTimeout(debounce);
debounce = setTimeout(run,300);
}

/* ===============================
MAIN CALCULATION CALL
================================*/

async function run(){

const res = await fetch(`${API_BASE}/api/calculators/property/investment`,{
method:"POST",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${localStorage.getItem("token")}`
},
body:JSON.stringify({
cost:+$("property-cost")?.value||0,
rent:+$("property-rent")?.value||0,
expenses:+$("property-expenses")?.value||0,
vacancyPct:+$("property-vacancy")?.value||0,
years:+$("property-years")?.value||0
})
});

if(res.status===403) return location.replace("payment.html");
if(!res.ok) return;

const d = await res.json();

/* ===============================
VALUES
================================*/

$("property-annual-income").textContent = money(d.annualIncome);
$("property-total-income").textContent = money(d.totalIncome);
$("property-total-expenses").textContent = money(d.totalExpenses);
$("property-profit").textContent = money(d.profit);
$("property-roi").textContent = percent(d.roi);
$("property-margin").textContent = percent(d.margin);
$("property-monthly-profit").textContent = money(d.monthlyProfit);
$("property-annual-profit").textContent = money(d.annualProfit);

$("property-breakeven-rent").textContent = money(d.breakEvenRent);
$("property-risk").textContent = d.riskLevel;
$("property-decision").textContent = d.decision;
$("property-reason").textContent = d.reason;

/* ===============================
PROFIT COLOR
================================*/

if(d.profit >= 0)
setClass($("property-profit"),"profit-positive");
else
setClass($("property-profit"),"profit-negative");

/* ===============================
ROI COLOR
================================*/

const roi = Number(d.roi)||0;

if(roi >= 20)
setClass($("property-roi"),"roi-strong");
else if(roi >= 10)
setClass($("property-roi"),"roi-medium");
else
setClass($("property-roi"),"roi-low");

/* ===============================
RISK COLOR
================================*/

const risk = (d.riskLevel||"").toLowerCase();

if(risk==="low")
setClass($("property-risk"),"risk-low");
else if(risk==="medium")
setClass($("property-risk"),"risk-medium");
else
setClass($("property-risk"),"risk-high");

/* ===============================
DECISION COLOR
================================*/

const decision = (d.decision||"").toUpperCase();

if(decision==="BUY")
setClass($("property-decision"),"decision-buy");
else if(decision==="REVIEW")
setClass($("property-decision"),"decision-review");
else
setClass($("property-decision"),"decision-avoid");

}

/* ===============================
EVENT LISTENERS
================================*/

document
.querySelectorAll(".input-section input")
.forEach(i => i.addEventListener("input",update));

update();

})();