document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('rd-cost')) return;

  const n = (id) => parseFloat(document.getElementById(id)?.value) || 0;
  const money = (v) => `R${v.toFixed(2)}`;
  const percent = (v) => `${v.toFixed(2)}%`;

  function calc() {
    const cost = n('rd-cost');
    const years = n('rd-years');
    const revenue = n('rd-revenue');
    const operating = n('rd-operating');

    const annualProfit = revenue - operating;
    const netGain = annualProfit * years - cost;

    document.getElementById('rd-profit').textContent = money(annualProfit);
    document.getElementById('rd-monthly').textContent = money(
      annualProfit / 12
    );
    document.getElementById('rd-net').textContent = money(netGain);
    document.getElementById('rd-annualized').textContent = money(
      netGain / (years || 1)
    );
    document.getElementById('rd-roi').textContent = percent(
      cost ? (netGain / cost) * 100 : 0
    );
    document.getElementById('rd-payback').textContent =
      annualProfit > 0 ? (cost / annualProfit).toFixed(1) : '—';
  }

  document
    .querySelectorAll('input')
    .forEach((i) => i.addEventListener('input', calc));

  calc();
});
