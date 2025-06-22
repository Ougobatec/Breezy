const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    media: { type: String, default: '' },
    tags: [{ type: String }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String, required: true },
        created_at: { type: Date, default: Date.now }
    }],
    created_at: { type: Date, default: Date.now }
})

const Post = mongoose.model('Post', postSchema);
module.exports = Post;