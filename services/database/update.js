const {executeQuery, getConfig, findServiceType, tryLevelUp} = require('./index.js');
const {User, getClass} = require('../controller.js');
const {approval: sendApprovalMail, rejection: sendRejectionMail, requestApproval: sendRequestApprovalMail} = require('../mail.js');

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
			let info = await tryLevelUp(bookingId, user.personId, input);
			let emailIds = {mailTo: info.nextApprovers.map(person=>person.email)};
			emailIds.mailCc = info.involved.map(person=>person.email);

			if(info.level==0){
				await executeQuery("UPDATE blt SET status='"
					+ input.encourages?"APPROVED":"DECLINED" 
				 	+ "' WHERE _id=" + bookingId);
				emailIds.mailTo.push(user.email);
				if(input.encourages)
					await sendApprovalMail({id: bookingId}, emailIds);
				else
					await sendRejectionMail({id: bookingId}, emailIds);
				return done(null, "Updated");
			}

			emailIds.mailCc.push(user.email);
			await sendRequestApprovalMail({id: bookignId}, emailIds);
		}catch(err){
			return done(err);
		}
	}
}