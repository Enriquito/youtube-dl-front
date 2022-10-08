const Database = require("./database");
const Tag = require('./tag')
const TagLink = require('./tagLink');
const Thumbnail = require('./thumbnail');

class Video{
    id;
    title;
    uploaderUrl;
    viewCount;
    duration;
    extention;
    fileName;
    fileLocation;
    url;
    videoProviderId;
    uploaderName;
    description;
    tags;
    thumbnails;
    channelId;
    channel;
    options;
    uploadDate;

    // Storing data

    async save(){
        return new Promise(async (resolve,reject) => {
            try{
                await this.saveVideo();
    
                if(this.id === null){
                    console.error("Error creating video");
                    return;
                }
    
                const tags = [];
    
                for(let i = 0; i < this.tags.length; i++){
                    const check = await Tag.findBy({tag : this.tags[i]});

                    if(!check) {
                        const tag = new Tag();
                        tag.tag = this.tags[i];
                        await tag.save();

                        tags.push(tag.id);
                    }
                    else {
                        tags.push(check.id);
                    }
                }

                for(let i = 0; i < tags.length; i++){
                    const tagLink = new TagLink();

                    tagLink.video = this.id;
                    tagLink.tag = tags[i];

                    await tagLink.save();
                }

                for(let i = 0; i < this.thumbnails.length; i++){
                    const thumbnail = new Thumbnail();
                    thumbnail.video = this.id;
                    thumbnail.width = this.thumbnails[i].width;
                    thumbnail.height = this.thumbnails[i].height;
                    thumbnail.resolution = this.thumbnails[i].resolution;
                    thumbnail.url = this.thumbnails[i].url;

                    await thumbnail.save();
                }
    
                resolve();
            }
            catch(error){
                console.error(error);
                reject(error);
            }
        });
    }

    async saveVideo(){
        return new Promise(async (resolve, reject) => {
            try{
                const query = "INSERT INTO videos (title, uploader_url, view_count, duration, file_extention, file_name, file_location, video_url, video_provider_id, uploader_name, description, channel_id, upload_date) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)";
                const videoValues = [this.title, this.uploaderUrl, this.viewCount, this.duration, this.extention, this.fileName, this.fileLocation, this.url, this.videoProviderId, this.uploaderName, this.description, this.channelId, this.uploadDate];

                const result = await Database.run(query ,  videoValues);

                this.id = result.data.lastID;

                resolve();
            }
            catch(error){
                console.error(error);
                reject(error);
            }
        });
    }

    async saveThumbnail(thumbnail){
        return new Promise(async (resolve,reject) => {
            try{
                if (thumbnail.height !== undefined) {
                    const values = [
                        this.id,
                        thumbnail.height,
                        thumbnail.width,
                        thumbnail.resolution,
                        thumbnail.url
                    ];

                    await Database.run("INSERT INTO thumbnails (video, height, width, resolution, url) VALUES(?,?,?,?,?)", values);
                }

                resolve();
            }
            catch(error){
                console.error(error);
                reject(error);
            }
        });
    }

    static all(limitStart = 0, limitEnd = 50){
        return new Promise(async (resolve, reject) => {
            try{
                const result = await Database.all("SELECT * FROM videos LIMIT ?,?", [limitStart,limitEnd]);
                const Channel = require('./channel.js');
                
                const videos = [];

                for(let i = 0; i < result.data.length; i++){
                    const row = result.data[i];
                    const video = new Video();

                    video.id = row.id;
                    video.title = row.title;
                    video.uploaderUrl = row.uploader_url;
                    video.viewCount = row.view_count;
                    video.duration = row.duration;
                    video.extention = row.file_extention;
                    video.fileLocation = row.file_location;
                    video.fileName = row.file_name;
                    video.url = row.video_url;
                    video.videoProviderId = row.video_provider_id;
                    video.uploaderName = row.uploader_name;
                    video.channel = await Channel.find(row.channel_id);
                    video.description = row.description;
                    video.uploadDate = row.upload_date;

                    video.tags = await this.getTags(video.id);
                    video.thumbnails = await this.getThumbnails(video.id);
                    videos.push(video);                    
                }

                resolve(videos)                
            }
            catch(error){
                console.error(error);
                reject(error);
            }
        });
    }

    static async getTags(videoId){
        return new Promise(async (resolve, reject) => {
            try{
                const tagQuery = `SELECT t.tag FROM tags t
                JOIN tag_links tl ON tl.tag = t.id
                WHERE tl.video = ?`;

                const DBtags = await Database.all(tagQuery, videoId);

                const tags = [];

                DBtags.data.forEach(row => {
                    tags.push(row.tag);
                })

                resolve(tags);
            }
            catch(error){
                console.log(error);
                reject(error);
            }
        });
    }

    static async getThumbnails(videoId){
        return new Promise(async (resolve, reject) => {   
            try{    
                const DBThumbnails = await Database.all("SELECT height, width, resolution, url FROM thumbnails WHERE video = ?", videoId);

                resolve(DBThumbnails.data);
            }
            catch(error){
                console.log(error);
                reject(error);
            }  
        });
    }

    static async find(values, findConditon = "id = ?"){
        return new Promise(async (resolve, reject) => {
            try{
                const vid = await Database.get(`SELECT * FROM videos WHERE ${findConditon}`, values);

                if(vid.data === null){ 
                    resolve(null);
                    return;
                }

                const video = new Video();
                    
                video.id = vid.data.id;
                video.title = vid.data.title;
                video.uploaderUrl = vid.data.uploader_url;
                video.viewCount = vid.data.view_count;
                video.duration = vid.data.duration;
                video.extention = vid.data.file_extention;
                video.fileLocation = vid.data.file_location;
                video.fileName = vid.data.file_name;
                video.url = vid.data.video_url;
                video.videoProviderId = vid.data.video_provider_id;
                video.uploaderName = vid.data.uploader_name;
                video.description = vid.data.description;
                video.tags = await this.getTags(video.id);
                video.thumbnails = await this.getThumbnails(video.id);
                video.channelId = vid.data.channel_id

                resolve(video);
            }
            catch(error){
                reject(error);
            }
            
        });
    }

    remove(){
        return new Promise(async (resolve, reject) => {
            try{    
                await Database.run("DELETE FROM videos WHERE id = ?", [this.id]);
                await Database.run("DELETE FROM thumbnails WHERE video = ?", [this.id]);

                resolve(true);
            }
            catch(error){
                console.log(error);
                reject(error);
            }
        });
    }
}

module.exports = Video;