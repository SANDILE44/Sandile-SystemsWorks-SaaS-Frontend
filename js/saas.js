document.addEventListener('input', calcSaaS);
document.getElementById('resetBtn')?.addEventListener('click', reset);

function n(id) {
  return Number(document.getElementById(id)?.value) || 0;
}

function set(id, v) {
  document.getElementById(id).textContent =
    typeof v === 'number'
      ? v.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })
      : v;
}

function setP(id, v) {
  document.getElementById(id).textContent = v.toFixed(2) + '%';
}

function calcSaaS() {
  const mrr = n('saas-mrr');
  const churn = n('saas-churn') / 100;

  const costs =
    n('saas-dev') +
    n('saas-infrastructure') +
    n('saas-support') +
    n('saas-marketing');

  const churnLoss = mrr * churn;
  const netMrr = mrr - churnLoss;
  const profit = netMrr - costs;

  set('saas-mrr-output', mrr);
  set('saas-net-mrr', netMrr);
  set('saas-churn-impact', churnLoss);
  set('saas-total-costs', costs);
  set('saas-profit', profit);

  setP('saas-margin', mrr ? (profit / mrr) * 100 : 0);
  setP('saas-roi', costs ? (profit / costs) * 100 : 0);
  document.getElementById('saas-runway').textContent =
    profit < 0 && costs ? Math.floor(mrr / costs) : 0;
}

function reset() {
  document.querySelectorAll('input').forEach((i) => (i.value = ''));
  calcSaaS();
}
