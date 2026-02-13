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
     Account dropdown
  ========================= */
  function initAccountDropdown() {
    const btn = $('accountBtn');
    const menu = $('accountMenu');
    if (!btn || !menu) return;

    const close = () => {
      menu.classList.remove('open');
      menu.setAttribute('aria-hidden', 'true');
    };

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.toggle('open');
      menu.setAttribute(
        'aria-hidden',
        menu.classList.contains('open') ? 'false' : 'true'
      );
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

    if ($('usernameDisplay')) $('usernameDisplay').textContent = name;
    if ($('accountName')) $('accountName').textContent = name;
    if ($('accountAvatar'))
      $('accountAvatar').textContent = name.charAt(0).toUpperCase();
  }

  /* =========================
     Access resolution
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

    return {
      now,
      subscriptionEnd,
      trialEnd,
      subActive,
      trialActive,
    };
  }

  /* =========================
     Sidebar access badge
  ========================= */
  function renderAccessBadge(access) {
    const badge = $('accessStatus');
    const text = $('accessText');
    if (!badge || !text) return;

    badge.classList.remove('free', 'paid', 'expired');

    if (access.subActive) {
      badge.classList.add('paid');
      text.textContent = 'Subscription active';
    } else if (access.trialActive) {
      badge.classList.add('free');
      text.textContent = 'Free access';
    } else {
      badge.classList.add('expired');
      text.textContent = 'Access expired';
    }
  }

  /* =========================
     Dashboard stats
  ========================= */
  function renderDashboardStats(access) {
    const statAccess = $('statAccess');
    const statBilling = $('statBilling');
    const statLogin = $('statLogin');

    if (statAccess) {
      statAccess.textContent = access.subActive
        ? 'Active'
        : access.trialActive
          ? 'Trial'
          : 'Inactive';
    }

    if (statBilling) {
      if (access.subActive) {
        statBilling.textContent = `Next billing: ${formatDate(
          access.subscriptionEnd
        )}`;
      } else if (access.trialActive) {
        statBilling.textContent = `Ends: ${formatDate(access.trialEnd)}`;
      } else {
        statBilling.textContent = 'Expired';
      }
    }

    if (statLogin) {
      statLogin.textContent = new Date().toLocaleDateString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
  }

  /* =========================
     Pay / renew box (UPDATED)
  ========================= */
  function renderPayBox(access) {
    const payBox = $('payBox');
    if (!payBox) return;

    // PAID USER → hide box
    if (access.subActive) {
      payBox.innerHTML = '';
      return;
    }

    // TRIAL USER → show upgrade button
    if (access.trialActive) {
      payBox.innerHTML = `
        <p class="status free">
          You are currently on a free trial. Upgrade anytime for uninterrupted access.
        </p>
        <button id="payBtn" class="btn btn-primary">Upgrade Now</button>
      `;
    } else {
      // EXPIRED USER → renew
      payBox.innerHTML = `
        <p class="status expired">
          Your access has expired. Renew to continue using business calculators.
        </p>
        <button id="payBtn" class="btn btn-primary">Renew subscription</button>
      `;
    }

    $('payBtn').addEventListener('click', async () => {
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
     Industry search
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
     Guard sector links
  ========================= */
  function guardLinks(access) {
    if (access.subActive || access.trialActive) return;

    document.querySelectorAll('a[href$=".html"]').forEach((a) => {
      const href = a.getAttribute('href') || '';
      if (href.startsWith('sector-')) {
        a.addEventListener('click', (e) => {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      }
    });
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
      renderDashboardStats(access);
      renderPayBox(access);
      guardLinks(access);
      initIndustrySearch();
    } catch (err) {
      console.error('Dashboard init failed:', err);
    }
  });
})();
