(function() {
    "use strict";

    var STORAGE_KEY = "invoize_lang";

    function detectLocale() {
        // 1. Check URL parameter (?lang=de)
        var params = new URLSearchParams(window.location.search);
        var urlLang = params.get("lang");
        if (urlLang && SUPPORTED_LANGUAGES.indexOf(urlLang) !== -1) {
            return urlLang;
        }

        // 2. Check localStorage
        var stored = localStorage.getItem(STORAGE_KEY);
        if (stored && SUPPORTED_LANGUAGES.indexOf(stored) !== -1) {
            return stored;
        }

        // 3. Detect from browser locale
        var browserLangs = navigator.languages || [navigator.language || navigator.userLanguage || "en"];
        for (var i = 0; i < browserLangs.length; i++) {
            var code = browserLangs[i].split("-")[0].toLowerCase();
            if (SUPPORTED_LANGUAGES.indexOf(code) !== -1) {
                return code;
            }
        }

        // 4. Default to English
        return DEFAULT_LANGUAGE;
    }

    function applyTranslations(lang) {
        var t = TRANSLATIONS[lang];
        if (!t) return;

        // Update html lang attribute
        document.documentElement.lang = lang;

        // Update page title if translation exists
        var pageTitle = t.support_page_title || "Invoize - Professional Invoicing for Mac";
        if (document.body.getAttribute("data-page") === "support") {
            document.title = t.support_page_title || pageTitle;
        } else {
            // For index page, construct title from hero
            document.title = "Invoize - " + (t.hero_title || "Professional Invoicing for Mac");
        }

        // Apply all data-i18n text content
        var elements = document.querySelectorAll("[data-i18n]");
        for (var i = 0; i < elements.length; i++) {
            var key = elements[i].getAttribute("data-i18n");
            if (t[key] !== undefined) {
                elements[i].innerHTML = t[key];
            }
        }

        // Update active state in language switcher
        var langButtons = document.querySelectorAll(".lang-dropdown-menu a");
        for (var j = 0; j < langButtons.length; j++) {
            var btn = langButtons[j];
            if (btn.getAttribute("data-lang") === lang) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        }

        // Update the displayed language code in the toggle
        var toggle = document.querySelector(".lang-toggle-code");
        if (toggle) {
            toggle.textContent = t._flag || lang.toUpperCase();
        }

        // Save preference
        localStorage.setItem(STORAGE_KEY, lang);
    }

    function switchLanguage(lang) {
        if (SUPPORTED_LANGUAGES.indexOf(lang) === -1) return;
        applyTranslations(lang);

        // Remove ?lang= param from URL without reload
        if (window.history && window.history.replaceState) {
            var url = new URL(window.location);
            url.searchParams.delete("lang");
            window.history.replaceState({}, "", url);
        }
    }

    function initLanguageSwitcher() {
        // Add click handlers to language dropdown items
        document.addEventListener("click", function(e) {
            var langLink = e.target.closest("[data-lang]");
            if (langLink) {
                e.preventDefault();
                var lang = langLink.getAttribute("data-lang");
                switchLanguage(lang);
                // Close dropdown
                var dropdown = document.querySelector(".lang-dropdown");
                if (dropdown) dropdown.classList.remove("open");
                return;
            }

            // Toggle dropdown
            var toggleBtn = e.target.closest(".lang-toggle");
            if (toggleBtn) {
                e.preventDefault();
                var dd = toggleBtn.closest(".lang-dropdown");
                if (dd) dd.classList.toggle("open");
                return;
            }

            // Close dropdown when clicking outside
            var openDropdown = document.querySelector(".lang-dropdown.open");
            if (openDropdown && !openDropdown.contains(e.target)) {
                openDropdown.classList.remove("open");
            }
        });
    }

    // Initialize when DOM is ready
    function init() {
        var lang = detectLocale();
        applyTranslations(lang);
        initLanguageSwitcher();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
