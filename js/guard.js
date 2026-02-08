(async function guardCalculators() {
  const token = localStorage.getItem('token');

  if (!token) {
    window.location.replace('login.html');
    return;
  }

  try {
    const res = await fetch(`${window.API_BASE}/api/calculators/access`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error('No access');
    // allowed → do nothing
  } catch {
    window.location.replace('payment.html');
  }
})();
