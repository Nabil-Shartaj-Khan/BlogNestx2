import { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [post, setPost] = useState(null);
  const isAuthor = user && post && user._id === post.createdBy?._id;

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/posts/${id}`);
        setPost(res.data);
      } catch (err) {
        console.error("Failed to load post", err);
      }
    };

    fetchPost();
  }, [id]);

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:3000/posts/delete/${id}`);
      navigate("/");
    } catch (err) {
      console.error("Failed to delete post", err);
    }
  };

  if (!post) return <div className="text-center mt-5">Loading post...</div>;

  return (
    <div className="container py-5">
      <div className="card shadow-sm p-4">
        <h1 className="text-success mb-3 text-center">{post.title}</h1>

        <div className="d-flex justify-content-between flex-wrap mb-3">
          <div className="text-muted">
            <span>Written by </span>
            <Link
              to={`/profile/${post.createdBy._id}`}
              className="text-decoration-none fw-semibold text-primary"
            >
              {post.createdBy.displayName || post.createdBy.username}
            </Link>
          </div>
          <div className="text-muted">
            {post.tags?.length > 0 && (
              <>
                <span>Tags: </span>
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="badge bg-secondary me-1 text-light"
                  >
                    {tag}
                  </span>
                ))}
              </>
            )}
          </div>
        </div>

        <p className="fs-5" style={{ whiteSpace: "pre-line" }}>{post.content}</p>

        {isAuthor && (
          <div className="mt-4 text-center">
            <Link to={`/edit/${post._id}`} className="btn btn-outline-warning me-3">
              ✏️ Edit Post
            </Link>
            <button className="btn btn-outline-danger" onClick={handleDelete}>
              🗑️ Delete Post
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PostDetail;
