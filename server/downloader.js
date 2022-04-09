const Database = require("./database");
const Settings = require("./settings");
const Video = require("./video");
const Download = require('./download');
const { spawn, exec } = require('child_process');
const {emitEvent} = require('./helpers');
const fs = require('fs');
const e = require("express");

class Downloader{
    static isDownloading = false;
    static queue = [];
    static basicOptions = {
        audioOnly : false,
        format: null,
        audioFormat: null,
        playlist: false
    }

    static loadQueue(){
        return new Promise(async (resolve, reject) => {
            try{
                Downloader.queue = [];
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

                    Downloader.queue.push(dl);
                });

                emitEvent('downloadStatus', Downloader.queue);
                resolve();
            }
            catch(error){
                reject(error);
            }
        });
    }

    static addToQueue(url, options){
        return new Promise(async (resolve, reject) => {
            try{
                await Downloader.loadQueue();
                let opt = options;

                if(options === null || options === undefined)
                    opt = Downloader.basicOptions;

                const fileInfo = await Downloader.getDownloadInfo(url, opt);

                const dl = new Download();

                dl.videoId = fileInfo.id;
                dl.title = fileInfo.title;
                dl.status = 'queued';
                dl.url = url;
                dl.format = options.format;
                dl.audioFormat = options.audioFormat;
                dl.audioOnly = options.audioOnly;
                dl.playlist = options.playlist;

                await dl.save();

                Downloader.queue.push(dl);

                console.log(`added video: ${dl.url} to the queue`);

                emitEvent('downloadQueue', Downloader.queue);
                emitEvent('systemMessages', {type: "Success", messages: `Download '${fileInfo.title} has been added to the queue.`});

                if(!Downloader.isDownloading)
                    Downloader.start();

                resolve({success: true, messages: `Download '${fileInfo.title} has been added to the queue.`, code: 3});
            }
            catch(error){
                reject({success: false, messages: error, code: 100});
            }
        });
    }

    static getDownloadArguments(settings, download){
        let directory = "./videos";
        let username = null;
        let password = null;
        let extention = "mp4";

        try{
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

        if(download.audioOnly){
            args.push('--extract-audio');
            args.push('--audio-format')
            args.push('mp3');
            extention = "mp3";
        }
        else{
            args.push(`--recode-video`);
            args.push(`mp4`);
        }

        if(download.format && download.audioFormat){
            args.push(`-f`);
            args.push(`${download.format}+${download.audioFormat}`);
        }
        else if(download.format){
            args.push(`-f`);
            args.push(download.format);
        }
        else{
            args.push(`-f`);
            args.push(`best`);
        }

        if(username !== null && password !== null){		
            args.push(`--username`);		
            args.push(`'${username}'`);		

            args.push(`--password`);		
            args.push(`'${password}'`);		
        }

        args.push('--output');
        args.push(`${directory}/%(id)s.%(ext)s`);
        args.push('--console-title');
        args.push(download.url);

        return {
            extention : extention,
            directory: directory,
            args: args
        };
    }

    static CheckForDoubleVideos(videoProviderId){
        return new Promise(async (resolve, reject) => {
            try{
                const vid = await Video.find(videoProviderId, "video_provider_id = ?");

                if(vid)
                    resolve(true);
                else
                    resolve(false);
            }
            catch(error){
                console.error(error);
                reject(error);
            }
        });
    }

    static getDownloadInfo(url, options = null){
        return new Promise((resolve, reject) => {
            try{
                let command = `youtube-dl --skip-download --dump-json ${url}`;

                if(options !== null)
                    if(options.format && options.audioFormat)
                        command = `youtube-dl --skip-download --dump-json -f ${options.format}+${options.audioFormat} ${url}`;

                exec(command, (error, stdout, stderr) => {
                    if(error){
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

    static CreateDownloadObject(fileInfo, downloadProccesID, options){
        const dl = new Download();

        dl.videoId = fileInfo.id;
        dl.title = fileInfo.title;
        dl.status = 'downloading';
        dl.processId = downloadProccesID;
        dl.url = fileInfo.webpage_url;
        dl.format = options.format;
        dl.audioFormat = options.audioFormat;
        dl.audioOnly = options.audioOnly;
        dl.playlist = options.playlist;
        dl.downloadStatus = 0;

        return dl;
    }

    static CreateVideoObject(fileInfo, extention, fileLocation){
        const video = new Video();

        video.title = fileInfo.title;
        video.uploaderUrl = fileInfo.channel_url;
        video.viewCount = fileInfo.view_count;
        video.duration = fileInfo.duration;
        video.extention = extention;
        video.fileName = fileInfo.id; //was the 'fname' variable
        video.fileLocation = fileLocation; //downloadOptions.directory;
        video.url = fileInfo.webpage_url;
        video.videoProviderId = fileInfo.id;
        video.uploaderName = fileInfo.uploader;
        video.description = fileInfo.description;
        video.tags = fileInfo.tags;
        video.thumbnails = fileInfo.thumbnails;

        return video;
    }

    static download(url, options){
        return new Promise(async (resolve, reject) => {
            try{
                if(Downloader.isDownloading) {
                    console.log("There is already a download in progress abort.");
                    return;
                }
                    

                console.log(`--- Start download ---`);
                console.log(`Url: ${url}`);

                Downloader.isDownloading = true;
                console.log(`Gathering information...`);

                const settings = new Settings();
                await settings.load();
                
                const fileInfo = await Downloader.getDownloadInfo(url, options);
                const dl = await Download.find([fileInfo.id], "video_id = ?");
                const downloadArguments = Downloader.getDownloadArguments(settings, dl);

                const checkResult = await Downloader.CheckForDoubleVideos(fileInfo.id);

                if(checkResult){
                    Downloader.isDownloading = false;

                    await dl.remove();

                    emitEvent('systemMessages', {type: 'Error', messages: `Item already downloaded`});
                    
                    reject({success: false, messages: 'Item already excist', code: 2});
                    return;
                }  

                const download = spawn('youtube-dl', downloadArguments.args);
                
                emitEvent('systemMessages', {type: 'Succes', messages: `Download started for ${fileInfo.title}`});
                console.log(`Download started.`);
                
                dl.status = 'downloading';
                await dl.update();

                let status;
                let oldStatus = 0;

                download.stdout.on('data',async data => {
                    const downloadStatus = data.toString().match(/(\d+)\.(\d)%/);

                    if(downloadStatus != null){
                        if(parseInt(downloadStatus[1]) > oldStatus){
                            status = parseInt(downloadStatus[1]);
                            oldStatus = status;

                            dl.downloadStatus = status;

                            if(status === 100){
                                dl.status = "converting"; 
                                await dl.update();
                            }
                            
                            emitEvent('downloadStatus', dl);
                        }
                    }
                });

                download.on('close', async () => {
                    if(!fs.existsSync(`${downloadArguments.directory}/${fileInfo.id}.${downloadArguments.extention}`)){
                        const downloads = Download.all();

                        if(downloads.status === "stopped"){
                            console.log('stopped');
                            Downloader.isDownloading = false;
                            return;
                        }
                    }
                    
                    await dl.remove();

                    const video = Downloader.CreateVideoObject(fileInfo, downloadArguments.extention, downloadArguments.directory);
                    await video.save();

                    const videos = await Video.all();
                    
                    emitEvent('downloadStatus', null);
                    emitEvent('systemMessages', {type: 'Succes', messages: `${fileInfo.title} has finished downloading`});
                    emitEvent('getVideos', videos.reverse());

                    console.log(`--- Download is completed. ---`);
                    
                    Downloader.isDownloading = false;
                    Downloader.start();

                    resolve({success: true, messages: "Download successfull", code: 1});
                });
            }
            catch(error){
                console.log(error);
                Downloader.isDownloading = false;
                
                emitEvent('systemMessages', {type: "Error", messages: `${error}`});
                reject({success: false, messages: error, code: 100});
                return;
            }
        });
    }

    static async start(){
        try{
            if(Downloader.queue.length > 0 && !Downloader.isDownloading){
                const download = Downloader.queue.shift();
                const video = await download.toVideo();

                await Downloader.download(download.url, video.options);
            }
        }
        catch(error){
            console.error(error);
        }
    }

    static getPlaylistInfo (url) {
        return new Promise(async (resolve, reject) => {
            try{
                let start = 1;
                let a = 1;
                let step = 3;
                let end = step;

                const data = [];

                console.log("--- Fetching playlist data ---")

                for(let i = 0; i < a; i++){
                    await new Promise((resolve, reject) => {
                        // console.log(`youtube-dl --skip-download --dump-single-json --playlist-start ${start} --playlist-end ${end} ${url}`);

                        exec(`youtube-dl --skip-download --dump-single-json --playlist-start ${start} --playlist-end ${end} ${url}`, (error, stdout, stderr) => {
                            if (error) {
                                reject(error.message);
                                return;
                            }
                            if (stderr) {
                                reject(stderr);
                                return;
                            }
                            
                            const output = JSON.parse(stdout);

                            if(output.entries === undefined){
                                reject({status: "failed", error: "No playlist found"});
                                return;
                            }

                            for(let enteries = 0; enteries < output.entries.length; enteries++){
                                const e = output.entries[enteries];

                                if(!data.find(val => {if(val.title === e.title) return val;}))
                                    data.push(e);
                            }
                            
                            if(output.entries.length === step){
                                start += step;
                                end += step;
                                a++;
                            }
                                
                            resolve();
                        });
                    });
                }

                console.log("--- End fetching playlist data ---")

                resolve(data);
            }
            catch(error){
                reject(error);
            }
        });
    }
}

module.exports = Downloader;