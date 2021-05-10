const auth = require('../auth.js');
const {getClass} = require('../controller.js');
const {allUsers: getAllUsers, userApprovals: getUserApprovals, historyOfApprovals: getHistoryOfApprovals} = require('../database/get.js');
const {appointmentStatus: updateAppointmentStatus} = require('../database/update.js');
const {respondError} = require('../utils.js');

module.exports = function(app){
    
    app.route('/protected')
    .get(auth.ensureAuthenticated, auth.ensureAdmin, (req, res)=>{
        res.sendFile(process.cwd() + '/coverage/protected.html');
    })

    app.route('/api/users')
    .get(auth.ensureAuthenticated, auth.ensureAdmin, (req, res)=>{
        getAllUsers({role: req.query.role}, (err, results)=>{
            if(err) return respondError(err, res);
            res.status(200).json(results);
        });
    })

    
    app.route('/api/my-approvals')
    .get(auth.ensureAuthenticated, auth.ensureAdmin, (req, res)=>{
        req.query.user = req.user;
        getUserApprovals(req.query, (err, results)=>{
            if(err) return respondError(err, res);
            res.status(200).json(results);
        })
    })
    .post(auth.ensureAuthenticated, auth.ensureAdmin, (req, res)=>{
        if(!req.body.id || !req.body.response || !req.body.action){
            return respondError("Requried Fields missing", res);
        }
        updateAppointmentStatus({
            user: req.user,
            appointmentId: req.body.id,
            response: req.body.response,
            encourages: req.body.action=="decline"?false:true
        }, (err, msg)=>{
            if(err) return respondError(err, res);
            res.status(200).json({message: msg})
        })
    })

    app.route('/api/my-approvals/history')
    .get(auth.ensureAuthenticated, auth.ensureAdmin, (req, res)=>{
        req.query.user = req.user;
        getHistoryOfApprovals(req.query, (err, results)=>{
            if(err) return respondError(err, res);
            res.status(200).json(results);
        })
    })
}