import express from "express";
import passport from "passport";
import Joi from "joi";
import User from "../models/User.js";

const router = express.Router();

// ✅ Local Login (POST)
router.post("/login", (req, res, next) => {
  console.log("Login attempt:", req.body);
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ error: info.message || "Login failed" });
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.json({ message: "Login successful", user });
    });
  })(req, res, next);
});

// ✅ Local Register (POST)
router.post("/register", async (req, res) => {
  const validateFields = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().min(6).required(),
  });

  const { error } = validateFields.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const newUser = new User(req.body);
    await newUser.save();

    req.login(newUser, (err) => {
      if (err) throw err;
      res.json({ message: "Registration successful", user: newUser });
    });
  } catch (e) {
    res.status(400).json({ error: "Username already taken" });
  }
});

// ✅ Logout
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: "Logout failed" });

    req.session.destroy((err) => {
      if (err) return res.status(500).json({ error: "Session destroy failed" });
      res.clearCookie("connect.sid", { path: "/" });
      return res.json({ message: "Logged out successfully" });
    });
  });
});


// ✅ Auth check
router.get("/me", (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: "Not logged in" });
  }
});

// ✅ Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// ✅ Google OAuth Callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:5173/login", // Send React user back to login
    failureFlash: true,
  }),
  (req, res) => {
    // Successful login → redirect to React homepage
    res.redirect("http://localhost:5173");
  }
);

router.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("username displayName");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Error fetching user by ID:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});



export default router;
