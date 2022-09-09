const Database = require('./database');
const Downloader = require('./downloader');
const Download = require('./download');
const moment = require('moment');
const { spawn, exec} = require('child_process');

class Channel{
    id;
    url;
    name;
    followerCount;
    avatar;
    lastScan;
    videos;
    autoDownloadAfterScan;

    // Storing data

    async save(){
        return new Promise(async (resolve, reject) => {
            try{
                const values = [this.id, this.url, this.name, this.followerCount , this.avatar, this.lastScan];

                await Database.run(`INSERT INTO channels (id, url, name, follower_count, avatar ,last_scan) VALUES(?,?,?,?,?,?)`,  values);

                resolve();
            }
            catch(error){
                console.error(error);
                reject(error);
            }
        });
    }

    getTimeNow() {
        return moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    }

    async updateLastScan() {
        return new Promise(async (resolve, reject) => {
            try{
                const now = moment(new Date())
                const query = "UPDATE channels SET last_scan = ? WHERE id = ?";

                await Database.run(query,  [now.format("YYYY-MM-DD HH:mm:ss"), this.id]);

                resolve();
            }
            catch(error){
                console.error(error);
                reject(error);
            }
        });
    }

    // End storing data

    static all(limitStart = 0, limitEnd = 30){
        return new Promise(async (resolve, reject) => {
            try{
                const result = await Database.all("SELECT * FROM channels LIMIT ?,?", [limitStart,limitEnd]);

                const channels = [];

                for(let i = 0; i < result.data.length; i++){
                    const row = result.data[i];
                    const channel = new Channel();

                    channel.id = row.id;
                    channel.name = row.name;
                    channel.url = row.url;
                    channel.lastScan = row.last_scan;


                    channels.push(channel);                    
                }

                resolve(channels)           
            }
            catch(error){
                console.error(error);
                reject(error);
            }
        });
    }

    static async find(id){
        return new Promise(async (resolve, reject) => {
            try{
                const result = await Database.get("SELECT * FROM channels WHERE id = ? ", id);

                if(result === null || result === undefined){
                    resolve(null);
                    return;
                }

                const channel = new Channel();

                channel.id = result.data.id;
                channel.url = result.data.url;
                channel.name = result.data.name;
                channel.autoDownloadAfterScan = result.auto_download_after_scan;
                channel.followerCount = result.data.follower_count;
                channel.avatar = result.data.avatar;
                channel.lastScan = result.data.last_scan;

                resolve(channel);     
            }  
            catch(error){
                console.log(error);
                reject(error);
            }    

        });
    }

    async doesExist(){
        return new Promise(async (resolve, reject) => {
            try{
                const channel = await Database.get("SELECT * FROM channels WHERE url = ?", this.url);

                if(channel.data !== null){
                    this.id = channel.data.id;
                    this.name = channel.data.name;
                    this.followerCount = channel.data.follower_count;
                    this.avatar = channel.data.avatar;
                    this.url = channel.data.url;

                    resolve(true);
                    return;
                } else {
                    resolve(false);
                }
            }
            catch(error){
                console.error(error);
                reject(error);
            }
        });
    }

    async setInfo(){
        return new Promise(async (resolve, reject) => {
            try {
                exec(`yt-dlp --skip-download --dump-single-json --playlist-start 1 --playlist-end 1 ${this.url}`, (error, stdout, stderr) => {
                    if (error) {
                        reject(error.message);
                        return;
                    }

                    if (stderr) {
                        reject(stderr);
                        return;
                    }

                    const output = JSON.parse(stdout);

                    this.id = output.uploader_id;
                    this.name = output.uploader;
                    this.followerCount = output.channel_follower_count;
                    this.url = output.channel_url;

                    resolve();
                });

            } catch (error) {
                reject(error);
            }

        });
    }

    async scan(){
        return new Promise(async (resolve, reject) => {
            try{
                const doesEx = await this.doesExist();

                if(!doesEx)
                    reject("No record found of channel");
                
                const data = await Downloader.getPlaylistInfo(this.url);

                for(let i = 0; i < data.length; i++) {
                    const video = data[i];
                    let pushDownload = false;

                    this.followerCount = video.channel_follower_count;

                    try {
                        const gotVideoInIndex = await this.gotVideoIndex(video);

                        if(gotVideoInIndex) {
                            if(gotVideoInIndex.downloaded_at === null) {
                                pushDownload = true;
                            }
                        }
                        else {
                            await this.saveVideoIndex(video);
                            pushDownload = true;
                        }

                        if(pushDownload && this.autoDownloadAfterScan) {
                            const download = this.createDownloadObject(video);
                            await download.update(download)
                        }
                    }
                    catch (error) {
                        console.error(error)
                    }
                }

                this.lastScan = this.getTimeNow();

                await this.update();

                resolve();
            }
            catch(error){
                reject(error);
            }
        });
    }

    createDownloadObject(video) {
        const download = new Download()

        download.videoId = video.id;
        download.url = video.original_url;
        download.status = 'queued';
        download.title = video.title;

        return download;
    }

    async saveVideoIndex(video) {
        return new Promise((resolve, reject) => {
            try {
                const query = "INSERT INTO channel_video_index (channel_id, yt_video_id, video_url, downloaded_at) VALUES (?,?,?,?)";
                Database.run(query, [this.id, video.id, video.original_url, null])

                resolve()
            }
            catch (error) {
                reject(error)
            }
        })
    }

    async gotVideoIndex(video) {
        return new Promise(async (resolve, reject) => {
            try {
                const query = "SELECT * FROM channel_video_index WHERE yt_video_id = ?"
                const result = await Database.get(query, [video.id])

                if(result.data === null)
                    resolve(false)
                else
                    resolve(result.data)
            }
            catch (error) {
                reject(error)
            }
        })
    }

    getVideos() {
        return new Promise(async (resolve, reject) => {
           try {
               const result = await Database.all(`SELECT * FROM channels ytc JOIN videos v ON ytc.id = v.channel_id WHERE ytc.id = ?`, this.id);

               resolve();
           } catch (error) {
               console.log(error);
               reject(error);
           }
        });
    }

    remove(){
        return new Promise(async (resolve, reject) => {
            try{    
                await Database.run("DELETE FROM channels WHERE id = ?", [this.id]);

                resolve(true);
            }
            catch(error){
                console.log(error);
                reject(error);
            }
        });
    }

    async update() {
        return new Promise(async (resolve, reject) => {
            try{
                const values = [this.url, this.name, this.followerCount , this.avatar, this.lastScan, this.id];

                await Database.run(`UPDATE channels SET url = ?, name = ?, follower_count = ?, avatar = ? ,last_scan = ? WHERE id = ?`,  values);

                resolve();
            }
            catch(error){
                console.error(error);
                reject(error);
            }
        });
    }

    async setVideoAsDownloaded(id) {
        return new Promise((resolve, reject) => {
            try {
                const now = moment(new Date())
                const query = "UPDATE channel_video_index SET downloaded_at = ? WHERE yt_video_id = ?";

                Database.run(query, [now.format("YYYY-MM-DD HH:mm:ss"), id]);

                resolve()
            }
            catch (error) {
                reject(error)
            }
        });
    }
}

module.exports = Channel;