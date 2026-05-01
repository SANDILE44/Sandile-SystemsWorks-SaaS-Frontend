(() => {

const $ = (id) => document.getElementById(id);

const API_BASE = "https://sandile-systemsworks-saas-backend-2.onrender.com";

let dealsCache = [];

/* ================= API ================= */
async function api(url, method = "GET", body = null) {

  const token = localStorage.getItem("token");
  if (!token) {
    location.replace("login.html");
    return null;
  }

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

/* ================= LOAD ================= */
async function loadDeals() {
  return await api("/api/saved-deals");
}

/* ================= DELETE ================= */
async function deleteDeal(id) {
  await api(`/api/saved-deals/${id}`, "DELETE");
  init();
}

/* ================= EDIT (RESTAURANT ONLY) ================= */
function editDeal(deal) {

  if (deal.type !== "restaurant") return;

  localStorage.setItem("editDeal", JSON.stringify(deal));
  localStorage.setItem("editDealId", deal._id);

  window.location.href = "industry-restaurants.html";
}

/* ================= FORMAT ================= */
function formatMoney(v) {
  return (Number(v) || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatPercent(v) {
  return `${(Number(v) || 0).toFixed(2)}%`;
}

/* ================= RENDER ================= */
function renderDeals(deals) {

  const container = $("savedDealsContainer");
  const empty = $("emptyState");

  if (!container) return;

  dealsCache = (deals || []).filter(d => d.type === "restaurant");

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

    return `
      <div class="deal-card">

        <div class="deal-title">
          RESTAURANT - ${date}
        </div>

        <div class="deal-body">
          <div><strong>Profit:</strong> ${formatMoney(d.results?.profit)}</div>
          <div><strong>Revenue:</strong> ${formatMoney(d.results?.monthlyRevenue)}</div>
          <div><strong>Margin:</strong> ${formatPercent(d.results?.margin)}</div>
        </div>

        <button class="edit-btn" data-index="${index}">
          Edit
        </button>

        <button class="delete-btn" data-id="${d._id}">
          Delete
        </button>

      </div>
    `;
  }).join("");
}

/* ================= INIT ================= */
async function init() {
  const deals = await loadDeals();
  renderDeals(deals);
}

/* ================= EVENTS ================= */
document.addEventListener("click", async (e) => {

  const delBtn = e.target.closest(".delete-btn");
  if (delBtn) {
    await deleteDeal(delBtn.dataset.id);
    return;
  }

  const editBtn = e.target.closest(".edit-btn");
  if (editBtn) {
    const deal = dealsCache[editBtn.dataset.index];
    if (deal) editDeal(deal);
  }

});

/* ================= START ================= */
document.addEventListener("DOMContentLoaded", init);

})();