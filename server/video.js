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
}

module.exports = Video;