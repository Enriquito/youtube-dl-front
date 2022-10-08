const Database = require('./database');
const Downloader = require('./downloader');
const Download = require('./download');
const moment = require('moment');
const { spawn, exec} = require('child_process');
const AbstractEntity = require('./abstractEntity');
const ChannelVideoIndex = require('./channelVideoIndex');

class Channel extends AbstractEntity{
    channelId;
    url;
    name;
    followerCount;
    avatar;
    banner;
    lastScan;
    videos;
    autoDownloadAfterScan = 0;
    isScanning = 0;

    getTimeNow() {
        return moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    }

    getUrl() {
        return `https://www.youtube.com/channel/${this.channelId}`;
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

                    this.channelId = output.uploader_id;
                    this.name = output.uploader;
                    this.followerCount = output.channel_follower_count;
                    this.url = output.channel_url;
                    this.avatar = output.thumbnails.find(thumbnail => thumbnail.id == 'avatar_uncropped').url ?? null;
                    this.banner = output.thumbnails.find(thumbnail => thumbnail.id == 6).url ?? null;

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
                let rounds = 10;
                
                for(let i = 0; i < rounds; i++) {
                    const result = await this.getChannelVideos(i + 1,i + 1,1);
                    let data = result.data;

                    for(let i = 0; i < data.length; i++) { 
                        const video = data[i];
                        let pushDownload = false;
    
                        const avatar = video.thumbnails.find(thumbnail => thumbnail.id === 'avatar_uncropped');
    
                        if (avatar) {
                            this.avatar = avatar.url;
                        }
    
                        const banner = video.thumbnails.find(thumbnail => thumbnail.id === 'banner_uncropped');
    
                        if (banner) {
                            this.banner = banner.url;
                        }
    
                        if (video.channel_follower_count) {
                            this.followerCount = video.channel_follower_count;
                        }
    
                        try {
                            const gotVideoInIndex = await this.gotVideoIndex(video);
    
                            if(gotVideoInIndex) {
                                if(gotVideoInIndex.downloaded_at === null) {
                                    pushDownload = true;
                                }
                            }
                            else {
                                const channelVideoIndex = new ChannelVideoIndex();
                                channelVideoIndex.channelId = this.id;
                                channelVideoIndex.duration = video.duration;
                                channelVideoIndex.title = video.title;
                                channelVideoIndex.thumbnail = video.thumbnails.find(thumbnail => {
                                    const thumb = thumbnail.url.match('maxresdefault')
            
                                    if (thumb) {
                                        return thumb.length > 0;
                                    }
            
                                    return false;
            
                                }).url;
                                channelVideoIndex.ytVideoId = video.id;
                                channelVideoIndex.videoUrl = video.original_url;
                                
                                await channelVideoIndex.save();
    
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

                    if (result.isDone) {
                        console.log('done');
                        break;
                    }

                    rounds+= 10;
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

    getChannelVideos (start, end, step = 1) {
        return new Promise(async (resolve, reject) => {
            const data = [];
            let dateScanOption = "";

            if (this.lastScan !== null) {
                dateScanOption = `--dateafter=${lastScanDate}`;
            }

            const lastScanDate = moment(new Date(this.lastScan)).format('YMMDD');

            try{
                let isDone = await new Promise((resolve, reject) => {
                    exec(`yt-dlp --skip-download --dump-single-json ${dateScanOption} --playlist-start ${start} --playlist-end ${end} ${this.getUrl()}`, (error, stdout, stderr) => {
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

                            if(!data.find(val => {
                                if(val.title === e.title) 
                                    return val;
                            }))
                                data.push(e);
                        }

                        console.log(`start: ${start} - end: ${end}`);
                        
                        if(output.entries.length !== step){
                            resolve(true)
                            return;
                        }
                            
                        resolve(false);
                    });
                });

                resolve({data: data, isDone: isDone});
            }
            catch(error){
                console.log(error);
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
                const query = "INSERT INTO channel_video_index (channel_id, yt_video_id, title, duration, thumbnail, video_url, downloaded_at) VALUES (?,?,?,?,?,?,?)";
                Database.run(query, [
                    this.id,
                    video.id,
                    video.title,
                    video.duration,
                    video.thumbnails.find(thumbnail => {
                        const thumb = thumbnail.url.match('maxresdefault')

                        if (thumb) {
                            return thumb.length > 0;
                        }

                        return false;

                    }).url,
                    video.original_url,
                    null
                ])

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
               const query = `
                   SELECT distinct 
                    v.id,
                    IFNULL(v.video_url, cvi.video_url) as 'video_url',
                    IFNULL(v.title, cvi.title)         as 'title',
                    v.duration,
                    IFNULL((SELECT url FROM thumbnails WHERE video = v.id ORDER BY id DESC),cvi.thumbnail) as 'thumbnail',
                   cvi.downloaded_at
                   FROM channels ytc
                            LEFT JOIN channel_video_index cvi ON ytc.id = cvi.channel_id
                            LEFT JOIN videos v ON cvi.yt_video_id = v.video_provider_id
                   WHERE ytc.id = ?
                    ORDER BY cvi.downloaded_at DESC
               `;

               const result = await Database.all(query, this.id);

               resolve(result);
           } catch (error) {
               console.log(error);
               reject(error);
           }
        });
    }

    async setVideoAsDownloaded(id, removeDownloadedAt = false) {
        return new Promise((resolve, reject) => {
            try {
                const now = moment(new Date())
                const query = "UPDATE channel_video_index SET downloaded_at = ? WHERE yt_video_id = ?";

                Database.run(query, [removeDownloadedAt ? null : now.format("YYYY-MM-DD HH:mm:ss"), id]);

                resolve()
            }
            catch (error) {
                reject(error)
            }
        });
    }
}

Channel.table = 'channels';
Channel.ignoredProperties = ['videos'];

module.exports = Channel;