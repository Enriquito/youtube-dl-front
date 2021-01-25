const { spawn, exec } = require('child_process');
const fs = require('fs');
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
                let db = await readDatabase();
                let fileInfo = await this.GetInfo(this.url,this.options);

                db.downloads.push({
                    id: fileInfo.id,
                    title: fileInfo.title,
                    status: 'queued',
                    downloadStatus: 0,
                    url: this.url,
                    options: this.options
                });

                await writeDatabase(db);
                this.io.to('ydl').emit('downloadStatus', db);
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

    CheckForDoubleVideos(database, fname){
        let found = false;

        database.videos.forEach(video => {
            if(video.fileName === fname){
                found = true;
            }
        });

        return found;
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
                let db = await readDatabase();
                let extention;
                let fname;
                this.io.to('ydl').emit('systemMessages', {type: "Success", messages: `Download started for ${fileInfo.title}`});

                if(this.options.audioOnly)
                        extention = "mp3";
                else
                    extention = fileInfo.ext;

                fname = `${fileInfo.title.replace(/[:<>"/|?*]/g, '')}`;

                if(formatNote !== undefined)
                    fname = `${fname} - ${formatNote}.${extention}`;
                else
                    fname = `${fname}.${extention}`;

                if(this.CheckForDoubleVideos(db, fname)){
                    resolve({success: false, messages: 'Item already excist', code: 2});
                    return;
                }

                db.downloads.forEach((el,index) => {
                    if(el.id === fileInfo.id){
                        db.downloads.splice(index,1);
                    }
                });

                let downloadsIndex = (db.downloads.length);

                const download = spawn('youtube-dl', downloadOptions.args);

                db.downloads.push({
                    id: fileInfo.id,
                    title: fileInfo.title,
                    status: 'downloading',
                    processId: download.pid,
                    url: this.url,
                    options: this.options
                });

                this.io.to('ydl').emit('downloadStatus', db);

                await writeDatabase(db);

                let status;
                let oldStatus = 0;

                download.stdout.on('data',async data => {
                    const downloadStatus = data.toString().match(/(\d+)\.(\d)%/);

                    if(downloadStatus != null){
                        if(parseInt(downloadStatus[1]) > oldStatus){
                            db = await readDatabase();
                            status = parseInt(downloadStatus[1]);
                            oldStatus = status;

                            db.downloads[downloadsIndex].downloadStatus = status;

                            if(status === 100){
                                db.downloads[downloadsIndex].status = "converting"; 
                                await writeDatabase(db);
                            }
                                
                            this.io.to('ydl').emit('downloadStatus', db);
                        }
                    }
                });

                download.on('close', async () => {

                    if(!fs.existsSync(`${downloadOptions.directory}/${fileInfo.id}.${extention}`)){
                        const db = await readDatabase();

                        if(db.downloads[downloadsIndex].status === "stopped"){
                            console.log('stopped');
                            return;
                        }
                            
                    }

                    while(fs.existsSync(`${downloadOptions.directory}/${fileInfo.id}.${extention}`)){
                        fs.renameSync(`${downloadOptions.directory}/${fileInfo.id}.${extention}`,`${downloadOptions.directory}/${fname}`);
                    }

                    this.info = {
                        thumbnails : fileInfo.thumbnails,
                        title: fileInfo.title,
                        resolution: {
                            width: fileInfo.width,
                            heigth: fileInfo.height
                        },
                        tags : fileInfo.tags,
                        duration : fileInfo.duration,
                        uploader : fileInfo.uploader,
                        viewCount : fileInfo.view_count,
                        id : fileInfo.id,
                        description : fileInfo.description,
                        uploaderUrl : fileInfo.channel_url,
                        extention : extention,
                        format : fileInfo.format_note,
                        videoUrl : fileInfo.webpage_url,
                        fileLocation: downloadOptions.directory,
                        fileName: fname
                    }

                    db.downloads[downloadsIndex].status = 'finished';
                    db.videos.push(this.info);
                    await writeDatabase(db);

                    this.io.to('ydl').emit('downloadStatus', db);
                    this.io.to('ydl').emit('systemMessages', {type: "Success", messages: `${fileInfo.title} has finished downloading`});
                    this.io.to('ydl').emit('getVideos', db.videos.reverse());

                    console.log('Download complete');

                    let haveQueueItems = false;

                    db.downloads.forEach(el => {
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
                this.io.to('ydl').emit('systemMessages', {type: "Error", messages: `${error.messages.messages}`});
                reject({success: false, messages: error, code: 100});
                return;
            }
        });
    }

    static async downloadQueueItems(io){
        const db = await readDatabase();

        for(let i = 0; i < db.downloads.length; i++){
            let el = db.downloads[i];

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