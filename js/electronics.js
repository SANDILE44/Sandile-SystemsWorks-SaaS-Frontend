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
    'elec-units',
    'elec-cost',
    'elec-price',
    'elec-fixed',
    'elec-labor',
    'elec-operational',
  ];

  /* ================= CALCULATION ================= */
  function updateElectronics() {
    const units = n(document.getElementById('elec-units').value);
    const costPerUnit = n(document.getElementById('elec-cost').value);
    const pricePerUnit = n(document.getElementById('elec-price').value);

    const fixed = n(document.getElementById('elec-fixed').value);
    const labor = n(document.getElementById('elec-labor').value);
    const operational = n(document.getElementById('elec-operational').value);

    /* ---------- revenue ---------- */
    const revenue = units * pricePerUnit;

    /* ---------- costs ---------- */
    const cogs = units * costPerUnit;
    const totalCosts = cogs + fixed + labor + operational;

    /* ---------- profit ---------- */
    const profit = revenue - totalCosts;

    const margin = revenue ? (profit / revenue) * 100 : 0;
    const roi = totalCosts ? (profit / totalCosts) * 100 : 0;
    const markup = cogs ? ((revenue - cogs) / cogs) * 100 : 0;

    const revenuePerUnit = units ? revenue / units : 0;
    const costContribution = revenue ? (totalCosts / revenue) * 100 : 0;

    /* projections (simple scale assumption) */
    const monthlyRevenue = revenue;
    const annualRevenue = revenue * 12;
    const annualProfit = profit * 12;

    /* ================= OUTPUTS ================= */
    document.getElementById('elec-units-output').textContent =
      units.toLocaleString();

    document.getElementById('elec-revenue').textContent = money(revenue);

    document.getElementById('elec-cogs').textContent = money(cogs);

    document.getElementById('elec-total-costs').textContent = money(totalCosts);

    const profitEl = document.getElementById('elec-profit');
    profitEl.textContent = money(profit);
    profitEl.className =
      'output-value ' + (profit >= 0 ? 'positive' : 'negative');

    document.getElementById('elec-margin').textContent = percent(margin);

    document.getElementById('elec-roi').textContent = percent(roi);

    document.getElementById('elec-markup').textContent = percent(markup);

    document.getElementById('elec-revenue-unit').textContent =
      money(revenuePerUnit);

    document.getElementById('elec-cost-contribution').textContent =
      percent(costContribution);

    document.getElementById('elec-monthly-revenue').textContent =
      money(monthlyRevenue);

    document.getElementById('elec-annual-revenue').textContent =
      money(annualRevenue);

    document.getElementById('elec-annual-profit').textContent =
      money(annualProfit);
  }

  /* ================= EVENTS ================= */
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateElectronics);
  });

  document.getElementById('elec-reset')?.addEventListener('click', () => {
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    updateElectronics();
  });

  /* ================= INIT ================= */
  updateElectronics();
});
