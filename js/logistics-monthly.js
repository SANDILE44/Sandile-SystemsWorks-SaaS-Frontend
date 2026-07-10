/* =====================================================
   MONTHLY OPERATIONS CALCULATOR
===================================================== */

async function runMonthly() {

    const elShipments = $("log-shipments");
    if (!elShipments) return;

    const inputs = {
        shipments: parseFloat(elShipments.value) || 0,
        revenuePer: parseFloat($("log-revenue")?.value) || 0,
        fuel: parseFloat($("log-fuel")?.value) || 0,
        labor: parseFloat($("log-labor")?.value) || 0,
        maintenance: parseFloat($("log-maintenance")?.value) || 0,
        fixed: parseFloat($("log-fixed")?.value) || 0
    };

    const data = await apiPost(
        "/api/calculators/logistics/business",
        inputs
    );

    if (!data) return;

    /* ==========================
       FINANCIAL OVERVIEW
    ========================== */

    setText("log-total-revenue", money(data.totalRevenue));
    setText("log-total-costs", money(data.totalCosts));
    setText("log-profit", money(data.profit));
    setText("log-status", data.status || "—");
    setText("log-annual-profit", money(data.annualProfit));

    /* ==========================
       PER SHIPMENT
    ========================== */

    setText(
        "log-shipments-output",
        data.shipments ?? inputs.shipments
    );

    setText(
        "log-revenue-per-shipment",
        money(data.revenuePerShipment ?? inputs.revenuePer)
    );

    setText(
        "log-per-shipment",
        money(data.costPerShipment)
    );

    setText(
        "log-profit-per-shipment",
        money(data.profitPerShipment)
    );

    /* ==========================
       COST BREAKDOWN
    ========================== */

    setText("log-fuel-pct", percent(data.fuelPercent));
    setText("log-labor-pct", percent(data.laborPercent));
    setText("log-maintenance-pct", percent(data.maintenancePercent));
    setText("log-fixed-pct", percent(data.fixedPercent));

    /* ==========================
       RISK ANALYSIS
    ========================== */

    setText("log-risk-level", data.riskLevel);
    setText("log-safety", data.safetyStatus);
    setText(
        "log-recommended-price",
        money(data.recommendedPricePerShipment)
    );
    setText("log-advice", data.advice);

    /* ==========================
       COLOURS
    ========================== */

    setClass(
        $("log-profit"),
        data.profit >= 0
            ? "profit-positive"
            : "profit-negative"
    );

    if (data.riskLevel) {

        setClass(
            $("log-risk-level"),
            `risk-${String(data.riskLevel)
                .toLowerCase()
                .replace(/\s+/g, "-")}`
        );

    }

    if (data.safetyStatus) {

        setClass(
            $("log-safety"),
            `safety-${String(data.safetyStatus)
                .toLowerCase()
                .replace(/\s+/g, "-")}`
        );

    }

    /* ==========================
       STEP BY STEP
    ========================== */

    renderSteps(
        "log-steps",
        data.steps || []
    );

    /* ==========================
       SAVE BUTTON
    ========================== */

    const saveBtn = $("saveOperationsBtn");

    if (saveBtn) {

        saveBtn.onclick = () => {

            saveDeal(
                "logistics-business",
                {
                    inputs,
                    results: data
                }
            );

        };

    }

}
