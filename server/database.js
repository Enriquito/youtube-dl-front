const sqlite3 = require('sqlite3').verbose();

class Database {
	static async connect(){
		const db = new Promise((resolve, reject) => {
			const database = new sqlite3.Database('./database.db', async (err) => {
				if (err) {
				  console.error(err.message);
				  reject(err);
				  return;
				}
			
				console.log('Connected to the database.');
				
				resolve(database);
			});
		});
		
		return db;
	}

	static async checkFirstUse(){
		return new Promise(async (resolve, reject) => {
			let db = null;

			try{
				db  = await Database.connect();

				const isFirstUse = await Database.isFirstUse(db);

				if(isFirstUse){
					await Database.createTables(db);
				}

				resolve();
			}
			catch(error){
				console.error(error);
				reject();
			}
			finally{
				Database.close(db);
			}
		})
	}

	static async isFirstUse(db){
		return new Promise((resolve, reject) => {
			db.run(`SELECT id FROM videos`, async (err) => {
				if (err) {
					const noTableResult = err.message.match(/(no such table)/g);
	
					if(noTableResult.length == 1){
						resolve(true);
						return;
					}
				}
				else
				{
					resolve(false);
				}
			});
		});
	}

	static async createTables(db){
		console.log("Creating tables...");

		const createSettingsTable = `
			CREATE TABLE settings (
			port INTEGER NOT NULL,
			default_quality TEXT NOT NULL,
			output_location TEXT NOT NULL,
			authentication_username TEXT,
			authentication_password TEXT,
			authentication_2fa INTEGER
		)`;

		const createSettingsValues = `
			INSERT INTO settings (port, default_quality, output_location)
			VALUES(3000, '720p', './videos')
		`;

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
			file_extention TEXT NOT NULL,
			file_location TEXT NOT NULL,
			file_name TEXT NOT NULL,
			video_url TEXT NOT NULL,
			video_provider_id TEXT NOT NULL,
			uploader_name TEXT NOT NULL,
			description TEXT NOT NULL
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
		
		db.serialize(() => {
			db
			.run(createSettingsTable)
			.run(createSettingsValues)
			.run(createVideosTable)
			.run(createTagTable)
			.run(createTagLinksTable)
			.run(createThumbnailTable)
			.run(alterTables)
		})

		console.log("Tables created");
	}

	static close(db){
		db.close((err) => {
			if (err) {
			  return console.error(err.message);
			}
			console.log('Closed the database connection.');
		});
	}

	static purge(){
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