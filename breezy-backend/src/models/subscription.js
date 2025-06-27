import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
    subscriber_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subscription_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
})

const SubscriptionModel = mongoose.model('Subscription', subscriptionSchema);


export default SubscriptionModel;