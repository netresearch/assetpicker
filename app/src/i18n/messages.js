// Translations, kept as one source per key ({ en, de } side by side) rather
// than a full duplicated key tree per locale. This keeps a single source of
// truth for translators AND avoids the copy-paste that SonarCloud (rightly)
// flags when the same key structure is repeated across locale objects. The
// source is pivoted into the vue-i18n { locale: { ...messages } } shape below.
//
// Pluralisation uses vue-i18n's `singular | plural`; `{name}` is named
// interpolation. Adapter packs merge their own namespaces at runtime via
// i18n.mergeLocaleMessage().
const SOURCE = {
  header: {
    title: { en: 'Explorer', de: 'Explorer' },
    search: { en: 'Search', de: 'Suchen' },
    minimize: { en: 'Minimize', de: 'Verkleinern' },
    maximize: { en: 'Maximize', de: 'Maximieren' },
  },
  login: {
    username: { en: 'User name', de: 'Benutzername' },
    password: { en: 'Password', de: 'Passwort' },
    login: { en: 'Login', de: 'Anmelden' },
    failure: { en: 'Your username or password were wrong', de: 'Benutzername oder Passwort sind falsch' },
  },
  types: {
    file: { en: 'File', de: 'Datei' },
    dir: { en: 'Directory', de: 'Verzeichnis' },
    category: { en: 'Category', de: 'Kategorie' },
  },
  descriptor: {
    type: { en: 'Item type', de: 'Elementtyp' },
    path: { en: 'Path', de: 'Pfad' },
    id: { en: 'ID', de: 'ID' },
    dimensions: { en: 'Dimensions', de: 'Abmessungen' },
    created: { en: 'Creation date', de: 'Erstellungsdatum' },
    modified: { en: 'Modification date', de: 'Änderungsdatum' },
    length: { en: 'Length', de: 'Länge' },
    pages: { en: 'Pages', de: 'Seiten' },
  },
  link: {
    download: { en: 'Download', de: 'Herunterladen' },
    open: { en: 'Open', de: 'Öffnen' },
  },
  stage: {
    nothingFound: { en: 'No proper results found', de: 'Keine passenden Ergebnisse gefunden' },
    noItems: { en: 'No items', de: 'Keine Elemente' },
  },
  footer: {
    pick: { en: 'Select', de: 'Auswählen' },
    cancel: { en: 'Cancel', de: 'Abbrechen' },
    loading: { en: 'Loading...', de: 'Lade...' },
    searching: { en: 'Searching...', de: 'Suche...' },
    items: { en: '{count} item | {count} items', de: '{count} Element | {count} Elemente' },
    results: { en: '{count} result | {count} results', de: '{count} Ergebnis | {count} Ergebnisse' },
    storages: { en: '{count} Storages', de: '{count} Speicher' },
    picked: { en: '{count} item picked | {count} items picked', de: '{count} Element ausgewählt | {count} Elemente ausgewählt' },
    resultsOverview: {
      en: '{results} in {count} storage | {results} in {count} storages',
      de: '{results} in {count} Speicher | {results} in {count} Speichern',
    },
  },
  date: {
    // https://github.com/taylorhakes/fecha#formatting-tokens
    full: { en: 'MM/DD/YYYY HH:mm', de: 'DD.MM.YYYY HH:mm' },
  },
};

export const AVAILABLE_LOCALES = ['en', 'de'];
export const DEFAULT_LOCALE = 'en';

function isLeaf(node) {
  return AVAILABLE_LOCALES.some((locale) => typeof node[locale] === 'string');
}

function pivot(source, locale) {
  const out = {};
  for (const [key, node] of Object.entries(source)) {
    out[key] = isLeaf(node) ? node[locale] : pivot(node, locale);
  }
  return out;
}

/** vue-i18n messages: { en: {...}, de: {...} }, pivoted from the per-key SOURCE. */
export const messages = Object.fromEntries(AVAILABLE_LOCALES.map((locale) => [locale, pivot(SOURCE, locale)]));
