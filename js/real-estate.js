(() => {
  const $ = (id) => document.getElementById(id);
  const money = (v) => `R${(Number(v) || 0).toFixed(2)}`;
  const percent = (v) => `${(Number(v) || 0).toFixed(2)}%`;

  let t;
  function update() {
    clearTimeout(t);
    t = setTimeout(run, 300);
  }

  async function run() {
    const res = await fetch(`${API_BASE}/api/calculators/property/investment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        cost: +$('property-cost').value || 0,
        rent: +$('property-rent').value || 0,
        expenses: +$('property-expenses').value || 0,
        vacancyPct: +$('property-vacancy').value || 0,
        years: +$('property-years').value || 0,
      }),
    });

    if (res.status === 403) return location.replace('payment.html');
    if (!res.ok) return;

    const d = await res.json();

    $('property-annual-income').textContent = money(d.annualIncome);
    $('property-total-income').textContent = money(d.totalIncome);
    $('property-total-expenses').textContent = money(d.totalExpenses);
    $('property-profit').textContent = money(d.profit);
    $('property-roi').textContent = percent(d.roi);
    $('property-margin').textContent = percent(d.margin);
    $('property-monthly-profit').textContent = money(d.monthlyProfit);
    $('property-annual-profit').textContent = money(d.annualProfit);
  }

  document
    .querySelectorAll('input')
    .forEach((i) => i.addEventListener('input', update));

  update();
})();
