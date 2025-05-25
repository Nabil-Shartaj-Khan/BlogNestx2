import express from "express";
import { isLoggedIn } from "../middlewares/auth.js";
import Notification from "../models/Notification.js";
import Post from "../models/Post.js";

const router = express.Router();

// ✅ Get all unseen notifications for the current user
router.get("/", isLoggedIn, async (req, res) => {
  try {
    const showSeen = req.query.showSeen === "true"; // interpret query param

    const filter = {
      recipientId: req.user._id,
      ...(showSeen ? {} : { seen: false }), // if !showSeen, filter for unseen only
    };

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .populate({
        path: "postId",
        populate: {
          path: "createdBy",
          model: "User",
        },
      });

    const formatted = notifications
      .filter((n) => n.postId && n.postId.createdBy) // skip broken data
      .map((n) => ({
        postId: n.postId._id,
        title: n.postId.title,
        authorName:
          n.postId.createdBy.displayName || n.postId.createdBy.username,
        time: n.createdAt,
        seen: n.seen,
      }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// ✅ Mark all notifications as seen
router.patch("/mark-seen", isLoggedIn, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientId: req.user._id, seen: false },
      { $set: { seen: true } }
    );
    res.json({ message: "Notifications marked as seen" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update notifications" });
  }
});

export default router;
