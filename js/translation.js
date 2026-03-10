/* loader.js — drop in before </body>, touches zero HTML */
(function () {

  /* ── STYLES ── */
  const style = document.createElement('style');
  style.textContent = `
    #ssw-loader {
      position: fixed;
      inset: 0;
      background: #030a14;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 28px;
      z-index: 9999;
      transition: opacity 0.5s ease, visibility 0.5s ease;
    }

    #ssw-loader.hidden {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }

    .ssw-glow {
      position: absolute;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(0,213,255,0.18) 0%, transparent 70%);
      animation: sswGlowPulse 2s ease-in-out infinite;
    }

    @keyframes sswGlowPulse {
      0%, 100% { transform: scale(1);   opacity: 0.7; }
      50%       { transform: scale(1.25); opacity: 1; }
    }

    .ssw-logo {
      height: 64px;
      object-fit: contain;
      mix-blend-mode: screen;
      position: relative;
      z-index: 1;
      filter: drop-shadow(0 0 20px rgba(0,213,255,0.6));
      animation: sswLogoPulse 2s ease-in-out infinite;
    }

    @keyframes sswLogoPulse {
      0%, 100% { filter: drop-shadow(0 0 20px rgba(0,213,255,0.5)); }
      50%       { filter: drop-shadow(0 0 44px rgba(0,213,255,1));   }
    }

    .ssw-bar {
      width: 160px;
      height: 3px;
      background: rgba(255,255,255,0.06);
      border-radius: 999px;
      overflow: hidden;
      position: relative;
      z-index: 1;
    }

    .ssw-bar-fill {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #00d5ff, #0098b8);
      border-radius: 999px;
      box-shadow: 0 0 10px rgba(0,213,255,0.6);
      animation: sswBarFill 1.8s cubic-bezier(0.4,0,0.2,1) forwards;
    }

    @keyframes sswBarFill {
      0%   { width: 0%; }
      60%  { width: 75%; }
      100% { width: 100%; }
    }
  `;
  document.head.appendChild(style);

  /* ── BUILD LOADER ── */
  const loader = document.createElement('div');
  loader.id = 'ssw-loader';

  const glow = document.createElement('div');
  glow.className = 'ssw-glow';

  const logo = document.createElement('img');
  logo.src = 'images/Untitled design.png';
  logo.alt = 'Logo';
  logo.className = 'ssw-logo';

  const bar = document.createElement('div');
  bar.className = 'ssw-bar';

  const fill = document.createElement('div');
  fill.className = 'ssw-bar-fill';

  bar.appendChild(fill);
  loader.appendChild(glow);
  loader.appendChild(logo);
  loader.appendChild(bar);
  document.body.appendChild(loader);

  /* ── HIDE ON LOAD ── */
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 500);
    }, 1800);
  });

})();