(async function guardCalculators() {
  const token = localStorage.getItem('token');

  let redirected = false;

  function go(url, message) {
    if (redirected) return;
    redirected = true;

    localStorage.setItem('authMessage', message);
    localStorage.setItem('afterLogin', window.location.pathname);

    window.location.replace(url);
  }

  /* =====================================
     NOT LOGGED IN — SHOW LOGIN SCREEN
  ===================================== */
  if (!token) {
    document.body.innerHTML = `
      <div style="
        min-height:100vh;
        display:flex;
        align-items:center;
        justify-content:center;
        background:#0f1115;
        color:white;
        font-family:Arial,sans-serif;
        text-align:center;
        padding:20px;
      ">
        <div style="
          max-width:420px;
          background:#161b22;
          padding:30px 24px;
          border-radius:14px;
          box-shadow:0 10px 30px rgba(0,0,0,0.4);
        ">
          <h2 style="margin-bottom:10px;">You are logged out</h2>

          <p style="
            opacity:0.8;
            margin-bottom:24px;
            line-height:1.5;
          ">
            Please log in to continue using Sandile SystemsWorks calculators.
          </p>

          <button id="goLogin" style="
            background:#3b82f6;
            color:white;
            border:none;
            padding:12px 20px;
            border-radius:8px;
            font-size:16px;
            font-weight:600;
            cursor:pointer;
            width:100%;
          ">
            Log in to continue
          </button>
        </div>
      </div>
    `;

    document.getElementById('goLogin').onclick = () => {
      localStorage.setItem('afterLogin', window.location.pathname);
      window.location.href = 'login.html';
    };

    return;
  }

  /* =====================================
     SAFETY CHECK
  ===================================== */
  if (!window.API_BASE) {
    console.error('API_BASE not loaded');
    return;
  }

  /* =====================================
     ACCESS CHECK
  ===================================== */
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

    // SUBSCRIPTION / TRIAL ENDED
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
    // stay on page (no forced redirect on network errors)
  }
})();
