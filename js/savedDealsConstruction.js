(() => {
  const $ = (id) => document.getElementById(id);
  const API_BASE = "https://sandile-systemsworks-saas-backend-2.onrender.com";
  let dealsCache = [];

  /* ================= UI UTILS ================= */
  const showLoader = () => {
    const loader = $("loader");
    const container = $("savedDealsContainer");
    if (loader) loader.style.display = "flex";
    if (container) container.style.opacity = "0.3"; 
  };

  const hideLoader = () => {
    const loader = $("loader");
    const container = $("savedDealsContainer");
    if (loader) loader.style.display = "none";
    if (container) container.style.opacity = "1";
  };

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
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.error("Connection error:", err);
      return null;
    }
  }

  /* ================= LOAD DEALS ================= */
  async function loadDeals() {
    showLoader();
    const all = await api("/api/saved-deals");
    hideLoader();
    return (all || []).filter(d => d.type === "construction");
  }

  /* ================= DELETE ================= */
  async function deleteDeal(id) {
    const confirmDelete = confirm(
      "⚠️ Are you sure you want to delete this record?\n\nThis action is permanent."
    );

    if (confirmDelete) {
      showLoader();
      await api(`/api/saved-deals/${id}`, "DELETE");
      await init(); 
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

  /* ================= SEARCH LOGIC ================= */
  function handleSearch(e) {
    const term = e.target.value.toLowerCase();
    
    // Filter the original dealsCache
    const filtered = dealsCache.filter(d => {
      const name = (d.clientName || "").toLowerCase();
      const revenue = (d.results?.revenue || d.results?.value || 0).toString();
      const status = (d.results?.status || "").toLowerCase();
      
      return name.includes(term) || revenue.includes(term) || status.includes(term);
    });

    // Render the filtered list without updating the main cache
    renderDeals(filtered, false); 
  }

  /* ================= RENDER ================= */
  function renderDeals(deals, updateCache = true) {
    const container = $("savedDealsContainer");
    const empty = $("emptyState");

    if (updateCache) {
      dealsCache = deals || [];
    }

    if (!deals.length) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem; opacity: 0.6;">
            <p>No matching projects found.</p>
        </div>
      `;
      if (empty && updateCache) empty.style.display = "block";
      return;
    }

    if (empty) empty.style.display = "none";

    container.innerHTML = deals.map((d, index) => {
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
              <div class="deal-title">${clientDisplay}</div>
              <div class="deal-date">${fullTimestamp}</div>
            </div>
            <div class="deal-tag">CONSTRUCTION</div>
          </div>
          <div class="deal-body">
            <div class="deal-grid">
              <div>
                <span class="label">PROFIT</span>
                <div>R ${money(d.results?.profit)}</div>
              </div>
              <div>
                <span class="label">MARGIN</span>
                <div class="${marginClass}">${percent(marginVal)}</div>
              </div>
            </div>
            <div class="deal-revenue">
              <span class="label">CONTRACT VALUE:</span>
              R ${money(d.results?.revenue || d.results?.value)}
            </div>
          </div>
          <div class="deal-actions">
            <button class="edit-btn" data-id="${d._id}">Edit / Open</button>
            <button class="delete-btn" data-id="${d._id}">Delete</button>
          </div>
        </div>
      `;
    }).join("");
  }

  /* ================= INIT ================= */
  async function init() {
    const deals = await loadDeals();
    renderDeals(deals);
    
    // Ensure Lucide icons are refreshed for new content
    if (window.lucide) window.lucide.createIcons();
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
      // Find the deal by ID to ensure accuracy even when filtered
      const deal = dealsCache.find(dc => dc._id === edit.dataset.id);
      if (deal) editDeal(deal);
    }
  });

  // Listen for search input
  $("searchInput")?.addEventListener("input", handleSearch);

  // Initialize on load
  document.addEventListener("DOMContentLoaded", init);
})();
