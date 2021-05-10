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

	connection: connection,

	executeQuery: executeQuery,

	getConfig: getConfig,

	findMailsOfInvolved: findMailsOfInvolved,

	getServiceTypes: function (){
		return new Promise((resolve, reject)=>{
			connection.query("SELECT DISTINCT(type) FROM service_config;", (err, results)=>{
				if(err) reject(err);
				return resolve(results);
			})
		})
	},

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