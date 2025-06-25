import 'dotenv/config';
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import path from 'path';

const app  = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://mongo:27017/breezy';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


import routerSub from '#routes/sub.js'
import routeurPost from '#routes/post.js'
import routeurAuth from '#routes/auth.js'
import routeurUser from '#routes/user.js'

app.use('/uploads/avatars', express.static('/uploads/avatars'))

app.get('/', (req, res) => res.send('Welcome to Breezy Backend!'));

app.use('/auth',  routeurAuth);
app.use('/posts', routeurPost);
app.use('/users', routeurUser);
app.use('/sub', routerSub);


// app.get('/:id/like', require('./src/middlewares/auth.middleware'), require('./src/controllers/post.controller').getPostLikes);

// app.put('/posts/:id/like', require('./src/middlewares/auth.middleware'), require('./src/controllers/post.controller').likePost);

mongoose.connect(MONGO_URI)
.then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
})
.catch(err => console.error('MongoDB connection error:', err));