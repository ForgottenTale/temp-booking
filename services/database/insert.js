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

    hash: function(personId, hash){
        return new Promise(async (resolve, reject)=>{
            try{
                let result = await executeQuery("INSERT INTO hash (person_id, hash) VALUES(" + personId + ", '"+ hash +"');");
                resolve(result.insertId);
            }catch(err){
                reject(err);
            }
        })
    },

    userAccount: function(person){
        return new Promise(async (resolve, reject)=>{
            try{
                await executeQuery("INSERT INTO user (person_id, password) VALUES(" + person._id + ",'" + person.password +"');");
                resolve(person);
            }catch(err){
                reject(err);
            }
        })
    }
};