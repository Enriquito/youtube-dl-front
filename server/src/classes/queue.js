const Database = require("./database");
const Download = require("./download");
const {emitEvent} = require('../helpers');

class Queue {
    items = [];

    add(download) {
        return new Promise(async (resolve, reject) => {
            try{
                this.items.push(download);
                emitEvent('downloadQueue', this.items);

                console.log(`added video: ${download.url} to the queue`);

                resolve();
            }
            catch(error){
                reject({success: false, messages: error, code: 100});
            }
        });
    }

    load(){
        return new Promise(async (resolve, reject) => {
            try{
                const queueItems = await Database.all(`SELECT * FROM downloads WHERE status = 'queued'`);

                queueItems.data.forEach(download => {
                    const dl = new Download();

                    dl.videoId = download.video_id;
                    dl.title = download.title;
                    dl.status = download.status;
                    dl.url = download.url;
                    dl.format = download.format;
                    dl.audioFormat = download.audioFormat;
                    dl.audioOnly = download.audioOnly;
                    dl.playlist = download.playlist;
                    dl.downloadStatus = 0;

                    this.items.push(dl);
                });

                emitEvent('downloadStatus', this.items);
                resolve();
            }
            catch(error){
                reject(error);
            }
        });
    }

    count() {
        return this.items.length;
    }

    shift() {
        return this.items.shift()
    }

    getItems() {
        return this.items;
    }
}

module.exports = Queue;