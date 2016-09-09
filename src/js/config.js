module.exports = {
    title: 'AssetPicker',
    storages: {
        entermediaDB: {
            adapter: 'entermediadb',
            url: 'http://dam:8080',
            proxy: true
        },
        github: {
            adapter: 'github',
            username: 'netresearch',
            repository: 'assetpicker'
        }
    },
    proxy: {
        url: 'proxy/?to={{url}}',
        all: false
    },
    github: {
        //token: 'j2332dwedcdj33dx3jm8389xdq'
    }
};