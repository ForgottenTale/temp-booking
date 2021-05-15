const bcrypt = require('bcrypt');
const passport = require('passport');
const database = require('../database/index.js');
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
                    person.password = process.env.NODE_ENV=="development"?req.body.password:hash;
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
            let startTime = new Date(('0' + req.query.year).slice(-4) + "-" + ('0' + req.query.month).slice(-2) + "-01T00:00:00Z");
            let endTime = new Date(('0' + req.query.year).slice(-4) + "-" + ('0' +(req.query.month+1)%12).slice(-2) + "-01T00:00:00Z");
            database.getCalendarData({startTime, endTime})
            .then(result=>res.status(200).json(result))
            .catch(err=>respondError(err, res));
        }catch(err){
            respondError(err, res);
        }
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