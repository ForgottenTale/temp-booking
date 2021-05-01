const passport = require("passport");
const database = require('./database/index.js');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local');

module.exports = {
    ensureAuthenticated: function(req, res, next){
        if(req.isAuthenticated())
            return next();
        res.redirect('/login');
    },

    ensureAdmin: function(req, res, next){
        if(req.user.role=="ALPHA_ADMIN" || req.user.role=="BETA_ADMIN" || req.user.role=="SUPER_ADMIN")
            return next();
        res.redirect('/unauthorized');
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
            database.findUser({ email: id }, (err, doc) => {
                done(null, doc);
            })
        });

        passport.use(new LocalStrategy(
            function (email, password, done) {
                database.findUser({ email: email}, function (err, user) {
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