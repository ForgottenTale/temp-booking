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

    booking: function(input){
        return new Promise(async (resolve, reject)=>{
            try{
                let booking = await executeQuery("SELECT * FROM slt WHERE _id=" + input.bookingId + ";")
                let type = "";
                let typeId;
                if(booking.length < 1)
                    return reject(new Error("Booking not found"))
                if(booking[0].creator_id==input.user.id){
                    //find type
                    for(let key in booking[0]){
                        if(key=="creator_id" || key=="_id" || key=="ou_id")
                            continue;
                        if((/_id$/g).test(key) && booking[0][key]){
                            type = key.replace("_id", "");
                            typeId = booking[0][key];
                        }
                    }
                    if(!type)
                        return reject(new Error("Booking type not found"));
                    let involved = await findMailsOfInvolved({id: input.bookingId})
                    let emailIds = {mailCc: involved};
                    emailIds.mailTo = [input.user.email];
                    let query = "DELETE FROM next_to_approve WHERE slt_id=" + input.bookingId + ";"
                    + "DELETE FROM response WHERE slt_id=" + input.bookingId + ";"
                    + "DELETE FROM slt WHERE _id=" + input.bookingId + ";"
                    + "DELETE FROM " + type + " WHERE _id=" + typeId + ";";
                    
                    await executeQuery(query);
                    await sendDeletedMail(input.bookingId, emailIds);
                    return resolve("Deleted Successfully");
                }else
                    return resolve("Bookings can only be deleted by the creator");
            }catch(err){
                return reject(err);
            }
        })
    }
}