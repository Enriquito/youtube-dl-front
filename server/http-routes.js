module.exports = (app) => {
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
    
    
}