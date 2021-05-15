const auth = require('../auth.js');
const {getClass, User} = require('../controller.js');
const upload = require('../upload.js');
const {respondError, removeImg} = require('../utils.js');
const database = require('../database/index.js');

module.exports = function(app){

    app.route('/api/book')
    .post(auth.ensureAuthenticated, (req, res)=>{
        upload.single('img')(req, res, (err)=>{
            try{
                if(err) throw err;
                let newbooking;
                req.body.img = req.file?req.file.filename:null;
                req.body.creatorId = req.user.id;
                ServiceClass= getClass(req.body.type);
                newbooking = new ServiceClass(req.body);
                newbooking.checkRequired(newbooking);
                database.addBooking(newbooking, {email: req.user.email, personId: req.user.personId}, (err, doc)=>{
                    if(err){
                        return respondError(err, res);
                    }
                    return res.status(200).json(doc);
                })
            }
            catch(err){
                removeImg(req.body.img);
                respondError(err, res);
            }
        })
    })

    app.route('/api/bookings/:id')
    .get(auth.ensureAuthenticated, auth.ensureOu, (req, res)=>{
        database.getBookings({userId: req.user.id, ouId: req.user.activeOu.id, bookingId: req.params.id}, (err, bookings)=>{
            if(err) return respondError(err, res);
            res.status(200).json(bookings);
        });
    })
    .delete(auth.ensureAuthenticated, auth.ensureOu, (req, res)=>{
        if(req.params.id){
            if(req.query.cancel == "true"){
                database.cancelBooking({user: req.user, bookingId: req.params.id})
                .then(msg=>res.status(200).json({message: msg}))
                .catch(err=>respondError(err, res));
            }else{
                database.delBooking({user: req.user, bookingId: req.params.id})
                .then(msg=>res.status(200).json({message: msg}))
                .catch(err=>respondError(err, res));
            }
        }else{
            respondError(new Error("Id is required as param"), res);
        }
    })
    .patch(auth.ensureAuthenticated, auth.ensureOu, (req, res)=>{
        try{
            database.updateBooking(req.body, req.params.id, req.user.activeOu.id)
            .then(data=>res.status(200).json(data))
            .catch(err=>respondError(err, res));
        }catch(err){
            respondError(err, res);
        }
    })

    app.route('/api/bookings')
    .get(auth.ensureAuthenticated, auth.ensureOu, (req, res)=>{
        database.getBookings({userId: req.user.id, ouId: req.user.activeOu.id}, (err, bookings)=>{
            if(err) return respondError(err, res);
            res.status(200).json(bookings);
        });
    })

    app.route('/api/check-availability')
    .post(auth.ensureAuthenticated, (req, res)=>{
        if(!req.body.type || !req.body.startTime || !req.body.endTime)
            return respondError(new Error("Required fields missing"), res)
        req.body.startTime = new Date(req.body.startTime)   ;
        req.body.endTime = new Date(req.body.endTime);
        database.checkAvailability(req.body)
        .then(msg=>res.status(200).json({message: msg}))
        .catch(err=>respondError(err, res));
    })

    app.route('/image/:fileName')
    .get(auth.ensureAuthenticated, (req, res)=>{
        res.sendFile(process.cwd() + '/uploads/' + req.params.fileName);
    })

    app.route('/api/ous')
    .get(auth.ensureAuthenticated, (req, res)=>{
        database.getOu(req.user.personId, (err, results)=>{
            if(err) respondError(err, res);
            res.status(200).json(results);
        })
    })

    app.route('/api/user')
    .patch(auth.ensureAuthenticated, (req, res)=>{
        database.updateUser(req.body, req.user.id, (err, result)=>{
            if(err) return respondError(err, res);
            res.status(200).json({message: result});
        });
    })

    app.route('/api/credentials')
    .get(auth.ensureAuthenticated, (req, res)=>{
        res.status(200).json(req.user.getPublicInfo());
    })

    app.route('/api/activity')
    .get(auth.ensureAuthenticated, (req, res)=>{
        database.getActivity(req.user.id, (err, results)=>{
            if(err) return respondError(err, res);
            res.status(200).json(results);
        })
    })

    app.route('/api/feedback')
    .put(auth.ensureAuthenticated, (req, res)=>{
        database.addFeedback(req.body, req.user.id, (err, msg)=>{
            if(err) return respondError(err, res);
            res.status(200).json({message: msg});
        })
    })
}