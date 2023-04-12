const express = require('express');
const homeRouter = express();
const db = require('../db/index');

homeRouter.get('/', (req, res, next) => {
    db.query('SELECT * FROM users', (err, result) => {
        if (err) {
          return next(err)
        }
        console.log(result.rows[0]);
      })
    res.render('home');
});

module.exports = homeRouter;