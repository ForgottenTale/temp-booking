const auth = require('../auth.js');
const database = require('../database/database.js');
const upload = require('../upload.js');
const { readCsv, respondError } = require('../utils.js');
const {NewUser} = require('../controller.js');

function createUser(user){
    return new Promise((resolve, reject)=>{
        try{
            let newUser = new NewUser(user);
            bcrypt.hash(newUser.password, 12, (err, hash)=>{
                newUser.password = process.env.NODE_ENV=="development"?req.body.password:hash;
                database.addUser(newUser, (err, doc)=>{
                    if(err) {
                        return reject(err);
                    };
                    return resolve(newUser.getPublicInfo());
                })
            })
        }catch(err){
            return reject(err);
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
                    readCsv(req.file.path)
                    .then(results=>{
                        Promise.all(results.map(result=>createUser(result)))
                        .then(usersInfo=>res.status(200).send(usersInfo))
                        .catch(err=>respondError(err, res));
                    })
                    .catch(err=>respondError(err, res));
                }else{
                    createUser(req.body)
                    .then(userInfo=>res.status(200).send(userInfo))
                    .catch(err=>respondError(err, res));
                }
            }catch(err){
                respondError(err, res);
            }
        })
    })
}