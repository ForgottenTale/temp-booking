const auth = require('../auth.js');
const {getClass} = require('../controller.js');
const database = require('../database/index.js');
const {respondError} = require('../utils.js');

module.exports = function(app){

    app.route('/api/users')
    .get(auth.ensureAuthenticated, auth.ensureOuAdmin, (req, res)=>{
        database.getAllUsers({role: req.query.role, ouId: req.user.activeOu.id}, (err, results)=>{
            if(err) return respondError(err, res);
            res.status(200).json(results);
        });
    })
    
    app.route('/api/approvals/:id')
    .get(auth.ensureAuthenticated, auth.ensureOuAdmin, (req, res)=>{
        req.query.user = req.user;
        database.getApprovals(req.query, req.params.id, (err, results)=>{
            if(err) return respondError(err, res);
            res.status(200).json(results);
        })
    })
    .post(auth.ensureAuthenticated, auth.ensureOuAdmin, (req, res)=>{
        if(!req.body.action){
            return respondError("Required Fields missing", res);
        }
        if(!req.body.response)
            req.body.response=="null";
        database.updateBookingStatus({
            response: req.body.response,
            encourages: req.body.action=="decline"?false:true
        }, req.params.id, req.user, (err, msg)=>{
            if(err) return respondError(err, res);
            res.status(200).json({message: msg})
        })
    })

    app.route('/api/approvals')
    .get(auth.ensureAuthenticated, auth.ensureOuAdmin, (req, res)=>{
        req.query.user = req.user;
        database.getApprovals(req.query, null, (err, results)=>{
            if(err) return respondError(err, res);
            res.status(200).json(results);
        })
    })
}