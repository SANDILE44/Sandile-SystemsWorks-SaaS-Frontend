// ===============================
// GLOBAL LOADER
// ===============================

(function () {

const overlay = document.getElementById("global-loader");
const text = overlay ? overlay.querySelector("p") : null;

/* ===============================
SHOW LOADER
=============================== */

function show(message = "Please wait…") {

if (!overlay) return;

if (text) text.textContent = message;

overlay.classList.remove("hidden");

}

/* ===============================
HIDE LOADER
=============================== */

function hide() {

if (!overlay) return;

overlay.classList.add("hidden");

}

/* ===============================
REDIRECT HELPER
=============================== */

function redirect(url, message = "Loading...") {

show(message);

setTimeout(() => {
window.location.href = url;
}, 400);

}

/* ===============================
WAKE SERVER (RENDER COLD START)
=============================== */

function wakeServer(){

if (!window.API_BASE) return;

fetch(`${window.API_BASE}/health`).catch(()=>{});

}

window.addEventListener("load", wakeServer);


/* ===============================
GLOBAL ACCESS
=============================== */

window.loader = {
show,
hide,
redirect,
wakeServer
};

})();