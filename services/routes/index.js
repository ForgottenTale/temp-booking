const protected = require('./user.js');
const public = require('./public.js');
const admin = require('./admin.js');
const superAdmin = require('./superAdmin.js');
const auth = require('../auth.js');

module.exports = function(app){
    app.route('/')
    .get(auth.ensureAuthenticated, (req, res)=>{
        res.redirect("/dashboard")
    })
    public(app);
    protected(app);
    superAdmin(app);
    admin(app);    
    app.route('*')
    .get((req, res)=>{
        res.sendFile(process.cwd() + '/build/index.html');
    })
    
}