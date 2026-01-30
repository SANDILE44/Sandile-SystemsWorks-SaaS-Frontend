// js/recent.js
(async function () {
  try {
    const token = window.auth?.getToken?.();
    if (!token) return;

    const meta = window.RECENT_META; // page sets this
    if (!meta?.key || !meta?.title || !meta?.url) return;

    const API_BASE =
      window.API_BASE ||
      'https://sandile-systemsworks-saas-backend-2.onrender.com';

    await fetch(`${API_BASE}/api/users/recent-calculators`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify(meta),
    });
  } catch (e) {
    // never break the page
  }
})();
