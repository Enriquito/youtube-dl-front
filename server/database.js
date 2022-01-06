const sqlite3 = require('sqlite3').verbose();

class Database {
	constructor(){
		this.database;
	}

	async connect(){
		const db = new Promise((resolve, reject) => {
			this.database = new sqlite3.Database('./database.db', async (err) => {
				if (err) {
				  console.error(err.message);
				  reject(err);
				  return;
				}
			
				console.log('Connected to the database.');
				
				resolve(this.database);
			});
		});

		const isFirstUse = await this.isFirstUse();
	
		if(isFirstUse){
			await this.createTables();
		}

		return db;
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

	purge(){
		return new Promise((resolve, reject) => {
			const videosTable = "DELETE FROM videos";
			const tagsTable = "DELETE FROM tags";
			const tagLinksTable = "DELETE FROM tag_links";
			const thumbnailsTable = "DELETE FROM thumbnails";

			this.database.serialize((error) => {
				if(error)
					reject();

				this.database
				.run(videosTable)
				.run(tagsTable)
				.run(tagLinksTable)
				.run(thumbnailsTable)
			});

			console.log("Tables have been cleared.");

			this.close();

			resolve();
		});
	}
}

const db = new Database();

module.exports = Database;