import { describe, it, expect, vi } from 'vitest';
import { createI18n } from 'vue-i18n';
import { messages } from '../src/i18n/messages.js';
import { resolveLocale, createAppI18n } from '../src/i18n/index.js';

describe('resolveLocale', () => {
  it('derives the browser language on auto', () => {
    expect(resolveLocale('auto', 'de-DE')).toBe('de');
    expect(resolveLocale('auto', 'en-US')).toBe('en');
  });

  it('falls back to en for an unavailable browser language', () => {
    expect(resolveLocale('auto', 'fr-FR')).toBe('en');
  });

  it('honours an explicit available language', () => {
    expect(resolveLocale('de')).toBe('de');
  });

  it('warns and falls back for an explicit unavailable language', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(resolveLocale('es')).toBe('en');
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });
});

describe('messages', () => {
  const i18n = createI18n({ legacy: false, locale: 'en', fallbackLocale: 'en', messages });
  const { t } = i18n.global;

  it('resolves simple keys per locale', () => {
    expect(t('footer.pick')).toBe('Select');
    i18n.global.locale.value = 'de';
    expect(t('footer.pick')).toBe('Auswählen');
    i18n.global.locale.value = 'en';
  });

  it('pluralises count strings', () => {
    expect(t('footer.items', { count: 1 }, 1)).toBe('1 item');
    expect(t('footer.items', { count: 3 }, 3)).toBe('3 items');
    expect(t('footer.items', { count: 0 }, 0)).toBe('0 items');
  });

  it('pluralises German results with the correct suffix', () => {
    i18n.global.locale.value = 'de';
    expect(t('footer.results', { count: 1 }, 1)).toBe('1 Ergebnis');
    expect(t('footer.results', { count: 2 }, 2)).toBe('2 Ergebnisse');
    i18n.global.locale.value = 'en';
  });

  it('composes the results overview via named interpolation', () => {
    expect(t('footer.resultsOverview', { results: '5 results', count: 2 }, 2)).toBe('5 results in 2 storages');
  });
});

describe('createAppI18n', () => {
  it('builds a working instance honouring the configured language', () => {
    const i18n = createAppI18n('de');
    expect(i18n.global.locale.value).toBe('de');
    expect(i18n.global.t('header.search')).toBe('Suchen');
  });
});
