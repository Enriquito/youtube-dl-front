module.exports.isDownloading = (downloads) => {
    let isDownloading = false;

    downloads.forEach(download => {
        if(download.status === 'downloading')
            isDownloading = true;
    });

    return isDownloading;
}

module.exports.emitEvent = (type, value) => {
    const io = require('socket.io-client');
    const socket = io.connect('http://localhost:3000');

    socket.on('connect', () => {
        socket.emit('emitEvents', type, value);
        socket.disconnect();
    });
}

module.exports.getRootDir= () => {
    return __dirname
}