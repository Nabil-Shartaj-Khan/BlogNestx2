import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import io from "socket.io-client";
import { formatDistanceToNow } from "date-fns";
import "../App.css";

const socket = io("http://localhost:3000", { withCredentials: true });

function Navbar() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    socket.connect();

    socket.on("new_post", (data) => {
      const alreadyExists = notifications.some((n) => n.postId === data.postId);

      if (!alreadyExists) {
        setNotifications((prev) => [
          {
            postId: data.postId,
            title: data.title,
            authorName: data.author,
            createdAt: new Date(),
            seen: false,
          },
          ...prev,
        ]);
        toast.info(`New post by ${data.author}: "${data.title}"`);
      }
    });

    return () => socket.off("new_post");
  }, [notifications]);

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:3000/auth/logout", {
        withCredentials: true,
      });
      setUser(null);
      window.location.reload();
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://localhost:3000/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  const toggleDropdown = async () => {
    setShowDropdown((prev) => !prev);
    if (!showDropdown && notifications.length > 0) {
      try {
        await axios.patch("http://localhost:3000/notifications/mark-seen");
        setNotifications((prev) => prev.map((n) => ({ ...n, seen: true })));
      } catch (err) {
        console.error("Failed to mark notifications as seen", err);
      }
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm px-4">
      <Link className="navbar-brand" to="/">
        BlogNestx2
      </Link>

      {/* Toggler for mobile */}
      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarContent"
        aria-controls="navbarContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      {/* Responsive Content */}
      <div className="collapse navbar-collapse" id="navbarContent">
        <ul className="navbar-nav ms-auto align-items-center gap-2">
          {user ? (
            <>
              <li className="nav-item d-flex align-items-center gap-2">
                {user.profilePic && (
                  <img
                    src={user.profilePic}
                    alt="Profile"
                    width="35"
                    height="35"
                    className="rounded-circle"
                  />
                )}
                <span className="fw-semibold d-none d-lg-inline">
                  Hello,{" "}
                  <span className="text-success fw-bold">
                    {user.displayName || user.username} 👋🏻
                  </span>
                </span>
              </li>

              <li className="nav-item">
                <Link to="/" className="btn btn-outline-dark btn-sm w-100">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/new" className="btn btn-outline-primary btn-sm w-100">
                  New Post
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/subscriptions"
                  className="btn btn-outline-secondary btn-sm w-100"
                >
                  Subscriptions
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to={`/profile/${user._id}`}
                  className="btn btn-outline-info btn-sm w-100"
                >
                  Your Posts
                </Link>
              </li>

              <li className="nav-item position-relative">
                <i
                  className="bi bi-bell fs-4 notif-icon"
                  style={{
                    cursor: "pointer",
                    color: showDropdown ? "#007bff" : "#6c757d",
                  }}
                  onClick={toggleDropdown}
                ></i>

                {notifications.filter((n) => !n.seen).length > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {notifications.filter((n) => !n.seen).length}
                  </span>
                )}

                {showDropdown && (
                  <ul
                    className="dropdown-menu show mt-2 border border-1 border-warning shadow-lg"
                    onMouseLeave={() => setShowDropdown(false)}
                    style={{ right: 0, left: "auto", minWidth: "300px" }}
                  >
                    {notifications.length === 0 ? (
                      <li className="dropdown-item text-muted fst-italic">
                        No new notifications
                      </li>
                    ) : (
                      notifications.slice(0, 5).map((n, idx) => {
                        const time = n.createdAt ? new Date(n.createdAt) : null;
                        const timeAgo =
                          time && !isNaN(time.getTime())
                            ? formatDistanceToNow(time, { addSuffix: true })
                            : "some time ago";
                        return (
                          <li key={idx} className="dropdown-item">
                            <Link
                              to={`/posts/${n.postId}`}
                              className={`dropdown-item ${n.seen ? "" : "fw-bold"}`}
                              onClick={() => setShowDropdown(false)}
                            >
                              <strong>{n.authorName || "Someone"}</strong> posted:{" "}
                              <em>{n.title}</em>
                              <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                                {timeAgo}
                              </div>
                            </Link>
                          </li>
                        );
                      })
                    )}
                    <li className="dropdown-item text-center">
                      <Link to="/notifications/all">View All</Link>
                    </li>
                  </ul>
                )}
              </li>

              <li className="nav-item">
                <button className="btn btn-danger btn-sm w-100" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link to="/login" className="btn btn-outline-primary btn-sm w-100">
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className="btn btn-primary btn-sm w-100">
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
