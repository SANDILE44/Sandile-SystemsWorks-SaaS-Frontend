(() => {
  const $ = (id) => document.getElementById(id);

  const money = (v) =>
    v.toLocaleString('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    });

  const percent = (v) => (Number(v) || 0).toFixed(2) + '%';

  let t;
  function updateMarketing() {
    clearTimeout(t);
    t = setTimeout(runMarketing, 300);
  }

  async function runMarketing() {
    const res = await fetch(`${API_BASE}/api/calculators/marketing/campaign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        campaigns: +$('marketing-campaigns').value || 0,
        budget: +$('marketing-budget').value || 0,
        revenue: +$('marketing-revenue').value || 0,
        staff: +$('marketing-staff').value || 0,
        fixed: +$('marketing-fixed').value || 0,
        variable: +$('marketing-variable').value || 0,
      }),
    });

    if (res.status === 403) return location.replace('payment.html');
    if (!res.ok) return;

    const d = await res.json();

    $('marketing-total-revenue').textContent = money(d.revenue);
    $('marketing-total-costs').textContent = money(d.totalCosts);

    const p = $('marketing-profit');
    p.textContent = money(d.profit);
    p.classList.remove('profit-positive', 'profit-negative');
    if (d.profit > 0) p.classList.add('profit-positive');
    if (d.profit < 0) p.classList.add('profit-negative');

    $('marketing-revenue-per-campaign').textContent = money(
      d.revenuePerCampaign
    );
    $('marketing-cost-per-campaign').textContent = money(d.costPerCampaign);

    $('marketing-roi').textContent = percent(d.roi);
    $('marketing-margin').textContent = percent(d.margin);
  }

  document
    .querySelectorAll('.input-section input')
    .forEach((i) => i.addEventListener('input', updateMarketing));
})();
