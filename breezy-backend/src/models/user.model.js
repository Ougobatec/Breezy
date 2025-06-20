const mongoose = require('mongoose');
const { use } = require('react');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    biography: { type: String, default: '' },
    avatar: { type: String, default: '' },
    role: { type: String, enum: ['user', 'moderator', 'admin'], default: 'user' },
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    language: { type: String, default: 'fr' },
    suspended: { type: Boolean, default: false },
    banned: { type: Boolean, default: false }
})

const User = mongoose.model('User', userSchema);
module.exports = User;