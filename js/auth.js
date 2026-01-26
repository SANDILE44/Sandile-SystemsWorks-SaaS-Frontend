// js/auth.js
// Keeps your existing features: token helpers, logout, requireAuth, requireAccess
// Adds: safer storage, optional user cache, and stronger logout (clears common keys)

(function () {
  const TOKEN_KEY = "token";
  const USER_KEY = "user"; // optional if you ever store user/profile

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function setToken(token) {
    if (!token) return;
    localStorage.setItem(TOKEN_KEY, token);
  }

  function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  }

  // Optional helpers (won’t break anything if you don’t use them)
  function setUser(user) {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user || {}));
    } catch (_) {}
  }

  function getUser() {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function clearUser() {
    localStorage.removeItem(USER_KEY);
  }

  function logout() {
    // Clear everything that could “make it feel logged in”
    clearToken();
    clearUser();
    // Add any extra keys you might store later (safe even if they don’t exist)
    localStorage.removeItem("hasPaid");
    localStorage.removeItem("profile");

    // Hard redirect
    window.location.href = "login.html";
  }

  // Logged-in check (token must exist + profile must be valid)
  async function requireAuth() {
    const token = getToken();
    if (!token) {
      window.location.href = "login.html";
      return null;
    }

    try {
      const profile = await window.api.getProfileRequest(token);
      // Optional caching
      if (profile?.user) setUser(profile.user);
      return profile;
    } catch (err) {
      clearToken();
      clearUser();
      window.location.href = "login.html";
      return null;
    }
  }

  // Paid OR trial check (your backend decides)
  async function requireAccess() {
    const token = getToken();
    if (!token) {
      window.location.href = "login.html";
      return null;
    }

    try {
      // must throw on 401/402 etc
      await window.api.apiFetch("/api/users/dashboard", { token });
      return true;
    } catch (err) {
      // If backend says "not paid", go payment. If token invalid, go login.
      // If your apiFetch includes status, this will be perfect.
      // If not, this still works as “default to payment”.
      if (err?.status === 401 || err?.status === 403) {
        clearToken();
        clearUser();
        window.location.href = "login.html";
        return null;
      }

      window.location.href = "payment.html";
      return null;
    }
  }

  // Expose BOTH ways so your HTML can call either:
  // - onclick="logout()"
  // - onclick="window.auth.logout()"
  window.auth = {
    getToken,
    setToken,
    clearToken,
    getUser,
    setUser,
    clearUser,
    logout,
    requireAuth,
    requireAccess,
  };

  // Keep this for your current button: onclick="logout()"
  // (this avoids “logout is not defined”)
  window.logout = logout;
})();
