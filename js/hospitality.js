document.addEventListener('DOMContentLoaded', () => {
  const n = (v) => parseFloat(v) || 0;
  const money = (v) => 'R' + v.toFixed(2);
  const percent = (v) => v.toFixed(2) + '%';

  function calc() {
    const rooms = n(document.getElementById('hotel-rooms').value);
    const occ = n(document.getElementById('hotel-occupancy').value) / 100;
    const price = n(document.getElementById('hotel-price').value);
    const variable = n(document.getElementById('hotel-variable').value);
    const labor = n(document.getElementById('hotel-labor').value);
    const fixed = n(document.getElementById('hotel-fixed').value);

    const occupiedNights = rooms * occ * 30;
    const revenue = occupiedNights * price;
    const variableCosts = occupiedNights * variable;
    const totalCosts = variableCosts + labor + fixed;
    const profit = revenue - totalCosts;

    document.getElementById('hotel-occupied').textContent =
      occupiedNights.toFixed(0);
    document.getElementById('hotel-revenue').textContent = money(revenue);
    document.getElementById('hotel-total-costs').textContent =
      money(totalCosts);
    document.getElementById('hotel-profit').textContent = money(profit);
    document.getElementById('hotel-per-room').textContent = money(
      revenue / rooms || 0
    );
    document.getElementById('hotel-cost-per-room').textContent = money(
      totalCosts / rooms || 0
    );
    document.getElementById('hotel-margin').textContent = percent(
      (profit / revenue) * 100 || 0
    );
    document.getElementById('hotel-roi').textContent = percent(
      (profit / totalCosts) * 100 || 0
    );
  }

  document
    .querySelectorAll('input')
    .forEach((i) => i.addEventListener('input', calc));
  document.getElementById('resetBtn').onclick = () => {
    document.querySelectorAll('input').forEach((i) => (i.value = ''));
    calc();
  };

  calc();
});
