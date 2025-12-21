import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/providers";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 🔑 single line
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="card auth-form">
        <h2 style={{ marginBottom: "1.5rem" }}>Welcome Back</h2>

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            className="input-field"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="input-field"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem" }}>
          <Link to="/forgot-password">Forgot Password?</Link>
          <br /><br />
          Don't have an account? <Link to="/register"><b>Register</b></Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
