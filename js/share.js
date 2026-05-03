const API_BASE = "https://sandile-systemsworks-saas-backend-2.onrender.com";

/* ================= HELPERS ================= */
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const money = (v) => 
  (Number(v) || 0).toLocaleString(undefined, { 
    style: 'currency', 
    currency: 'USD' // Change to 'ZAR' or your preferred currency
  });

const percent = (v) => (Number(v) || 0).toFixed(2) + "%";

/* ================= CORE LOGIC ================= */
async function loadShare() {
  const contentEl = document.getElementById("content");
  const titleEl = document.getElementById("title");

  if (!id) {
    contentEl.innerHTML = `<p class="error">No share ID provided.</p>`;
    return;
  }

  // Show a simple loading state
  contentEl.innerHTML = `<p>Loading shared deal...</p>`;

  try {
    const res = await fetch(`${API_BASE}/api/shared-deals/${id}`);
    
    if (res.status === 404) {
      contentEl.innerHTML = `<p class="error">This shared link does not exist or has expired.</p>`;
      return;
    }

    if (!res.ok) throw new Error("Failed to fetch data");

    const deal = await res.json();

    // Update Title
    titleEl.textContent = deal.meta?.title || "Shared Deal";
    
    // Render the specific deal type
    renderDeal(deal);

  } catch (err) {
    console.error("LoadShare Error:", err);
    contentEl.innerHTML = `<p class="error">Unable to load the deal. Please try again later.</p>`;
  }
}

function renderDeal(deal) {
  const el = document.getElementById("content");
  const { results, type } = deal;

  if (!results) {
    el.innerHTML = `<p>No data available for this deal.</p>`;
    return;
  }

  // View for Construction
  if (type === "construction") {
    el.innerHTML = `
      <div class="card">
        <div class="header">
          <span class="badge">Construction Project</span>
        </div>
        
        <div class="grid">
          <div class="stat">
            <label>Net Profit</label>
            <div class="value">${money(results.profit)}</div>
          </div>
          
          <div class="stat">
            <label>Profit Margin</label>
            <div class="value">${percent(results.margin)}</div>
          </div>
          
          <div class="stat">
            <label>Return on Investment (ROI)</label>
            <div class="value">${percent(results.roi)}</div>
          </div>
        </div>

        <div class="meta-footer">
          Shared by: ${deal.meta?.createdBy || "System User"}
        </div>
      </div>
    `;
  } else {
    // Fallback for unknown types
    el.innerHTML = `<p>Shared content type <strong>${type}</strong> is not supported yet.</p>`;
  }
}

// Start the process
loadShare();
