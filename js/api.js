async function apiFetch(path, { method = 'GET', body, token } = {}) {
  if (!window.API_BASE) {
    throw new Error('API_BASE is not defined. Check config.js load order.');
  }

  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${window.API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data.error || 'Request failed');
    error.status = res.status;
    throw error;
  }

  return data;
}

// ---- AUTH ----
const signupRequest = (name, email, password) =>
  apiFetch('/api/auth/signup', {
    method: 'POST',
    body: { name, email, password },
  });

const loginRequest = (email, password) =>
  apiFetch('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });

const getProfileRequest = (token) => apiFetch('/api/auth/profile', { token });

// ---- PAYMENTS ----
const createCheckoutRequest = (token, product) =>
  apiFetch('/api/payments/checkout', {
    method: 'POST',
    token,
    body: { product },
  });

const confirmPaymentRequest = (token, product) =>
  apiFetch('/api/payments/confirm', {
    method: 'POST',
    token,
    body: { product },
  });

window.api = {
  signupRequest,
  loginRequest,
  getProfileRequest,
  createCheckoutRequest,
  confirmPaymentRequest,
};
