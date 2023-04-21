const express = require('express');
const homeRouter = express();
const db = require('../db/index');

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

module.exports = homeRouter;