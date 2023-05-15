const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: false}))

app.use('/public', express.static('public'));




const createAccountRouter = require('./routes/create-account');
const homeRouter = require('./routes/verify');
const tfa = require('./routes/verify')
const loginRouter = require('./routes/login')

app.use('/create-account', createAccountRouter);
app.use('/tfa', tfa)
app.use('/home', homeRouter);
app.use('/', loginRouter)

app.post('/create-account', createAccountRouter)
app.post('/tfa', tfa)
app.post('/', loginRouter)



app.listen(process.env.PORT || 5000, () => {
    console.log('Server is running on port 5000');
});

module.exports = app;