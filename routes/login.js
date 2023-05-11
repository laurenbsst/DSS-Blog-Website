const express = require('express');
const loginRouter = express();
const session = require('express-session');
const flash = require('express-flash');
const db = require('../db/index');




loginRouter.get('/', (req, res) => {
    res.render('login');
});

loginRouter.use(flash())

loginRouter.use(session({
    secret: 'oogabooga',
    resave: false,
    saveUninitialized: false
}))


loginRouter.post('/', (req, res, next) => {

    let { username, password } = req.body;

    if (username && password){

        db.query(`SELECT * FROM users WHERE username = $1 AND password = $2`, [username, password], function(err, results, fields) {
            if (err){
                return next(err)
            }

            //if (results.length > 0) {
                req.session.loggedin = true;
                req.session.username = username;

                res.redirect('/tfa')
            //}
            //else {
            //    res.send("Incorrect Credentials")
            //}

            //res.end();
        })
    }
})

module.exports = loginRouter;