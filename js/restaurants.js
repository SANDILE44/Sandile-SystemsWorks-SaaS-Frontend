(() => {

const $ = id => document.getElementById(id);

/* ================= API ================= */
async function api(url, method = "GET", body = null) {
  const token = localStorage.getItem("token");
  if (!token) return location.replace("login.html");

  try {
    const res = await fetch(`${API_BASE}${url}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: body ? JSON.stringify(body) : null
    });

    if (res.status === 401) {
      localStorage.removeItem("token");
      return location.replace("login.html");
    }

    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }

  } catch (err) {
    console.error("SavedDeals API error:", err);
    return null;
  }
}

/* ================= SAVE ================= */
async function saveDeal(type, data) {
  return await api("/api/saved-deals", "POST", {
    type,
    inputs: data.inputs,
    results: data.results
  });
}

/* ================= LOAD ================= */
async function loadDeals() {
  return await api("/api/saved-deals");
}

/* ================= RENDER ================= */
function renderDeals(deals) {

  const container = $("savedDealsContainer");
  if (!container) {
    console.error("Missing savedDealsContainer");
    return;
  }

  if (!deals || !deals.length) {
    container.innerHTML = "<p>No saved deals yet.</p>";
    return;
  }

  container.innerHTML = deals.map(d => `
    <div class="deal-card">

      <div class="deal-title">
        ${d.type?.toUpperCase() || "UNKNOWN"} -
        ${new Date(d.createdAt).toLocaleDateString()}
      </div>

      <div class="deal-body">
        <div><strong>Profit:</strong> ${d.results?.profit ?? 0}</div>
        <div><strong>Revenue:</strong> ${d.results?.monthlyRevenue ?? 0}</div>
        <div><strong>Margin:</strong> ${d.results?.margin ?? 0}%</div>
      </div>

      <button onclick="SavedDeals.deleteDeal('${d._id}')" class="delete-btn">
        Delete
      </button>

    </div>
  `).join("");
}

/* ================= DELETE ================= */
async function deleteDeal(id) {
  await api(`/api/saved-deals/${id}`, "DELETE");
  initSavedDeals();
}

/* ================= INIT ================= */
async function initSavedDeals() {
  const deals = await loadDeals();
  renderDeals(deals);
}

/* ================= EXPORT ================= */
window.SavedDeals = {
  saveDeal,
  initSavedDeals,
  deleteDeal
};

/* AUTO LOAD */
initSavedDeals();

})();
