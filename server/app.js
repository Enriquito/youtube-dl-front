const settings = require('../config/settings.json');
const fs = require('fs')
const path = require('path');
let express = require('express');
const bodyParser = require('body-parser');
const Media = require('./media');
const {
    writeDatabase,
    readDatabase,
    readSettings,
    writeSettings,
    isDownloading
    } = require('./helpers');
const app = express();
const port = settings.port;

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.use('/', express.static(path.join(__dirname,"../web/dist/")));
app.use('/media/', express.static(settings.outputLocation));

const http = require('http');
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
        const database = await readDatabase();
        const settings = await readSettings();

        if(database === null)
            throw new Error("Error reading database file");

        database.downloads.forEach(async (video, index) => {
            if(id === video.id){
                database.downloads.splice(index, 1);
                await writeDatabase(database);

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

                io.to('ydl').emit('systemMessages', {type: "Success", messages: `${video.title} has been removed from downloads.`});
                return;
            }
        })
    }
    catch(error){
        console.log(error);
        io.to('ydl').emit('systemMessages', {type: "Error", messages: "Error while stopping download process"});
    }
}

const resumeDownload = async id => {
    try{
        const database = await readDatabase();

        if(database === null)
            throw new Error("Error reading database file");

        database.downloads.forEach(async video => {
            if(id === video.id){
                video.status = "queued";
                await writeDatabase(database);

                if(!isDownloading(database.downloads)){
                    Media.downloadQueueItems(io);
                }
            }
        })
    }
    catch(error){
        console.log(error);
        io.to('ydl').emit('systemMessages', {type: "Error", messages: "Error while stopping download process"});
    }
}

const stopDownload = async processId => {
    try{
        const { spawn } = require('child_process');
        const database = await readDatabase();

        if(database === null)
            throw new Error("Error reading database file");

        database.downloads.forEach(async video => {
            if(processId === video.processId){
                video.status = "stopped";
                video.processId = null;
                await writeDatabase(database);

                const stopCommand = spawn('kill', ["-9", processId]);

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
        const database = await readDatabase();

        if(database === null)
            throw new Error("Cannot load database file.");

        database.videos = [];
        database.downloads = [];

        await writeDatabase(database);
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
    let database = null;
    let found = false;
    let delError = false;

    try{
        database = await readDatabase();
    }
    catch(error){
        console.log(error);
        console.log('Cannot read database.');
        io.to('ydl').emit('systemMessages', {type: "Error", messages: "Error while reading database."});
        delError = true;
    }

    if(database != null && !delError){
        database.videos.forEach(async (el, index) => {
            if(el.id === video.id){
                found = true;

                database.videos.splice(index, 1);

                try{
                    fs.unlinkSync(`${el.fileLocation}/${el.fileName}`);
                }
                catch(error){
                    console.log(error);

                    if(error.errno){
                        if(error.errno === -4058){
                            console.log('File not found.');
                            return;
                        }
                    }

                    io.to('ydl').emit('systemMessages', {type: "Error", messages: "Error while deleting file please try again later."});
                }
           }
        });
    }

    if(delError){
        io.to('ydl').emit('systemMessages', {type: "Error", messages: "Error while deleting item."});
    }
    else if(found){
        try{
            await writeDatabase(database);
            console.log(`Database record has been deleted`);
            io.to('ydl').emit('systemMessages', {type: "Success", messages: "Item has been deleted."});
        }
        catch(error){
            console.log(error);
            console.log('Error while writing database file.');
            io.to('ydl').emit('systemMessages', {type: "Error", messages: "Error while writing to database."});
        }
    }
    else{
        io.to('ydl').emit('systemMessages', {type: "Error", messages: "Item not found."});
    }
}

const download = async options => {
    try{
        const database = await readDatabase();
        const media = new Media();
        media.io = io;

        media.url = options.url;
        media.options = {
            format: options.videoQuality,
            audioFormat: options.soundQuality,
            audioOnly: options.audioOnly,
            playlist: options.playlist
        };

        if(options.playlist){
            console.log(`Downloading playlist: ${options.url}`);
            const playlist = await media.PreparePlayListItems();
            const playlistItems = playlist[0];
            const info = playlist[1];

            // console.log(info);

            for(let i = 1; i < playlistItems.length; i++){
                playlistItems[i].options.playlist = info;
                await playlistItems[i].AddToQueue();
            }

            if(!isDownloading(database.downloads)){
                Media.downloadQueueItems(io);
            }

        }
        else if(isDownloading(database.downloads)){
            media.AddToQueue();
        }
        else{
            media.Download();
        }
    }
    catch(error){
        console.log(error);
    }
};

const getVideos = async () => {
    try{
        const database = await readDatabase();

        if(database != null)
            io.to('ydl').emit('getVideos', database.videos.reverse());

    }
    catch(error){
        console.log(error);
    }
};

const getVideo = async id => {
    try{
        const database = await readDatabase();
        let item = null;
        let found = false;

        if(database != null){
            database.videos.forEach(el => {
                if(el.id === id){
                    found = true;
                    item = el;
                }
            });
        }

        if(found)
            io.to('ydl').emit('item', item);
        else
            io.to('ydl').emit('systemMessages', {type: "Warning", messages: "Item not found."});
    }
    catch(error){
        console.log(error);
        res.sendStatus(500);
    }
};

const downloadStatus = async () => {
    try{
        const database = await readDatabase();

        if(database != null)
            io.to('ydl').emit('downloadStatus', database);

    }
    catch(error){
        console.log(error);
    }

};

const deleteDownloads = async () => {
    try{
        const database = await readDatabase();

        if(database === null)
            throw 'Error loading database file';

        let temp = database.downloads.splice();

        database.downloads.forEach((el, index) => {
            if(el.status !== 'downloading' || el.status !== 'queued'){
                temp = temp.splice(index, 1);
            }
        });

        database.downloads = temp;

        writeDatabase(database);
        console.log('Downloads deleted.');
    }
    catch(error){
        console.log(error);
    }
};

const updateSettings = async settings => {
    try{
        let data = await readSettings();

        if(data === null){
            io.to('ydl').emit('systemMessages', {type: "Error", messages: "Error fetching settings."});
            return;
        }

        await writeSettings(settings);
        io.to('ydl').emit('systemMessages', {type: "Success", messages: "Settings has been updated."});
    }
    catch(error){
        console.log(error);
        io.to('ydl').emit('systemMessages', {type: "Error", messages: "Error updating settings."});
    }
}

const getSettings = async () => {
    try{
        const data = await readSettings();

        if(data === null)
            io.to('ydl').emit('systemMessages', {type: "Error", messages: "Error fetching settings."});

        io.to('ydl').emit('getSettings', data);
    }
    catch(error){
        console.log(error);
        io.to('ydl').emit('systemMessages', {type: "Error", messages: "Error fetching settings."});
    }
}

app.get('/', (req,res) => {
    res.sendFile('index.html', { root: path.join(__dirname, '../web/dist') });
});

app.get('/items', async (req,res) => {
    try{
        const database = await readDatabase();

        if(database != null){
            res.json(database);
        }
        else{
            res.sendStatus(204);
        }
    }
    catch(error){
        console.log(error);
        res.sendStatus(500);
    }
});

app.get('/items/:id', async (req,res) => {
    try{
        const database = await readDatabase();
        let item = null;
        let found = false;

        if(database != null){
            database.videos.forEach(el => {
                if(el.id === req.params.id){
                    found = true;
                    item = el;
                }
            });
        }

        if(found)
            res.json(item);
        else
            res.sendStatus(404);
    }
    catch(error){
        console.log(error);
        res.sendStatus(500);
    }

});

app.post('/info', async (req,res) => {
    try{
        const info = await Media.GetDownloadInfo(req.body.url);

        if(info != null)
            res.json(info);
    }
    catch(error){
        console.log(error);
        res.sendStatus(500);
    }
});

app.get('/file/:id', async (req,res) => {
    try{
        const db = await readDatabase();
        let file = null;
        let found = false;

        if(db != null){
            db.videos.forEach(async el => {
                if(el.id === req.params.id){
                    file = path.join(__dirname, el.fileLocation, el.fileName);
                    found = fs.existsSync(file);
                }
            });

            if(found)
                res.download(file);
            else
                res.sendStatus(404);
        }
    }
    catch(error){
        console.log('error downloading file');
        res.sendStatus(500);
    }
});

app.post('/download', async (req,res) => {
    try{
        const database = await readDatabase();
        const media = new Media();
        media.io = io;

        media.url = req.body.url;
        media.options = {
            format: req.body.videoQuality,
            audioFormat: req.body.soundQuality,
            audioOnly: req.body.audioOnly,
            playlist: req.body.playlist
        };

        if(isDownloading(database.downloads)){
            const result = await media.AddToQueue();
            let returnCode = 201;

            if(!result)
                returnCode = 500;

            res.status(returnCode).json({
                code: result.code,
                messages: result.messages
            });

            return;
        }
        else{
            media.Download();
            res.sendStatus(200);
        }
    }
    catch(error){
        console.log(error);
        res.status(500).json(error);
    }
});

app.get('/download/status', async (req,res) => {
    try{
        const database = await readDatabase();

        res.json(database.downloads);
    }
    catch(error){
        console.log(error);
        res.sendStatus(500);
    }

})

app.delete('/items/:id', async (req,res) => {
    let database = null;
    let found = false;
    let delError = false;

    try{
        database = await readDatabase();
    }
    catch(error){
        console.log(error);
        console.log('Cannot read database.');
        delError = true;
    }

    if(database != null && !delError){
        database.videos.forEach(async (el, index) => {
            if(el.id === req.params.id){
                found = true;

                database.videos.splice(index, 1);

                try{
                    fs.unlinkSync(`${el.fileLocation}/${el.fileName}`);
                }
                catch(error){
                    console.log(error);

                    if(error.errno){
                        if(error.errno === -4058){
                            console.log('File not found.');
                        }
                    }
                }
           }
        });
    }

    if(delError){
        res.sendStatus(500);
    }
    else if(found){
        try{
            await writeDatabase(database);
            res.sendStatus(200);
            console.log(`Database record has been deleted`);
        }
        catch(error){
            console.log(error);
            console.log('Error while writing database file.');
            res.sendStatus(500);
        }
    }
    else{
        res.sendStatus(404);
    }
});

app.delete('/download/status', async (req,res) => {
    try{
        const database = await readDatabase();

        database.downloads = [];

        await writeDatabase(database);

        res.sendStatus(200);
    }
    catch(error){
        console.log(error);
        res.sendStatus(500);
    }
});

app.get('/settings', async (req,res) => {
    try{
        const data = await readSettings();

        if(data === null)
            res.send(400).json({error: 'Error fetching settings'});

        res.json(data);
    }
    catch(error){
        console.log(error);
        res.sendStatus(500);
    }
});

app.put('/settings', async (req,res) => {
    try{
        const data = await readSettings();

        if(data === null){
            res.send(400).json({error: 'Error fetching settings'});
            return;
        }

        const updates = Object.keys(req.body);
        let changesMade = false;

        updates.forEach((el, index) => {
            console.log(el);
            switch(el){
                case 'port':
                    data.settings.port = req.body.port;
                    changesMade = true;
                    break;
                case 'defaultQuality':
                    data.settings.defaultQuality = req.body.defaultQuality;
                    changesMade = true;
                    break;
                case 'outputLocation':
                    data.settings.outputLocation = req.body.outputLocation;
                    changesMade = true;
                    break;
            }
        })

        if(changesMade)
            await writeSettings(data);

        res.json(data);
    }
    catch(error){
        console.log(error);
        res.sendStatus(500);
    }
});

httpServer.listen(port, () => {
    console.log(`HTTP Server running on port ${port}`);
});