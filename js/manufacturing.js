(() => {

const $ = (id) => document.getElementById(id);

const API_BASE = "https://sandile-systemsworks-saas-backend-2.onrender.com";

let debounceTimer;
let latestData = null;

/* ================= FORMATTERS ================= */
const money = (v) =>
  (Number(v) || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

const percent = (v) => {
  const n = Number(v) || 0;
  const val = Math.abs(n) <= 1 ? n * 100 : n;
  return val.toFixed(2) + "%";
};

/* ================= API ================= */
async function api(url, method = "GET", body = null) {

  const token = localStorage.getItem("token");
  if (!token) return location.replace("login.html");

  try {
    const res = await fetch(`${API_BASE}${url}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: body ? JSON.stringify(body) : null
    });

    if (res.status === 401) {
      localStorage.removeItem("token");
      location.replace("login.html");
      return null;
    }

    if (!res.ok) return null;

    return await res.json();

  } catch (err) {
    console.error("API error:", err);
    return null;
  }
}

async function apiPost(url, body) {
  return await api(url, "POST", body);
}

/* ================= CLASS HELPERS ================= */
function setClass(el, cls) {
  if (!el) return;
  el.className = `output-value ${cls || ""}`;
}

/* ================= INPUTS ================= */
function getInputs() {
  return {
    units: +$("mfg-units")?.value || 0,
    price: +$("mfg-price")?.value || 0,
    material: +$("mfg-material")?.value || 0,
    labor: +$("mfg-labor")?.value || 0,
    fixed: +$("mfg-fixed")?.value || 0,
    operational: +$("mfg-operational")?.value || 0
  };
}

/* ================= MAIN ENGINE ================= */
async function runManufacturing() {

  const data = await apiPost(
    "/api/calculators/manufacturing/business",
    getInputs()
  );

  if (!data) return;

  latestData = data;

  /* ================= STATUS ================= */
  const status = $("status");
  const advice = $("decisionAdvice");

  status.textContent = data.status || "—";
  advice.textContent = data.action || "";

  status.classList.remove("profit", "loss", "neutral");

  status.classList.add(
    data.status === "LOSS"
      ? "loss"
      : data.status === "RISK"
      ? "neutral"
      : "profit"
  );

  /* ================= CORE METRICS ================= */
  $("revenue").textContent = money(data.revenue);
  $("totalCosts").textContent = money(data.totalCosts);
  $("profit").textContent = money(data.profit);

  setClass(
    $("profit"),
    data.profit >= 0 ? "profit-positive" : "profit-negative"
  );

  /* ================= UNIT ECONOMICS ================= */
  $("costPerUnit").textContent = money(data.costPerUnit);
  $("profitPerUnit").textContent = money(data.profitPerUnit);

  /* ================= PERFORMANCE ================= */
  $("margin").textContent = percent(data.margin);

  setClass(
    $("margin"),
    data.margin < 10
      ? "profit-negative"
      : data.margin < 20
      ? "margin-medium"
      : "margin-strong"
  );

  $("roi").textContent = percent(data.roi);

  /* ================= BREAK EVEN ================= */
  $("breakeven").textContent = data.breakeven ?? 0;

  /* ================= INSIGHTS (NEW DROPDOWN SYSTEM) ================= */
  renderInsights(data.insights);
}

/* ================= DROPDOWN INSIGHTS RENDERER ================= */
function renderInsights(insights) {

  const container = $("stepsContainer");
  if (!container || !insights) return;

  container.innerHTML = Object.entries(insights)
    .map(([group, items]) => {

      const content = (items || []).map(i => `
        <div class="step">
          <strong>${i.title}</strong>
          <div>${i.message}</div>
        </div>
      `).join("");

      return `
        <details>
          <summary style="font-weight:700; cursor:pointer;">
            ${group.toUpperCase()}
          </summary>
          <div style="margin-top:10px;">
            ${content}
          </div>
        </details>
      `;
    })
    .join("");
}

/* ================= RESET ================= */
function resetAll() {

  document.querySelectorAll(".input-section input")
    .forEach(i => i.value = "");

  latestData = null;

  [
    "revenue","totalCosts","profit",
    "costPerUnit","profitPerUnit",
    "margin","roi","breakeven"
  ].forEach(id => {
    const el = $(id);
    if (el) {
      el.textContent = "—";
      el.className = "output-value";
    }
  });

  $("status").textContent = "—";
  $("status").classList.remove("profit", "loss", "neutral");

  $("decisionAdvice").textContent = "";
  $("stepsContainer").innerHTML = "";
}

/* ================= SAVE DEAL ================= */
async function saveDeal() {

  if (!latestData) {
    alert("Run calculator first before saving");
    return;
  }

  const editId = localStorage.getItem("editDealId");

  const payload = {
    type: "manufacturing",
    inputs: getInputs(),
    results: {
      profit: latestData.profit,
      margin: latestData.margin,
      revenue: latestData.revenue
    }
  };

  const url = editId
    ? `/api/saved-deals/${editId}`
    : "/api/saved-deals";

  const method = editId ? "PUT" : "POST";

  const res = await api(url, method, payload);

  if (res) {
    alert(editId ? "Deal updated" : "Deal saved");

    localStorage.removeItem("editDeal");
    localStorage.removeItem("editDealId");
  } else {
    alert("Failed to save deal");
  }
}

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {

  document.querySelectorAll(".input-section input")
    .forEach(i => i.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(runManufacturing, 300);
    }));

  $("resetBtn")?.addEventListener("click", resetAll);
  $("saveDealBtn")?.addEventListener("click", saveDeal);

  /* ================= EDIT MODE ================= */
  const editDeal = JSON.parse(localStorage.getItem("editDeal"));

  if (editDeal) {
    $("mfg-units").value = editDeal.inputs?.units || "";
    $("mfg-price").value = editDeal.inputs?.price || "";
    $("mfg-material").value = editDeal.inputs?.material || "";
    $("mfg-labor").value = editDeal.inputs?.labor || "";
    $("mfg-fixed").value = editDeal.inputs?.fixed || "";
    $("mfg-operational").value = editDeal.inputs?.operational || "";

    runManufacturing();
  }

  runManufacturing();
});

})();
