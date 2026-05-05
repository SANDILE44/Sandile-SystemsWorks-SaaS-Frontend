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



  /* ================= LOAD EDIT ================= */

  function loadEditDeal() {

    const edit = localStorage.getItem("editDeal");

    if (!edit) return;



    try {

      const deal = JSON.parse(edit);

      const i = deal.inputs || deal;



      if (deal.clientName && $("client-name-input")) {

        $("client-name-input").value = deal.clientName;

      }



      $("const-value") && ($("const-value").value = i.value || 0);

      $("const-material") && ($("const-material").value = i.material || 0);

      $("const-labor") && ($("const-labor").value = i.laborMonthly || 0);

      $("const-equipment") && ($("const-equipment").value = i.equipmentMonthly || 0);

      $("const-fixed") && ($("const-fixed").value = i.fixedMonthly || 0);

      $("const-duration") && ($("const-duration").value = i.months || 0);



    } catch (err) {

      console.error("Load error:", err);

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



      $("const-total-costs").textContent = money(d.totalCosts);

      $("const-profit").textContent = money(d.profit);

      $("const-margin").textContent = percent(d.margin);

      $("const-roi").textContent = percent(d.roi);



      $("const-breakeven").textContent = money(d.breakEvenValue);

      $("const-monthly-profit").textContent = money(d.monthlyProfit);

      $("const-annual-profit").textContent = money(d.annualProfit);



      const statusEl = $("decision-status");

      const adviceEl = $("decision-advice");



      statusEl.textContent = d.decision || "—";

      adviceEl.textContent = d.advice || "";



      setStatusColor(statusEl, d.riskLevel);



      renderInsights(d.insights || {});



    } catch (err) {

      console.error("Run error:", err);

    }

  }



  /* ================= INSIGHTS (FIXED SINGLE VERSION) ================= */

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



  /* ================= SAVE / UPDATE ================= */

  async function saveDeal() {



    if (!latestData) return alert("Run calculator first");



    const token = localStorage.getItem("token");

    const editId = localStorage.getItem("editDealId");



    const clientNameValue =

      $("client-name-input")?.value || "Untitled Project";



    const payload = {

      type: "construction",

      clientName: clientNameValue,

      inputs: getInputs(),

      results: {

        profit: latestData.profit,

        margin: latestData.margin,

        revenue: latestData.value,

        status: latestData.decision,

        riskLevel: latestData.riskLevel

      }

    };



    const url = editId ? `/api/saved-deals/${editId}` : `/api/saved-deals`;

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



      alert(editId

        ? `Updated: ${clientNameValue}`

        : `Saved: ${clientNameValue}`

      );



      if (editId) {

        localStorage.removeItem("editDeal");

        localStorage.removeItem("editDealId");

        localStorage.removeItem("editId");

      }



      if ($("client-name-input")) {

        $("client-name-input").value = "";

      }



    } catch (err) {

      console.error(err);

      alert("Save failed");

    }

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





  /* ================= EXPORT TO CSV ================= */

function exportToCsv() {

    if (!latestData) return alert("Run the engine first to generate data.");



    const inputs = getInputs();

    const projectName = $("client-name-input")?.value || "Unnamed_Project";



    // 1. Define the Rows

    const rows = [

        ["Category", "Label", "Value"], // Headers

        ["Project Info", "Project Name", projectName],

        ["Inputs", "Contract Value", inputs.value],

        ["Inputs", "Material Cost", inputs.material],

        ["Inputs", "Labor (Monthly)", inputs.laborMonthly],

        ["Inputs", "Duration (Months)", inputs.months],

        ["", "", ""], // Spacer row

        ["Results", "Total Costs", latestData.totalCosts],

        ["Results", "Net Profit", latestData.profit],

        ["Results", "Margin", latestData.margin + "%"],

        ["Results", "ROI", latestData.roi + "%"],

        ["Results", "Break Even", latestData.breakEvenValue],

        ["Decision", "Status", latestData.decision]

    ];



    // 2. Convert Array to CSV String

    const csvContent = rows.map(e => e.join(",")).join("\n");



    // 3. Create the Download Link

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

    // 1. Fill in the print-only details
    const projectName = $("client-name-input")?.value || "Standard Construction Project";
    const dateStr = new Date().toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    if ($("print-project-name")) $("print-project-name").textContent = projectName;
    if ($("print-date")) $("print-date").textContent = dateStr;

    // 2. Trigger the Print Dialog
    window.print();
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
  $("exportCsvBtn")?.addEventListener("click", exportToCsv);
  $("exportReportBtn")?.addEventListener("click", exportReport);



  /* ================= INIT ================= */

  loadEditDeal();

  run();



})();

, 
