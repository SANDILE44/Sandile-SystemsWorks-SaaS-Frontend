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
    contentEl.innerHTML = `<h2 style="color: #ef4444; text-align: center; font-family: sans-serif;">No ID provided</h2>`;
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/share/${id}`);
    
    if (!res.ok) {
      contentEl.innerHTML = `<h2 style="color: #ef4444; text-align: center; font-family: sans-serif;">Analysis not found or expired</h2>`;
      return;
    }

    const deal = await res.json();
    
    document.getElementById("title").textContent = deal.title || "Project Analysis Results";

    // Premium Container with subtle glow and refined borders
    let html = `
      <div style="border: 1px solid rgba(255,255,255,0.1); padding: 40px; border-radius: 16px; max-width: 550px; margin: 40px auto; background: #010433; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.3); font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #ffffff;">
        <h3 style="margin-top: 0; color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.875rem;">
            ${deal.type} Analysis Report
        </h3>
        
        <div style="margin: 32px 0;">
            <p style="font-size: 0.875rem; color: #94a3b8; margin-bottom: 4px; text-transform: uppercase;">Net Profit</p>
            <p style="font-size: 2.5rem; font-weight: 700; margin: 0 0 16px 0; letter-spacing: -0.02em; color: ${deal.results.profit >= 0 ? '#10b981' : '#ef4444'}">
               R ${formatNum(deal.results.profit)}
            </p>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 16px;">
                <div>
                    <p style="color: #64748b; font-size: 0.75rem; text-transform: uppercase; margin: 0;">Margin</p>
                    <p style="font-size: 1.125rem; font-weight: 600; margin: 4px 0;">${percent(deal.results.margin)}</p>
                </div>
                <div>
                    <p style="color: #64748b; font-size: 0.75rem; text-transform: uppercase; margin: 0;">ROI</p>
                    <p style="font-size: 1.125rem; font-weight: 600; margin: 4px 0;">${percent(deal.results.roi)}</p>
                </div>
            </div>
        </div>
    `;

    // Shared styling for specific info boxes
    const boxStyle = `background: rgba(255,255,255,0.03); padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);`;

    if (deal.type === "consulting") {
        html += `
            <div style="${boxStyle} border-left: 4px solid #3b82f6;">
                <p style="margin: 0 0 8px 0; color: #3b82f6; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Final Decision</p>
                <p style="margin: 0; font-size: 1.125rem; font-weight: 500;">${deal.results.status || 'N/A'}</p>
                <p style="font-size: 0.9rem; color: #94a3b8; margin: 8px 0 0 0; line-height: 1.5;">${deal.results.action || ''}</p>
            </div>
        `;
    }

    if (deal.type === "construction") {
      const r = deal.results;
      html += `
        <div style="${boxStyle} border-left: 4px solid #f59e0b;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
             <div>
                <p style="margin: 0; color: #f59e0b; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Risk Status</p>
                <p style="margin: 4px 0 0 0; font-size: 1.125rem; font-weight: 500;">${r.status || "N/A"}</p>
             </div>
             <div style="text-align: right;">
                <p style="margin: 0; color: #64748b; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Risk Level</p>
                <p style="margin: 4px 0 0 0; font-size: 1rem;">${r.riskLevel}</p>
             </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.9rem;">
             <p style="margin:0;">Break-even: <span style="color:#cbd5e1;">R ${formatNum(r.breakEvenValue)}</span></p>
             <p style="margin:0;">Costs: <span style="color:#cbd5e1;">R ${formatNum(r.totalCosts)}</span></p>
             <p style="margin:0;">Monthly: <span style="color:#cbd5e1;">R ${formatNum(r.monthlyProfit)}</span></p>
             <p style="margin:0;">Annual: <span style="color:#cbd5e1;">R ${formatNum(r.annualProfit)}</span></p>
          </div>

          <p style="font-size:0.85rem; color:#94a3b8; margin-top:15px; padding-top:15px; border-top:1px solid rgba(255,255,255,0.05); line-height: 1.5;">
            ${r.advice || ""}
          </p>
        </div>
      `;
    }

    if (deal.type === "manufacturing") {
        html += `
            <div style="${boxStyle} border-left: 4px solid #10b981;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 15px;">
                    <div>
                        <p style="margin: 0; color: #10b981; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">BEP Units</p>
                        <p style="margin: 4px 0 0 0; font-size: 1.125rem;">${deal.results.breakEvenUnits || 0}</p>
                    </div>
                    <div>
                        <p style="margin: 0; color: #10b981; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Unit Cost</p>
                        <p style="margin: 4px 0 0 0; font-size: 1.125rem;">R ${formatNum(deal.results.costPerUnit)}</p>
                    </div>
                </div>
                <p style="margin: 0; font-size: 1rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 12px;">${deal.results.status || 'N/A'}</p>
                <p style="font-size: 0.85rem; color: #94a3b8; margin-top: 4px;">${deal.results.action || ''}</p>
            </div>
        `;
    }

    if (deal.type === "restaurant") {
        html += `
            <div style="${boxStyle} border-left: 4px solid #f43f5e;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 15px;">
                    <div>
                        <p style="margin: 0; color: #f43f5e; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Daily Covers</p>
                        <p style="margin: 4px 0 0 0; font-size: 1.125rem;">${deal.results.dailyCovers || 0}</p>
                    </div>
                    <div>
                        <p style="margin: 0; color: #f43f5e; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Breakeven</p>
                        <p style="margin: 4px 0 0 0; font-size: 1.125rem;">${deal.results.breakEven || deal.results.breakevenCovers || 0}</p>
                    </div>
                </div>
                <p style="margin: 0; font-size: 1rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 12px;">${deal.results.status || 'N/A'}</p>
                <p style="font-size: 0.85rem; color: #94a3b8; margin-top: 4px;">${deal.results.action || ''}</p>
            </div>
        `;
    }

    html += `
        <p style="text-align: center; margin-top: 40px; font-size: 0.7rem; color: #475569; letter-spacing: 0.05em; text-transform: uppercase;">
            Sandile SystemsWorks SaaS &bull; ${new Date().toLocaleDateString()}
        </p>
      </div>
    `;

    contentEl.innerHTML = html;

  } catch (err) {
    console.error("Load Share Error:", err);
    contentEl.innerHTML = `<h2 style="text-align: center; color: #ffffff; font-family: sans-serif;">System Error</h2>`;
  }
}

loadShare();
