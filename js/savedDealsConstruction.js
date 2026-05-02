(() => {

  const $ = (id) => document.getElementById(id);

  const API_BASE =
    "https://sandile-systemsworks-saas-backend-2.onrender.com";

  let dealsCache = [];

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

    return (all || []).filter(d => d.type === "construction");
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

    window.location.href = "industry-construction.html";
  }

  /* ================= FORMAT ================= */
  function money(v) {
    return (Number(v) || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  const percent = (v) => (Number(v) || 0).toFixed(2) + "%";

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
            CONSTRUCTION - ${date}
          </div>

          <div class="deal-body">
            <div><strong>Profit:</strong> ${money(d.results?.profit)}</div>
            <div><strong>Contract Value:</strong> ${money(d.results?.revenue || d.results?.value)}</div>
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

  document.addEventListener("DOMContentLoaded", init);

})();
