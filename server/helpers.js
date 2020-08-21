const fs = require('fs')

module.exports.writeDatabase = (data) => {
    return new Promise((resolve,reject) => {

        fs.writeFile(`./database.json`, JSON.stringify(data), (error) => {
            if(error){
                  reject(error);
            }

            resolve(true);

            return;
      });
    });
}
module.exports.readDatabase = () => {
    return new Promise((resolve,reject) => {
        fs.readFile('./database.json', "utf8", function (error,data) {
            if (error)
                  reject(error);

            resolve(JSON.parse(data));
      });
    });
}