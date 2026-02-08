// js/sectors.js
(() => {
  const $ = (id) => document.getElementById(id);

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
    if (!logoutBtn || !window.auth) return;

    logoutBtn.addEventListener('click', () => {
      window.auth.logout();
    });
  }

  /* =========================
     Soft user load (NO REDIRECT)
  ========================= */
  async function loadUserSoft() {
    if (!window.auth || !window.api) return;

    const token = window.auth.getToken();
    if (!token) return;

    try {
      const res = await window.api.getProfileRequest(token);
      const user = res?.user || res;
      if (!user) return;

      const name =
        user.name || (user.email ? user.email.split('@')[0] : 'Account');

      if ($('accountName')) $('accountName').textContent = name;
      if ($('accountAvatar'))
        $('accountAvatar').textContent = name.charAt(0).toUpperCase();
    } catch {
      // Silent fail — NO redirect
    }
  }

  /* =========================
     Boot
  ========================= */
  document.addEventListener('DOMContentLoaded', () => {
    initAccountDropdown();
    initLogout();
    loadUserSoft();
  });
})();
