module.exports = {
    storages: {
        entermediaDB: {
            adapter: 'entermediadb',
            url: 'http://dam:8080',
            thumbnailUrl: 'http://localhost:8080/assets/emshare/views/modules/asset/downloads/preview/thumb/{{asset.sourcepath | encodeURI}}/thumb.jpg',
            proxy: true
        },
        github: {
            adapter: 'github',
            username: 'laravel',
            repository: 'laravel',
            auth: {
                username: 'copitz',
                token: '75c832960f756e9d6c44846491d3c37cd455746b'
            }
        }
    },
    proxy: {
        url: 'proxy/?to={{url}}',
        all: false
    }
};