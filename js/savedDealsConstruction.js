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

    const res = await fetch(`${API_BASE}${url}`, {
      method,
      headers: { Authorization: `Bearer ${token}` }
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
    const confirmDelete = confirm(
      "⚠️ Are you sure you want to delete this record?\n\nThis action is permanent."
    );

    if (confirmDelete) {
      await api(`/api/saved-deals/${id}`, "DELETE");
      init();
    }
  }

  /* ================= EDIT ================= */
  function editDeal(deal) {
    localStorage.setItem("editDeal", JSON.stringify(deal));
    localStorage.setItem("editDealId", deal._id);
    window.location.href = "industry-construction.html";
  }

  /* ================= FORMATTERS ================= */
  const money = (v) =>
    (Number(v) || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

  const percent = (v) => (Number(v) || 0).toFixed(2) + "%";

  function formatFullDate(dateString) {
    if (!dateString) return "—";

    const date = new Date(dateString);

    const datePart = date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    const timePart = date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit"
    });

    return `${datePart} • ${timePart}`;
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
      const clientDisplay = d.clientName || "Untitled Project";
      const fullTimestamp = formatFullDate(d.createdAt);

      const marginVal = d.results?.margin || 0;
      const marginClass =
        marginVal > 20 ? "positive" :
        marginVal > 10 ? "caution" :
        "negative";

      return `
        <div class="deal-card ${marginClass}">
          
          <div class="deal-header">
            <div>
              <div class="deal-title">
                ${clientDisplay}
              </div>
              <div class="deal-date">
                ${fullTimestamp}
              </div>
            </div>

            <div class="deal-tag">
              CONSTRUCTION
            </div>
          </div>

          <div class="deal-body">
            <div class="deal-grid">
              <div>
                <span class="label">PROFIT</span>
                <div>${money(d.results?.profit)}</div>
              </div>

              <div>
                <span class="label">MARGIN</span>
                <div class="${marginClass}">
                  ${percent(marginVal)}
                </div>
              </div>
            </div>

            <div class="deal-revenue">
              <span class="label">CONTRACT VALUE:</span>
              R ${money(d.results?.revenue || d.results?.value)}
            </div>
          </div>

          <div class="deal-actions">
            <button class="edit-btn" data-index="${index}">
              Edit / Open
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
