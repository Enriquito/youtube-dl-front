const { spawn, exec } = require('child_process');
const fs = require('fs');
const {writeDatabase, readDatabase} = require('./helpers');

class Media
{
    constructor(url, options){
        this.url = url;
        this.options = options;
        this.info = null;
    }
    GetDownloadOptions(){
        let directory = './videos';
        const args = [];
        console.log(this.options);

        if(this.options.directory)
            directory = this.directory;

        if(this.options.audioOnly && this.options.playlist){
            directory = './music';
            args.push('--extract-audio');
            args.push('--audio-format')
            args.push('--yes-playlist')
            args.push('mp3');

        //     command = `youtube-dl --output '${directory}/${fileName}.%(ext)s' --extract-audio --audio-format mp3 --yes-playlist --ignore-errors --print-json ${url}`;
        }
        else if(this.options.audioOnly && !this.options.playlist){
            directory = './music';
            args.push('--extract-audio');
            args.push('--audio-format')
            args.push('mp3');
        }
        else if(this.options.playlist){

        }
        else if(this.options.format && this.options.audioFormat){
            args.push(`-f`);
            args.push(`${this.options.format}+${this.options.audioFormat}`);
        }
        else if(this.options.format && this.options.audioFormat !== null){

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
        return new Promise((resolve, reject) => {

            let command = `youtube-dl -J ${url}`;

            exec(command, (error, stdout, stderr) => {
                if(error){
                    reject(error);
                    return;
                }

                resolve(JSON.parse(stdout));
            });
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
                        reject(error);
                        return;
                    }

                    resolve(JSON.parse(stdout));
                });
            }
            catch(error){
                console.log(error);
                reject(error);
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

                const downloadOptions = this.GetDownloadOptions();
                console.log(downloadOptions);
                let fileInfo = await this.GetInfo(this.url,this.options);
                let formatNote = this.GetFormat(fileInfo);
                let db = await readDatabase();
                let extention;
                let fname;

                if(this.options.audioOnly)
                        extention = "mp3";
                else
                    extention = fileInfo.ext;

                if(formatNote !== undefined)
                    fname = `${fileInfo.title} - ${formatNote}.${extention}`;
                else
                    fname = `${fileInfo.title}.${extention}`;

                if(this.CheckForDoubleVideos(db, fname)){
                    resolve({success: false, messages: 'Item already excists', code: 2});
                    return;
                }

                db.downloads.forEach((el,index) => {
                    if(el.id === fileInfo.id){
                        db.downloads.splice(index,1);
                    }
                });

                db.downloads.push({
                    id: fileInfo.id,
                    title: fileInfo.title,
                    status: 'downloading',
                    downloadStatus: 0
                });

                await writeDatabase(db);

                const download = spawn('youtube-dl', downloadOptions.args);

                let status;
                let oldStatus = 0;

                download.stdout.on('data',data => {
                    const downloadStatus = data.toString().match(/(\d+)\.(\d)%/);

                    if(downloadStatus != null){
                        if(parseInt(downloadStatus[1]) > oldStatus){
                            status = parseInt(downloadStatus[1]);
                            oldStatus = status;

                            db.downloads.forEach(async (download) => {
                                if(download.id === fileInfo.id){
                                    download.downloadStatus = status;
                                    await writeDatabase(db);
                                }
                            });
                        }
                    }
                });

                download.on('close', () => {
                    db.downloads.forEach(async (download) => {
                        if(download.id === fileInfo.id){
                            download.status = 'finished';
                            await writeDatabase(db);
                        }
                    });

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

                    console.log('Download complete');

                    resolve({success: true, messages: "Download successfull", code: 1});
                });
            }
            catch(error){
                console.log(error);
                reject(error);
                return;
            }
        });
    }
}

module.exports = Media;