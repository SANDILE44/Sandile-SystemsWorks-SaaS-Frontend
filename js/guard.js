(async function guardCalculators() {
  const token = localStorage.getItem('token');

  let redirected = false;

  function go(url, message) {
    if (redirected) return;
    redirected = true;

    // store message for next page
    localStorage.setItem('authMessage', message);

    // remember page user wanted
    localStorage.setItem('afterLogin', window.location.pathname);

    window.location.replace(url);
  }

  // NOT LOGGED IN
  if (!token) {
    go('login.html', 'Please log in to continue using calculators.');
    return;
  }

  if (!window.API_BASE) {
    console.error('API_BASE not loaded');
    return;
  }

  try {
    const res = await fetch(`${window.API_BASE}/api/calculators/access`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // SESSION EXPIRED
    if (res.status === 401) {
      localStorage.removeItem('token');
      go('login.html', 'Session expired. Please log in again.');
      return;
    }

    // NO ACCESS
    if (res.status === 403) {
      go('payment.html', 'Your trial or subscription has ended.');
      return;
    }

    if (!res.ok) {
      console.error('Guard error status:', res.status);
      return;
    }

    console.log('Access granted');

  } catch (err) {
    console.error('Guard fetch failed:', err);
    // stay on page — no forced redirects
  }
})();
