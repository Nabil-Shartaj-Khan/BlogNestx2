import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSubscriptions = async () => {
    try {
      const res = await axios.get("http://localhost:3000/subscriptions");
      setSubscriptions(res.data);
    } catch (err) {
      console.error("Failed to fetch subscriptions:", err);
      setError("Unable to load subscriptions.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async (userId) => {
    try {
      await axios.delete(`http://localhost:3000/subscriptions/${userId}`);
      setSubscriptions(subscriptions.filter(sub => sub.targetUserId._id !== userId));
    } catch (err) {
      console.error("Unsubscribe failed", err);
      alert("Failed to unsubscribe.");
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  if (loading) return <div className="text-center mt-5 fs-4 text-success">Loading subscriptions...</div>;
  if (error) return <div className="alert alert-danger text-center mt-5">{error}</div>;
  if (subscriptions.length === 0) return <div className="text-center mt-5 text-danger fw-bold fs-3">You're not subscribed to anyone yet.</div>;

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-success fst-italic">Your Subscriptions</h2>
      <ul className="list-group">
        {subscriptions.map(sub => (
          <li key={sub._id} className="list-group-item d-flex justify-content-between align-items-center">
            <Link to={`/profile/${sub.targetUserId._id}`} style={{ textDecoration: 'none'}} className="text-primary">
              {sub.targetUserId.displayName || sub.targetUserId.username}
              <br></br><small className="text-muted">View profile</small>
            </Link>
            
            <button className="btn btn-sm btn-outline-danger" onClick={() => handleUnsubscribe(sub.targetUserId._id)}>
              Unsubscribe
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Subscriptions;
 