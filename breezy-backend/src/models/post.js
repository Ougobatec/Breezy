import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    media: { type: String, default: '' },
    tags: [{ type: String }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    reports: [{
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        reason: { type: String, required: true },
        reported_at: { type: Date, default: Date.now }
    }],
    created_at: { type: Date, default: Date.now }
})

const PostModel = mongoose.model('Post', postSchema);



export default PostModel;