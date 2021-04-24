const protected = require('./user.js');
const public = require('./public.js');
const admin = require('./admin.js');
const superAdmin = require('./superAdmin.js');
const auth = require('../auth.js');

module.exports = function(app){
    public(app);
    protected(app);
    superAdmin(app);
    admin(app);
    app.route('/')
    .get(auth.ensureAuthenticated, (req, res)=>{
        res.redirect("/dashboard")
    })
    app.route('/images/:fileName')
    .get((req, res)=>{
        res.sendFile(process.cwd() + '/uploads/' + req.params.fileName)
    })
    app.route('*')
    .get(auth.ensureAuthenticated, (req, res)=>{
        res.sendFile(process.cwd() + '/build/index.html');
    })
    
}