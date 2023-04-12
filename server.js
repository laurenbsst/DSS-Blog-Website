const express = require('express');
const app = express();

const { Pool } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

const connectDb = async () => {
    try {
        const pool = new Pool({
            user: process.env.PGUSER,
            host: process.env.PGHOST,
            database: process.env.PGDATABASE,
            password: process.env.PGPASSWORD,
            port: process.env.PGPORT,
        });
        await pool.connect();
        console.log("Successfully connected to the database!");
        await pool.end();
    } catch (error) {
        console.log(error);
    }
}

connectDb()

app.set('view engine', 'ejs');

app.use('/public', express.static('public'));

app.get('/', (req, res) => {
    res.render('login');
})

const createAccountRouter = require('./routes/create-account');
const homeRouter = require('./routes/home');

app.use('/create-account', createAccountRouter);
app.use('/home', homeRouter);

app.listen(process.env.PORT || 5000, () => {
    console.log('Server is running on port 5000');
});