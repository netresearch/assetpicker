module.exports = {
    title: 'AssetPicker',
    storages: {
        /* entermediaDB: {
            adapter: 'entermediadb',
            url: 'http://em9.entermediadb.org/openinstitute',
            proxy: true
        },
        github: {
            adapter: 'github',
            username: 'netresearch',
            repository: 'assetpicker'
        } */
    },
    proxy: {
        url: 'proxy.php?to={{url}}',
        all: false
    },
    github: {
        //tokenBla: 'j2332dwedcdj33dx3jm8389xdq'
    },
    pick: {
        limit: 1,
        types: ['file'],
        extensions: []
    },
    language: 'auto',
    debug: false,
    adapters: {
        github: {
            src: 'adapter/github.js',
            name: 'AssetPickerAdapterGithub'
        },
        entermediadb: {
            src: 'adapter/entermediadb.js',
            name: 'AssetPickerAdapterEntermediadb'
        }
    }
};
