const auth = require('../auth.js');
const {hash: insertHash, person: insertPerson} = require('../database/insert.js');
const upload = require('../upload.js');
const { parseCsv, respondError, generateAccRegLink, generateHash} = require('../utils.js');
const {Person} = require('../controller.js');
const {accountInitiated: mailAccInitiated} = require('../mail.js');

function createPerson(person){
    return new Promise((resolve, reject)=>{
        try{
            let newPerson = new Person(person);
            insertPerson(newPerson, (err, doc)=>{
                if(err) return reject(err);
                return resolve(doc);
            })
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
            if(!(/.* ALREADY EXISTS$/).test(person) && !(/.* ADDED OUS:.*/).test(person)){
                let hash = await generateHash(person.email);
                await insertHash(person.id, hash);
                await mailAccInitiated(person, generateAccRegLink(hash));
                return resolve(person.getPublicInfo());   
            }
            return resolve(person);
        }catch(err){
            reject(err);
        }
    })
}

module.exports = function(app){
    app.route('/api/register')
    .put(auth.ensureAuthenticated, auth.ensureSuperAdmin, (req, res)=>{
        upload.fields([{name: 'users'}, {name: 'groupAdmins'}])(req, res, (err)=>{
            if(err) return respondError(err, res);
            try{
                if(req.files.users){
                    parseCsv(req.files.users[0].path)
                    .then(results=>{
                        Promise.all(results.map(result=>initiateUser(result)))
                        .then(usersInfo=>res.status(200).send(usersInfo))
                        .catch(err=>respondError(err, res));
                    })
                    .catch(err=>respondError(err, res));
                }else if(req.files.groupAdmins){
                    parseCsv(req.files.groupAdmins[0].path)
                    .then(results=>{
                        Promise.all(results.map(result=>{
                            return createPerson(result);
                        }))
                        .then(usersInfo=>res.status(200).send(usersInfo))
                        .catch(err=>respondError(err, res));
                    })
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