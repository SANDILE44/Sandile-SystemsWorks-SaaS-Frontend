document.addEventListener('input', calcTelecom);

function g(id) {
  return Number(document.getElementById(id)?.value) || 0;
}

function r(id, n) {
  document.getElementById(id).textContent = n.toLocaleString('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  });
}

function calcTelecom() {
  const subs = g('telecom-subscribers');
  const price = g('telecom-price');

  const revenue = subs * price;
  const costs =
    g('telecom-infra') + g('telecom-labor') + g('telecom-operational');

  const profit = revenue - costs;

  document.getElementById('telecom-subscribers-output').textContent = subs;
  r('telecom-revenue', revenue);
  r('telecom-total-costs', costs);
  r('telecom-net-profit', profit);
  r('telecom-monthly', profit);
  r('telecom-annualized', profit * 12);

  document.getElementById('telecom-margin').textContent = revenue
    ? ((profit / revenue) * 100).toFixed(2) + '%'
    : '0%';

  document.getElementById('telecom-roi').textContent = costs
    ? ((profit / costs) * 100).toFixed(2) + '%'
    : '0%';
}
