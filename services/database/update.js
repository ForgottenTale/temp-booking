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

	appointment: function(input, query){
		return new Promise(async (resolve, reject)=>{
			try{
				let type = query.type;
				AppointmentClass = getClass(type);
				let altAppointment = await executeQuery("SELECT * FROM alt WHERE _id=" + query.id);
				let values = AppointmentClass.getValuesForEdit(input);
				await executeQuery("UPDATE " + type + " SET " + values.join(", ") + " WHERE _id=" + altAppointment[0][type+"_id"]);
				resolve({message: "Updated"});
			}catch(err){
				reject(err);
			}
		})
	}
}