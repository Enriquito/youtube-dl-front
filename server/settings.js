const Database = require("./database");

class Settings{
    port;
    outputLocation;
    defaultQuality;
    authentication = {
        username: "",
        password: "",
        twoFA: ""
    };

    async update(){
        return new Promise(async (resolve, reject) => {
            try{
                const updateData = [
                    this.port,
                    this.outputLocation,
                    this.defaultQuality,
                    this.authentication.username,
                    this.authentication.password,
                    this.authentication.twofa,
                    1
                ];

                await Database.run("UPDATE settings SET port = ?, output_location = ?, default_quality = ?, authentication_username = ?, authentication_password = ?, authentication_2fa = ? WHERE id = ?", updateData)

                resolve();
            }
            catch(error){
                console.error(error);
                reject(error);
            }
		});
    }

    async load(){
        return new Promise(async (resolve, reject) => {
            try{
                const result = await Database.get("SELECT * FROM settings");

                this.port = result.data.port;
                this.outputLocation = result.data.output_location;
                this.defaultQuality = result.data.default_quality;
                this.authentication.username = result.data.authentication_username;
                this.authentication.password = result.data.authentication_password;
                this.authentication.twofa = result.data.authentication_2fa;

                resolve();
            }
            catch(error){
                console.error(error);
                reject(error);
            }
		});
    }
}

module.exports = Settings;