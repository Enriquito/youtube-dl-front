const Database = require('./database');
const Video = require('./video');

const Settings = require('./settings');
const {exec} = require("child_process");
const {emitEvent} = require("../helpers");

class Download {
    id;
    videoId;
    title;
    status;
    processId;
    url;
    format;
    audioFormat;
    audioOnly;
    playlist;
    downloadStatus;

    async save(){
        try{
            const query = `INSERT INTO downloads (video_id, title, status, process_id, url, format, audio_format, audio_only, playlist, download_status) VALUES(?,?,?,?,?,?,?,?,?,?)`;
            const values = [this.videoId, this.title, this.status, this.processId, this.url, this.format, this.audioFormat, this.audioOnly, this.playlist, this.downloadStatus];

            const temp = await Database.run(query, values);

            this.id = temp.data.lastID;
        }
        catch(error){
            console.error(error);
        }
    }

    static getInfo(url, options = null){
        return new Promise((resolve, reject) => {
            try{
                let command = `youtube-dl --skip-download --dump-json ${url}`;

                if(options !== null)
                    if(options.format && options.audioFormat)
                        command = `youtube-dl --skip-download --dump-json -f ${options.format}+${options.audioFormat} ${url}`;

                exec(command, (error, stdout, stderr) => {
                    if(error || stderr){
                        reject({success: false, messages: error, code: 101});
                        return;
                    }

                    const obj = JSON.parse(stdout);

                    resolve(obj);
                });
            }
            catch(error){
                console.log(error);
                emitEvent('systemMessages', {type: 'Error', messages: error.messages.messages});
                reject({success: false, messages: error, code: 100});
            }
        });
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

    static async find(values, findCondition = "id = ?"){
        return new Promise(async (resolve, reject) => {
            try{
                const data = await Database.get(`SELECT * FROM downloads WHERE ${findCondition}`, values);

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

    static async all(findCondition, values){
        return new Promise(async (resolve, reject) => {
            try{
                let findQuery;

                if(findCondition != null)
                    findQuery = `WHERE ${findCondition}`;
                    
                const Downloads = await Database.all(`SELECT * FROM downloads ${findQuery}`, values);
    
                const downloads = [];
    
                Downloads.data.forEach(row => {
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

    getOptions() {
        return {
            audioOnly : this.audio_only,
            format: this.format,
            audioFormat: this.audio_format,
            playlist: this.playlist
        }
    }

    toVideo(){
        return new Promise(async (resolve, reject) => {
            try{
                const settings = new Settings();
                await settings.load();

                const options = {
                    audioOnly : this.audio_only,
                    format: this.format,
                    audioFormat: this.audio_format,
                    playlist: this.playlist
                }
        
                const fileInfo = await Download.getInfo(this.url, options);
                const video = new Video();
                
                video.title = fileInfo.title;
                video.uploaderUrl = fileInfo.channel_url;
                video.viewCount = fileInfo.view_count;
                video.duration = fileInfo.duration;
                
                if(options.audioOnly)
                    video.extention = 'mp3';
                else
                    video.extention = 'mp4';
        
                video.fileName = fileInfo.id;
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

    static CreateDownloadObject(fileInfo, downloadProcessID, options){
        const dl = new Download();

        dl.videoId = fileInfo.id;
        dl.title = fileInfo.title;
        dl.status = 'downloading';
        dl.processId = downloadProcessID;
        dl.url = fileInfo.webpage_url;
        dl.format = options.format;
        dl.audioFormat = options.audioFormat;
        dl.audioOnly = options.audioOnly;
        dl.playlist = options.playlist;
        dl.downloadStatus = 0;

        return dl;
    }
}

module.exports = Download;