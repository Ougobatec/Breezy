require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const path = require('path');

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rendre le dossier uploads/avatars accessible publiquement
app.use('/uploads/avatars', express.static(path.join(__dirname, 'uploads/avatars')));

app.get('/', (req, res) => {
    res.send('Welcome to Breezy Backend!');
});

app.use('/auth', require('./src/routes/auth.routes'));
app.use('/posts', require('./src/routes/post.routes'));
app.get('/posts', require('./src/routes/post.routes'));
app.use('/user', require('./src/routes/user.routes'));
// Connect to MongoDB
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Backend is running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });

