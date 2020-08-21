const fs = require('fs')
let express = require('express');
const youtubedl = require('youtube-dl');
const bodyParser = require('body-parser');
const {writeDatabase, readDatabase} = require('./helpers');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

const ytdownload = (url) => {
    return new Promise(async (resolve, reject) => {
        try{
            let fileinfo = null;

            const video = youtubedl(url,
                ['--format=18'],
                { cwd: __dirname }
            );

            video.on('info', function(info) {
                fileinfo = info;

                console.log('filename: ' + info._filename)
                console.log('size: ' + info.size)
            });

            video.pipe(fs.createWriteStream(`./videos/temp.mp4`))

            video.on('end', function() {
                console.log('finished downloading!')

                console.log('Renaming file..');
                fs.rename(`./videos/temp.mp4`, `./videos/${fileinfo.id}.${fileinfo.ext}`, () => {
                    console.log('Renaming complete.')
                });

                console.log(fileinfo)

                const info = {
                    thumbnails : fileinfo.thumbnails,
                    title: fileinfo.title,
                    resolution: {
                        width: fileinfo.width,
                        heigth: fileinfo.height
                    },
                    tags : fileinfo.tags,
                    duration : fileinfo.duration,
                    uploader : fileinfo.uploader_id,
                    viewCount : fileinfo.view_count,
                    id : fileinfo.id,
                    description : fileinfo.description,
                    uploaderUrl : fileinfo.channel_url,
                    extention : fileinfo.ext,
                    format : fileinfo.format_note,
                    videoUrl : fileinfo.webpage_url
                }

                resolve({
                    success: true,
                    messages: "Download complete",
                    info: info
                });
              })


        }
        catch(error){
            reject({success: false, messages: error});
        }
    });
}
const getInfo = (url) => {
    return new Promise((resolve, reject) => {
        youtubedl.getInfo(url, (error, info) => {
            if(error)
                reject(error);

            resolve(info);
          })
    });
}

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

app.get('/info/:type/:url', async (req,res) => {
    try{
        if(req.params.type === 'video'){
            const info = await getInfo(req.params.url);

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

        if(db != null){
            db.videos.forEach(el => {
                if(el.id === req.params.id){
                    const file = `./videos/${el.id}.${el.extention}`;
                    res.download(file);
                }
            });
        }


    }
    catch(error){

    }
});

app.post('/download', async (req,res) => {
    console.log(`Download started for url: ${req.body.url}`);

    try{
        const downloadResult = await ytdownload(req.body.url);

        if(downloadResult.success){
            const database = await readDatabase();

            if(database != null){

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