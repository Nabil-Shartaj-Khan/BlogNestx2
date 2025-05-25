import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  subscriberId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

export default mongoose.model('Subscription', subscriptionSchema);
