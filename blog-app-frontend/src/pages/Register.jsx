import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      return setError("Username and password are required.");
    }

    try {
      await axios.post("http://localhost:3000/auth/register", { username, password });
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Registration failed."
      );
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <div className="col-12 col-sm-10 col-md-6 col-lg-5">
        <div className="card shadow p-4">
          <h3 className="mb-4 text-center text-success fst-italic">Become a member</h3>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              className="form-control mb-3"
              placeholder="Choose a Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <input
              type="password"
              className="form-control mb-4"
              placeholder="Create a Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />

            <button type="submit" className="btn btn-primary w-100">
              Register
            </button>
          </form>

          
          <p className="text-center mt-3 mb-0">
            Already have an account?{" "}
            <Link to="/login" className="text-decoration-none text-primary fw-semibold">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
