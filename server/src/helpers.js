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

module.exports.getObjectLength = (object) => {
    let length = 0;
    for( let key in object ) {
        if(object.hasOwnProperty(key)) {
            length++;
        }
    }

    return length;
};

module.exports.snakeToCamel = (str) =>
    str.toLowerCase().replace(/([-_][a-z])/g, group =>
        group
            .toUpperCase()
            .replace('-', '')
            .replace('_', '')
    );

module.exports.camelToSnake = str => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);