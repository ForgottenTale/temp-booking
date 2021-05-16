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
app.use(express.static(__dirname + '/build'));
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false
    }
}));
app.use(flash());
app.use(passport.initialize())
app.use(passport.session());

var access = fs.createWriteStream(process.cwd() + '/logs/'+ Date.now() + 'stdout.log');
process.stdout.write = process.stderr.write = access.write.bind(access);

const jwt = require('jsonwebtoken');
console.log(process.env.SESSION_SECRET);
console.log(jwt.sign({
    "iss": process.env.ZOOM_KEY,
    "exp": 1496091964000
}, 'something'
  , { algorithm: 'HS256' }));
database.connect((err)=>{
    if(err){
        console.error(err);
        throw err;
    }
    auth.setStrategies(app);
    routes(app);

    app.listen(process.env.PORT || 3000, ()=> console.log('listening on Port', process.env.PORT));
});