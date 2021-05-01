const auth = require('../auth.js');
const insert = require('../database/insert.js');
const upload = require('../upload.js');
const { parseCsv, respondError, generateAccRegLink } = require('../utils.js');
const {Person} = require('../controller.js');
const {accountInitiated} = require('../mail.js');
const bcrypt = require('bcrypt');

function createPerson(person){
    return new Promise((resolve, reject)=>{
        try{
            let newPerson = new Person(person);
            insert.person(newPerson, (err, doc)=>{
                if(err) return reject(err);
                return resolve(newPerson);
            })
            // bcrypt.hash(newPerson.password, 12, (err, hash)=>{
            //     if(err) return reject(err);
            //     newPerson.password = process.env.NODE_ENV=="development"?req.body.password:hash;
            // })
        }catch(err){
            err.person = person;
            err.message += " with email " + person.email;
            return reject(err);
        }
    })
}

function initiateUser(person){
    return new Promise(async (resolve, reject)=>{
        try{
            person = await createPerson(person);
            let uniqueCode = await insert.uniqueCode(person._id);
            await accountInitiated(person, generateAccRegLink(uniqueCode));
            resolve(person.getPublicInfo());
        }catch(err){
            reject(err);
        }
    })
}

module.exports = function(app){
    app.route('/api/register')
    .put(auth.ensureAuthenticated, auth.ensureSuperAdmin, (req, res)=>{
        upload.single('users')(req, res, (err)=>{
            if(err) return respondError(err, res);
            try{
                if(req.file){
                    parseCsv(req.file.path)
                    .then(results=>{
                        Promise.all(results.map(result=>initiateUser(result)))
                        .then(usersInfo=>res.status(200).send(usersInfo))
                        .catch(err=>respondError(err, res));
                    })
                    .catch(err=>respondError(err, res));
                }else{
                    initiateUser(req.body)
                    .then(userInfo=>res.status(200).send(userInfo))
                    .catch(err=>respondError(err, res));
                }
            }catch(err){
                respondError(err, res);
            }
        })
    })
}