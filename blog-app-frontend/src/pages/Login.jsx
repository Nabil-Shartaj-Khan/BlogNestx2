import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Logging in with:', { username, password });
      await axios.post('http://localhost:3000/auth/login', { username, password });
      console.log('Login successful');
      navigate('/');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Invalid credentials');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3000/auth/google';
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <div className="col-12 col-sm-10 col-md-6 col-lg-5">
        <div className="card shadow p-4">
          <h3 className="mb-4 text-center text-success fst-italic">Welcome Back!</h3>

          <form onSubmit={handleSubmit}>
            <input
              className="form-control mb-3"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Username"
              required
            />
            <input
              className="form-control mb-4"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              required
            />

            <div className="row">
              <div className="col-12 col-md-6 mb-2 mb-md-0">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="btn btn-danger w-100"
                >
                  Google Login
                </button>
              </div>
              <div className="col-12 col-md-6">
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                >
                  Username Login
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
