import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import io from "socket.io-client";
import { toast } from "react-toastify";

const socket = io("http://localhost:3000", {
  withCredentials: true,
});

function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeUsers, setActiveUsers] = useState([]);

  useEffect(() => {
    socket.connect();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/posts?search=${search}`);
        setPosts(res.data);
      } catch (err) {
        console.error("Failed to fetch posts", err);
        setError("Failed to load posts.");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [search]);

  useEffect(() => {
    const handleNewPost = (data) => {
      toast.info(`New post by ${data.author}: "${data.title}"`);
      setSearch((prev) => prev + " "); // Trigger re-fetch
    };

    socket.on("new_post", handleNewPost);
    return () => socket.off("new_post", handleNewPost);
  }, []);

  useEffect(() => {
    const handleUsers = (users) => setActiveUsers(users);
    socket.on("active_users", handleUsers);
    socket.emit("request_active_users");

    return () => socket.off("active_users", handleUsers);
  }, []);

  if (loading) return <div className="text-center mt-5 text-success fs-3">Loading homepage...</div>;
  if (error) return <div className="alert alert-danger mt-5 text-center">{error}</div>;
  if (!Array.isArray(posts)) return <div className="text-center mt-5">Invalid post data.</div>;

  return (
    <div className="container-fluid">
      <div className="row flex-column flex-md-row">
        {/* Left: Active Users */}
        <div className="col-12 col-md-3 border-end px-3 py-3">
          <h5 className="text-secondary fst-italic mb-3">Active Users</h5>
          <ul className="list-group">
            {activeUsers.map((user) => (
              <Link
                key={user._id}
                to={`/profile/${user._id}`}
                className="list-group-item"
              >
                {user.displayName || user.username}
              </Link>
            ))}
          </ul>
        </div>

        {/* Middle: Posts */}
        <div className="col-12 col-md-6 px-3 py-3">
          <h3 className="text-secondary fst-italic mb-4 text-center text-md-start">
            Stay in the loop with what’s buzzing!
          </h3>

          <div className="row row-cols-1 row-cols-sm-2 g-4">
            {posts.map((post) => (
              <div className="col" key={post._id}>
                <div className="card h-100 border-3 shadow-md p-1">
                  <div className="card-body">
                    <h5 className="card-title text-success text-center fst-italic fs-4">
                      {post.title}
                    </h5>
                    <p className="card-text text-muted">
                      {post.content
                        ? post.content.slice(0, 100) + "..."
                        : "No content available"}
                    </p>
                  </div>
                  <div className="card-footer bg-transparent border-top-0">
                    <small className="text-muted">
                      <b>Tags:</b> {post.tags?.join(", ") || "None"} <br />
                      by{" "}
                      <Link to={`/profile/${post.createdBy?._id}`} className="text-decoration-none">
                        {post.createdBy?.displayName || post.createdBy?.username}
                      </Link>
                    </small>
                    <div className="mt-2">
                      <Link
                        to={`/posts/${post._id}`}
                        className="btn btn-sm btn-outline-primary w-100"
                      >
                        View Post
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Search */}
        <div className="col-12 col-md-3 border-start px-3 py-3">
          <h5 className="mb-3">Search Posts</h5>
          <input
            type="text"
            className="form-control"
            placeholder="Search by title or tags"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

export default Home;
