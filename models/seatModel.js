const db = require('../config/db');

// Insert seat allocations into the database
const insertSeatAllocations = (seatAllocations, callback) => {
    const query = 'INSERT INTO SeatAllocation (student_id, seat_type, seat_number) VALUES ?';
    db.query(query, [seatAllocations], callback);
};

module.exports = { insertSeatAllocations };

