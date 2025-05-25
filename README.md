# 📝 BlogNestx2

### 🚀 A Real-Time Full-Stack Blogging Platform

This is a full-stack blogging application built with **React.js**, **Express.js**, **MongoDB**, and **Socket.io**. It offers a modern, responsive interface and real-time user interaction features.

---

### ✨ Features

- 📱 **Responsive frontend** built using **React** and **React-Bootstrap**
- 🔐 **User authentication** with **Google OAuth** and **local login** via **Passport.js**
- ⚡ **Real-time notifications** using **Socket.io** when subscribed authors publish new posts
- 📬 **Subscription system** with live updates and **missed notification recovery** upon login

---

### 👤 Users Can

- ✅ Register and log in (locally or with Google)
- 📝 Create, edit, and delete their own blog posts
- 🔔 Subscribe/unsubscribe to other authors
- 🧠 View real-time and missed notifications
- 🔍 Search posts by title or tags
- 👥 View active users and navigate to author profiles

---

### 🛠️ Technologies Used

| Layer         | Tech Stack                                  |
|---------------|----------------------------------------------|
| Frontend      | React.js, React-Bootstrap                   |
| Backend       | Node.js, Express.js, MongoDB (Mongoose)     |
| Authentication| Passport.js (Local + Google OAuth 2.0)      |
| Real-Time     | Socket.io                                    |

---

### 🔐 Security

- Only authenticated users can:
  - Create or edit posts
  - Subscribe to other authors
  - Access real-time socket events and unseen notifications
 
📌 Note
All actions are secured — routes and real-time events are restricted to authenticated users.

Notifications are stored in the database and delivered via sockets when online, or shown on login if offline.
