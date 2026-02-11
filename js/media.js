(() => {
  const $ = (id) => document.getElementById(id);

  const money = (v) => 'R' + (Number(v) || 0).toFixed(2);
  const percent = (v) => (Number(v) || 0).toFixed(2) + '%';

  let t;
  function updateMedia() {
    clearTimeout(t);
    t = setTimeout(runMedia, 300);
  }

  async function runMedia() {
    const res = await fetch(`${API_BASE}/api/calculators/media/business`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        content: +$('media-content').value || 0,
        adRevenue: +$('media-ad-revenue').value || 0,
        subscriptions: +$('media-subscriptions').value || 0,
        staff: +$('media-staff').value || 0,
        fixed: +$('media-fixed').value || 0,
        variable: +$('media-variable').value || 0,
      }),
    });

    if (res.status === 403) return location.replace('payment.html');
    if (!res.ok) return;

    const d = await res.json();

    $('media-revenue').textContent = money(d.revenue);
    $('media-total-costs').textContent = money(d.totalCosts);
    $('media-profit').textContent = money(d.profit);

    $('media-revenue-per-content').textContent = money(d.revenuePerContent);
    $('media-cost-per-content').textContent = money(d.costPerContent);

    $('media-roi').textContent = percent(d.roi);
    $('media-margin').textContent = percent(d.margin);

    $('media-breakeven').textContent = d.breakeven;
    $('media-monthly').textContent = money(d.monthlyProfit);
    $('media-annual').textContent = money(d.annualProfit);
  }

  document
    .querySelectorAll('input')
    .forEach((i) => i.addEventListener('input', updateMedia));
})();
