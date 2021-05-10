const auth = require('../auth.js');
const {getClass} = require('../controller.js');
const {allUsers: getAllUsers, userApprovals: getUserApprovals, historyOfApprovals: getHistoryOfApprovals} = require('../database/get.js');
const {appointmentStatus: updateAppointmentStatus} = require('../database/update.js');
const {respondError} = require('../utils.js');

module.exports = function(app){

    app.route('/api/users')
    .get(auth.ensureAuthenticated, auth.ensureOuAdmin, (req, res)=>{
        getAllUsers({role: req.query.role}, (err, results)=>{
            if(err) return respondError(err, res);
            res.status(200).json(results);
        });
    })
    
    app.route('/api/approvals')
    .get(auth.ensureAuthenticated, auth.ensureOuAdmin, (req, res)=>{
        req.query.user = req.user;
        getUserApprovals(req.query, null, (err, results)=>{
            if(err) return respondError(err, res);
            res.status(200).json(results);
        })
    })
    app.route('/api/approvals/:id')
    .get(auth.ensureAuthenticated, auth.ensureOuAdmin, (req, res)=>{
        req.query.user = req.user;
        getUserApprovals(req.query, req.params.id, (err, results)=>{
            if(err) return respondError(err, res);
            res.status(200).json(results);
        })
    })
    .post(auth.ensureAuthenticated, auth.ensureOuAdmin, (req, res)=>{
        if(!req.body.response || !req.body.action){
            return respondError("Requried Fields missing", res);
        }
        updateAppointmentStatus({
            user: req.user,
            appointmentId: req.params.id,
            response: req.body.response,
            encourages: req.body.action=="decline"?false:true
        }, (err, msg)=>{
            if(err) return respondError(err, res);
            res.status(200).json({message: msg})
        })
    })

    app.route('/api/history/approvals')
    .get(auth.ensureAuthenticated, auth.ensureOuAdmin, (req, res)=>{
        req.query.user = req.user;
        getHistoryOfApprovals(req.query, (err, results)=>{
            if(err) return respondError(err, res);
            res.status(200).json(results);
        })
    })
}