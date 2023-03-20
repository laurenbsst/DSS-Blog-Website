const express = require('express');
const createAccountRouter = express();

createAccountRouter.get('/', (req, res) => {
    res.render('create-account');
});

module.exports = createAccountRouter;