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
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) return null;
    return await res.json();
  }

  /* ================= LOAD ================= */
  async function loadDeals() {
    const all = await api("/api/saved-deals");
    return (all || []).filter(d => d.type === "construction");
  }

  /* ================= DELETE (WITH SAFETY) ================= */
  async function deleteDeal(id) {
    // Premium Safety Check
    const confirmDelete = confirm("⚠️ Are you sure you want to delete this record?\n\nThis action is permanent and will remove the financial data from your history.");
    
    if (confirmDelete) {
      await api(`/api/saved-deals/${id}`, "DELETE");
      init(); // Refresh the list
    }
  }

  /* ================= EDIT ================= */
  function editDeal(deal) {
    localStorage.setItem("editDeal", JSON.stringify(deal));
    localStorage.setItem("editDealId", deal._id);
    window.location.href = "industry-construction.html";
  }

  /* ================= FORMATTERS ================= */
  function money(v) {
    return (Number(v) || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  const percent = (v) => (Number(v) || 0).toFixed(2) + "%";

  /* Format Date to: 4 May 2026 • 14:30 */
  function formatFullDate(dateString) {
    if (!dateString) return "—";
    const date = new Date(dateString);
    
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const datePart = date.toLocaleDateString('en-GB', options);
    const timePart = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    
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
      // Logic for Client Name display
      const clientDisplay = d.clientName || "Untitled Project";
      const fullTimestamp = formatFullDate(d.createdAt);
      
      // Determine margin color for a "quick look" badge
      const marginVal = d.results?.margin || 0;
      const marginColor = marginVal > 20 ? "#10b981" : marginVal > 10 ? "#f59e0b" : "#ef4444";

      return `
        <div class="deal-card" style="border-left: 5px solid ${marginColor};">
          <div class="deal-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
            <div>
              <div class="deal-title" style="font-size: 1.2rem; font-weight: bold; color: #ffffff; text-transform: uppercase;">
                ${clientDisplay}
              </div>
              <div class="deal-date" style="font-size: 0.85rem; color: #94a3b8; margin-top: 4px;">
                ${fullTimestamp}
              </div>
            </div>
            <div style="background: ${marginColor}22; color: ${marginColor}; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: bold; border: 1px solid ${marginColor}44;">
              CONSTRUCTION
            </div>
          </div>

          <div class="deal-body" style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div><strong style="color: #64748b; font-size: 0.8rem;">PROFIT</strong><br>${money(d.results?.profit)}</div>
              <div><strong style="color: #64748b; font-size: 0.8rem;">MARGIN</strong><br><span style="color: ${marginColor}">${percent(marginVal)}</span></div>
            </div>
            <div style="margin-top: 10px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 10px;">
               <strong style="color: #64748b; font-size: 0.8rem;">CONTRACT VALUE:</strong> R ${money(d.results?.revenue || d.results?.value)}
            </div>
          </div>

          <div class="deal-actions" style="margin-top: 15px; display: flex; gap: 10px;">
            <button class="edit-btn" data-index="${index}" style="flex: 1; padding: 8px; cursor: pointer; background: #3b82f6; color: white; border: none; border-radius: 5px; font-weight: bold;">
              Edit / Open
            </button>
            <button class="delete-btn" data-id="${d._id}" style="padding: 8px 15px; cursor: pointer; background: transparent; color: #ef4444; border: 1px solid #ef4444; border-radius: 5px;">
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
