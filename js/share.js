const API_BASE = "https://sandile-systemsworks-saas-backend-2.onrender.com";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const formatNum = (v) => 
  (Number(v) || 0).toLocaleString(undefined, { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });

const percent = (v) => (Number(v) || 0).toFixed(2) + "%";

async function loadShare() {
  const contentEl = document.getElementById("content");
  
  if (!id) {
    contentEl.innerHTML = `<h2>No ID provided</h2>`;
    return;
  }

  try {
    // Note: Path changed to /api/share to match your server.js
    const res = await fetch(`${API_BASE}/api/share/${id}`);
    
    if (!res.ok) {
      contentEl.innerHTML = `<h2>Deal not found</h2>`;
      return;
    }

    const deal = await res.json();
    document.getElementById("title").textContent = deal.meta?.title || "Shared Project Results";

    if (deal.type === "construction") {
      contentEl.innerHTML = `
        <div style="border: 1px solid #ccc; padding: 20px; border-radius: 8px; max-width: 400px;">
          <p><strong>Profit:</strong> ${formatNum(deal.results.profit)}</p>
          <p><strong>Margin:</strong> ${percent(deal.results.margin)}</p>
          <p><strong>ROI:</strong> ${percent(deal.results.roi)}</p>
        </div>
      `;
    }
  } catch (err) {
    contentEl.innerHTML = `<h2>Error loading data</h2>`;
  }
}

loadShare();
