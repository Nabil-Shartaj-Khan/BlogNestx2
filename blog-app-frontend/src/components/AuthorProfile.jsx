import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function AuthorProfile() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [author, setAuthor] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const isOwnProfile = user?._id === id;

  useEffect(() => {
    const fetchAuthorData = async () => {
      try {
        const [userRes, postRes] = await Promise.all([
          axios.get(`http://localhost:3000/auth/user/${id}`),
          axios.get(`http://localhost:3000/posts/by/${id}`),
        ]);
        setAuthor(userRes.data);
        setPosts(postRes.data);
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    };

    const checkSubscription = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/subscriptions`);
        const subscribed = res.data.some((sub) => sub.targetUserId._id === id);
        setIsSubscribed(subscribed);
      } catch (err) {
        console.error("Failed to check subscription", err);
      }
    };

    fetchAuthorData();
    if (!isOwnProfile) checkSubscription();
  }, [id, isOwnProfile]);

  const handleSubscribe = async () => {
    try {
      if (isSubscribed) {
        await axios.delete(`http://localhost:3000/subscriptions/${id}`);
        setIsSubscribed(false);
      } else {
        await axios.post(`http://localhost:3000/subscriptions/${id}`);
        alert("Subscribed successfully to " + author.username);
        setIsSubscribed(true);
      }
    } catch (err) {
      console.error("Subscription error", err);
    }
  };

  const handleDelete = async (postId) => {
    try {
      await axios.delete(`http://localhost:3000/posts/delete/${postId}`);
      setPosts(posts.filter((p) => p._id !== postId));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  if (!author)
    return <div className="text-center mt-5 text-success fs-3">Loading author profile...</div>;

  return (
    <div className="container py-4">
      <h2 className="text-success mb-1">
        <span className="fst-italic text-dark">Author:</span>{" "}
        {author.displayName || author.username}
      </h2>
      <p className="text-muted">Total posts: {posts.length}</p>

      {!isOwnProfile && (
        <button
          onClick={handleSubscribe}
          className={`btn ${isSubscribed ? "btn-outline-danger" : "btn-outline-primary"} mb-4`}
        >
          {isSubscribed ? "Unsubscribe" : "Subscribe"}
        </button>
      )}

      {posts.length === 0 ? (
        <>
          <p className="text-muted">No posts available.</p>
          {isOwnProfile && (
            <Link to="/new" className="btn btn-primary mt-3">
              Create New Post
            </Link>
          )}
        </>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 g-4">
          {posts.map((post) => (
            <div className="col" key={post._id}>
              <div className="card h-100 shadow-sm p-2">
                <div className="card-body">
                  <h5 className="card-title text-success text-center fst-italic fs-4">
                    {post.title}
                  </h5>
                  <p className="card-text text-muted">
                    {post.content ? post.content.slice(0, 100) + "..." : "No content available"}
                  </p>
                </div>
                <div className="card-footer bg-transparent border-top-0">
                  <small className="text-muted d-block mb-2">
                    <strong>Tags:</strong> {post.tags?.join(", ") || "None"}
                  </small>
                  <Link
                    to={`/posts/${post._id}`}
                    className="btn btn-sm btn-outline-primary w-100 mb-2"
                  >
                    View Post
                  </Link>
                  {isOwnProfile && (
                    <div className="d-flex justify-content-between">
                      <Link
                        to={`/edit/${post._id}`}
                        className="btn btn-sm btn-outline-warning w-50 me-1"
                      >
                        ✏️ Edit
                      </Link>
                      <button
                        className="btn btn-sm btn-outline-danger w-50 ms-1"
                        onClick={() => handleDelete(post._id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AuthorProfile;
