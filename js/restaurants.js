(() => {

const $ = id => document.getElementById(id);

let latestData = null;

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

  if (res.status === 403) return location.replace("payment.html");
  if (!res.ok) return null;

  return await res.json();
}

/* ================= UPDATE ================= */
function update() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(runRestaurant, 300);
}

/* ================= CALC ================= */
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

  latestData = data;

  $("revenue").textContent = money(data.monthlyRevenue);
  $("profit").textContent = money(data.profit);
  $("margin").textContent = percent(data.margin);
}

/* ================= SAVE ONLY ================= */
$("saveDealBtn")?.addEventListener("click", async () => {

  if (!latestData) {
    alert("Run calculator first");
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

  alert(res ? "Saved" : "Failed to save");
});

/* ================= EVENTS ================= */
document
  .querySelectorAll(".input-section input")
  .forEach(i => i.addEventListener("input", update));

$("resetBtn")?.addEventListener("click", () => {
  document.querySelectorAll(".input-section input").forEach(i => i.value = "");
  latestData = null;
});

/* INIT */
runRestaurant();

})();
