const { spawn, exec } = require('child_process');
const fs = require('fs');
const Video = require("./video");
const Download = require("./download");
const {writeDatabase, readDatabase, readSettings} = require('./helpers');

class Media
{
    constructor(url, options){
        this.url = url;
        this.options = options;
        this.info;
        this.io;        
    }

    async GetDefaultQualityFormat(url){
        try{
            const settings = await readSettings();
            const quality = settings.defaultQuality;

            const formats = {
                format: null,
                audioFormat: null
            }

            const result = await Media.GetDownloadInfo(url);

            for(let i = 0; i < result.formats.length; i++){
                const format = result.formats[i];

                if(format.ext == "m4a"){
                    formats.audioFormat = format.format_id;
                }

                if(format.ext == "mp4"){
                    if(format.format_note === quality){
                        formats.format = format.format_id
                    }
                }
            }
            
            if(formats.format !== null || formats.audioFormat !== null)
                return formats;
            else
                return null;
        }
        catch(error){
            console.log('get default quality');
            console.log(error);
        }
    }

    AddToQueue(){
        return new Promise(async (resolve, reject) => {
            try{
                let fileInfo = await this.GetInfo(this.url,this.options);

                const dl = new Download();

                dl.videoId = fileInfo.id;
                dl.title = fileInfo.title;
                dl.status = 'queued';
                dl.url = this.url;
                dl.format = this.options.format;
                dl.audioFormat = this.options.audioFormat;
                dl.audioOnly = this.options.audioOnly;
                dl.playlist = this.options.playlist;

                await dl.save();

                const allDownloads = await Download.all();

                this.io.to('ydl').emit('downloadStatus', allDownloads);
                this.io.to('ydl').emit('systemMessages', {type: "Success", messages: `Download '${fileInfo.title} has been added to the queue.`});
                resolve({success: true, messages: `Download '${fileInfo.title} has been added to the queue.`, code: 3});
            }
            catch(error){
                reject({success: false, messages: error, code: 100});
            }
        });
    }

    async GetDownloadOptions(){
        let settings = null;
        let directory = "./videos";
        let username = null;
        let password = null;

        try{
            settings = await readSettings();
            directory = settings.outputLocation;

            if(settings.authentication.username != null && settings.authentication.password != null){		
                username = settings.authentication.username;		
                password = settings.authentication.password;		
            }
        }
        catch(error){
            console.log(error);
            return;
        }

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
        else if(this.options.format && this.options.audioFormat){
            args.push(`-f`);
            args.push(`${this.options.format}+${this.options.audioFormat}`);
        }
        else if(username !== null && password !== null){		
            args.push(`--username`);		
            args.push(`'${username}'`);		

            args.push(`--password`);		
            args.push(`'${password}'`);		
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
        return new Promise(async (resolve, reject) => {
            try{				
                let commandAuth = "";		
                const settings = await readSettings();

                if(settings.authentication.username !== null && settings.authentication.password !== null){		
                    if(!settings.authentication.twoFactor)		
                        commandAuth = `--username ${settings.authentication.username} --password ${settings.authentication.password}`;		
                    else		
                        commandAuth = `--username ${settings.authentication.username} --password ${settings.authentication.password} --twofactor ''`;		
                }

                exec(`youtube-dl ${commandAuth} -J ${url}`, (error, stdout, stderr) => {
                    if(error){
                        reject(error);
                        return;
                    }

                    resolve(JSON.parse(stdout));
                })
            }
            catch(error){
                console.log(error);		
                this.io.to('ydl').emit('systemMessages', {type: "Error", messages: `${error.messages.messages}`});		
                reject({success: false, messages: error, code: 100});
            }
        });
    }

    PreparePlayListItems(){
        const getPlaylist = new Promise(async (resolve, reject) => {
            try{
                const download = spawn('youtube-dl', ['--skip-download', '--dump-json', '--flat-playlist', this.url]);
                const temp = [];

                download.stdout.on('data',async data => {
                    if(data.toString().match(/^\{/).length === 1){
                        try{
                            const obj = JSON.parse(data.toString());
                            temp.push(obj);
                        }
                        catch(error){
                            console.log(error);
                        }
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

                        const result = await this.GetDefaultQualityFormat(m.url);

                        if(result !== null){
                            m.options.format = result.format;
                            m.options.audioFormat = result.audioFormat
                        }
                       
                        playlist.push(m);
                    }

                    resolve(playlist);
                });
            }
            catch(error){
                reject(error);
            }
        });

        return Promise.all([getPlaylist]);
    }

    // To-Do get plalist info
    static getPlaylistInfo (url) {
        return new Promise(async (resolve, reject) => {
            try{
                let start = 1;
                let end = 11;
                const step = 10;
                let a = 1;

                const data = [];

                for(let i = 0; i < a; i++){
                    await new Promise((resolve, reject) => {
                        exec(`youtube-dl --skip-download --dump-single-json --playlist-start ${start} --playlist-end ${end} ${url}`, (error, stdout, stderr) => {
                            if (error) {
                                reject(error.message);
                                return;
                            }
                            if (stderr) {
                                reject(stderr);
                                return;
                            }
        
                            if(JSON.parse(stdout).entries.length >= step){
                                start += step;
                                end += step;
                                a++;
                            }
        
                            JSON.parse(stdout).entries.forEach(item => {
                                data.push(item);
                            });

                            resolve();
                        });
                    });
                }

                resolve(data);
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

                    const obj = JSON.parse(stdout);

                    resolve(obj);
                });
            }
            catch(error){
                console.log(error);
                this.io.to('ydl').emit('systemMessages', {type: "Error", messages: `${error.messages.messages}`});
                reject({success: false, messages: error, code: 100});
            }
        });
    }

    CheckForDoubleVideos(fname){
        return new Promise(async (resolve, reject) => {
            try{
                let found = false;
                const videos = await Video.all();
                
                videos.forEach(video => {
                    if(video.fileName === fname){
                        found = true;
                    }
                });
    
                resolve(found);
            }
            catch(error){
                console.error(error);
                reject(error);
            }
        });
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

                const downloadOptions = await this.GetDownloadOptions();
                
                let fileInfo = await this.GetInfo(this.url,this.options);
                let formatNote = this.GetFormat(fileInfo);
                const allDownloads = await Download.all();
                let extention;
                let fname;

                if(this.options.audioOnly)
                        extention = "mp3";
                else
                    extention = fileInfo.ext;

                fname = `${fileInfo.title.replace(/[:<>"/|?*]/g, '')}`;

                if(formatNote !== undefined)
                    fname = `${fname} - ${formatNote}.${extention}`;
                else
                    fname = `${fname}.${extention}`;

                if(await this.CheckForDoubleVideos(fname)){
                    resolve({success: false, messages: 'Item already excist', code: 2});
                    return;
                }

                allDownloads.forEach((el,index) => {
                    if(el.id === fileInfo.id){
                        allDownloads.splice(index,1);
                    }
                });

                const download = spawn('youtube-dl', downloadOptions.args);

                this.io.to('ydl').emit('systemMessages', {type: "Success", messages: `Download started for ${fileInfo.title}`});

                const dl = new Download();

                dl.videoId = fileInfo.id;
                dl.title = fileInfo.title;
                dl.status = 'downloading';
                dl.processId = download.pid;
                dl.url = this.url;
                dl.format = this.options.format;
                dl.audioFormat = this.options.audioFormat;
                dl.audioOnly = this.options.audioOnly;
                dl.playlist = this.options.playlist;

                await dl.save();

                allDownloads.push(dl);

                this.io.to('ydl').emit('downloadStatus', allDownloads);

                let status;
                let oldStatus = 0;

                download.stdout.on('data',async data => {
                    const downloadStatus = data.toString().match(/(\d+)\.(\d)%/);

                    if(downloadStatus != null){
                        if(parseInt(downloadStatus[1]) > oldStatus){
                            status = parseInt(downloadStatus[1]);
                            oldStatus = status;

                            dl.downloadStatus = status;
                            allDownloads[allDownloads.length - 1].downloadStatus = status;

                            if(status === 100){
                                dl.status = "converting"; 
                                dl.update();
                            }
                            
                            this.io.to('ydl').emit('downloadStatus', allDownloads);
                        }
                    }
                });

                download.on('close', async () => {

                    if(!fs.existsSync(`${downloadOptions.directory}/${fileInfo.id}.${extention}`)){
                        const downloads = Download.all();

                        if(downloads.status === "stopped"){
                            console.log('stopped');
                            return;
                        }
                            
                    }

                    // while(fs.existsSync(`${downloadOptions.directory}/${fileInfo.id}.${extention}`)){
                    //     fs.renameSync(`${downloadOptions.directory}/${fileInfo.id}.${extention}`,`${downloadOptions.directory}/${fname}`);
                    // }

                    dl.status = "finished";

                    await dl.update();

                    // console.log(fileInfo);
                    
                    const video = new Video();

                    video.title = fileInfo.title;
                    video.uploaderUrl = fileInfo.channel_url;
                    video.viewCount = fileInfo.view_count;
                    video.duration = fileInfo.duration;
                    video.extention = extention;
                    video.fileName = fileInfo.id; //was the 'fname' variable
                    video.fileLocation = downloadOptions.directory;
                    video.url = fileInfo.webpage_url;
                    video.videoProviderId = fileInfo.id;
                    video.uploaderName = fileInfo.uploader;
                    video.description = fileInfo.description;
                    video.tags = fileInfo.tags;
                    video.thumbnails = fileInfo.thumbnails;

                    await video.save();

                    const videos = await Video.all();
                    
                    this.io.to('ydl').emit('downloadStatus', allDownloads);
                    this.io.to('ydl').emit('systemMessages', {type: "Success", messages: `${fileInfo.title} has finished downloading`});
                    this.io.to('ydl').emit('getVideos', videos.reverse());

                    console.log('Download complete');

                    let haveQueueItems = false;

                    allDownloads.forEach(el => {
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
                this.io.to('ydl').emit('systemMessages', {type: "Error", messages: `${error}`});
                reject({success: false, messages: error, code: 100});
                return;
            }
        });
    }

    static async downloadQueueItems(io){
        const downloads = await Download.all();

        for(let i = 0; i < downloads.length; i++){
            let el = downloads[i];

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