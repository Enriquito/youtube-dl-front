const { spawn, exec } = require('child_process');
const fs = require('fs');
const {writeDatabase, readDatabase} = require('./helpers');

const getDownloadInfo = (id, options) => {
    return new Promise((resolve, reject) => {

        let command = `youtube-dl -J https://www.youtube.com/watch?v=${id}`;

        exec(command, (error, stdout, stderr) => {
            if(error){
                reject(error);
                return;
            }

            resolve(JSON.parse(stdout));
        });
    })
};

const getDownloadOptions = (options, url) => {
    let directory = './videos';
    let fileName = '%(id)s';
    const args = [];

    if(options.directory)
        directory = options.directory;

    if(options.audioOnly){
        directory = './music';
        args.push(`--extract-audio`);
        args.push(`mp3`);

        // if(options.playlist)
        //     command = `youtube-dl --output '${directory}/${fileName}.%(ext)s' --extract-audio --audio-format mp3 --yes-playlist --ignore-errors --print-json ${url}`;
        // else

    }
    else if(options.playlist){

    }
    else{
        if(options.format){
            args.push(`-f`);
            args.push(`${options.format}+${options.audioFormat}`);
        }
        else{
            args.push(`--recode-video`);
            args.push(`mp4`);
        }
    }
    args.push('--output');
    args.push(`${directory}/%(id)s.%(ext)s`);
    args.push('--console-title');
    args.push(url);

    return {
        directory: directory,
        args: args
    };
};

const getInfo = (url,options) => {
    return new Promise((resolve, reject) => {
        try{
            let command;
            if(options.format)
                command = `youtube-dl --skip-download --dump-json -f ${options.format}+${options.audioFormat} ${url}`;
            else
                command = `youtube-dl --skip-download --dump-json ${url}`;

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

const download = (url, options) => {
    return new Promise(async (resolve, reject) => {
        try{
            console.log(`Download started for file: ${url}`);

            const downloadOptions = getDownloadOptions(options,url);
            console.log(downloadOptions);
            let fileInfo = await getInfo(url,options);
            let db = await readDatabase();

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
                let formatNote;

                db.downloads.forEach(async (download) => {
                    if(download.id === fileInfo.id){
                        download.status = 'finished';
                        await writeDatabase(db);
                    }
                });

                if(options.audioOnly)
                    extention = "mp3";
                else
                    extention = fileInfo.ext;

                fileInfo.formats.forEach(format => {
                    if(format.format_id === options.format)
                        formatNote = format.format_note;
                })

                let fname = `${fileInfo.title}.${extention}`;
                let newfname = `${fileInfo.title}.${extention}`;

                if(formatNote !== undefined){
                    fname = `${fileInfo.title} - ${formatNote}.${extention}`
                    newfname = `${fileInfo.title} - ${formatNote}.${extention}`
                }

                fs.renameSync(`${downloadOptions.directory}/${fileInfo.id}.${extention}`,`${downloadOptions.directory}/${newfname}`);

                const info = {
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
                    fileLocation: `${downloadOptions.directory}`,
                    fileName: fname
                }

                console.log('Download complete');

                resolve({success: true, info: info});
            });
        }
        catch(error){
            console.log(error);
            reject(error);
            return;
        }
    });
}

module.exports.getDownloadInfo = getDownloadInfo;
module.exports.download = download;

