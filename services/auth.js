const passport = require("passport");
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local');
const database = require('./database/index.js');

function findAndSetOuInfo(userOus, ouId, userId){
    return new Promise(async (resolve, reject)=>{
        let result;
        if(!ouId)
            return reject(new Error("OuId is required"));
        for(let i in userOus){
            if(userOus[i].ouId==1){
                result = {id: ouId, name: userOus[i].ouName, admin: userOus[i].ouAdmin};
                if(userOus[i].ouAdmin)
                    result.groupAdmin = true;
                break;
            }
            if(userOus[i].ouId==ouId)
                return resolve({id: ouId, name: userOus[i].ouName, admin: userOus[i].ouAdmin});
        }
        if(result){
            if(!result.groupAdmin && ouId==1){
                let temp = await database.executeQuery("SELECT user_id FROM reviewer_map WHERE user_id=" + userId);
                if(temp.length>0){
                    result.reviewer = true;
                    return resolve(result) ;
                }
            }
            return resolve(result);
        }
        return reject(new Error("Forbidden Ou Access"));
    })
}

module.exports = {
    ensureAuthenticated: function(req, res, next){
        if(req.isAuthenticated())
            return next();
        res.redirect('/unauthorized');
    },

    ensureOu: async function(req, res, next){
        if(req.user.superAdmin)
            return next();
        if(!req.activeOu)
            try{
                req.user.activeOu = await findAndSetOuInfo(req.user.ous, req.query.ouId, req.user.id);
                return next();
            }
            catch(err){
                console.error(err);
                res.status(403).json({error: err.message});
            }
    },

    ensureOuAdmin: async function(req, res, next){
        try{
            req.user.activeOu = await findAndSetOuInfo(req.user.ous, req.query.ouId, req.user.id);
            if(!req.user.activeOu.admin && !req.user.activeOu.reviewer && !req.user.activeOu.groupAdmin)
                throw new Error("Forbidden");
            return next();
        }catch(err){
            console.error(err);
            res.status(403).json({error: err.message});
        }
    },

    ensureSuperAdmin: function(req, res, next){
        if(req.user.superAdmin)
            return next();
        res.redirect('/unauthorized');
    },

    setStrategies: function (app) {
        passport.serializeUser((user, done) => {
            done(null, user.email);
        });

        passport.deserializeUser((id, done) => {
            database.getUser({ email: id }, (err, doc) => {
                done(null, doc);
            })
        });

        passport.use(new LocalStrategy(
            function (email, password, done) {
                database.getUser({ email: email}, function (err, user) {
                    console.log('User ' + email + ' attempted to log in.');
                    if (err) { return done(err); }
                    if (!user) { return done(null, false, {message: 'User does not exist'}); }
                    if (process.env.NODE_ENV=="development" || process.env.NODE_ENV=="production"){
                        if(password == user.password){
                            return done(null, user);
                        }
                    }
                    if (!bcrypt.compareSync(password, user.password)) { return done(null, false, {message: 'Wrong Password'}); }
                    return done(null, user);
                })
            }
        ))
    }
}