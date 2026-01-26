// js/auth.js

function getToken() {
  return localStorage.getItem("token");
}

function setToken(token) {
  localStorage.setItem("token", token);
}

function clearToken() {
  localStorage.removeItem("token");
}

function logout() {
  clearToken();
  window.location.href = "login.html";
}

// Logged-in check
async function requireAuth() {
  const token = getToken();
  if (!token) {
    window.location.href = "login.html";
    return null;
  }

  try {
    return await window.api.getProfileRequest(token);
  } catch (err) {
    clearToken();
    window.location.href = "login.html";
    return null;
  }
}

// Paid OR trial check
async function requireAccess() {
  const token = getToken();
  if (!token) {
    window.location.href = "login.html";
    return null;
  }

  try {
    await window.api.apiFetch("/api/users/dashboard", { token });
    return true;
  } catch (err) {
    window.location.href = "payment.html";
    return null;
  }
}

// expose to HTML
window.auth = {
  getToken,
  setToken,
  clearToken,
  logout,
  requireAuth,
  requireAccess,
};
