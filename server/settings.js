const Database = require("./database");

class Settings{
    constructor(){
        this.port;
        this.outputLocation;
        this.defaultQuality;
        this.authentication = {
            username: "",
            password: "",
            twofa: ""
        }
    }

    async update(){
        return new Promise(async (resolve, reject) => {
            let db = null;

            try{
                db  = await Database.connect();

                const updateData = [
                    this.port,
                    this.outputLocation,
                    this.defaultQuality,
                    this.authentication.username,
                    this.authentication.password,
                    this.authentication.twofa,
                    1
                ];

                db.run(`UPDATE settings SET port = ?, output_location = ?, default_quality = ?, authentication_username = ?, authentication_password = ?, authentication_2fa = ? WHERE id = ?`, updateData, async (error) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    
                    resolve();
                });
            }
            catch(error){
                reject(error);
            }
		});
    }

    async load(){
        return new Promise(async (resolve, reject) => {
            let db = null;

            try{
                db  = await Database.connect();

                db.get(`SELECT * FROM settings`, async (error, row) => {
                    if (error) {
                        reject(error);
                        return;
                    }
    
                    this.port = row.port;
                    this.outputLocation = row.output_location;
                    this.defaultQuality = row.default_quality;
                    this.authentication.username = row.authentication_username;
                    this.authentication.password = row.authentication_password;
                    this.authentication.twofa = row.authentication_2fa;
                    
                    resolve();
                });
            }
            catch(error){
                reject(error);
            }
		});
    }
}

module.exports = Settings;