let {executeQuery} = require('./index.js');

module.exports = {
    UserWithHash: function(hash){
        return new Promise(async(resolve, reject)=>{
            try{
                await executeQuery("DELETE FROM hash WHERE hash='" + hash + "';");
                resolve(hash);
            }catch(err){
                reject(err);
            }
        })
    }
}