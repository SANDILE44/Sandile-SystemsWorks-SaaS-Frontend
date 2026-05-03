function renderDeal(deal) {
  const contentEl = document.getElementById("content");
  
  // We force a Dark Background for the data box to match your 'SystemsWorks' theme
  contentEl.innerHTML = `
    <div style="background: #0f172a; padding: 25px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
      
      <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px;">
        <span style="color: #94a3b8; font-weight: 600;">Net Profit</span>
        <span style="color: #22c55e; font-size: 1.5rem; font-weight: 800;">R ${formatNum(deal.results.profit)}</span>
      </div>

      <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px;">
        <span style="color: #94a3b8; font-weight: 600;">Margin</span>
        <span style="color: #00b4d8; font-size: 1.5rem; font-weight: 800;">${percent(deal.results.margin)}</span>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="color: #94a3b8; font-weight: 600;">ROI</span>
        <span style="color: #ffffff; font-size: 1.5rem; font-weight: 800;">${percent(deal.results.roi)}</span>
      </div>

    </div>

    <!-- The Decision Box -->
    <div style="margin-top: 20px; padding: 20px; background: rgba(0, 180, 216, 0.1); border: 1px solid #00b4d8; border-radius: 16px; text-align: center;">
      <h3 style="color: #00b4d8; margin: 0; font-size: 1.2rem; text-transform: uppercase;">${deal.results.decision}</h3>
      <p style="color: #e5e7eb; margin-top: 10px; font-style: italic;">"${deal.results.advice}"</p>
    </div>
  `;
}
