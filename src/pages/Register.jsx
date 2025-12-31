import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Loader2, CheckCircle } from 'lucide-react';
import { AuthContext } from '../context/providers';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await register(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{textAlign: 'center', marginBottom: '2rem'}}>
          <h2 style={{fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem'}}>Create an account</h2>
          <p style={{color: 'var(--text-secondary)'}}>Start your learning journey today.</p>
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
              onChange={e => setEmail(e.target.value)} 
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
              onChange={e => setPassword(e.target.value)} 
              required 
            />
            <Lock className="input-icon" size={18} />
          </div>

          <div className="input-group">
            <input 
              className="input-field with-icon" 
              type="password" 
              placeholder="Confirm Password" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              required 
            />
            <CheckCircle className="input-icon" size={18} />
          </div>

          <button className="btn btn-primary" style={{ width: "100%", height: '44px', fontSize: '0.95rem' }} disabled={loading}>
             {loading ? <><Loader2 className="spin" size={20}/> Creating Account...</> : "Sign Up"}
          </button>
        </form>

        <div className="auth-divider">or</div>

        <div style={{ textAlign: "center", fontSize: "0.95rem", color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" className="link">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;