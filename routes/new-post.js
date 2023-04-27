const express = require('express');
const newPostRouter = express();

newPostRouter.get('/', (req, res) => {
    res.render('new-post');
});

module.exports = newPostRouter;