import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
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
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{textAlign: 'center', marginBottom: '2rem'}}>
          <h2 style={{fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem'}}>Welcome back</h2>
          <p style={{color: 'var(--text-secondary)'}}>Enter your details to access your deck.</p>
        </div>

        {error && (
          <div style={{
            padding: '12px', background: '#fee2e2', color: '#dc2626', 
            borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem',
            border: '1px solid #fecaca'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              className="input-field with-icon"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Mail className="input-icon" size={18} />
          </div>

          <div className="input-group">
            <input
              className="input-field with-icon"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Lock className="input-icon" size={18} />
          </div>
          
          <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem'}}>
             <Link to="/forgot-password" style={{fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'none'}}>
               Forgot password?
             </Link>
          </div>

          <button className="btn btn-primary" style={{ width: "100%", height: '44px', fontSize: '0.95rem' }} disabled={loading}>
            {loading ? <><Loader2 className="spin" size={20}/> Signing In...</> : "Sign In"}
          </button>
        </form>

        <div className="auth-divider">or</div>

        <div style={{ textAlign: "center", fontSize: "0.95rem", color: 'var(--text-secondary)' }}>
          Don't have an account? <Link to="/register" className="link">Create account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;