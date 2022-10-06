const AbstractEntity = require('./abstractEntity');
const Database = require('./database');
const moment = require('moment');

class ChannelVideoIndex extends AbstractEntity {
    channelId;
    ytVideoId;
    title;
    duration;
    thumbnail;
    videoUrl;
    downloadedAt;

    async setVideoAsDownloaded(id, removeDownloadedAt = false) {
        return new Promise((resolve, reject) => {
            try {
                const query = `UPDATE ${this.constructor.table} SET downloaded_at = ? WHERE yt_video_id = ?`;

                Database.run(query, [removeDownloadedAt ? null :this.getTimeNow(), id]);

                resolve()
            }
            catch (error) {
                reject(error)
            }
        });
    }

    getTimeNow() {
        const now = moment(new Date())

        return now.format("YYYY-MM-DD HH:mm:ss");
    }
}

ChannelVideoIndex.table = 'channel_video_index';

module.exports = ChannelVideoIndex;