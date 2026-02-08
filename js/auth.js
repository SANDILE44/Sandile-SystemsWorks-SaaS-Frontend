// ==========================
// TOKEN STORAGE
// ==========================
const TOKEN_KEY = 'token';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// ==========================
// LOGOUT
// ==========================
function logout() {
  clearToken();
  window.location.href = 'login.html';
}

// ==========================
// INACTIVITY AUTO-LOGOUT
// ==========================
const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes
let inactivityTimer = null;

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    console.warn('Logged out due to inactivity');
    logout();
  }, INACTIVITY_LIMIT);
}

function initInactivityTracking() {
  const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];

  events.forEach((event) =>
    window.addEventListener(event, resetInactivityTimer, { passive: true })
  );

  resetInactivityTimer();
}

// ==========================
// AUTH CHECK (SOFT – NO FORCE REDIRECT)
// ==========================
let cachedUser = null;

/**
 * Use this ONLY on pages that REQUIRE login.
 * Sector / UX pages should NOT call this automatically.
 */
async function requireAuth() {
  if (cachedUser) return cachedUser;

  const token = getToken();
  if (!token) return null;

  try {
    const res = await window.api.getProfileRequest(token);
    cachedUser = res;
    initInactivityTracking();
    return res;
  } catch (err) {
    clearToken();
    return null;
  }
}

// ==========================
// HARD AUTH (FOR GUARDED PAGES ONLY)
// ==========================
async function requireAuthOrRedirect() {
  const user = await requireAuth();
  if (!user) {
    window.location.href = 'login.html';
    return null;
  }
  return user;
}

// ==========================
// ACCESS CHECK (TRIAL / PAID)
// ==========================
async function requireAccess() {
  const token = getToken();
  if (!token) {
    window.location.href = 'login.html';
    return null;
  }

  try {
    await window.api.apiFetch('/api/users/dashboard', { token });
    return true;
  } catch {
    window.location.href = 'payment.html';
    return null;
  }
}

// ==========================
// READ-ONLY USER (FOR UI FILES)
// ==========================
function getCachedUser() {
  return cachedUser;
}

// ==========================
// GLOBAL EXPORT
// ==========================
window.auth = {
  getToken,
  setToken,
  clearToken,
  logout,

  // soft auth
  requireAuth,

  // hard auth (use intentionally)
  requireAuthOrRedirect,

  // paid check
  requireAccess,

  // UI access
  getCachedUser,
};
