const csv = require('csv-parser');
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
        fs.createReadStream('data.csv')
        .pipe(csv())
        .on('data', data => results.push(data))
        .on('end', () => {
            console.log(results);
        });
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