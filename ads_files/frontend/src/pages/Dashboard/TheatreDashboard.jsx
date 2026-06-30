import React from 'react';
import { Building2, Mail, Calendar, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TheatreDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="theatre-dashboard-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Theatre Portal</h1>
          <p className="page-subtitle">Account overview and portal access</p>
        </div>
      </header>

      <div className="theatre-dashboard-content">
        <div className="glass-card overview-card">
          <h2>Welcome, {user?.name || 'Theatre User'}</h2>
          <p>
            Use the sidebar to explore the platform. Any admin decision about your submitted requests
            is available only in the dedicated `Admin Responses` section.
          </p>
          <div className="overview-note">
            <MessageSquare size={18} />
            <span>Open `Admin Responses` in the sidebar to view all decisions related to your requests.</span>
          </div>
        </div>

        <div className="glass-card info-card">
          <h3 className="card-title">
            <Building2 size={20} />
            Theatre Information
          </h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Theatre Name</span>
              <span className="info-value">{user?.name || '-'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Username</span>
              <span className="info-value">@{user?.username || '-'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email Address</span>
              <span className="info-value">
                <Mail size={16} />
                {user?.email || '-'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Account Type</span>
              <span className="info-value">
                <Calendar size={16} />
                Theatre User
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .theatre-dashboard-page {
          animation: fadeIn 0.4s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .theatre-dashboard-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .overview-card,
        .info-card {
          padding: 2.5rem;
        }

        @media (max-width: 768px) {
          .overview-card,
          .info-card {
            padding: 1.5rem;
          }
        }

        .overview-card h2 {
          margin-bottom: 0.75rem;
          color: var(--text);
        }

        .overview-card p {
          color: var(--text-muted);
          line-height: 1.7;
        }

        .overview-note {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 1.5rem;
          padding: 1rem 1.25rem;
          background: rgba(99, 102, 241, 0.08);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 0.875rem;
          color: var(--text);
        }

        .overview-note svg {
          color: var(--primary);
          flex-shrink: 0;
        }

        .card-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.25rem;
          margin-bottom: 1.5rem;
          color: var(--text);
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .info-label {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          font-weight: 600;
        }

        .info-value {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text);
          font-size: 1rem;
          font-weight: 500;
          word-break: break-word;
        }
      `}</style>
    </div>
  );
};

export default TheatreDashboard;
