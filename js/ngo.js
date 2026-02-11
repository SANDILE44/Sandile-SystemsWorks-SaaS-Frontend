(() => {
  const $ = (id) => document.getElementById(id);
  const money = (v) => `R${(Number(v) || 0).toFixed(2)}`;
  const percent = (v) => `${(Number(v) || 0).toFixed(2)}%`;

  let t;
  function update() {
    clearTimeout(t);
    t = setTimeout(run, 300);
  }

  async function run() {
    const res = await fetch(
      `${API_BASE}/api/calculators/ngo/operations`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          donations: +$('ngo-donations').value || 0,
          staff: +$('ngo-staff').value || 0,
          programs: +$('ngo-programs-cost').value || 0,
          fixed: +$('ngo-fixed').value || 0,
          programCount: +$('ngo-program-count').value || 1,
        }),
      }
    );

    if (res.status === 403) return location.replace('payment.html');
    if (!res.ok) return;

    const d = await res.json();

    $('ngo-total-donations').textContent =
      money(d.donations);
    $('ngo-total-costs').textContent =
      money(d.totalCosts);
    $('ngo-funds-remaining').textContent =
      money(d.remaining);
    $('ngo-cost-per-program').textContent =
      money(d.costPerProgram);
    $('ngo-impact-efficiency').textContent =
      percent(d.impactEfficiency);
  }

  document
    .querySelectorAll('input')
    .forEach((i) => i.addEventListener('input', update));
})();
