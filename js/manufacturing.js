(() => {
  const $ = (id) => document.getElementById(id);

  const money = (v) =>
    (Number(v) || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

  const percent = (v) => (Number(v) || 0).toFixed(2) + "%";

  let timer;

  /* =========================
     DEBOUNCE INPUTS
  ========================== */
  function update() {
    clearTimeout(timer);
    timer = setTimeout(run, 250);
  }

  /* =========================
     COLOR HANDLER
  ========================== */
  function color(el, type) {
    if (!el) return;
    el.classList.remove("positive", "negative", "caution");
    if (type) el.classList.add(type);
  }

  /* =========================
     INPUTS (SIMPLIFIED READY)
  ========================== */
  function getInputs() {
    return {
      units: +$("mfg-units")?.value || 0,
      price: +$("mfg-price")?.value || 0,
      material: +$("mfg-material")?.value || 0,
      labor: +$("mfg-labor")?.value || 0,
      fixed: +$("mfg-fixed")?.value || 0,
      operational: +$("mfg-operational")?.value || 0
    };
  }

  /* =========================
     MAIN ENGINE
  ========================== */
  async function run() {
    try {
      const res = await fetch(
        `${API_BASE}/api/calculators/manufacturing/business`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify(getInputs())
        }
      );

      if (res.status === 401) {
        localStorage.removeItem("token");
        return (location.href = "login.html");
      }

      if (res.status === 403) {
        return (location.href = "payment.html");
      }

      if (!res.ok) return;

      const d = await res.json();

      /* =========================
         1. DECISION CARD (HERO)
      ========================== */
      const statusEl = $("decision-status");
      const riskEl = $("risk-warning");
      const adviceEl = $("decision-advice");

      if (statusEl) {
        statusEl.textContent = d.status || "—";

        color(
          statusEl,
          d.status === "LOSS"
            ? "negative"
            : d.status === "RISK"
            ? "caution"
            : "positive"
        );
      }

      if (riskEl) riskEl.textContent = d.reason || "";
      if (adviceEl) adviceEl.textContent = d.action || "";

      /* =========================
         2. CORE SNAPSHOT (ONLY KEY METRICS)
      ========================== */
      $("mfg-revenue") && ( $("mfg-revenue").textContent = money(d.revenue) );
      $("mfg-total-costs") && ( $("mfg-total-costs").textContent = money(d.totalCosts) );
      $("mfg-profit") && ( $("mfg-profit").textContent = money(d.profit) );

      color(
        $("mfg-profit"),
        d.profit >= 0 ? "positive" : "negative"
      );

      /* =========================
         3. UNIT ECONOMICS (SIMPLIFIED VALUE)
      ========================== */
      $("mfg-cost-per-unit") &&
        ( $("mfg-cost-per-unit").textContent = money(d.costPerUnit) );

      $("mfg-profit-per-unit") &&
        ( $("mfg-profit-per-unit").textContent = money(d.profitPerUnit) );

      /* =========================
         4. PERFORMANCE (KEEP ONLY MARGIN)
      ========================== */
      $("mfg-margin") &&
        ( $("mfg-margin").textContent = percent(d.margin) );

      color(
        $("mfg-margin"),
        d.margin < 10
          ? "negative"
          : d.margin < 20
          ? "caution"
          : "positive"
      );

      /* =========================
         5. BREAK-EVEN (KEEP)
      ========================== */
      $("mfg-breakeven") &&
        ( $("mfg-breakeven").textContent = d.breakeven ?? 0 );

      /* =========================
         6. NEXT STEPS (CONVERSION LAYER)
      ========================== */
      const steps = $("mfg-steps");

      if (steps) {
        steps.innerHTML = "";

        (d.steps || []).forEach((s) => {
          const li = document.createElement("li");

          li.innerHTML = `
            <strong>${s.step}</strong>
            <span>${s.message}</span>
          `;

          steps.appendChild(li);
        });
      }

    } catch (err) {
      console.error("Manufacturing engine error:", err);
    }
  }

  /* =========================
     EVENTS
  ========================== */
  document
    .querySelectorAll(".calculator-container input")
    .forEach((i) => i.addEventListener("input", update));

  $("resetBtn")?.addEventListener("click", () => {
    document
      .querySelectorAll(".calculator-container input")
      .forEach((i) => (i.value = ""));

    run();
  });

  run();
})();