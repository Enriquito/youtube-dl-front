const { spawn, exec } = require('child_process');
const fs = require('fs');
const {writeDatabase, readDatabase} = require('./helpers');
const {settings} = require('../config/settings.json');

class Media
{
    constructor(url, options){
        this.url = url;
        this.options = options;
        this.info;
        this.io;
    }

    AddToQueue(){
        return new Promise(async (resolve, reject) => {
            try{
                let db = await readDatabase();
                let fileInfo = await this.GetInfo(this.url,this.options);

                db.downloads.push({
                    id: fileInfo.id,
                    title: fileInfo.title,
                    status: 'queued',
                    downloadStatus: 0,
                    url: this.url,
                    options: this.options
                });

                await writeDatabase(db);

                this.io.to('ydl').emit('systemMessages', {type: "Success", messages: `Download '${fileInfo.title} has been added to the queue.`});
                resolve({success: true, messages: `Download '${fileInfo.title} has been added to the queue.`, code: 3});
            }
            catch(error){
                reject({success: false, messages: error, code: 100});
            }
        });
    }
    GetDownloadOptions(){
        let directory = settings.outputLocation;
        const args = [];

        if(this.options.audioOnly && this.options.playlist){
            args.push('--extract-audio');
            args.push('--audio-format')
            args.push('--yes-playlist')
            args.push('mp3');
        }
        else if(this.options.audioOnly && !this.options.playlist){
            args.push('--extract-audio');
            args.push('--audio-format')
            args.push('mp3');
        }
        else if(this.options.playlist){
            console.log('a');
        }
        else if(this.options.format && this.options.audioFormat){
            args.push(`-f`);
            args.push(`${this.options.format}+${this.options.audioFormat}`);
        }
        else if(this.options.format && this.options.audioFormat !== null){

        }
        else{
            args.push(`--recode-video`);
            args.push(`mp4`);
        }

        args.push('--output');
        args.push(`${directory}/%(id)s.%(ext)s`);
        args.push('--console-title');
        args.push(this.url);

        return {
            directory: directory,
            args: args
        };
    }
    static GetDownloadInfo(url){
        return new Promise((resolve, reject) => {

            let command = `youtube-dl -J ${url}`;

            exec(command, (error, stdout, stderr) => {
                if(error){
                    reject(error);
                    return;
                }

                resolve(JSON.parse(stdout));
            });
        });
    }
    PreparePlayListItems(){
        return new Promise(async (resolve, reject) => {
            try{
                const download = spawn('youtube-dl', ['--skip-download', '--dump-json', '--flat-playlist', this.url]);
                const temp = [];

                download.stdout.on('data',async data => {
                    if(data.toString().match(/^\{/).length === 1){
                        const obj = JSON.parse(data.toString());
                        temp.push(obj);
                    }                
                });

                const playlist = [];

                download.on('close', async () => {
                    for(let i = 0; i < temp.length; i++){
                        const m = new Media();
                        m.url = `https://www.youtube.com/watch?v=${temp[i].id}`;
                        m.options = {
                            format: null,
                            audioFormat: null,
                            audioOnly: false,
                            playlist: false
                        };
                        m.io = this.io;
                        playlist.push(m);
                    }

                    resolve(playlist);
                });
            }
            catch(error){
                reject(error);
            }
        });
    }
    GetInfo(){
        return new Promise((resolve, reject) => {
            try{
                let command;

                if(this.options.format && this.options.audioFormat)
                    command = `youtube-dl --skip-download --dump-json -f ${this.options.format}+${this.options.audioFormat} ${this.url}`;
                else
                    command = `youtube-dl --skip-download --dump-json ${this.url}`;

                exec(command, (error, stdout, stderr) => {
                    if(error){
                        reject({success: false, messages: error, code: 100});
                        return;
                    }

                    resolve(JSON.parse(stdout));
                });
            }
            catch(error){
                console.log(error);
                reject({success: false, messages: error, code: 100});
            }
        });
    }
    CheckForDoubleVideos(database, fname){
        let found = false;

        database.videos.forEach(video => {
            if(video.fileName === fname){
                found = true;
            }
        });

        return found;
    }
    GetFormat(fileInfo){
        let formatNote;

        fileInfo.formats.forEach(format => {
            if(format.format_id === this.options.format)
                formatNote = format.format_note;
        })

        return formatNote;
    }
    Download(){
        return new Promise(async (resolve, reject) => {
            try{
                console.log(`Download started for file: ${this.url}`);

                const downloadOptions = this.GetDownloadOptions();
                let fileInfo = await this.GetInfo(this.url,this.options);
                let formatNote = this.GetFormat(fileInfo);
                let db = await readDatabase();
                let extention;
                let fname;
                this.io.to('ydl').emit('systemMessages', {type: "Success", messages: `Download started for ${fileInfo.title}`});

                if(this.options.audioOnly)
                        extention = "mp3";
                else
                    extention = fileInfo.ext;

                fname = `${fileInfo.title.replace(/[:<>"/|?*]/, '')}`;

                if(formatNote !== undefined)
                    fname = `${fname} - ${formatNote}.${extention}`;
                else
                    fname = `${fname}.${extention}`;

                if(this.CheckForDoubleVideos(db, fname)){
                    resolve({success: false, messages: 'Item already excist', code: 2});
                    return;
                }

                db.downloads.forEach((el,index) => {
                    if(el.id === fileInfo.id){
                        db.downloads.splice(index,1);
                    }
                });

                let downloadsIndex = (db.downloads.length);

                db.downloads.push({
                    id: fileInfo.id,
                    title: fileInfo.title,
                    status: 'downloading',
                    downloadStatus: 0
                });

                this.io.to('ydl').emit('downloadStatus', db);

                await writeDatabase(db);

                const download = spawn('youtube-dl', downloadOptions.args);

                let status;
                let oldStatus = 0;

                download.stdout.on('data',async data => {
                    const downloadStatus = data.toString().match(/(\d+)\.(\d)%/);

                    if(downloadStatus != null){
                        if(parseInt(downloadStatus[1]) > oldStatus){
                            db = await readDatabase();
                            status = parseInt(downloadStatus[1]);
                            oldStatus = status;


                            db.downloads[downloadsIndex].downloadStatus = status;
                            this.io.to('ydl').emit('downloadStatus', db);
                        }
                    }
                });

                download.on('close', async () => {

                    while(fs.existsSync(`${downloadOptions.directory}/${fileInfo.id}.${extention}`)){
                        fs.renameSync(`${downloadOptions.directory}/${fileInfo.id}.${extention}`,`${downloadOptions.directory}/${fname}`);
                    }

                    this.info = {
                        thumbnails : fileInfo.thumbnails,
                        title: fileInfo.title,
                        resolution: {
                            width: fileInfo.width,
                            heigth: fileInfo.height
                        },
                        tags : fileInfo.tags,
                        duration : fileInfo.duration,
                        uploader : fileInfo.uploader,
                        viewCount : fileInfo.view_count,
                        id : fileInfo.id,
                        description : fileInfo.description,
                        uploaderUrl : fileInfo.channel_url,
                        extention : extention,
                        format : fileInfo.format_note,
                        videoUrl : fileInfo.webpage_url,
                        fileLocation: downloadOptions.directory,
                        fileName: fname
                    }

                    db.downloads[downloadsIndex].status = 'finished';
                    db.videos.push(this.info);
                    await writeDatabase(db);
                    
                    this.io.to('ydl').emit('downloadStatus', db);
                    this.io.to('ydl').emit('systemMessages', {type: "Success", messages: `${fileInfo.title} has finished downloading`});
                    this.io.to('ydl').emit('getVideos', db.videos.reverse());

                    console.log('Download complete');

                    let haveQueueItems = false;

                    db.downloads.forEach(el => {
                        if(el.status === 'queued')
                            haveQueueItems = true;
                    });

                    if(haveQueueItems)
                        Media.downloadQueueItems(this.io);

                    resolve({success: true, messages: "Download successfull", code: 1});
                });
            }
            catch(error){
                console.log(error);
                this.io.to('ydl').emit('systemMessages', {type: "Error", messages: "Error while downloading video."});
                reject({success: false, messages: error, code: 100});
                return;
            }
        });
    }
    static async downloadQueueItems(io){
        const db = await readDatabase();

        for(let i = 0; i < db.downloads.length; i++){
            let el = db.downloads[i];

            if(el.status === 'queued'){
                const media = new Media();
                media.io = io;

                media.url = el.url;
                media.options = el.options;

                media.Download();
                return;
            }
        }
    }
}

module.exports = Media;