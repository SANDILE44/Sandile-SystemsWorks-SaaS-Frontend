document.addEventListener('DOMContentLoaded', () => {
  // ---------------- HELPERS ----------------
  const num = (v) => parseFloat(v) || 0;

  const money = (v) =>
    'R' +
    Number(v).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const percent = (v) => Number(v).toFixed(2) + '%';

  // ---------------- INPUTS ----------------
  const inputs = [
    'vehicle-units',
    'vehicle-cost',
    'vehicle-price',
    'vehicle-fixed',
    'vehicle-labor',
    'vehicle-operational',
  ];

  // ---------------- UPDATE FUNCTION ----------------
  function updateVehicle() {
    const units = num(document.getElementById('vehicle-units').value);
    const costPerUnit = num(document.getElementById('vehicle-cost').value);
    const pricePerUnit = num(document.getElementById('vehicle-price').value);
    const fixed = num(document.getElementById('vehicle-fixed').value);
    const labor = num(document.getElementById('vehicle-labor').value);
    const operational = num(
      document.getElementById('vehicle-operational').value
    );

    // Core calculations
    const revenue = units * pricePerUnit;
    const cogs = units * costPerUnit;
    const grossProfit = revenue - cogs;
    const totalCosts = cogs + fixed + labor + operational;
    const netProfit = revenue - totalCosts;

    // Ratios
    const margin = revenue ? (netProfit / revenue) * 100 : 0;
    const markup = cogs ? (grossProfit / cogs) * 100 : 0;
    const roi = totalCosts ? (netProfit / totalCosts) * 100 : 0;

    // Break-even
    const contributionPerUnit = pricePerUnit - costPerUnit;
    const breakevenUnits =
      contributionPerUnit > 0
        ? (fixed + labor + operational) / contributionPerUnit
        : 0;

    // Projections
    const monthlyRevenue = revenue;
    const annualRevenue = revenue * 12;
    const annualProfit = netProfit * 12;

    // Extra metrics
    const revenuePerUnit = units ? revenue / units : 0;
    const costContribution = revenue ? (totalCosts / revenue) * 100 : 0;

    // ---------------- OUTPUTS ----------------
    document.getElementById('vehicle-units-output').textContent = units;

    document.getElementById('vehicle-revenue').textContent = money(revenue);
    document.getElementById('vehicle-cogs').textContent = money(cogs);
    document.getElementById('vehicle-gross').textContent = money(grossProfit);
    document.getElementById('vehicle-total-costs').textContent =
      money(totalCosts);

    const profitEl = document.getElementById('vehicle-profit');
    profitEl.textContent = money(netProfit);
    profitEl.className =
      'output-value ' + (netProfit >= 0 ? 'positive' : 'negative');

    document.getElementById('vehicle-margin').textContent = percent(margin);
    document.getElementById('vehicle-markup').textContent = percent(markup);
    document.getElementById('vehicle-roi').textContent = percent(roi);

    document.getElementById('vehicle-breakeven').textContent =
      breakevenUnits.toFixed(2);

    document.getElementById('vehicle-revenue-unit').textContent =
      money(revenuePerUnit);

    document.getElementById('vehicle-cost-contribution').textContent =
      percent(costContribution);

    document.getElementById('vehicle-monthly-revenue').textContent =
      money(monthlyRevenue);

    document.getElementById('vehicle-annual-revenue').textContent =
      money(annualRevenue);

    document.getElementById('vehicle-annual-profit').textContent =
      money(annualProfit);
  }

  // ---------------- EVENTS ----------------
  inputs.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateVehicle);
  });

  // Reset button
  document.querySelectorAll('.reset-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      inputs.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      updateVehicle();
    });
  });

  // Init
  updateVehicle();
});
