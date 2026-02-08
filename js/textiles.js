document.addEventListener('input', calcTextiles);
document.getElementById('textiles-reset')?.addEventListener('click', reset);

function x(id) {
  return Number(document.getElementById(id)?.value) || 0;
}

function z(id, n) {
  document.getElementById(id).textContent = n.toLocaleString('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  });
}

function calcTextiles() {
  const units = x('textiles-units');
  const price = x('textiles-price');
  const material = x('textiles-material') * units;

  const costs =
    material +
    x('textiles-labor') +
    x('textiles-fixed') +
    x('textiles-operational');

  const revenue = units * price;
  const profit = revenue - costs;

  document.getElementById('textiles-units-output').textContent = units;
  z('textiles-revenue', revenue);
  z('textiles-material-total', material);
  z('textiles-total-costs', costs);
  z('textiles-net-profit', profit);

  document.getElementById('textiles-margin').textContent = revenue
    ? ((profit / revenue) * 100).toFixed(2) + '%'
    : '0%';

  document.getElementById('textiles-roi').textContent = costs
    ? ((profit / costs) * 100).toFixed(2) + '%'
    : '0%';
}

function reset() {
  document.querySelectorAll('input').forEach((i) => (i.value = ''));
  calcTextiles();
}
