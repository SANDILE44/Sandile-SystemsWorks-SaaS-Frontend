(() => {

const $ = id => document.getElementById(id);

const API_BASE = "https://sandile-systemsworks-saas-backend-2.onrender.com";

/* ================= API ================= */
async function api(url, method = "GET") {

  const token = localStorage.getItem("token");
  if (!token) return location.replace("login.html");

  const res = await fetch(`${API_BASE}${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });

  if (res.status === 401) {
    localStorage.removeItem("token");
    return location.replace("login.html");
  }

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
function render(deals) {

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
        ${d.type?.toUpperCase()} - ${new Date(d.createdAt).toLocaleDateString()}
      </div>

      <div class="deal-body">
        <div><strong>Profit:</strong> ${d.results?.profit ?? 0}</div>
        <div><strong>Revenue:</strong> ${d.results?.monthlyRevenue ?? 0}</div>
        <div><strong>Margin:</strong> ${d.results?.margin ?? 0}%</div>
      </div>

      <button onclick="SavedDeals.delete('${d._id}')" class="delete-btn">
        Delete
      </button>

    </div>
  `).join("");
}

/* ================= INIT ================= */
async function init() {
  const deals = await loadDeals();
  render(deals);
}

/* ================= EXPORT ================= */
window.SavedDeals = {
  delete: deleteDeal
};

/* START */
init();

})();
