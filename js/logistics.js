(() => {

const $ = (id) => document.getElementById(id);

const money = (v) =>
(Number(v) || 0).toLocaleString(undefined, {
minimumFractionDigits: 2,
maximumFractionDigits: 2,
});

const percent = (v) =>
(Number(v) || 0).toFixed(2) + '%';

let debounceTimer;

/* =====================================================
API HELPER
===================================================== */

async function apiPost(url, body) {

const token = localStorage.getItem('token');

if (!token) {
location.replace('login.html');
return null;
}

const res = await fetch(`${API_BASE}${url}`, {
method: 'POST',
headers: {
'Content-Type': 'application/json',
Authorization: `Bearer ${token}`,
},
body: JSON.stringify(body),
});

if (res.status === 401) {
localStorage.removeItem('token');
location.replace('login.html');
return null;
}

if (res.status === 403) {
location.replace('payment.html');
return null;
}

if (!res.ok) return null;

return res.json();
}

/* =====================================================
COLOR HELPER
===================================================== */

function setClass(el, base, extra) {
if (!el) return;
el.className = `output-value ${extra || ''}`;
}

/* =====================================================
MONTHLY CALCULATOR
===================================================== */

function updateMonthly() {
clearTimeout(debounceTimer);
debounceTimer = setTimeout(runMonthly, 300);
}

async function runMonthly() {

const data = await apiPost('/api/calculators/logistics/business', {
shipments: +$('log-shipments')?.value || 0,
revenuePer: +$('log-revenue')?.value || 0,
fuel: +$('log-fuel')?.value || 0,
labor: +$('log-labor')?.value || 0,
maintenance: +$('log-maintenance')?.value || 0,
fixed: +$('log-fixed')?.value || 0,
});

if (!data) return;

$('log-shipments-output').textContent = data.shipments ?? 0;
$('log-total-revenue').textContent = money(data.totalRevenue);
$('log-total-costs').textContent = money(data.totalCosts);
$('log-profit').textContent = money(data.profit);
$('log-per-shipment').textContent = money(data.costPerShipment);
$('log-revenue-per-shipment').textContent = money(data.revenuePerShipment);
$('log-profit-per-shipment').textContent = money(data.profitPerShipment);
$('log-margin').textContent = percent(data.margin);
$('log-roi').textContent = percent(data.roi);
$('log-breakeven-shipments').textContent = data.breakEvenShipments ?? 0;
$('log-annual-profit').textContent = money(data.annualProfit);

$('log-fuel-pct').textContent = percent(data.fuelPercent);
$('log-labor-pct').textContent = percent(data.laborPercent);
$('log-maintenance-pct').textContent = percent(data.maintenancePercent);
$('log-fixed-pct').textContent = percent(data.fixedPercent);

$('log-status').textContent = data.status || '—';
$('log-risk-level').textContent = data.riskLevel || '—';
$('log-recommended-price').textContent = money(data.recommendedPricePerShipment);
$('log-safety').textContent = data.safetyStatus || '—';
$('log-advice').textContent = data.advice || '—';

const risk = (data.riskLevel || '').toLowerCase();

if (risk === 'low')
setClass($('log-risk-level'), 'output-value', 'risk-low');
else if (risk === 'medium')
setClass($('log-risk-level'), 'output-value', 'risk-medium');
else if (risk === 'high')
setClass($('log-risk-level'), 'output-value', 'risk-high');

if (data.profit >= 0)
setClass($('log-profit'), 'output-value', 'profit-positive');
else
setClass($('log-profit'), 'output-value', 'profit-negative');

}

/* =====================================================
SHIPMENT CALCULATOR
===================================================== */

async function runShipment() {

const data = await apiPost('/api/calculators/logistics/shipment', {

quote: +$('ship-quote')?.value || 0,
minMargin: +$('ship-min-margin')?.value || 0,
buffer: +$('ship-buffer')?.value || 0,
distance: +$('ship-distance')?.value || 0,
fuelPerKm: +$('ship-fuel-km')?.value || 0,
vehiclePerKm: +$('ship-vehicle-km')?.value || 0,
loadFactor: +$('ship-load-factor')?.value || 100,
drivingHours: +$('ship-driving-hours')?.value || 0,
waitHours: +$('ship-wait-hours')?.value || 0,
driverRate: +$('ship-driver-rate')?.value || 0,
tolls: +$('ship-tolls')?.value || 0,
permits: +$('ship-permits')?.value || 0,
otherFees: +$('ship-other-fees')?.value || 0,
cargoValue: +$('ship-cargo-value')?.value || 0,
insuranceRate: +$('ship-insurance')?.value || 0,
duties: +$('ship-duties')?.value || 0,
handling: +$('ship-handling')?.value || 0,
passThrough: +$('ship-pass-through')?.value || 0,

});

if (!data) return;

$('ship-total-cost').textContent = money(data.totalCost);
$('ship-profit').textContent = money(data.profit);
$('ship-margin').textContent = percent(data.margin);
$('ship-min-quote').textContent = money(data.recommendedMinQuote);
$('ship-decision').textContent = data.decision;
$('ship-reason').textContent = data.reason;

const decision = (data.decision || '').toUpperCase();

if (decision === 'APPROVE')
setClass($('ship-decision'), 'output-value', 'decision-approve');
else if (decision === 'REJECT')
setClass($('ship-decision'), 'output-value', 'decision-reject');
else
setClass($('ship-decision'), 'output-value', 'decision-review');

if (data.profit >= 0)
setClass($('ship-profit'), 'output-value', 'profit-positive');
else
setClass($('ship-profit'), 'output-value', 'profit-negative');

}

/* =====================================================
FREIGHT CALCULATOR
===================================================== */

async function runFreight() {

const data = await apiPost('/api/calculators/logistics/freight', {

quote: +$('freight-quote')?.value || 0,
cargoValue: +$('freight-cargo-value')?.value || 0,
insuranceRate: +$('freight-insurance-rate')?.value || 0,
freightCost: +$('freight-cost')?.value || 0,
fuelSurcharge: +$('freight-fuel-surcharge')?.value || 0,
dutyRate: +$('freight-duty-rate')?.value || 0,
customsFees: +$('freight-customs-fees')?.value || 0,
portFees: +$('freight-port-fees')?.value || 0,
handlingFees: +$('freight-handling-fees')?.value || 0,
inlandTransport: +$('freight-inland-transport')?.value || 0,
tollCosts: +$('freight-tolls')?.value || 0,
otherCosts: +$('freight-other-costs')?.value || 0

});

if (!data) return;

$('freight-insurance-cost').textContent = money(data.insuranceCost);
$('freight-duties').textContent = money(data.duties);
$('freight-total-cost').textContent = money(data.totalCost);
$('freight-profit').textContent = money(data.profit);
$('freight-margin').textContent = percent(data.margin);
$('freight-breakeven').textContent = money(data.breakEvenQuote);
$('freight-decision').textContent = data.decision;
$('freight-reason').textContent = data.reason;
$('freight-risk').textContent = data.riskLevel;

}

/* =====================================================
EVENT BINDING
===================================================== */

function bindEvents() {

document
.querySelectorAll('#operations-panel input')
.forEach((i) => i.addEventListener('input', updateMonthly));

document
.querySelectorAll('#shipment-panel input')
.forEach((i) =>
i.addEventListener('input', () => {
clearTimeout(debounceTimer);
debounceTimer = setTimeout(runShipment, 300);
})
);

document
.querySelectorAll('#freight-panel input')
.forEach((i) =>
i.addEventListener('input', () => {
clearTimeout(debounceTimer);
debounceTimer = setTimeout(runFreight, 300);
})
);

}

bindEvents();

})();