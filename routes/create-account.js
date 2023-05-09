const express = require('express');
const speakeasy = require('speakeasy')
const createAccountRouter = express();
const eh = express();
const session = require('express-session');
const flash = require('express-flash');
const db = require('../db/index');
const qrcode = require('qrcode')
const jwt = require('jsonwebtoken')
const { expressjwt: jw } = require('express-jwt')


createAccountRouter.get('/', (req, res) => {
    res.render('create-account');
});



createAccountRouter.use(flash())

createAccountRouter.use(session({
    secret: 'oogabooga',
    resave: false,
    saveUninitialized: false
}))

createAccountRouter.post('/create-account', (req, res) => {
    let { username, email, password, confirmpassword } = req.body;

    const secret = speakeasy.generateSecret()

    console.log({
        username,
        email,
        password,
        confirmpassword
    });

    db.query(
        `SELECT * FROM users
        WHERE email = $1`, [email], (err, results) => {
            if (err){
                throw err
            }
        }
    )


    
    
    db.query( 
        `INSERT INTO users (username, email, password, secret) 
        VALUES ($1, $2, $3, $4)
        RETURNING user_id, password`, [username, email, password, secret], (err, results) => {
            if (err){
                throw err
            }
            console.log(results.rows);
            req.flash("success", "Account registered. You can now log in")
            res.redirect('/')
        }
    )
})


module.exports = createAccountRouter;