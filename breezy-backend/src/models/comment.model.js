const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    post_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    parent_comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null }, // null si c'est un commentaire principal
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }], // pour les réponses
    created_at: { type: Date, default: Date.now }
});

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;