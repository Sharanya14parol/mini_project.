const express = require('express');
const router = express.Router();
const { allocateSeats } = require('../controllers/seatController');

router.post('/allocate-seats', allocateSeats);

module.exports = router;
