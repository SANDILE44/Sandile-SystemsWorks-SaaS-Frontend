// js/auth.js
// ==========================
// TOKEN STORAGE
// ==========================
function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  localStorage.setItem('token', token);
}

function clearToken() {
  localStorage.removeItem('token');
}

// ==========================
// LOGOUT
// ==========================
function logout() {
  clearToken();
  window.location.href = 'login.html';
}

// ==========================
// AUTH CHECK (LOGIN REQUIRED)
// ==========================
async function requireAuth() {
  const token = getToken();

  if (!token) {
    window.location.href = 'login.html';
    return null;
  }

  try {
    // Verify token + get profile
    const res = await window.api.apiFetch('/api/users/profile', { token });
    return res; // { user: {...} }
  } catch (err) {
    console.warn('Auth failed, clearing token');
    clearToken();
    window.location.href = 'login.html';
    return null;
  }
}

// ==========================
// ACCESS CHECK (TRIAL OR PAID)
// ==========================
async function requireAccess() {
  const token = getToken();

  if (!token) {
    window.location.href = 'login.html';
    return null;
  }

  try {
    // Backend decides trial/sub validity
    await window.api.apiFetch('/api/users/dashboard', { token });
    return true;
  } catch (err) {
    window.location.href = 'payment.html';
    return null;
  }
}

// ==========================
// GLOBAL EXPORT
// ==========================
window.auth = {
  getToken,
  setToken,
  clearToken,
  logout,
  requireAuth,
  requireAccess,
};
