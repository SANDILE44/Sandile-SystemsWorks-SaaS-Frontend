(() => {

  const API_BASE = "https://sandile-systemsworks-saas-backend-2.onrender.com";
  const $ = (id) => document.getElementById(id);

  /* ================= FORMATTERS ================= */
  const money = (v) =>
    (Number(v) || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

  const percent = (v) => {
    const n = Number(v);
    if (!isFinite(n)) return "0.00%";
    return n.toFixed(2) + "%";
  };

  /* ================= STATE ================= */
  let timer;
  let latestData = null;

  const debounce = () => {
    clearTimeout(timer);
    timer = setTimeout(run, 300);
  };

  /* ================= INPUTS ================= */
  function getInputs() {
    return {
      value: +$("const-value")?.value || 0,
      material: +$("const-material")?.value || 0,
      laborMonthly: +$("const-labor")?.value || 0,
      equipmentMonthly: +$("const-equipment")?.value || 0,
      fixedMonthly: +$("const-fixed")?.value || 0,
      months: +$("const-duration")?.value || 0
    };
  }

  /* ================= COLOR ENGINE ================= */
  function color(el, type) {
    if (!el) return;
    el.classList.remove("positive", "negative", "caution");
    if (type) el.classList.add(type);
  }

  /* ================= MAIN ENGINE ================= */
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
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(getInputs())
        }
      );

      if (res.status === 403) return location.replace("payment.html");
      if (!res.ok) return;

      const d = await res.json();
      latestData = d;

      /* ================= CORE OUTPUTS ================= */
      $("const-total-costs").textContent = money(d.totalCosts);
      $("const-profit").textContent = money(d.profit);
      $("const-margin").textContent = percent(d.margin);
      $("const-roi").textContent = percent(d.roi);

      $("const-breakeven").textContent = money(d.breakEvenValue);
      $("const-monthly-profit").textContent = money(d.monthlyProfit);
      $("const-annual-profit").textContent = money(d.annualProfit);

      /* ================= DECISION ================= */
      const statusEl = $("decision-status");
      const adviceEl = $("decision-advice");

      statusEl.textContent = d.decision || "—";
      adviceEl.textContent = d.advice || "";

      statusEl.classList.remove("positive", "negative", "caution");

      if (d.riskLevel === "High") {
        statusEl.classList.add("negative");
      } else if (d.riskLevel === "Medium") {
        statusEl.classList.add("caution");
      } else {
        statusEl.classList.add("positive");
      }

      /* ================= INSIGHTS (NEW STRUCTURE) ================= */
      renderInsights(d.insights || {});

    } catch (err) {
      console.error("Construction engine error:", err);
    }
  }

  /* ================= DROPDOWN RENDER ================= */
  function renderInsights(insights) {

    const container = $("const-insights");
    if (!container) return;

    container.innerHTML = "";

    Object.entries(insights).forEach(([group, items]) => {

      const details = document.createElement("details");

      const summary = document.createElement("summary");
      summary.textContent = group.toUpperCase();

      const body = document.createElement("div");
      body.style.marginTop = "10px";

      (items || []).forEach((i, index) => {

        const block = document.createElement("div");
        block.className = "step";

        block.innerHTML = `
          <strong>${index + 1}. ${i.title}</strong>
          <div>${i.message}</div>
        `;

        body.appendChild(block);
      });

      details.appendChild(summary);
      details.appendChild(body);

      container.appendChild(details);
    });
  }

  /* ================= SAVE DEAL ================= */
  async function saveDeal() {

    if (!latestData) return alert("Run calculator first");

    const token = localStorage.getItem("token");
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
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
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

  /* ================= RESET ================= */
  function resetAll() {

    document.querySelectorAll(".input-section input")
      .forEach(i => i.value = "");

    latestData = null;

    [
      "const-total-costs",
      "const-profit",
      "const-margin",
      "const-roi",
      "const-breakeven",
      "const-monthly-profit",
      "const-annual-profit"
    ].forEach(id => {
      const el = $(id);
      if (el) el.textContent = "—";
    });

    $("decision-status").textContent = "—";
    $("decision-advice").textContent = "";
    $("const-insights").innerHTML = "";
  }

  /* ================= EVENTS ================= */
  [
    "const-value",
    "const-material",
    "const-labor",
    "const-equipment",
    "const-fixed",
    "const-duration"
  ].forEach(id => {
    $(id)?.addEventListener("input", debounce);
  });

  $("resetBtn")?.addEventListener("click", resetAll);
  $("saveDealBtn")?.addEventListener("click", saveDeal);

  /* ================= INIT ================= */
  run();

})();
