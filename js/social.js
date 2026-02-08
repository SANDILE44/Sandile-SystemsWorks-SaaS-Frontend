document.addEventListener('input', calcSocial);

function num(id) {
  return Number(document.getElementById(id)?.value) || 0;
}

function out(id, n) {
  document.getElementById(id).textContent = n.toLocaleString('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  });
}

function calcSocial() {
  const people = num('participants');
  const revenue = people * num('fee');
  const costs = num('staff') + num('supplies') + num('operational');
  const profit = revenue - costs;

  document.getElementById('total-participants').textContent = people;
  out('total-revenue', revenue);
  out('total-costs', costs);
  out('net-impact', profit);

  document.getElementById('profit-margin').textContent = revenue
    ? ((profit / revenue) * 100).toFixed(2) + '%'
    : '0%';

  document.getElementById('roi').textContent = costs
    ? ((profit / costs) * 100).toFixed(2) + '%'
    : '0%';
}
