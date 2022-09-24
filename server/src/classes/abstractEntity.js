const Database = require("./database");
const {snakeToCamel, getObjectLength, camelToSnake} = require('../helpers')

class AbstractEntity {
    id;
    static table;
    static ignoredProperties = [];

    static async find(id) {
        return new Promise(async (resolve, reject) => {
            try{
                const result = await Database.get(`SELECT * FROM ${this.table} WHERE id = ?`, id);

                if(result === null || result === undefined){
                    resolve(null);
                    return;
                }

                const object = new this;

                for (let key in object) {
                    for (let resultKey in result.data) {
                        const resultName = snakeToCamel(resultKey);

                        if (key === resultName) {
                            object[key] = result.data[resultKey];
                        }
                    }
                }

                resolve(object);
            }
            catch(error){
                console.log(error);
                reject(error);
            }
        });
    }

    static async findBy(criteria = {}) {
        return new Promise(async (resolve, reject) => {
            try{
                if (getObjectLength(criteria).length === 0) {
                    throw 'No criteria given';
                }

                let where = "";
                let values = [];
                let count = 1;

                for (const key in criteria) {
                    if (criteria.length > 1 && count !== criteria.length) {
                        where = where + ` ${key} = ? AND`
                    } else {
                        where = where + ` ${key} = ?`
                    }

                    values.push(criteria[key]);
                    count++;
                }

                const result = await Database.get(`SELECT * FROM ${this.table} WHERE ${where} `, values);

                if(result === null || result === undefined){
                    resolve(null);
                    return;
                }

                const object = new this;

                for (let key in object) {
                    for (let resultKey in result.data) {
                        const resultName = snakeToCamel(resultKey);

                        if (key === resultName) {
                            object[key] = result.data[resultKey];
                        }
                    }
                }

                resolve(object.id === null || object.id === undefined ? null : object );
            }
            catch(error){
                console.log(error);
                reject(error);
            }

        });
    }

    static all(limitStart = 0, limitEnd = 30){
        return new Promise(async (resolve, reject) => {
            try{
                const result = await Database.all(`SELECT * FROM ${this.table} LIMIT ?,?`, [limitStart,limitEnd]);

                const items = [];

                for(let i = 0; i < result.data.length; i++){
                    const row = result.data[i];

                    const object = new this;

                    for (let key in object) {
                        for (let resultKey in row) {
                            const resultName = snakeToCamel(resultKey);

                            if (key === resultName) {
                                object[key] = row[resultKey];
                            }
                        }
                    }

                    items.push(object);
                }

                resolve(items)
            }
            catch(error){
                console.error(error);
                reject(error);
            }
        });
    }

    static async doesExist(findBy = {}){
        return new Promise(async (resolve, reject) => {
            try{
                if (getObjectLength(findBy) > 1) {
                    throw new Error('Only one criteria is allowed');
                }
                else if (getObjectLength(findBy) === 0) {
                    throw new Error('One criteria is required');
                }

                let findByKey = null;
                let findByValue = null;

                for (let key in findBy) {
                    findByKey = key;
                    findByValue = findBy[key];
                }

                const result = await Database.get(`SELECT * FROM ${this.table} WHERE ${findByKey} = ?`, findByValue);

                if(result.data !== null){
                    resolve(true);
                } else {
                    resolve(false);
                }
            }
            catch(error){
                console.error(error);
                reject(error);
            }
        });
    }

    remove(){
        return new Promise(async (resolve, reject) => {
            try{
                await Database.run(`DELETE FROM ${this.constructor.table} WHERE id = ?`, [this.id]);

                resolve(true);
            }
            catch(error){
                console.log(error);
                reject(error);
            }
        });
    }

    async update() {
        return new Promise(async (resolve, reject) => {
            try{
                const object = this;
                const values = [];
                let setString = "";
                let count = 1;

                for (let key in object) {
                    if (this.constructor.ignoredProperties.find(property => property === key)) {
                        count++;
                        continue;
                    }

                    if (count !== getObjectLength(object)) {
                        setString = setString + ` ${camelToSnake(key)} = ?,`
                    } else {
                        setString = setString + ` ${camelToSnake(key)} = ?`
                    }

                    values.push(object[key]);
                    count++;
                }

                // const values = [this.url, this.name, this.followerCount , this.avatar, this.lastScan, this.id];

                values.push(this.id);

                await Database.run(`UPDATE channels SET ${setString} WHERE id = ?`,  values);

                resolve();
            }
            catch(error){
                console.error(error);
                reject(error);
            }
        });
    }

    async save(){
        return new Promise(async (resolve, reject) => {
            try{
                const object = this;
                const values = [];
                let bindParams = "";
                let intoString = "";
                let count = 1;

                for (let key in object) {
                    if (this.constructor.ignoredProperties.find(property => property === key)) {
                        count++;
                        continue;
                    }

                    if (count !== getObjectLength(object)) {
                        intoString = intoString + ` ${camelToSnake(key)},`
                        bindParams += "?,"
                    } else {
                        intoString = intoString + ` ${camelToSnake(key)}`
                        bindParams += "?"
                    }

                    values.push(object[key]);

                    count++;
                }

                const result = await Database.run(`INSERT INTO ${this.constructor.table} (${intoString}) VALUES(${bindParams})`,  values);

                if (result.data !== null) {
                    this.id = result.data.lastID;
                }

                resolve();
            }
            catch(error){
                console.error(error);
                reject(error);
            }
        });
    }
}

module.exports = AbstractEntity;