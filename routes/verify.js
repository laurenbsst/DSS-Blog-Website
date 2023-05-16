const speakeasy = require("speakeasy");
const express = require("express");
const tfa = express();
const loginRouter = require('../routes/login');
const homeRouter = require('../routes/home');
const flash = require('express-flash');
const session = require('express-session');
const qrcode = require('qrcode');
const db = require('../db/index');
const uuid = require('uuid')
const basicAuth = require('express-basic-auth')
const { verifyPassword } = require("../public/hashing")
let alert = require('alert');

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

// Make sure the user isn't verified when the login screen is rendered
loginRouter.get('/', (req, res) => {
    verify = false;
    res.render('login');
    console.log(verify)
});
// When user clicks login button
loginRouter.post('/', (req, res, next) => {

    let { username, password } = req.body

    // Identify that the user exists in the database when given a username
    db.query('SELECT * FROM users WHERE username = $1', [username], (err, re) => {
        //If there is no user with this username, wait 28 milliseconds and inform user that login failed. 
        if(re.rows[0] === undefined){
            //Reason for 28 milliseconds is to protect against account enumeration by ensuring that there is 
                //as minimal time difference between different incorrect login details.
                setTimeout(() => { res.redirect('/') }, 28);
        }
        else {
            // If user exists, fetch the id, stored salt and password
            id = re.rows[0].user_id;
            let storedSalt = re.rows[0].salt;
            //Looks at the stored password
            var storedPassword = re.rows[0].password;
            // Verify if the entered password and stored salt matches what's stored in the database
            if(verifyPassword(password, storedPassword, storedSalt) === true){
                console.log(loggedin)
                // If verification is successful, redirect the user to the fta screen
                res.redirect('/tfa')
                res.end()
            }
            else {
                // If login fails, redirect them back to the login screen
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
            
            // Display qr code for the user to scan
            res.render('tfa', { qr: data });          
        })   
    })     
});

tfa.post('/tfa', (req, res, next) => {
    // The inputted one-time password
    let { code } = req.body
    
    // Select the secret stored under that user in the database
    db.query(`SELECT secret FROM users WHERE user_id = $1`, [id], (reque, re) => {
        
        if(re.rows[0] === undefined){
            res.redirect('/tfa')
            
        }
        else {
            console.log(re.rows[0].secret)

            // Verifies the user that's trying to log in
            verify = speakeasy.totp.verify({
                secret: sec,
                encoding: 'base32',
                token: code
            }) 
            // If verification is successful, fetch the user and their posts
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
                    // Redirect the user to the home screen
                    res.redirect('/home/' + id)
                })
                
            }
            else{
                res.redirect('/tfa')
            } 
        }
    })
})
// Rendering the home screen
homeRouter.get('/:user_id', (req, res, next) => {
    // If user is verified and logged in...
    if(verify){
        // Assign user_id the passed id parameter
        const user_id = req.params.user_id;
        // Get details of currently logged in user from the database
        db.query(`SELECT * FROM users WHERE user_id = $1`, [user_id], (err, user_result) => {
        if (err) {
            return next(err)
        }
        // Get all of the posts of that user from the database
        db.query(`SELECT * FROM posts WHERE user_id = $1`, [user_id], (err, post_result) => {
        if (err) {
            return next(err)
        }
        res.status(200);
        // Render the home screen and pass user and post details to it
        res.render('home', {users: user_result.rows, posts: post_result.rows});
    });
    });
    }
    else {
        res.redirect('/')
    }
});
// Viewing the new post screen
homeRouter.get('/:user_id/new-post', (req, res, next) => {
    // If user is verified and logged in...
    if(verify) {
        const user_id = req.params.user_id;
        // Get details of currently logged in user from the database
        db.query(`SELECT * FROM users WHERE user_id = $1`, [user_id], (err, user_result) => {
        if (err) {
            return next(err)
        }
        // Render the new post screen
        res.render('new-post', {users: user_result.rows});
        });
    }
    else {
        // If user isn't verified, re-direct them to login
        res.redirect('/')
    }
});
// Creating a new post
homeRouter.post('/:user_id/new-post/submit', (req, res, next) => {
    // If user is verified and logged in, assign values from submitted form
    if(verify){
        const title = req.body.title;
        const content = req.body.content;
        const user_id = req.params.user_id;
    
          // Special characters pattern to test against
        var pattern = /[`@^*_+\-=\[\]{}\\|<>\/~]/;
        const post_id = uuid.v4()

        // If search query contains special characters
        if (pattern.test(title)) {
            alert('Special characters are not allowed in post titles!')
        }
        else if(pattern.test(content)) {
            alert('Special characters are not allowed in the post contents!')
        }
        // Input validation successful
        else {
            db.query(`SELECT * FROM users WHERE user_id = $1`, [user_id], (err, user_result) => {
            if (err) {
                return next(err)
            }
            // Create new post and insert values into database
            db.query(`INSERT INTO "posts" ("title", "content", "user_id", "post_id") VALUES ('${title}', '${content}', '${user_id}', '${post_id}')`, (err) => {
            if(err) {
                return next(err)
            }
        
            db.query(`SELECT * FROM posts WHERE user_id = $1`, [user_id], (err, post_result) => {
                if (err) {
                return next(err)
                }
        
            res.status(201);
            // Alert the user that post creation was successful and redirect them to home
            alert("New post successfully created!");
            res.redirect('/home/' + user_id);
            });
        });
        });
        }
    }
});
// Searching for a post by title
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
        // Get all posts that start with the same character as the search query
        db.query(`SELECT * FROM posts WHERE title LIKE '${first_char.toUpperCase()}%'`, (err, post_result) => {
            if(err) {
            return next(err)
            }
            // Render the search results screen with the post results
            res.render('search-results', {users: user_result.rows, posts: post_result.rows, search: search});
        });
        });
    }
}
});
// Viewing each post
homeRouter.get('/:user_id/:post_id/view', (req, res, next) => {
    const user_id = req.params.user_id;
    const post_id = req.params.post_id;
    
    // Get the post they want to view from the database
    db.query(`SELECT * FROM posts WHERE post_id = $1`, [post_id], (err, post_result) => {
      if (err) {
        return next(err)
      }
      // Get the user of the post they want to view
      db.query(`SELECT user_id FROM posts WHERE post_id = $1`, [post_id], (err, user_result) => {
        const id = user_result.rows[0].user_id;
  
        db.query(`SELECT * FROM users WHERE user_id = $1`, [id], (err, final_user_result) => {
          if (err) {
            return next(err)
          }
        if (err) {
          return next(err)
        }

        if(id == user_id) {
            // Render the view post screen with the fetched post, user that created it and id of currently logged in user
            res.render('view-post-edit', {posts: post_result.rows, users: final_user_result.rows, current_id: user_id});
        }
        else {
            // Render the view post screen with the fetched post, user that created it and id of currently logged in user
            res.render('view-post-no-edit', {posts: post_result.rows, users: final_user_result.rows, current_id: user_id});
        }
  });
  });
  });
  });

// Updating a post
homeRouter.post('/:user_id/:post_id/view/update', (req, res, next) => {
    const user_id = req.params.user_id;
    const post_id = req.params.post_id;

    if(verify){
        const content = req.body.content;

        db.query('UPDATE posts SET content = $1 WHERE post_id = $2', [content, post_id], (err) => {
            if (err) {
                return next(err)
            }
            alert('Post successfully edited!');
            res.redirect('/home/' + user_id);
        })
    }
    else {
        res.redirect('/')
    }

});


module.exports = tfa;