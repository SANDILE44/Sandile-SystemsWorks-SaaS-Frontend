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
        contentEl.innerHTML = "<p style='color:red;'>Error: No ID found</p>";
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/share/${id}`);
        if (!response.ok) {
            contentEl.innerHTML = "<p>Project not found.</p>";
            return;
        }

        const deal = await response.json();
        const data = deal.results || deal;

        titleEl.textContent = deal.title || "Project Analysis";

        // THE COMPACT "BOX" UI
        contentEl.innerHTML = `
            <div style="max-width: 450px; margin: 0 auto;">
                
                <!-- Main Stats Box -->
                <div style="background: #0f172a; border: 1px solid rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px;">
                        <span style="color: #94a3b8; font-size: 0.85rem; font-weight: 600; text-transform: uppercase;">Net Profit</span>
                        <span style="color: #22c55e; font-weight: 800; font-size: 1.25rem;">R ${formatNum(data.profit)}</span>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px;">
                        <span style="color: #94a3b8; font-size: 0.85rem; font-weight: 600; text-transform: uppercase;">Margin</span>
                        <span style="color: #00b4d8; font-weight: 800; font-size: 1.25rem;">${percent(data.margin)}</span>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #94a3b8; font-size: 0.85rem; font-weight: 600; text-transform: uppercase;">ROI</span>
                        <span style="color: #ffffff; font-weight: 800; font-size: 1.25rem;">${percent(data.roi)}</span>
                    </div>

                </div>

                <!-- Decision Badge -->
                <div style="margin-top: 15px; background: rgba(0, 180, 216, 0.08); border: 1px solid rgba(0, 180, 216, 0.3); padding: 15px; border-radius: 16px; text-align: center;">
                    <div style="color: #00b4d8; font-weight: 800; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em;">
                        ${data.decision || 'Final Recommendation'}
                    </div>
                    <p style="color: #94a3b8; margin-top: 8px; font-size: 0.85rem; line-height: 1.4; font-style: italic;">
                        "${data.advice || 'Analysis complete.'}"
                    </p>
                </div>

            </div>
        `;

    } catch (error) {
        console.error("Error:", error);
        contentEl.innerHTML = "<p>Connection error. Refreshing might help.</p>";
    }
}

loadShare();
