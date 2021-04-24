const auth = require('../auth.js');
const database = require('../database/database.js');

module.exports = function(app){
    app.route('/api/register')
    .post(auth.ensureAuthenticated, auth.ensureSuperAdmin, (req, res)=>{
        try{
            req.body.role = (req.body.role=="someone" || process.env.NODE_ENV=="production")?null:req.body.role;
            let newUser = new NewUser(req.body);
            bcrypt.hash(newUser.password, 12, (err, hash)=>{
                newUser.password = process.env.NODE_ENV=="development"?req.body.password:hash;
                database.addUser(newUser, (err, doc)=>{
                    if(err) {
                        return respondError(err, res);
                    };
                    return res.status(200).send(newUser.getPublicInfo());
                })
            })
        }catch(err){
            respondError(err, res);
        }
    })
}