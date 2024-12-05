const db = require('../config/db');

// Fetch all classrooms with seat details
const getClassrooms = (callback) => {
    const query = 'SELECT * FROM Classrooms';
    db.query(query, callback);
};

module.exports = { getClassrooms };
