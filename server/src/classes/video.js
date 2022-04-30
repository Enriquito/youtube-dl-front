const Database = require("./database");

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
    options;

    // Storing data

    async save(){
        return new Promise(async (resolve,reject) => {
            try{
                this.id = await this.saveVideo();
    
                if(this.id === null){
                    console.error("Error creating video");
                    return;
                }
    
                const tags = [];
    
                for(let i = 0; i < this.tags.length; i++){
                    const check = await this.checkTag(this.tags[i]);
    
                    if(check === null || check === undefined)
                        tags.push(await this.saveTag(this.tags[i]));
                    else
                        tags.push(check.id);
                }
    
                for(let i = 0; i < tags.length; i++){
                    await this.saveTagLinks(tags[i]);
                }
    
                for(let i = 0; i < this.thumbnails.length; i++){
                    await this.saveThumbnail(this.thumbnails[i]);
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
                const query = "INSERT INTO videos (title, uploader_url, view_count, duration, file_extention, file_name, file_location, video_url, video_provider_id, uploader_name, description) VALUES(?,?,?,?,?,?,?,?,?,?,?)";
                const videoValues = [this.title, this.uploaderUrl, this.viewCount, this.duration, this.extention, this.fileName, this.fileLocation, this.url, this.videoProviderId, this.uploaderName, this.description];

                const result = await Database.run(query ,  videoValues);

                resolve(result.data.lastID);
            }
            catch(error){
                console.error(error);
                reject(error);
            }
        });
    }

    async saveTagLinks(tagID){
        return new Promise(async (resolve, reject) => {
            try{
                await Database.run("INSERT INTO tag_links (video, tag) VALUES(?,?)",  [this.id, tagID]);
                resolve();
            }
            catch(error){
                console.error(error);
                reject(error);
            }
        });
    }

    async saveTag(tag){
        return new Promise(async (resolve, reject) => {
            try{
                const response = await Database.run("INSERT INTO tags (tag) VALUES(?)", [tag]);
                resolve(response.data.lastID);
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
                const values = [
                    this.id,
                    thumbnail.height,
                    thumbnail.width,
                    thumbnail.resolution,
                    thumbnail.url
                ];

                await Database.run("INSERT INTO thumbnails (video, height, width, resolution, url) VALUES(?,?,?,?,?)", values);
                resolve();
            }
            catch(error){
                console.error(error);
                reject(error);
            }
        });
    }

    // End storing data

    async checkTag(tag){
        
        return new Promise(async (resolve, reject) => {
            try{
                const result = await Database.get("SELECT * FROM tags WHERE tag = ?",  [tag]);
                resolve(result.data);
            }
            catch(error){
                console.error(error);
                reject(error);
            }
        })
    }

    static all(limitStart = 0, limitEnd = 30){
        return new Promise(async (resolve, reject) => {
            try{
                const result = await Database.all("SELECT * FROM videos LIMIT ?,?", [limitStart,limitEnd]);

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
                    video.description = row.description;

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