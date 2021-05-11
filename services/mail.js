const nodemailer = require("nodemailer");

let transporterData;
if(process.env.NODE_ENV=="testing" || process.env.NODE_ENV=="development"){
    transporterData = {
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
            user: "alexandrea60@ethereal.email",
            pass: "TYyn4h39zEFzNZAKCk"
        },
        tls:{
            rejectUnauthorized:false
        }
    };    
}else if(process.env.NODE_ENV=="production"){
    transporterData = {
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD
        },
        tls:{
            rejectUnauthorized:false
        }
    };
}

console.log("Mail: ", transporterData.auth.user || "INACTIVE");

function removeRepeated(emailIds){
    emailIds.mailCc = emailIds.mailCc.reduce((total, email)=>{
        if(total.indexOf(email)==-1 && emailIds.mailTo.indexOf(email)==-1)
            total.push(email);
        return total;
    }, []);
    return emailIds;
}

function logMailInfo(emailIds, messageId, testUrl){
    console.log("Mail sent to:", emailIds);
    console.log("Message sent: %s", messageId);
    console.log("Preview URL: %s", testUrl);
}

module.exports= {
    accountInitiated: function(person, link){
        return new Promise(async(resolve, reject)=>{
            let transporter = nodemailer.createTransport(transporterData);
            try{
                let info = await transporter.sendMail({
                    from: '<' + transporterData.auth.user + '>',
                    to: person.email,
                    subject: "Account creation",
                    html: "An account creation has been initiated follow <a href='" + link +"'>this link</a> to complete the process"
                })
                console.log("Message Send: %s", person.email);
                console.log("Message sent: %s", info.messageId);
                console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
                resolve("message send");
            }catch(err){
                reject(err);
            }
        })
    },

    finalApproval: function(input, emailIds){
        return new Promise(async(resolve, reject)=>{
            try{
                emailIds = removeRepeated(emailIds);
                let transporter = nodemailer.createTransport(transporterData);
                let info = await transporter.sendMail({
                    from: '<' + transporterData.auth.user + '>',
                    to: emailIds.mailTo,
                    cc: emailIds.mailCc,
                    subject: "New appointment(#" + input.id + ") created and needs your approval",
                    html: "<span>An " + "something" + " needs your approval </span>"
                })
                logMailInfo(emailIds, info.messageId, nodemailer.getTestMessageUrl(info));
                resolve("Message send");
            }catch(err){
                reject(err);
            }
        })
    },
    finalDeclined: function(input, emailIds){
        return new Promise(async(resolve, reject)=>{
            try{
                emailIds = removeRepeated(emailIds);
                let transporter = nodemailer.createTransport(transporterData);
                let info = await transporter.sendMail({
                    from: '<' + transporterData.auth.user + '>',
                    to: emailIds.mailTo,
                    cc: emailIds.mailCc,
                    subject: "New appointment(#" + input.id + ") created and needs your approval",
                    html: "<span>An " + "something" + " needs your approval </span>"
                })
                logMailInfo(emailIds, info.messageId, nodemailer.getTestMessageUrl(info));
                resolve("Message send");
            }catch(err){
                reject(err);
            }
        })
    },

    newBooking: function(input, emailIds){
        return new Promise(async(resolve, reject)=>{
            try{
                emailIds = removeRepeated(emailIds);
                let transporter = nodemailer.createTransport(transporterData);
                let info = await transporter.sendMail({
                    from: '<' + transporterData.auth.user + '>',
                    to: emailIds.mailTo,
                    cc: emailIds.mailCc,
                    subject: "New appointment(#" + input.id + ") created and needs your approval",
                    html: "<span>An " + "something" + " needs your approval </span>"
                })
                logMailInfo(emailIds, info.messageId, nodemailer.getTestMessageUrl(info));
                resolve("Message send");
            }catch(err){
                reject(err);
            }
        })
    },

    approvalRequest: function(input, emailIds){
        return new Promise(async(resolve, reject)=>{
            try{
                emailIds = removeRepeated(emailIds);
                let transporter = nodemailer.createTransport(transporterData);
                let info = await transporter.sendMail({
                    from: '<' + transporterData.auth.user + '>',
                    to: emailIds.mailTo,
                    cc: emailIds.mailCc,
                    subject: "New appointment(#" + input.id + ") created and needs your approval",
                    html: "<span>An " + "something" + " needs your approval </span>"
                })
                logMailInfo(emailIds, info.messageId, nodemailer.getTestMessageUrl(info));
                resolve("Message send");
            }catch(err){
                reject(err);
            }
        })
    },

    deleted: function(id, emailIds){
        return new Promise(async(resolve, reject)=>{
            let transporter = nodemailer.createTransport(transporterData);
            try{
                emailIds = removeRepeated(emailIds);
                let info = await transporter.sendMail({
                    from: '<' + transporterData.auth.user + '>',
                    to: emailIds.mailTo,
                    cc: emailIds.mailCc,
                    subject: "Appointment #" + id + " has been deleted",
                    html: "<span>Appointment # " + id + " has been deleted by its creator </span>"
                })
                logMailInfo(emailIds, info.messageId, nodemailer.getTestMessageUrl(info));
                resolve("Message Send");
            }catch(err){
                reject(err);
            }
        })
    }
}