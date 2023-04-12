const { Pool } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
});

const connectDb = async () => {
    try {
        await pool.connect();
        console.log("Successfully connected to the database!");
    } catch (error) {
        console.log(error);
    }
}

connectDb();

module.exports = {
  query: (text, params, callback) => {
    return pool.query(text, params, callback)
  },
}