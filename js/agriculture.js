(() => {
  const $ = (id) => document.getElementById(id);

  /* ---------- HELPERS ---------- */
  function formatCurrency(value) {
    return (
      'R' +
      (Number(value) || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }

  function formatPercentage(value) {
    return (Number(value) || 0).toFixed(2) + '%';
  }

  function setProfit(el, value) {
    if (!el) return;
    el.textContent = formatCurrency(value);
    el.className = 'output-value ' + (value >= 0 ? 'positive' : 'negative');
  }

  /* ---------- FARM ---------- */
  let farmTimer;

  function updateFarm() {
    clearTimeout(farmTimer);
    farmTimer = setTimeout(runFarm, 300);
  }

  async function runFarm() {
    const token = localStorage.getItem('token');

    const res = await fetch(`${API_BASE}/api/calculators/agriculture/farm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        acreage: +$('farm-acreage').value || 0,
        yieldPerAcre: +$('farm-yield').value || 0,
        price: +$('farm-price').value || 0,
        fixed: +$('farm-fixed').value || 0,
        variable: +$('farm-variable').value || 0,
        labor: +$('farm-labor').value || 0,
        months: +$('farm-months').value || 1,
      }),
    });

    if (res.status === 403) return window.location.replace('payment.html');
    if (!res.ok) return;

    const d = await res.json();

    $('farm-yield-output').textContent = d.totalYield.toFixed(2);
    $('farm-revenue').textContent = formatCurrency(d.revenue);
    $('farm-total-costs').textContent = formatCurrency(d.totalCosts);
    setProfit($('farm-profit'), d.profit);
    $('farm-roi').textContent = formatPercentage(d.roi);
    $('farm-margin').textContent = formatPercentage(d.margin);
    $('farm-breakeven').textContent = d.breakeven.toFixed(2);
    $('farm-cost-per-acre').textContent = formatCurrency(d.costPerAcre);
  }

  /* ---------- LIVESTOCK ---------- */
  let livestockTimer;

  function updateLivestock() {
    clearTimeout(livestockTimer);
    livestockTimer = setTimeout(runLivestock, 300);
  }

  async function runLivestock() {
    const token = localStorage.getItem('token');

    const res = await fetch(
      `${API_BASE}/api/calculators/agriculture/livestock`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          count: +$('livestock-count').value || 0,
          price: +$('livestock-price').value || 0,
          feed: +$('livestock-feed').value || 0,
          health: +$('livestock-health').value || 0,
          fixed: +$('livestock-fixed').value || 0,
          labor: +$('livestock-labor').value || 0,
          months: +$('livestock-months').value || 1,
          mortality: +$('livestock-mortality').value || 0,
        }),
      }
    );

    if (res.status === 403) return window.location.replace('payment.html');
    if (!res.ok) return;

    const d = await res.json();

    $('livestock-revenue').textContent = formatCurrency(d.revenue);
    $('livestock-costs').textContent = formatCurrency(d.totalCosts);
    setProfit($('livestock-profit'), d.profit);
    $('livestock-per-animal').textContent = formatCurrency(d.costPerAnimal);
    $('livestock-profit-per-animal').textContent = formatCurrency(
      d.profitPerAnimal
    );
    $('livestock-roi').textContent = formatPercentage(d.roi);
    $('livestock-margin').textContent = formatPercentage(d.margin);
  }

  /* ---------- INPUT LISTENERS ---------- */
  [
    'farm-acreage',
    'farm-yield',
    'farm-price',
    'farm-fixed',
    'farm-variable',
    'farm-labor',
    'farm-months',
  ].forEach((id) => $(id)?.addEventListener('input', updateFarm));

  [
    'livestock-count',
    'livestock-price',
    'livestock-feed',
    'livestock-health',
    'livestock-fixed',
    'livestock-labor',
    'livestock-months',
    'livestock-mortality',
  ].forEach((id) => $(id)?.addEventListener('input', updateLivestock));
})();
