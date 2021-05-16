const express = require('express');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
require('dotenv').config();
require('./services/mail/index.js');
const fs = require('fs');
const database = require('./services/database/index.js');
const routes = require('./services/routes/index.js');
const auth = require('./services/auth.js');
const app = express();
var MySQLStore = require('express-mysql-session')(session);
app.use(express.static(__dirname + '/build'));
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
var sessionStore = new MySQLStore({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    checkExpirationInterval: 900000,// How frequently expired sessions will be cleared; milliseconds.
    expiration: 86400000,// The maximum age of a valid session; milliseconds.
    createDatabaseTable: true,// Whether or not to create the sessions database table, if one does not already exist.
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
});
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
        secure: false
    }
}));
app.use(flash());
app.use(passport.initialize())
app.use(passport.session());

var access = fs.createWriteStream(process.cwd() + '/logs/'+ Date.now() + 'stdout.log');
process.stdout.write = process.stderr.write = access.write.bind(access);

database.connect((err)=>{
    if(err){
        console.error(err);
        throw err;
    }
    auth.setStrategies(app);
    routes(app);

    app.listen(process.env.PORT || 3000, ()=> console.log('listening on Port', process.env.PORT));
});