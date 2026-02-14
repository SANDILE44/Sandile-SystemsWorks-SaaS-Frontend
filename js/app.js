// js/app.js
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

  const formatDate = (ms) => {
    if (!ms) return '—';
    return new Date(ms).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  /* =========================
     Account Dropdown
  ========================= */
  function initAccountDropdown() {
    const btn = $('accountBtn');
    const menu = $('accountMenu');
    if (!btn || !menu) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.toggle('open');
    });

    document.addEventListener('click', () => {
      menu.classList.remove('open');
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

    if ($('usernameDisplay')) $('usernameDisplay').textContent = name;
    if ($('accountName')) $('accountName').textContent = name;
    if ($('accountAvatar'))
      $('accountAvatar').textContent = name.charAt(0).toUpperCase();
  }

  /* =========================
     Access Resolution
  ========================= */
  function resolveAccess(user) {
    const now = Date.now();
    const calcSub = user?.subscriptions?.calculators || {};

    const subscriptionEnd = toMs(calcSub.subscriptionEnd);
    const trialEnd = toMs(calcSub.trialEnd);

    const subActive =
      calcSub.status === 'active' &&
      (!subscriptionEnd || subscriptionEnd > now);

    const trialActive =
      calcSub.status === 'trial' &&
      trialEnd > now;

    const expired = !subActive && !trialActive;

    return {
      subActive,
      trialActive,
      expired,
      subscriptionEnd,
      trialEnd,
    };
  }

  /* =========================
     Access Display
  ========================= */
  function renderAccessBadge(access) {
    const statAccess = $('statAccess');
    if (!statAccess) return;

    if (access.subActive) statAccess.textContent = 'Active';
    else if (access.trialActive) statAccess.textContent = 'Trial';
    else statAccess.textContent = 'Inactive';
  }

  function renderBilling(access) {
    const statBilling = $('statBilling');
    if (!statBilling) return;

    if (access.subActive) {
      statBilling.textContent = access.subscriptionEnd
        ? `Next billing: ${formatDate(access.subscriptionEnd)}`
        : 'Unlimited Access';
    } else if (access.trialActive) {
      statBilling.textContent = `Ends: ${formatDate(access.trialEnd)}`;
    } else {
      statBilling.textContent = 'Expired';
    }
  }

  function renderLastLogin() {
    const statLogin = $('statLogin');
    if (!statLogin) return;

    statLogin.textContent = new Date().toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  /* =========================
     Pay / Upgrade Box
  ========================= */
  function renderPayBox(access) {
    const payBox = $('payBox');
    if (!payBox) return;

    payBox.innerHTML = '';

    // PAID USERS → hide pay box
    if (access.subActive) return;

    // TRIAL USERS
    if (access.trialActive) {
      payBox.innerHTML = `
        <div class="upgrade-box">
          <p>Your trial ends on ${formatDate(access.trialEnd)}.</p>
          <button id="payBtn" class="btn btn-primary">Upgrade Now</button>
        </div>
      `;
    }

    // EXPIRED USERS
    if (access.expired) {
      payBox.innerHTML = `
        <div class="upgrade-box">
          <p>Your access has expired.</p>
          <button id="payBtn" class="btn btn-primary">Renew Subscription</button>
        </div>
      `;
    }

    const payBtn = $('payBtn');
    if (payBtn) {
      payBtn.addEventListener('click', async () => {
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
  }

  /* =========================
     Industry Search
  ========================= */
  function initIndustrySearch() {
    const input = $('industrySearch');
    const cards = [...document.querySelectorAll('.cards-grid .card')];
    const count = $('industryCount');
    if (!input || cards.length === 0) return;

    const render = () => {
      const q = input.value.toLowerCase().trim();
      let shown = 0;

      cards.forEach((card) => {
        const match = card.innerText.toLowerCase().includes(q);
        card.style.display = match ? '' : 'none';
        if (match) shown++;
      });

      if (count) count.textContent = `${shown}/${cards.length} showing`;
    };

    input.addEventListener('input', render);
    render();
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

      renderAccessBadge(access);
      renderBilling(access);
      renderLastLogin();
      renderPayBox(access);

      initIndustrySearch();
    } catch (err) {
      console.error('Dashboard init failed:', err);
    }
  });
})();
