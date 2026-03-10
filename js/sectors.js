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

/* =====================================
   AUTO GOOGLE TRANSLATE
===================================== */

(function(){

try{

const translator = document.createElement("div");

translator.id = "google_translate_element";
translator.style.position = "fixed";
translator.style.bottom = "15px";
translator.style.right = "15px";
translator.style.zIndex = "9999";

document.body.appendChild(translator);


/* Detect visitor language */

const userLang = navigator.language || navigator.userLanguage;


/* Google init */

window.googleTranslateElementInit = function(){

new google.translate.TranslateElement(
{
pageLanguage: "en",
includedLanguages: "en,id,fr,es,de,pt,zh,ar,hi",
autoDisplay: false
},
"google_translate_element"
);


/* Auto translate after load */

setTimeout(() => {

const select = document.querySelector(".goog-te-combo");

if(select){

select.value = userLang.slice(0,2);
select.dispatchEvent(new Event("change"));

}

},2000);

};


const script = document.createElement("script");

script.src =
"https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";

document.body.appendChild(script);

}

catch(err){

console.error("Translator failed:", err);

}

})();
