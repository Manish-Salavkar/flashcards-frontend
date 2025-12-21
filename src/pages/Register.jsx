import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/providers';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // New State
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Client-side Validation: Check Passwords Match
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
      <div className="card auth-form">
        <h2 style={{marginBottom:'1.5rem'}}>Create Account</h2>
        
        {/* Error Message */}
        {error && (
          <div style={{
            padding: '10px', 
            background: '#fee2e2', 
            color: '#ef4444', 
            borderRadius: '8px', 
            marginBottom: '1rem',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input 
            className="input-field" 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
          />
          <input 
            className="input-field" 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
          />
          {/* New Confirm Password Field */}
          <input 
            className="input-field" 
            type="password" 
            placeholder="Confirm Password" 
            value={confirmPassword} 
            onChange={e => setConfirmPassword(e.target.value)} 
            required 
          />
          <button 
            className="btn btn-primary" 
            style={{width:'100%', opacity: loading ? 0.7 : 1}} 
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        <div style={{marginTop:'1.5rem', textAlign:'center', fontSize:'0.9rem'}}>
          Already have an account? <Link to="/login" style={{color:'var(--accent)', textDecoration:'none', fontWeight:'bold'}}>Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;