(() => {

  /* ===============================
     API BASE
  ================================ */
  const API_BASE =
    "https://sandile-systemsworks-saas-backend-2.onrender.com";

  /* ===============================
     HELPERS
  ================================ */
  const $ = (id) => document.getElementById(id);

  const money = (v) =>
    (Number(v) || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const percent = (v) => (Number(v) || 0).toFixed(2) + "%";

  /* ===============================
     DEBOUNCE ENGINE
  ================================ */
  let timer;
  const debounce = () => {
    clearTimeout(timer);
    timer = setTimeout(run, 300);
  };

  /* ===============================
     COLOR ENGINE
  ================================ */
  function color(el, type) {
    if (!el) return;
    el.classList.remove("positive", "negative", "caution");
    if (type) el.classList.add(type);
  }

  /* ===============================
     INPUTS
  ================================ */
  function getInputs() {
    return {
      value: +$("const-value")?.value || 0,
      material: +$("const-material")?.value || 0,
      laborMonthly: +$("const-labor")?.value || 0,
      equipmentMonthly: +$("const-equipment")?.value || 0,
      fixedMonthly: +$("const-fixed")?.value || 0,
      months: +$("const-duration")?.value || 0,
    };
  }

  /* ===============================
     MAIN ENGINE
  ================================ */
  async function run() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(
        `${API_BASE}/api/calculators/construction/project`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(getInputs()),
        }
      );

      if (res.status === 403) return location.replace("payment.html");
      if (!res.ok) return;

      const d = await res.json();

      /* ===============================
         CORE OUTPUTS
      ================================ */
      $("const-total-costs").textContent = money(d.totalCosts);

      const profitEl = $("const-profit");
      profitEl.textContent = money(d.profit);
      color(profitEl, d.profit >= 0 ? "positive" : "negative");

      const marginEl = $("const-margin");
      marginEl.textContent = percent(d.margin);

      color(
        marginEl,
        d.margin < 10 ? "negative" :
        d.margin < 20 ? "caution" : "positive"
      );

      const roiEl = $("const-roi");
      roiEl.textContent = percent(d.roi);

      color(
        roiEl,
        d.roi < 0 ? "negative" :
        d.roi < 10 ? "caution" : "positive"
      );

      $("const-breakeven").textContent = money(d.breakEvenRevenue ?? d.breakeven ?? 0);
      $("const-monthly-profit").textContent = money(d.monthlyProfit ?? 0);
      $("const-annual-profit").textContent = money(d.annualProfit ?? 0);

      /* ===============================
         DECISION ENGINE (SELL LAYER)
      ================================ */
      const statusEl = $("decision-status");
      const riskEl = $("risk-warning");
      const adviceEl = $("decision-advice");

      const risk = d.riskLevel || "Low";

      statusEl.textContent = d.decision || "—";

      if (risk === "High") {
        color(statusEl, "negative");
        riskEl.textContent = "High risk: profit instability likely.";
        adviceEl.textContent = "Renegotiate pricing or reduce costs.";
      } else if (risk === "Medium") {
        color(statusEl, "caution");
        riskEl.textContent = "Medium risk: limited buffer.";
        adviceEl.textContent = "Monitor labor + material costs closely.";
      } else {
        color(statusEl, "positive");
        riskEl.textContent = "Low risk: healthy project margin.";
        adviceEl.textContent = "Safe to proceed.";
      }

      /* ===============================
         STEP INSIGHTS
      ================================ */
      const steps = $("const-steps-list");
      steps.innerHTML = "";

      if (d.steps?.length) {
        d.steps.forEach((s, i) => {
          const li = document.createElement("li");
          li.innerHTML = `
            <strong>${i + 1}. ${s.step}</strong>
            <span>${s.message}</span>
          `;
          steps.appendChild(li);
        });
      } else {
        steps.innerHTML = "<li>No insights available.</li>";
      }

    } catch (err) {
      console.error("Construction engine error:", err);
    }
  }

  /* ===============================
     EVENTS
  ================================ */
  [
    "const-value",
    "const-material",
    "const-labor",
    "const-equipment",
    "const-fixed",
    "const-duration",
  ].forEach((id) => $(id)?.addEventListener("input", debounce));

  /* RESET */
  $("resetBtn")?.addEventListener("click", () => {
    [
      "const-value",
      "const-material",
      "const-labor",
      "const-equipment",
      "const-fixed",
      "const-duration",
    ].forEach((id) => {
      const el = $(id);
      if (el) el.value = "";
    });

    run();
  });

  /* LOGOUT */
  $("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("token");
    location.replace("login.html");
  });

  /* INIT */
  run();

})();