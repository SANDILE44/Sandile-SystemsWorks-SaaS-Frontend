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

/* ================= RENDER ================= */
function renderDeals(deals) {

  const container = $("savedDealsContainer");
  const empty = $("emptyState");

  if (!container) return;

  if (!deals || deals.length === 0) {
    container.innerHTML = "";
    empty.style.display = "block";
    return;
  }

  empty.style.display = "none";

  container.innerHTML = deals.map(d => `
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

  const btn = e.target.closest(".delete-btn");
  if (!btn) return;

  await deleteDeal(btn.dataset.id);
});

/* START */
document.addEventListener("DOMContentLoaded", init);

})();
