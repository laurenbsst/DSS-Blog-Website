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
  const user_id = req.params.user_id

  db.query(`INSERT INTO "posts" ("title", "content", "user_id") VALUES ('${title}', '${content}', '${user_id}')`, (err) => {
    if(err) {
      return next(err)
    }
    alert("New post successfully created!");
  });
});

module.exports = homeRouter;