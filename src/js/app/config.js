module.exports = {
    title: 'AssetPicker',
    storages: {
        entermediaDB: {
            adapter: 'entermediadb',
            url: 'http://em9.entermediadb.org/openinstitute',
            proxy: true
        },
        github: {
            adapter: 'github',
            username: 'netresearch',
            repository: 'assetpicker'
        }
    },
    proxy: {
        url: 'proxy.php?to={{url}}',
        all: false
    },
    github: {
        //token: 'j2332dwedcdj33dx3jm8389xdq'
    },
    picker: {
        multiple: false,
        types: ['file'],
        extensions: []
    }
};
