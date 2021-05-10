const {executeQuery, getServiceTypes, getConfig} = require('./index.js');
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
            let results = await executeQuery("SELECT user._id, person_id, password, super_admin, super_creator, name, email, phone FROM user INNER JOIN person ON person_id = person._id WHERE " + values + ";")
			if(results.length<1)
				return done(null, null);
            let user = new User(transmuteSnakeToCamel(results[0]));
			let ouIds = await executeQuery("SELECT ou_id, name, admin FROM ou_map INNER JOIN ou ON ou_map.ou_id = ou._id WHERE person_id=" + user.personId);
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
		let query = "SELECT user._id, name, email, phone FROM user INNER JOIN person ON person_id=person._id ";
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
    bookings: async function(constraint, done){
		try{
			let types = await getServiceTypes();
			let query = "";
			types.forEach(serviceType=>{
				query+="SELECT *, slt._id as _id FROM slt INNER JOIN " + serviceType.type + " ON slt." + serviceType.type + "_id=" + serviceType.type +"._id"  
					+ " INNER JOIN user ON user._id=creator_id"
                    + " INNER JOIN person on person._id=user.person_id"
					+ " WHERE " + serviceType.type + "_id IS NOT NULL AND creator_id=" + constraint.userId ;
                if(constraint.ouId)
                    query += " AND slt.ou_id="+constraint.ouId;
                query += ";";
			})
			let bookingsOfAllTypes = await executeQuery(query);
			query = "";
			let dataArray = [];
			for (let mainIdx in bookingsOfAllTypes){
				for (let idx in bookingsOfAllTypes[mainIdx]){
					ServiceClass = getClass(types[mainIdx].type);
					bookingsOfAllTypes[mainIdx][idx] = ServiceClass.convertSqlTimesToDate(bookingsOfAllTypes[mainIdx][idx]);
					bookingsOfAllTypes[mainIdx][idx] = transmuteSnakeToCamel(bookingsOfAllTypes[mainIdx][idx]);
					bookingsOfAllTypes[mainIdx][idx].otherResponses = await executeQuery("SELECT name, email, encourages, response FROM response INNER JOIN person on person._id=response.person_id WHERE final=1 AND slt_id=" + bookingsOfAllTypes[mainIdx][idx].id + ";");
					bookingsOfAllTypes[mainIdx][idx].type = types[mainIdx].type;
					dataArray.push(bookingsOfAllTypes[mainIdx][idx])
				}
			}
			return done(null, dataArray);
		}catch(err){
			return done(err);
		}
	},

    activity: async function(ouId, done){
		let returnData = {};
		try{
			let query = "SELECT status, count(*) FROM slt";
            if(ouId)
                query += " WHERE ou_id=" + ouId ;
            query+= " GROUP BY status;";
            let data = await executeQuery(query);
			data.forEach(statusType=>{
				returnData[statusType.status.toLowerCase()] = statusType["count(*)"];
			})
			return done(null, returnData);
		}catch(err){
			return done(err);
		}
	},

	userApprovals: async function(constraint, done){
		try{
			let types = await getServiceTypes();
			let query = "";
			types.forEach(type=>{
				query += "SELECT *, slt._id as _id FROM slt"
					+ " INNER JOIN " + type.type + " ON " + type.type + "_id=" + type.type + "._id"
					+ " INNER JOIN next_to_approve as n ON n.slt_id=slt._id"
					+ " INNER JOIN user ON creator_id=user._id"
					+ " INNER JOIN person ON user.person_id=person._id"
					+ " WHERE n.person_id=" + constraint.user.personId;
				if(constraint.id)
					query += " AND slt._id=" + constraint.id + ";"
				else
					query += ";";
			})
			let bookingsOfAllTypes = await executeQuery(query);
			let dataArray = [];
			for (let mainIdx in bookingsOfAllTypes){
				for (let idx in bookingsOfAllTypes[mainIdx]){
					ServiceClass = getClass(types[mainIdx].type);
					let config = await getConfig(types[mainIdx].type, bookingsOfAllTypes[mainIdx][idx].service_name);
					bookingsOfAllTypes[mainIdx][idx].encourageMode = !config.follow_hierarchy;
					bookingsOfAllTypes[mainIdx][idx] = ServiceClass.convertSqlTimesToDate(bookingsOfAllTypes[mainIdx][idx]);
					bookingsOfAllTypes[mainIdx][idx] = transmuteSnakeToCamel(bookingsOfAllTypes[mainIdx][idx]);
					bookingsOfAllTypes[mainIdx][idx].otherResponses = await executeQuery("SELECT name, email, encourages, response FROM response INNER JOIN person on person._id=response.person_id WHERE slt_id=" + bookingsOfAllTypes[mainIdx][idx].id + ";");
					bookingsOfAllTypes[mainIdx][idx].type = types[mainIdx].type;
					delete(bookingsOfAllTypes[mainIdx][idx].password);
					dataArray.push(bookingsOfAllTypes[mainIdx][idx])
				}
			}
			return done(null, dataArray);
		}catch(err){
			return done(err);
		}
	},

	historyOfApprovals: async function(constraint, done){
		try{
			let types = await getServiceTypes();
			let query = "";
			types.forEach(type=>{
				query += "SELECT *, slt._id as _id FROM slt"
					+ " INNER JOIN " + type.type + " ON " + type.type + "_id=" + type.type + "._id"
					+ " INNER JOIN response as r ON r.slt_id=slt._id"
					+ " INNER JOIN user ON creator_id=user._id"
					+ " INNER JOIN person ON user.person_id=person._id"
					+ " WHERE r.person_id=" + constraint.user.personId;
					if(constraint.id)
						query += " AND slt._id=" + constraint.id + ";"
					else
						query += ";";
			})
			let bookingsOfAllTypes = await executeQuery(query);
			let dataArray = [];
			for (let mainIdx in bookingsOfAllTypes){
				for (let idx in bookingsOfAllTypes[mainIdx]){
					ServiceClass = getClass(types[mainIdx].type);
					bookingsOfAllTypes[mainIdx][idx] = ServiceClass.convertSqlTimesToDate(bookingsOfAllTypes[mainIdx][idx]);
					bookingsOfAllTypes[mainIdx][idx] = transmuteSnakeToCamel(bookingsOfAllTypes[mainIdx][idx]);
					bookingsOfAllTypes[mainIdx][idx].otherResponses = await executeQuery("SELECT name, email, encourages, response FROM response INNER JOIN person on person._id=response.person_id WHERE slt_id=" + bookingsOfAllTypes[mainIdx][idx].id + " AND user_id!=" + constraint.user_id + ";");
					bookingsOfAllTypes[mainIdx][idx].type = types[mainIdx].type;
					dataArray.push(bookingsOfAllTypes[mainIdx][idx]);
				}
			}		
			return done(null, dataArray);	
		}catch(err){
			return done(err);
		}
	},
}