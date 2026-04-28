(() => {
  const $ = (id) => document.getElementById(id);

  const money = (v) =>
    'R' +
    (Number(v) || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const percent = (v) => (Number(v) || 0).toFixed(2) + '%';

  const API_BASE =
    'https://sandile-systemsworks-saas-backend-2.onrender.com';

  let timer;

  /* =========================
     DEBOUNCE
  ========================= */
  function updateConsulting() {
    clearTimeout(timer);
    timer = setTimeout(runConsulting, 300);
  }

  /* =========================
     MAIN ENGINE
  ========================= */
  async function runConsulting() {
    const token = localStorage.getItem('token');
    if (!token) return location.replace('login.html');

    const res = await fetch(`${API_BASE}/api/calculators/consulting/project`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        hours: +$('consult-hours').value || 0,
        rate: +$('consult-rate').value || 0,
        expenses: +$('consult-expenses').value || 0,
        labor: +$('consult-labor').value || 0,
        fixed: +$('consult-fixed').value || 0,
        discountPct: Number($('consult-discount').value) || 0,
        otHours: +$('consult-overtime-hours').value || 0,
        otRate: +$('consult-overtime-rate').value || 0,
        variableCosts: +$('consult-variable-costs').value || 0,
        contingencyPct: Number($('consult-contingency').value) || 0,
      }),
    });

    if (res.status === 403) return location.replace('payment.html');
    if (!res.ok) return;

    const d = await res.json();

    /* =========================
       REVENUE
    ========================= */
    $('consult-revenue').textContent = money(d.totalRevenue);
    $('consult-revenue-after-discount').textContent = money(d.revenueAfterDiscount);
    $('consult-overtime-output').textContent = money(d.overtimeRevenue);

    /* =========================
       COSTS
    ========================= */
    $('consult-contingency-output').textContent = money(d.contingencyAmount);
    $('consult-cost-hour').textContent = money(d.costPerHour);
    $('consult-costs').textContent = money(d.totalCosts);

    /* =========================
       PROFITABILITY
    ========================= */
    const profitEl = $('consult-profit');
    profitEl.textContent = money(d.profit);
    profitEl.className =
      'output-value ' + (d.profit >= 0 ? 'positive' : 'negative');

    $('consult-profit-hour').textContent = money(d.profitPerHour);
    $('consult-margin').textContent = percent(d.margin);
    $('consult-roi').textContent = percent(d.roi);

    /* =========================
       BREAK-EVEN
    ========================= */
    $('consult-breakeven').textContent = (d.breakevenHours || 0).toFixed(2);

    /* =========================
       DECISION (FIXED TO HTML IDs)
    ========================= */
    const decisionEl = $('consult-decision');
    const adviceEl = $('consult-advice');

    decisionEl.textContent = d.decision || '—';
    adviceEl.textContent = d.advice || '—';

    if (d.riskLevel === 'High') {
      decisionEl.className = 'output-value negative';
      adviceEl.className = 'output-value negative';
    } else if (d.riskLevel === 'Medium') {
      decisionEl.className = 'output-value caution';
      adviceEl.className = 'output-value caution';
    } else {
      decisionEl.className = 'output-value positive';
      adviceEl.className = 'output-value positive';
    }

    /* =========================
       STEPS
    ========================= */
    const stepsEl = $('consult-steps');
    stepsEl.innerHTML = '';

    (d.steps || []).forEach((s, i) => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>Step ${i + 1}</strong> ${s}`;
      stepsEl.appendChild(li);
    });
  }

  /* =========================
     INPUT LISTENERS
  ========================= */
  [
    'consult-hours',
    'consult-rate',
    'consult-expenses',
    'consult-labor',
    'consult-fixed',
    'consult-discount',
    'consult-overtime-hours',
    'consult-overtime-rate',
    'consult-variable-costs',
    'consult-contingency',
  ].forEach((id) =>
    $(id)?.addEventListener('input', updateConsulting)
  );

  /* =========================
     RESET
  ========================= */
  $('resetBtn')?.addEventListener('click', () => {
    [
      'consult-hours',
      'consult-rate',
      'consult-expenses',
      'consult-labor',
      'consult-fixed',
      'consult-discount',
      'consult-overtime-hours',
      'consult-overtime-rate',
      'consult-variable-costs',
      'consult-contingency',
    ].forEach((id) => {
      const el = $(id);
      if (el) el.value = '';
    });

    [
      'consult-revenue',
      'consult-revenue-after-discount',
      'consult-overtime-output',
      'consult-contingency-output',
      'consult-cost-hour',
      'consult-costs',
      'consult-profit',
      'consult-profit-hour',
      'consult-margin',
      'consult-roi',
      'consult-breakeven',
      'consult-decision',
      'consult-advice',
      'consult-steps',
    ].forEach((id) => {
      const el = $(id);
      if (el) el.textContent = '';
    });
  });

  /* =========================
     INIT
  ========================= */
  runConsulting();
})();