// js/user-display.js
document.addEventListener('DOMContentLoaded', () => {
  const nameEl = document.getElementById('accountName');
  const avatarEl = document.getElementById('accountAvatar');

  if (!nameEl || !avatarEl) return;

  // Try to read stored user info (NO AUTH LOGIC)
  const rawUser =
    localStorage.getItem('user') ||
    localStorage.getItem('profile') ||
    localStorage.getItem('currentUser');

  if (!rawUser) {
    nameEl.textContent = 'Account';
    avatarEl.textContent = 'U';
    return;
  }

  let user;
  try {
    user = JSON.parse(rawUser);
  } catch {
    return;
  }

  const name = user.name || user.fullName || user.username || '';

  if (!name) return;

  nameEl.textContent = name;
  avatarEl.textContent = name.charAt(0).toUpperCase();
});

// js/account-menu.js
document.addEventListener('DOMContentLoaded', () => {
  const accountBtn = document.getElementById('accountBtn');
  const accountMenu = document.getElementById('accountMenu');

  if (!accountBtn || !accountMenu) return;

  // Toggle menu
  accountBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    accountMenu.classList.toggle('open');
  });

  // Close when clicking outside
  document.addEventListener('click', () => {
    accountMenu.classList.remove('open');
  });

  // Prevent menu clicks from closing it
  accountMenu.addEventListener('click', (e) => {
    e.stopPropagation();
  });
});
