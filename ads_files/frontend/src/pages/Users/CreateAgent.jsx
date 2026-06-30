import React, { useState } from 'react';
import { UserPlus, User, Lock, UserCheck, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import userService from '../../services/userService';
import { toast } from 'react-hot-toast';

const CreateAgent = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await userService.createAgent(formData);
      toast.success('Agent created successfully!');
      navigate('/dashboard'); // Agents don't have a user list yet, redirect to dashboard
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create agent');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-agent-container">
      <header className="page-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <div>
          <h1 className="page-title">Create New Agent</h1>
          <p className="subtitle">Register a new agent to handle ad campaigns.</p>
        </div>
      </header>

      <div className="form-wrapper glass-card">
        <div className="form-icon">
          <UserPlus size={32} />
        </div>

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-grid">
            <div className="input-group">
              <label>Full Name</label>
              <div className="input-wrapper">
                <UserCheck size={18} className="input-icon" />
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Sarah Connor"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Username</label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  name="username"
                  placeholder="e.g. agent_sarah"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-info">
            <p>Note: This user will automatically be assigned the <strong>Agent</strong> role.</p>
          </div>

          <button type="submit" className="btn-primary submit-btn" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Agent Account'}
          </button>
        </form>
      </div>

      <style>{`
        .create-agent-container {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .back-btn {
          background: none;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-muted);
          margin-bottom: 1rem;
        }

        .back-btn:hover {
          color: var(--text);
        }

        .form-wrapper {
          padding: 3rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .form-icon {
          width: 64px;
          height: 64px;
          background: var(--glass);
          border-radius: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--secondary);
          margin-bottom: 2rem;
          border: 1px solid var(--border);
        }

        .admin-form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        .input-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-muted);
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .input-wrapper input {
          padding-left: 40px;
        }

        .form-info {
          background: rgba(236, 72, 153, 0.05);
          border: 1px solid rgba(236, 72, 153, 0.1);
          padding: 1rem;
          border-radius: 0.5rem;
          text-align: center;
        }

        .form-info p {
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .form-info strong {
          color: var(--secondary);
        }

        .submit-btn {
          width: 100%;
          justify-content: center;
          background: linear-gradient(135deg, var(--secondary), var(--accent));
        }
      `}</style>
    </div>
  );
};

export default CreateAgent;
