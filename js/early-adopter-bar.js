/* early-adopter-bar.js — inject before </body>, touches zero HTML */
(function () {

  /* don't show on auth pages */
  const path = window.location.pathname;
  if (/login|signup|dashboard|payment|success/.test(path)) return;

  /* only show once per session */
  if (sessionStorage.getItem('ssw-bar-dismissed')) return;

  /* ── STYLES ── */
  const style = document.createElement('style');
  style.textContent = `
    #ssw-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 52px;
      background: #030a14;
      border-top: 1.5px solid rgba(0,213,255,0.25);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      z-index: 9000;
      box-shadow: 0 -8px 32px rgba(0,0,0,0.5);
      animation: barSlideUp 0.4s cubic-bezier(0.16,1,0.3,1);
      gap: 12px;
    }

    @keyframes barSlideUp {
      from { transform: translateY(100%); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }

    #ssw-bar.dismissed {
      animation: barSlideDown 0.3s ease forwards;
    }

    @keyframes barSlideDown {
      to { transform: translateY(100%); opacity: 0; }
    }

    .ssw-bar-left {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    .ssw-bar-tag {
      font-size: 0.75rem;
      font-weight: 800;
      color: #00d5ff;
      letter-spacing: 0.02em;
      white-space: nowrap;
    }

    .ssw-bar-dot {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: rgba(0,213,255,0.4);
      flex-shrink: 0;
    }

    .ssw-bar-spots {
      font-size: 0.72rem;
      font-weight: 700;
      color: #ff9500;
      white-space: nowrap;
    }

    .ssw-bar-mid {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      justify-content: center;
    }

    .ssw-bar-price {
      font-size: 0.88rem;
      font-weight: 800;
      color: #fff;
      white-space: nowrap;
    }

    .ssw-bar-desc {
      font-size: 0.72rem;
      font-weight: 500;
      color: #4a6a85;
      white-space: nowrap;
    }

    .ssw-bar-old {
      font-size: 0.72rem;
      font-weight: 600;
      color: #4a6a85;
      text-decoration: line-through;
      white-space: nowrap;
    }

    .ssw-bar-right {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }

    .ssw-bar-btn {
      background: linear-gradient(135deg, #00d5ff, #0098b8);
      color: #000;
      font-weight: 800;
      font-size: 0.76rem;
      padding: 7px 14px;
      border-radius: 8px;
      text-decoration: none;
      border: none;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s ease;
      font-family: inherit;
      letter-spacing: 0.1px;
    }

    .ssw-bar-btn:hover {
      filter: brightness(1.1);
      transform: translateY(-1px);
    }

    .ssw-bar-close {
      background: none;
      border: none;
      color: #4a6a85;
      font-size: 1rem;
      cursor: pointer;
      padding: 4px;
      line-height: 1;
      transition: color 0.2s ease;
      flex-shrink: 0;
    }

    .ssw-bar-close:hover {
      color: #e8f0f8;
    }

    /* push page content up so bar doesn't cover footer */
    body.ssw-bar-active {
      padding-bottom: 52px;
    }

    /* MOBILE */
    @media (max-width: 600px) {
      .ssw-bar-mid { display: none; }
      .ssw-bar-tag { font-size: 0.7rem; }
      .ssw-bar-btn { font-size: 0.72rem; padding: 6px 12px; }
      #ssw-bar { padding: 0 14px; }
    }
  `;
  document.head.appendChild(style);

  /* ── BUILD BAR ── */
  const bar = document.createElement('div');
  bar.id = 'ssw-bar';

  bar.innerHTML = `
    <div class="ssw-bar-left">
      <span class="ssw-bar-tag">🔥 Early Adopter</span>
      <div class="ssw-bar-dot"></div>
      <span class="ssw-bar-spots">5 Spots Left</span>
    </div>

    <div class="ssw-bar-mid">
      <span class="ssw-bar-price">R6,999/month</span>
      <span class="ssw-bar-desc">locked forever</span>
      <div class="ssw-bar-dot"></div>
      <span class="ssw-bar-old">R12,499</span>
    </div>

    <div class="ssw-bar-right">
      <a href="signup.html" class="ssw-bar-btn">Start Free Trial →</a>
      <button class="ssw-bar-close" id="ssw-bar-close" aria-label="Dismiss">✕</button>
    </div>
  `;

  document.body.appendChild(bar);
  document.body.classList.add('ssw-bar-active');

  /* ── DISMISS ── */
  document.getElementById('ssw-bar-close').addEventListener('click', () => {
    bar.classList.add('dismissed');
    sessionStorage.setItem('ssw-bar-dismissed', '1');
    setTimeout(() => {
      bar.remove();
      document.body.classList.remove('ssw-bar-active');
    }, 300);
  });

})();