const fs = require('fs')
const path = require('path');
let express = require('express');
const bodyParser = require('body-parser');
const Database = require("./database");
const Download = require('./download');
const Settings = require("./settings");
const Media = require('./media');

const app = express();
const settings = new Settings();

Database.checkFirstUse()
.then(() => {
    settings.load()
        .then(() => {
            httpServer.listen(settings.port, () => {
                console.log(`HTTP Server running on port ${settings.port}`);
            });

            app.use('/media/', express.static(settings.outputLocation));
        });
})
.catch(error => {
    console.log(error);
});

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.use('/', express.static(path.join(__dirname,"../web/dist/")));

const http = require('http');
const Video = require('./video');
const httpServer = http.createServer(app);
const io = require('socket.io')(httpServer);

io.on('connection', (socket) => {
    socket.join('ydl');

    socket.on('getVideos', getVideos);
    socket.on('getVideo', getVideo);
    socket.on('downloadStatus', downloadStatus);
    socket.on('DeleteDownloads', deleteDownloads);
    socket.on('download', download);
    socket.on('deleteVideo', deleteVideo);
    socket.on('getVideoInfo', getVideoInfo);
    socket.on('updateSettings', updateSettings);
    socket.on('getSettings', getSettings);
    socket.on('emptyDatabase', emptyDatabase);
    socket.on('stopDownload', stopDownload);
    socket.on('resumeDownload', resumeDownload);
    socket.on('removeDownload', removeDownload);
    socket.on('getPlaylist', getPlaylistInfo);
});

const getPlaylistInfo = async url => {
    try{
        const info  = await Media.getPlaylistInfo(url);
        io.to('ydl').emit('getPlaylist', info);
    }
    catch(error){
        console.log(error);
        io.to('ydl').emit('systemMessages', {type: "Error", messages: "Error while fetching playlist info."});
    }
}

const removeDownload = async id => {
    try{
        const download = await Download.find(id);

        if(download === null){
            io.to('ydl').emit('systemMessages', {type: "Error", messages: "Download process not found."});
            return;
        }

        // clean up .part files
        const dirItems = fs.readdirSync(settings.outputLocation)

        for(let i = 0; i < dirItems.length; i++){
            const file = dirItems[i];
            const match = file.match(/.*.part/);

            if(match !== null){
                if(match.length > 0){
                    fs.unlinkSync(`${settings.outputLocation}/${file}`);
                }
            }
        };

        io.to('ydl').emit('systemMessages', {type: "Success", messages: `${download.title} has been removed from downloads.`});
    }
    catch(error){
        console.log(error);
        io.to('ydl').emit('systemMessages', {type: "Error", messages: "Error while stopping download process"});
    }
}

const resumeDownload = async id => {
    try{
        const download = await Download.find(id);

        if(download === null){
            io.to('ydl').emit('systemMessages', {type: "Error", messages: "Download process not found."});
            return;
        }

        download.status = "queued";

        await download.update();

        if(!await isDownloading()){
            Media.downloadQueueItems(io);
        }
    }
    catch(error){
        console.log(error);
        io.to('ydl').emit('systemMessages', {type: "Error", messages: "Error while stopping download process"});
    }
}

const stopDownload = async processId => {
    try{
        const { spawn } = require('child_process');
        const downloads = await Download.all();

        if(download === null){
            io.to('ydl').emit('systemMessages', {type: "Error", messages: "Error reading database."});
            return;
        }

        downloads.forEach(async video => {
            if(processId === video.processId){
                video.status = "stopped";
                video.processId = null;
                await video.update();

                const stopCommand = spawn('kill', ["-9", video.processId]);

                stopCommand.on('close', async () => {
                    io.to('ydl').emit('systemMessages', {type: "Success", messages: `Download has been stopped for ${video.title}`});
                });
            }
        })
    }
    catch(error){
        console.log(error);
        io.to('ydl').emit('systemMessages', {type: "Error", messages: "Error while stopping download process"});
    }
}

const emptyDatabase = async () => {
    try{
        await Database.purge();
        await getVideos();

        io.to('ydl').emit('systemMessages', {type: "Success", messages: "Database has been emptied"});
    }
    catch(error){
        io.to('ydl').emit('systemMessages', {type: "Error", messages: error});
    }
}

const getVideoInfo = async url => {
    try{
        const info = await Media.GetDownloadInfo(url);

        if(info != null)
            io.to('ydl').emit('videoInfo', info);
    }
    catch(error){
        console.log(error);
        io.to('ydl').emit('systemMessages', {type: "Error", messages: "Error while fetching info."});
    }
}

const deleteVideo = async video => {
    try{
        const vid = await Video.find(video.id);

        if(vid == null){
            io.to('ydl').emit('systemMessages', {type: "Error", messages: "Item not found."});
            return;
        }

        
        await vid.remove();
        console.log(`${vid.fileLocation}/${vid.fileName}.${vid.extention}`);
        fs.unlinkSync(`${vid.fileLocation}/${vid.fileName}.${vid.extention}`);
        io.to('ydl').emit('systemMessages', {type: "Success", messages: "Item has been deleted."});
    }
    catch(error){
        if(error.errno){
            if(error.errno === -4058){
                console.log('File not found.');
                io.to('ydl').emit('systemMessages', {type: "Error", messages: "Video file not found. Video record has been deleted."});
                return;
            }
        }

        console.log(error);
        io.to('ydl').emit('systemMessages', {type: "Error", messages: "Error while searching the video data."});
    }
}

const download = async data => {
    try{
        const itemList = [];
        console.log(data);

        if(data.list.length > 1){
            for(let i = 0; i < data.list.length; i++){
                const media = new Media();
                media.io = io;
                media.url = data.list[i].url;
                media.options = {
                    format: data.list[i].videoQuality,
                    audioFormat: data.list[i].soundQuality,
                    audioOnly: data.list[i].audioOnly,
                    playlist: data.list[i].playlist
                };

                const result = await media.GetDefaultQualityFormat(media.url);

                if(result !== null){
                    media.options.format = result.format;
                    media.options.audioFormat = result.audioFormat
                }

                itemList.push(media);
                
            }

            console.log(`Downloading playlist.`);

            for(let i = 0; i < itemList.length; i++){
                await itemList[i].AddToQueue();
            }

            if(!await isDownloading()){
                Media.downloadQueueItems(io);
            }
        }
        else if(data.list.length === 1){
            const item = data.list[0];
            const media = new Media();
            media.io = io;
            media.url = item.url;
            media.options = {
                format: item.videoQuality,
                audioFormat: item.soundQuality,
                audioOnly: item.audioOnly,
                playlist: item.playlist
            };

            if(await isDownloading()){
                media.AddToQueue();
            }
            else{
                media.Download();
            }
        }
        else{
            console.log('No download data found.');
        }
    }
    catch(error){
        console.log(error);
    }
};

const getVideos = async () => {
    try{
        const videos = await Video.all();

        if(videos != null)
            io.to('ydl').emit('getVideos', videos.reverse());
    }
    catch(error){
        console.log(error);
    }
};

const getVideo = async id => {
    try{
        const video = await Video.find(id);

        if(video !== null || video !== undefined)
            io.to('ydl').emit('item', video);
        else
            io.to('ydl').emit('systemMessages', {type: "Warning", messages: "Item not found."});
    }
    catch(error){
        console.log(error);
    }
};

const downloadStatus = async () => {
    try{
        const downloads = await Download.all();

        if(downloads != null)
            io.to('ydl').emit('downloadStatus', downloads);
    }
    catch(error){
        console.log(error);
    }
};

const deleteDownloads = async () => {
    try{
        await Database.run("DELETE FROM downloads WHERE status != 'downloading' AND status != 'queued'");

        console.log('Downloads deleted.');
    }
    catch(error){
        console.log(error);
    }
};

const updateSettings = async newSettings => {
    try{
        if(settings === null){
            io.to('ydl').emit('systemMessages', {type: "Error", messages: "Error fetching settings."});
            return;
        }

        settings.port = newSettings.port;
        settings.defaultQuality = newSettings.defaultQuality;
        settings.outputLocation = newSettings.outputLocation;
        settings.authentication.username = newSettings.authentication.username;
        settings.authentication.password = newSettings.authentication.password;
        // settings.authentication.twofa = newSettings.authentication.password;
        
        settings.update();

        io.to('ydl').emit('systemMessages', {type: "Success", messages: "Settings has been updated."});
    }
    catch(error){
        console.log(error);
        io.to('ydl').emit('systemMessages', {type: "Error", messages: "Error updating settings."});
    }
}

const getSettings = async () => {
    try{
        await settings.load();

        if(settings === null)
            io.to('ydl').emit('systemMessages', {type: "Error", messages: "Error fetching settings."});

        io.to('ydl').emit('getSettings', settings);
    }
    catch(error){
        console.log(error);
        io.to('ydl').emit('systemMessages', {type: "Error", messages: "Error fetching settings."});
    }
}

const isDownloading = () => {
    return new Promise(async (resolve, reject) => {
        try{
            const downloads = await Download.all("status = ?", "downloading");
    
            console.log(downloads);
    
            if(downloads.length > 0)
                resolve(true)
            else
                resolve(false);
        }
        catch(error){
            console.error(error);
            reject(error);
        }
    });
    
}

app.get('/', (req,res) => {
    res.sendFile('index.html', { root: path.join(__dirname, '../web/dist') });
});

app.get('/file/:id', async (req,res) => {
    try{
        const video = await Video.find(req.params.id);

        console.log(video);

        let file = null;
        let found = false;

        if(video !== null){
            file = path.join(__dirname, video.fileLocation, `${video.fileName}.${video.extention}`);
            found = fs.existsSync(file);
        }

        if(found)
            res.download(file);
        else
            res.sendStatus(404);
    }
    catch(error){
        console.error(error);
        console.log('error downloading file');
        res.sendStatus(500);
    }
});