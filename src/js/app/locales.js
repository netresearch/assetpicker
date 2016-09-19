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
    adapters: {
        github: {
            en: 'Repository {{config.username}}/{{config.repository}} on GitHub',
            de: 'Repository {{config.username}}/{{config.repository}} auf GitHub'
        },
        entermediadb: {
            en: 'EnterMediaDB on {{config.url}}',
            de: 'EnterMediaDB auf {{config.url}}'
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
        items: {
            en: '{{summary.numItems}} item{{summary.numItems !== 1 ? "s" : ""}}',
            de: '{{summary.numItems}} Element{{summary.numItems !== 1 ? "e" : ""}}'
        },
        results: {
            en: '{{summary.numItems}} result{{summary.numItems !== 1 ? "s" : ""}}',
            de: '{{summary.numItems}} Ergebniss{{summary.numItems !== 1 ? "e" : ""}}'
        },
        storages: {
            en: '{{numStorages}} Storages',
            de: '{{numStorages}} Speicher'
        },
        picked: {
            en: '{{picked.length}} item{{picked.length !== 1 : "s" : ""}} picked',
            de: '{{picked.length}} Element{{picked.length !== 1 : "e" : ""}} ausgewählt'
        },
        resultsOverview: {
            en: '{{$interpolate(t("footer.results")) + " in " + summary.numStorages + " storage" + (summary.numStorages > 1 ? "s" : "")}}',
            de: '{{$interpolate(t("footer.results")) + " in " + summary.numStorages + " Speicher" + (summary.numStorages > 1 ? "n" : "")}}'
        }
    }
};
