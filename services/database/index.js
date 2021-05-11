const mysql = require('mysql');
const { schema } = require('./ddl.js');
const { User, convertDateToSqlDateTime, convertSqlDateTimeToDate, getClass } = require('../controller.js');
const { transmuteSnakeToCamel } = require('../utils.js');
// const {response: delResponse} = require('./del.js') ;
// const {nextApprover: addNextApprover} = require('./insert');

let connection;

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

async function delResponse(bltId){
	return await executeQuery("DELETE FROM response WHERE blt_id=" + bltId + ";"); 
}

async function addNextApprover(personId, bltId){
	await executeQuery("INSERT INTO next_to_approve (person_id, blt_id) VALUES (" + personId + "," + bltId + ");");
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

	findMailsOfInvolved: function (input){
		return new Promise((resolve, reject)=>{
			Promise.all([
				executeQuery("SELECT * FROM next_to_approve INNER JOIN person ON person._id=person_id WHERE blt_id=" + input.id),
				executeQuery("SELECT * FROM response INNER JOIN person ON person._id=person_id WHERE blt_id=" + input.id)
			])
			.then(data=>{
				let emailIds = [];
				data[0].forEach(person=>{
					if(emailIds.indexOf(person.email)==-1)
						emailIds.push(person.email);
				})
				data[1].forEach(person=>{
					if(emailIds.indexOf(person.email)==-1)
						emailIds.push(person.email);
				})
				resolve(emailIds);
			})
			.catch(err=>reject(err));
		})
	},

	tryLevelUp: function (bltId, personId){
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
							throw new Error("This ou has no admin");
						for(let i in groupAdmins){
							if(groupAdmins[i].person_id == person._id){
								found = true;
								break;
							}
						}
						if(found){
							await delResponse(bltId);
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
								throw new Error("This ou has no reviewers");
							for(let i in reviewers){
								if(reviewers[i].person_id == person._id){
									found = true;
									break;
								}
							}
							if(found){
								await delResponse(bltId);
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
							throw new Error("There are no Global Admins");
						for(let i in globalAdmins){
							if(globalAdmins[i].person_id == person._id){
								found = true;
								break;
							}
						}
						if(found){
							await delResponse(bltId);
							level=0;
						}
						else{
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
	},
	
	getServiceTypes: function (){
		return new Promise((resolve, reject)=>{
			connection.query("SELECT DISTINCT(type) FROM service_config;", (err, results)=>{
				if(err) reject(err);
				return resolve(results);
			})
		})
	},

	findServiceType: findServiceType,

	findGroupAdmins: findGroupAdmins,
	
	findReviewers: findReviewers,

	findGlobalAdmins: findGlobalAdmins,

	checkAvailability: function(input){
		return new Promise(async (resolve, reject)=>{
			try{
				ServiceClass = getClass(input.type);
				let config = await getConfig(input.type,input.serviceName);
				ServiceClass.validateTime(input, config);
				let query = ServiceClass.getTimeAvailQuery(input, config);
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
	},

	getCalendarData: function(constraint, done){
		startTime = convertDateToSqlDateTime(constraint.startTime);
		endTime = convertDateToSqlDateTime(constraint.endTime);
		let query = "SELECT distinct DATE(start_time) FROM " + constraint.type + " WHERE"
			+ " (start_time<='" + startTime + "' AND end_time>'" + endTime + "')"
			+ " OR (end_time<'" + endTime + "' AND end_time>='" + startTime + "')"
			+ " OR (start_time<'" + endTime + "' AND start_time>='" + startTime + "');" ;
		executeQuery(query)
		.then(distinctDates=>{
			let dataArray = [];
			let query = "";
			distinctDates.forEach(distinctDate=>{
				query += "SELECT * FROM " + constraint.type + " WHERE DATE(start_time)=DATE('" + distinctDate["DATE(start_time)"] + "');";
			})
			if(query.length>0)
				executeQuery(query)
				.then(datesAndEvents=>{
					if(datesAndEvents[0][0])
						datesAndEvents.forEach(distinctDateEvents=>{
							distinctDate = distinctDateEvents[0].start_time.split(" ");
							distinctDate.pop();
							distinctDate.push("18:30:00");
							distinctDate = distinctDate.join(" ");
							distinctDate = new Date(convertSqlDateTimeToDate(distinctDate));
							distinctDateEvents = distinctDateEvents.map(event=>{
								event.type = constraint.type;
								ServiceClass = getClass(constraint.type);
								ServiceClass.convertSqlTimesToDate(event);
								event = transmuteSnakeToCamel(event);
								return event;
							});
							dataArray.push({date: distinctDate, events: distinctDateEvents});	
						})
					else
						datesAndEvents.forEach(distinctDateEvents=>{
							distinctDate = distinctDateEvents.start_time.split(" ");
							distinctDate.pop();
							distinctDate.push("18:30:00");
							distinctDate = distinctDate.join(" ");
							distinctDate = new Date(convertSqlDateTimeToDate(distinctDate));
							distinctDateEvents.type = constraint.type;
							ServiceClass = getClass(constraint.type);
							ServiceClass.convertSqlTimesToDate(distinctDateEvents);
							distinctDateEvents = transmuteSnakeToCamel(distinctDateEvents);
							dataArray.push({date: distinctDate, events: [distinctDateEvents]})
						})
					return done(null, dataArray);
				})
				.catch(err=>done(err))
			else
				return done(null, []);
		})
		.catch(err=>done(err));
	}
}