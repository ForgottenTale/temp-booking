const express = require('express');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
require('dotenv').config();
const database = require('./services/database/database.js');
const routes = require('./services/routes/index.js');
const auth = require('./services/auth.js');
var cors = require('cors');
const app = express();
app.use(cors({
    origin: 'http://localhost:3000',
    credentials:true
}));
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
app.get("/hi", (req, res) => {
    res.send("Hi")
})


database.connect((err)=>{
    if(err){
        console.error(err);
        throw err;
    }
    auth.setStrategies(app);
    routes(app);

    app.listen(process.env.PORT || 3000, ()=> console.log('listening on Port', process.env.PORT));
});