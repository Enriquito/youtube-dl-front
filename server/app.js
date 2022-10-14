const fs = require('fs')
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const Database = require("./src/classes/database");
const Channel = require('./src/classes/channel')
const Download = require('./src/classes/download');
const Settings = require("./src/classes/settings");
const Video = require('./src/classes/video');
const Downloader = require('./src/classes/downloader');
const Queue = require('./src/classes/queue');

const DownloadQueue = new Queue();
const app = express();
const settings = new Settings();

Database.checkFirstUse()
    .then(() => {
        settings.load()
            .then(async () => {
                httpServer.listen(settings.port, () => {
                    console.log(`HTTP Server running on port ${settings.port}`);
                });

                app.use('/media/', express.static(settings.outputLocation));

                DownloadQueue.load()
                    .then(async (queueItems) => {
                        emitEvent('downloadStatus', queueItems);
                        Downloader.queue = DownloadQueue;
                        await resetYdlpCache();
                        await Downloader.start();
                    })
                    .catch(error => {
                        console.error(error);
                    });
            });
    })
    .catch(error => {
        console.log(error);
    });

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
const {emitEvent, resetYdlpCache} = require("./src/helpers");

app.use('/', express.static(path.join(__dirname,"../web/dist/")));

const http = require('http');
const httpServer = http.createServer(app);
const io = require('socket.io')(httpServer);

// Clears the yt-dlp cache every 10 minutes
setInterval(async () => {
    await resetYdlpCache();
    console.log('yt-dlp cache have been cleared')
}, (1000 * 60) * 30)

io.on('connection', (socket) => {
    socket.join('ydl');

    socket.on('emitEvents',function(type, value){
        socket.join('ydl');
        io.to('ydl').emit(type, value);
    });

    socket.on('healthCheck', healthCheck);

    socket.on('getVideos', getVideos);
    socket.on('getVideo', getVideo);
    socket.on('deleteVideo', deleteVideo);
    socket.on('getVideoInfo', getVideoInfo);

    socket.on('downloadStatus', downloadStatus);
    socket.on('DeleteDownloads', deleteDownloads);
    socket.on('download', download);
    socket.on('downloadQueue', downloadQueue);
    socket.on('stopDownload', stopDownload);
    socket.on('resumeDownload', resumeDownload);
    socket.on('removeDownload', removeDownload);
   
    socket.on('updateSettings', updateSettings);
    socket.on('getSettings', getSettings);

    socket.on('emptyDatabase', emptyDatabase);
   
    socket.on('getPlaylist', getPlaylistInfo);
    
    socket.on('getChannels', getChannels);
    socket.on('getChannel', getChannel);
    socket.on('getVideosByChannelID', getVideosByChannelID);
    socket.on('toggleAutoDownloadAfterScan', toggleAutoDownloadAfterScan);
    socket.on('scanChannel', scanChannel);
    socket.on('isChannelScanning', isChannelScanning);
});

const healthCheck = () => {
    io.to('ydl').emit('healthCheck', true);
};

const isChannelScanning = async (channelID) => {
    try {
        const channel = await Channel.find(channelID);

        io.to('ydl').emit('isChannelScanning', channel.isScanning);
    }
    catch (error) {
        console.error(error);
        io.to('ydl').emit('systemMessages', {type: "Error", messages: "Error fetching channel scanning status"});
    }
};

const scanChannel = async (channelID) => {
    try {
        const channel = await Channel.find(channelID);

        channel.isScanning = true;
        io.to('ydl').emit('isChannelScanning', channel.isScanning);
        await channel.update();

        io.to('ydl').emit('systemMessages', {type: "Info", messages: `Scanning channel '${channel.name}'`});

        const refreshPageInterval = setInterval(() => {
            io.to('ydl').emit('scanChannel');
        }, 5000);

        await channel.scan();

        channel.isScanning = false;
        io.to('ydl').emit('isChannelScanning', channel.isScanning);
        await channel.update();

        clearInterval(refreshPageInterval);
        io.to('ydl').emit('scanChannel');

        io.to('ydl').emit('systemMessages', {type: "Info", messages: `Scan complete for channel: ${channel.name}`});
        
    } 
    catch(error) {
        console.error(error);
        io.to('ydl').emit('systemMessages', {type: "Error", messages: "Error scanning channel"});
    }
}

const toggleAutoDownloadAfterScan = async (channelID) => {
    try {
        const channel = await Channel.find(channelID);
        
        channel.autoDownloadAfterScan = !channel.autoDownloadAfterScan;

        await channel.update();

        io.to('ydl').emit('toggleAutoDownloadAfterScan', channel.autoDownloadAfterScan);

    }
    catch(error) {
        console.error(error);
        io.to('ydl').emit('systemMessages', {type: "Error", messages: "Error enableing auto dowload"});
    }
}

const getVideosByChannelID = async (id) => {
    try {
        const channel = await Channel.find(id);
        const videos = await channel.getVideos()

        io.to('ydl').emit('getVideosByChannelID', videos.data);
    }
    catch (error) {
        console.error(error);
        io.to('ydl').emit('systemMessages', {type: "Error", messages: "Error while fetching channels."});
    }
}

const getChannels = async () => {
    try {
        const channels = await Channel.all();
        io.to('ydl').emit('getChannels', channels);
    }
    catch (error) {
        console.error(error);
        io.to('ydl').emit('systemMessages', {type: "Error", messages: "Error while fetching channels."});
    }
}

const getChannel = async id => {
    try {
        const channel = await Channel.find(id);
        io.to('ydl').emit('getChannel', channel);
    }
    catch (error) {
        console.error(error);
        io.to('ydl').emit('systemMessages', {type: "Error", messages: "Error while fetching channels."});
    }
}

const downloadQueue = async () => {
    try{
        io.to('ydl').emit('downloadQueue', DownloadQueue.items);
    }
    catch(error){
        console.log(error);
        io.to('ydl').emit('systemMessages', {type: "Error", messages: "Error while fetching queue info."});
    }
}

const getPlaylistInfo = async url => {
    try{
        const info  = await Downloader.getPlaylistInfo(url);
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

        await download.remove();

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
        }

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
    }
    catch(error){
        console.log(error);
        io.to('ydl').emit('systemMessages', {type: "Error", messages: "Error while stopping download process"});
    }
}

const stopDownload = async processId => {
    try{
        await Downloader.stop(processId);
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
        const info = await Download.getInfo(url, null);

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

        if(vid === null){
            io.to('ydl').emit('systemMessages', {type: "Error", messages: "Item not found."});
            return;
        }

        const channel = await Channel.find(vid.channelId);
        const success = await vid.remove();

        channel.setVideoAsDownloaded(vid.videoProviderId, true);

        if(success){
            fs.unlinkSync(`${vid.fileLocation}/${vid.fileName}.${vid.extention}`);
            io.to('ydl').emit('systemMessages', {type: "Success", messages: "Item has been deleted."});
        }
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
        if(data.list.length === 0) 
            return;

        for(let i = 0; i < data.list.length; i++){
            const item = data.list[i];

            const options = {
                format: item.videoQuality,
                audioFormat: item.soundQuality,
                audioOnly: item.audioOnly,
                playlist: item.playlist
            };

            const download = new Download();

            let fileInfo = await Download.getInfo(item.url, options);

            download.videoId = fileInfo.id;
            download.title = fileInfo.title;
            download.status = 'queued';
            download.url = item.url;
            download.format = options.format;
            download.audioFormat = options.audioFormat;
            download.audioOnly = options.audioOnly;
            download.playlist = options.playlist;

            await download.save();

            await DownloadQueue.add(download);

            emitEvent('downloadQueue', DownloadQueue.items);

            if (DownloadQueue.count() > 1 || Downloader.isDownloading) {
                emitEvent('systemMessages', {type: "Success", messages: `Download '${fileInfo.title} has been added to the queue.`});
            }

            await Downloader.start();
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

        if(video !== null)
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
        const download = await Download.find('downloading', 'status = ?');

        if(download != null)
            io.to('ydl').emit('downloadStatus', download);
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
        
        await settings.update();

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

        io.to('ydl').emit('getSettings', settings);
    }
    catch(error){
        console.log(error);
        io.to('ydl').emit('systemMessages', {type: "Error", messages: "Error fetching settings."});
    }
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