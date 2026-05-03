const API_BASE = "https://sandile-systemsworks-saas-backend-2.onrender.com";

/* ================= HELPERS ================= */
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// Neutral number formatter (adds commas/decimals but no symbols)
const formatNum = (v) => 
  (Number(v) || 0).toLocaleString(undefined, { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });

const percent = (v) => (Number(v) || 0).toFixed(2) + "%";

/* ================= CORE LOGIC ================= */
async function loadShare() {
  const contentEl = document.getElementById("content");
  
  if (!id) {
    contentEl.innerHTML = `<p class="error">No share ID provided.</p>`;
    return;
  }

  contentEl.innerHTML = `<p>Loading shared deal...</p>`;

  try {
    // Debugging: Log the exact URL being called
    console.log(`Fetching from: ${API_BASE}/api/share/${id}`);

    const res = await fetch(`${API_BASE}/api/share/${id}`);
    
    if (res.status === 404) {
      contentEl.innerHTML = `<p class="error">Link not found. Please check the URL.</p>`;
      return;
    }

    if (!res.ok) throw new Error("Server error");

    const deal = await res.json();
    document.getElementById("title").textContent = deal.meta?.title || "Shared Deal";
    renderDeal(deal);

  } catch (err) {
    console.error("Fetch error:", err);
    contentEl.innerHTML = `<p class="error">Connection failed.</p>`;
  }
}

function renderDeal(deal) {
  const el = document.getElementById("content");
  const { results, type } = deal;

  if (type === "construction") {
    el.innerHTML = `
      <div class="card">
        <div class="badge">Construction Project</div>
        <div class="grid">
          <div class="stat">
            <label>Net Profit</label>
            <div class="value">${formatNum(results.profit)}</div>
          </div>
          <div class="stat">
            <label>Margin</label>
            <div class="value">${percent(results.margin)}</div>
          </div>
          <div class="stat">
            <label>ROI</label>
            <div class="value">${percent(results.roi)}</div>
          </div>
        </div>
      </div>
    `;
  }
}

loadShare();
