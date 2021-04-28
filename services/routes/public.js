const bcrypt = require('bcrypt');
const passport = require('passport');
const database = require('../database/database.js');
const {NewUser} = require('../controller.js');

function respondError(err, res){
    console.error(err);
    let message;
    if(err.code == 'ER_BAD_NULL_ERROR')
        message = err.sqlMessage;
    else if(err.code=='ER_DUP_ENTRY' && (/for key 'user.email'/).test(err.message))
        message = "User already exists";
    else
        message = err.message || err;
    res.status(400).json({error: message});
}

module.exports = function(app){
    
    app.route('/login')
    .get((req, res)=>{
        res.status(400).sendFile(process.cwd() + '/build/index.html');
    })
    
    app.route('/api/login')
    .post(passport.authenticate('local', {failureRedirect: '/failure', failureFlash: true}), (req, res)=>{
        res.status(200).send(req.user.getPublicInfo());
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