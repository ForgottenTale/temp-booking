const auth = require('../auth.js');
const {getClass, User} = require('../controller.js');
const { checkAvailability } = require('../database/index.js');
const {booking: addBooking} = require('../database/insert.js');
const {ou: getOu, bookings: getBookings, activity: getActivity} = require('../database/get.js');
const {user: updateUser, booking: updateBooking} = require('../database/update.js')
const {booking: delBooking} = require('../database/del.js');
const upload = require('../upload.js');
const {respondError, removeImg} = require('../utils.js');

module.exports = function(app){

    app.route('/api/my-bookings')
    .get(auth.ensureAuthenticated, auth.ensureOu, (req, res)=>{
        getBookings({userId: req.user.id, ouId: req.user.activeOu.id}, (err, bookings)=>{
            if(err) return respondError(err, res);
            res.status(200).json(bookings);
        });
    })
    .delete(auth.ensureAuthenticated, auth.ensureOu, (req, res)=>{
        if(req.body.id){
            delBooking({
                user: req.user,
                bookingId: req.body.id
            })
            .then(msg=>{
                res.status(200).json({message: msg});
            })
            .catch(err=>respondError(err, res));
        }else{
            respondError('Unsupported query', res);
        }
    })
    .patch(auth.ensureAuthenticated, auth.ensureOu, (req, res)=>{
        try{
            updateBooking(req.body, req.query)
            .then(data=>res.status(200).json(data))
            .catch(err=>respondError(err, res));
        }catch(err){
            respondError(err, res);
        }
    })

    app.route('/image/:fileName')
    .get(auth.ensureAuthenticated, (req, res)=>{
        res.sendFile(process.cwd() + '/uploads/' + req.params.fileName)
    })

    app.route('/api/ou')
    .get(auth.ensureAuthenticated, (req, res)=>{
        getOu(req.user.personId, (err, results)=>{
            if(err) respondError(err, res);
            res.status(200).json(results);
        })
    })

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
                addBooking(newbooking, (err, doc)=>{
                    if(err){
                        return respondError(err, res);
                    }
                    return res.status(200).json(doc.getPublicInfo());
                })
            }
            catch(err){
                removeImg(req.body.img);
                respondError(err, res);
            }
        })
    })

    app.route('/api/check-availability')
    .post(auth.ensureAuthenticated, (req, res)=>{
        if(!req.body.type || !req.body.startTime || !req.body.endTime)
            return respondError(new Error("Required fields missing"), res)
        req.body.startTime = new Date(req.body.startTime)   ;
        req.body.endTime = new Date(req.body.endTime);
        checkAvailability(req.body)
        .then(msg=>res.status(200).json({message: msg}))
        .catch(err=>respondError(err, res));
    })

    app.route('/api/user')
    .patch(auth.ensureAuthenticated, (req, res)=>{
        req.body.id = req.user.id;
        updateUser(req.body, (err, result)=>{
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
        
        getActivity(req.query.ouId, (err, results)=>{
            if(err) return respondError(err, res);
            res.status(200).json(results);
        })
    })
}