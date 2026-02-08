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
    'fish-catch',
    'fish-price',
    'fish-fuel',
    'fish-labor',
    'fish-equipment',
    'fish-fixed',
  ];

  /* ================= CALCULATION ================= */
  function updateFishing() {
    const catchKg = n(document.getElementById('fish-catch').value);
    const priceKg = n(document.getElementById('fish-price').value);

    const fuel = n(document.getElementById('fish-fuel').value);
    const labor = n(document.getElementById('fish-labor').value);
    const equipment = n(document.getElementById('fish-equipment').value);
    const fixed = n(document.getElementById('fish-fixed').value);

    /* ---------- revenue ---------- */
    const revenue = catchKg * priceKg;

    /* ---------- costs ---------- */
    const totalCosts = fuel + labor + equipment + fixed;

    /* ---------- profit ---------- */
    const profit = revenue - totalCosts;

    const profitPerKg = catchKg ? profit / catchKg : 0;
    const margin = revenue ? (profit / revenue) * 100 : 0;

    const breakevenCatch = priceKg ? totalCosts / priceKg : 0;

    /* projections (simple scaling assumption) */
    const monthlyRevenue = revenue;
    const annualRevenue = revenue * 12;

    /* ================= OUTPUTS ================= */
    document.getElementById('fish-catch-output').textContent =
      catchKg.toLocaleString();

    document.getElementById('fish-revenue').textContent = money(revenue);

    document.getElementById('fish-total-costs').textContent = money(totalCosts);

    document.getElementById('fish-breakeven').textContent =
      breakevenCatch.toFixed(2);

    const profitEl = document.getElementById('fish-profit');
    profitEl.textContent = money(profit);
    profitEl.className =
      'output-value ' + (profit >= 0 ? 'positive' : 'negative');

    document.getElementById('fish-profit-per-kg').textContent =
      money(profitPerKg);

    document.getElementById('fish-margin').textContent = percent(margin);

    document.getElementById('fish-monthly-revenue').textContent =
      money(monthlyRevenue);

    document.getElementById('fish-annual-revenue').textContent =
      money(annualRevenue);
  }

  /* ================= EVENTS ================= */
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateFishing);
  });

  document.getElementById('resetBtn')?.addEventListener('click', () => {
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    updateFishing();
  });

  /* ================= INIT ================= */
  updateFishing();
});
