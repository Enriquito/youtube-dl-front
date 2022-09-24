const AbstractEntity = require('./abstractEntity');

class Thumbnail extends AbstractEntity {
    video;
    height;
    width;
    resolution;
    url;
}

Thumbnail.table = 'thumbnails';

module.exports = Thumbnail;