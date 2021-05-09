let {executeQuery, findMailsOfInvolved} = require('./index.js');
let {deleted: sendDeletedMail} = require('../mail.js');

module.exports = {
    UserWithHash: function(hash){
        return new Promise(async(resolve, reject)=>{
            try{
                await executeQuery("DELETE FROM hash WHERE hash='" + hash + "';");
                resolve(hash);
            }catch(err){
                reject(err);
            }
        })
    },

    appointment: function(input){
        return new Promise(async (resolve, reject)=>{
            try{
                let appointment = await executeQuery("SELECT * FROM alt WHERE _id=" + input.appointmentId + ";")
                let type = "";
                let typeId;
                if(appointment.length < 1)
                    return reject(new Error("Appointment not found"))
                if(appointment[0].creator_id==input.user.id){
                    //find type
                    for(let key in appointment[0]){
                        if(key=="creator_id" || key=="_id" || key=="ou_id")
                            continue;
                        if((/_id$/g).test(key) && appointment[0][key]){
                            type = key.replace("_id", "");
                            typeId = appointment[0][key];
                        }
                    }
                    if(!type)
                        return reject(new Error("Appointment type not found"));
                    let involved = await findMailsOfInvolved({id: input.appointmentId})
                    let emailIds = {mailCc: involved};
                    emailIds.mailTo = [input.user.email];
                    let query = "DELETE FROM next_to_approve WHERE alt_id=" + input.appointmentId + ";"
                    + "DELETE FROM response WHERE alt_id=" + input.appointmentId + ";"
                    + "DELETE FROM alt WHERE _id=" + input.appointmentId + ";"
                    + "DELETE FROM " + type + " WHERE _id=" + typeId + ";";
                    
                    await executeQuery(query);
                    await sendDeletedMail(input.appointmentId, emailIds);
                    return resolve("Deleted Successfully");
                }else
                    return resolve("Appointments can only be deleted by the creator");
            }catch(err){
                return reject(err);
            }
        })
    }
}