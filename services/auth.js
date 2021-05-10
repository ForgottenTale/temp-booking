const passport = require("passport");
const {user: getUser} = require('./database/get.js');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local');

function findAndSetOuInfo(userOus, ouId){
    if(!ouId)
            throw new Error("OuId is required");
    for(let i in userOus)
        if(userOus[i].ouId==ouId)
            return {id: id, name: userOus[i].ouName, admin: userOus[i].admin}
    throw new Error("Forbidden");
}

module.exports = {
    ensureAuthenticated: function(req, res, next){
        if(req.isAuthenticated())
            return next();
        res.redirect('/unauthorized');
    },

    ensureOu: function(req, res, next){
        if(req.user.superAdmin)
            return next();
        if(!req.activeOu)
            try{
                req.user.activeOu = findAndSetOuInfo(req.user.ous, req.query.ouId);
                return next();
            }catch(err){
                console.error(err);
                res.status(403).json({error: err.message});
            }
    },

    ensureOuAdmin: function(req, res, next){
        try{
            req.user.activeOu = findAndSetOuInfo(req.user.ous, req.query.ouId);
            if(!req.activeOu.admin)
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
            getUser({ email: id }, (err, doc) => {
                done(null, doc);
            })
        });

        passport.use(new LocalStrategy(
            function (email, password, done) {
                getUser({ email: email}, function (err, user) {
                    console.log('User ' + email + ' attempted to log in.');
                    if (err) { return done(err); }
                    if (!user) { return done(null, false, {message: 'User does not exist'}); }
                    if (process.env.NODE_ENV=="development" || process.env.NODE_ENV=="testing"){
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