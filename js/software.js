document.addEventListener('input', calcSoftware);
document.getElementById('resetBtn')?.addEventListener('click', reset);

function v(id) {
  return Number(document.getElementById(id)?.value) || 0;
}

function money(id, n) {
  document.getElementById(id).textContent = n.toLocaleString('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  });
}

function percent(id, n) {
  document.getElementById(id).textContent = n.toFixed(2) + '%';
}

function calcSoftware() {
  const units = v('software-units');
  const price = v('software-price');

  const revenue = units * price;
  const costs =
    v('software-dev-cost') + v('software-labor') + v('software-operational');

  const profit = revenue - costs;

  document.getElementById('software-units-output').textContent = units;
  money('software-revenue', revenue);
  money('software-total-costs', costs);
  money('software-net-profit', profit);

  percent('software-margin', revenue ? (profit / revenue) * 100 : 0);
  percent('software-roi', costs ? (profit / costs) * 100 : 0);
}

function reset() {
  document.querySelectorAll('input').forEach((i) => (i.value = ''));
  calcSoftware();
}
