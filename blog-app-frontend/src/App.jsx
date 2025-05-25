import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Subscriptions from "./pages/Subscriptions";
import PostDetail from "./components/PostDetail";
import AuthorProfile from "./components/AuthorProfile";
import AllNotifications from "./components/AllNotifications";
import PostForm from "./components/PostForm";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import PrivateRoute from "./pages/PrivateRoute";
import PublicOnlyRoute from "./pages/PublicOnlyRoute";

// ✅ Apply globally for cookies
axios.defaults.withCredentials = true;

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/subscriptions"
          element={
            <PrivateRoute>
              <Subscriptions />
            </PrivateRoute>
          }
        />
        <Route
          path="/new"
          element={
            <PrivateRoute>
              <PostForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/edit/:id"
          element={
            <PrivateRoute>
              <PostForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile/:id"
          element={
            <PrivateRoute>
              <AuthorProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications/all"
          element={
            <PrivateRoute>
              <AllNotifications />
            </PrivateRoute>
          }
        />

        {/* Always accessible */}
        <Route path="/posts/:id" element={<PostDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Toast notifications */}
      <ToastContainer position="top-right" autoClose={2000} />
    </Router>
  );
}

export default App;
