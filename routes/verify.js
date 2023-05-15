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


var sec = null;
var verify = false;
var id;
var loggedin = false;



tfa.use(flash())

tfa.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}))

loginRouter.get('/', (req, res) => {
    verify = false;
    res.render('login');
    console.log(verify)
});


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
                    res.redirect('/tfa')
                    res.end()
                }
                else {
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
    })     
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
                    res.redirect('/home/' + id)
                })
                
            }
            else{
                res.redirect('/tfa')
            } 
        }
    })
})

homeRouter.get('/:user_id', (req, res, next) => {
    if(verify){
        const user_id = req.params.user_id;
        db.query(`SELECT * FROM users WHERE user_id = $1`, [user_id], (err, user_result) => {
        if (err) {
            return next(err)
        }
            
        db.query(`SELECT * FROM posts WHERE user_id = $1`, [user_id], (err, post_result) => {
        if (err) {
            return next(err)
        }
            
        res.status(200);
        res.render('home', {users: user_result.rows, posts: post_result.rows});
    });
    });
    }
    else {
        res.redirect('/')
    }
});

homeRouter.get('/:user_id/new-post', (req, res, next) => {
    if(verify) {
        const user_id = req.params.user_id;
        db.query(`SELECT * FROM users WHERE user_id = $1`, [user_id], (err, user_result) => {
        if (err) {
            return next(err)
        }
        res.render('new-post', {users: user_result.rows});
        });
    }
    else {
        res.redirect('/')
    }
});


homeRouter.post('/:user_id/new-post/submit', (req, res, next) => {

    if(verify){
        const title = req.body.title;
        const content = req.body.content;
        const user_id = req.params.user_id;
    
        db.query(`SELECT * FROM users WHERE user_id = $1`, [user_id], (err, user_result) => {
        if (err) {
            return next(err)
        }
    
        db.query(`INSERT INTO "posts" ("title", "content", "user_id") VALUES ('${title}', '${content}', '${user_id}')`, (err) => {
        if(err) {
            return next(err)
        }
    
        db.query(`SELECT * FROM posts WHERE user_id = $1`, [user_id], (err, post_result) => {
            if (err) {
            return next(err)
            }
    
        res.status(201);
        alert("New post successfully created!");
        res.redirect('/home/' + user_id);
        });
    });
    });
    }
    else {
        res.redirect('/')
    }
});

homeRouter.post('/:user_id/search', (req, res, next) => {
    if(verify) {
        const user_id = req.params.user_id;
        const search = req.body.search;
    
        var first_char = search.charAt(0);
    
        db.query(`SELECT * FROM users WHERE user_id = $1`, [user_id], (err, user_result) => {
        if (err) {
            return next(err)
        }
    
        db.query(`SELECT * FROM posts WHERE title LIKE '${first_char}%'`, (err, post_result) => {
        if(err) {
            return next(err)
        }
        res.render('search-results', {users: user_result.rows, posts: post_result.rows, search: search});
        });
    });
    }
    else {
        res.redirect('/')
    }
});
  
homeRouter.get('/:user_id/:post_id/view', (req, res, next) => {
    if(verify){
    const user_id = req.params.user_id;
    const post_id = req.params.post_id;
  
    db.query(`SELECT * FROM posts WHERE user_id = $1 AND post_id = $2`, [user_id, post_id], (err, post_result) => {
      if (err) {
        return next(err)
      }
     
    res.render('view-post', {posts: post_result.rows, user_id: user_id});
    });
    }
    else {
        res.redirect('/')
    }
});



module.exports = tfa;