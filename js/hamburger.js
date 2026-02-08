// js/hamburger.js
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger');
  const sidebar = document.querySelector('.sidebar');

  if (!hamburger || !sidebar) {
    console.warn('Hamburger or sidebar not found');
    return;
  }

  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    sidebar.classList.toggle('mobile-open');
  });

  // Close when clicking outside sidebar
  document.addEventListener('click', (e) => {
    if (
      sidebar.classList.contains('mobile-open') &&
      !sidebar.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      sidebar.classList.remove('mobile-open');
    }
  });
});
