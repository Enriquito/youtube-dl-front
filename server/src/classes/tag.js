const AbstractEntity = require('./abstractEntity');

class Tag extends AbstractEntity {
    tag;
}

Tag.table = 'tags';

module.exports = Tag;