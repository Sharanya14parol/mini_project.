const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',   // replace with your MySQL username
    password: 'shashwath_09',  // replace with your MySQL password
    database: 'exam_db'      // replace with your database name
});

db.connect(err => {
    if (err) throw err;
    console.log('MySQL Connected...');
});

module.exports = db;
