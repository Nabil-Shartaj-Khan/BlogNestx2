import express from "express";
import Joi from "joi";
import Post from "../models/Post.js";
import { isLoggedIn } from "../middlewares/auth.js";
import Subscription from "../models/Subscription.js";
import Notification from "../models/Notification.js";
import { io, userSockets } from "../app.js";

const router = express.Router();

// ✅ Get all posts (with optional search)
router.get("/", async (req, res) => {
  try {
    const searchPost = req.query.search;
    const filter = searchPost
      ? {
          $or: [
            { title: { $regex: searchPost, $options: "i" } },
            { tags: { $regex: searchPost, $options: "i" } },
          ],
        }
      : {};

    const posts = await Post.find(filter).populate("createdBy");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Failed to load posts." });
  }
});

// ✅ Create a new post
router.post("/", isLoggedIn, async (req, res) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required(),
    tags: Joi.string().optional(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const post = new Post({
      ...req.body,
      tags: req.body.tags?.split(",").map((tag) => tag.trim()),
      createdBy: req.user._id,
    });

    await post.save();

    // Notify all subscribers
    const subs = await Subscription.find({ targetUserId: req.user._id });

    for (let sub of subs) {
      await Notification.create({
        recipientId: sub.subscriberId,
        postId: post._id,
      });

      const subscriberId = sub.subscriberId.toString();
      const sockets = userSockets.get(subscriberId);
      if (sockets) {
        sockets.forEach((socket) => {
          socket.emit("new_post", {
            postId: post._id,
            title: post.title,
            author: req.user.displayName || req.user.username,
            createdAt: new Date(),
          });
        });
      }
    }

    res.status(201).json({ message: "Post created", post });
  } catch (err) {
    res.status(500).json({ error: "Failed to create post." });
  }
});

// ✅ Get post by ID (optional detail view)
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("createdBy");
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve post." });
  }
});

// ✅ Update post
router.put("/edit/:id", isLoggedIn, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (!req.user._id.equals(post.createdBy)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    post.title = req.body.title;
    post.content = req.body.content;
    post.tags = req.body.tags?.split(",").map((t) => t.trim());

    await post.save();
    res.json({ message: "Post updated", post });
  } catch (err) {
    res.status(500).json({ error: "Failed to update post." });
  }
});

// ✅ Delete post
router.delete("/delete/:id", isLoggedIn, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (!req.user._id.equals(post.createdBy)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await post.deleteOne();
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete post." });
  }
});

router.get("/by/:userId", async (req, res) => {
  try {
    const posts = await Post.find({ createdBy: req.params.userId }).populate("createdBy");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch author's posts." });
  }
});


export default router;
