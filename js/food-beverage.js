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
    'fb-units',
    'fb-price',
    'fb-ingredients',
    'fb-labor',
    'fb-equipment',
    'fb-fixed',
  ];

  /* ================= CALCULATION ================= */
  function updateFoodBeverage() {
    const units = n(document.getElementById('fb-units').value);
    const price = n(document.getElementById('fb-price').value);

    const ingredients = n(document.getElementById('fb-ingredients').value);
    const labor = n(document.getElementById('fb-labor').value);
    const equipment = n(document.getElementById('fb-equipment').value);
    const fixed = n(document.getElementById('fb-fixed').value);

    /* ---------- revenue ---------- */
    const revenue = units * price;

    /* ---------- costs ---------- */
    const totalCosts = ingredients + labor + equipment + fixed;

    /* ---------- profit ---------- */
    const profit = revenue - totalCosts;

    const profitPerUnit = units ? profit / units : 0;
    const margin = revenue ? (profit / revenue) * 100 : 0;
    const revenuePerUnit = units ? revenue / units : 0;

    /* projections */
    const monthlyRevenue = revenue;
    const annualRevenue = revenue * 12;
    const annualProfit = profit * 12;

    /* ================= OUTPUTS ================= */
    document.getElementById('fb-units-output').textContent =
      units.toLocaleString();

    document.getElementById('fb-revenue').textContent = money(revenue);

    document.getElementById('fb-total-costs').textContent = money(totalCosts);

    const profitEl = document.getElementById('fb-profit');
    profitEl.textContent = money(profit);
    profitEl.className =
      'output-value ' + (profit >= 0 ? 'positive' : 'negative');

    document.getElementById('fb-profit-per-unit').textContent =
      money(profitPerUnit);

    document.getElementById('fb-margin').textContent = percent(margin);

    document.getElementById('fb-revenue-unit').textContent =
      money(revenuePerUnit);

    document.getElementById('fb-monthly-revenue').textContent =
      money(monthlyRevenue);

    document.getElementById('fb-annual-revenue').textContent =
      money(annualRevenue);

    document.getElementById('fb-annual-profit').textContent =
      money(annualProfit);
  }

  /* ================= EVENTS ================= */
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateFoodBeverage);
  });

  document.getElementById('fb-reset')?.addEventListener('click', () => {
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    updateFoodBeverage();
  });

  /* ================= INIT ================= */
  updateFoodBeverage();
});
