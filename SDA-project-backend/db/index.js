const mysql = require('mysql');
const dotenv = require('dotenv');

// Load environment variables from .env
dotenv.config();

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

// Establish the connection
db.connect((error) => {
    if (error) {
        console.error('Database Connection Error:', error);
        process.exit(1); // Exit the process if the database fails to connect
    } else {
        console.log('Database connected successfully!');
    }
});

// Function to query the database
const queryDatabase  = (query, params) => {
    return new Promise((resolve, reject) => {
        db.query(query, params, (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
};

// Export the connection instance
module.exports = {db,queryDatabase};

