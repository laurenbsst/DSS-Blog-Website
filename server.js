const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const db = require('./db');

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

app.use('/create-account', createAccountRouter);
app.use('/home', homeRouter);

app.listen(process.env.PORT || 5000, () => {
    console.log('Server is running on port 5000');
});