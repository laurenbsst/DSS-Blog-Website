const express = require('express');
const homeRouter = express();
const db = require('../db/index');
let alert = require('alert');


homeRouter.get('/:user_id', (req, res, next) => {
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
});

homeRouter.get('/:user_id/new-post', (req, res, next) => {
  const user_id = req.params.user_id;
  db.query(`SELECT * FROM users WHERE user_id = $1`, [user_id], (err, user_result) => {
    if (err) {
      return next(err)
    }
  res.render('new-post', {users: user_result.rows});
  });
});

homeRouter.post('/:user_id/new-post/submit', (req, res, next) => {
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
});
homeRouter.post('/:user_id/search', (req, res, next) => {
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

module.exports = homeRouter;