import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import path from "path";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { fileURLToPath } from "url";
import MongoStore from "connect-mongo";
import User from "./models/User.js"; // required to populate usernames

import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/posts.js";
import adminRoutes from "./routes/admin.js";
import subscriptionRoutes from "./routes/subscriptions.js";
import notificationRoutes from "./routes/notifications.js";
import "./config/passport.js";
import { getUserFromSession } from "./utils/socketAuth.js";
import cookieParser from "cookie-parser";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connection successful!"))
  .catch((err) => console.error("DB connection error:", err));

// ✅ Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // allow Vite frontend
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser(process.env.SECRET_KEY));
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
    }),
    cookie: { secure: false },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

// ✅ Routes
app.use("/auth", authRoutes);
app.use("/posts", postRoutes);
app.use("/admin", adminRoutes);
app.use("/subscriptions", subscriptionRoutes);
app.use("/notifications", notificationRoutes);

// ✅ Home route (optional test)
app.get("/", (req, res) => {
  res.json({ message: "API is running!" });
});

// ✅ 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// --- SOCKET.IO INTEGRATION START ---
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const userSockets = new Map(); // Maps userId -> [socket, socket, ...]

io.use(async (socket, next) => {
  const user = await getUserFromSession(socket.request);
  if (!user) return next(new Error("Unauthorized"));
  socket.user = user;
  next();
});

//emitting active users
function emitActiveUsers() {
  const activeIds = Array.from(userSockets.keys());
  console.log("Emitting active users for IDs:", activeIds);

  User.find({ _id: { $in: activeIds } })
    .then((users) => {
      const simplified = users.map((u) => ({
        _id: u._id,
        username: u.username,
        displayName: u.displayName || u.username || "Anonymous",
      }));
      console.log("Emitting users:", simplified);
      io.emit("active_users", simplified);
    })
    .catch((err) => console.error("Failed to emit active users:", err));
}

io.on("connection", (socket) => {
  const userId = socket.user._id.toString();

  if (!userSockets.has(userId)) {
    userSockets.set(userId, []);
  }
  userSockets.get(userId).push(socket);

  console.log(`Socket connected for user: ${userId}`);

  // ✅ Send active users to the connected socket immediately
  User.find({ _id: { $in: Array.from(userSockets.keys()) } }).then((users) => {
    const simplified = users.map((u) => ({
      _id: u._id,
      username: u.username,
      displayName: "User- " + u.username,
    }));
    socket.emit("active_users", simplified);
  });

  
  emitActiveUsers();

  socket.on("request_active_users", () => {
    console.log("Manual request from client for active users");

    User.find({ _id: { $in: Array.from(userSockets.keys()) } }).then(
      (users) => {
        const simplified = users.map((u) => ({
          _id: u._id,
          username: u.username,
          displayName: u.displayName || u.username || "Anonymous",
        }));
        socket.emit("active_users", simplified);
      }
    );
  });

  socket.on("disconnect", () => {
    const sockets = userSockets.get(userId) || [];
    const filtered = sockets.filter((s) => s !== socket);
    if (filtered.length === 0) {
      userSockets.delete(userId);
    } else {
      userSockets.set(userId, filtered);
    }

    console.log(`Socket disconnected for user: ${userId}`);

    // ✅ Re-emit updated list
    emitActiveUsers();
  });
});

export { io, userSockets };
// --- SOCKET.IO INTEGRATION END ---

// ✅ Start server
server.listen(3000, () => {
  console.log("Server is running on port:3000");
});
