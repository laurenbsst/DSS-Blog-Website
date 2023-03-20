const express = require('express');
const app = express();

app.set('view engine', 'ejs');

app.use('/public', express.static('public'));

app.get('/', (req, res) => {
    res.render('login');
})

const createAccountRouter = require('./routes/create-account');

app.use('/create-account', createAccountRouter);

app.listen(process.env.PORT || 5000, () => {
    console.log('Server is running on port 5000');
});