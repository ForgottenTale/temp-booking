let {executeQuery} = require('./index.js');
let {Person} = require('../controller.js');

module.exports = {
    UserWithHash: function(hash){
        return new Promise(async(resolve, reject)=>{
            try{
                let result = await executeQuery("SELECT * FROM hash INNER JOIN person ON person_id=person._id WHERE hash='" + hash + "';");
                if(result.length==1){
                    return resolve(new Person(result[0]));
                }else if(result.length<1){
                    throw new Error("Unable to find user");
                }else{
                    throw new Error("Too many users");
                }
            }catch(err){
                reject(err);
            }
        })
    }
}