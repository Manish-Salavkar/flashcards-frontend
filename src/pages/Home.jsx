import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, LayoutDashboard, Zap, LogIn } from 'lucide-react';
import { AuthContext } from '../context/providers';

const Home = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="auth-page">
      <div style={{textAlign: 'center', maxWidth: '600px', animation: 'slideUp 0.5s ease-out'}}>
        
        <div style={{
          width: 64, height: 64, background: 'linear-gradient(135deg, var(--primary) 0%, #818cf8 100%)', 
          borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 2rem auto', boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.4)'
        }}>
          <Zap size={32} color="white" fill="white" />
        </div>

        <h1 style={{fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', letterSpacing: '-0.025em', lineHeight: 1.1}}>
          Learn faster with <span style={{color: 'var(--primary)'}}>FlashMind</span>
        </h1>
        
        <p style={{fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: '3rem', lineHeight: 1.6}}>
          The minimalist flashcard tool for students and lifelong learners. 
          Create, organize, and master your knowledge.
        </p>
        
        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '320px', margin: '0 auto'}}>
          {token ? (
            <button className="btn btn-primary" style={{height: '48px', fontSize: '1rem'}} onClick={() => navigate('/dashboard')}>
              <LayoutDashboard size={20} /> Go to Dashboard
            </button>
          ) : (
            <>
              <button className="btn btn-primary" style={{height: '48px', fontSize: '1rem'}} onClick={() => navigate('/login')}>
                <LogIn size={20} /> Sign In to Account
              </button>
              
              <button className="btn btn-outline" style={{height: '48px', fontSize: '1rem', justifyContent: 'center'}} onClick={() => navigate('/register')}>
                Create an Account <ArrowRight size={18}/>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;