(() => {

  /* ===============================
     API BASE
  ================================ */
  const API_BASE =
    "https://sandile-systemsworks-saas-backend-2.onrender.com";

  const $ = (id) => document.getElementById(id);

  /* ===============================
     FORMATTERS
  ================================ */
  const money = (v) =>
    (Number(v) || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const percent = (v) => (Number(v) || 0).toFixed(2) + "%";

  /* ===============================
     STATE
  ================================ */
  let timer;
  let latestData = null;

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
    if (!token) return location.replace("login.html");

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
      latestData = d;

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

      $("const-breakeven").textContent = money(d.breakEven);
      $("const-monthly-profit").textContent = money(d.monthlyProfit);
      $("const-annual-profit").textContent = money(d.annualProfit);

      /* ===============================
         DECISION ENGINE
      ================================ */
      const statusEl = $("decision-status");
      const riskEl = $("risk-warning");
      const adviceEl = $("decision-advice");

      statusEl.textContent = d.decision || "—";

      if (d.riskLevel === "High") {
        color(statusEl, "negative");
        riskEl.textContent = "High risk project";
        adviceEl.textContent = d.advice || "Renegotiate contract.";
      } else if (d.riskLevel === "Medium") {
        color(statusEl, "caution");
        riskEl.textContent = "Medium risk project";
        adviceEl.textContent = d.advice || "Optimize costs.";
      } else {
        color(statusEl, "positive");
        riskEl.textContent = "Low risk project";
        adviceEl.textContent = d.advice || "Safe to proceed.";
      }

      /* ===============================
         STEP LIST (HIDDEN UNTIL USER OPENS UI LATER)
      ================================ */
      const steps = $("const-steps-list");
      steps.innerHTML = "";

      (d.steps || []).forEach((s, i) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <strong>${i + 1}. ${s.step}</strong>
          <span>${s.message}</span>
        `;
        steps.appendChild(li);
      });

    } catch (err) {
      console.error("Construction engine error:", err);
    }
  }

  /* ===============================
     SAVE DEAL (CONSTRUCTION)
  ================================ */
  async function saveDeal() {

    if (!latestData) return alert("Run calculator first");

    const token = localStorage.getItem("token");
    if (!token) return;

    const editId = localStorage.getItem("editDealId");

    const payload = {
      type: "construction",
      inputs: getInputs(),
      results: {
        profit: latestData.profit,
        margin: latestData.margin,
        revenue: latestData.value
      }
    };

    const url = editId
      ? `/api/saved-deals/${editId}`
      : `/api/saved-deals`;

    const method = editId ? "PUT" : "POST";

    try {
      const res = await fetch(`${API_BASE}${url}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Save failed");

      alert(editId ? "Deal updated" : "Deal saved");

      localStorage.removeItem("editDeal");
      localStorage.removeItem("editDealId");

    } catch (err) {
      console.error(err);
      alert("Failed to save deal");
    }
  }

  /* ===============================
     RESET
  ================================ */
  function resetAll() {
    document.querySelectorAll(".input-section input")
      .forEach(i => i.value = "");

    latestData = null;
    run();
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

  $("resetBtn")?.addEventListener("click", resetAll);
  $("saveDealBtn")?.addEventListener("click", saveDeal);

  $("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("token");
    location.replace("login.html");
  });

  /* ===============================
     INIT
  ================================ */
  run();

})();
