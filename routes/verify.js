const speakeasy = require("speakeasy")
const express = require("express")
const tfa = express()
const loginRouter = require('../routes/login')
const homeRouter = require('../routes/home')
const flash = require('express-flash');
const session = require('express-session');
const qrcode = require('qrcode')
const db = require('../db/index');
var basicAuth = require('express-basic-auth')


var sec;
var verify;
var id;
var loggedin = false;



tfa.use(flash())

tfa.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}))


loginRouter.post('/', (req, res, next) => {
    

    let { username, password } = req.body

    db.query(`SELECT * FROM users WHERE username = $1 AND password = $2`, [username, password], (err, re) => { 
        
        if(re.rows[0] === undefined){
            res.redirect('/')
        }
        
        else {
            id = re.rows[0].user_id
            
            console.log(id)

            db.query(`SELECT username, password FROM users WHERE user_id = $1`, [id], (err, result) => {
                if(err) {
                    return next(err)
                }
        
                user = result.rows[0].username
                pass = result.rows[0].password
                
            

                if (username == user && password == pass){
                    loggedin = true;
                    console.log(loggedin)
                    res.redirect('/tfa')
                    res.end()
                }
                else {
                    loggedin = false;
                    console.log(loggedin)
                    res.redirect('/')
                    res.end()
                }
                
            })
        }
    })
})



tfa.get('/', (req, res, next) => {
    
    console.log(id)
    db.query(`SELECT secret FROM users WHERE user_id = $1`, [id], (req, re) => {
        
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


tfa.post('/tfa', (req, res, next) => {

    let { code } = req.body
    
    

    db.query(`SELECT secret FROM users WHERE user_id = $1`, [id], (reque, re) => {
        
        if(re.rows[0] === undefined){
            res.redirect('/tfa')
            
        }
        else {
            console.log(re.rows[0].secret)


            verify = speakeasy.totp.verify({
                secret: sec,
                encoding: 'base32',
                token: code
            }) 
            
            if(verify){    
                db.query(`SELECT user_id FROM users WHERE secret = $1`, [sec], (err, user_result) => {
                    if(err) {
                        return next(err)
                    }
                    const id = user_result.rows[0].user_id
                    console.log(id)
                    db.query(`SELECT * FROM posts WHERE user_id = $1`, [id], (err, post_result) => {
                        if(err) {
                            return next(err)
                        }
                    });
                    //res.render('home');
                    res.redirect('/home/' + id)
                })
                
            }
            else{
                res.redirect('/tfa')
            } 
        }
    })
})

module.exports = tfa;