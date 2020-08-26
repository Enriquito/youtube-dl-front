const fs = require('fs')
let express = require('express');
const {download, getDownloadInfo} = require('./youtubedl')
const bodyParser = require('body-parser');
const {writeDatabase, readDatabase} = require('./helpers');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use('/media/videos', express.static('videos'));
app.use('/media/music', express.static('music'));

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

app.get('/info/:type/:url', async (req,res) => {
    try{
        if(req.params.type === 'video'){
            const info = await getDownloadInfo(req.params.url);

            if(info != null)
                res.json(info);
        }

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
                    file = `${el.fileLocation}/${el.fileName}`;
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
        const downloadResult = await download(req.body.url, {
            format: req.body.videoQuality,
            audioFormat: req.body.soundQuality,
            audioOnly: req.body.audioOnly,
            playlist: req.body.playlist
        });

        if(downloadResult.success){
            const database = await readDatabase();

            if(req.body.playlist){
                console.log(downloadResult.info);
                res.status(201).send(downloadResult.info);
            }
            else if(database != null){

                database.videos.push(downloadResult.info);

                await writeDatabase(database);

                res.status(201).send(downloadResult.info);
            }
        }
    }
    catch(error){
        console.log(error);
        res.json(error);
    }
});

app.delete('/items/:id', async (req,res) => {
    try{
        let found = false;
        const database = await readDatabase();

        if(database != null){
            database.videos.forEach((el, index) => {
                if(el.id === req.params.id){
                    found = true;

                    fs.unlink(`./videos/${el.id}.${el.extention}`, async (error) =>{
                        if(error)
                            console.log(error);

                        console.log(`File: ${el.id} has been deleted`);
                        database.videos.splice(index, 1);
                        await writeDatabase(database);
                    });
                }
            });

            if(found)
                res.sendStatus(200);
            else
                res.sendStatus(404);
        }
    }
    catch(error){
        res.sendStatus(500);
    }


});

const http = require('http');
const httpServer = http.createServer(app);

httpServer.listen(3000, () => {
    console.log('HTTP Server running on port 3000');
});