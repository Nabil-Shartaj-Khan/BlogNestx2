import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function AllNotifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await axios.get("http://localhost:3000/notifications?showSeen=true");
        setNotifications(res.data);
        console.log("Fetched notifications:", res.data);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };
    fetchAll();
  }, []);

  const markAllAsSeen = async () => {
    try {
      await axios.patch("http://localhost:3000/notifications/mark-seen");
      setNotifications((prev) => prev.map(n => ({ ...n, seen: true })));
    } catch (err) {
      console.error("Failed to mark notifications as seen", err);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-success fst-italic">Activity feed</h2>
      <button className="btn btn-sm btn-outline-primary mb-3" onClick={markAllAsSeen}>
        Mark all as seen
      </button>

      <ul className="list-group">
        {notifications.map((n, idx) => (
          <Link
            key={idx}
            to={`/posts/${n.postId}`}
            className={`list-group-item ${n.seen ? '' : 'fw-bold'}`}
          >
            <span>Your subscription: <strong>{n.authorName}</strong> posted:  <b className="text-primary">{n.title}</b></span>
            <br/><small className="text-muted">view post</small>
            <span className="text-muted float-end" style={{ fontSize: "0.8rem" }}>
              {n.time ? new Date(n.time).toLocaleTimeString() : ""}
            </span>
          </Link>
        ))}
      </ul>
    </div>
  );
}

export default AllNotifications;
