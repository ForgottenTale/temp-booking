const bcrypt = require('bcrypt');
const passport = require('passport');
const get = require('../database/get.js');
const del = require('../database/del.js');
const insert = require('../database/insert.js');
const {respondError} = require('../utils.js');

module.exports = function(app){
    
    app.route('/login')
    .get((req, res)=>{
        res.status(400).sendFile(process.cwd() + '/build/index.html');
    })
    
    app.route('/api/login')
    .post(passport.authenticate('local', {failureRedirect: '/failure', failureFlash: true}), (req, res)=>{
        res.status(200).send(req.user.getPublicInfo());
    })

    app.route('/api/create-account/:hash')
    .post((req, res)=>{
        get.UserWithHash(req.params.hash)
        .then(person=>{
            bcrypt.hash(req.body.password, 12, (err, hash)=>{
                if(err) return respondError(err, res);
                person.password = process.env.NODE_ENV=="development"?req.body.password:hash;
                insert.userAccount(person)
                .then(person=>{
                    del.UserWithHash(req.params.hash);
                    res.status(200).send(person.getPublicInfo());
                })
                .catch(err=>respondError(err, res));
            })
        })
        .catch(err=>respondError(err, res));
    })

    app.route('/api/calendar')
    .get((req, res)=>{
        if(!req.query.month || !req.query.year)
            return respondError(new Error('query parameters missing'), res);
        req.query.year = Number(req.query.year);
        req.query.month = Number(req.query.month);
        let startTime = new Date(req.query.year, req.query.month, 1);
        let endTime = new Date(req.query.year, req.query.month + 1, 1);
        database.getCalendarData({startTime, endTime, type: 'online_meeting'}, (err, result)=>{
            if(err) return respondError(err, res);
            res.status(200).json(result);
        });
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