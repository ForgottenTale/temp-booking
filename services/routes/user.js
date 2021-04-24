const auth = require('../auth.js');
const {getClass, User} = require('../controller.js');
const database = require('../database/database.js');
const upload = require('../upload.js');
const fs = require('fs');

function respondError(err, res){
    console.error(err);
    res.status(400).json({error: err.message || err});
}

function removeImg(imgName){
    fs.unlink(("/uploads/" + imgName), err=>{
        if(err)
            console.error(err);
        else
            console.log()
    })
}

module.exports = function(app){

    app.route('/api/my-appointments')
    .get(auth.ensureAuthenticated, (req, res)=>{
        database.getUserAppointments({userId: req.user._id}, (err, appointments)=>{
            if(err) return respondError(err, res);
            res.status(200).json(appointments);
        });
    })
    .delete(auth.ensureAuthenticated, (req, res)=>{
        if(req.body.id){
            database.removeAppointment({
                user: req.user,
                appointmentId: req.body.id
            }, (err, msg)=>{
                if(err) return respondError(err, res);
                res.status(200).json({message: msg});
            })
        }else{
            respondError('Unsupported query', res);
        }
    })

    app.route('/image/:fileName')
    .get(auth.ensureAuthenticated, (req, res)=>{
        res.sendFile(process.cwd() + '/uploads/' + req.params.fileName)
    })

    app.route('/book/appointment')
    .get(auth.ensureAuthenticated, (req, res)=>{
        res.sendFile(process.cwd() + '/coverage/new_appointment.html');
    })
    app.route('/api/book')
    .post(auth.ensureAuthenticated, (req, res)=>{
        upload.single('img')(req, res, (err)=>{
            try{
                if(err) throw err;
                let newAppointment;

                if(req.body.type == "publicity")
                    req.body.publishTime = req.body.startTime;
                req.body.img = req.file?req.file.filename:null;
                req.body.creatorId = req.user._id;
                AppointmentClass= getClass(req.body.type);
                newAppointment = new AppointmentClass(req.body);
                database.addAppointment(newAppointment, (err, doc)=>{
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

    app.route('/api/check-availability')
    .post(auth.ensureAuthenticated, (req, res)=>{
        if(!req.body.type || !req.body.startTime || !req.body.endTime)
            return respondError(new Error("Required fields missing"), res)
        req.body.startTime = new Date(req.body.startTime)   ;
        req.body.endTime = new Date(req.body.endTime);
        database.checkAvailability(req.body, (err, msg)=>{
            if(err) return respondError(err, res);
            res.status(200).json({message: msg});
        });
    })

    app.route('/api/user')
    .patch(auth.ensureAuthenticated, (req, res)=>{
        req.body.id = req.user._id;
        database.updateUser(req.body, (err, result)=>{
            if(err) return respondError(err, res);
            res.status(200).json({message: result});
        });
    })

    app.route('/api/credentials')
    .get(auth.ensureAuthenticated, (req, res)=>{
        let user = new User(req.user);
        res.status(200).json(Object.assign({}, {id: req.user._id}, user.getPublicInfo()));
    })

    app.route('/api/activity')
    .get(auth.ensureAuthenticated, (req, res)=>{
        database.getActivity((err, results)=>{
            if(err) return respondError(err, res);
            res.status(200).json(results);
        })
    })
}