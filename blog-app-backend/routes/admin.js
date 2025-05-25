import express from 'express';
import { isLoggedIn } from '../middlewares/auth.js';
import { isAdmin } from '../middlewares/isAdmin.js';
import User from '../models/User.js';
import Post from '../models/Post.js';

const router = express.Router();

// GET: All users and posts (for admin panel)
router.get('/', isLoggedIn, isAdmin, async (req, res) => {
  try {
    const users = await User.find();
    const posts = await Post.find().populate('createdBy');
    res.json({ users, posts });
  } catch (err) {
    res.status(500).json({ error: 'Server error while loading admin data.' });
  }
});

// DELETE: Delete post by ID
router.delete('/delete/:id', isLoggedIn, isAdmin, async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete post.' });
  }
});

export default router;
