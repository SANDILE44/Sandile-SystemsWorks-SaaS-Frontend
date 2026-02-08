document.addEventListener('DOMContentLoaded', () => {
  const donationsEl = document.getElementById('ngo-donations');
  if (!donationsEl) return;

  const n = (id) => parseFloat(document.getElementById(id)?.value) || 0;
  const money = (v) => `R${v.toFixed(2)}`;
  const percent = (v) => `${v.toFixed(2)}%`;

  function calculate() {
    const donations = n('ngo-donations');
    const staff = n('ngo-staff');
    const programs = n('ngo-programs-cost');
    const fixed = n('ngo-fixed');
    const count = n('ngo-program-count') || 1;

    const totalCosts = staff + programs + fixed;
    const remaining = donations - totalCosts;

    document.getElementById('ngo-total-donations').textContent =
      money(donations);
    document.getElementById('ngo-total-costs').textContent = money(totalCosts);
    document.getElementById('ngo-funds-remaining').textContent =
      money(remaining);
    document.getElementById('ngo-cost-per-program').textContent = money(
      programs / count
    );
    document.getElementById('ngo-impact-efficiency').textContent = percent(
      donations ? (programs / donations) * 100 : 0
    );
  }

  document
    .querySelectorAll('input')
    .forEach((i) => i.addEventListener('input', calculate));

  calculate();
});
