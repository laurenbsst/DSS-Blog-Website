const speakeasy = require("speakeasy")
const express = require("express")
const tfa = express()
const flash = require('express-flash');
const session = require('express-session');
const qrcode = require('qrcode')
const db = require('../db/index');

var sec;
var verify;


tfa.use(flash())

tfa.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}))

tfa.get('/', (req, res, next) => {
    
    db.query(`SELECT secret FROM users`, (req, re) => {
        
        sec = re.rows[0].secret
        const otpauthURL = speakeasy.otpauthURL({ secret: sec, label: '2FA-Blog', encoding: 'base32'})
        //console.log(re.rows[0].secret)
        console.log(otpauthURL)
    //    const a = String(JSON.stringify(res.rows[0].secret))

    //    console.log(a)

        qrcode.toDataURL(otpauthURL, function(err, data) {
            //console.log(data)  
            
            res.render('tfa', { qr: data });
                   
        })    

        
        //if (err) {
        //  throw err
    
    })    //}  
    
});





//console.log(secret)


tfa.post('/tfa', (req, res, next) => {

    let { code } = req.body

    db.query(`SELECT secret FROM users`, (req, re) => {
        
        console.log(re.rows[0].secret)

        verify = speakeasy.totp.verify({
            secret: sec,
            encoding: 'base32',
            token: code
        })   
        console.log(verify)   
        
        if(verify){
             db.query(`SELECT user_id FROM users WHERE secret = $1`, [sec], (err, user_result) => {
                if(err) {
                    return next(err)
                }
             
                db.query(`SELECT * FROM posts WHERE user_id = $1`, [user_result], (err, post_result) => {
                    if(err) {
                        return next(err)
                    }
                res.render('home', {users: user_result.rows, posts: post_result.rows});
                });
            })
        }
        else{
            res.redirect('/tfa')
        } 
    })
})
    


module.exports = tfa;