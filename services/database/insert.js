let {executeQuery} = require('./index.js');

module.exports = {
    person: async function (person, done) {
        try{
            let {names, values} = person.getAllNamesAndValues();
            let query = "INSERT INTO person(" + names.join(',') +") VALUES(" + values.join(',') + ");";
            let result = await executeQuery(query);
            person._id = result.insertId;
            if(person.ouIds)
                await executeQuery(person.ouIds.reduce((query, ouId)=>{
                    return query+"INSERT INTO ou_map (person_id, ou_id) VALUES(" + result.insertId + ", " + ouId + ");"
                }, ""));
            return done(null, person);
        }catch(err){
            return done(err);
        }
	},

    uniqueCode: function(personId){
        return new Promise(async (resolve, reject)=>{
            try{
                let result = await executeQuery("INSERT INTO unique_code (person_id) VALUES(" + personId + ");");
                resolve(result.insertId);
            }catch(err){
                reject(err);
            }
        })
    }
};