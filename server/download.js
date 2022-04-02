const Database = require('./database');
const Video = require('./video');

const Settings = require('./settings');

class Download {
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
            try{
                const data = await Database.get(`SELECT * FROM downloads WHERE ${findConditon}`, values);

                if(data.data === null){ 
                    resolve(null);
                    return;
                }

                const dl = new Download();

                dl.id = data.data.id;
                dl.videoId = data.data.video_id;
                dl.title = data.data.title;
                dl.status = data.data.status;
                dl.processId = data.data.pid;
                dl.url = data.data.url;
                dl.format = data.data.format;
                dl.audioFormat = data.data.audioFormat;
                dl.audioOnly = data.data.audioOnly;
                dl.playlist = data.data.playlist;
                dl.downloadStatus = data.data.downloadStatus;

                resolve(dl);
            }
            catch(error){
                console.error(error);
                reject(error);
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
                    
                    dl.id = row.id;
                    dl.videoId = row.video_id;
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

    toVideo(){
        return new Promise(async (resolve, reject) => {
            try{
                const Downloader = require('./downloader');
                const settings = new Settings();
                await settings.load();

                const options = {
                    audioOnly : this.audio_only,
                    format: this.format,
                    audioFormat: this.audio_format,
                    playlist: this.playlist
                }
        
                const fileInfo = await Downloader.getDownloadInfo(this.url, options);
                const video = new Video();
                
                video.title = fileInfo.title;
                video.uploaderUrl = fileInfo.channel_url;
                video.viewCount = fileInfo.view_count;
                video.duration = fileInfo.duration;
                
                if(options.audioOnly)
                    video.extention = 'mp3';
                else
                    video.extention = 'mp4';
        
                video.fileName = fileInfo.id; //was the 'fname' variable
                video.fileLocation = settings.output_location; //downloadOptions.directory;
                video.url = fileInfo.webpage_url;
                video.videoProviderId = fileInfo.id;
                video.uploaderName = fileInfo.uploader;
                video.description = fileInfo.description;
                video.tags = fileInfo.tags;
                video.thumbnails = fileInfo.thumbnails;
                video.options = options;
        
                resolve(video);
            }
            catch(error){
                reject(error);
            }
        });
    }
}

module.exports = Download;