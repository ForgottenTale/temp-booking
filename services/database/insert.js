let {executeQuery, getConfig, checkAvailability} = require('./index.js');

async function addOuIds(personId, ouIds){
	await executeQuery(ouIds.reduce((query, ouId)=>{
		return query+"INSERT INTO ou_map (person_id, ou_id) VALUES(" + personId + ", " + ouId + ");"
	}, ""));	
}

async function findNextOfKin(newAppointment, creator){
	if(config.follow_assignment){
		//find Assignees
		let assignee = await(executeQuery("SELECT * FROM user INNER JOIN person ON person_id = person._id WHERE _id=" + config.assigned_to));
		assignee = assignee[0];
		if(nextApprovers.indexOf(assignee._id)==-1){
			nextApprovers.push(assignee._id);
			nextMails.push(assignee.email);
		}
	}else{
		//find Beta Admins
		[...await(executeQuery("SELECT * FROM user INNER JOIN person ON person_id = person._id WHERE role='BETA_ADMIN';"
		))]
		.forEach(user=>{
			if(nextApprovers.indexOf(user._id)==-1){
				nextApprovers.push(user._id);
				nextMails.push(user.email)
			}
		})
	}
	if(!config.follow_hierarchy){
		//find Alpha Admins
		[...await(executeQuery("SELECT * FROM user INNER JOIN person ON person_id = person._id WHERE role='ALPHA_ADMIN';"
		))]
		.forEach(user=>{
			if(nextApprovers.indexOf(user._id)==-1){
				nextApprovers.push(user._id);
				nextMails.push(user.email);
			}
		})
	}
	let addedAppointment = await executeQuery("INSERT INTO " + newAppointment.type 
		+ "(" + names.join(',') + ") VALUES(" + values.join(',') + ");"
	);
	let altAppointment = await executeQuery("INSERT INTO alt(" + newAppointment.type + "_id, creator_id, ou_id,status) VALUES("
		+ addedAppointment.insertId + "," + newAppointment.creatorId + "," + newAppointment.ouId + ",'" + newAppointment.status + "');");
	let addNextApprovers = nextApprovers.map(userId=>{
		return ("INSERT INTO next_to_approve(user_id, alt_id) VALUES("
			+ userId + "," + altAppointment.insertId
			+ ");"
		)
	}).join("");
}

module.exports = {
    person: async function (person, done) {
        try{
			let exists = await executeQuery("SELECT * FROM person WHERE email='" + person.email + "';");
			if(exists.length>0){
				if(person.ouIds){
					person.id = exists[0]._id;
					let existingOus = await executeQuery("SELECT ou_id FROM ou_map WHERE person_id=" + exists[0]._id);
					let ouIdsToAdd = person.ouIds.reduce((total, elem)=>{
						for(let ouId in existingOus){
							if(existingOus[ouId].ou_id==elem){
								return total;
							}
						}
						total.push(elem);
						return total;
					}, [])
					if(ouIdsToAdd.length>0){
						await addOuIds(person.id, ouIdsToAdd);
						return done(null, person.email + " ADDED OUS: " + ouIdsToAdd.join(' '));
					}
				}
				return done(null, person.email + " ALREADY EXISTS");
			}
            let {names, values} = person.getAllNamesAndValues();
            let query = "INSERT INTO person(" + names.join(',') +") VALUES(" + values.join(',') + ");";
            let result = await executeQuery(query);
            person.id = result.insertId;
            if(person.ouIds){
				await addOuIds(person.id, person.ouIds)
			}
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
                await executeQuery("INSERT INTO user (person_id, password) VALUES(" + person.id + ",'" + person.password +"');");
                resolve(person);
            }catch(err){
                reject(err);
            }
        })
    },
    
	groupAdmin: function (person, done){
		
	},

    appointment: async function(newAppointment, done){
		try{

			//confirm if user is associated with the ou
            let checkOu = await executeQuery("SELECT * FROM ou_map INNER JOIN user ON user.person_id=ou_map.person_id WHERE ou_id=" + newAppointment.ouId + " AND user._id="+ newAppointment.creatorId);
            if(checkOu.length<1){
                return done(new Error("User not associated with Ou"));
            }

			//if super creator change status to approved and next approvers and notifiers as empty
			let creator = await executeQuery("SELECT user._id, user.person_id, person.email, user.super_admin, user.super_creator FROM user INNER JOIN person ON person_id= person._id WHERE user._id=" + creatorId);
			if(creator.super_creator)
				newAppointment.status = "APPROVED";
			else{
				newAppointment.status = "PENDING";
				let {nextApprovers, nextNotifiers} = findNextOfKin(newAppointment, creator);
			}


			let {names, values} = newAppointment.getAllNamesAndValues();
			let config = await new Promise((resolve, reject)=>{
				getConfig(newAppointment.type, newAppointment.serviceName, (err, result)=>{
					if(err) return reject(err);
					return resolve(result);
				})
			})
			await new Promise((resolve, reject)=>{
				checkAvailability(newAppointment, (err, msg)=>{
					if(err) return reject(err);
					return resolve(msg);
				});
			});
			let nextApprovers = [];
			let nextNotifiers = [];
			
			await executeQuery(addNextApprovers);
			mail.newAppointment({id: altAppointment.insertId, type: newAppointment.type, emailIds: nextMails});
			return done(null, {id: altAppointment.insertId});
		}
		catch(err){
			return done(err);
		}
	},

};