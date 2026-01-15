/* ================================
   Sandile SystemsWorks – Auth Core
   JS-only Auth (MVP / Demo Gate)
   With Auto-Logout on Inactivity
================================ */

/* 🔐 MANUAL USERS (YOU CONTROL THIS) */
const USERS = {
  "thabethesandile44@gmail.com": {
    password: "12345",
    name: "Sandile"
  }
};

/* ================================
   LOGIN
================================ */
function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Please enter email and password");
    return;
  }

  if (USERS[email] && USERS[email].password === password) {
    localStorage.setItem("ssw_logged_in", "true");
    localStorage.setItem("ssw_user_email", email);
    localStorage.setItem("ssw_user_name", USERS[email].name);

    // Start auto-logout timer
    startAutoLogout();

    window.location.href = "dashboard.html";
  } else {
    alert("Invalid login details");
  }
}

/* ================================
   REQUIRE LOGIN (PROTECT PAGES)
================================ */
function requireLogin() {
  const loggedIn = localStorage.getItem("ssw_logged_in");
  if (loggedIn !== "true") {
    window.location.href = "login.html";
  } else {
    // Start auto-logout timer on page load
    startAutoLogout();
  }
}

/* ================================
   DISPLAY USER NAME
================================ */
function displayUsername() {
  const name = localStorage.getItem("ssw_user_name");
  const el = document.getElementById("usernameDisplay");

  if (el && name) {
    el.textContent = name;
  }
}

/* ================================
   LOGOUT
================================ */
function logout() {
  localStorage.removeItem("ssw_logged_in");
  localStorage.removeItem("ssw_user_email");
  localStorage.removeItem("ssw_user_name");

  window.location.href = "login.html";
}

/* ================================
   AUTO-WIRE LOGOUT BUTTON
================================ */
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }
});

/* ================================
   AUTO-LOGOUT AFTER INACTIVITY
================================ */
let logoutTimer;
const INACTIVITY_LIMIT = 20 * 60 * 1000; // 20 minutes

function resetLogoutTimer() {
  clearTimeout(logoutTimer);
  logoutTimer = setTimeout(() => {
    alert("You have been logged out due to inactivity.");
    logout();
  }, INACTIVITY_LIMIT);
}

// Reset timer on user activity
["mousemove", "keydown", "scroll", "touchstart"].forEach(event => {
  document.addEventListener(event, resetLogoutTimer);
});

function startAutoLogout() {
  resetLogoutTimer();
}
