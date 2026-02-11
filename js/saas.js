(() => {
  const $ = (id) => document.getElementById(id);
  const money = (v) =>
    v.toLocaleString('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    });
  const percent = (v) => `${(Number(v) || 0).toFixed(2)}%`;

  let t;
  const update = () => {
    clearTimeout(t);
    t = setTimeout(run, 300);
  };

  async function run() {
    const res = await fetch(
      `${API_BASE}/api/calculators/saas/business`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          mrr: +$('saas-mrr').value || 0,
          churnPct: +$('saas-churn').value || 0,
          dev: +$('saas-dev').value || 0,
          infra: +$('saas-infrastructure').value || 0,
          support: +$('saas-support').value || 0,
          marketing: +$('saas-marketing').value || 0,
        }),
      }
    );

    if (res.status === 403) return location.replace('payment.html');
    if (!res.ok) return;

    const d = await res.json();

    $('saas-mrr-output').textContent = money(d.mrr);
    $('saas-net-mrr').textContent = money(d.netMRR);
    $('saas-churn-impact').textContent = money(d.churnLoss);
    $('saas-total-costs').textContent = money(d.totalCosts);
    $('saas-profit').textContent = money(d.profit);
    $('saas-margin').textContent = percent(d.margin);
    $('saas-roi').textContent = percent(d.roi);
    $('saas-runway').textContent =
      d.runway !== null ? d.runway : '∞';
  }

  document
    .querySelectorAll('input')
    .forEach((i) => i.addEventListener('input', update));
})();
