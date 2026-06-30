import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User, MapPin, Building2, ShieldCheck, ArrowRight, Monitor } from 'lucide-react';
import { toast } from 'react-hot-toast';

const TheatreAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    theatre_name: '',
    theatre_address: '',
    total_screens: 1,
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, loginTheatreUser, registerTheatreUser } = useAuth(); // Assume we will add these to context

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await loginTheatreUser({ username: formData.username, password: formData.password });
        toast.success('Logged in successfully!');
        navigate('/dashboard');
      } else {
        await registerTheatreUser(formData);
        toast.success('Registration successful! Please log in.');
        setIsLogin(true);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <ShieldCheck size={48} className="auth-icon" />
          <h1>Theatre Portal</h1>
          <p>{isLogin ? 'Sign in to your theatre account' : 'Register your theatre'}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Username</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
                required
              />
            </div>
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Theatre Name</label>
                <div className="input-with-icon">
                  <Building2 size={18} className="input-icon" />
                  <input
                    type="text"
                    name="theatre_name"
                    value={formData.theatre_name}
                    onChange={handleChange}
                    placeholder="Enter theatre name"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Theatre Address</label>
                <div className="input-with-icon">
                  <MapPin size={18} className="input-icon" />
                  <input
                    type="text"
                    name="theatre_address"
                    value={formData.theatre_address}
                    onChange={handleChange}
                    placeholder="Enter theatre full address"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Number of Screens</label>
                <div className="input-with-icon">
                  <Monitor size={18} className="input-icon" />
                  <input
                    type="number"
                    name="total_screens"
                    value={formData.total_screens}
                    onChange={handleChange}
                    placeholder="e.g. 5"
                    min="1"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={isLoading}>
            {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Register Theatre')}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account?" : "Already registered?"}{' '}
            <button 
              type="button" 
              className="toggle-auth-btn"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Register now' : 'Sign in instead'}
            </button>
          </p>
        </div>
      </div>

      <style>{`
        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg);
          padding: 2rem;
        }

        .auth-card {
          width: 100%;
          max-width: 480px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 3rem 2.5rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .auth-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .auth-icon {
          color: var(--primary);
          margin-bottom: 1rem;
        }

        .auth-header h1 {
          font-size: 1.75rem;
          font-weight: 800;
          color: white;
          margin-bottom: 0.5rem;
        }

        .auth-header p {
          color: var(--text-muted);
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-muted);
          margin-left: 0.25rem;
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          color: var(--text-muted);
          pointer-events: none;
        }

        .input-with-icon input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 3rem;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--border);
          border-radius: 12px;
          color: white;
          font-size: 0.95rem;
          transition: all 0.2s ease;
        }

        .input-with-icon input:focus {
          outline: none;
          border-color: var(--primary);
          background: rgba(99, 102, 241, 0.05);
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }

        .auth-submit {
          margin-top: 1rem;
          padding: 1rem;
          font-size: 1rem;
          border-radius: 12px;
          display: flex;
          justify-content: center;
          gap: 0.5rem;
        }

        .auth-footer {
          margin-top: 2rem;
          text-align: center;
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .toggle-auth-btn {
          background: none;
          border: none;
          color: var(--primary);
          font-weight: 600;
          cursor: pointer;
          padding: 0;
        }

        .toggle-auth-btn:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default TheatreAuth;
