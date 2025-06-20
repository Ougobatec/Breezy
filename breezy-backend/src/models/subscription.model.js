const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    subscriber_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subscription_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
})

const Subscription = mongoose.model('Subscription', subscriptionSchema);
module.exports = Subscription;