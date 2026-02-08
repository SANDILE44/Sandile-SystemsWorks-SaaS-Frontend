document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('property-cost');
  if (!root) return;

  const n = (id) => parseFloat(document.getElementById(id)?.value) || 0;
  const money = (v) => `R${v.toFixed(2)}`;
  const percent = (v) => `${v.toFixed(2)}%`;

  function calc() {
    const cost = n('property-cost');
    const rent = n('property-rent');
    const expenses = n('property-expenses');
    const vacancy = n('property-vacancy') / 100;
    const years = n('property-years');

    const annualIncome = rent * 12 * (1 - vacancy);
    const annualExpenses = expenses * 12;
    const totalIncome = annualIncome * years;
    const totalExpenses = annualExpenses * years;
    const profit = totalIncome - totalExpenses;

    document.getElementById('property-annual-income').textContent =
      money(annualIncome);
    document.getElementById('property-total-income').textContent =
      money(totalIncome);
    document.getElementById('property-total-expenses').textContent =
      money(totalExpenses);
    document.getElementById('property-profit').textContent = money(profit);
    document.getElementById('property-profit-per-r').textContent = money(
      cost ? profit / cost : 0
    );
    document.getElementById('property-roi').textContent = percent(
      cost ? (profit / cost) * 100 : 0
    );
    document.getElementById('property-margin').textContent = percent(
      totalIncome ? (profit / totalIncome) * 100 : 0
    );
    document.getElementById('property-monthly-profit').textContent = money(
      annualIncome / 12 - annualExpenses / 12
    );
    document.getElementById('property-annual-profit').textContent = money(
      annualIncome - annualExpenses
    );
  }

  document
    .querySelectorAll('input')
    .forEach((i) => i.addEventListener('input', calc));

  document.getElementById('resetBtn')?.addEventListener('click', () => {
    document.querySelectorAll('input').forEach((i) => (i.value = ''));
    calc();
  });

  calc();
});
