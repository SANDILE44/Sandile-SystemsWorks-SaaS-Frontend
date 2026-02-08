document.addEventListener('DOMContentLoaded', () => {
  // ---------- helpers ----------
  const n = (v) => parseFloat(v) || 0;

  const money = (v) =>
    'R' +
    Number(v).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const percent = (v) => Number(v).toFixed(2) + '%';

  // ---------- inputs ----------
  const ids = [
    'const-value',
    'const-material',
    'const-labor',
    'const-equipment',
    'const-fixed',
    'const-duration',
  ];

  // ---------- calculation ----------
  function updateConstruction() {
    const value = n(document.getElementById('const-value').value);
    const material = n(document.getElementById('const-material').value);
    const laborMonthly = n(document.getElementById('const-labor').value);
    const equipmentMonthly = n(
      document.getElementById('const-equipment').value
    );
    const fixedMonthly = n(document.getElementById('const-fixed').value);
    const months = n(document.getElementById('const-duration').value);

    const laborTotal = laborMonthly * months;
    const equipmentTotal = equipmentMonthly * months;
    const fixedTotal = fixedMonthly * months;

    const totalCosts = material + laborTotal + equipmentTotal + fixedTotal;

    const profit = value - totalCosts;

    const margin = value ? (profit / value) * 100 : 0;
    const roi = totalCosts ? (profit / totalCosts) * 100 : 0;
    const costRatio = value ? (totalCosts / value) * 100 : 0;

    const breakEvenRevenue = totalCosts;

    const profitPerMaterial = material ? profit / material : 0;
    const profitPerLabor = laborTotal ? profit / laborTotal : 0;
    const profitPerEquipment = equipmentTotal ? profit / equipmentTotal : 0;

    const monthlyProfit = months > 0 ? profit / months : 0;
    const annualProfit = months > 0 ? monthlyProfit * 12 : 0;

    // ---------- outputs ----------
    document.getElementById('const-project-value').textContent = money(value);
    document.getElementById('const-material-output').textContent =
      money(material);
    document.getElementById('const-labor-output').textContent =
      money(laborTotal);
    document.getElementById('const-equipment-output').textContent =
      money(equipmentTotal);
    document.getElementById('const-fixed-output').textContent =
      money(fixedTotal);
    document.getElementById('const-total-costs').textContent =
      money(totalCosts);

    const profitEl = document.getElementById('const-profit');
    profitEl.textContent = money(profit);
    profitEl.className =
      'output-value ' + (profit >= 0 ? 'positive' : 'negative');

    document.getElementById('const-margin').textContent = percent(margin);
    document.getElementById('const-roi').textContent = percent(roi);
    document.getElementById('const-ratio').textContent = percent(costRatio);

    document.getElementById('const-breakeven').textContent =
      money(breakEvenRevenue);

    document.getElementById('const-profit-material').textContent =
      money(profitPerMaterial);
    document.getElementById('const-profit-labor').textContent =
      money(profitPerLabor);
    document.getElementById('const-profit-equipment').textContent =
      money(profitPerEquipment);

    document.getElementById('const-monthly-profit').textContent =
      money(monthlyProfit);
    document.getElementById('const-annual-profit').textContent =
      money(annualProfit);
  }

  // ---------- events ----------
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateConstruction);
  });

  document.getElementById('resetBtn')?.addEventListener('click', () => {
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    updateConstruction();
  });

  updateConstruction();
});
