const { exec } = require('child_process');
const fs = require('fs');

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

const download = (url, options) => {
    return new Promise(async (resolve, reject) => {
        let command = "";
        let directory = './videos';
        let fileName = '%(id)s';

        if(options.directory)
            directory = options.directory;

        if(options.audioOnly){
            directory = './music';

            if(options.playlist)
                command = `youtube-dl --output '${directory}/${fileName}.%(ext)s' --extract-audio --audio-format mp3 --yes-playlist --ignore-errors --print-json ${url}`;
            else
                command = `youtube-dl --output '${directory}/${fileName}.%(ext)s' --extract-audio --audio-format mp3 --print-json ${url}`;
        }
        else if(options.playlist)
            command = `youtube-dl --output '${directory}/%(playlist_index)s - %(title)s.%(ext)s' --yes-playlist --ignore-errors --print-json ${url}`;
        else{
            if(options.format)
                command = `youtube-dl --output '${directory}/${fileName}.%(ext)s' -f ${options.format}+${options.audioFormat} --print-json ${url}`;
            else
                command = `youtube-dl --output '${directory}/${fileName}.%(ext)s' --recode-video mp4 --print-json ${url}`;
        }

        console.log(`Downloading file with the following command: ${command}`);

        exec(command, (error, stdout, stderr) => {
            if(error){
                console.log(error);
                reject(error);
                return;
            }

            const fileinfo = JSON.parse(stdout);
            let extention;
            let formatNote;

            fileinfo.formats.forEach(format => {
                if(format.format_id === options.format)
                    formatNote = format.format_note;
            })

            if(options.audioOnly)
                extention = "mp3";
            else
                extention = fileinfo.ext;

            fs.renameSync(`${directory}/${fileinfo.id}.${extention}`, `${directory}/${fileinfo.title} - ${formatNote}.${extention}`);

            const info = {
                thumbnails : fileinfo.thumbnails,
                title: fileinfo.title,
                resolution: {
                    width: fileinfo.width,
                    heigth: fileinfo.height
                },
                tags : fileinfo.tags,
                duration : fileinfo.duration,
                uploader : fileinfo.uploader,
                viewCount : fileinfo.view_count,
                id : fileinfo.id,
                description : fileinfo.description,
                uploaderUrl : fileinfo.channel_url,
                extention : extention,
                format : fileinfo.format_note,
                videoUrl : fileinfo.webpage_url,
                fileLocation: `${directory}`,
                fileName: `${fileinfo.title} - ${formatNote}.${extention}`
            }

            resolve({success: true, info: info});
        });
    });
}

module.exports.getDownloadInfo = getDownloadInfo;
module.exports.download = download;

