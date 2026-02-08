// js/guard.js
(async function guard() {
  // Wait until api is ready
  if (!window.api) return;

  const token = localStorage.getItem('token');
  if (!token) {
    window.location.replace('login.html');
    return;
  }

  try {
    // 1️⃣ Validate session
    const profile = await window.api.getProfileRequest(token);

    // Optional: attach user for later use
    window.__user = profile?.user || profile;

    // 2️⃣ Check paid / trial access (ONLY on paid pages)
    if (window.__REQUIRE_PAID__) {
      await window.api.apiFetch('/api/users/dashboard', { token });
    }

    // ✅ All good → allow page
  } catch (err) {
    // IMPORTANT: only redirect on real auth failure
    if (err?.status === 401) {
      localStorage.removeItem('token');
      window.location.replace('login.html');
    } else if (window.__REQUIRE_PAID__) {
      window.location.replace('payment.html');
    }
    // else: fail silently (network hiccup)
  }
})();
