const {executeQuery, getConfig, findServiceType, findGroupAdmins, findReviewers, findGlobalAdmins} = require('./index.js');
const {User, getClass} = require('../controller.js');

module.exports = {
    user: function(input, done){
		executeQuery("UPDATE person INNER JOIN user ON person_id=person._id SET " + User.getValues(input).join(",") + " WHERE user._id=" + input.id + ";")
		.then(data=>{
			return done(null, "Updated Successfully");
		})
		.catch(err=>done(err));
	},

	booking: function(newValues, bltId, userActiveOuId){
		return new Promise(async (resolve, reject)=>{
			try{
				let bltBooking = await executeQuery("SELECT * FROM blt WHERE _id=" + bltId + " AND ou_id=" + userActiveOuId);
				if(bltBooking.length<1)
					throw new Error("Booking not found");
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

	bookingStatus: async function(input, bookingId, user, done){
		try{
			//find booking and level
			let bltBooking = await executeQuery("SELECT * FROM blt WHERE _id=" + bookingId);

			// let booking = await executeQuery("SELECT * FROM blt"
			// 	+ " INNER JOIN next_to_approve as n ON blt._id=n.blt_id"
			// 	+ "  WHERE blt_id=" + bookingId +" AND n.person_id=" + user.personId);
			if(bltBooking.length!=1)
				if(bltBooking.length==0)
					throw new Error("Booking doesn't exist");
				else
					throw new Error("Invalid number of bookings");
			bltBooking = bltBooking[0];
			let {type, typeId} = findServiceType(bltBooking);
			let config = await getConfig(type, bltBooking.service_name);
			let query = "";
			
			//find groupAdmins, reviewers, globalAdmins
			if(config.group_restraint){
				
			}
			let groupAdmins = await findGroupAdmins(bltBooking.ou_id);
			let reviewers = await findReviewers(config._id);
			let globalAdmins = await findGlobalAdmins();

			let groupAdminApproved, reviewerApproved, globalAdminApproved;

			//if the person who approved is a group admin
			for(let i in groupAdmins){
				if(groupAdmins[i].person_id == user.personId){
					
				}
			}
			if(input.user.role == "ALPHA_ADMIN"){
				query += "INSERT INTO response(user_id, blt_id, encourages, final, response) VALUES ("
				+ [input.user._id, input.bookingId, input.encourages, 1, ("'" + input.response + "'")].join(",") + ");";
				let creator = await executeQuery("SELECT * FROM user WHERE _id=" + bltBooking.creator_id);
				let involved = await executeQuery("SELECT * FROM next_to_approve INNER JOIN user ON next_to_approve.user_id=user._id WHERE blt_id=" + bltBooking._id + ";");
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
							+ alpha._id + "," + bltBooking._id
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
						let creator = await executeQuery("SELECT * FROM user WHERE _id=" + bltBooking.creator_id);
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