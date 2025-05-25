import express from 'express';
import { isLoggedIn } from '../middlewares/auth.js';
import Subscription from '../models/Subscription.js';

const router = express.Router();

// ✅ Subscribe to an author
router.post('/:targetUserId', isLoggedIn, async (req, res) => {
  const { targetUserId } = req.params;

  if (req.user._id.equals(targetUserId)) {
    return res.status(400).json({ message: "You can't subscribe to yourself." });
  }

  try {
    const exists = await Subscription.findOne({
      subscriberId: req.user._id,
      targetUserId
    });

    if (exists) {
      return res.status(400).json({ message: "Already subscribed." });
    }

    await Subscription.create({ subscriberId: req.user._id, targetUserId });
    res.status(201).json({ message: "Subscribed successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to subscribe." });
  }
});

// ✅ Unsubscribe from an author
router.delete('/:targetUserId', isLoggedIn, async (req, res) => {
  try {
    await Subscription.deleteOne({
      subscriberId: req.user._id,
      targetUserId: req.params.targetUserId
    });

    res.json({ message: "Unsubscribed successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to unsubscribe." });
  }
});

// ✅ Get all subscriptions (authors the user is following)
router.get('/', isLoggedIn, async (req, res) => {
  try {
    const subs = await Subscription.find({ subscriberId: req.user._id }).populate('targetUserId');
    res.json(subs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch subscriptions." });
  }
});

export default router;
