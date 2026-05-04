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
    
    // Set Page Title
    document.getElementById("title").textContent = deal.title || "Project Analysis Results";

    // Standard styling for the shared card
    let html = `
      <div style="border: 1px solid #ddd; padding: 30px; border-radius: 12px; max-width: 500px; margin: 40px auto; background: #010433; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
        <h3 style="margin-top: 0; color: #1e293b; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em;">
            ${deal.type} Analysis
        </h3>
        
        <div style="margin: 24px 0;">
            <p style="font-size: 1.25rem; margin-bottom: 8px;"><strong>Net Profit:</strong> 
               <span style="color: ${deal.results.profit >= 0 ? '#10b981' : '#ef4444'}">
                 R ${formatNum(deal.results.profit)}
               </span>
            </p>
            <p style="color: #475569; margin: 4px 0;"><strong>Profit Margin:</strong> ${percent(deal.results.margin)}</p>
            <p style="color: #475569; margin: 4px 0;"><strong>ROI:</strong> ${percent(deal.results.roi)}</p>
        </div>
    `;

    // --- CONSULTING SPECIFIC ---
    if (deal.type === "consulting") {
        html += `
            <div style="background: #010433; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <p style="margin-top: 0;"><strong>Decision:</strong> ${deal.results.status || 'N/A'}</p>
                <p style="font-size: 0.9rem; color: #64748b; margin-bottom: 0;">${deal.results.action || ''}</p>
            </div>
        `;
    }

 if (deal.type === "construction") {

  const r = deal.results;

  html += `
    <div style="background:#010433; padding:15px; border-radius:8px; border-left:4px solid #f59e0b;">

      <p><strong>Decision:</strong> ${r.decision-status}</p>
      <p><strong>Risk Level:</strong> ${r.riskLevel}</p>

      <hr style="margin:10px 0; border:0; border-top:1px solid #1e293b;">

      <p><strong>Break-even:</strong> R ${formatNum(r.breakEvenValue)}</p>
      <p><strong>Total Costs:</strong> R ${formatNum(r.totalCosts)}</p>

      <p><strong>Monthly Profit:</strong> R ${formatNum(r.monthlyProfit)}</p>
      <p><strong>Annual Profit:</strong> R ${formatNum(r.annualProfit)}</p>

      <hr style="margin:10px 0; border:0; border-top:1px solid #1e293b;">

      <p style="font-size:0.9rem; color:#94a3b8;">
        ${r.advice || ""}
      </p>

    </div>
  `;
}

    // --- MANUFACTURING SPECIFIC ---
    if (deal.type === "manufacturing") {
        html += `
            <div style="background: #010433; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981;">
                <p style="margin-top: 0;"><strong>Break-even Units:</strong> ${deal.results.breakEvenUnits || 0}</p>
                <p style="margin-bottom: 10px;"><strong>Cost per Unit:</strong> R ${formatNum(deal.results.costPerUnit)}</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 10px 0;">
                <p style="margin-bottom: 4px;"><strong>Status:</strong> ${deal.results.status || 'N/A'}</p>
                <p style="font-size: 0.9rem; color: #64748b; margin-bottom: 0;">${deal.results.action || ''}</p>
            </div>
        `;
    }

    // --- RESTAURANT SPECIFIC ---
    if (deal.type === "restaurant") {
        html += `
            <div style="background: #010433; padding: 15px; border-radius: 8px; border-left: 4px solid #f43f5e;">
                <p style="margin-top: 0;"><strong>Daily Covers:</strong> ${deal.results.dailyCovers || 0}</p>
                <p><strong>Breakeven Covers:</strong> ${deal.results.breakEven || deal.results.breakevenCovers || 0}</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 10px 0;">
                <p style="margin-bottom: 4px;"><strong>Decision:</strong> ${deal.results.status || 'N/A'}</p>
                <p style="font-size: 0.9rem; color: #64748b; margin-bottom: 0;">${deal.results.action || ''}</p>
            </div>
        `;
    }

    html += `
        <p style="text-align: center; margin-top: 30px; font-size: 0.75rem; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 15px;">
            Generated by Sandile SystemsWorks SaaS • ${new Date().toLocaleDateString()}
        </p>
      </div>
    `;

    contentEl.innerHTML = html;

  } catch (err) {
    console.error("Load Share Error:", err);
    contentEl.innerHTML = `<h2 style="text-align: center;">Error loading shared data</h2>`;
  }
}

loadShare();
