const sqlite3 = require('sqlite3').verbose();

class Database {
	static async connect(){
		return new Promise((resolve, reject) => {
			const database = new sqlite3.Database('./database.db', async (err) => {
				if (err) {
				  console.error(err.message);
				  reject(err);
				  return;
				}
			
				// console.log('Connected to the database.');
				
				resolve(database);
			});
		});
	}

	static close(db){
		db.close((err) => {
			if (err) {
			  return console.error(err.message);
			}
			// console.log('Closed the database connection.');
		});
	}

	static async checkFirstUse(){
		return new Promise(async (resolve, reject) => {
			let db = null;

			try{
				db  = await Database.connect();

				const isFirstUse = await Database.isFirstUse(db);

				if(isFirstUse)
					await Database.createTables(db);
				
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
		return new Promise(async (resolve, reject) => {
			console.log("Creating tables...");

			const createSettingsTable = `
				CREATE TABLE settings (
				id INTEGER NOT NULL,
				port INTEGER NOT NULL,
				default_quality TEXT NOT NULL,
				output_location TEXT NOT NULL,
				authentication_username TEXT,
				authentication_password TEXT,
				authentication_2fa INTEGER
			)`;

			const createSettingsValues = `
				INSERT INTO settings (id, port, default_quality, output_location)
				VALUES(1, 3000, '720p', './videos')
			`;

			const createDownloadTable = `
				CREATE TABLE "downloads" (
					"id"	INTEGER,
					"video_id"	TEXT NOT NULL,
					"title"	TEXT NOT NULL,
					"status"	TEXT NOT NULL,
					"process_id"	INTEGER,
					"url"	TEXT NOT NULL,
					"format"	TEXT,
					"audio_format"	TEXT,
					"audio_only"	NUMERIC DEFAULT 0,
					"playlist"	NUMERIC DEFAULT 0,
					"download_status" INTEGER DEFAULT 0,
					PRIMARY KEY("id" AUTOINCREMENT)
				);
			`;

			const createChannelsTable = `
					CREATE TABLE yt_channels (
						id INTEGER,
						url TEXT NOT NULL,
						name TEXT NOT NULL,
						last_scan TEXT,
						PRIMARY KEY("id" AUTOINCREMENT)
					);
			`;

			const createChannelVideosTable = `
					CREATE TABLE yt_channel_videos (
						id INTEGER,
						video_provider_id TEXT NOT NULL,
						download_time TEXT,
						PRIMARY KEY("id" AUTOINCREMENT)
					); 
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

			try{
				await Database.run(createSettingsTable);
				await Database.run(createSettingsValues);
				await Database.run(createDownloadTable);
				await Database.run(createVideosTable);
				await Database.run(createTagTable);
				await Database.run(createTagLinksTable);
				await Database.run(createThumbnailTable);
				await Database.run(alterTables);

				console.log("Tables created");
				resolve();
			}
			catch(error){
				console.error(error);
				reject(error);
			}
		});
	}

	static purge(){
		return new Promise(async (resolve, reject) => {
			const videosTable = "DELETE FROM videos";
			const tagsTable = "DELETE FROM tags";
			const tagLinksTable = "DELETE FROM tag_links";
			const thumbnailsTable = "DELETE FROM thumbnails";
			const downloadsTable = "DELETE FROM downloads";

			try{
				await Database.run(videosTable);
				await Database.run(tagsTable);
				await Database.run(tagLinksTable);
				await Database.run(thumbnailsTable);
				await Database.run(downloadsTable);

				console.log("Tables have been cleared.");
				resolve();
			}
			catch(error){
				console.error(error);
				reject(error);
			}
		});
	}

	static run(query, values){
		return new Promise(async (resolve,reject) => {
			let db;

			try{
				db = await Database.connect();

				db.run(query, values, function(error) {
					if(error) reject(error);
					else resolve({status: "success", data: this});
				});
			}
			catch(error){
				console.err(error);
			}
			finally{
				Database.close(db);
			}
		});
	}

	static get(query, values){
		return new Promise(async (resolve,reject) => {
			let db;

			try{
				db = await Database.connect();

				db.get(query, values, function(error,row) {
					if(error) {reject(error);}
					resolve({status: "success", data: row});
				});
			}
			catch(error){
				console.err(error);
			}
			finally{
				Database.close(db);
			}
		});
	}

	static all(query, values){
		return new Promise(async (resolve,reject) => {
			let db;

			try{
				db = await Database.connect();

				if(values)
					db.all(query, values, function(error,rows) {
						if(error) reject(error);
						else resolve({status: "success", data: rows});
					});
				else
					db.all(query, function(error,rows) {
						if(error) reject(error);
						else resolve({status: "success", data: rows});
					});
			}
			catch(error){
				console.err(error);
			}
			finally{
				Database.close(db);
			}
		});
	}
}

module.exports = Database;