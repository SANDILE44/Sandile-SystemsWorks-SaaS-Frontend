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
    'consult-hours',
    'consult-rate',
    'consult-expenses',
    'consult-labor',
    'consult-fixed',
    'consult-discount',
    'consult-overtime-hours',
    'consult-overtime-rate',
    'consult-variable-costs',
    'consult-contingency',
  ];

  /* ================= CALCULATION ================= */
  function updateConsulting() {
    const hours = n(document.getElementById('consult-hours').value);
    const rate = n(document.getElementById('consult-rate').value);
    const expenses = n(document.getElementById('consult-expenses').value);
    const labor = n(document.getElementById('consult-labor').value);
    const fixed = n(document.getElementById('consult-fixed').value);
    const discountPct = n(document.getElementById('consult-discount').value);
    const otHours = n(document.getElementById('consult-overtime-hours').value);
    const otRate = n(document.getElementById('consult-overtime-rate').value);
    const variableCosts = n(
      document.getElementById('consult-variable-costs').value
    );
    const contingencyPct = n(
      document.getElementById('consult-contingency').value
    );

    /* ---------- revenue ---------- */
    const baseRevenue = hours * rate;
    const overtimeRevenue = otHours * otRate;
    const totalRevenue = baseRevenue + overtimeRevenue;

    const discountAmount = totalRevenue * (discountPct / 100);
    const revenueAfterDiscount = totalRevenue - discountAmount;

    /* ---------- costs ---------- */
    const contingencyAmount =
      (expenses + labor + fixed + variableCosts) * (contingencyPct / 100);

    const totalCosts =
      expenses + labor + fixed + variableCosts + contingencyAmount;

    /* ---------- profit ---------- */
    const profit = revenueAfterDiscount - totalCosts;
    const profitPerHour = hours > 0 ? profit / hours : 0;

    const margin = revenueAfterDiscount
      ? (profit / revenueAfterDiscount) * 100
      : 0;

    const roi = totalCosts ? (profit / totalCosts) * 100 : 0;

    const breakevenHours = rate > 0 ? totalCosts / rate : 0;

    /* ================= OUTPUTS ================= */
    document.getElementById('consult-revenue').textContent =
      money(totalRevenue);

    document.getElementById('consult-discount-output').textContent =
      money(discountAmount);

    document.getElementById('consult-revenue-after-discount').textContent =
      money(revenueAfterDiscount);

    document.getElementById('consult-expenses-output').textContent =
      money(expenses);

    document.getElementById('consult-labor-output').textContent = money(labor);

    document.getElementById('consult-fixed-output').textContent = money(fixed);

    document.getElementById('consult-overtime-output').textContent =
      money(overtimeRevenue);

    document.getElementById('consult-variable-output').textContent =
      money(variableCosts);

    document.getElementById('consult-contingency-output').textContent =
      money(contingencyAmount);

    document.getElementById('consult-costs').textContent = money(totalCosts);

    const profitEl = document.getElementById('consult-profit');
    profitEl.textContent = money(profit);
    profitEl.className =
      'output-value ' + (profit >= 0 ? 'positive' : 'negative');

    document.getElementById('consult-profit-hour').textContent =
      money(profitPerHour);

    document.getElementById('consult-margin').textContent = percent(margin);

    document.getElementById('consult-roi').textContent = percent(roi);

    document.getElementById('consult-breakeven').textContent =
      breakevenHours.toFixed(2);
  }

  /* ================= EVENTS ================= */
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateConsulting);
  });

  document.getElementById('resetBtn')?.addEventListener('click', () => {
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    updateConsulting();
  });

  /* ================= INIT ================= */
  updateConsulting();
});
