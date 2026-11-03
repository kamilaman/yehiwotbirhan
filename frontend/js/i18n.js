/**
 * BATU/ZIWAY Hiwot Birhan Church - i18n Internationalization Engine
 * Handles seamless switching between English and Amharic (አማርኛ)
 */

(function () {
  let currentLang = localStorage.getItem('church_lang') || 'en';

  function applyLanguage(lang) {
    if (!window.I18N_TRANSLATIONS || !window.I18N_TRANSLATIONS[lang]) return;
    
    currentLang = lang;
    localStorage.setItem('church_lang', lang);
    document.documentElement.lang = lang;

    const dict = window.I18N_TRANSLATIONS[lang];

    // Update Text Elements with [data-i18n]
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.textContent = dict[key];
      }
    });

    // Update Placeholders with [data-i18n-placeholder]
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key]) {
        el.setAttribute('placeholder', dict[key]);
      }
    });

    // Update Language Selector Buttons UI State
    document.querySelectorAll('[data-lang-btn]').forEach(btn => {
      const btnLang = btn.getAttribute('data-lang-btn');
      if (btnLang === lang) {
        btn.classList.add('bg-white', 'text-navy', 'shadow-sm', 'font-bold');
        btn.classList.remove('text-slate-600', 'hover:text-navy');
      } else {
        btn.classList.remove('bg-white', 'text-navy', 'shadow-sm', 'font-bold');
        btn.classList.add('text-slate-600', 'hover:text-navy');
      }
    });

    // Dispatch event for dynamic modules
    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
  }

  window.setLanguage = function (lang) {
    applyLanguage(lang);
  };

  window.getCurrentLanguage = function () {
    return currentLang;
  };

  document.addEventListener('DOMContentLoaded', () => {
    applyLanguage(currentLang);
  });
})();
