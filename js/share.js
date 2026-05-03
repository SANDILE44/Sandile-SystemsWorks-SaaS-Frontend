function renderDeal(deal) {
  const contentEl = document.getElementById("content");
  const titleEl = document.getElementById("title");

  // 1. Update the Header Title
  titleEl.textContent = deal.title || "Project Insight Report";

  // 2. Use the CLASSES defined in your HTML <style> tag
  // This ensures the numbers are visible and themed correctly
  contentEl.innerHTML = `
    <div class="data-grid">
      <div class="data-card">
        <span class="label">Net Profit</span>
        <span class="value" style="color: #22c55e;">R ${formatNum(deal.results.profit)}</span>
      </div>
      
      <div class="data-card">
        <span class="label">Margin</span>
        <span class="value" style="color: var(--accent);">${percent(deal.results.margin)}</span>
      </div>

      <div class="data-card">
        <span class="label">ROI</span>
        <span class="value" style="color: #ffffff;">${percent(deal.results.roi)}</span>
      </div>
    </div>

    <div class="decision-panel" style="background: rgba(0, 180, 216, 0.1); border: 1px solid var(--accent); color: var(--accent);">
      <div style="text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.8rem; margin-bottom: 5px;">Decision Engine Result</div>
      <div style="font-size: 1.4rem;">${deal.results.decision}</div>
      <p style="color: var(--text-main); font-weight: 400; font-style: italic; margin-top: 10px; font-size: 0.9rem;">
        "${deal.results.advice}"
      </p>
    </div>
  `;
}
