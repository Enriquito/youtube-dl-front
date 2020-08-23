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

        if(options.format && options.directory)
            command = `youtube-dl --output '${options.directory}/%(id)s.%(ext)s' --format ${options.format} --print-json ${url}`;
        else if(options.format )
            command = `youtube-dl --output './videos/%(id)s.%(ext)s' --format ${options.format} --print-json ${url}`;
        else
            command = `youtube-dl --output './videos/%(id)s.%(ext)s' --print-json ${url}`;

        exec(command, (error, stdout, stderr) => {
            if(error){
                console.log(error);
                reject(error);
            }

            console.log(`Downloading file with the following command: ${command}`);

            resolve(JSON.parse(stdout));
        });
    });
}

module.exports.getDownloadInfo = getDownloadInfo;
module.exports.download = download;

