/* ── MESSAGE ── */
const loginForm = document.getElementById('loginForm');
const msg = document.getElementById('msg');

function showMsg(text, type='') {
  msg.textContent = text;
  msg.className = type;
  msg.style.display = text ? 'block' : 'none';
}

/* ── EMAIL LOGIN ── */
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const btn      = loginForm.querySelector('button');
  showMsg('');
  if (!email)    return showMsg('Enter your email', 'error');
  if (!password) return showMsg('Enter your password', 'error');
  btn.disabled = true;

  const overlay = document.getElementById('global-loader');
  const loaderText = overlay?.querySelector('p');
  if (overlay) {
    if (loaderText) loaderText.textContent = 'Signing you in...';
    overlay.classList.remove('hidden');
  }

  try {
    const data = await window.api.loginRequest(email, password);
    if (!data?.token) throw new Error('Login failed');
    window.auth.setToken(data.token);
    window.location.replace('dashboard.html');
  } catch (err) {
    if (overlay) overlay.classList.add('hidden');
    btn.disabled = false;
    showMsg(err.message || 'Login failed', 'error');
  }
});

/* ── GOOGLE OVERLAY ── */
function showGoogleOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'g-overlay';

  const glow = document.createElement('div');
  glow.className = 'g-glow';

  const wrap = document.createElement('div');
  wrap.className = 'g-wrap';

  const ring = document.createElement('div');
  ring.className = 'g-ring';

  const logo = document.createElement('img');
  logo.src = 'images/Untitled design.png';
  logo.alt = 'Logo';
  logo.className = 'g-logo';

  /* CHECKMARK — centered using absolute positioning */
  const checkWrap = document.createElement('div');
  checkWrap.className = 'g-check-wrap';
  checkWrap.style.cssText = `
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;

  const circle = document.createElement('div');
  circle.className = 'g-circle';
  circle.style.cssText = `
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2.5px solid #00e87a;
    transform: scale(0);
  `;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.style.cssText = `
    width: 40px;
    height: 40px;
    stroke: #00e87a;
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
    position: relative;
    z-index: 1;
    filter: drop-shadow(0 0 8px rgba(0,232,122,0.9));
  `;

  /* Standard centered checkmark path for 24x24 viewBox */
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M5 13 l5 5 l9 -9');
  path.style.cssText = `
    stroke-dasharray: 30;
    stroke-dashoffset: 30;
    transition: stroke-dashoffset 0.45s ease 0.2s;
  `;

  svg.appendChild(path);
  checkWrap.appendChild(circle);
  checkWrap.appendChild(svg);
  wrap.appendChild(ring);
  wrap.appendChild(logo);
  wrap.appendChild(checkWrap);
  overlay.appendChild(glow);
  overlay.appendChild(wrap);
  document.body.appendChild(overlay);

  return { overlay, ring, logo, checkWrap, circle, path };
}

function triggerSuccess({ overlay, ring, logo, checkWrap, circle, path }) {
  ring.style.transition = 'opacity 0.3s ease';
  ring.style.opacity = '0';
  logo.style.transition = 'opacity 0.3s ease';
  logo.style.opacity = '0';

  setTimeout(() => {
    /* show check wrap */
    checkWrap.style.opacity = '1';

    /* pop circle */
    circle.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 1.2s ease-in-out infinite';
    circle.style.transform = 'scale(1)';
    circle.style.boxShadow = '0 0 30px rgba(0,232,122,0.6)';

    /* draw checkmark */
    path.style.strokeDashoffset = '0';
  }, 300);

  setTimeout(() => {
    overlay.style.transition = 'opacity 0.4s ease';
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 400);
  }, 1600);
}

/* ── GOOGLE LOGIN ── */
async function handleGoogleLogin(response) {
  const elements = showGoogleOverlay();

  try {
    const googleToken = response.credential;
    const data = await window.api.apiFetch('/api/auth/google', {
      method: 'POST',
      body: { token: googleToken }
    });

    if (!data?.token) throw new Error('Google login failed');

    window.auth.setToken(data.token);
    triggerSuccess(elements);

    setTimeout(() => {
      window.location.replace('dashboard.html');
    }, 1800);

  } catch (err) {
    elements.overlay.remove();
    console.error(err);
    showMsg('Google login failed', 'error');
  }
}