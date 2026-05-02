(() => {

  const API_BASE = "https://sandile-systemsworks-saas-backend-2.onrender.com";
  const $ = (id) => document.getElementById(id);

  let debounceTimer;
  let latestData = null;

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

  /* ================= COLOR HANDLER ================= */
  function setStatusColor(el, riskLevel) {
    if (!el) return;

    el.classList.remove("positive", "negative", "caution");

    if (riskLevel === "High") el.classList.add("negative");
    else if (riskLevel === "Medium") el.classList.add("caution");
    else el.classList.add("positive");
  }

  /* ================= LOAD EDIT DATA ================= */
  function loadEditDeal() {
    const edit = localStorage.getItem("editDeal");
    if (!edit) return;

    try {
      const deal = JSON.parse(edit);
      const i = deal.inputs || {};

      $("const-value").value = i.value || 0;
      $("const-material").value = i.material || 0;
      $("const-labor").value = i.laborMonthly || 0;
      $("const-equipment").value = i.equipmentMonthly || 0;
      $("const-fixed").value = i.fixedMonthly || 0;
      $("const-duration").value = i.months || 0;

    } catch (err) {
      console.error("Failed loading edit deal:", err);
    }
  }

  /* ================= RUN ENGINE ================= */
  async function run() {

    const token = localStorage.getItem("token");
    if (!token) return location.replace("login.html");

    try {

      const res = await fetch(`${API_BASE}/api/calculators/construction/project`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(getInputs())
      });

      if (!res.ok) return;

      const d = await res.json();
      latestData = d;

      /* ================= OUTPUTS ================= */
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

      setStatusColor(statusEl, d.riskLevel);

      /* ================= INSIGHTS ================= */
      renderInsights(d.insights || {});

    } catch (err) {
      console.error("Construction error:", err);
    }
  }

  /* ================= INSIGHTS ================= */
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

      (items || []).forEach((i, idx) => {

        const div = document.createElement("div");
        div.className = "step";

        div.innerHTML = `
          <strong>${idx + 1}. ${i.title}</strong>
          <div>${i.message}</div>
        `;

        body.appendChild(div);
      });

      details.appendChild(summary);
      details.appendChild(body);

      container.appendChild(details);
    });
  }

  /* ================= SAVE / UPDATE DEAL ================= */
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

    const res = await fetch(`${API_BASE}${url}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) return alert("Save failed");

    alert(editId ? "Deal updated" : "Deal saved");

    localStorage.removeItem("editDeal");
    localStorage.removeItem("editDealId");
  }

  /* ================= RESET ================= */
  function resetAll() {

    document.querySelectorAll(".input-section input")
      .forEach(i => i.value = "");

    latestData = null;

    $("decision-status").textContent = "—";
    $("decision-advice").textContent = "";
    $("const-insights").innerHTML = "";

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
    $(id)?.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(run, 300);
    });
  });

  $("resetBtn")?.addEventListener("click", resetAll);
  $("saveDealBtn")?.addEventListener("click", saveDeal);


 /* ================= EXPORT ================= */
function exportResults() {
  if (!latestData) {
    alert("Run calculator first");
    return;
  }

  const inputs = getInputs();

  const data = {
    type: "Construction Project",
    date: new Date().toLocaleString(),
    inputs,
    results: {
      totalCosts: latestData.totalCosts,
      profit: latestData.profit,
      margin: latestData.margin,
      roi: latestData.roi,
      breakEven: latestData.breakEvenValue,
      monthlyProfit: latestData.monthlyProfit,
      annualProfit: latestData.annualProfit,
      decision: latestData.decision,
      advice: latestData.advice
    }
  };

  const blob = new Blob(
    [JSON.stringify(data, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "construction-result.json";
  a.click();

  URL.revokeObjectURL(url);
}

/* ================= EVENTS ================= */
$("exportBtn")?.addEventListener("click", exportResults);

  /* ================= INIT ================= */
  loadEditDeal();
  run();

})();
