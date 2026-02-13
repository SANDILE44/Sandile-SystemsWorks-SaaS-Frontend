(async function guardCalculators() {
  const token = localStorage.getItem('token');

  if (!token) {
    window.location.replace('login.html');
    return;
  }

  // safety check
  if (!window.API_BASE) {
    alert('API_BASE not loaded');
    return;
  }

  try {
    const res = await fetch(`${window.API_BASE}/api/calculators/access`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // ONLY redirect if backend really says no access
    if (res.status === 403) {
      window.location.replace('payment.html');
      return;
    }

    if (!res.ok) {
      console.error('Guard error status:', res.status);
      return; // stay on page
    }

    console.log('Access granted');
  } catch (err) {
    console.error('Guard fetch failed:', err);
    // IMPORTANT: do NOT send to payment on network errors
  }
})();
