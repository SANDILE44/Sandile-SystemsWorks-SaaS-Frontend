const API_BASE = "https://sandile-systemsworks-saas-backend-2.onrender.com";

const formatNum = (num) => {
    return new Intl.NumberFormat('en-ZA', { minimumFractionDigits: 2 }).format(num || 0);
};

const percent = (num) => {
    return (num || 0).toFixed(2) + '%';
};

async function loadShare() {
    const contentEl = document.getElementById("content");
    const titleEl = document.getElementById("title");
    
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        contentEl.innerHTML = "<p style='color:red; text-align:center;'>Error: No ID found</p>";
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/share/${id}`);
        if (!response.ok) {
            contentEl.innerHTML = "<p style='text-align:center;'>Project not found.</p>";
            return;
        }

        const deal = await response.json();
        const data = deal.results || deal;

        // 1. Update the Header Title
        titleEl.textContent = deal.title || "Project Analysis";

        // 2. Inject using YOUR EXACT CSS CLASSES from share.html
        contentEl.innerHTML = `
            <div class="data-grid">
                <div class="data-card">
                    <span class="label">Net Profit</span>
                    <span class="value" style="color: #22c55e;">R ${formatNum(data.profit)}</span>
                </div>
                
                <div class="data-card">
                    <span class="label">Margin</span>
                    <span class="value" style="color: var(--accent);">${percent(data.margin)}</span>
                </div>

                <div class="data-card">
                    <span class="label">ROI</span>
                    <span class="value" style="color: #ffffff;">${percent(data.roi)}</span>
                </div>
            </div>

            <div class="decision-panel" style="background: rgba(0, 180, 216, 0.08); border: 1px solid rgba(0, 180, 216, 0.2); color: var(--accent);">
                <div style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 5px; opacity: 0.8;">Decision Engine</div>
                <div style="font-size: 1.3rem; font-weight: 800;">${data.decision || 'Complete'}</div>
                <p style="color: var(--text-muted); font-weight: 400; font-style: italic; margin-top: 10px; font-size: 0.85rem;">
                    "${data.advice || 'Analysis complete.'}"
                </p>
            </div>
        `;

    } catch (error) {
        console.error("Error:", error);
        contentEl.innerHTML = "<p style='text-align:center;'>Connection error. Please refresh.</p>";
    }
}

loadShare();
