const API_BASE = "https://sandile-systemsworks-saas-backend-2.onrender.com";

// 1. Move helpers to the TOP so they are ready immediately
const formatNum = (v) => (Number(v) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 });
const percent = (v) => (Number(v) || 0).toFixed(2) + "%";

async function loadShare() {
  const contentEl = document.getElementById("content");
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    contentEl.innerHTML = "<h2 style='text-align:center;'>Error: No ID provided</h2>";
    return;
  }

  try {
    // Ensure no double slashes in URL
    const cleanBase = API_BASE.replace(/\/$/, ""); 
    const res = await fetch(`${cleanBase}/api/share/${id}`);

    if (!res.ok) {
      contentEl.innerHTML = "<h2 style='text-align:center;'>Project Not Found</h2>";
      return;
    }

    const deal = await res.json();
    
    // SAFETY: Use optional chaining (?.) so it doesn't crash if results is missing
    const results = deal.results || {}; 

    // Update Title
    document.getElementById("title").textContent = deal.title || "Project Analysis";

    // Inject themed HTML
    contentEl.innerHTML = `
      <div class="data-grid">
        <div class="data-card">
          <span class="label">Net Profit</span>
          <span class="value" style="color: #22c55e;">R ${formatNum(results.profit)}</span>
        </div>
        <div class="data-card">
          <span class="label">Margin</span>
          <span class="value" style="color: var(--accent);">${percent(results.margin)}</span>
        </div>
        <div class="data-card">
          <span class="label">ROI</span>
          <span class="value" style="color: #ffffff;">${percent(results.roi)}</span>
        </div>
      </div>

      <div class="decision-panel" style="background: rgba(0, 180, 216, 0.1); border: 1px solid var(--accent); color: var(--accent);">
        <div style="font-size: 1.4rem;">${results.decision || "Pending"}</div>
        <p style="color: var(--text-main); font-weight: 400; font-style: italic; margin-top: 10px;">
          "${results.advice || "No advice provided."}"
        </p>
      </div>
    `;

  } catch (err) {
    console.error("Critical Error:", err);
    contentEl.innerHTML = "<h2 style='text-align:center;'>Server Connection Error</h2>";
  }
}

// 2. Final trigger
loadShare();
