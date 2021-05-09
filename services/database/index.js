const mysql = require('mysql');
const { schema } = require('./ddl.js');
const { User, convertDateToSqlDateTime, convertSqlDateTimeToDate, getClass } = require('../controller.js');
const { transmuteSnakeToCamel } = require('../utils.js');
const mail = require('../mail.js');

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

function findMailsOfInvolved(input){
	return new Promise((resolve, reject)=>{
		Promise.all([
			executeQuery("SELECT * FROM next_to_approve INNER JOIN person ON person._id=person_id WHERE alt_id=" + input.id),
			executeQuery("SELECT * FROM response INNER JOIN person ON person._id=person_id WHERE alt_id=" + input.id)
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
}

module.exports = {
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
						connection.query("INSERT INTO person (role, name, email) VALUES('REVIEWER', '" + process.env.SUPER_NAME + "', '" + process.env.SUPER_EMAIL +"');",
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

	connection: connection,

	executeQuery: executeQuery,

	getConfig: getConfig,

	findMailsOfInvolved: findMailsOfInvolved,

	getAppointmentTypes: function getAppointmentTypes(){
		return new Promise((resolve, reject)=>{
			connection.query("SELECT DISTINCT(type) FROM service_config;", (err, results)=>{
				if(err) reject(err);
				return resolve(results);
			})
		})
	},

	checkAvailability: function(input, done){
		return new Promise(async (resolve, reject)=>{
			try{
				AppointmentClass = getClass(input.type);
				let config = await getConfig(input.type,input.serviceName);
				AppointmentClass.validateTime(input, config);
				let query = AppointmentClass.getTimeAvailQuery(input, config);
				connection.query(query, (err, results, fields)=>{
					if(err) return done(err);
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
								AppointmentClass = getClass(constraint.type);
								AppointmentClass.convertSqlTimesToDate(event);
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
							AppointmentClass = getClass(constraint.type);
							AppointmentClass.convertSqlTimesToDate(distinctDateEvents);
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
	},

	findHistoryOfApprovals: async function(constraint, done){
		try{
			let types = await getAppointmentTypes();
			let query = "";
			types.forEach(type=>{
				query += "SELECT *, alt._id as _id FROM alt"
					+ " INNER JOIN " + type.type + " ON " + type.type + "_id=" + type.type + "._id"
					+ " INNER JOIN response as r ON r.alt_id=alt._id"
					+ " INNER JOIN user ON creator_id=user._id"
					+ " WHERE r.user_id=" + constraint.user_id + ";";
			})
			let appointmentsOfAllTypes = await executeQuery(query);
			let dataArray = [];
			for (let mainIdx in appointmentsOfAllTypes){
				for (let idx in appointmentsOfAllTypes[mainIdx]){
					AppointmentClass = getClass(types[mainIdx].type);
					appointmentsOfAllTypes[mainIdx][idx] = AppointmentClass.convertSqlTimesToDate(appointmentsOfAllTypes[mainIdx][idx]);
					appointmentsOfAllTypes[mainIdx][idx] = transmuteSnakeToCamel(appointmentsOfAllTypes[mainIdx][idx]);
					appointmentsOfAllTypes[mainIdx][idx].otherResponses = await executeQuery("SELECT name, email, encourages, response FROM response INNER JOIN user on user._id=response.user_id WHERE alt_id=" + appointmentsOfAllTypes[mainIdx][idx].id + " AND user_id!=" + constraint.user_id + ";");
					appointmentsOfAllTypes[mainIdx][idx].type = types[mainIdx].type;
					dataArray.push(appointmentsOfAllTypes[mainIdx][idx]);
				}
			}		
			return done(null, dataArray);	
		}catch(err){
			return done(err);
		}
	},

	findUserApprovals: async function(constraint, done){
		try{
			let types = await getAppointmentTypes();
			let query = "";
			types.forEach(type=>{
				query += "SELECT *, alt._id as _id FROM alt"
					+ " INNER JOIN " + type.type + " ON " + type.type + "_id=" + type.type + "._id"
					+ " INNER JOIN next_to_approve as n ON n.alt_id=alt._id"
					+ " INNER JOIN user ON creator_id=user._id"
					+ " WHERE n.user_id=" + constraint.user_id;
				if(constraint.id)
					query += " AND alt._id=" + constraint.id + ";"
				else
					query += ";";
			})
			let appointmentsOfAllTypes = await executeQuery(query);
			let dataArray = [];
			for (let mainIdx in appointmentsOfAllTypes){
				for (let idx in appointmentsOfAllTypes[mainIdx]){
					AppointmentClass = getClass(types[mainIdx].type);
					let config = await new Promise((resolve, reject)=>{
						getConfig(types[mainIdx].type, appointmentsOfAllTypes[mainIdx][idx].service_name, (err, result)=>{
							if(err) return reject(err);
							return resolve(result);
						});
					});
					appointmentsOfAllTypes[mainIdx][idx].encourageMode = !config.follow_hierarchy;
					appointmentsOfAllTypes[mainIdx][idx] = AppointmentClass.convertSqlTimesToDate(appointmentsOfAllTypes[mainIdx][idx]);
					appointmentsOfAllTypes[mainIdx][idx] = transmuteSnakeToCamel(appointmentsOfAllTypes[mainIdx][idx]);
					appointmentsOfAllTypes[mainIdx][idx].otherResponses = await executeQuery("SELECT name, email, encourages, response FROM response INNER JOIN user on user._id=response.user_id WHERE alt_id=" + appointmentsOfAllTypes[mainIdx][idx].id + ";");
					appointmentsOfAllTypes[mainIdx][idx].type = types[mainIdx].type;
					delete(appointmentsOfAllTypes[mainIdx][idx].password);
					dataArray.push(appointmentsOfAllTypes[mainIdx][idx])
				}
			}
			return done(null, dataArray);
		}catch(err){
			return done(err);
		}
	},

	changeAppointmentStatus: async function(input, done){
		try{
			let appointment = await executeQuery("SELECT * FROM alt"
				+ " INNER JOIN next_to_approve as n ON alt._id=n.alt_id"
				+ "  WHERE alt_id=" + input.appointmentId +" AND n.user_id=" + input.user._id);
			if(appointment.length!=1)
				if(appointment.length==0)
					throw new Error("Appointment doesn't exist");
				else
					throw new Error("Invalid number of appointments selected");
			appointment = appointment[0];
			let type;
			for(let key in appointment){
				if(key=="user_id" || key=="_id" || key=="alt_id" || key=="creator_id")
					continue;
				if((/_id$/g).test(key) && appointment[key]){
					type = key.replace("_id", "");
					typeId = appointment[key];
				}
			}
			if(!type)
				return done(new Error("Appointment type not found"));
			let config = await new Promise((resolve, reject)=>{
				getConfig(type, appointment.service_name, (err, results)=>{
					if(err) return reject(err);
					return resolve(results);
				})
			});
			let query = "";
			if(input.user.role == "ALPHA_ADMIN"){
				query += "INSERT INTO response(user_id, alt_id, encourages, final, response) VALUES ("
				+ [input.user._id, input.appointmentId, input.encourages, 1, ("'" + input.response + "'")].join(",") + ");";
				let creator = await executeQuery("SELECT * FROM user WHERE _id=" + appointment.creator_id);
				let involved = await executeQuery("SELECT * FROM next_to_approve INNER JOIN user ON next_to_approve.user_id=user._id WHERE alt_id=" + appointment._id + ";");
				involved.forEach(involvedUser=>{
					if(input.user._id==involvedUser._id)
						return ;
					query+="INSERT INTO response(user_id, alt_id) VALUES ("
					+ [involvedUser._id, input.appointmentId].join(",")+");"
				})
				query+="DELETE FROM next_to_approve WHERE alt_id=" + input.appointmentId + ";";
				await executeQuery("UPDATE alt SET status='"
					+ (input.encourages?"APPROVED":"DECLINED")
					+ "' WHERE _id=" + input.appointmentId);
				let nextMails = await findMailsOfInvolved({id: input.appointmentId});
				mail.sendFinal({id: input.appointmentId,
					type: type,
					user:input.user,
					response: input.response,
					encourages: input.encourages,
					emailIds: [...nextMails, creator[0].email]});
			}else{
				let nextMails = [];
				let alphaAdmins = await executeQuery("SELECT * FROM user WHERE role='ALPHA_ADMIN';");
				if(config.follow_hierarchy){
					if(input.encourages){
						query += "INSERT INTO response(user_id, alt_id, encourages, response) VALUES ("
							+ [input.user._id, input.appointmentId, input.encourages, ("'" + input.response + "'")].join(",") + ");"
						alphaAdmins.forEach(alpha=>{
							query+="INSERT INTO next_to_approve(user_id,alt_id) VALUES("
							+ alpha._id + "," + appointment._id
							+");"
							nextMails.push(alpha.email);
						});
						let involved = await findMailsOfInvolved({id: input.appointmentId});
						mail.changed({
							id: input.appointmentId,
							type: type,
							user:input.user,
							response: input.response,
							encourages: input.encourages,
							emailIds: [...nextMails, ...involved]
						});
					}else{
						let nextMails = await findMailsOfInvolved({id: input.appointmentId});
						let creator = await executeQuery("SELECT * FROM user WHERE _id=" + appointment.creator_id);
						query += "INSERT INTO response(user_id, alt_id, encourages, final, response) VALUES ("
							+ [input.user._id, input.appointmentId, input.encourages, 1, ("'" + input.response + "'")].join(",") + ");"
						mail.sendFinal({
							id: input.appointmentId,
							type: type,
							user:input.user,
							response: input.response,
							encourages: input.encourages,
							emailIds: [...nextMails, creator[0].email]
						})
						await executeQuery("UPDATE alt SET status='DECLINED' WHERE _id=" + input.appointmentId);
					}
				}else{
					let involved = await findMailsOfInvolved({id: input.appointmentId});
					query += "INSERT INTO response(user_id, alt_id, encourages, final, response) VALUES ("
							+ [input.user._id, input.appointmentId, input.encourages, 1, ("'" + input.response + "'")].join(",") + ");"
					mail.changed({
						id: input.appointmentId,
						type: type,
						user:input.user,
						response: input.response,
						encourages: input.encourages,
						emailIds: involved
					})
				}
				query+="DELETE FROM next_to_approve WHERE user_id=" + input.user._id
				+ " AND alt_id=" + input.appointmentId + ";";
			}
			await executeQuery(query);
			return done(null, "Updated Successfully");
		}catch(err){
			return done(err);
		}
	}
}