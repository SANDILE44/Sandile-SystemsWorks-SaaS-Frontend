document.addEventListener('DOMContentLoaded', () => {
  /* ================= HELPERS ================= */
  const n = (v) => parseFloat(v) || 0;

  const money = (v) =>
    'R' +
    Number(v).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const percent = (v) => Number(v).toFixed(2) + '%';

  /* ================= INPUT IDS ================= */
  const ids = [
    'gov-budget',
    'gov-staff',
    'gov-operations',
    'gov-infrastructure',
    'gov-beneficiaries',
  ];

  /* ================= CALCULATION ================= */
  function updateGovernment() {
    const budget = n(document.getElementById('gov-budget').value);
    const staff = n(document.getElementById('gov-staff').value);
    const ops = n(document.getElementById('gov-operations').value);
    const infra = n(document.getElementById('gov-infrastructure').value);
    const beneficiaries = n(document.getElementById('gov-beneficiaries').value);

    /* ---------- costs ---------- */
    const totalCost = staff + ops + infra;

    /* ---------- budget balance ---------- */
    const balance = budget - totalCost;

    /* ---------- utilisation ---------- */
    const utilisation = budget ? (totalCost / budget) * 100 : 0;

    /* ---------- per beneficiary ---------- */
    const costPerBeneficiary = beneficiaries ? totalCost / beneficiaries : 0;

    /* ---------- feasibility ---------- */
    let feasibility = '—';
    if (budget > 0) {
      if (balance >= 0 && utilisation <= 100) {
        feasibility = 'Feasible';
      } else if (utilisation > 100) {
        feasibility = 'Over Budget';
      } else {
        feasibility = 'Needs Review';
      }
    }

    /* ================= OUTPUTS ================= */
    document.getElementById('gov-total-cost').textContent = money(totalCost);

    const balanceEl = document.getElementById('gov-balance');
    balanceEl.textContent = money(balance);
    balanceEl.className =
      'output-value ' + (balance >= 0 ? 'positive' : 'negative');

    document.getElementById('gov-per-beneficiary').textContent =
      money(costPerBeneficiary);

    document.getElementById('gov-utilisation').textContent =
      percent(utilisation);

    document.getElementById('gov-feasibility').textContent = feasibility;
  }

  /* ================= EVENTS ================= */
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateGovernment);
  });

  /* ================= INIT ================= */
  updateGovernment();
});
