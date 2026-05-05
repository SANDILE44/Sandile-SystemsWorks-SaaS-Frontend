(async function guardCalculators() {
  const token = localStorage.getItem("token");
  let redirected = false;

  function go(url, message) {
    if (redirected) return;
    redirected = true;
    localStorage.setItem("authMessage", message);
    localStorage.setItem("afterLogin", window.location.pathname);
    window.location.replace(url);
  }

  /* =====================================
     NOT LOGGED IN: UI OVERLAY
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
        font-family: 'Inter', sans-serif;
        text-align:center;
        padding:20px;
        animation: fadeIn 0.4s ease-in;
      ">
        <style>@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }</style>
        <div style="
          max-width:420px;
          background:#0f172a;
          padding:40px 30px;
          border-radius:16px;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);
        ">
          <h2 style="margin-bottom:12px; font-size: 24px;">Access Restricted</h2>
          <p style="opacity:0.7; margin-bottom:28px; line-height:1.6;">
            Please log in to Sandile SystemsWorks to access your decision engine and saved deals.
          </p>
          <button id="goLogin" style="
            background:#2563eb;
            color:white;
            border:none;
            padding:14px 24px;
            border-radius:10px;
            font-size:16px;
            font-weight:600;
            cursor:pointer;
            width:100%;
            transition: background 0.2s;
          ">
            Log in to continue
          </button>
        </div>
      </div>
    `;

    document.getElementById("goLogin").onclick = () => go("login.html", "Please log in.");
    return;
  }

  /* =====================================
     SAFETY CHECK
  ===================================== */
  if (!window.API_BASE) {
    console.error("SystemsWorks: API_BASE not defined in config.");
    return;
  }

  /* =====================================
     ACCESS & SUBSCRIPTION CHECK
  ===================================== */
  try {
    const res = await fetch(`${window.API_BASE}/api/calculators/access`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (res.status === 401) {
      localStorage.removeItem("token");
      go("login.html", "Your session has expired.");
      return;
    }

    if (res.status === 403) {
      // 7-day trial expired logic
      go("payment.html", "Your 7-day trial has ended. Upgrade to keep accessing your saved data.");
      return;
    }

    if (!res.ok) throw new Error("Server response error");

    console.log("Access verified: Welcome back.");

  } catch (err) {
    console.error("Guard Error:", err);
    // If the server is down, we usually let them stay on the page 
    // rather than locking them out, but that's up to you.
  }
})();
