// js/industry-agriculture.js
(() => {
  const $ = (id) => document.getElementById(id);

  // ---------------- HELPERS ----------------
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

  // ---------------- FARM CALCULATOR ----------------
  function updateFarm() {
    const acreage = +$('farm-acreage')?.value || 0;
    const yieldPerAcre = +$('farm-yield')?.value || 0;
    const price = +$('farm-price')?.value || 0;
    const fixed = +$('farm-fixed')?.value || 0;
    const variable = +$('farm-variable')?.value || 0;
    const labor = +$('farm-labor')?.value || 0;
    const months = +$('farm-months')?.value || 1;

    const totalYield = acreage * yieldPerAcre * months;
    const revenue = totalYield * price;
    const variableCosts = variable * acreage * months;
    const totalCosts = fixed + variableCosts + labor;
    const profit = revenue - totalCosts;

    $('farm-yield-output').textContent = totalYield.toFixed(2);
    $('farm-revenue').textContent = formatCurrency(revenue);
    $('farm-total-costs').textContent = formatCurrency(totalCosts);
    setProfit($('farm-profit'), profit);

    $('farm-roi').textContent = formatPercentage(
      totalCosts ? (profit / totalCosts) * 100 : 0
    );

    $('farm-margin').textContent = formatPercentage(
      revenue ? (profit / revenue) * 100 : 0
    );

    $('farm-breakeven').textContent = price
      ? (totalCosts / price).toFixed(2)
      : '0';

    $('farm-cost-per-acre').textContent = formatCurrency(
      acreage ? totalCosts / (acreage * months) : 0
    );
  }

  // ---------------- LIVESTOCK CALCULATOR ----------------
  function updateLivestock() {
    const count = +$('livestock-count')?.value || 0;
    const price = +$('livestock-price')?.value || 0;
    const feed = +$('livestock-feed')?.value || 0;
    const health = +$('livestock-health')?.value || 0;
    const fixed = +$('livestock-fixed')?.value || 0;
    const labor = +$('livestock-labor')?.value || 0;
    const months = +$('livestock-months')?.value || 1;
    const mortality = +$('livestock-mortality')?.value || 0;

    const adjustedCount = count * (1 - mortality / 100);
    const revenue = adjustedCount * price;
    const variableCosts = adjustedCount * (feed + health) * months;
    const totalCosts = variableCosts + fixed + labor;
    const profit = revenue - totalCosts;

    $('livestock-revenue').textContent = formatCurrency(revenue);
    $('livestock-costs').textContent = formatCurrency(totalCosts);
    setProfit($('livestock-profit'), profit);

    $('livestock-per-animal').textContent = formatCurrency(
      adjustedCount ? totalCosts / adjustedCount : 0
    );

    $('livestock-profit-per-animal').textContent = formatCurrency(
      adjustedCount ? profit / adjustedCount : 0
    );

    $('livestock-roi').textContent = formatPercentage(
      totalCosts ? (profit / totalCosts) * 100 : 0
    );

    $('livestock-margin').textContent = formatPercentage(
      revenue ? (profit / revenue) * 100 : 0
    );
  }

  // ---------------- INPUT LISTENERS ----------------
  const farmInputs = [
    'farm-acreage',
    'farm-yield',
    'farm-price',
    'farm-fixed',
    'farm-variable',
    'farm-labor',
    'farm-months',
  ];

  const livestockInputs = [
    'livestock-count',
    'livestock-price',
    'livestock-feed',
    'livestock-health',
    'livestock-fixed',
    'livestock-labor',
    'livestock-months',
    'livestock-mortality',
  ];

  farmInputs.forEach((id) => $(id)?.addEventListener('input', updateFarm));

  livestockInputs.forEach((id) =>
    $(id)?.addEventListener('input', updateLivestock)
  );

  // ---------------- RESET BUTTONS ----------------
  document.querySelectorAll('.resetBtn').forEach((btn) => {
    btn.addEventListener('click', () => {
      [...farmInputs, ...livestockInputs].forEach((id) => {
        if ($(id)) $(id).value = '';
      });
      updateFarm();
      updateLivestock();
    });
  });

  // ---------------- INIT ----------------
  updateFarm();
  updateLivestock();
})();
