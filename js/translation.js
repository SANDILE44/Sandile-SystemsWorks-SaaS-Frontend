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