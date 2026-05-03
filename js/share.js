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
    const res = await fetch(`${API_BASE}/api/share/${id}`);
    
    if (!res.ok) {
      contentEl.innerHTML = `<h2>Deal not found</h2>`;
      return;
    }

    const deal = await res.json();
    console.log("Received Deal Data:", deal); // 👈 THIS IS THE KEY: Check this in your browser console!

    document.getElementById("title").textContent = deal.title || "Shared Project Results";

    // Add a check to make sure deal.results exists before trying to read it
    if (deal.results) {
      contentEl.innerHTML = `
        <div style="border: 1px solid #ccc; padding: 20px; border-radius: 8px; max-width: 400px; background: white;">
          <p><strong>Profit:</strong> ${formatNum(deal.results.profit)}</p>
          <p><strong>Margin:</strong> ${percent(deal.results.margin)}</p>
          <p><strong>ROI:</strong> ${percent(deal.results.roi)}</p>
        </div>
      `;
    } else {
      contentEl.innerHTML = `<h2>Data structure error: No results found.</h2>`;
    }
  } catch (err) {
    console.error("Fetch error:", err);
    contentEl.innerHTML = `<h2>Error connecting to server</h2>`;
  }
}

loadShare();
