// js/auth.js

function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  localStorage.setItem('token', token);
}

function clearToken() {
  localStorage.removeItem('token');
}

function logout() {
  clearToken();
  window.location.href = 'login.html';
}

// Logged-in check ONLY
async function requireAuth() {
  const token = getToken();

  if (!token) {
    window.location.href = 'login.html';
    return null;
  }

  try {
    return await window.api.getProfileRequest(token);
  } catch (err) {
    clearToken();
    window.location.href = 'login.html';
    return null;
  }
}

// Access check (trial OR paid — backend decides)
async function requireAccess() {
  const token = getToken();

  if (!token) {
    window.location.href = 'login.html';
    return null;
  }

  try {
    await window.api.apiFetch('/api/users/dashboard', { token });
    return true;
  } catch (err) {
    window.location.href = 'payment.html';
    return null;
  }
}

// Expose globally
window.auth = {
  getToken,
  setToken,
  clearToken,
  logout,
  requireAuth,
  requireAccess,
};
