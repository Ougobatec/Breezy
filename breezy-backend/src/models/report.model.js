const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    post_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    description: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'reviewed', 'resolved'], default: 'pending' },
    created_at: { type: Date, default: Date.now }
})

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;