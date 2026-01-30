window.loader = {
  show(text = 'Please wait…') {
    const el = document.getElementById('global-loader');
    if (!el) return;

    const p = el.querySelector('p');
    if (p) p.textContent = text;

    el.classList.remove('hidden');
  },

  hide() {
    const el = document.getElementById('global-loader');
    if (!el) return;

    el.classList.add('hidden');
  },
};
