function clampPercent(value, min = 0, max = 100) {
  value = Number(value) || 0;
  return Math.min(Math.max(value, min), max);
}

(() => {
  const $ = (id) => document.getElementById(id);

  const money = (v) =>
  (Number(v) || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const percent = (v) => (Number(v) || 0).toFixed(2) + "%";

  const API_BASE =
    "https://sandile-systemsworks-saas-backend-2.onrender.com";

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
    el.classList.remove("positive", "negative", "caution");
    if (type) el.classList.add(type);
  }

  /* =========================
     MAIN CALCULATION
  ========================= */
  async function runConsulting() {
    const token = localStorage.getItem("token");
    if (!token) return location.replace("login.html");

    const res = await fetch(
      `${API_BASE}/api/calculators/consulting/project`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hours: +$("consult-hours").value || 0,
          rate: +$("consult-rate").value || 0,
          expenses: +$("consult-expenses").value || 0,
          labor: +$("consult-labor").value || 0,
          fixed: +$("consult-fixed").value || 0,
          discountPct: clampPercent($("consult-discount").value, 0, 100),
          otHours: +$("consult-overtime-hours").value || 0,
          otRate: +$("consult-overtime-rate").value || 0,
          variableCosts: +$("consult-variable-costs").value || 0,
          contingencyPct: clampPercent($("consult-contingency").value, 0, 50),
        }),
      }
    );

    if (res.status === 403) return location.replace("payment.html");
    if (!res.ok) return;

    const d = await res.json();

    /* =========================
       REVENUE
    ========================= */
    $("consult-revenue").textContent = money(d.totalRevenue);
    $("consult-discount-output").textContent = money(d.discountAmount);
    $("consult-revenue-after-discount").textContent = money(
      d.revenueAfterDiscount
    );
    $("consult-overtime-output").textContent = money(d.overtimeRevenue);

    /* =========================
       COSTS
    ========================= */
    $("consult-contingency-output").textContent = money(
      d.contingencyAmount
    );

    const cph = $("consult-cost-hour");
    cph.textContent = money(d.costPerHour);
    applyColor(cph, "caution");

    $("consult-costs").textContent = money(d.totalCosts);

    /* =========================
       PROFIT
    ========================= */
    const p = $("consult-profit");
    p.textContent = money(d.profit);
    applyColor(p, d.profit > 0 ? "positive" : "negative");

    $("consult-profit-hour").textContent = money(d.profitPerHour);

    /* =========================
       MARGIN
    ========================= */
    const m = $("consult-margin");
    m.textContent = percent(d.margin);

    if (d.margin < 10) applyColor(m, "negative");
    else if (d.margin < 20) applyColor(m, "caution");
    else applyColor(m, "positive");

    /* =========================
       ROI
    ========================= */
    const r = $("consult-roi");
    r.textContent = percent(d.roi);

    if (d.roi < 50) applyColor(r, "negative");
    else if (d.roi < 100) applyColor(r, "caution");
    else applyColor(r, "positive");

    /* =========================
       BREAKEVEN
    ========================= */
    $("consult-breakeven").textContent =
      (d.breakevenHours || 0).toFixed(2);

    /* =========================
       DECISION
    ========================= */
    const decisionEl = $("consult-decision");
    const adviceEl = $("consult-advice");

    decisionEl.textContent = d.decision || "—";
    adviceEl.textContent = d.advice || "—";

    switch (d.riskLevel) {
      case "High":
        applyColor(decisionEl, "negative");
        applyColor(adviceEl, "negative");
        break;

      case "Medium":
        applyColor(decisionEl, "caution");
        applyColor(adviceEl, "caution");
        break;

      case "Low":
        applyColor(decisionEl, "positive");
        applyColor(adviceEl, "positive");
        break;
    }
  }

  /* =========================
     INPUT LISTENERS
  ========================= */
  [
    "consult-hours",
    "consult-rate",
    "consult-expenses",
    "consult-labor",
    "consult-fixed",
    "consult-discount",
    "consult-overtime-hours",
    "consult-overtime-rate",
    "consult-variable-costs",
    "consult-contingency",
  ].forEach((id) =>
    $(id)?.addEventListener("input", updateConsulting)
  );

  /* =========================
     RESET
  ========================= */
  $("resetBtn")?.addEventListener("click", () => {
    [
      "consult-hours",
      "consult-rate",
      "consult-expenses",
      "consult-labor",
      "consult-fixed",
      "consult-discount",
      "consult-overtime-hours",
      "consult-overtime-rate",
      "consult-variable-costs",
      "consult-contingency",
    ].forEach((id) => ($(id).value = ""));

    runConsulting();
  });

  /* =========================
     INITIAL RUN
  ========================= */
  runConsulting();
})();