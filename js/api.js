/* ============================================================
   Sandile SystemsWorks – Centralized API Client (Pro Version)
   ============================================================ */

async function apiFetch(path, { method = 'GET', body, token } = {}) {
  // Guard against missing configuration
  if (!window.API_BASE) {
    console.error('❌ Configuration Error: API_BASE is missing.');
    throw new Error('API_BASE is not defined. Check config.js load order.');
  }

  const headers = { 'Content-Type': 'application/json' };
  
  // Attach the JWT token if provided
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${window.API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    // Handle empty responses or non-JSON responses gracefully
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      // Create a detailed error object to catch in your UI
      const error = new Error(data.error || 'Request failed');
      error.status = res.status;
      throw error;
    }

    return data;
  } catch (err) {
    console.error(`🌐 API Error [${path}]:`, err.message);
    throw err;
  }
}

/* =========================
   DOMAIN SPECIFIC REQUESTS
   ========================= */

window.api = {
  // --- AUTHENTICATION ---
  signupRequest: (name, email, password) =>
    apiFetch('/api/auth/signup', {
      method: 'POST',
      body: { name, email, password },
    }),

  loginRequest: (email, password) =>
    apiFetch('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    }),

  googleLoginRequest: (googleToken) =>
    apiFetch('/api/auth/google', {
      method: 'POST',
      body: { token: googleToken },
    }),

  getProfileRequest: (token) => 
    apiFetch('/api/auth/profile', { token }),

  // --- ACCESS CONTROL ---
  // Checks if user still has trial days or active paid status
  accessCheckRequest: (token) =>
    apiFetch('/api/calculators/access', { token }),

  // --- PAYMENTS (YOCO) ---
  createCheckoutRequest: (token) =>
    apiFetch('/api/payments/checkout', {
      method: 'POST',
      token,
    }),

  // Secure verification: requires the checkoutId from the URL after payment
  confirmPaymentRequest: (token, checkoutId) =>
    apiFetch('/api/payments/confirm', {
      method: 'POST',
      token,
      body: { checkoutId },
    }),
};
