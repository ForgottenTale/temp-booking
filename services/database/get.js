const {executeQuery} = require('./index.js');
const {Person, User} = require('../controller.js');
const {transmuteSnakeToCamel} = require('../utils.js');

module.exports = {
    userWithHash: function(hash){
        return new Promise(async(resolve, reject)=>{
            try{
                let result = await executeQuery("SELECT * FROM hash INNER JOIN person ON person_id=person._id WHERE hash='" + hash + "';");
                if(result.length==1){
                    return resolve(new Person(transmuteSnakeToCamel(result[0])));
                }else if(result.length<1){
                    throw new Error("Unable to find user");
                }else{
                    throw new Error("Too many users");
                }
            }catch(err){
                reject(err);
            }
        })
    },

    user: async function (params, done) {
        try{
            let values = User.getValues(params).join(' AND ');
            let results = await executeQuery("SELECT * FROM user INNER JOIN person ON person_id=person._id WHERE " + values + ";")
            let user = new User(transmuteSnakeToCamel(results[0]));
            done(null, user);
        }catch(err){
            done(err);
        }
	},

    allUsers: function(constraint, done){
		let query = "SELECT user._id, name, email, phone, role FROM user INNER JOIN person ON person_id=person._id ";
		if(constraint.role == "admin")
			query+="WHERE role='GLOBAL_ADMIN' OR role='GROUP_ADMIN'";
		else if(constraint.role == "user")
			query+="WHERE role='USER'";
		else if(!constraint.role)
			query+=";";
		else
			query+="WHERE role is null;";
		executeQuery(query)
		.then(results=>{
			results = results.map(result=>transmuteSnakeToCamel(result))
			return done(null, results);
		})
		.catch(err=>done(err));
	}
}