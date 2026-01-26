// js/payments.js

async function startCheckout() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  try {
    const data = await apiFetch("/api/payments/checkout", {
      method: "POST",
      token,
      body: {} // amount handled by backend env
    });

    if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl;
    } else {
      alert("Failed to create checkout link.");
    }
  } catch (err) {
    alert(err.message);
  }
}
