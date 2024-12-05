const express = require('express');
const seatRoutes = require('./routes/seatRoutes');

const app = express();
const port = 3000;

// Middleware
app.use(express.json());

app.get('/test', (req, res) => {
    res.send('Server is working');
});

// Routes
app.use('/api/seats', seatRoutes);

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;  