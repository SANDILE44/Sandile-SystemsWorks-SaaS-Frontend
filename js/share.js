async function loadShare() {
  const contentEl = document.getElementById("content");
  
  if (!id) {
    contentEl.innerHTML = `<h2 style="color: #ef4444; text-align: center;">No ID provided</h2>`;
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/share/${id}`);
    
    if (!res.ok) {
      contentEl.innerHTML = `<h2 style="color: #ef4444; text-align: center;">Deal not found or expired</h2>`;
      return;
    }

    const deal = await res.json();
    document.getElementById("title").textContent = deal.title || "Project Analysis";

    // --- STYLING UPDATES ---
    // Background: Dark Slate (#1e293b)
    // Width: Tightened to 400px
    let html = `
      <div style="
        background: #1e293b; 
        color: #f8fafc; 
        border: 1px solid #334155; 
        padding: 25px; 
        border-radius: 16px; 
        max-width: 400px; 
        margin: 40px auto; 
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
        font-family: 'Inter', sans-serif;
      ">
        <h3 style="margin-top: 0; color: #3b82f6; border-bottom: 1px solid #334155; padding-bottom: 12px; text-transform: uppercase; font-size: 0.9rem; letter-spacing: 0.1em;">
            ${deal.type} Analysis
        </h3>
        
        <div style="margin: 20px 0;">
            <p style="font-size: 1rem; color: #94a3b8; margin-bottom: 4px;">Net Profit</p>
            <p style="font-size: 2rem; font-weight: bold; margin: 0; color: ${deal.results.profit >= 0 ? '#10b981' : '#ef4444'}">
                 R ${formatNum(deal.results.profit)}
            </p>
            
            <div style="display: flex; gap: 20px; margin-top: 15px;">
                <div>
                    <p style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 2px;">Margin</p>
                    <p style="margin: 0; font-weight: 600;">${percent(deal.results.margin)}</p>
                </div>
                <div>
                    <p style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 2px;">ROI</p>
                    <p style="margin: 0; font-weight: 600;">${percent(deal.results.roi)}</p>
                </div>
            </div>
        </div>
    `;

    // --- SPECIFIC DETAILS BOXES (Styled for Dark Mode) ---
    const detailStyle = `background: #0f172a; padding: 15px; border-radius: 10px; border-left: 4px solid`;

    if (deal.type === "consulting") {
        html += `
            <div style="${detailStyle} #3b82f6;">
                <p style="margin: 0; font-size: 0.85rem;"><strong>Decision:</strong> ${deal.results.status || 'N/A'}</p>
                <p style="font-size: 0.8rem; color: #94a3b8; margin-top: 5px; line-height: 1.4;">${deal.results.action || ''}</p>
            </div>`;
    }

    if (deal.type === "construction") {
        html += `
            <div style="${detailStyle} #f59e0b;">
                <p style="margin: 0; font-size: 0.85rem; color: #94a3b8;">Break-even</p>
                <p style="margin: 0; font-weight: bold;">R ${formatNum(deal.results.breakEven)}</p>
            </div>`;
    }

    if (deal.type === "manufacturing") {
        html += `
            <div style="${detailStyle} #10b981;">
                <p style="margin: 0; font-size: 0.85rem;"><strong>Break-even:</strong> ${deal.results.breakEvenUnits || 0} Units</p>
                <p style="margin: 5px 0 0; font-size: 0.85rem; color: #94a3b8;">Cost/Unit: R ${formatNum(deal.results.costPerUnit)}</p>
            </div>`;
    }

    if (deal.type === "restaurant") {
        html += `
            <div style="${detailStyle} #f43f5e;">
                <p style="margin: 0; font-size: 0.85rem;"><strong>Daily Covers:</strong> ${deal.results.dailyCovers || 0}</p>
                <p style="margin: 5px 0 0; font-size: 0.85rem; color: #94a3b8;">Break-even: ${deal.results.breakEven || deal.results.breakevenCovers || 0}</p>
            </div>`;
    }

    html += `
        <p style="text-align: center; margin-top: 25px; font-size: 0.7rem; color: #475569; border-top: 1px solid #334155; padding-top: 15px;">
            Verified by Sandile SystemsWorks SaaS<br>${new Date().toLocaleDateString()}
        </p>
      </div>
    `;

    contentEl.innerHTML = html;

  } catch (err) {
    console.error("Load Share Error:", err);
    contentEl.innerHTML = `<h2 style="text-align: center; color: white;">Error loading analysis</h2>`;
  }
}
