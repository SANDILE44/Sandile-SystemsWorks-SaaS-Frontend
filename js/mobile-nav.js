(function () {
  const hamburger = document.getElementById('hamburger');
  const sidebar = document.querySelector('.sidebar');

  // If page doesn't have mobile nav, do nothing
  if (!hamburger || !sidebar) return;

  const open = () => {
    sidebar.classList.add('mobile-open');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    sidebar.classList.remove('mobile-open');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', () => {
    sidebar.classList.contains('mobile-open') ? close() : open();
  });

  // Close on link click
  sidebar.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', close);
  });

  // Optional: close when resizing to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) close();
  });
})();
