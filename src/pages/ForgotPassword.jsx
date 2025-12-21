import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/providers';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Pass
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPass, setNewPass] = useState('');
  
  const { sendOtp, resetPassword } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    await sendOtp(email);
    setStep(2);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    await resetPassword(otp, newPass);
    navigate('/login');
  };

  return (
    <div className="auth-page">
      <div className="card auth-form">
        <h2 style={{marginBottom:'1.5rem'}}>
            {step === 1 && 'Reset Password'}
            {step === 2 && 'Enter Code'}
            {step === 3 && 'New Password'}
        </h2>

        {step === 1 && (
            <form onSubmit={handleEmailSubmit}>
                <input className="input-field" type="email" placeholder="Enter Registered Email" value={email} onChange={e=>setEmail(e.target.value)} required />
                <button className="btn btn-primary" style={{width:'100%'}}>Send OTP</button>
            </form>
        )}

        {step === 2 && (
             <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
                <input className="input-field" placeholder="Enter OTP" value={otp} onChange={e=>setOtp(e.target.value)} />
                <button className="btn btn-primary" onClick={() => setStep(3)}>Verify</button>
             </div>
        )}

        {step === 3 && (
            <form onSubmit={handleReset}>
                <input className="input-field" type="password" placeholder="New Password" value={newPass} onChange={e=>setNewPass(e.target.value)} required />
                <button className="btn btn-primary" style={{width:'100%'}}>Update Password</button>
            </form>
        )}

        <div style={{marginTop:'1.5rem', textAlign:'center'}}>
           <Link to="/login" style={{color:'var(--text-secondary)', textDecoration:'none'}}>Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;