
const Settings = require("./settings");
const Video = require("./video");
const Download = require('./download');
const Database = require('./database');
const { spawn, exec } = require('child_process');
const {emitEvent} = require('../helpers');
const fs = require('fs');
const Channel = require("./channel");
const ChannelVideoIndex = require('./channelVideoIndex');
const moment = require('moment');

class Downloader{
    static isDownloading = false;
    static downloadIsAborted = false;
    static currentDownloads = [];
    static queue;

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

    static CreateVideoObject(fileInfo, extention, fileLocation, channelId){
        const video = new Video();

        video.title = fileInfo.title;
        video.viewCount = fileInfo.view_count;
        video.duration = fileInfo.duration;
        video.extention = extention;
        video.fileName = fileInfo.id;
        video.fileLocation = fileLocation; //downloadOptions.directory;
        video.url = fileInfo.webpage_url;
        video.videoProviderId = fileInfo.id;
        video.description = fileInfo.description;
        video.tags = fileInfo.tags;
        video.thumbnails = fileInfo.thumbnails;
        video.channelId = channelId;
        video.uploadDate = moment(fileInfo.upload_date, 'YYYYMMDD').format('YYYY-MM-DD');

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
                
                const fileInfo = await Download.getInfo(url, options);
                const dl = await Download.find([fileInfo.id], "video_id = ?");
                const downloadArguments = Downloader.getDownloadArguments(settings, dl);

                const checkResult = await Downloader.CheckForDoubleVideos(fileInfo.id);

                if(checkResult){
                    Downloader.isDownloading = false;

                    await dl.remove();

                    emitEvent('systemMessages', {type: 'Error', messages: `Item already downloaded`});
                    
                    reject({success: false, messages: 'Item already exist', code: 2});
                    return;
                }  

                const download = spawn('yt-dlp', downloadArguments.args);

                dl.processId = download.pid;
                await dl.update();
                this.currentDownloads.push(dl);

                emitEvent('systemMessages', {type: 'Success', messages: `Download started for ${fileInfo.title}`});
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

                    emitEvent('downloadStatus', null);
                    Downloader.isDownloading = false;
                    this.currentDownloads.shift();

                    if (Downloader.downloadIsAborted) {
                        Downloader.downloadIsAborted = false;
                        return;
                    }

                    const Channel = require("./channel");

                    let channel = await Channel.findBy({url: fileInfo.channel_url});

                    if (!channel) {
                        channel = new Channel();
                        channel.url = fileInfo.channel_url;
                        
                        await channel.setInfo();
                        console.log(channel);
                        await channel.save();
                    }

                    let channelVideoIndex = await ChannelVideoIndex.findBy({yt_video_id: fileInfo.id})

                    console.log(channelVideoIndex);

                    if (!channelVideoIndex) {
                        channelVideoIndex = await Downloader.createChanelVideoIndex(
                            channel.id, 
                            fileInfo.id, 
                            fileInfo.title, 
                            fileInfo.duration,
                            fileInfo.thumbnails.find(thumbnail => {
                                const thumb = thumbnail.url.match('maxresdefault')
        
                                if (thumb) {
                                    return thumb.length > 0;
                                }
        
                                return false;
        
                            }).url,
                            fileInfo.webpage_url
                        );
                    }

                    console.log(channelVideoIndex);

                    await channelVideoIndex.setVideoAsDownloaded();

                    const video = Downloader.CreateVideoObject(fileInfo, downloadArguments.extention, downloadArguments.directory, channel.id);
                    await video.save();

                    emitEvent('systemMessages', {type: 'Success', messages: `${fileInfo.title} has finished downloading`});
                    emitEvent('videoDownloaded', video);

                    const videos = await Video.all();
                    emitEvent('getVideos', videos.reverse());

                    console.log(`--- Download is completed. ---`);

                    await Downloader.start();

                    resolve({success: true, messages: "Video has been successfully downloaded", code: 1});
                });
            }
            catch(error){
                console.log(error);
                Downloader.isDownloading = false;
                
                emitEvent('systemMessages', {type: "Error", messages: `${error}`});
                reject({success: false, messages: error, code: 100});
            }
        });
    }

    static async start(){
        try{
            if(this.queue.count() > 0 && !Downloader.isDownloading){
                const download = this.queue.shift();
                emitEvent('downloadQueue', this.queue.getItems());

                await Downloader.download(download.url, download.getOptions());
            }
        }
        catch(error){
            console.error(error);
        }
    }

    static async stop(processId) {
        for(let i = 0; i < this.currentDownloads.length; i++) {
            const download = this.currentDownloads[i];

            if(processId === download.processId){
                download.status = "stopped";
                download.processId = null;

                await download.update();

                const stopCommand = spawn('kill', ["-9", processId]);

                stopCommand.on('close', async () => {
                    Downloader.downloadIsAborted = true;
                    emitEvent('systemMessages', {type: "Success", messages: `Download has been stopped for ${download.title}`});
                });
            }
        }
    }

    static getPlaylistInfo (url) {
        return new Promise(async (resolve, reject) => {
            try{
                let start = 1;
                let step = 1;

                let a = 1;
                let end = step;

                const data = [];

                console.log("--- Fetching playlist data ---")

                for(let i = 0; i < a; i++){
                    await new Promise((resolve, reject) => {
                        exec(`yt-dlp --skip-download --dump-single-json --playlist-start ${start} --playlist-end ${end} ${url}`, (error, stdout, stderr) => {
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

                            for(let entries = 0; entries < output.entries.length; entries++){
                                const e = output.entries[entries];

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
                console.log(error);
                reject(error);
            }
        });
    }

    static getCurrentDownloads() {
        return this.currentDownloads;
    }

    static isChannelVideo(channelID) {
        return new Promise(async (resolve, reject) => {
           try {
               const query = "SELECT * FROM channel_video_index WHERE channel_id = ?";
               const result = await Database.run(query, [channelID])

               resolve(result)
           }
           catch (error) {
                reject(error)
           }
        });
    }

    static async createChanelVideoIndex(channelId, videoId, title, duration, thumbnail, videoUrl) {
        const cvi = new ChannelVideoIndex();

        cvi.channelId = channelId;
        cvi.ytVideoId = videoId;
        cvi.title = title;
        cvi.duration = duration;
        cvi.thumbnail = thumbnail;
        cvi.videoUrl = videoUrl;
        cvi.downloadedAt = cvi.getTimeNow();

        await cvi.save();
        
        return cvi;
    }
}

module.exports = Downloader;