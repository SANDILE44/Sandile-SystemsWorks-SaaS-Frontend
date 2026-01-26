// js/api.js
async function apiFetch(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${window.API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  // Keep your original behavior + add status for debugging
  if (!res.ok) {
    const err = new Error(data.error || "Request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

// ---- AUTH CALLS ----
async function signupRequest(name, email, password) {
  return apiFetch("/api/users/signup", {
    method: "POST",
    body: { name, email, password },
  });
}

async function loginRequest(email, password) {
  return apiFetch("/api/users/login", {
    method: "POST",
    body: { email, password },
  });
}

async function getProfileRequest(token) {
  return apiFetch("/api/users/profile", { token });
}

// ---- PAYMENT ----
async function createCheckoutRequest(token) {
  return apiFetch("/api/payments/checkout", {
    method: "POST",
    token,
  });
}

async function confirmPaymentRequest(token) {
  return apiFetch("/api/payments/confirm", {
    method: "POST",
    token,
  });
}

// ✅ THIS IS CORRECT FOR HTML (unchanged)
window.api = {
  apiFetch,
  signupRequest,
  loginRequest,
  getProfileRequest,
  createCheckoutRequest,
  confirmPaymentRequest,
};
