/* =====================================================
   FREIGHT IMPORT / EXPORT CALCULATOR
===================================================== */

async function runFreight() {

    const elQuote = $("freight-quote");
    if (!elQuote) return;

    const inputs = {

        quote: parseFloat(elQuote.value) || 0,

        cargoValue: parseFloat($("freight-cargo-value")?.value) || 0,
        insuranceRate: parseFloat($("freight-insurance-rate")?.value) || 0,

        freightCost: parseFloat($("freight-cost")?.value) || 0,
        fuelSurcharge: parseFloat($("freight-fuel-surcharge")?.value) || 0,

        dutyRate: parseFloat($("freight-duty-rate")?.value) || 0,
        customsFees: parseFloat($("freight-customs-fees")?.value) || 0,

        portFees: parseFloat($("freight-port-fees")?.value) || 0,
        handlingFees: parseFloat($("freight-handling-fees")?.value) || 0,

        inlandTransport: parseFloat($("freight-inland-transport")?.value) || 0,
        tolls: parseFloat($("freight-tolls")?.value) || 0,

        otherCosts: parseFloat($("freight-other-costs")?.value) || 0
    };

    const data = await apiPost(
        "/api/calculators/logistics/freight",
        inputs
    );

    if (!data) return;

    /* ==========================
       RESULTS
    ========================== */

    setText("freight-insurance-cost", money(data.insuranceCost));
    setText("freight-duties", money(data.dutyCost));
    setText("freight-total-cost", money(data.totalCost));
    setText("freight-profit", money(data.profit));
    setText("freight-margin", percent(data.margin));

    setText("freight-breakeven", money(data.breakEvenQuote));
    setText("freight-decision", data.decision || "—");
    setText("freight-reason", data.reason || "—");
    setText("freight-risk", data.riskLevel || "—");

    /* ==========================
       STYLING
    ========================== */

    setClass(
        $("freight-profit"),
        data.profit >= 0
            ? "profit-positive"
            : "profit-negative"
    );

    setClass(
        $("freight-margin"),
        data.margin >= 20
            ? "margin-strong"
            : data.margin >= 10
            ? "margin-medium"
            : "margin-low"
    );

    if (data.riskLevel) {

        setClass(
            $("freight-risk"),
            `freight-risk-${String(data.riskLevel)
                .toLowerCase()
                .replace(/\s+/g, "-")}`
        );

    }

    /* ==========================
       STEP BY STEP
    ========================== */

    renderSteps(
        "freight-steps",
        data.steps || []
    );

    /* ==========================
       SAVE BUTTON
    ========================== */

    const saveBtn = $("saveFreightBtn");

    if (saveBtn) {

        saveBtn.onclick = () => {

            saveDeal(
                "logistics-freight",
                {
                    inputs,
                    results: data
                }
            );

        };

    }

}
