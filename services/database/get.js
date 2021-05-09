const {executeQuery, getAppointmentTypes} = require('./index.js');
const {Person, User, getClass} = require('../controller.js');
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
            let results = await executeQuery("SELECT user._id, person_id, password, super_admin, super_creator, role, name, email, phone FROM user INNER JOIN person ON person_id = person._id WHERE " + values + ";")
            let user = new User(transmuteSnakeToCamel(results[0]));
            let ouIds = await executeQuery("SELECT ou_id, name, role, admin FROM ou_map INNER JOIN ou ON ou_map.ou_id = ou._id WHERE person_id=" + user.personId);
            user.ous = ouIds.map(e=>{
                return {
                    ouId: e.ou_id,
                    ouName: e.name,
                    ouRole: e.role,
                    ouAdmin: e.admin?true:false
                }
            });
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
	},

    ou: function(personId, done){
        executeQuery("SELECT ou._id, ou.name FROM ou_map INNER JOIN ou ON ou._id=ou_id WHERE person_id=" + personId)
        .then(results=>{
            results = results.map(result=>transmuteSnakeToCamel(result))
            return done(null, results);
        })
        .catch(err=>done(err));
    },
    userAppointments: async function(constraint, done){
		try{
			let types = await getAppointmentTypes();
			let query = "";
			types.forEach(appointmentType=>{
				query+="SELECT *, alt._id as _id FROM alt INNER JOIN " + appointmentType.type + " ON alt." + appointmentType.type + "_id=" + appointmentType.type +"._id"  
					+ " INNER JOIN user ON user._id=creator_id"
                    + " INNER JOIN person on person._id=user.person_id"
					+ " WHERE " + appointmentType.type + "_id IS NOT NULL AND creator_id=" + constraint.userId + ";";
			})
			let appointmentsOfAllTypes = await executeQuery(query);
			query = "";
			let dataArray = [];
			for (let mainIdx in appointmentsOfAllTypes){
				for (let idx in appointmentsOfAllTypes[mainIdx]){
					AppointmentClass = getClass(types[mainIdx].type);
					appointmentsOfAllTypes[mainIdx][idx] = AppointmentClass.convertSqlTimesToDate(appointmentsOfAllTypes[mainIdx][idx]);
					appointmentsOfAllTypes[mainIdx][idx] = transmuteSnakeToCamel(appointmentsOfAllTypes[mainIdx][idx]);
					appointmentsOfAllTypes[mainIdx][idx].otherResponses = await executeQuery("SELECT name, email, encourages, response FROM response INNER JOIN person on person._id=response.person_id WHERE final=1 AND alt_id=" + appointmentsOfAllTypes[mainIdx][idx].id + ";");
					appointmentsOfAllTypes[mainIdx][idx].type = types[mainIdx].type;
					dataArray.push(appointmentsOfAllTypes[mainIdx][idx])
				}
			}
			return done(null, dataArray);
		}catch(err){
			return done(err);
		}
	}
}