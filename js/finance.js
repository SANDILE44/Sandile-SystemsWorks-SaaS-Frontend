document.addEventListener('DOMContentLoaded', () => {
  /* ================= HELPERS ================= */
  const n = (v) => parseFloat(v) || 0;

  const money = (v) =>
    'R' +
    Number(v).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const percent = (v) => Number(v).toFixed(2) + '%';

  /* ================= INPUT IDS ================= */
  const ids = [
    'fin-clients',
    'fin-fee',
    'fin-staff',
    'fin-technology',
    'fin-fixed',
    'fin-operational',
  ];

  /* ================= CALCULATION ================= */
  function updateFinance() {
    const clients = n(document.getElementById('fin-clients').value);
    const fee = n(document.getElementById('fin-fee').value);

    const staff = n(document.getElementById('fin-staff').value);
    const technology = n(document.getElementById('fin-technology').value);
    const fixed = n(document.getElementById('fin-fixed').value);
    const operational = n(document.getElementById('fin-operational').value);

    /* ---------- revenue ---------- */
    const revenue = clients * fee;

    /* ---------- costs ---------- */
    const totalCosts = staff + technology + fixed + operational;

    /* ---------- profit ---------- */
    const profit = revenue - totalCosts;

    const profitPerClient = clients ? profit / clients : 0;
    const costPerClient = clients ? totalCosts / clients : 0;

    const margin = revenue ? (profit / revenue) * 100 : 0;
    const roi = totalCosts ? (profit / totalCosts) * 100 : 0;

    /* ================= OUTPUTS ================= */
    document.getElementById('fin-clients-output').textContent =
      clients.toLocaleString();

    document.getElementById('fin-revenue').textContent = money(revenue);

    document.getElementById('fin-total-costs').textContent = money(totalCosts);

    const profitEl = document.getElementById('fin-profit');
    profitEl.textContent = money(profit);
    profitEl.className =
      'output-value ' + (profit >= 0 ? 'positive' : 'negative');

    document.getElementById('fin-per-client').textContent =
      money(profitPerClient);

    document.getElementById('fin-cost-per-client').textContent =
      money(costPerClient);

    document.getElementById('fin-roi').textContent = percent(roi);

    document.getElementById('fin-margin').textContent = percent(margin);
  }

  /* ================= EVENTS ================= */
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateFinance);
  });

  document.getElementById('resetBtn')?.addEventListener('click', () => {
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    updateFinance();
  });

  /* ================= INIT ================= */
  updateFinance();
});
