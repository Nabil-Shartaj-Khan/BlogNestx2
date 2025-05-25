import passport from "passport";
import LocalStrategy from "passport-local";
import GoogleStrategy from "passport-google-oauth20";
import User from "../models/User.js";
import bcrypt from "bcrypt";

import dotenv from "dotenv";
dotenv.config();

// Local strategy (keep this)
passport.use(
  new LocalStrategy(async (username, password, done) => {
    const user = await User.findOne({ username });
    if (!user) return done(null, false, { message: "Invalid Username!" });
    const valid = await bcrypt.compare(password, user.password);
    return valid
      ? done(null, user)
      : done(null, false, { message: "Wrong Password!" });
  })
);

// Google strategy (add this)

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      let existingUser = await User.findOne({ googleId: profile.id });
      if (existingUser) return done(null, existingUser);

      // 🌟 Sanitize and fallback for username
      const email = profile.emails?.[0]?.value;
      const username = email
        ? email.split("@")[0]
        : profile.displayName.replace(/\s+/g, "").toLowerCase() ||
          "user" + Date.now();

      const newUser = await User.create({
        googleId: profile.id,
        displayName: profile.displayName,
        email: email || null,
        profilePic: profile.photos?.[0]?.value || null,
        username: username, 
      });

      return done(null, newUser);
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) =>
  User.findById(id).then((u) => done(null, u))
);
