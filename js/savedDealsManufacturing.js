(() => {

const $ = (id) => document.getElementById(id);

const API_BASE = "https://sandile-systemsworks-saas-backend-2.onrender.com";

let dealsCache = [];

/* ================= API ================= */
async function api(url, method = "GET") {

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
      }
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
  const all = await api("/api/saved-deals");

  if (!Array.isArray(all)) return [];

  // 🔥 FILTER ONLY MANUFACTURING
  return all.filter(d => d.type === "manufacturing");
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

  window.location.href = "manufacturing.html";
}

/* ================= FORMAT ================= */
function money(v) {
  return (Number(v) || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/* ================= RENDER ================= */
function renderDeals(deals) {

  const container = $("savedDealsContainer");
  const empty = $("emptyState");

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

    return `
      <div class="deal-card">

        <div class="deal-title">
          MANUFACTURING - ${date}
        </div>

        <div class="deal-body">
          <div><strong>Profit:</strong> ${money(d.results?.profit)}</div>
          <div><strong>Revenue:</strong> ${money(d.results?.revenue)}</div>
          <div><strong>Margin:</strong> ${(d.results?.margin || 0).toFixed(2)}%</div>
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
