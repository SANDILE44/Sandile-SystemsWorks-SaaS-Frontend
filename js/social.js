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
      `${API_BASE}/api/calculators/social/enterprise`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          participants: +$('participants').value || 0,
          fee: +$('fee').value || 0,
          staff: +$('staff').value || 0,
          supplies: +$('supplies').value || 0,
          operational: +$('operational').value || 0,
        }),
      }
    );

    if (res.status === 403) return location.replace('payment.html');
    if (!res.ok) return;

    const d = await res.json();

    $('total-participants').textContent =
      d.participants;
    $('total-revenue').textContent =
      money(d.revenue);
    $('total-costs').textContent =
      money(d.totalCosts);
    $('net-impact').textContent =
      money(d.netImpact);
    $('profit-margin').textContent =
      percent(d.margin);
    $('roi').textContent =
      percent(d.roi);
  }

  document
    .querySelectorAll('input')
    .forEach((i) => i.addEventListener('input', update));
})();
