const express = require('express');
const homeRouter = express();

homeRouter.get('/', (req, res) => {
    res.render('home');
});

module.exports = homeRouter;