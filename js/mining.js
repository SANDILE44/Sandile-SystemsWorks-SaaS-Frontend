document.addEventListener('DOMContentLoaded', () => {
  const n = (v) => parseFloat(v) || 0;
  const money = (v) => 'R' + v.toFixed(2);
  const percent = (v) => (v || 0).toFixed(2) + '%';

  const output = document.querySelector('.output-section');

  function calcMining() {
    const tons = n(document.getElementById('mining-production').value);
    const price = n(document.getElementById('mining-price').value);
    const variable = n(document.getElementById('mining-variable').value);
    const labor = n(document.getElementById('mining-labor').value);
    const fixed = n(document.getElementById('mining-fixed').value);

    const revenue = tons * price;
    const costs = tons * variable + labor + fixed;
    const profit = revenue - costs;

    output.innerHTML = `
      <div class="output-group"><div>Total Revenue</div><div>${money(revenue)}</div></div>
      <div class="output-group"><div>Total Costs</div><div>${money(costs)}</div></div>
      <div class="output-group"><div>Profit / Loss</div><div>${money(profit)}</div></div>
      <div class="output-group"><div>Cost Per Ton</div><div>${money(costs / tons || 0)}</div></div>
      <div class="output-group"><div>ROI</div><div>${percent((profit / costs) * 100)}</div></div>
      <div class="output-group"><div>Margin</div><div>${percent((profit / revenue) * 100)}</div></div>
      <div class="output-group"><div>Monthly Profit</div><div>${money(profit)}</div></div>
      <div class="output-group"><div>Annual Profit</div><div>${money(profit * 12)}</div></div>
    `;
  }

  document
    .querySelectorAll('input')
    .forEach((i) => i.addEventListener('input', calcMining));

  document.getElementById('resetBtn').onclick = () => {
    document.querySelectorAll('input').forEach((i) => (i.value = ''));
    calcMining();
  };

  calcMining();
});
