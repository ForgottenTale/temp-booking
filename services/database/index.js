const mysql = require('mysql');
const { schema } = require('./ddl.js');
const { User, Person, convertDateToSqlDateTime, convertSqlDateTimeToDate, getClass } = require('../controller.js');
const { transmuteSnakeToCamel, createMeeting} = require('../utils.js');
const mail = require('../mail/index.js');

let connection;

async function addOuIds(person, ouIds){
	await executeQuery(ouIds.reduce((query, ouId)=>{
		return query+"INSERT INTO ou_map (person_id, ou_id, role, admin) VALUES(" + person.id + ", " + ouId + ",'" + person.role + "'," + person.groupAdmin + ");"
	}, ""));	
}

function executeQuery(query){
	return new Promise((resolve, reject)=>{
		connection.query(query, (err, results)=>{
			if(err) return reject(err);
			return resolve(results);
		})
	})
}

function getConfig(type, serviceName){
	return new Promise((resolve, reject)=>{
		let query = "SELECT * FROM service_config WHERE type='" + type 
			+ "' AND (service_name='" + serviceName + "' OR service_name is null);" ;
		connection.query(query, (err, results)=>{
			if(err) return done(err);
			if(results.length<1){
				err = new Error("Config not found");
				err.sql = query;
				return reject(err);
			}
			if(results.length>1)
				results.forEach(result=>{
					if(result.service_name != null)
						return resolve(result);
				})
			return resolve(results[0]);
		})
	})
}

function findServiceType(booking){
	let type, typeId;
	for(let key in booking){
		if(key=="user_id" || key=="_id" || key=="blt_id" || key=="creator_id" || key=="ou_id" || key=="person_id")
			continue;
		if((/_id$/g).test(key) && booking[key]){
			type = key.replace("_id", "");
			typeId = booking[key];
			break;
		}
	}
	if(!type)
		throw new Error("Service type not found");
	return {type, typeId};
}

async function findGroupAdmins(ouId){
	return await executeQuery("SELECT person._id, email FROM ou_map INNER JOIN person ON person._id=ou_map.person_id "
			+ " WHERE ou_map.ou_id=" + ouId + " AND ou_map.admin=1;"
	);
}

async function findReviewers(serviceId){
	return await executeQuery("SELECT person._id, person.email FROM reviewer_map AS r"
		+ " INNER JOIN user AS u ON r.user_id=u._id"
		+ " INNER JOIN person ON u.person_id=person._id"
		+ " WHERE service_id=" + serviceId
	);
}

async function findGlobalAdmins(){
	return await executeQuery("SELECT person._id, person.email FROM ou_map"
		+ " INNER JOIN person ON person_id=person._id"
		+ " WHERE ou_map.ou_id=1 AND ou_map.admin=1;"
	)
}

async function delFromNextToApprove(bltId){
	return await executeQuery("DELETE FROM next_to_approve WHERE blt_id=" + bltId + ";"); 
}

async function addNextApprover(personId, bltId){
	await executeQuery("INSERT INTO next_to_approve (person_id, blt_id) VALUES (" + personId + "," + bltId + ");");
}

function checkAvailability(input){
	return new Promise(async (resolve, reject)=>{
		try{
			ServiceClass = getClass(input.type);
			let config = await getConfig(input.type,input.serviceName);
			ServiceClass.validateTime(input, config);
			let query = ServiceClass.getTimeAvailQuery(input, config);
			query += " AND status='APPROVED'";
			connection.query(query, (err, results, fields)=>{
				if(err) return reject(err);
				if(results.length < 1){
					return resolve("Available");
				}
				return reject(new Error("Time slot unavailable"));
			})
		}catch(err){
			return reject(err);
		}
	})
}

function tryLevelUp(bltId, personId){
	return new Promise(async (resolve, reject)=>{
		try{
			let involved = [];
			let nextApprovers = [];

			let bltBooking = await executeQuery("SELECT * FROM blt WHERE _id=" + bltId);
			if(bltBooking.length!=1)
				if(bltBooking.length==0)
					throw new Error("Booking doesn't exist");
				else
					throw new Error("Invalid number of bookings");
			bltBooking = bltBooking[0];
			let {type, typeId} = findServiceType(bltBooking);
			let booking = await executeQuery("SELECT service_name FROM blt INNER JOIN " + type + " ON "
				+ type + "_id=" + type + "._id");
			booking = booking[0];
			let config = await getConfig(type, booking.service_name);

			let person = await executeQuery("SELECT * FROM person WHERE _id=" + personId);
			person = person[0];
			let level = bltBooking.level;
			let found;

			//find group admins
			found = false;
			let groupAdmins = await findGroupAdmins(bltBooking.ou_id);
			if(level==3){
				if(config.group_restraint){				
					if(groupAdmins.length<1)
						level = 2;
					for(let i in groupAdmins){
						if(groupAdmins[i]._id == person._id){
							found = true;
							break;
						}
					}
					if(found){
						await delFromNextToApprove(bltId);
						level=2;
					}
					else{
						nextApprovers = groupAdmins;
					}
				}else
					level=2;
			}
			if(level<3)
				involved.push(...groupAdmins);

			//find reviewers
			found = false;
			let reviewers = await findReviewers(config._id);
			if(level==2){
				if(config.reviewer_restraint){
					if(level==2){
						if(reviewers.length<1)
							level = 1;
						for(let i in reviewers){
							if(reviewers[i]._id == person._id){
								found = true;
								break;
							}
						}
						if(found){
							await delFromNextToApprove(bltId);
							level=1
						}
						else{
							nextApprovers = reviewers;
						}
					}
				}else
					level=1;
			}
			if(level<2)
				involved.push(...reviewers);

			//find global admins
			found = false;
			let globalAdmins = await findGlobalAdmins();
			if(level==1){
				if(config.global_restraint){
					if(globalAdmins.length<1)
						{
							await delFromNextToApprove(bltId);
							nextApprovers=[{_id: 1, email: process.env.SUPER_EMAIL}]
						}
					for(let i in globalAdmins){
						if(globalAdmins[i]._id == person._id){
							found = true;
							break;
						}
					}
					if(found){
						await delFromNextToApprove(bltId);
						level=0;
					}else{
						nextApprovers = globalAdmins;
					}
				}else
					level = 0;
			}
			if(level<1)
				involved.push(...globalAdmins);
			await Promise.all(nextApprovers.map(person=>{
				addNextApprover(person._id, bltId)
			}));
			return resolve({nextApprovers, involved, level});
		}catch(err){
			return reject(err);
		}
	})
}

function findMailsOfInvolved(bltId){
	return new Promise(async(resolve, reject)=>{
		try{
			let blt = await executeQuery("SELECT * FROM blt WHERE _id="+bltId);
			blt = blt[0];
			let {type, typeId} = findServiceType(blt);
			emailIds = [];
			if(blt.level<4){
				let groupAdmins = await findGroupAdmins(blt.ou_id);
				groupAdmins.forEach(admin=>{
					emailIds.push(admin.email);
				})
			}
			if(blt.level<3){
				let booking = await executeQuery("SELECT service_name FROM blt INNER JOIN " + type + " ON "+ type + "_id="+type+"._id")
				let config = await getConfig(type, booking[0].service_name);
				let reviewers = await findReviewers(config._id);
				reviewers.forEach(reviewer=>{
					emailIds.push(reviewer.email);
				})
			}
			if(blt.level<2){
				let globalAdmins = await findGlobalAdmins();
				globalAdmins.forEach(admin=>{
					emailIds.push(admin.email);
				})
			}
			return resolve(emailIds);
		}catch(err){
			reject(err);
		}
	})
}

function getServiceTypes(){
	return new Promise((resolve, reject)=>{
		connection.query("SELECT DISTINCT(type) FROM service_config;", (err, results)=>{
			if(err) reject(err);
			return resolve(results);
		})
	})
}


function addResponse(personId, bltId, encourages, response){
	return new Promise(async (resolve, reject)=>{
		try {
			let result = await executeQuery("INSERT INTO response(person_id, blt_id, encourages, response) VALUES ("
		 + personId + "," + bltId + "," + encourages + ",'" + response
		+ "')");
		return resolve(result);
		}catch(err){
			reject(err);
		}
	})
}

module.exports = {
	connection: connection,

	connect: function (done){

		console.log("Trying to establish connection");

		connection = mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_DATABASE,
			multipleStatements: true,
			dateStrings: true
		});
		
		connection.connect((err)=>{
			if(err){
				console.log("Error in establishing connection");
				return done(err);
			}
			console.log("Connection established");
			connection.query(schema.join(''), function (err, results, fields) {
				if (err) return done(err);
				//Check if atleast one superAdmin exists and add one if not
				connection.query("SELECT * FROM user WHERE super_admin is true", (err, results)=>{
					if(err) return done(err);
					if(results.length<1){
						connection.query("INSERT INTO person (name, email) VALUES('" + process.env.SUPER_NAME + "', '" + process.env.SUPER_EMAIL +"');",
						(err, result)=>{
							if(err) return done(err);
							connection.query("INSERT INTO user(person_id, password, super_admin) VALUES (" + result.insertId + ",'" + process.env.SUPER_PSW + "', true);", 
							(err, result)=>{
								if(err) return done(err);
								console.log("Added SUPER");
								return done(null);
							});
						});
					}else{
						return done(null);
					}
				});
			});
		});
	},

	executeQuery: executeQuery,

	getConfig: getConfig,

	findMailsOfInvolved: findMailsOfInvolved,

	tryLevelUp: tryLevelUp,
	
	getServiceTypes: getServiceTypes,

	findServiceType: findServiceType,

	findGroupAdmins: findGroupAdmins,
	
	findReviewers: findReviewers,

	findGlobalAdmins: findGlobalAdmins,

	checkAvailability: checkAvailability,

	getCalendarData: async function(constraint){
		try{
			startTime = convertDateToSqlDateTime(constraint.startTime);
			endTime = convertDateToSqlDateTime(constraint.endTime);
			let query = "SELECT * FROM blt INNER JOIN online_meeting ON online_meeting_id=online_meeting._id WHERE"
				+ " status='APPROVED'"
				+ " AND (start_time>'" + startTime + "' AND start_time<'" + endTime + "') OR "
				+ " (end_time>'" + startTime +"' AND end_time<'" + endTime + "') OR "
				+ " (start_time='" + startTime +"' AND end_time='" + endTime + "');"
			// query += query.replace(/online_meeting/g, "intern_support");
			let dataArray = [];
			let eventsOfAllTypes = await executeQuery(query);
			if(eventsOfAllTypes.length<1){
				return dataArray;
			}
			eventsOfAllTypes.forEach(event=>{
				event.start_time = convertSqlDateTimeToDate(event.start_time).toISOString();
				event.end_time = convertSqlDateTimeToDate(event.end_time).toISOString();
				dataArray.push(transmuteSnakeToCamel(event))
			});
			// eventsOfAllTypes.forEach(eventsOfType=>{
			// 	eventsOfType.forEach(event=>dataArray.push(transmuteSnakeToCamel(event)));
			// })

			// query = "SELECT * FROM blt INNER JOIN e_notice ON e_notice_id=e_notice._id WHERE"
			// 	+ " status='APPROVED' OR status='PENDING'"
			// 	+ " AND (publish_time>='" + startTime + "' AND publish_time<='" + endTime + "');";
			// query += query.replace(/e_notice/g, "publicity");
			// eventsOfAllTypes = await executeQuery(query);
			// eventsOfAllTypes.forEach(eventsOfType=>{
			// 	eventsOfType.forEach(event=>{
			// 		event.startTime = event.publish_time;
			// 		event.endTime = event.publish_time;
			// 		dataArray.push(transmuteSnakeToCamel(event));
			// 	});
			// })
			return dataArray;
		}catch(err){
			throw err;
		}
		
		// then(distinctDates=>{
		// 	let query = "";
		// 	distinctDates.forEach(distinctDate=>{
		// 		query += "SELECT * FROM " + constraint.type + " WHERE DATE(start_time)=DATE('" + distinctDate["DATE(start_time)"] + "');";
		// 	})
		// 	if(query.length>0)
		// 		executeQuery(query)
		// 		.then(datesAndEvents=>{
		// 			if(datesAndEvents[0][0])
		// 				datesAndEvents.forEach(distinctDateEvents=>{
		// 					distinctDate = distinctDateEvents[0].start_time.split(" ");
		// 					distinctDate.pop();
		// 					distinctDate.push("18:30:00");
		// 					distinctDate = distinctDate.join(" ");
		// 					distinctDate = new Date(convertSqlDateTimeToDate(distinctDate));
		// 					distinctDateEvents = distinctDateEvents.map(event=>{
		// 						event.type = constraint.type;
		// 						ServiceClass = getClass(constraint.type);
		// 						ServiceClass.convertSqlTimesToDate(event);
		// 						event = transmuteSnakeToCamel(event);
		// 						return event;
		// 					});
		// 					dataArray.push({date: distinctDate, events: distinctDateEvents});	
		// 				})
		// 			else
		// 				datesAndEvents.forEach(distinctDateEvents=>{
		// 					distinctDate = distinctDateEvents.start_time.split(" ");
		// 					distinctDate.pop();
		// 					distinctDate.push("18:30:00");
		// 					distinctDate = distinctDate.join(" ");
		// 					distinctDate = new Date(convertSqlDateTimeToDate(distinctDate));
		// 					distinctDateEvents.type = constraint.type;
		// 					ServiceClass = getClass(constraint.type);
		// 					ServiceClass.convertSqlTimesToDate(distinctDateEvents);
		// 					distinctDateEvents = transmuteSnakeToCamel(distinctDateEvents);
		// 					dataArray.push({date: distinctDate, events: [distinctDateEvents]})
		// 				})
		// 			return done(null, dataArray);
		// 		})
		// 		.catch(err=>done(err))
		// 	else
		// 		return done(null, []);
		// })
		// .catch(err=>done(err));
	},

	addPerson: async function (person, done) {
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

    addHash: function(personId, hash){
        return new Promise(async (resolve, reject)=>{
            try{
                let result = await executeQuery("INSERT INTO hash (person_id, hash) VALUES(" + personId + ", '"+ hash +"');");
                resolve(result.insertId);
            }catch(err){
                reject(err);
            }
        })
    },

	addResetId: async function(email, id, done){
		try{
			await executeQuery(`INSERT INTO reset_id(email, _id) VALUES('${email}', '${id}');`)
			return done(null, "Success");
		}catch(err){
			return done(err);
		}
	},

    addUserAccount: function(person){
        return new Promise(async (resolve, reject)=>{
            try{
                await executeQuery("INSERT INTO user (person_id, password) VALUES(" + person.id + ",'" + person.password +"');");
                resolve(person);
            }catch(err){
                reject(err);
            }
        })
    },

    addBooking: async function(newBooking, user, done){
		try{
			var addedBooking, bltBooking;
			//confirm if user is associated with the ou
			if(!newBooking.ouId)
				throw new Error("OuId is required");
            let checkOu = await executeQuery("SELECT * FROM ou_map INNER JOIN user ON user.person_id=ou_map.person_id WHERE ou_id=" + newBooking.ouId + " AND user._id="+ newBooking.creatorId);
            if(checkOu.length<1){
                throw new Error("User not associated with Ou");
            }

			await checkAvailability(newBooking);

			//UPDATE: GLOBAL ADMIN

			//if super creator change status to approved and next approvers and notifiers as empty
			// let creator = await executeQuery("SELECT user._id, user.person_id, person.email, user.super_admin, user.super_creator FROM user INNER JOIN person ON person_id= person._id WHERE user._id=" + newBooking.creatorId);
			// creator = creator[0];
			// newBooking.status = "PENDING";
			// if(creator.super_creator)
			// 	newBooking.status = "APPROVED";

			//insert booking
			let {names, values} = newBooking.getAllNamesAndValues();
			addedBooking = await executeQuery("INSERT INTO " + newBooking.type 
				+ "(" + names.join(',') + ") VALUES(" + values.join(',') + ");");
			bltBooking = await executeQuery("INSERT INTO blt(" + newBooking.type + "_id, creator_id, ou_id,status) VALUES("
				+ addedBooking.insertId + "," + newBooking.creatorId + "," + newBooking.ouId + ",'" + newBooking.status + "');");

			let info = await tryLevelUp(bltBooking.insertId, user.personId);

			await executeQuery("UPDATE blt SET level=" + info.level + " WHERE _id=" + bltBooking.insertId);
			let emailIds = {mailTo: info.nextApprovers.map(person=>person.email)};
			emailIds.mailCc = info.involved.map(person=>person.email);
			newBooking.id = bltBooking.insertId;
			if(info.level==0){
				await executeQuery("UPDATE blt SET status='APPROVED' WHERE _id=" + bltBooking.insertId);
				if(newBooking.type=="online_meeting"){
					await createMeeting(newBooking, newBooking.serviceName);
				}
				emailIds.mailTo.push(user.email);
				mail.finalApproval({id: newBooking.id}, emailIds);
				return done(null, newBooking);
			}
			let temp = await executeQuery(`SELECT name FROM ou INNER JOIN blt ON blt.ou_id=ou._id WHERE ou_id=${newBooking.ouId}`)
			newBooking.ouName = temp[0].name;
			mail.newBooking(newBooking, {mailTo: user.email});
			mail.reviewRequest(newBooking, emailIds);
			return done(null, newBooking);
		}	
		catch(err){
			if(bltBooking)
				if(bltBooking.insertId)
					await executeQuery(`
						DELETE FROM response WHERE blt_id=${bltBooking.insertId};
						DELETE FROM next_to_approve WHERE blt_id=${bltBooking.insertId};
						DELETE FROM blt WHERE _id=${bltBooking.insertId};
					`);
			if(addedBooking)
				if(addedBooking.insertId)
					await executeQuery(`DELETE FROM ${newBooking.type} WHERE _id=${addedBooking.insertId}`);
			
			return done(err);
		}
	},

	addResponse: addResponse,

	addNextApprover: function(personId, bltId){
		return new Promise(async(resolve, reject)=>{
			try{
				let result = await executeQuery("INSERT INTO next_to_approve (person_id, blt_id) VALUES (" + personId + "," + bltId + ");");
				return resolve(result);
			}catch(err){
				reject(err);
			}
		})
	},

	addFeedback: async function(body, userId, done){
		try{
			if(!body.type)
				body.type=null;
			await executeQuery(`INSERT INTO feedback (user_id, type, text) VALUES (${userId}, '${body.type}', '${body.text}')`);
			return done(null, "Feedback added successfully");
		}catch(err){
			return done(err);
		}
	},

	getUserWithHash: function(hash){
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

    getUser: async function (params, done) {
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

	getResetId: async function(id, done){
		try{
			let result = await executeQuery(`SELECT * FROM reset_id WHERE _id='${id}'`);
			return done(null, result);
		}catch(err){
			return done(err);
		}
	},

    getAllUsers: function(constraint, done){
		let query = "SELECT *, user._id as id FROM user INNER JOIN person ON person_id=person._id INNER JOIN ou_map ON ou_map.person_id=person._id";
		if(constraint.role == "admin")
			query+=" WHERE ou_map.admin=1";
		else if(constraint.role == "user")
			query+=" WHERE ou_map.admin=0";
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

    getOu: function(personId, done){
        executeQuery("SELECT ou._id, ou.name FROM ou_map INNER JOIN ou ON ou._id=ou_id WHERE person_id=" + personId)
        .then(results=>{
            results = results.map(result=>transmuteSnakeToCamel(result))
            return done(null, results);
        })
        .catch(err=>done(err));
    },

    getBookings: async function(constraint, done){
		try{
			let types = await getServiceTypes();
			let query = "";
			types.forEach(serviceType=>{
				query+="SELECT *, blt._id as _id FROM blt INNER JOIN " + serviceType.type + " ON blt." + serviceType.type + "_id=" + serviceType.type +"._id"  
					+ " INNER JOIN user ON user._id=creator_id"
                    + " INNER JOIN person on person._id=user.person_id"
					+ " WHERE " + serviceType.type + "_id IS NOT NULL AND creator_id=" + constraint.userId 
                  	+ " AND blt.ou_id="+constraint.ouId;
				if(constraint.bookingId)
					query += " AND blt._id=" + constraint.bookingId;
                query += " ORDER BY blt._id DESC;";
			})
			let bookingsOfAllTypes = await executeQuery(query);
			if(constraint.bookingId)
				return done(new Error("Unable to find request"));
			query = "";
			let dataArray = [];
			for (let mainIdx in bookingsOfAllTypes){
				for (let idx in bookingsOfAllTypes[mainIdx]){
					ServiceClass = getClass(types[mainIdx].type);
					bookingsOfAllTypes[mainIdx][idx] = ServiceClass.convertSqlTimesToDate(bookingsOfAllTypes[mainIdx][idx]);
					bookingsOfAllTypes[mainIdx][idx] = transmuteSnakeToCamel(bookingsOfAllTypes[mainIdx][idx]);
					bookingsOfAllTypes[mainIdx][idx].otherResponses = await executeQuery("SELECT name, email, encourages, response FROM response INNER JOIN person on person._id=response.person_id WHERE blt_id=" + bookingsOfAllTypes[mainIdx][idx].id + ";");
					bookingsOfAllTypes[mainIdx][idx].type = types[mainIdx].type;
					dataArray.push(bookingsOfAllTypes[mainIdx][idx])
				}
			}
			return done(null, dataArray);
		}catch(err){
			return done(err);
		}
	},

    getActivity: async function(userId, done){
		let returnData = {};
		try{
			let query = "SELECT status, count(*) FROM blt";
            // if(ouId != 1)
            //     query += " WHERE ou_id=" + ouId ;
            query+= ` WHERE creator_id=${userId} GROUP BY status;`;
            let data = await executeQuery(query);
			data.forEach(statusType=>{
				returnData[statusType.status.toLowerCase()] = statusType["count(*)"];
			})
			return done(null, returnData);
		}catch(err){
			return done(err);
		}
	},

	getApprovals: async function(constraint, bltId, done){
		try{
			let types = await getServiceTypes();
			let query = "";
			types.forEach(type=>{
				query += "SELECT *, blt._id as _id FROM blt"
					+ " INNER JOIN " + type.type + " ON " + type.type + "_id=" + type.type + "._id"
					+ " INNER JOIN user ON creator_id=user._id"
					+ " INNER JOIN person ON user.person_id=person._id"
				if(constraint.filter == "pending"){
					query+= " INNER JOIN next_to_approve AS n ON n.blt_id=blt._id"
						+ " WHERE n.person_id=" + constraint.user.personId + " AND"
				}
				else if(constraint.filter == "history"){
					query+= " INNER JOIN response AS n ON n.blt_id=blt._id"
						+ " WHERE n.person_id=" + constraint.user.personId + " AND"
				}
				else 
					query+= " WHERE"
				
				if(constraint.user.activeOu.id == 1 && constraint.user.activeOu.admin)
					query+= " level<2";
				else if(constraint.user.activeOu.reviewer)
					query+= " level<3";
				else if(constraint.user.activeOu.admin)
					query+= ` level<4 AND ou_id=${constraint.user.activeOu.id}`
				else
					query+= ` ou_id=${constraint.user.activeOu.id} AND level<4`
				if(bltId)
					query += " AND blt._id=" + bltId + ";"
				else
					query += " ORDER BY blt._id DESC;";
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
					bookingsOfAllTypes[mainIdx][idx].otherResponses = await executeQuery("SELECT name, email, encourages, response FROM response INNER JOIN person on person._id=response.person_id WHERE blt_id=" + bookingsOfAllTypes[mainIdx][idx].id + ";");
					bookingsOfAllTypes[mainIdx][idx].type = types[mainIdx].type;
					delete(bookingsOfAllTypes[mainIdx][idx].password);
					dataArray.push(bookingsOfAllTypes[mainIdx][idx])
				}
			}
			if(dataArray.length<1 && bltId)
				return done(new Error("Booking not found"));
			return done(null, dataArray);
		}catch(err){
			return done(err);
		}
	},

	updatePassword: async function(email, password, done){
		try{
			await executeQuery(`UPDATE user INNER JOIN person ON person_id=person._id SET password='${password}' WHERE email='${email}'`);
			return done(null, "successful");
		}catch(err){
			return done(err);
		}
	},

	updateUser: async function(input, userId, done){
		try{
			let valuesForEdit = User.getValuesForEdit(input);
			if(valuesForEdit.length<1)
				throw new Error("No editable values were received");
			executeQuery("UPDATE person INNER JOIN user ON person_id=person._id SET " + valuesForEdit.join(",") + " WHERE user._id=" + userId + ";")
			.then(data=>{
				return done(null, "Updated Successfully");
			})
			.catch(err=>done(err));
		}catch(err){
			done(err);
		}
	},

	updateBooking: function(newValues, bltId, userActiveOuId){
		return new Promise(async (resolve, reject)=>{
			try{
				let bltBooking = await executeQuery("SELECT * FROM blt WHERE _id=" + bltId + " AND ou_id=" + userActiveOuId);
				if(bltBooking.length<1)
					throw new Error("Booking not found");
				if(bltBooking[0].status == "CANCELLED" || bltBooking[0].status == "DELETED")
					throw new Error("Cancelled/deleted bookings are not editable");
				let {type, typeId} = findServiceType(bltBooking[0]);
				ServiceClass = getClass(type);
				let values = ServiceClass.getValuesForEdit(newValues);
				await executeQuery("UPDATE " + type + " SET " + values.join(", ") + " WHERE _id=" + bltBooking[0][type+"_id"]);
				resolve({message: "Updated"});
			}catch(err){
				reject(err);
			}
		})
	},

	updateBookingStatus: async function(input, bookingId, user, done){
		try{
			let bltBooking = await executeQuery(`SELECT * FROM blt WHERE _id=${bookingId}`);
			if(bltBooking.length<1)
				throw new Error("Unable to find booking");
			if(input.encourages){
				let {type, typeId} = findServiceType(bltBooking[0]);
				let booking = await executeQuery(`SELECT * FROM ${type} WHERE _id=${typeId}`);
				booking = transmuteSnakeToCamel(booking[0]);
				booking.type = type;
				if(booking.startTime){
					booking.startTime = convertSqlDateTimeToDate(booking.startTime);
					booking.endTime = convertSqlDateTimeToDate(booking.endTime);
				}else{
					booking.publishTime = convertSqlDateTimeToDate(booking.publishTime).toISOString();
				}
				await checkAvailability(booking);
				await addResponse(user.personId, bookingId, input.encourages, input.response);
				let info = await tryLevelUp(bookingId, user.personId);
				await executeQuery("UPDATE blt SET level="+ info.level + " WHERE _id=" + bookingId);
				let emailIds = {mailTo: info.nextApprovers.map(person=>person.email)};
				emailIds.mailCc = info.involved.map(person=>person.email);

				if(info.level==0){
					await executeQuery("UPDATE blt SET status='APPROVED', approved_at=CURRENT_TIMESTAMP WHERE _id=" + bookingId);
					booking = await executeQuery("SELECT * FROM blt WHERE _id=" + bookingId);
					booking = booking[0];
					let {type, typeId} = findServiceType(booking);
					ServiceClass = getClass(type);
					booking = await executeQuery(`SELECT * FROM blt INNER JOIN ${type} ON ${type}._id=${type}_id WHERE blt._id=${bookingId}`);
					booking = booking[0];
					let config= await getConfig(type, booking.service_name);
					booking = transmuteSnakeToCamel(booking);
					booking.type=type;
					if(booking.startTime){
						booking.startTime = convertSqlDateTimeToDate(booking.startTime);
						booking.endTime = convertSqlDateTimeToDate(booking.endTime);
					}else
						booking.publishTime = convertSqlDateTimeToDate(booking.publishTime);
					let query = ServiceClass.getTimeAvailQuery(booking, config);
					query += " AND status='PENDING'";
					let sameSlotBookings = await executeQuery(query);
					sameSlotBookings.forEach(async booking=>{
						//UPDATE: to be decided cc on reject
						
						let creator = await executeQuery(`SELECT * FROM blt INNER JOIN user ON user._id=creator_id INNER JOIN person ON person_id=person._id WHERE blt._id=${booking._id}`);
						executeQuery(`INSERT INTO response(person_id, blt_id, encourages, response) VALUES (1, ${booking._id}, 0, 'ANOTHER REQUEST GOT APPROVED FOR THE SELECTED TIME SLOT')`);
						executeQuery(`UPDATE blt SET status = 'DECLINED' WHERE _id=${booking._id}`);
						executeQuery(`DELETE FROM next_to_approve WHERE blt_id=${booking._id}`);
						let emailIds = {mailTo: creator[0].email};
						let {type, typeId} = findServiceType(creator[0]);
						mail.finalDeclined({id: booking._id, response: "ANOTHER REQUEST GOT APPROVED FOR THE SELECTED TIME SLOT", type}, emailIds);
					})
					if(booking.type=="online_meeting"){
						createMeeting(booking, booking.serviceName);
					}
					let creator = await executeQuery(`SELECT email FROM blt INNER JOIN user ON user._id=creator_id INNER JOIN person ON person._id=user.person_id WHERE blt._id=${bookingId}`);
					creator = creator[0];
					emailIds.mailTo.push(creator.email);
					mail.finalApproval({id: bookingId}, emailIds);
					return done(null, "Updated");
				}
	
				emailIds.mailCc.push(user.email);
				booking = await executeQuery(`SELECT * FROM blt WHERE _id=${bookingId}`);
				booking = await executeQuery(`SELECT *,blt._id as _id, ou.name as ou_name FROM blt INNER JOIN ${type} ON ${type}_id=${type}._id INNER JOIN ou ON ou_id=ou._id WHERE blt._id=${bookingId}`);
				booking=transmuteSnakeToCamel(booking[0]);
				booking.type = type;
				mail.reviewRequest(booking, emailIds);
				return done(null, "APPROVED");
			}else{
				await addResponse(user.personId, bookingId, input.encourages, input.response);
				let result = await executeQuery("SELECT * FROM next_to_approve WHERE person_id="
					+ user.personId + " AND blt_id=" + bookingId
				);
				if(result.length>0){
					await delFromNextToApprove(bookingId);
					await executeQuery("UPDATE blt SET status='DECLINED', approved_at=CURRENT_TIMESTAMP WHERE _id=" + bookingId);
					let involved = await findMailsOfInvolved(bookingId);
					let creator = await executeQuery(`SELECT * FROM blt INNER JOIN user ON user._id=creator_id INNER JOIN person ON person._id=user.person_id WHERE blt._id=${bookingId}`);
					creator = creator[0];
					let {type, typeId} = findServiceType(creator);
					emailIds = {mailTo: creator.email, mailCc: involved};
					mail.finalDeclined({id: bookingId, response: input.response, type}, emailIds);
				}
				return done(null, "DECLINED");
			}
		}catch(err){
			return done(err);
		}
	},

	delUserWithHash: function(hash){
        return new Promise(async(resolve, reject)=>{
            try{
                await executeQuery("DELETE FROM hash WHERE hash='" + hash + "';");
                resolve(hash);
            }catch(err){
                reject(err);
            }
        })
    },

	cancelBooking: function(input){
		return new Promise(async (resolve, reject)=>{
            try{
                let booking = await executeQuery("SELECT * FROM blt WHERE _id=" + input.bookingId + " AND ou_id=" + input.user.activeOu.id +";")
                if(booking.length < 1)
                    return reject(new Error("Booking not found"))
                if(booking[0].creator_id == input.user.id || (input.user.activeOu.admin)){
                    //find type
                    let {type, typeId} = findServiceType(booking[0]);
                    if(!type)
                        return reject(new Error("Booking type not found"));
                    let query = `DELETE FROM next_to_approve WHERE blt_id= ${input.bookingId} ;
                    	UPDATE blt SET status='CANCELLED' WHERE _id= ${input.bookingId} ;
                    `;
                    await executeQuery(query);
                    return resolve("Cancelled Successfully");
                }else
                    return resolve("Services can only be cancelled only by creator, group and global admins");
            }catch(err){
                return reject(err);
            }
		})
	},

    delBooking: function(input){
        return new Promise(async (resolve, reject)=>{
            try{
                let booking = await executeQuery("SELECT * FROM blt WHERE _id=" + input.bookingId + ";")
                if(booking.length < 1)
                    return reject(new Error("Booking not found"))
                if(input.user.activeOu.id==1 && input.user.activeOu.admin){
                    //find type
                    let {type, typeId} = findServiceType(booking[0]);
                    if(!type)
                        return reject(new Error("Booking type not found"));
                    let query = `DELETE FROM next_to_approve WHERE blt_id= ${input.bookingId} ;
                    	UPDATE blt SET level=10, status='DELETED' WHERE _id= ${input.bookingId} ;
                    `;
                    await executeQuery(query);
                    return resolve("Deleted Successfully");
                }else
                    return resolve("Services can only be deleted by global admins");
            }catch(err){
                return reject(err);
            }
        })
    },

    delFromNextToApprove: async function(bltId){
        return await executeQuery("DELETE FROM next_to_approve WHERE blt_id=" + bltId + ";"); 
    },

	delResetId: async function(email){
		await executeQuery(`DELETE FROM reset_id WHERE email='${email}'`);
	}

}