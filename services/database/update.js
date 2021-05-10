const {executeQuery} = require('./index.js');
const {User, getClass} = require('../controller.js');

module.exports = {
    user: function(input, done){
		executeQuery("UPDATE person INNER JOIN user ON person_id=person._id SET " + User.getValues(input).join(",") + " WHERE user._id=" + input.id + ";")
		.then(data=>{
			return done(null, "Updated Successfully");
		})
		.catch(err=>done(err));
	},

	booking: function(input, query){
		return new Promise(async (resolve, reject)=>{
			try{
				let type = query.type;
				ServiceClass = getClass(type);
				let bltBooking = await executeQuery("SELECT * FROM blt WHERE _id=" + query.id + " AND " + type + "_id IS NOT NULL");
				if(bltBooking.length<1)
					throw new Error("Booking not found");
				let values = ServiceClass.getValuesForEdit(input);
				await executeQuery("UPDATE " + type + " SET " + values.join(", ") + " WHERE _id=" + bltBooking[0][type+"_id"]);
				resolve({message: "Updated"});
			}catch(err){
				reject(err);
			}
		})
	},

	bookingStatus: async function(input, done){
		try{
			let booking = await executeQuery("SELECT * FROM blt"
				+ " INNER JOIN next_to_approve as n ON blt._id=n.blt_id"
				+ "  WHERE blt_id=" + input.bookingId +" AND n.user_id=" + input.user.id);
			if(booking.length!=1)
				if(booking.length==0)
					throw new Error("Booking doesn't exist");
				else
					throw new Error("Invalid number of bookings");
			booking = booking[0];
			let type;
			for(let key in booking){
				if(key=="user_id" || key=="_id" || key=="blt_id" || key=="creator_id")
					continue;
				if((/_id$/g).test(key) && booking[key]){
					type = key.replace("_id", "");
					typeId = booking[key];
				}
			}
			if(!type)
				return done(new Error("Booking type not found"));
			let config = await getConfig(type, booking.service_name);
			config = config[0];
			let query = "";
			
			//find groupAdmins, reviewers, globalAdmins
			let groupAdmins = await executeQuery("SELECT person_id, email FROM ou_map INNER JOIN person ON person._id=ou_map.person_id "
				+ " WHERE ou_map.ou_id=" + booking.ouId + " AND ou_map.admin=1;"
			);
			let reviewers = await executeQuery("SELECT person._id, person.email FROM reviewer_map "
				+ " INNER JOIN user ON user_id=user._id"
				+ " INNER JOIN person ON person_id=user.person_id"
				+ " WHERE service_id=" + config._id
			);
			let globalAdmins = await executeQuery("SELECT _id, email FROM person WHERE role='GLOBAL_ADMIN';");

			for(let i in groupAdmins){
				if(groupAdmins[i].person_id == input.user.person_id){
					
				}
			}
			if(input.user.role == "ALPHA_ADMIN"){
				query += "INSERT INTO response(user_id, blt_id, encourages, final, response) VALUES ("
				+ [input.user._id, input.bookingId, input.encourages, 1, ("'" + input.response + "'")].join(",") + ");";
				let creator = await executeQuery("SELECT * FROM user WHERE _id=" + booking.creator_id);
				let involved = await executeQuery("SELECT * FROM next_to_approve INNER JOIN user ON next_to_approve.user_id=user._id WHERE blt_id=" + booking._id + ";");
				involved.forEach(involvedUser=>{
					if(input.user._id==involvedUser._id)
						return ;
					query+="INSERT INTO response(user_id, blt_id) VALUES ("
					+ [involvedUser._id, input.bookingId].join(",")+");"
				})
				query+="DELETE FROM next_to_approve WHERE blt_id=" + input.bookingId + ";";
				await executeQuery("UPDATE blt SET status='"
					+ (input.encourages?"APPROVED":"DECLINED")
					+ "' WHERE _id=" + input.bookingId);
				let nextMails = await findMailsOfInvolved({id: input.bookingId});
				mail.sendFinal({id: input.bookingId,
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
						query += "INSERT INTO response(user_id, blt_id, encourages, response) VALUES ("
							+ [input.user._id, input.bookingId, input.encourages, ("'" + input.response + "'")].join(",") + ");"
						alphaAdmins.forEach(alpha=>{
							query+="INSERT INTO next_to_approve(user_id,blt_id) VALUES("
							+ alpha._id + "," + booking._id
							+");"
							nextMails.push(alpha.email);
						});
						let involved = await findMailsOfInvolved({id: input.bookingId});
						mail.changed({
							id: input.bookingId,
							type: type,
							user:input.user,
							response: input.response,
							encourages: input.encourages,
							emailIds: [...nextMails, ...involved]
						});
					}else{
						let nextMails = await findMailsOfInvolved({id: input.bookingId});
						let creator = await executeQuery("SELECT * FROM user WHERE _id=" + booking.creator_id);
						query += "INSERT INTO response(user_id, blt_id, encourages, final, response) VALUES ("
							+ [input.user._id, input.bookingId, input.encourages, 1, ("'" + input.response + "'")].join(",") + ");"
						mail.sendFinal({
							id: input.bookingId,
							type: type,
							user:input.user,
							response: input.response,
							encourages: input.encourages,
							emailIds: [...nextMails, creator[0].email]
						})
						await executeQuery("UPDATE blt SET status='DECLINED' WHERE _id=" + input.bookingId);
					}
				}else{
					let involved = await findMailsOfInvolved({id: input.bookingId});
					query += "INSERT INTO response(user_id, blt_id, encourages, final, response) VALUES ("
							+ [input.user._id, input.bookingId, input.encourages, 1, ("'" + input.response + "'")].join(",") + ");"
					mail.changed({
						id: input.bookingId,
						type: type,
						user:input.user,
						response: input.response,
						encourages: input.encourages,
						emailIds: involved
					})
				}
				query+="DELETE FROM next_to_approve WHERE user_id=" + input.user._id
				+ " AND blt_id=" + input.bookingId + ";";
			}
			await executeQuery(query);
			return done(null, "Updated Successfully");
		}catch(err){
			return done(err);
		}
	}
}