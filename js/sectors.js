// js/sectors.js
(() => {
  const $ = (id) => document.getElementById(id);

  /* =========================
     Helpers
  ========================= */
  const toMs = (v) => {
    if (!v) return 0;
    if (typeof v === 'number') return v;
    const t = new Date(v).getTime();
    return Number.isFinite(t) ? t : 0;
  };

  /* =========================
     Account dropdown
  ========================= */
  function initAccountDropdown() {
    const btn = $('accountBtn');
    const menu = $('accountMenu');
    if (!btn || !menu) return;

    const close = () => menu.classList.remove('open');

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.toggle('open');
    });

    document.addEventListener('click', close);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  }

  function initLogout() {
    const logoutBtn = $('logoutBtn');
    if (!logoutBtn) return;
    logoutBtn.addEventListener('click', () => window.auth.logout());
  }

  /* =========================
     User UI
  ========================= */
  function setUserUI(user) {
    const name =
      user?.name || (user?.email ? user.email.split('@')[0] : 'Account');

    if ($('accountName')) $('accountName').textContent = name;
    if ($('accountAvatar'))
      $('accountAvatar').textContent = name.charAt(0).toUpperCase();
  }

  /* =========================
     Access resolution
  ========================= */
  function resolveAccess(user) {
    const now = Date.now();
    const subscriptionEnd = toMs(user.subscriptionEnd);
    const trialEnd = toMs(user.trialEnd);

    return {
      subActive: subscriptionEnd > now,
      trialActive: trialEnd > now,
    };
  }

  /* =========================
     Guard industry links
  ========================= */
  function guardIndustryLinks(access) {
    if (access.subActive || access.trialActive) return;

    document.querySelectorAll('a[href^="industry-"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  /* =========================
     Expired access banner
  ========================= */
  function renderExpiredNotice(access) {
    if (access.subActive || access.trialActive) return;

    const main = document.querySelector('.main-content');
    if (!main) return;

    const box = document.createElement('div');
    box.className = 'pay-box';
    box.innerHTML = `
      <p class="status expired">
        Your access has expired. Renew to unlock industry calculators.
      </p>
      <button id="renewBtn" class="btn btn-primary">
        Renew subscription
      </button>
    `;

    main.prepend(box);

    $('renewBtn').addEventListener('click', async () => {
      try {
        const token = window.auth.getToken();
        const data = await window.api.createCheckoutRequest(token);
        if (!data?.checkoutUrl) throw new Error('Checkout failed');
        window.location.href = data.checkoutUrl;
      } catch (err) {
        alert(err.message || 'Payment failed');
      }
    });
  }

  /* =========================
     Recent activity logger
     (configure per page)
  ========================= */
  async function logRecentSector(meta) {
    try {
      const token = window.auth.getToken();
      if (!token) return;

      await fetch(
        'https://sandile-systemsworks-saas-backend-2.onrender.com/api/users/recent-calculators',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
          body: JSON.stringify(meta),
        }
      );
    } catch (_) {}
  }

  /* =========================
     Boot
  ========================= */
  document.addEventListener('DOMContentLoaded', async () => {
    initAccountDropdown();
    initLogout();

    try {
      const profile = await window.auth.requireAuth();
      if (!profile?.user) return;

      const user = profile.user;
      setUserUI(user);

      const access = resolveAccess(user);
      guardIndustryLinks(access);
      renderExpiredNotice(access);

      // 👇 CHANGE THIS PER PAGE
      logRecentSector({
        key: 'sector-primary',
        title: 'Primary Sector Industries',
        url: 'sector-primary.html',
      });
    } catch (err) {
      console.error('Sector page init failed:', err);
    }
  });
})();
