import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

function PostForm() {
  const { id } = useParams(); // if editing, id will exist
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState("");

  const isEditing = !!id;

  // Fetch post for editing
  useEffect(() => {
    if (isEditing) {
      axios.get(`http://localhost:3000/posts/${id}`)
        .then(res => {
          const post = res.data;
          if (post.createdBy._id !== user._id) {
            return navigate("/"); // redirect if not owner
          }
          setTitle(post.title);
          setContent(post.content);
          setTags(post.tags?.join(", ") || "");
        })
        .catch(err => {
          console.error("Failed to fetch post", err);
          setError("Failed to load post for editing.");
        });
    }
  }, [id, isEditing, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) return setError("Title and content are required.");

    const payload = { title, content, tags };

    try {
      if (isEditing) {
        await axios.put(`http://localhost:3000/posts/edit/${id}`, payload);
      } else {
        await axios.post("http://localhost:3000/posts", payload);
      }
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to save post.");
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: "600px" }}>
      <h2 className="my-3 text-success fst-italic">{isEditing ? "Update the vibes" : "Create and Insprire!"}</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className="form-control mb-3"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{onMouse: "pointer"}}
          autoFocus
        />

        <textarea
          className="form-control mb-3"
          rows="6"
          placeholder="Content"
          value={content}
          onChange={e => setContent(e.target.value)}
        />

        <input
          type="text"
          className="form-control mb-3"
          placeholder="Tags (comma-separated)"
          value={tags}
          onChange={e => setTags(e.target.value)}
        />

        <button className="btn btn-primary w-100">
          {isEditing ? "Update Post" : "Publish Post"}
        </button>
      </form>
    </div>
  );
}

export default PostForm;
