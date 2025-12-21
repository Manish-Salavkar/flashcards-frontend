import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, LayoutDashboard } from 'lucide-react'; // Added LayoutDashboard icon
import { AuthContext } from '../context/providers';

const Home = () => {
  // 1. Get the token from Context to check auth status
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="auth-page">
      <div className="card" style={{textAlign:'center', maxWidth:'500px'}}>
        <h1 style={{fontSize:'2.5rem', marginBottom:'0.5rem'}}>FlashMind</h1>
        <p style={{color:'var(--text-secondary)', marginBottom:'2rem'}}>
          Master any subject with minimal effort.
        </p>
        
        <div style={{display:'flex', gap:'1rem', flexDirection:'column'}}>
          
          {/* CONDITIONAL RENDERING */}
          {token ? (
            // OPTION A: User is Logged In (Token exists)
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
              <LayoutDashboard size={20} /> Continue to Dashboard
            </button>
          ) : (
            // OPTION B: User is Guest/Logged Out
            <>
              <button className="btn btn-primary" onClick={() => navigate('/login')}>
                Sign In to Account
              </button>
              
              {/* In our new system, Guest mode is simply navigating without a token */}
              <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>
                Continue without Login <ArrowRight size={16}/>
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default Home;