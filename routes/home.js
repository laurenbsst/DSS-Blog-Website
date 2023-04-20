const express = require('express');
const homeRouter = express();
const db = require('../db/index');

homeRouter.get('/', (req, res, next) => {
    db.query('SELECT * FROM users WHERE user_id = 1', (err, result) => {
        if (err) {
          return next(err)
        }
        console.log(result.rows[0]);
        res.render('home', {users: result.rows});
      })
});

module.exports = homeRouter;