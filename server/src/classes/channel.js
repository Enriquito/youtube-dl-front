const Database = require('./database');
const { spawn } = require('child_process');

class Channel{
    constructor(){
        this.id = null;
        this.url = null;
        this.name = null;
        this.lastScan = null;
        this.videos = [];
    }

    // Storing data

    async save(){
        return new Promise(async (resolve, reject) => {
            try{
                const insertPrefix = "INSERT INTO yt_channels (url, name, last_scan)";
                const values = [this.url, this.name, this.lastScan];

                const result = await Database.run(`${insertPrefix} VALUES(?,?,?)`,  values);

                resolve(result.data.lastID);
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
                const result = await Database.all("SELECT * FROM yt_channels LIMIT ?,?", [limitStart,limitEnd]);

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
                const chan = await Database.get("SELECT * FROM yt_channels WHERE id = ? ", id);

                if(chan === null || chan === undefined){
                    resolve(null);
                    return;
                }

                const channel = new Channel();
                    
                channel.id = chan.data.id;
                channel.name = chan.data.title;
                channel.lastScan = chan.data.last_scan

                resolve(channel);     
            }  
            catch(error){
                console.log(error);
                reject(error);
            }    

        });
    }

    async doesExcist(){
        return new Promise(async (resolve, reject) => {
            if(this.id === null && this.url !== null){
                try{
                    const chan = await Database.get("SELECT * FROM yt_channels WHERE url = ?", this.url);

                    console.log(chan);
    
                    if(chan.data !== undefined){
                        this.id = chan.data.id;
                        this.url = chan.data.url;
                        this.name = chan.data.name;
                        this.lastScan = chan.data.last_scan;

                        resolve(true);
                    }
                    else{
                        resolve(false);
                    }
                }
                catch(error){
                    console.error(error);
                    resolve(false);
                }
            }
            else if(this.id !== null && this.url !== null){
                try{
                    const chan = await Database.get("SELECT * FROM yt_channels WHERE url = ? AND id = ? ", this.url, this.id);
    
                    if(chan.data !== undefined){
                        this.id = chan.data.id;
                        this.url = chan.data.url;
                        this.name = chan.data.name;
                        this.lastScan = chan.data.last_scan;

                        resolve(true);
                    }
                    else{
                        resolve(false);
                    }
                }
                catch(error){
                    console.error(error);
                    resolve(false);
                }
            }
        });
    }

    async setInfo(data){
        return new Promise(async (resolve, reject) => {
            const res = data.match(/\"id\":.\"(.*?)\"/ig);
            this.name = data.match(/\"channel\":.\"(.*?)\"/)[1];

            // if(res.length === 0){
            //     reject("No results found");
            //     return;
            // }

            for(let i = 0; i < res.length; i++){
                const match = res[i].match(/\"id\":.\"(.*?)\"/)
                
                if(match[1].length > 3){

                    const media = new Media();
                    media.url = `https://www.youtube.com/watch?v=${match[1]}`;
                    media.options = {
                        format: "best",
                        audioFormat: null,
                        audioOnly: false,
                        playlist: false
                    };

                    // const result = await media.GetDefaultQualityFormat(media.url);

                    // if(result !== null){
                    //     media.options.format = result.format;
                    //     media.options.audioFormat = result.audioFormat
                    // }

                    this.videos.push(media);
                    
                    this.videos[0].Download();
                }
            };

            resolve();
        });
    }

    async scan(){
        return new Promise(async (resolve, reject) => {
            try{
                const doesEx = await this.doesExcist();
    
                if(!doesEx)
                    reject("No record found of channel");
                
                const process = spawn('youtube-dl', ['--dump-json', this.url]);

                const stdoutData = [];
    
                process.stdout.on('data',async data => {
                    stdoutData.push(data.toString());
                });
    
                process.on('close', async () => {
                    const allData = stdoutData.join();

                    await this.setInfo(allData);

                    console.log(this.videos);

                    resolve();
                });
            }
            catch(error){
                reject(error);
            }
        });
    }

    remove(){
        return new Promise(async (resolve, reject) => {
            try{    
                await Database.run("DELETE FROM yt_channels WHERE id = ?", [this.id]);

                resolve(true);
            }
            catch(error){
                console.log(error);
                reject(error);
            }
        });
    }
}

module.exports = Channel;