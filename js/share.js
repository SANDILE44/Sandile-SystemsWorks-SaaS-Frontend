function renderDeal(deal) {
  const contentEl = document.getElementById("content");
  
  contentEl.innerHTML = `
    <div class="data-grid">
      <div class="data-card">
        <span class="label">Project Margin</span>
        <span class="value" style="color: var(--accent)">${percent(deal.results.margin)}</span>
      </div>
      <div class="data-card">
        <span class="label">Net Profit</span>
        <span class="value" style="color: #22c55e">R${formatNum(deal.results.profit)}</span>
      </div>
    </div>
    
    <div class="decision-panel" style="background: rgba(0, 180, 216, 0.1); border: 1px solid var(--accent); color: var(--accent);">
       ${deal.results.decision}
       <p style="font-size: 0.85rem; font-weight: 400; margin-top: 10px; color: var(--text-main)">
         "${deal.results.advice}"
       </p>
    </div>
  `;
}
