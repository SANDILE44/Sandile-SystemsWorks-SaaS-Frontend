/* early-adopter-bar.js — inject before </body>, touches zero HTML */
(function () {

  /* don't show on auth or internal pages */
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
      background: #030a14;
      border-top: 1.5px solid rgba(0,213,255,0.25);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 10px 40px 10px 16px;
      z-index: 9000;
      box-shadow: 0 -8px 32px rgba(0,0,0,0.6);
      animation: barSlideUp 0.4s cubic-bezier(0.16,1,0.3,1);
      gap: 5px;
    }

    @keyframes barSlideUp {
      from { transform: translateY(100%); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }

    #ssw-bar.dismissed {
      animation: barSlideDown 0.3s ease forwards;
      pointer-events: none;
    }

    @keyframes barSlideDown {
      to { transform: translateY(100%); opacity: 0; }
    }

    .ssw-bar-row1 {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: 6px;
      width: 100%;
    }

    .ssw-bar-row2 {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: 8px;
      width: 100%;
    }

    .ssw-bar-tag {
      font-size: 0.74rem;
      font-weight: 800;
      color: #00d5ff;
      letter-spacing: 0.04em;
      white-space: nowrap;
    }

    .ssw-bar-dot {
      width: 3px;
      height: 3px;
      border-radius: 50%;
      background: rgba(0,213,255,0.35);
      flex-shrink: 0;
    }

    .ssw-bar-spots {
      font-size: 0.72rem;
      font-weight: 800;
      color: #00e87a;
      white-space: nowrap;
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
      font-weight: 700;
      color: #4a6a85;
      text-decoration: line-through;
      white-space: nowrap;
    }

    .ssw-bar-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: linear-gradient(135deg, #25d366, #1da851);
      color: #fff;
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
      box-shadow: 0 4px 14px rgba(37,211,102,0.25);
    }

    .ssw-bar-btn:hover {
      filter: brightness(1.1);
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(37,211,102,0.35);
    }

    .ssw-bar-btn svg {
      width: 14px;
      height: 14px;
      fill: #fff;
      flex-shrink: 0;
    }

    .ssw-bar-close {
      background: none;
      border: none;
      color: #4a6a85;
      font-size: 1rem;
      cursor: pointer;
      padding: 6px;
      line-height: 1;
      transition: color 0.2s ease;
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
    }

    .ssw-bar-close:hover {
      color: #e8f0f8;
    }

    body.ssw-bar-active {
      padding-bottom: 78px;
    }

    @media (min-width: 640px) {
      #ssw-bar {
        flex-direction: row;
        height: 52px;
        padding: 0 48px 0 20px;
        gap: 10px;
      }

      .ssw-bar-row1,
      .ssw-bar-row2 {
        width: auto;
        flex-wrap: nowrap;
      }

      body.ssw-bar-active {
        padding-bottom: 52px;
      }
    }
  `;
  document.head.appendChild(style);

  /* ── WHATSAPP LINK ── */
  const waNumber = '27833062796';
  const waMessage = encodeURIComponent('Hi Sandile, I want to claim the Early Adopter spot at R6,999/month for Sandile SystemsWorks.');
  const waLink = `https://wa.me/${waNumber}?text=${waMessage}`;

  /* ── BUILD BAR ── */
  const bar = document.createElement('div');
  bar.id = 'ssw-bar';

  bar.innerHTML = `
    <div class="ssw-bar-row1">
      <span class="ssw-bar-tag">🔥 Early Adopter — 5 Spots Only</span>
      <div class="ssw-bar-dot"></div>
      <span class="ssw-bar-price">R6,999/month</span>
      <div class="ssw-bar-dot"></div>
      <span class="ssw-bar-old">R12,499</span>
      <div class="ssw-bar-dot"></div>
      <span class="ssw-bar-spots">Locked in forever</span>
    </div>
    <div class="ssw-bar-row2">
      <span class="ssw-bar-desc">3 days free · No card required · Cancel anytime</span>
      <a href="${waLink}" target="_blank" rel="noopener" class="ssw-bar-btn">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        Claim Your Spot on WhatsApp
      </a>
    </div>
    <button class="ssw-bar-close" id="ssw-bar-close" aria-label="Dismiss">✕</button>
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
