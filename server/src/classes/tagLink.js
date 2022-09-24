const AbstractEntity = require('./abstractEntity');

class TagLink extends AbstractEntity {
    video;
    tag;
}

TagLink.table = 'tag_links'

module.exports = TagLink;