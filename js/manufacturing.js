(() => {

const $ = (id) => document.getElementById(id);

const money = (v) =>
(Number(v) || 0).toLocaleString(undefined,{
minimumFractionDigits:2,
maximumFractionDigits:2
});

const percent = (v) =>
(Number(v) || 0).toFixed(2) + "%";

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

const res = await fetch(
`${API_BASE}/api/calculators/manufacturing/business`,
{
method:"POST",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${localStorage.getItem("token")}`
},
body:JSON.stringify({

units:+$("mfg-units")?.value || 0,
price:+$("mfg-price")?.value || 0,
material:+$("mfg-material")?.value || 0,
labor:+$("mfg-labor")?.value || 0,
fixed:+$("mfg-fixed")?.value || 0,
operational:+$("mfg-operational")?.value || 0

})
}
);

if(res.status === 403) return location.replace("payment.html");
if(!res.ok) return;

const d = await res.json();


/* =========================
UPDATE VALUES
========================= */

$("mfg-units-output").textContent = d.units;

$("mfg-revenue").textContent = money(d.revenue);

$("mfg-total-costs").textContent = money(d.totalCosts);

$("mfg-cost-per-unit").textContent = money(d.costPerUnit);

$("mfg-revenue-per-unit").textContent = money(d.revenuePerUnit);

const profitUnitEl = $("mfg-profit-per-unit");

profitUnitEl.textContent = money(d.profitPerUnit);

if (d.profitPerUnit < 0)
  applyColor(profitUnitEl, "negative");
else if (d.profitPerUnit < 5)
  applyColor(profitUnitEl, "caution");
else
  applyColor(profitUnitEl, "positive");

/* =========================
PROFIT
========================= */

const profitEl = $("mfg-profit");

profitEl.textContent = money(d.profit);

applyColor(
profitEl,
d.profit >= 0 ? "positive" : "negative"
);


/* =========================
BREAKEVEN
========================= */

$("mfg-breakeven").textContent = d.breakeven;


/* =========================
ROI COLOR
========================= */

const roiEl = $("mfg-roi");

roiEl.textContent = percent(d.roi);

if(d.roi < 5) applyColor(roiEl,"negative");
else if(d.roi < 15) applyColor(roiEl,"caution");
else applyColor(roiEl,"positive");


/* =========================
MARGIN COLOR
========================= */

const marginEl = $("mfg-margin");

marginEl.textContent = percent(d.margin);

if(d.margin < 10) applyColor(marginEl,"negative");
else if(d.margin < 20) applyColor(marginEl,"caution");
else applyColor(marginEl,"positive");


$("mfg-monthly-revenue").textContent = money(d.monthlyRevenue);

$("mfg-annual-revenue").textContent = money(d.annualRevenue);


/* =========================
DECISION ENGINE
========================= */

const decision = $("decision-status");
const risk = $("risk-warning");
const advice = $("decision-advice");

applyColor(decision,null);

if(d.profit <= 0){

decision.textContent = "❌ Loss Making Production";
applyColor(decision,"negative");

risk.textContent =
"Production costs exceed revenue. Current selling price is not sustainable.";

advice.textContent =
"Increase price or reduce material costs before running production.";

}

else if(d.margin < 10){

decision.textContent = "⚠ Dangerous Margin";
applyColor(decision,"negative");

risk.textContent =
"Margin is extremely thin. Small cost fluctuations may eliminate profit.";

advice.textContent =
"Renegotiate supplier prices or adjust selling price before scaling.";

}

else if(d.margin < 20){

decision.textContent = "🟡 Moderate Production Margin";
applyColor(decision,"caution");

risk.textContent =
"Production is profitable but margin buffer is limited.";

advice.textContent =
"Monitor material and labor costs closely during production.";

}

else{

decision.textContent = "✅ Strong Production Profitability";
applyColor(decision,"positive");

risk.textContent =
"Healthy production margin with good safety buffer.";

advice.textContent =
"Scaling production could significantly increase profit.";

}

}


/* =========================
INPUT LISTENERS
========================= */

document
.querySelectorAll("input")
.forEach(i => i.addEventListener("input",update));


/* =========================
RESET BUTTON
========================= */

$("resetBtn")?.addEventListener("click",()=>{

document.querySelectorAll("input")
.forEach(i => i.value="");

run();

});


})();