const { exec } = require('child_process');

const getDownloadInfo = (url, options) => {
    return new Promise((resolve, reject) => {
        let command = `youtube-dl -J ${url}`;

        // if(options.format){
        //     command = `youtube-dl -mat ${url}`
        // }

        exec(`youtube-dl -J ${url}`, (error, stdout, stderr) => {
            if(error){
                console.log(error);
                reject(error);
            }

            resolve(JSON.parse(stdout));
        });
    })
};

const download = (url, options) => {
    return new Promise(async (resolve, reject) => {
        let command = "";
        let directory = './videos';

        if(options.directory)
            directory = options.directory;

        if(options.audioOnly)
            command = `youtube-dl --output '${directory}/%(id)s.%(ext)s' --extract-audio --audio-format mp3 --print-json ${url}`;
        else
            command = `youtube-dl --output '${directory}/%(id)s.%(ext)s' --format ${options.format}+${options.audioFormat} --print-json ${url}`;

        exec(command, (error, stdout, stderr) => {
            if(error){
                console.log(error);
                reject(error);
            }

            console.log(`Downloading file with the following command: ${command}`);

            const fileinfo = JSON.parse(stdout);

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
                extention : fileinfo.ext,
                format : fileinfo.format_note,
                videoUrl : fileinfo.webpage_url
            }

            resolve({success: true, info: info});
        });


    });
}

module.exports.getDownloadInfo = getDownloadInfo;
module.exports.download = download;

