const express = require('express');
const speakeasy = require('speakeasy')
const createAccountRouter = express();
const session = require('express-session');
const flash = require('express-flash');
const db = require('../db/index');

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
 
        const secret = speakeasy.generateSecret() //won't be in final code
        
        db.query( 
            `INSERT INTO users (username, email, password, secret) 
            VALUES ($1, $2, $3, $4)
            RETURNING user_id, password`, [username, email, password, secret.base32], (err, results) => {
                    if (err){
                        throw err
                    }
                    console.log(results.rows);
                    req.flash("success", "Account registered. You can now log in")
                    res.redirect('/')
                }
            )

});

module.exports = createAccountRouter;