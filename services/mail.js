const nodemailer = require("nodemailer");

let transporterData;
console.log(process.env.NODE_ENV);
if(process.env.NODE_ENV == "development"){
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
}else if(process.env.NODE_ENV=="production" || process.env.NODE_ENV=="testing"){
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

module.exports= {
    newAppointment: function(input){
        return new Promise(async(resolve, reject)=>{
            let transporter = nodemailer.createTransport(transporterData);
            let type = input.type.split("_").join(" ");
            type[0] = type[0].toUpperCase();
            try{
                let info = await transporter.sendMail({
                    from: '<' + transporterData.auth.user + '>',
                    to: input.emailIds,
                    subject: "New appointment(#" + input.id + ") created and needs your approval",
                    html: "<span>An " + type + " needs your approval </span>"
                })
                console.log("Mail sent to:", input.emailIds);
                console.log("Message sent: %s", info.messageId);
                console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
                resolve("message send");
            }catch(err){
                console.error(err);
            }
        })
    },

    deleted: function(input){
        return new Promise(async(resolve, reject)=>{
            let transporter = nodemailer.createTransport(transporterData);
            try{
                let info = await transporter.sendMail({
                    from: '<' + transporterData.auth.user + '>',
                    to: input.emailIds,
                    subject: "Appointment #" + input.id + " has been deleted",
                    html: "<span>Appointment # "+input.id+" has been deleted by its creator </span>"
                })
                
                console.log("Email sent to: ", input.emailIds);
                console.log("Message sent: %s", info.messageId);
                console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
                resolve("Message Send");
            }catch(err){
                console.error(err);
            }
        })
    },

    changed: function(input){
        return new Promise(async(resolve, reject)=>{
            let transporter = nodemailer.createTransport(transporterData);
            let subject =  input.user.name;
                subject+= (input.encourages?" en":" dis") 
                subject+= "courages Appointment #" + input.id;
            let html = "<span>"+input.user.name;
                html += input.encourages?" en":" dis" 
                html += "courages Appointment #" + input.id + " because " + input.response + " </span>";
            try{
                let info = await transporter.sendMail({
                    from: '<' + transporterData.auth.user + '>',
                    to: input.emailIds,
                    subject: subject,
                    html: html
                })
                console.log("Email sent to: ", input.emailIds);
                console.log("Message sent: %s", info.messageId);
                console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
                resolve("Message Send");
            }catch(err){
                console.error(err);
            }
        })
    },

    sendFinal: function(input){
        return new Promise(async(resolve, reject)=>{
            let transporter = nodemailer.createTransport(transporterData);
            let subject = "Appointment " + input.id + " has been"; 
                subject += input.encourages?" approved":" declined";
            let html = "<span>Appointment #" + input.id + " has been"
                html += input.encourages?" approved":" declined";
                html += " with a response <b>" + input.response +"</b></span>"
            try{
                let info = await transporter.sendMail({
                    from: '<' + transporterData.auth.user + '>',
                    to: input.emailIds,
                    subject: subject,
                    html: html
                })
                console.log("Email sent to: ", input.emailIds);
                console.log("Message sent: %s", info.messageId);
                console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
                resolve("Message Send");
            }catch(err){
                console.error(err);
            }
        })
    }
}