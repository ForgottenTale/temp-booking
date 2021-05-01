const csv = require('csv-parse');
const fs = require('fs');
const path = require('path');


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
        return (process.env.DOMAIN_NAME || ("http://localhost:" + process.env.PORT) + "/create-account/" + code);
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
    }

};