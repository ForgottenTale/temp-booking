const csv = require('csv-parse');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const axios = require('axios');
const mail = require('./mail');
const jwt = require('jsonwebtoken');

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
                password = password;
                return resolve(password);
            })
        })
    },

    generateUniqueString: function(key){
        let hash = new Buffer.from(key+"something");
        hash.toString('base64');   
        return Date.now()+ "" + hash;
    },
    
    generateHash: function(key){
        return new Promise((resolve, reject)=>{
            try{
                let hash = new Buffer.from(key+"newemail");
                resolve(hash.toString('base64').replace('/', 's'));   
            }catch(err){
                console.error(err);
                throw new Error("Error generating hash");
            }
        })
    },
    
    removeImg: function (imgName){
        fs.unlink((process.cwd()+"/uploads/" + imgName), err=>{
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
        let payload, config, duration;

        

        if(serviceName=="zoom"){
            let token = jwt.sign({
                "iss": process.env.ZOOM_API_KEY,
                "exp": 1496091964000
            }, process.env.ZOOM_API_SECRET);
            config = {
                Authorization: `Bearer ${token}`
            };
            duration =(input.endTime.getTime() - input.startTime.getTime()) / 1000;
            duration /= 60;
            duration = Math.abs(Math.round(duration));
            payload = {
                "topic": input.title,
                "start_time": input.startTime.toISOString(),
                "duration": duration,
                "timezone": "UTC",
                "agenda": input.description,
                "settings": {
                    "in_meeting": "true",
                    "mute_upon_entry": "true"
                }
            }
            axios
            .post(`https://api.zoom.us/v2/users/${process.env.ZOOM_USER_ID}/meetings`,
                payload,
                config
            )
            .then(data=>{
                database.executeQuery(`UPDATE online_meeting SET url='${data.start_url}', meeting_password = '${data.password}'
                    WHERE _id=${booking._id}`);
            })
            .catch(err=>{
                err.info=`MEETING CREATION FAULT: ${booking._id}`;
                console.error(err);
                mail.sendSuperMail(err);
            })
        }
    }

};