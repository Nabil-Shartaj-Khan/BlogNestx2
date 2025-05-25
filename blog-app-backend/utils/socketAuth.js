import mongoose from "mongoose";
import User from "../models/User.js";
import MongoStore from "connect-mongo";
import cookie from "cookie";
import signature from "cookie-signature";

const sessionStore = MongoStore.create({
  mongoUrl: process.env.MONGO_URI,
  collectionName: "sessions",
});

export async function getUserFromSession(req) {
  const rawCookie = req.headers?.cookie;
  console.log("🍪 Raw cookie header:", rawCookie); // 🔍

  if (!rawCookie) return null;

  const cookies = cookie.parse(rawCookie);
  const signed = cookies["connect.sid"];

  if (!signed) {
    console.log("❌ No connect.sid cookie found");
    return null;
  }

  const sid = signature.unsign(signed.slice(2), process.env.SECRET_KEY); 
  if (!sid) {
    console.log("❌ Failed to unsign cookie");
    return null;
  }

  console.log("🧾 Parsed session ID:", sid);

  return new Promise((resolve, reject) => {
    sessionStore.get(sid, async (err, session) => {
      if (err || !session?.passport?.user) {
        console.log("❌ No session or user in session:", session);
        return resolve(null);
      }

      try {
        const user = await User.findById(session.passport.user);
        console.log("✅ Authenticated socket user:", user.username || user._id);
        resolve(user);
      } catch (e) {
        console.log("❌ Error fetching user from DB", e);
        resolve(null);
      }
    });
  });
}
