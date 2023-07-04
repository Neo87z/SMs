const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const ClaimsController = require('./controllers/ClaimsController');
const SMsController = require('./controllers/smsController');

dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Environment variables
const PORT = process.env.PORT || 8089;
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})
    .then(() => {
        console.log('Database Connection Successful');
    })
    .catch(error => {
        console.log('Database Error:', error.message);
    });

// Serve static files
app.use(express.static('./public'));

// Claims routes
app.use('/claims', ClaimsController());
app.use('/sms', SMsController());

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is up and running on PORT ${PORT}`);
});