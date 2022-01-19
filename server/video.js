const Database = require("./database");

class Video{
    constructor(){
        this.id;
        this.title;
        this.uploaderUrl;
        this.viewCount;
        this.duration;
        this.extention;
        this.fileName;
        this.fileLocation;
        this.url;
        this.videoProviderId;
        this.uploaderName;
        this.description;
        this.tags;
        this.thumbnails;
    }
    
    // Storing data

    async save(){
        let db = null;

        try{
            db  = await Database.connect();
    
            this.id = await this.saveVideo(db);

            if(this.id === null){
                console.error("Error creating video");
                return;
            }

            const tags = [];

            for(let i = 0; i < this.tags.length; i++){
                const check = await this.checkTag(db, this.tags[i]);

                if(check == undefined)
                    tags.push(await this.saveTag(db, this.tags[i]));
                else
                    tags.push(check.id);
            }

            for(let i = 0; i < tags.length; i++){
                await this.saveTagLinks(db, tags[i]);
            }

            for(let i = 0; i < this.thumbnails.length; i++){
                await this.saveThumbnail(db, this.thumbnails[i]);
            }

            console.log("Video saved");
        }
        catch(error){
            console.error(error);
        }
        finally{
            Database.close(db);
        }
    }

    async saveVideo(db){
        return new Promise((resolve, reject) => {
            const insertVideoPrefix = "INSERT INTO videos (title, uploader_url, view_count, duration, file_extention, file_name, file_location, video_url, video_provider_id, uploader_name, description)";
            const videoValues = [this.title, this.uploaderUrl, this.viewCount, this.duration, this.extention, this.fileName, this.fileLocation, this.url, this.videoProviderId, this.uploaderName, this.description];
    
            db.serialize(() => {
                db.run(`${insertVideoPrefix} VALUES(?,?,?,?,?,?,?,?,?,?,?)`, videoValues, function(error){
                    if(error){
                        console.error(error);
                        reject(error);
                        return;
                    }

                    resolve(this.lastID);
                });
            });
        });
    }

    async saveTagLinks(db, tagID){
        db.serialize(() => {
			db.run(`INSERT INTO tag_links (video, tag) VALUES(?,?)`, [this.id, tagID], (error) => {
                if(error){
                    console.error(error);
                    return;
                }
            });
		})
    }

    async saveTag(db, tag){
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run(`INSERT INTO tags (tag) VALUES(?)`, [tag], function(error){
                    if(error){
                        console.error(error);
                        reject(error);
                        return;
                    }
                    resolve(this.lastID);
                });
            });
        });
    }

    async saveThumbnail(db, thumbnail){
        return new Promise((resolve,reject) => {
            const values = [
                this.id,
                thumbnail.height,
                thumbnail.width,
                thumbnail.resolution,
                thumbnail.url
            ]
            db.serialize(() => {
                db.run("INSERT INTO thumbnails (video, height, width, resolution, url) VALUES(?,?,?,?,?)", values, function(error){
                    if(error){
                        reject(error);
                        return;
                    }

                    resolve();
                })
            })
        });
        
    }

    // End storing data

    async checkTag(db, tag){
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.get(`SELECT * FROM tags WHERE tag = ?`, [tag], (error,row) => {
                    if(error){
                        console.error(error);
                        reject(error);
                        return;
                    }
                    
                    resolve(row);
                });
            });
        })
    }

    static all(){
        return new Promise(async (resolve, reject) => {
            let db = await Database.connect();

            db.all("SELECT * FROM videos", async (error, rows) => {
                if(error){
                    console.error(error);
                    reject(error);
                    return;
                }

                const videos = [];

                for(let i = 0; i < rows.length; i++){
                    const row = rows[i];
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

                    try{
                        video.tags = await this.getTags(video.id);
                        video.thumbnails = await this.getThumbnails(video.id);
                        videos.push(video);
                    }
                    catch(error){
                        console.error(error);
                    }
                }

                resolve(videos)
            });   

            Database.close(db);
        });
    }

    static async getTags(videoId){
        return new Promise(async (resolve, reject) => {
            let db = await Database.connect();

            const tagQuery = `SELECT t.tag FROM tags t
                        JOIN tag_links tl ON tl.tag = t.id
                        WHERE tl.video = ?`;
                        
            db.all(tagQuery, videoId, (error, rows) => {
                if(error){
                    console.error(error);
                    reject(error);
                    return;
                }

                const tags = [];

                rows.forEach(row => {
                    tags.push(row.tag);
                })

                resolve(tags);
            })
        });
    }

    static async getThumbnails(videoId){
        return new Promise(async (resolve, reject) => {     
            let db = await Database.connect();

            db.all("SELECT height, width, resolution, url FROM thumbnails WHERE video = ?", videoId, (error, rows) => {
                if(error){
                    console.error(error);
                    reject(error);
                    return;
                }

                resolve(rows);
            });
        });
    }

    static async getVideo(videoId){
        return new Promise(async (resolve, reject) => {
            let db = await Database.connect();

            db.get("SELECT * FROM videos WHERE id = ? ", videoId, (error, row) => {
                if(error){
                    console.error(error);
                    reject(error);
                    return;
                }

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

                resolve(video);
            })
        });
    }

    static async find(id){
        return new Promise(async (resolve, reject) => {
            let db = null;
            
            try{
                db = await Database.connect();

                const video = await this.getVideo(id);
                video.tags = await this.getTags(video.id);
                video.thumbnails = await this.getThumbnails(video.id);

                resolve(video);
            }
            catch(error){
                console.error(error);
                reject(error);
            }
            finally{
                Database.close(db);
            }
        });
    }
}

module.exports = Video;