/* ================================
   Sandile SystemsWorks – Secure Auth
================================ */

// 1. Check if token exists
function requireLogin() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html";
    } else {
        startAutoLogout();
    }
}

// 2. Modified Logout (Clears all tokens)
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
}

// 3. Auto-Logout (Keep your logic, it's good!)
let logoutTimer;
const INACTIVITY_LIMIT = 20 * 60 * 1000; // 20 Minutes

function resetLogoutTimer() {
    // Only run timer if a token actually exists (user is logged in)
    if (!localStorage.getItem("token")) return;

    clearTimeout(logoutTimer);
    logoutTimer = setTimeout(() => {
        // Instead of a sudden alert, maybe just log them out
        console.log("Session timed out");
        logout();
    }, INACTIVITY_LIMIT);
}

// Global Activity Listeners
["mousemove", "keydown", "scroll", "click"].forEach(event => {
    document.addEventListener(event, resetLogoutTimer);
});

function startAutoLogout() {
    resetLogoutTimer();
}

// 4. Display User Info from the "user" object we saved during Login
document.addEventListener("DOMContentLoaded", () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const displayEl = document.getElementById("usernameDisplay");
    
    if (displayEl && userData) {
        displayEl.textContent = userData.name;
    }

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) logoutBtn.onclick = logout;
});
