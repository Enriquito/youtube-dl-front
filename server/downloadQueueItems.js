const Media = require('./media');
const {readDatabase} = require('./helpers');


const downloadQueueItems = async () =>{
    const db = await readDatabase();

    for(let i = 0; i < db.downloads.length; i++){
        let el = db.downloads[i];

        if(el.status === 'queued'){
            const media = new Media();

            media.url = el.url;
            media.options = el.options;

            await media.Download();
        }
    }
}

downloadQueueItems();