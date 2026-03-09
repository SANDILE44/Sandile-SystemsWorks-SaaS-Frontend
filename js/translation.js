/* =====================================
   GOOGLE TRANSLATOR
===================================== */

function loadTranslator() {

  const translator = document.createElement("div");
  translator.id = "google_translate_element";

  translator.style.position = "fixed";
  translator.style.bottom = "15px";
  translator.style.right = "15px";
  translator.style.zIndex = "9999";

  document.body.appendChild(translator);

  window.googleTranslateElementInit = function () {

    new google.translate.TranslateElement(
      {
        pageLanguage: "en"
      },
      "google_translate_element"
    );

  };

  const script = document.createElement("script");

  script.src =
    "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";

  document.body.appendChild(script);

}