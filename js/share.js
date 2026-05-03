const API_BASE = "https://sandile-systemsworks-saas-backend-2.onrender.com";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

async function loadShare() {
  if (!id) return;

  const res = await fetch(`${API_BASE}/api/shared-deals/${id}`);
  if (!res.ok) return;

  const deal = await res.json();

  document.getElementById("title").textContent =
    deal.meta?.title || "Shared Deal";

  renderDeal(deal);
}

function renderDeal(deal) {
  const el = document.getElementById("content");

  if (deal.type === "construction") {
    el.innerHTML = `
      <h2>Construction</h2>
      <div>Profit: ${deal.results.profit}</div>
      <div>Margin: ${deal.results.margin}%</div>
      <div>ROI: ${deal.results.roi}%</div>
    `;
  }

  // future:
  // if (deal.type === "manufacturing") ...
  // if (deal.type === "restaurant") ...
}

loadShare();
