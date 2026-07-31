/* =====================================================
    PER SHIPMENT CALCULATOR
===================================================== */

async function runShipment() {

    const elQuote = $("ship-quote");
    if (!elQuote) return;

    const inputs = {

        // Pricing
        quote: parseFloat(elQuote.value) || 0,
        minMargin: parseFloat($("ship-min-margin")?.value) || 0,
        buffer: parseFloat($("ship-buffer")?.value) || 0,

        // Distance
        distance: parseFloat($("ship-distance")?.value) || 0,
        fuelPerKm: parseFloat($("ship-fuel-km")?.value) || 0,
        vehiclePerKm: parseFloat($("ship-vehicle-km")?.value) || 0,
        loadFactor: parseFloat($("ship-load-factor")?.value) || 0,

        // Driver
        drivingHours: parseFloat($("ship-driving-hours")?.value) || 0,
        waitingHours: parseFloat($("ship-wait-hours")?.value) || 0,
        driverRate: parseFloat($("ship-driver-rate")?.value) || 0,

        // Route Costs
        tolls: parseFloat($("ship-tolls")?.value) || 0,
        permits: parseFloat($("ship-permits")?.value) || 0,
        otherFees: parseFloat($("ship-other-fees")?.value) || 0,

        // Cargo
        cargoValue: parseFloat($("ship-cargo-value")?.value) || 0,
        insuranceRate: parseFloat($("ship-insurance")?.value) || 0,

        // Additional Charges
        duties: parseFloat($("ship-duties")?.value) || 0,
        handling: parseFloat($("ship-handling")?.value) || 0,
        passThrough: parseFloat($("ship-pass-through")?.value) || 0
    };

    const data = await apiPost(
        "/api/calculators/logistics/shipment",
        inputs
    );

    if (!data) return;

    /* ==========================
       RESULTS
    ========================== */

    setText("ship-total-cost", money(data.totalCost));
    setText("ship-profit", money(data.profit));
    setText("ship-margin", percent(data.margin));
    setText("ship-min-quote", money(data.recommendedMinQuote));

    setText("ship-decision", data.decision || "—");
    setText("ship-reason", data.reason || "—");

    /* ==========================
       STYLING
    ========================== */

    setClass(
        $("ship-profit"),
        data.profit >= 0
            ? "profit-positive"
            : "profit-negative"
    );

    setClass(
        $("ship-margin"),
        data.margin >= 20
            ? "margin-strong"
            : data.margin >= 10
            ? "margin-medium"
            : "margin-low"
    );

    if (data.decision) {

        setClass(
            $("ship-decision"),
            `decision-${String(data.decision)
                .toLowerCase()
                .replace(/\s+/g, "-")}`
        );

    }

    /* ==========================
       STEP-BY-STEP GUIDANCE
    ========================== */

    renderSteps(
        "ship-steps",
        data.steps || []
    );

    /* ==========================
       SAVE BUTTON
    ========================== */

    const saveBtn = $("saveShipmentBtn");

    if (saveBtn) {

        saveBtn.onclick = async () => {

            await saveDeal(
                "logistics-shipment",
                {
                    inputs,
                    results: data
                }
            );

        };

    }

}

/* =====================================================
   AUTOMATIC EVENT BINDINGS & LISTENERS
===================================================== */

let shipmentDebounce;

// 1. Automatically trigger calculation when any shipment input changes
[
    "ship-quote", "ship-min-margin", "ship-buffer",
    "ship-distance", "ship-fuel-km", "ship-vehicle-km", "ship-load-factor",
    "ship-driving-hours", "ship-wait-hours", "ship-driver-rate",
    "ship-tolls", "ship-permits", "ship-other-fees",
    "ship-cargo-value", "ship-insurance",
    "ship-duties", "ship-handling", "ship-pass-through"
].forEach(id => {
    $(id)?.addEventListener("input", () => {
        clearTimeout(shipmentDebounce);
        shipmentDebounce = setTimeout(runShipment, 300);
    });
});

// 2. Reset Button functionality
$("resetShipmentBtn")?.addEventListener("click", () => {
    document.querySelectorAll("#shipment-panel input").forEach(input => input.value = "");
    runShipment(); // Clears outputs
});

// 3. Export CSV button hookup (optional stub / implementation)
$("exportShipmentCsvBtn")?.addEventListener("click", () => {
    alert("Exporting Shipment CSV report...");
});

// 4. Export Report (Print) button hookup
$("exportShipmentReportBtn")?.addEventListener("click", () => {
    window.print();
});
