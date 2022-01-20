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