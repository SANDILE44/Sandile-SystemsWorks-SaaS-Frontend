(() => {
  const $ = (id) => document.getElementById(id);

  const money = (v) =>
    'R' +
    (Number(v) || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const percent = (v) => (Number(v) || 0).toFixed(2) + '%';

  let timer;

  function updateConstruction() {
    clearTimeout(timer);
    timer = setTimeout(runConstruction, 300);
  }

  async function runConstruction() {
    const token = localStorage.getItem('token');

    const res = await fetch(
      `${API_BASE}/api/calculators/construction/project`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          value: +$('const-value').value || 0,
          material: +$('const-material').value || 0,
          laborMonthly: +$('const-labor').value || 0,
          equipmentMonthly: +$('const-equipment').value || 0,
          fixedMonthly: +$('const-fixed').value || 0,
          months: +$('const-duration').value || 0,
        }),
      }
    );

    if (res.status === 403) return location.replace('payment.html');
    if (!res.ok) return;

    const d = await res.json();

    $('const-project-value').textContent = money(d.value);
    $('const-material-output').textContent = money(d.material);
    $('const-labor-output').textContent = money(d.laborTotal);
    $('const-equipment-output').textContent = money(d.equipmentTotal);
    $('const-fixed-output').textContent = money(d.fixedTotal);
    $('const-total-costs').textContent = money(d.totalCosts);

    const p = $('const-profit');
    p.textContent = money(d.profit);
    p.className = 'output-value ' + (d.profit >= 0 ? 'positive' : 'negative');

    $('const-margin').textContent = percent(d.margin);
    $('const-roi').textContent = percent(d.roi);
    $('const-ratio').textContent = percent(d.costRatio);
    $('const-breakeven').textContent = money(d.breakEvenRevenue);

    $('const-profit-material').textContent = money(d.profitPerMaterial);
    $('const-profit-labor').textContent = money(d.profitPerLabor);
    $('const-profit-equipment').textContent = money(d.profitPerEquipment);

    $('const-monthly-profit').textContent = money(d.monthlyProfit);
    $('const-annual-profit').textContent = money(d.annualProfit);
  }

  [
    'const-value',
    'const-material',
    'const-labor',
    'const-equipment',
    'const-fixed',
    'const-duration',
  ].forEach((id) => $(id)?.addEventListener('input', updateConstruction));
})();
