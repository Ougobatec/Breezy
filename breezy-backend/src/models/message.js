
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['sent', 'read', 'deleted'], default: 'sent' },
    created_at: { type: Date, default: Date.now }
})

const MessageModel = mongoose.model('Message', messageSchema);


export default MessageModel;