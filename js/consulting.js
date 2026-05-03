(() => {

  const $ = (id) => document.getElementById(id);
  const API_BASE = "https://sandile-systemsworks-saas-backend-2.onrender.com";

  let debounceTimer;
  let latestData = null;

  /* ================= FORMATTERS ================= */
  const money = (v) =>
    (Number(v) || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

  const percent = (v) =>
    (Number(v) || 0).toFixed(2) + "%";

  /* ================= INPUTS ================= */
  function getInputs() {
    return {
      hours: +$("consult-hours")?.value || 0,
      rate: +$("consult-rate")?.value || 0,
      expenses: +$("consult-expenses")?.value || 0,
      labor: +$("consult-labor")?.value || 0,
      fixed: +$("consult-fixed")?.value || 0,
      discountPct: +$("consult-discount")?.value || 0,
      otHours: +$("consult-overtime-hours")?.value || 0,
      otRate: +$("consult-overtime-rate")?.value || 0,
      variableCosts: +$("consult-variable-costs")?.value || 0,
      contingencyPct: +$("consult-contingency")?.value || 0
    };
  }

  /* ================= API ================= */
  async function api(url, method = "GET", body = null) {
    const token = localStorage.getItem("token");
    if (!token) return location.replace("login.html");

    try {
      const res = await fetch(`${API_BASE}${url}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: body ? JSON.stringify(body) : null
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        location.replace("login.html");
        return null;
      }

      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.error("API error:", err);
      return null;
    }
  }

  /* ================= MAIN CALC ================= */
  async function runConsulting() {
    const token = localStorage.getItem("token");
    if (!token) return;

    const data = await api("/api/calculators/consulting/project", "POST", getInputs());

    if (!data) return;
    latestData = data;

    /* ================= OUTPUTS ================= */
    $("consult-revenue").textContent = money(data.totalRevenue);
    $("consult-revenue-after-discount").textContent = money(data.revenueAfterDiscount);
    $("consult-overtime-output").textContent = money(data.overtimeRevenue);

    $("consult-contingency-output").textContent = money(data.contingencyAmount);
    $("consult-cost-hour").textContent = money(data.costPerHour);
    $("consult-costs").textContent = money(data.totalCosts);

    $("consult-profit").textContent = money(data.profit);
    $("consult-profit-hour").textContent = money(data.profitPerHour);
    $("consult-margin").textContent = percent(data.margin);
    $("consult-roi").textContent = percent(data.roi);

    $("consult-breakeven").textContent = (data.breakevenHours || 0).toFixed(2);

    /* ================= STATUS ================= */
    const statusEl = $("status");
    const adviceEl = $("decisionAdvice");

    statusEl.textContent = data.decision || "—";
    adviceEl.textContent = data.advice || "";

    statusEl.className =
      data.riskLevel === "High" ? "loss"
      : data.riskLevel === "Medium" ? "neutral"
      : "profit";

    /* ================= COLORS ================= */
    const profitEl = $("consult-profit");
    if (profitEl) {
      profitEl.style.color = data.profit >= 0 ? "#22c55e" : "#ef4444";
    }

    /* ================= STEPS ================= */
    renderSteps(data.steps);
  }

  function renderSteps(steps) {
    const container = $("consult-steps");
    if (!container || !steps) return;

    container.innerHTML = steps.map((s, i) => `
      <div class="step">
        <strong>Step ${i + 1}</strong>
        <div>${s}</div>
      </div>
    `).join("");
  }

  /* ================= EXPORT CSV ================= */
  function exportCSV() {
    if (!latestData) return alert("Run calculator first");

    const i = getInputs();
    const rows = [
      ["Field", "Value"],
      ["Total Hours", i.hours],
      ["Hourly Rate", i.rate],
      ["Expenses", i.expenses],
      ["Labor", i.labor],
      ["Fixed", i.fixed],
      ["Discount %", i.discountPct],
      ["Total Revenue", latestData.totalRevenue],
      ["Total Costs", latestData.totalCosts],
      ["Net Profit", latestData.profit],
      ["Margin %", latestData.margin],
      ["ROI %", latestData.roi],
      ["Decision", latestData.decision]
    ];

    const csvContent = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "consulting-analysis.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ================= EXPORT REPORT ================= */
  function exportReport() {
    if (!latestData) return alert("Run calculator first");

    const i = getInputs();
    const html = `
      <html>
      <head>
        <title>Consulting Project Report</title>
        <style>
          body { font-family: sans-serif; padding: 40px; color: #333; line-height: 1.6; }
          .header { border-bottom: 2px solid #eee; margin-bottom: 20px; }
          .decision-box { background: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #ddd; }
          .metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px; }
          .metric-item { padding: 10px; border-bottom: 1px solid #eee; }
          .bold { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Consulting Project Analysis</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>
        <div class="decision-box">
          <h2>Decision: ${latestData.decision}</h2>
          <p>${latestData.advice}</p>
        </div>
        <div class="metrics">
          <div class="metric-item"><span class="bold">Total Revenue:</span> R ${money(latestData.totalRevenue)}</div>
          <div class="metric-item"><span class="bold">Total Costs:</span> R ${money(latestData.totalCosts)}</div>
          <div class="metric-item"><span class="bold">Net Profit:</span> R ${money(latestData.profit)}</div>
          <div class="metric-item"><span class="bold">Profit Margin:</span> ${percent(latestData.margin)}</div>
          <div class="metric-item"><span class="bold">ROI:</span> ${percent(latestData.roi)}</div>
          <div class="metric-item"><span class="bold">Break-even:</span> ${latestData.breakevenHours} Hours</div>
        </div>
      </body>
      </html>
    `;

    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
  }

  /* ================= SHARE LINK ================= */
  async function shareDeal() {
    if (!latestData) return alert("Run calculator first");

    const token = localStorage.getItem("token");
    const payload = {
      type: "consulting",
      inputs: getInputs(),
      results: latestData,
      title: "Consulting Project Analysis"
    };

    const res = await fetch(`${API_BASE}/api/share`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) return alert("Failed to create share link");

    const data = await res.json();
    const link = `https://sandile44.github.io/Sandile-SystemsWorks-SaaS-Frontend/share.html?id=${data.id}`;

    await navigator.clipboard.writeText(link);
    alert("Share link copied to clipboard!");
  }

  /* ================= SAVE / UPDATE ================= */
  async function saveDeal() {
    if (!latestData) return alert("Run calculator first");

    const editId = localStorage.getItem("editDealId");
    const payload = {
      type: "consulting",
      inputs: getInputs(),
      results: {
        profit: latestData.profit,
        margin: latestData.margin,
        revenue: latestData.totalRevenue
      }
    };

    const url = editId ? `/api/saved-deals/${editId}` : "/api/saved-deals";
    const method = editId ? "PUT" : "POST";

    const res = await api(url, method, payload);
    if (res) {
      alert(editId ? "Deal updated" : "Deal saved");
      localStorage.removeItem("editDeal");
      localStorage.removeItem("editDealId");
    } else {
      alert("Failed to save deal");
    }
  }

  /* ================= RESET ================= */
  function resetAll() {
    document.querySelectorAll(".input-section input").forEach(i => i.value = "");
    latestData = null;
    $("status").textContent = "—";
    $("status").className = "";
    $("decisionAdvice").textContent = "";
    $("consult-steps").innerHTML = "";
    
    [
      "consult-revenue","consult-revenue-after-discount",
      "consult-overtime-output","consult-contingency-output",
      "consult-cost-hour","consult-costs",
      "consult-profit","consult-profit-hour",
      "consult-margin","consult-roi","consult-breakeven"
    ].forEach(id => { if($(id)) $(id).textContent = "—"; });
  }

  /* ================= INIT ================= */
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".input-section input")
      .forEach(i => i.addEventListener("input", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(runConsulting, 300);
      }));

    $("resetBtn")?.addEventListener("click", resetAll);
    $("saveDealBtn")?.addEventListener("click", saveDeal);
    $("exportCsvBtn")?.addEventListener("click", exportCSV);
    $("exportReportBtn")?.addEventListener("click", exportReport);
    $("shareBtn")?.addEventListener("click", shareDeal);

    // Handle Edit Mode
    const editDeal = JSON.parse(localStorage.getItem("editDeal"));
    if (editDeal && editDeal.type === "consulting") {
      const i = editDeal.inputs || {};
      $("consult-hours").value = i.hours || "";
      $("consult-rate").value = i.rate || "";
      $("consult-expenses").value = i.expenses || "";
      $("consult-labor").value = i.labor || "";
      $("consult-fixed").value = i.fixed || "";
      $("consult-discount").value = i.discountPct || "";
      $("consult-overtime-hours").value = i.otHours || "";
      $("consult-overtime-rate").value = i.otRate || "";
      $("consult-variable-costs").value = i.variableCosts || "";
      $("consult-contingency").value = i.contingencyPct || "";
      runConsulting();
    } else {
      runConsulting();
    }
  });

})();
