const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

app.use('/public', express.static('public'));


app.get('/', (req, res) => {
    res.render('login');
  });


const createAccountRouter = require('./routes/create-account');
const homeRouter = require('./routes/home');
const tfa = require('./routes/otp')
const fa = require('./routes/verify.js')

app.use('/create-account', createAccountRouter);
app.use('/home', homeRouter);
app.use('/tfa-validate', fa)


app.use('/totp-secret', tfa)
app.use('/totp-generate', tfa)
app.use('/totp-validate', tfa)
app.use

app.post('/create-account', createAccountRouter)

app.post('/tfa-validate', fa)
app.post('/totp-secret', tfa)
app.post('/totp-generate', tfa)
app.post('/totp-validate', tfa)

app.listen(process.env.PORT || 5000, () => {
    console.log('Server is running on port 5000');
});