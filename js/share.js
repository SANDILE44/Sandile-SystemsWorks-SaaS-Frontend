// 1. Point to your backend
const API_BASE = "https://sandile-systemsworks-saas-backend-2.onrender.com";

// 2. Helper functions (Must be at the top)
const formatNum = (num) => {
    return new Intl.NumberFormat('en-ZA', { minimumFractionDigits: 2 }).format(num || 0);
};

const percent = (num) => {
    return (num || 0).toFixed(2) + '%';
};

// 3. The Main Loader
async function loadShare() {
    const contentEl = document.getElementById("content");
    const titleEl = document.getElementById("title");
    
    // Get ID from URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        contentEl.innerHTML = "<p style='color:red;'>Error: No ID found in link.</p>";
        return;
    }

    try {
        // Fetch from Render
        const response = await fetch(`${API_BASE}/api/share/${id}`);
        
        if (!response.ok) {
            contentEl.innerHTML = "<p>Project data not found. It may have expired.</p>";
            return;
        }

        const deal = await response.json();
        
        // Handle data structure safely
        const data = deal.results || deal;

        // Update the Page Title
        titleEl.textContent = deal.title || "Project Analysis";

        // INJECT THE THEMED BOX (Dark background, visible numbers)
        contentEl.innerHTML = `
            <div style="background: #0f172a; border: 1px solid rgba(255,255,255,0.1); padding: 2rem; border-radius: 20px;">
                
                <div style="display: flex; justify-content: space-between; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px;">
                    <span style="color: #94a3b8; font-weight: 600;">Net Profit</span>
                    <span style="color: #22c55e; font-weight: 800; font-size: 1.4rem;">R ${formatNum(data.profit)}</span>
                </div>

                <div style="display: flex; justify-content: space-between; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px;">
                    <span style="color: #94a3b8; font-weight: 600;">Margin</span>
                    <span style="color: #00b4d8; font-weight: 800; font-size: 1.4rem;">${percent(data.margin)}</span>
                </div>

                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #94a3b8; font-weight: 600;">ROI</span>
                    <span style="color: #ffffff; font-weight: 800; font-size: 1.4rem;">${percent(data.roi)}</span>
                </div>

            </div>

            <div style="margin-top: 20px; background: rgba(0, 180, 216, 0.1); border: 1px solid #00b4d8; padding: 20px; border-radius: 16px; text-align: center;">
                <h3 style="color: #00b4d8; margin: 0; text-transform: uppercase; font-size: 1rem;">${data.decision || 'Analysis Complete'}</h3>
                <p style="color: #e5e7eb; margin-top: 10px; font-style: italic; font-size: 0.9rem;">"${data.advice || 'Proceed with calculated caution.'}"</p>
            </div>
        `;

    } catch (error) {
        console.error("Error loading deal:", error);
        contentEl.innerHTML = "<p>Connection error. Please refresh the page.</p>";
    }
}

// 4. Run it!
loadShare();
