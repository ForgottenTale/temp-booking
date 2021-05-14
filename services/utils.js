const csv = require('csv-parse');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

module.exports = {
    convertSqlDateTimeToDate: function (mysqlTime){
        return new Date(mysqlTime.replace(" ", "T") + "Z");
    },

    convertDateToSqlDateTime: function (dateTime){
        return dateTime.toISOString().replace("T", " ").replace("Z", "");
    },

    parseCsv: function(filepath){
        return new Promise((resolve, reject)=>{
            try{
                let results = [];
                fs.createReadStream(path.join(filepath))
                .pipe(csv({columns: true}))
                .on('data', data =>{
                    results.push(data);
                })
                .on('end', () => {
                    resolve(results);
                });      
            }catch(err){
                reject(err);
            }
        })
    },

    generateAccRegLink: function(code){
        return (process.env.DOMAIN_NAME || "http://localhost:"+ process.env.PORT) + "/create-account/" + code;        
    },

    generatePasswordHash: function(password){
        return new Promise((resolve, reject)=>{
            bcrypt.hash(password, 12, (err, hash)=>{
                if(err) return reject(err);
                password = process.env.NODE_ENV=="development"?password:hash;
                return resolve(password);
            })
        })
    },
    
    generateHash: function(key){
        return new Promise((resolve, reject)=>{
            try{
                let hash = new Buffer.from(key+"newemail");
                resolve(hash.toString('base64'));   
            }catch(err){
                console.error(err);
                throw new Error("Error generating hash");
            }
        })
    },
    
    removeImg: function (imgName){
        fs.unlink(("/uploads/" + imgName), err=>{
            if(err)
                console.error(err);
            else
                console.log()
        })
    },

    respondError: function(err, res){
        console.error(err);
        let message;
        if(err.code == 'ER_BAD_NULL_ERROR')
            message = err.sqlMessage;
        else if(err.code=='ER_DUP_ENTRY' && (/for key 'user.email'/).test(err.message))
            message = "User already exists";
        else
            message = err.message || err;
        res.status(400).json({error: message});
    },

    transmuteSnakeToCamel: function(input){
        let output = {};
        for(let param in input){
            let temp = param;
            output[param.replace(
                /((?<=[a-z])_[a-z])|(_)/g,
                (group) => group.toUpperCase()
                                .replace('-', '')
                                .replace('_', '')
            )] = input[temp];
        }
        return output;
    },

    createMeeting: function(input, serviceName){
        return new Promise((resolve, reject)=>{
            return resolve("link");
        })
    }

};