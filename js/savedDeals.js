(() => {

const $ = (id) => document.getElementById(id);

const API_BASE = "https://sandile-systemsworks-saas-backend-2.onrender.com";

/* ================= API ================= */
async function api(url, method = "GET", body = null) {

  const token = localStorage.getItem("token");
  if (!token) return location.replace("login.html");

  const res = await fetch(`${API_BASE}${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: body ? JSON.stringify(body) : null
  });

  if (!res.ok) return null;

  return await res.json();
}

/* ================= LOAD ================= */
async function loadDeals() {
  return await api("/api/saved-deals");
}

/* ================= DELETE ================= */
async function deleteDeal(id) {
  await api(`/api/saved-deals/${id}`, "DELETE");
  init();
}

/* ================= EDIT (FRONTEND ONLY) ================= */
function editDeal(deal) {

  const profit = prompt("Edit Profit:", deal.results?.profit ?? 0);
  const revenue = prompt("Edit Revenue:", deal.results?.monthlyRevenue ?? 0);
  const margin = prompt("Edit Margin (%):", deal.results?.margin ?? 0);

  if (profit === null || revenue === null || margin === null) return;

  // update locally (no backend yet)
  deal.results.profit = Number(profit);
  deal.results.monthlyRevenue = Number(revenue);
  deal.results.margin = Number(margin);

  renderDeals(window.__dealsCache);
}

/* ================= RENDER ================= */
function renderDeals(deals) {

  const container = $("savedDealsContainer");
  const empty = $("emptyState");

  if (!container) return;

  // cache for edit
  window.__dealsCache = deals;

  if (!deals || deals.length === 0) {
    container.innerHTML = "";
    if (empty) empty.style.display = "block";
    return;
  }

  if (empty) empty.style.display = "none";

  container.innerHTML = deals.map((d, index) => `
    <div class="deal-card">

      <div class="deal-title">
        ${(d.type || "UNKNOWN").toUpperCase()} -
        ${new Date(d.createdAt).toLocaleDateString()}
      </div>

      <div class="deal-body">
        <div><strong>Profit:</strong> ${d.results?.profit ?? 0}</div>
        <div><strong>Revenue:</strong> ${d.results?.monthlyRevenue ?? 0}</div>
        <div><strong>Margin:</strong> ${d.results?.margin ?? 0}%</div>
      </div>

      <button class="edit-btn" data-index="${index}">
        Edit
      </button>

      <button class="delete-btn" data-id="${d._id}">
        Delete
      </button>

    </div>
  `).join("");
}

/* ================= INIT ================= */
async function init() {
  const deals = await loadDeals();
  renderDeals(deals);
}

/* ================= EVENTS ================= */
document.addEventListener("click", async (e) => {

  /* DELETE */
  const delBtn = e.target.closest(".delete-btn");
  if (delBtn) {
    await deleteDeal(delBtn.dataset.id);
    return;
  }

  /* EDIT */
  const editBtn = e.target.closest(".edit-btn");
  if (editBtn) {
    const index = editBtn.dataset.index;
    const deal = window.__dealsCache[index];
    editDeal(deal);
  }

});

/* START */
document.addEventListener("DOMContentLoaded", init);

})();
