const sqlite3 = require('sqlite3').verbose();

class Database {
	constructor(){
		this.database;
	}

	async connect(){
		return new Promise((resolve, reject) => {
			this.database = new sqlite3.Database('./database.db', async (err) => {
	
				if (err) {
				  console.error(err.message);
				  reject(err);
				  return;
				}
			
				console.log('Connected to the database.');

				const isFirstUse = await db.isFirstUse();
	
				if(isFirstUse){
					await db.createTables();
				}
				else{
					console.log("tables")
				}
			});

			resolve(this.database);
		});
	}

	async isFirstUse(){
		return new Promise((resolve, reject) => {
			this.database.run(`SELECT id FROM videos`, async (err) => {
				if (err) {
					const noTableResult = err.message.match(/(no such table)/g);
	
					if(noTableResult.length == 1){
						resolve(true);
						return;
					}
						
				}
				else
					resolve(false);
			});
		});
		
	}

	createTables(){
		console.log("Creating tables...");

		const createTagTable = `
			CREATE TABLE tags (
			id INTEGER PRIMARY KEY AUTOINCREMENT, 
			tag TEXT NOT NULL
			);`;

		const createVideosTable = `
			CREATE TABLE videos (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			title TEXT NOT NULL,
			uploader_url TEXT NOT NULL,
			view_count bigINTEGER  NOT NULL,
			duration mediumINTEGER NOT NULL,
			video_url TEXT NOT NULL,
			video_provider_id TEXT NOT NULL,
			uploader_name TEXT NOT NULL,
			description text NOT NULL
			);`;
		
		const createTagLinksTable = `
			CREATE TABLE tag_links (
			video INTEGER  NOT NULL,
			tag INTEGER  NOT NULL
			);`;

		const createThumbnailTable = `
			CREATE TABLE thumbnails (
			id INTEGER PRIMARY KEY AUTOINCREMENT, 
			video INTEGER NOT NULL,
			height INTEGER NOT NULL,
			width INTEGER NOT NULL,
			resolution TEXT NOT NULL,
			url TEXT NOT NULL
			);`;

		const alterTables = `
			BEGIN TRANSACTION;

			ALTER TABLE tags
			ADD PRIMARY KEY (id);

			ALTER TABLE tag_links
			ADD KEY video (video),
			ADD KEY tag (tag);

			ALTER TABLE videos
			ADD PRIMARY KEY (id);

			ALTER TABLE thumbnails;
			ADD KEY video (video);

			ALTER TABLE tag_links
			ADD CONSTRAINT tag_links_ibfk_1 FOREIGN KEY (video) REFERENCES videos (id),
			ADD CONSTRAINT tag_links_ibfk_2 FOREIGN KEY (tag) REFERENCES tags (id);

			COMMIT;
			`;

		
		this.database.serialize(() => {
			this.database
			.run(createVideosTable)
			.run(createTagTable)
			.run(createTagLinksTable)
			.run(createThumbnailTable)
			.run(alterTables)
		})

		console.log("Tables created");
		this.close();
	}

	close(){
		this.database.close((err) => {
			if (err) {
			  return console.error(err.message);
			}
			console.log('Closed the database connection.');
		});
	}


}

const db = new Database();

// db.connect().then(async () => {
// 	db.database.serialize(() => {
// 		db.database.each("SELECT * FROM tags", (err,  row) => {
// 			console.log(row);
// 		});

// 		db.close()
// 	})
// })

module.exports = Database;