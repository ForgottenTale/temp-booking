const bcrypt = require('bcrypt');
const passport = require('passport');
const database = require('../database/index.js');
const mail = require('../mail/index.js');
const utils = require('../utils.js');
const {respondError} = require('../utils.js');

module.exports = function(app){
    
    app.route('/api/login')
    .post(passport.authenticate('local', {failureRedirect: '/failure', failureFlash: true}), (req, res)=>{
        res.status(200).send(req.user.getPublicInfo());
    })

    app.route('/api/create-account/:hash')
    .post((req, res)=>{
        try{
            if(!req.body.password || !req.body.confirmPassword)
                throw new Error("Required field(s) is missing");
            if(req.body.password!=req.body.confirmPassword || req.body.password.trim().length<1)
                throw new Error("Password cannot be empty");
            database.getUserWithHash(req.params.hash)
            .then(person=>{
                bcrypt.hash(req.body.password, 12, (err, hash)=>{
                    if(err) return respondError(err, res);
                    person.password = req.body.password;
                    database.addUserAccount(person)
                    .then(person=>{
                        database.delUserWithHash(req.params.hash);
                        res.status(200).send(person.getPublicInfo());
                    })
                    .catch(err=>respondError(err, res));
                })
            })
            .catch(err=>respondError(err, res));
        }catch(err){
            respondError(err, res);
        }
    })

    app.route('/api/calendar')
    .get((req, res)=>{
        try{
            if(!req.query.month || !req.query.year)
                return respondError(new Error('query parameters missing'), res);
            let endMonth = (parseInt(req.query.month)+1)%12;
            let startTime = new Date(('0' + req.query.year).slice(-4) + "-" + ('0' + req.query.month).slice(-2) + "-01T00:00:00Z");
            let endTime = new Date(('0' + req.query.year).slice(-4) + "-" + ('0' +endMonth).slice(-2) + "-01T00:00:00Z");
            database.getCalendarData({startTime, endTime})
            .then(result=>res.status(200).json(result))
            .catch(err=>respondError(err, res));
        }catch(err){
            respondError(err, res);
        }
    })

    app.route('/api/forgot-password')
    .post((req, res)=>{
        if(!req.body.email)
            return respondError(new Error("Required Fields missing"), res);
        database.getUser({email: req.body.email}, (err, result)=>{
            if(err) return respondError(err, res);
            if(result.length<1)
                return respondError(new Error("User does not exist"), res);
            let uniqueString = utils.generateUniqueString(req.body.email);
            database.addResetId(req.body.email, uniqueString, (err, message)=>{
                if(err) return respondError(err, res);
                let link = `${process.env.DOMAIN_NAME}/reset-password/${uniqueString}`;
                mail.resetPassword({link}, {mailTo: req.body.email});
                res.status(200).json({message: "Reset link sent to mail"});
            })
        })
    })

    app.route('/api/reset-password/:hash')
    .post((req, res)=>{
        database.getResetId(req.params.hash, (err, result)=>{
            if(err) return respondError(err, res);
            if(result.length<1)
                return respondError(new Error("User not found"), res);
            if(!req.body.password || !req.body.confirmPassword)
                return respondError(new Error("Required field(s) missing"), res);
            if(req.body.password != req.body.confirmPassword)
                return respondError(new Error("Passwords not matching"), res);
            if(req.body.password.length<8)
                return respondError(new Error("Passwords need to be more than 8 characters"), res);
            database.updatePassword(result[0].email, req.body.password, (err, message)=>{
                if(err) return respondError(err, res);
                database.delResetId(result[0].email);
                return res.status(200).json({message: "Password reset successful"});
            })
        })
    })

    app.route('/failure')
    .get((req, res)=>{
        res.status(401).json({error: req.flash('error')[0]});
    })

    app.route('/unauthorized')
    .get((req, res)=>{
        res.status(400).json({error: "Unauthorized"});
    })

    app.route('/api/logout')
    .get((req, res)=>{
        req.logout();
        res.sendStatus(200);
    })
}