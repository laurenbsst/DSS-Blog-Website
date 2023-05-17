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
const uuid = require('uuid');
const {encryptData, decryptData} = require('../public/encryption');
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


        const id = uuid.v4()
        const secret = speakeasy.generateSecret()
        let errors = []

        console.log({
            username,
            email,
            password,
            confirmpassword
        });
        
        if(password != confirmpassword){
            errors.push({ message: "Passwords do not match" })
        }
        if(errors.length > 0) {
            res.render('create-account', { errors })
        }

        db.query(
            `SELECT * FROM users
            WHERE email = $1`, [email], (err, results) => {
                //Throw error if existing email is found.
                if (err){
                    throw err
                }
            }
            );
    
    
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
    })

module.exports = createAccountRouter;