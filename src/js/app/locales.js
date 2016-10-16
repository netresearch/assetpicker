module.exports = {
    header: {
        title: {
            en: 'Explorer',
            de: 'Explorer'
        },
        search: {
            en: 'Search',
            de: 'Suchen'
        },
        minimize: {
            en: 'Minimize',
            de: 'Verkleinern'
        },
        maximize: {
            en: 'Maximize',
            de: 'Maximieren'
        }
    },
    login: {
        username: {
            en: 'User name',
            de: 'Benutzername'
        },
        password: {
            en: 'Password',
            de: 'Passwort'
        },
        login: {
            en: 'Login',
            de: 'Anmelden'
        },
        failure: {
            en: 'Your username or password were wrong',
            de: 'Benutzername oder Passwort sind falsch'
        }
    },
    types: {
        file: {
            en: 'File',
            de: 'Datei'
        },
        dir: {
            en: 'Directory',
            de: 'Verzeichnis'
        },
        category: {
            en: 'Category',
            de: 'Kategorie'
        }
    },
    descriptor: {
        type: {
            en: 'Item type',
            de: 'Elementtyp'
        },
        path: {
            en: 'Path',
            de: 'Pfad'
        },
        id: {
            en: 'ID',
            de: 'ID'
        },
        dimensions: {
            en: 'Dimensions',
            de: 'Abmessungen'
        },
        created: {
            en: 'Creation date',
            de: 'Erstellungsdatum'
        },
        modified: {
            en: 'Modification date',
            de: 'Änderungsdatum'
        },
        length: {
            en: 'Length',
            de: 'Länge'
        },
        pages: {
            en: 'Pages',
            de: 'Seiten'
        }
    },
    link: {
        download: {
            en: 'Download',
            de: 'Herunterladen'
        },
        open: {
            en: 'Open',
            de: 'Öffnen'
        }
    },
    stage: {
        nothingFound: {
            en: 'No proper results found',
            de: 'Keine passenden Ergebnisse gefunden'
        },
        noItems: {
            en: 'No items',
            de: 'Keine Elemente'
        }
    },
    footer: {
        pick: {
            en: 'Select',
            de: 'Auswählen'
        },
        cancel: {
            en: 'Cancel',
            de: 'Abbrechen'
        },
        loading: {
            en: 'Loading...',
            de: 'Lade...'
        },
        searching: {
            en: 'Searching...',
            de: 'Suche...'
        },
        items: {
            en: '{{summary.numItems}} item{{summary.numItems !== 1 ? "s" : ""}}',
            de: '{{summary.numItems}} Element{{summary.numItems !== 1 ? "e" : ""}}'
        },
        results: {
            en: '{{summary.numItems}} result{{summary.numItems !== 1 ? "s" : ""}}',
            de: '{{summary.numItems}} Ergebnis{{summary.numItems !== 1 ? "se" : ""}}'
        },
        storages: {
            en: '{{numStorages}} Storages',
            de: '{{numStorages}} Speicher'
        },
        picked: {
            en: '{{picked.length}} item{{picked.length !== 1 ? "s" : ""}} picked',
            de: '{{picked.length}} Element{{picked.length !== 1 ? "e" : ""}} ausgewählt'
        },
        resultsOverview: {
            en: '{{$interpolate(t("footer.results")) + " in " + summary.numStorages + " storage" + (summary.numStorages !== 1 ? "s" : "")}}',
            de: '{{$interpolate(t("footer.results")) + " in " + summary.numStorages + " Speicher" + (summary.numStorages !== 1 ? "n" : "")}}'
        }
    },
    date: {
        // https://github.com/taylorhakes/fecha#formatting-tokens
        full: {
            en: 'MM/DD/YYYY HH:mm',
            de: 'DD.MM.YYYY HH:mm'
        }
    }
};
