// js/success.js
(async function () {
  const statusText = document.getElementById("statusText");
  const smallText = document.getElementById("smallText");

  function setStatus(text, small = "") {
    if (statusText) statusText.textContent = text;
    if (smallText) smallText.textContent = small;
  }

  try {
    // Must be logged in to confirm payment
    const token = localStorage.getItem("token");
    if (!token) {
      setStatus(
        "You are not logged in.",
        "Please login, then return to dashboard. If you paid, contact support with your email.",
      );
      return;
    }

    // Confirm payment in backend (mark hasPaid=true)
    // Uses apiFetch from js/api.js
    await apiFetch("/api/payments/confirm", {
      method: "POST",
      token,
    });

    setStatus("Payment confirmed ✅", "Redirecting you to dashboard…");

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1800);
  } catch (err) {
    setStatus(
      "We couldn’t confirm the payment.",
      err && err.message
        ? err.message
        : "Please go to dashboard and try again.",
    );
  }
})();
