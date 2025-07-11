import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['like', 'comment', 'follow', 'mention', 'report', 'moderation', 'role_change'], required: true },
    from_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    from_post_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    content: { type: String, required: true },
    status: { type: String, enum: ['unread', 'read', 'deleted'], default: 'unread' },
    created_at: { type: Date, default: Date.now }
})

const NotificationModel = mongoose.model('Notification', notificationSchema);


export default NotificationModel;