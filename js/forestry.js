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
    'forestry-volume',
    'forestry-price',
    'forestry-labor',
    'forestry-equipment',
    'forestry-replanting',
    'forestry-fixed',
    'forestry-months',
  ];

  /* ================= CALCULATION ================= */
  function updateForestry() {
    const volume = n(document.getElementById('forestry-volume').value);
    const price = n(document.getElementById('forestry-price').value);

    const labor = n(document.getElementById('forestry-labor').value);
    const equipment = n(document.getElementById('forestry-equipment').value);
    const replanting = n(document.getElementById('forestry-replanting').value);
    const fixed = n(document.getElementById('forestry-fixed').value);
    const months = Math.max(
      1,
      n(document.getElementById('forestry-months').value)
    );

    /* ---------- revenue ---------- */
    const revenue = volume * price;

    /* ---------- costs ---------- */
    const totalCosts = labor + equipment + replanting + fixed;

    /* ---------- profit ---------- */
    const profit = revenue - totalCosts;

    const profitPerUnit = volume ? profit / volume : 0;
    const margin = revenue ? (profit / revenue) * 100 : 0;
    const roi = totalCosts ? (profit / totalCosts) * 100 : 0;

    const breakevenVolume = price ? totalCosts / price : 0;

    /* multi-harvest / annualized */
    const annualProfit = profit * months;

    /* ================= OUTPUTS ================= */
    document.getElementById('forestry-volume-output').textContent =
      volume.toLocaleString() + ' m³';

    document.getElementById('forestry-revenue').textContent = money(revenue);

    document.getElementById('forestry-total-costs').textContent =
      money(totalCosts);

    const profitEl = document.getElementById('forestry-profit');
    profitEl.textContent = money(profit);
    profitEl.className =
      'output-value ' + (profit >= 0 ? 'positive' : 'negative');

    document.getElementById('forestry-profit-per-unit').textContent =
      money(profitPerUnit);

    document.getElementById('forestry-margin').textContent = percent(margin);

    document.getElementById('forestry-breakeven').textContent =
      breakevenVolume.toFixed(2) + ' m³';

    document.getElementById('forestry-roi').textContent = percent(roi);

    document.getElementById('forestry-annual-profit').textContent =
      money(annualProfit);
  }

  /* ================= EVENTS ================= */
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateForestry);
  });

  document.getElementById('resetBtn')?.addEventListener('click', () => {
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });

    // default harvest cycle
    const monthsEl = document.getElementById('forestry-months');
    if (monthsEl) monthsEl.value = 1;

    updateForestry();
  });

  /* ================= INIT ================= */
  updateForestry();
});
