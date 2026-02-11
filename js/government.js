(() => {
  const $ = (id) => document.getElementById(id);

  const money = (v) =>
    'R' +
    (Number(v) || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const percent = (v) => (Number(v) || 0).toFixed(2) + '%';

  let t;

  function updateGov() {
    clearTimeout(t);
    t = setTimeout(runGov, 300);
  }

  async function runGov() {
    const token = localStorage.getItem('token');

    const res = await fetch(`${API_BASE}/api/calculators/government/budget`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        budget: +$('gov-budget').value || 0,
        staff: +$('gov-staff').value || 0,
        ops: +$('gov-operations').value || 0,
        infra: +$('gov-infrastructure').value || 0,
        beneficiaries: +$('gov-beneficiaries').value || 0,
      }),
    });

    if (res.status === 403) return location.replace('payment.html');
    if (!res.ok) return;

    const d = await res.json();

    $('gov-total-cost').textContent = money(d.totalCost);

    const b = $('gov-balance');
    b.textContent = money(d.balance);
    b.className = 'output-value ' + (d.balance >= 0 ? 'positive' : 'negative');

    $('gov-per-beneficiary').textContent = money(d.costPerBeneficiary);
    $('gov-utilisation').textContent = percent(d.utilisation);
    $('gov-feasibility').textContent = d.feasibility;
  }

  [
    'gov-budget',
    'gov-staff',
    'gov-operations',
    'gov-infrastructure',
    'gov-beneficiaries',
  ].forEach((id) => $(id)?.addEventListener('input', updateGov));
})();
