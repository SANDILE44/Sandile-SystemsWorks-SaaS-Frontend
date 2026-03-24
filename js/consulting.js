(() => {
  const $ = (id) => document.getElementById(id);

  const money = (v) =>
    'R' +
    (Number(v) || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const percent = (v) => (Number(v) || 0).toFixed(2) + '%';

  const API_BASE = 'https://sandile-systemsworks-saas-backend-2.onrender.com';

  let timer;

  /* =========================
     DEBOUNCE
  ========================= */
  function updateConsulting() {
    clearTimeout(timer);
    timer = setTimeout(runConsulting, 300);
  }

  /* =========================
     COLOR HELPER
  ========================= */
  function applyColor(el, type) {
    if (!el) return;
    el.classList.remove('positive', 'negative', 'caution');
    if (type) el.classList.add(type);
  }

  /* =========================
     MAIN CALCULATION RUNNER
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
        discountPct: +$('consult-discount').value || 0,
        otHours: +$('consult-overtime-hours').value || 0,
        otRate: +$('consult-overtime-rate').value || 0,
        variableCosts: +$('consult-variable-costs').value || 0,
        contingencyPct: +$('consult-contingency').value || 0,
      }),
    });

    if (res.status === 403) return location.replace('payment.html');
    if (!res.ok) return;

    const d = await res.json();

    // ===== UPDATE REVENUE & COSTS =====
    $('consult-revenue').textContent = money(d.totalRevenue);
    $('consult-discount-output').textContent = money(d.discountAmount);
    $('consult-revenue-after-discount').textContent = money(d.revenueAfterDiscount);

    $('consult-expenses-output').textContent = money(d.expenses || 0);
    $('consult-labor-output').textContent = money(d.labor || 0);
    $('consult-fixed-output').textContent = money(d.fixed || 0);

    $('consult-overtime-output').textContent = money(d.overtimeRevenue);
    $('consult-variable-output').textContent = money(d.variableCosts || 0);
    $('consult-contingency-output').textContent = money(d.contingencyAmount);

    $('consult-costs').textContent = money(d.totalCosts);

    // ===== PROFIT =====
    const p = $('consult-profit');
    p.textContent = money(d.profit);
    applyColor(p, d.profit > 0 ? 'positive' : 'negative');

    $('consult-profit-hour').textContent = money(d.profitPerHour);

    // ===== MARGIN =====
    const m = $('consult-margin');
    m.textContent = percent(d.margin);
    if (d.margin < 10) applyColor(m, 'negative');
    else if (d.margin < 20) applyColor(m, 'caution');
    else applyColor(m, 'positive');

    // ===== ROI =====
    const r = $('consult-roi');
    r.textContent = percent(d.roi);
    if (d.roi < 50) applyColor(r, 'negative');
    else if (d.roi < 100) applyColor(r, 'caution');
    else applyColor(r, 'positive');

    // ===== BREAKEVEN HOURS =====
    $('consult-breakeven').textContent = d.breakevenHours.toFixed(2);

    // ===== DECISION & ADVICE =====
    const decisionEl = $('consult-decision');
    const adviceEl = $('consult-advice');
    decisionEl.textContent = d.decision;
    adviceEl.textContent = d.advice;

    // Color code decision based on riskLevel
    switch (d.riskLevel) {
      case 'High':
        applyColor(decisionEl, 'negative');
        break;
      case 'Medium':
        applyColor(decisionEl, 'caution');
        break;
      case 'Low':
        applyColor(decisionEl, 'positive');
        break;
    }
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
  ].forEach((id) => $(id)?.addEventListener('input', updateConsulting));

  /* =========================
     INITIAL RUN
  ========================= */
  runConsulting();
})();