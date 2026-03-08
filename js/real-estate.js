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

function setClass(el, cls){
if(!el) return;

el.className = "output-value";

if(cls) el.classList.add(cls);
}

/* ===============================
API HELPER
================================*/

async function apiPost(url, body){

const token = localStorage.getItem("token");

if(!token){
location.replace("login.html");
return null;
}

const res = await fetch(`${API_BASE}${url}`,{
method:"POST",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
},
body:JSON.stringify(body)
});

if(res.status === 401){
localStorage.removeItem("token");
location.replace("login.html");
return null;
}

if(res.status === 403){
location.replace("payment.html");
return null;
}

if(!res.ok) return null;

return res.json();
}

/* ===============================
INPUT UPDATE
================================*/

function update(){
clearTimeout(debounce);
debounce = setTimeout(run,300);
}

/* ===============================
MAIN CALCULATION
================================*/

async function run(){

const data = await apiPost(
"/api/calculators/property/investment",
{
cost:+$("property-cost")?.value || 0,
rent:+$("property-rent")?.value || 0,
expenses:+$("property-expenses")?.value || 0,
vacancyPct:+$("property-vacancy")?.value || 0,
years:+$("property-years")?.value || 0
}
);

if(!data) return;

/* ===============================
VALUES
================================*/

$("property-annual-income").textContent = money(data.annualIncome);
$("property-total-income").textContent = money(data.totalIncome);
$("property-total-expenses").textContent = money(data.totalExpenses);

$("property-profit").textContent = money(data.profit);

$("property-roi").textContent = percent(data.roi);
$("property-margin").textContent = percent(data.margin);

$("property-monthly-profit").textContent = money(data.monthlyProfit);
$("property-annual-profit").textContent = money(data.annualProfit);

$("property-breakeven-rent").textContent = money(data.breakEvenRent);

$("property-risk").textContent = data.riskLevel || "—";
$("property-decision").textContent = data.decision || "—";
$("property-reason").textContent = data.reason || "—";

/* ===============================
PROFIT PER R1
================================*/

const cost = +$("property-cost")?.value || 0;

$("property-profit-per-r").textContent =
cost > 0 ? (data.profit / cost).toFixed(2) : "0.00";

/* ===============================
PROFIT COLOR
================================*/

if(data.profit >= 0)
setClass($("property-profit"),"profit-positive");
else
setClass($("property-profit"),"profit-negative");

/* ===============================
ROI COLOR
================================*/

const roi = Number(data.roi) || 0;

if(roi >= 20)
setClass($("property-roi"),"roi-strong");
else if(roi >= 10)
setClass($("property-roi"),"roi-medium");
else
setClass($("property-roi"),"roi-low");

/* ===============================
RISK COLOR
================================*/

const risk = (data.riskLevel || "").toLowerCase();

if(risk === "low")
setClass($("property-risk"),"risk-low");
else if(risk === "medium")
setClass($("property-risk"),"risk-medium");
else
setClass($("property-risk"),"risk-high");

/* ===============================
DECISION COLOR
================================*/

const decision = (data.decision || "").toUpperCase();

if(decision === "BUY")
setClass($("property-decision"),"decision-buy");
else if(decision === "REVIEW")
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

/* ===============================
RESET BUTTON
================================*/

$("resetBtn")?.addEventListener("click", () => {

document
.querySelectorAll(".input-section input")
.forEach(i => i.value = "");

update();

});

/* ===============================
INITIAL RUN
================================*/

update();

})();