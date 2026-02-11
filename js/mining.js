(() => {
  const $ = (id) => document.getElementById(id);

  const money = (v) => 'R' + (Number(v) || 0).toFixed(2);
  const percent = (v) => (Number(v) || 0).toFixed(2) + '%';

  let t;
  function updateMining() {
    clearTimeout(t);
    t = setTimeout(runMining, 300);
  }

  async function runMining() {
    const res = await fetch(`${API_BASE}/api/calculators/mining/business`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        tons: +$('mining-production').value || 0,
        price: +$('mining-price').value || 0,
        variable: +$('mining-variable').value || 0,
        labor: +$('mining-labor').value || 0,
        fixed: +$('mining-fixed').value || 0,
      }),
    });

    if (res.status === 403) return location.replace('payment.html');
    if (!res.ok) return;

    const d = await res.json();

    const out = document.querySelector('.output-section');
    if (!out) return;

    out.innerHTML = `
      <div class="output-group"><div>Total Revenue</div><div>${money(d.revenue)}</div></div>
      <div class="output-group"><div>Total Costs</div><div>${money(d.totalCosts)}</div></div>
      <div class="output-group"><div>Profit / Loss</div><div>${money(d.profit)}</div></div>
      <div class="output-group"><div>Cost Per Ton</div><div>${money(d.costPerTon)}</div></div>
      <div class="output-group"><div>ROI</div><div>${percent(d.roi)}</div></div>
      <div class="output-group"><div>Margin</div><div>${percent(d.margin)}</div></div>
      <div class="output-group"><div>Monthly Profit</div><div>${money(d.monthlyProfit)}</div></div>
      <div class="output-group"><div>Annual Profit</div><div>${money(d.annualProfit)}</div></div>
    `;
  }

  document
    .querySelectorAll('input')
    .forEach((i) => i.addEventListener('input', updateMining));
})();
