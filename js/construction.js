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

  /* ================= COLOR ================= */
  function setStatusColor(el, riskLevel) {
    if (!el) return;

    el.classList.remove("positive", "negative", "caution");

    if (riskLevel === "High") el.classList.add("negative");
    else if (riskLevel === "Medium") el.classList.add("caution");
    else el.classList.add("positive");
  }

  /* ================= LOAD EDIT (FIXED LIFECYCLE) ================= */
  function loadEditDeal() {
    const edit = localStorage.getItem("editDeal");
    if (!edit) {
      // No edit profile found, run standard calculator default init setup
      run();
      return;
    }

    try {
      const deal = JSON.parse(edit);
      const i = deal.inputs || deal;

      // 1. Set the Project/Client Name
      const nameInput = $("client-name-input");
      if (nameInput) {
        nameInput.value = deal.clientName || deal.name || "";
      }

      // 2. Map numbers back to inputs cleanly
      if ($("const-value")) $("const-value").value = i.value || i.contractValue || 0;
      if ($("const-material")) $("const-material").value = i.material || i.materialCost || 0;
      if ($("const-labor")) $("const-labor").value = i.laborMonthly || i.laborCost || 0;
      if ($("const-equipment")) $("const-equipment").value = i.equipmentMonthly || i.equipmentCost || 0;
      if ($("const-fixed")) $("const-fixed").value = i.fixedMonthly || i.fixedCosts || 0;
      if ($("const-duration")) $("const-duration").value = i.months || i.duration || 0;

      // 3. Execution alignment: Run calculation strictly AFTER DOM elements are fully updated
      run();

    } catch (err) {
      console.error("Load error:", err);
      run(); // Fallback to safe execution on structural failure
    }
  }

    /* ================= RUN ENGINE ================= */
  async function run() {
    const token = localStorage.getItem("token");
    if (!token) return;

    const inputs = getInputs();
    if (inputs.value === 0) return;

    try {
      const res = await fetch(`${API_BASE}/api/calculators/construction/project`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(inputs)
      });

      if (!res.ok) return;

      const d = await res.json();
      latestData = d;

      // 1. Inject Text Metrics
      $("const-total-costs").textContent = money(d.totalCosts);
      $("const-profit").textContent = money(d.profit);
      $("const-breakeven").textContent = money(d.breakEvenValue);
      $("const-monthly-profit").textContent = money(d.monthlyProfit);
      $("const-annual-profit").textContent = money(d.annualProfit);

      // 2. Inject Percentage Metrics with Dynamic Coloring
      const marginEl = $("const-margin");
      const roiEl = $("const-roi");

      marginEl.textContent = percent(d.margin);
      roiEl.textContent = percent(d.roi);

      // Apply color logic based on the riskLevel returned by your API
      applyMetricColoring(marginEl, d.riskLevel);
      applyMetricColoring(roiEl, d.riskLevel);

      // 3. Inject Decision Status
      const statusEl = $("decision-status");
      if (statusEl) {
        statusEl.textContent = d.decision || "—";
        setStatusColor(statusEl, d.riskLevel);
      }
      
      if ($("decision-advice")) $("decision-advice").textContent = d.advice || "";

      renderInsights(d.insights || {});

    } catch (err) {
      console.error("Engine failure:", err);
    }
  }

  /* ================= HELPER: DYNAMIC COLORING ================= */
  function applyMetricColoring(el, riskLevel) {
    if (!el) return;
    // Reset existing classes
    el.classList.remove("positive", "caution", "negative");
    
    // Assign class based on risk
    if (riskLevel === "High") el.classList.add("negative");
    else if (riskLevel === "Medium") el.classList.add("caution");
    else el.classList.add("positive");
  }


  /* ================= INSIGHTS ================= */
  function renderInsights(insights) {
    const container = $("const-insights");
    if (!container) return;

    container.innerHTML = "";

    const main = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = "INSIGHTS";

    const inner = document.createElement("div");
    inner.style.marginTop = "10px";

    Object.entries(insights).forEach(([group, items]) => {
      const groupBox = document.createElement("details");
      const groupTitle = document.createElement("summary");
      groupTitle.textContent = group.toUpperCase();

      const body = document.createElement("div");
      body.style.marginTop = "8px";

      (items || []).forEach((i, idx) => {
        const div = document.createElement("div");
        div.className = "step";
        div.innerHTML = `
          <strong>${idx + 1}. ${i.title}</strong>
          <div>${i.message}</div>
        `;
        body.appendChild(div);
      });

      groupBox.appendChild(groupTitle);
      groupBox.appendChild(body);
      inner.appendChild(groupBox);
    });

    main.appendChild(summary);
    main.appendChild(inner);
    container.appendChild(main);
  }

  /* ================= SAVE / UPDATE (PATCHED & SECURED) ================= */
  async function saveDeal(e) {
    // Force the browser to abandon standard navigation or page reloads instantly
    if (e) {
      if (typeof e.preventDefault === "function") e.preventDefault();
      if (typeof e.stopPropagation === "function") e.stopPropagation();
    }

    if (!latestData) return alert("Run the engine first to calculate project data.");

    const token = localStorage.getItem("token");
    const editId = localStorage.getItem("editDealId");
    const clientNameValue = $("client-name-input")?.value || "Untitled Project";

    const payload = {
      type: "construction",
      clientName: clientNameValue,
      inputs: getInputs(),
      results: {
        profit: latestData.profit,
        margin: latestData.margin,
        revenue: latestData.value || latestData.revenue || getInputs().value,
        status: latestData.decision,
        riskLevel: latestData.riskLevel
      }
    };

    // Construct targeted endpoints strictly
    const url = editId ? `/api/saved-deals/${editId}` : `/api/saved-deals`;
    const method = editId ? "PUT" : "POST";

    try {
      const res = await fetch(`${API_BASE}${url}`, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const serverErr = await res.text();
        console.error("Backend rejection log:", serverErr);
        throw new Error(`Server error response code: ${res.status}`);
      }

      alert(editId
        ? `Successfully Updated: ${clientNameValue}`
        : `Successfully Saved: ${clientNameValue}`
      );

      // Clean local pipeline cache state ONLY on confirmed network completion
      if (editId) {
        localStorage.removeItem("editDeal");
        localStorage.removeItem("editDealId");
      }

      if ($("client-name-input")) {
        $("client-name-input").value = "";
      }

      // Re-route clean back to dashboard layout view
      window.location.href = "industry-construction.html";

    } catch (err) {
      console.error("Save system crash trajectory:", err);
      alert("Could not commit updates to the database. Verify console network telemetry logs.");
    }
  }

  /* ================= RESET ================= */
  function resetAll() {
    document.querySelectorAll(".input-section input").forEach(i => i.value = "");
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

  /* ================= EXPORT TO CSV ================= */
  function exportToCsv() {
    if (!latestData) return alert("Run the engine first to generate data.");

    const inputs = getInputs();
    const projectName = $("client-name-input")?.value || "Unnamed_Project";

    const rows = [
      ["Category", "Label", "Value"],
      ["Project Info", "Project Name", projectName],
      ["Inputs", "Contract Value", inputs.value],
      ["Inputs", "Material Cost", inputs.material],
      ["Inputs", "Labor (Monthly)", inputs.laborMonthly],
      ["Inputs", "Duration (Months)", inputs.months],
      ["", "", ""],
      ["Results", "Total Costs", latestData.totalCosts],
      ["Results", "Net Profit", latestData.profit],
      ["Results", "Margin", latestData.margin + "%"],
      ["Results", "ROI", latestData.roi + "%"],
      ["Results", "Break Even", latestData.breakEvenValue],
      ["Decision", "Status", latestData.decision]
    ];

    const csvContent = rows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    link.setAttribute("href", url);
    link.setAttribute("download", `${projectName.replace(/\s+/g, '_')}_Report.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /* ================= EXPORT REPORT (PRINT) ================= */
  function exportReport() {
    if (!latestData) return alert("Run the engine first to generate data.");

    const projectName = $("client-name-input")?.value || "Standard Construction Project";
    const dateStr = new Date().toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    if ($("print-project-name")) $("print-project-name").textContent = projectName;
    if ($("print-date")) $("print-date").textContent = dateStr;

    window.print();
  }

  /* ================= SHARE DEAL ================= */
  async function shareDeal() {
    if (!latestData) return alert("Run the engine first to generate data.");

    const token = localStorage.getItem("token");
    const projectName = $("client-name-input")?.value || "Standard Construction Project";
    
    const payload = {
      shareId: "share_" + Math.random().toString(36).substring(2, 9), 
      type: "construction",
      inputs: getInputs(), 
      results: {
        profit: latestData.profit,
        margin: latestData.margin,
        roi: latestData.roi,
        status: latestData.decision,
        riskLevel: latestData.riskLevel,
        breakEvenValue: latestData.breakEvenValue,
        totalCosts: latestData.totalCosts,
        monthlyProfit: latestData.monthlyProfit,
        annualProfit: latestData.annualProfit,
        advice: latestData.advice
      },
      meta: {
        title: projectName,
        createdBy: "Sandile"
      },
      permissions: {
        mode: "view",
        isPublic: true
      }
    };

    try {
      const res = await fetch(`${API_BASE}/api/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Server Response Error:", errorText);
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      const finalId = data.shareId || data.id || data._id;
      const shareUrl = `${window.location.origin}/share.html?id=${finalId}`;

      const shareMessage = 
        `🏗️ Project Intelligence Report: ${projectName}\n` +
        `View full analysis results here:\n${shareUrl}\n\n` +
        `Generated by Sandile SystemsWorks`;

      if (navigator.share) {
        await navigator.share({
          title: 'Project Profitability Report',
          text: shareMessage,
          url: shareUrl 
        });
      } else {
        await navigator.clipboard.writeText(shareMessage);
        alert("Analysis link and summary copied to clipboard!");
      }

    } catch (err) {
      console.error('Sharing Error:', err);
      alert("Action failed. Please check the console for details.");
    }
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
  
  // 🎯 SECURED BINDINGS: Passing standard explicitly structured events to block browser overrides
  $("saveDealBtn")?.addEventListener("click", (e) => saveDeal(e));
  $("exportCsvBtn")?.addEventListener("click", exportToCsv);
  $("exportReportBtn")?.addEventListener("click", exportReport);
  $("shareBtn")?.addEventListener("click", shareDeal);

  /* ================= INIT CONTROL FLOW ================= */
  // Pull historical records safely; it handles its own internal lifecycle call to run()
  loadEditDeal();

})();
