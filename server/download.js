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
        try{
            const insertVideoPrefix = "INSERT INTO downloads (video_id, title, status, process_id, url, format, audio_format, audio_only, playlist, download_status)";
            const values = [this.videoId, this.title, this.status, this.processId, this.url, this.format, this.audioFormat, this.audioOnly, this.playlist, this.downloadStatus];

            const temp = await Database.run(`${insertVideoPrefix} VALUES(?,?,?,?,?,?,?,?,?,?)`, values);

            this.id = temp.data.lastID;
        }
        catch(error){
            console.error(error);
        }
    }

    async update(){
        try{
            const query = `UPDATE downloads SET video_id = ?, title = ?, status = ? , process_id = ?, url = ?, 
                                    format = ?, audio_format = ?, audio_only = ?, playlist = ?, download_status = ? WHERE id = ?`;
            const values = [this.videoId, this.title, this.status, this.processId, 
                            this.url, this.format, this.audioFormat, this.audioOnly, 
                            this.playlist, this.downloadStatus, this.id];


            await Database.run(query, values);            
        }
        catch(error){
            console.error(error);
        }
    }

    static async find(values, findConditon = "id = ?"){
        return new Promise(async (resolve, reject) => {
            let db = null;

            try{
                db = Database.connect();

                const data = await Database.get(`SELECT * FROM downloads WHERE ${findConditon}`, values);

                const dl = new Download();

                dl.videoId = data.id;
                dl.title = data.title;
                dl.status = data.status;
                dl.processId = data.pid;
                dl.url = data.url;
                dl.format = data.format;
                dl.audioFormat = data.audioFormat;
                dl.audioOnly = data.audioOnly;
                dl.playlist = data.playlist;
                dl.downloadStatus = row.downloadStatus;

                resolve(dl);
            }
            catch(error){
                console.error(error);
                reject(error);
            }
            finally{
                Database.close(db);
            }
            
        });
    }

    static async all(findConditon, values){
        return new Promise(async (resolve, reject) => {
            try{
                let findQuery;

                if(findConditon != null)
                    findQuery = `WHERE ${findConditon}`;
                    
                const DBdownloads = await Database.all(`SELECT * FROM downloads ${findQuery}`, values);
    
                const downloads = [];
    
                DBdownloads.data.forEach(row => {
                    const dl = new Download();
    
                    dl.videoId = row.id;
                    dl.title = row.title;
                    dl.status = row.status;
                    dl.processId = row.pid;
                    dl.url = row.url;
                    dl.format = row.format;
                    dl.audioFormat = row.audioFormat;
                    dl.audioOnly = row.audioOnly;
                    dl.playlist = row.playlist;
                    dl.downloadStatus = row.downloadStatus;
    
                    downloads.push(dl);
                });
    
                resolve(downloads);
            }
            catch(error){
                console.error(error);
                reject(error);
            }
        });
    }

    remove(){
        return new Promise(async (resolve, reject) => {
            try{
                await Database.run("DELETE FROM downloads WHERE id = ?", this.id);
                resolve();
            }
            catch(error){
                console.error(error);
                reject(error);
            }
        });
    }
}

module.exports = Download;