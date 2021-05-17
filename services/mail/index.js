const nodemailer = require("nodemailer");
const finalApproval = require('./templates/finalApproval.js');
const finalDeclined = require('./templates/finalDeclined.js');
const reviewRequest = require('./templates/reviewRequest.js');
const createAccount = require('./templates/createAccount.js');
const newBooking = require('./templates/newBooking.js');

let transporterData;
if(process.env.NODE_ENV=="testing"){
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
}else if(process.env.NODE_ENV=="production" || process.env.NODE_ENV=="development"){
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
    if(emailIds.mailCc)
        if(emailIds.mailCc.length>0 && emailIds.mailTo.length>0)
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
    sendSuperMail: async function(err){
        try{
            let transporter = nodemailer.createTransport(transporterData);
            let data = {
                subject: "Mail Error",
                html: "<b>" + err.message||err+ "</b>"
            }
            data.from = '<' + transporterData.auth.user + '>';
            data.to= process.env.SUPER_EMAIL;
            let info = await transporter.sendMail(data);
            logMailInfo({mailTo: data.to}, info.messageId, nodemailer.getTestMessageUrl(info));
            return ("Message send");
        }catch(err){
            console.error(err);
        }
    },

    accountInitiated: async function(input, emailIds){
        try{
            let transporter = nodemailer.createTransport(transporterData);
            let data = createAccount(input);
            data.from = '<' + transporterData.auth.user + '>';
            data.to= emailIds.mailTo;
            data.cc= emailIds.mailCc;
            let info = await transporter.sendMail(data);
            logMailInfo(emailIds, info.messageId, nodemailer.getTestMessageUrl(info));
            return ("Message send");
        }catch(err){
            console.error(err);
            module.exports.sendSuperMail(err);
        }
    },

    finalApproval: async function(input, emailIds){
        try{
            emailIds = removeRepeated(emailIds);
            let transporter = nodemailer.createTransport(transporterData);
            let data = finalApproval(input);
            data.from = '<' + transporterData.auth.user + '>';
            data.to= emailIds.mailTo;
            data.cc= emailIds.mailCc;
            let info = await transporter.sendMail(data);
            logMailInfo(emailIds, info.messageId, nodemailer.getTestMessageUrl(info));
            return ("Message send");
        }catch(err){
            console.error(err);
            module.exports.sendSuperMail(err);
        }
    },

    finalDeclined: async function(input, emailIds){
        try{
            emailIds = removeRepeated(emailIds);
            let transporter = nodemailer.createTransport(transporterData);
            let data = finalDeclined(input);
            data.from = '<' + transporterData.auth.user + '>';
            data.to= emailIds.mailTo;
            data.cc= emailIds.mailCc;
            let info = await transporter.sendMail(data);
            logMailInfo(emailIds, info.messageId, nodemailer.getTestMessageUrl(info));
            return ("Message send");
        }catch(err){
            console.error(err);
            module.exports.sendSuperMail(err);
        }
    },

    forgotPassword: async function(input, emailIds){
        try{
            let transporter = nodemailer.createTransport(transporterData);
            let data = {subject: "forgot password", html: `<span>${input.link}</span>`};
            data.from = '<' + transporterData.auth.user + '>';
            data.to= emailIds.mailTo;
            data.cc= emailIds.mailCc;
            let info = await transporter.sendMail(data);
            logMailInfo(emailIds, info.messageId, nodemailer.getTestMessageUrl(info));
            return ("Message send");
        }catch(err){
            console.error(err);
            module.exports.sendSuperMail(err);
        }
    },

    newBooking: async function(input, emailIds){
        try{
            emailIds = removeRepeated(emailIds);
            let transporter = nodemailer.createTransport(transporterData);
            let data = newBooking(input);
            data.from = '<' + transporterData.auth.user + '>';
            data.to= emailIds.mailTo;
            data.cc= emailIds.mailCc;
            let info = await transporter.sendMail(data);
            logMailInfo(emailIds, info.messageId, nodemailer.getTestMessageUrl(info));
            return ("Message send");
        }catch(err){
            console.error(err);
            module.exports.sendSuperMail(err);
        }
    },

    reviewRequest: async function(input, emailIds){
        try{
            emailIds = removeRepeated(emailIds);
            let transporter = nodemailer.createTransport(transporterData);
            let data = reviewRequest(input);
            data.from = '<' + transporterData.auth.user + '>';
            data.to= emailIds.mailTo;
            data.cc= emailIds.mailCc;
            let info = await transporter.sendMail(data);
            logMailInfo(emailIds, info.messageId, nodemailer.getTestMessageUrl(info));
            return ("Message send");
        }catch(err){
            console.error(err);
            module.exports.sendSuperMail(err);
        }
    },

    // deleted: function(id, emailIds){
    //     return new Promise(async(resolve, reject)=>{
    //         let transporter = nodemailer.createTransport(transporterData);
    //         try{
    //             emailIds = removeRepeated(emailIds);
    //             let info = await transporter.sendMail({
    //                 from: '<' + transporterData.auth.user + '>',
    //                 to: emailIds.mailTo,
    //                 cc: emailIds.mailCc,
    //                 subject: "Appointment #" + id + " has been deleted",
    //                 html: "<span>Appointment # " + id + " has been deleted by its creator </span>"
    //             })
    //             logMailInfo(emailIds, info.messageId, nodemailer.getTestMessageUrl(info));
    //             resolve("Message Send");
    //         }catch(err){
    //             reject(err);
    //         }
    //     })
    // }
}