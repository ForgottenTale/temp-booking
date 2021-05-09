let {executeQuery, getConfig, checkAvailability} = require('./index.js');
let {newAppointment: sendNewAppointmentMail} = require('../mail.js')

async function addOuIds(person, ouIds){
	await executeQuery(ouIds.reduce((query, ouId)=>{
		return query+"INSERT INTO ou_map (person_id, ou_id, role, admin) VALUES(" + person.id + ", " + ouId + ",'" + person.role + "'," + person.groupAdmin + ");"
	}, ""));	
}

async function findNextOfKin(newAppointment){
	return new Promise(async (resolve, reject)=>{
		try{
			let mailCc = [];
			let mailTo = [];

			//insert appointment
			let {names, values} = newAppointment.getAllNamesAndValues();
			let addedAppointment = await executeQuery("INSERT INTO " + newAppointment.type 
				+ "(" + names.join(',') + ") VALUES(" + values.join(',') + ");");
			let altAppointment = await executeQuery("INSERT INTO alt(" + newAppointment.type + "_id, creator_id, ou_id,status) VALUES("
				+ addedAppointment.insertId + "," + newAppointment.creatorId + "," + newAppointment.ouId + ",'" + newAppointment.status + "');");

			let config = await getConfig(newAppointment.type, newAppointment.serviceName);

			//find group admins
			let groupAdmins = await executeQuery("SELECT person_id, email from ou_map INNER JOIN person ON person_id=person._id WHERE ou_map.ou_id=" 
				+ newAppointment.ouId + " AND ou_map.admin=1;");
			if(config.group_restraint){
				if(groupAdmins.length<1)
					throw new Error("This ou has no admin");
				let query = "";
				groupAdmins.forEach(admin=>{
					query += "INSERT INTO next_to_approve(person_id, alt_id) VALUES("
					+ admin.person_id + "," + altAppointment.insertId
					+ ");";
					mailTo.push(admin.email);
				});
				await executeQuery(query);
				return resolve({altAppointment, mailTo, mailCc});
			}else{
				for(let i in groupAdmins){
					await executeQuery("INSERT INTO response (person_id, alt_id) VALUES(" + groupAdmins[i].person_id + "," + altAppointment.insertId);
					mailCc.push(groupAdmins[i].email);
				}
			}

			//find reviewers
			let reviewers = await executeQuery("SELECT person._id, person.email FROM reviewer_map "
				+ " INNER JOIN user ON user_id=user._id"
				+ " INNER JOIN person ON person_id=user.person_id"
				+ " WHERE service_id=" + config._id);
			if(config.reviewer_restraint){
				if(reviewers.length<1)
					throw new Error("This ou has no reviewers");
				let query = "";
				reviewers.forEach(reviewer=>{
					query += "INSERT INTO next_to_approve(person_id, alt_id) VALUES("
					+ reviewer.person_id + "," + altAppointment.insertId
					+ ");";
					mailTo.push(reviewer.email);
				});
				await executeQuery(query);
				return resolve({altAppointment, mailTo, mailCc});
			}else{
				for(let i in reviewers){
					await executeQuery("INSERT INTO response (person_id, alt_id) VALUES(" + reviewers[i].person_id + "," + altAppointment.insertId);
					mailCc.push(reviewers[i].email);
				}
			}

			//find global admins
			let globalAdmins = await executeQuery("SELECT _id, email FROM person WHERE role='GLOBAL_ADMIN';");
			if(config.global_restraint){
				if(globalAdmins.length<1)
					throw new Error("There are no Global Admins");
				let query = "";
				globalAdmins.forEach(globalAdmin=>{
					query += "INSERT INTO next_to_approve(person_id, alt_id) VALUES("
					+ globalAdmin.person_id + "," + altAppointment.insertId
					+ ");";
					mailTo.push(globalAdmin.email);
				});
				await executeQuery(query);
				return resolve({altAppointment, mailTo, mailCc});
			}else{
				for(let i in globalAdmins){
					await executeQuery("INSERT INTO response (person_id, alt_id) VALUES(" + globalAdmins[i].person_id + "," + altAppointment.insertId);
					mailCc.push(globalAdmins[i].email);
				}
			}
		}catch(err){
			return reject(err);
		}
	})
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
						await addOuIds(person, ouIdsToAdd);
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
				await addOuIds(person, person.ouIds);
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

    appointment: async function(newAppointment, done){
		try{
			//confirm if user is associated with the ou
            let checkOu = await executeQuery("SELECT * FROM ou_map INNER JOIN user ON user.person_id=ou_map.person_id WHERE ou_id=" + newAppointment.ouId + " AND user._id="+ newAppointment.creatorId);
            if(checkOu.length<1){
                return done(new Error("User not associated with Ou"));
            }

			await checkAvailability(newAppointment);

			//if super creator change status to approved and next approvers and notifiers as empty
			let creator = await executeQuery("SELECT user._id, user.person_id, person.email, user.super_admin, user.super_creator FROM user INNER JOIN person ON person_id= person._id WHERE user._id=" + newAppointment.creatorId);
			creator = creator[0];
			newAppointment.status = "PENDING";
			if(creator.super_creator)
				newAppointment.status = "APPROVED";

			let mails = await findNextOfKin(newAppointment);
			if(mails.mailTo.length<1){
				//UPDATE: change status to approve add responses
				mails.mailTo.push(creator.email);
			}else{
				mails.mailCc.push(creator.email);
			}
			newAppointment.id = mails.altAppointment.insertId;
			await sendNewAppointmentMail(newAppointment, mails);
			return done(null, newAppointment);
		}
		catch(err){
			return done(err);
		}
	},

};