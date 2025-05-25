import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  tags: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, //linking User table with posts
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Post', postSchema);
