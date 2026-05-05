/* ============================================================
   Sandile SystemsWorks – Success Page Logic
   Handles the transition from Yoco back to the Dashboard
   ============================================================ */

(async function () {
  const statusText = document.getElementById("statusText");
  const smallText = document.getElementById("smallText");

  function setStatus(text, small = "") {
    if (statusText) statusText.textContent = text;
    if (smallText) smallText.textContent = small;
  }

  try {
    // 1. Check for Login Token
    const token = localStorage.getItem("token");
    if (!token) {
      setStatus(
        "Authentication Required",
        "You are not logged in. Please login to activate your premium features."
      );
      return;
    }

    // 2. Extract checkoutId from the URL (Yoco appends this automatically)
    const urlParams = new URLSearchParams(window.location.search);
    const checkoutId = urlParams.get("checkoutId");

    if (!checkoutId) {
      setStatus(
        "Missing Transaction ID",
        "We couldn't find the payment record. If you were charged, please contact support."
      );
      return;
    }

    setStatus("Verifying payment...", "Connecting to Yoco Secure Servers...");

    // 3. Confirm payment in backend (using the secure api.js helper)
    // This now passes the checkoutId so the server can double-check the money
    await window.api.confirmPaymentRequest(token, checkoutId);

    // 4. Success UI
    setStatus("Payment Confirmed ✅", "Welcome to the Premium Suite. Redirecting...");

    // 5. Cleanup and Redirect
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 2000);

  } catch (err) {
    console.error("Verification Error:", err);
    setStatus(
      "Verification Failed",
      err.message || "Something went wrong. Please check your dashboard in a few minutes."
    );
  }
})();
