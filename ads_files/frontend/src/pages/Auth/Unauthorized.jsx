import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="unauthorized-container">
      <div className="glass-card error-card">
        <div className="error-icon">
          <ShieldAlert size={64} />
        </div>
        <h1>Access Denied</h1>
        <p>You do not have the required permissions to view this page. Please contact your administrator if you believe this is an error.</p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary">
          <ArrowLeft size={18} />
          <span>Return to Dashboard</span>
        </button>
      </div>

      <style>{`
        .unauthorized-container {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at top right, #1e1b4b, #0f172a);
          padding: 2rem;
        }

        .error-card {
          max-width: 500px;
          padding: 4rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        .error-icon {
          color: var(--error);
          background: rgba(239, 68, 68, 0.1);
          padding: 1.5rem;
          border-radius: 2rem;
          margin-bottom: 1rem;
        }

        .error-card h1 {
          font-size: 2.5rem;
          font-weight: 800;
          color: white;
        }

        .error-card p {
          color: var(--text-muted);
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
};

export default Unauthorized;
