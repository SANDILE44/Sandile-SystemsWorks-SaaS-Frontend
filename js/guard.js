(async function guardCalculators() {

  /* =====================================
     PREVENT DOUBLE EXECUTION
  ===================================== */
  if (window.guardLoaded) return;
  window.guardLoaded = true;

  const token = localStorage.getItem("token");
  let redirected = false;

  function go(url, message) {
    if (redirected) return;
    redirected = true;

    if (message) {
      localStorage.setItem("authMessage", message);
    }

    localStorage.setItem("afterLogin", window.location.pathname);

    window.location.replace(url);
  }

  /* =====================================
     NOT LOGGED IN
     SHOW LOGIN SCREEN IMMEDIATELY
  ===================================== */
  if (!token) {

    document.body.innerHTML = `
      <div style="
        min-height:100vh;
        display:flex;
        align-items:center;
        justify-content:center;
        background:#020617;
        color:white;
        font-family:Arial,sans-serif;
        text-align:center;
        padding:20px;
      ">
        <div style="
          max-width:420px;
          background:#0f172a;
          padding:30px 24px;
          border-radius:14px;
          box-shadow:0 10px 30px rgba(0,0,0,0.45);
        ">

          <h2 style="margin-bottom:12px;">
            You are logged out
          </h2>

          <p style="
            opacity:0.85;
            margin-bottom:24px;
            line-height:1.5;
          ">
            Please log in to continue using Sandile SystemsWorks calculators.
          </p>

          <button id="goLogin" style="
            background:#2563eb;
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

    document.getElementById("goLogin").onclick = () => {
      localStorage.setItem("afterLogin", window.location.pathname);
      window.location.href = "login.html";
    };

    return;
  }

  /* =====================================
     SAFETY CHECK
  ===================================== */
  if (!window.API_BASE) {
    console.error("API_BASE not loaded");
    return;
  }

  /* =====================================
     ACCESS / SUBSCRIPTION CHECK
  ===================================== */
  try {

    const res = await fetch(`${window.API_BASE}/api/calculators/access`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    /* SESSION EXPIRED */
    if (res.status === 401) {

      localStorage.removeItem("token");

      go(
        "login.html",
        "Session expired. Please log in again."
      );

      return;
    }

    /* SUBSCRIPTION OR TRIAL ENDED */
    if (res.status === 403) {

      go(
        "payment.html",
        "Your trial or subscription has ended."
      );

      return;
    }

    if (!res.ok) {
      console.error("Guard error status:", res.status);
      return;
    }

    console.log("Access granted");

  } catch (err) {

    console.error("Guard fetch failed:", err);

    /* do not redirect on network errors */
  }

})();