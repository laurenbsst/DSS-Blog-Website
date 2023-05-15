const express = require('express');
const loginRouter = express();
const session = require('express-session');
const flash = require('express-flash');




loginRouter.use(flash())

loginRouter.use(session({
    secret: 'oogabooga',
    resave: false,
    saveUninitialized: false
}))


module.exports = loginRouter; 