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
const {generateSalt, hashPassword } = require('../public/hashing');
const {encryptData, decryptData} = require('../public/encryption');
const uuid = require('uuid')
let alert = require('alert');

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


    var pattern = /[`@^*_+\-=\[\]{}\\|<>\/~]/;
    var patternForEmail = /[`^*_+\-=\[\]{}\\|<>\/~]/;
    // If create-account boxes contains special characters
    if (pattern.test(username)) {
        alert('Special characters are not allowed in your username!')
        res.redirect('/create-account')
    }
    else if (patternForEmail.test(email)) {
        alert('Special characters are not allowed in your email!')
        res.redirect('/create-account')
    }
    else if(pattern.test(password)) {
        alert('Special characters are not allowed in your password!')
        res.redirect('/create-account')
    }
    else if(pattern.test(confirmpassword)) {
        alert('Special characters are not allowed in your password!')
        res.redirect('/create-account')
    }
    else {

        const id = uuid.v4()
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
                //Throw error if existing email is found.
                if (err){
                    throw err
                }
            },
            'SELECT * FROM users WHERE username = $1', [username], (err, results) => {
                //Throw error if existing username is found.
                if (err) {
                    throw err
                }
            }
        )


        let salt = generateSalt();
        let hashedPassword = hashPassword(password, salt);

        db.query( 
            `INSERT INTO users (user_id, username, email, password, salt, secret) 
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING user_id, password`, [id, username, email, hashedPassword, salt, secret.base32], (err, results) => {
                if (err){
                    throw err
                }
                console.log(results.rows);
                req.flash("success", "Account registered. You can now log in")
                res.redirect('/')
            }
        )
    }
})


module.exports = createAccountRouter;