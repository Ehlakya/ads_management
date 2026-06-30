import React from 'react';
import { UserPlus, Megaphone, FileText, TrendingUp, ArrowUpRight, ArrowDownRight, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon, trend, trendValue }) => (
  <div className="glass-card stat-card">
    <div className="stat-header">
      <div className="stat-icon">{icon}</div>
      <button className="icon-btn"><MoreVertical size={16} /></button>
    </div>
    <div className="stat-content">
      <h3>{value}</h3>
      <p>{title}</p>
    </div>
    <div className="stat-footer">
      <span className={`trend ${trend}`}>
        {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {trendValue}
      </span>
      <span className="since">vs last week</span>
    </div>
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="subtitle">Manage your agents and advertising operations.</p>
        </div>
      </header>

      <div className="stats-grid">
        <StatCard title="Team Performance" value="94%" icon={<TrendingUp size={20} />} trend="up" trendValue="+5.2%" />
        <StatCard title="Total Ads Managed" value="412" icon={<Megaphone size={20} />} trend="up" trendValue="+12%" />
        <StatCard title="Pending Quotations" value="28" icon={<FileText size={20} />} trend="down" trendValue="-3" />
      </div>

      <div className="glass-card welcome-banner">
        <div className="banner-content">
          <h2>Welcome to the Admin Portal</h2>
          <p>You can now manage your agents, review their ad submissions, and track sales performance in real-time.</p>
          <div className="banner-actions">
            <button onClick={() => navigate('/ads')} className="btn-primary">View All Ads</button>
            <button onClick={() => navigate('/theatre-requests')} className="btn-secondary">Manage Theatre Requests</button>
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .subtitle {
          color: var(--text-muted);
          margin-top: 0.25rem;
          margin-bottom: 0;
          font-size: 1rem;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .btn-secondary {
          background: var(--glass);
          border: 1px solid var(--glass-border);
          color: var(--text);
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
        }

        .btn-secondary:hover {
          background: var(--surface-light);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
        }

        .welcome-banner {
          padding: 3rem;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(236, 72, 153, 0.1));
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        @media (max-width: 768px) {
          .welcome-banner {
            padding: 1.5rem;
          }
        }

        .banner-content {
          max-width: 600px;
        }

        .banner-content h2 {
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        .banner-content p {
          color: var(--text-muted);
          margin-bottom: 2rem;
          font-size: 1.125rem;
        }

        .banner-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .banner-actions .btn-primary,
        .banner-actions .btn-secondary {
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
