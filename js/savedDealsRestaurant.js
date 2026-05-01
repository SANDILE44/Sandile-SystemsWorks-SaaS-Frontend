(() => {

const $ = (id) => document.getElementById(id);

const API_BASE = "https://sandile-systemsworks-saas-backend-2.onrender.com";

let dealsCache = [];
let pageType = null;

/* ================= DETECT PAGE TYPE ================= */
function detectType() {

  const path = window.location.pathname;

  if (path.includes("restaurant")) return "restaurant";
  if (path.includes("consulting")) return "consulting";
  if (path.includes("manufacturing")) return "manufacturing";

  return null;
}

/* ================= API ================= */
async function api(url, method = "GET") {

  const token = localStorage.getItem("token");
  if (!token) {
    location.replace("login.html");
    return null;
  }

  const res = await fetch(`${API_BASE}${url}`, {
    method,
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!res.ok) return null;

  return await res.json();
}

/* ================= LOAD ================= */
async function loadDeals() {
  const all = await api("/api/saved-deals");

  if (!all) return [];

  // 🔥 FILTER BY CURRENT PAGE TYPE
  return pageType
    ? all.filter(d => d.type === pageType)
    : all;
}

/* ================= DELETE ================= */
async function deleteDeal(id) {
  await api(`/api/saved-deals/${id}`, "DELETE");
  init();
}

/* ================= EDIT ================= */
function editDeal(deal) {

  localStorage.setItem("editDeal", JSON.stringify(deal));
  localStorage.setItem("editDealId", deal._id);

  // 🔥 ROUTE BASED ON TYPE
  if (deal.type === "restaurant") {
    window.location.href = "industry-restaurants.html";
  }

  else if (deal.type === "consulting") {
    window.location.href = "industry-consulting.html";
  }

  else if (deal.type === "manufacturing") {
    window.location.href = "industry-manufacturing.html";
  }
}

/* ================= FORMAT ================= */
function money(v) {
  return (Number(v) || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function percent(v) {
  return `${(Number(v) || 0).toFixed(2)}%`;
}

/* ================= RENDER ================= */
function renderDeals(deals) {

  const container = $("savedDealsContainer");
  const empty = $("emptyState");

  if (!container) return;

  dealsCache = deals || [];

  if (!dealsCache.length) {
    container.innerHTML = "";
    if (empty) empty.style.display = "block";
    return;
  }

  if (empty) empty.style.display = "none";

  container.innerHTML = dealsCache.map((d, index) => {

    const date = d.createdAt
      ? new Date(d.createdAt).toLocaleDateString()
      : "—";

    const type = (d.type || "UNKNOWN").toUpperCase();

    return `
      <div class="deal-card">

        <div class="deal-title">
          ${type} - ${date}
        </div>

        <div class="deal-body">
          <div><strong>Profit:</strong> ${money(d.results?.profit)}</div>
          <div><strong>Revenue:</strong> ${money(d.results?.revenue || d.results?.monthlyRevenue)}</div>
          <div><strong>Margin:</strong> ${percent(d.results?.margin)}</div>
        </div>

        <div class="deal-actions">
          <button class="edit-btn" data-index="${index}">
            Edit
          </button>

          <button class="delete-btn" data-id="${d._id}">
            Delete
          </button>
        </div>

      </div>
    `;
  }).join("");
}

/* ================= INIT ================= */
async function init() {

  pageType = detectType();

  const deals = await loadDeals();
  renderDeals(deals);
}

/* ================= EVENTS ================= */
document.addEventListener("click", async (e) => {

  const del = e.target.closest(".delete-btn");
  if (del) {
    await deleteDeal(del.dataset.id);
    return;
  }

  const edit = e.target.closest(".edit-btn");
  if (edit) {
    const deal = dealsCache[edit.dataset.index];
    if (deal) editDeal(deal);
  }

});

/* ================= START ================= */
document.addEventListener("DOMContentLoaded", init);

})();
