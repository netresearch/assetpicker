// Base UI messages, converted from the legacy locales.js (which nested
// { key: { en, de } } and embedded JS pluralisation in mustaches) into the
// vue-i18n shape { locale: { ...messages } } with proper `singular | plural`
// pluralisation and named interpolation. Adapter packs merge their own
// namespaces at runtime via i18n.mergeLocaleMessage().

export const messages = {
  en: {
    header: {
      title: 'Explorer',
      search: 'Search',
      minimize: 'Minimize',
      maximize: 'Maximize',
    },
    login: {
      username: 'User name',
      password: 'Password',
      login: 'Login',
      failure: 'Your username or password were wrong',
    },
    types: {
      file: 'File',
      dir: 'Directory',
      category: 'Category',
    },
    descriptor: {
      type: 'Item type',
      path: 'Path',
      id: 'ID',
      dimensions: 'Dimensions',
      created: 'Creation date',
      modified: 'Modification date',
      length: 'Length',
      pages: 'Pages',
    },
    link: {
      download: 'Download',
      open: 'Open',
    },
    stage: {
      nothingFound: 'No proper results found',
      noItems: 'No items',
    },
    footer: {
      pick: 'Select',
      cancel: 'Cancel',
      loading: 'Loading...',
      searching: 'Searching...',
      items: '{count} item | {count} items',
      results: '{count} result | {count} results',
      storages: '{count} Storages',
      picked: '{count} item picked | {count} items picked',
      resultsOverview: '{results} in {count} storage | {results} in {count} storages',
    },
    date: {
      // https://github.com/taylorhakes/fecha#formatting-tokens
      full: 'MM/DD/YYYY HH:mm',
    },
  },
  de: {
    header: {
      title: 'Explorer',
      search: 'Suchen',
      minimize: 'Verkleinern',
      maximize: 'Maximieren',
    },
    login: {
      username: 'Benutzername',
      password: 'Passwort',
      login: 'Anmelden',
      failure: 'Benutzername oder Passwort sind falsch',
    },
    types: {
      file: 'Datei',
      dir: 'Verzeichnis',
      category: 'Kategorie',
    },
    descriptor: {
      type: 'Elementtyp',
      path: 'Pfad',
      id: 'ID',
      dimensions: 'Abmessungen',
      created: 'Erstellungsdatum',
      modified: 'Änderungsdatum',
      length: 'Länge',
      pages: 'Seiten',
    },
    link: {
      download: 'Herunterladen',
      open: 'Öffnen',
    },
    stage: {
      nothingFound: 'Keine passenden Ergebnisse gefunden',
      noItems: 'Keine Elemente',
    },
    footer: {
      pick: 'Auswählen',
      cancel: 'Abbrechen',
      loading: 'Lade...',
      searching: 'Suche...',
      items: '{count} Element | {count} Elemente',
      results: '{count} Ergebnis | {count} Ergebnisse',
      storages: '{count} Speicher',
      picked: '{count} Element ausgewählt | {count} Elemente ausgewählt',
      resultsOverview: '{results} in {count} Speicher | {results} in {count} Speichern',
    },
    date: {
      full: 'DD.MM.YYYY HH:mm',
    },
  },
};

export const AVAILABLE_LOCALES = Object.keys(messages);
export const DEFAULT_LOCALE = 'en';
