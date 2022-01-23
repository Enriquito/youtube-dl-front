const Database = require("./database");

class Download{
    constructor(){
        this.id;
        this.videoId;
        this.title;
        this.status;
        this.processId;
        this.url;
        this.format;
        this.audioFormat;
        this.audioOnly;
        this.playlist;
        this.downloadStatus;
    }

    async save(){
        let db  = null;

        try{
            db  = await Database.connect();
            await this.saveDownload(db);
        }
        catch(error){
            console.error(error);
        }
    }

    static async all(){
        let db = null
        try{
            db = await Database.connect();
            return await this.getAll(db);
        }
        catch(error){
            console.error(error);
        }
    }

    getAll(db){
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM downloads", (error,rows) => {
                if(error){
                    reject(error);
                    console.error(error);
                    return;
                }

                resolve(rows);
            });
        });
    }

    saveDownload(db){
        return new Promise((resolve, reject) => {
            
            const insertVideoPrefix = "INSERT INTO downloads (video_id, title, status, process_id, url, format, audio_format, audio_only, playlist, download_status)";
            const values = [this.videoId, this.title, this.status, this.processId, this.url, this.format, this.audioFormat, this.audioOnly, this.playlist, this.downloadStatus];
    
            db.serialize(() => {
                db.run(`${insertVideoPrefix} VALUES(?,?,?,?,?,?,?,?,?,?)`, values, function(error){
                    if(error){
                        console.error(error);
                        reject(error);
                        return;
                    }

                    resolve(this.lastID);
                });
            });
        });
    }
}

module.exports = Download;