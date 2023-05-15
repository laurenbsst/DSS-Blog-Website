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
const { verifyPassword, hashedPassword } = require("../public/hashing")


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

    db.query('SELECT * FROM users WHERE username = $1', [username], (err, re) => {

        if(re.rows[0] === undefined){
           wait(28)
            res.redirect('/')
        }
        else {
            id = re.rows[0].user_id;
            
            let storedSalt = re.rows[0].salt;
            var storedPassword = re.rows[0].password;
            if(verifyPassword(password, storedPassword, storedSalt) === true){
                console.log(loggedin)
                res.redirect('/tfa')
                res.end()
            }
            else {
                 res.redirect('/')       
            }
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
    
          // Special characters pattern to test against
  var pattern = /[`@^*_+\-=\[\]{}\\|<>\/~]/;

  // If search query contains special characters
  if (pattern.test(title)) {
    alert('Special characters are not allowed in post titles!')
  }
  else if(pattern.test(content)) {
    alert('Special characters are not allowed in the post contents!')
  }
  else {
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
}
});

homeRouter.post('/:user_id/search', (req, res, next) => {
    if(verify) {
        const user_id = req.params.user_id;
        const search = req.body.search;
        
        // Special characters pattern to test against
        var pattern = /[`@^*_+\-=\[\]{}\\|<>\/~]/;

        // If search query contains special characters
        if (pattern.test(search)) {
            alert('Special characters are not allowed! Please try a different search query.')
        }
        else {
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
}
});
  
homeRouter.get('/:user_id/:post_id/view', (req, res, next) => {
    const user_id = req.params.user_id;
    const post_id = req.params.post_id;
  
    db.query(`SELECT * FROM posts WHERE post_id = $1`, [post_id], (err, post_result) => {
      if (err) {
        return next(err)
      }
      db.query(`SELECT user_id FROM posts WHERE post_id = $1`, [post_id], (err, user_result) => {
        const id = user_result.rows[0].user_id;
  
        db.query(`SELECT * FROM users WHERE user_id = $1`, [id], (err, final_user_result) => {
          if (err) {
            return next(err)
          }
        if (err) {
          return next(err)
        }
     
    res.render('view-post', {posts: post_result.rows, users: final_user_result.rows});
  });
  });
  });
  });



module.exports = tfa;