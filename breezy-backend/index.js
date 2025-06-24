require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const path = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://mongo:27017/breezy';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads/avatars', express.static(path.join(__dirname, 'uploads/avatars')));

app.get('/api', (req, res) => res.send('Welcome to Breezy Backend!'));

app.use('/api/auth',  require('./src/routes/auth.routes'));
app.use('/api/posts', require('./src/routes/post.routes'));
app.use('/api/users', require('./src/routes/user.routes'));

mongoose.connect(MONGO_URI)
.then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
})
.catch(err => console.error('MongoDB connection error:', err));