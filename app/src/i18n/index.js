import { createI18n } from 'vue-i18n';
import { messages, AVAILABLE_LOCALES, DEFAULT_LOCALE } from './messages.js';

/**
 * Resolve the effective locale, mirroring the legacy behaviour:
 * `auto` (or empty) derives from the browser language; an explicit but
 * unavailable language warns and falls back to the default.
 *
 * @param {string} [language] configured language ('auto' | 'en' | 'de' | ...)
 * @param {string} [navigatorLanguage] e.g. navigator.language ('de-DE')
 * @returns {string}
 */
export function resolveLocale(language, navigatorLanguage) {
  let lang;
  if (!language || language === 'auto') {
    lang = String(navigatorLanguage || DEFAULT_LOCALE).slice(0, 2).toLowerCase();
  } else {
    lang = language;
  }
  if (!AVAILABLE_LOCALES.includes(lang)) {
    if (language && language !== 'auto') {
      console.warn('Configured language %s is not available', language);
    }
    lang = DEFAULT_LOCALE;
  }
  return lang;
}

/**
 * Build the vue-i18n instance for the app.
 *
 * @param {string} [language] configured language
 * @returns {import('vue-i18n').I18n}
 */
export function createAppI18n(language) {
  const navigatorLanguage = typeof navigator !== 'undefined' ? navigator.language : undefined;
  return createI18n({
    legacy: false,
    locale: resolveLocale(language, navigatorLanguage),
    fallbackLocale: DEFAULT_LOCALE,
    messages,
  });
}
