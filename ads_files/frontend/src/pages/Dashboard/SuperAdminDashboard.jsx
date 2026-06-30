import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Megaphone, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const data = [
  { name: 'Mon', sales: 4000, ads: 2400 },
  { name: 'Tue', sales: 3000, ads: 1398 },
  { name: 'Wed', sales: 2000, ads: 9800 },
  { name: 'Thu', sales: 2780, ads: 3908 },
  { name: 'Fri', sales: 1890, ads: 4800 },
  { name: 'Sat', sales: 2390, ads: 3800 },
  { name: 'Sun', sales: 3490, ads: 4300 },
];

const StatCard = ({ title, value, icon, trend, trendValue }) => (
  <div className="glass-card stat-card">
    <div className="stat-header">
      <div className={`stat-icon ${title.toLowerCase().replace(' ', '-')}`}>
        {icon}
      </div>
      <button className="icon-btn">
        <MoreVertical size={16} />
      </button>
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
      <span className="since">vs last month</span>
    </div>
  </div>
);

const SuperAdminDashboard = () => {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1 className="page-title">Super Admin Overview</h1>
          <p className="subtitle">Welcome back! Here's what's happening today.</p>
        </div>
        <button className="btn-primary">Generate Report</button>
      </header>

      <div className="stats-grid">
        <StatCard title="Total Revenue" value="$45,231.89" icon={<DollarSign size={20} />} trend="up" trendValue="+12.5%" />
        <StatCard title="Active Ads" value="1,284" icon={<Megaphone size={20} />} trend="up" trendValue="+3.2%" />
        <StatCard title="Total Users" value="892" icon={<Users size={20} />} trend="down" trendValue="-2.1%" />
        <StatCard title="Conversion Rate" value="4.8%" icon={<TrendingUp size={20} />} trend="up" trendValue="+1.5%" />
      </div>

      <div className="charts-grid">
        <div className="glass-card chart-container">
          <div className="chart-header">
            <h2>Revenue & Ads Performance</h2>
            <select className="chart-select">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            {/* We'll use a placeholder or install recharts if needed, but for now I'll just style it */}
            <div className="chart-placeholder">
              <div className="bar-mock"></div>
              <div className="bar-mock"></div>
              <div className="bar-mock"></div>
              <div className="bar-mock"></div>
              <div className="bar-mock"></div>
              <div className="bar-mock"></div>
            </div>
          </div>
        </div>

        <div className="glass-card recent-activity">
          <div className="chart-header">
            <h2>Recent Activities</h2>
            <button className="text-btn">View All</button>
          </div>
          <div className="activity-list">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="activity-item">
                <div className="activity-avatar"></div>
                <div className="activity-info">
                  <p className="activity-text"><strong>John Doe</strong> created a new ad campaign <span>#AD-2024</span></p>
                  <p className="activity-time">2 hours ago</p>
                </div>
              </div>
            ))}
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
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .subtitle {
          color: var(--text-muted);
          margin-top: 0.25rem;
          margin-bottom: 0;
          font-size: 1rem;
        }

        @media (max-width: 640px) {
          .dashboard-header {
            align-items: flex-start;
          }
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
        }

        .stat-card {
          padding: 1.5rem;
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .stat-icon.total-revenue { background: #3b82f6; }
        .stat-icon.active-ads { background: #ec4899; }
        .stat-icon.total-users { background: #8b5cf6; }
        .stat-icon.conversion-rate { background: #22c55e; }

        .stat-content h3 {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .stat-content p {
          color: var(--text-muted);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .stat-footer {
          margin-top: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .trend {
          display: flex;
          align-items: center;
          font-weight: 600;
        }

        .trend.up { color: var(--success); }
        .trend.down { color: var(--error); }

        .since {
          color: var(--text-muted);
        }

        .charts-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1.5rem;
        }

        @media (max-width: 1200px) {
          .charts-grid {
            grid-template-columns: 1fr;
          }
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .chart-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
        }

        .chart-select {
          width: auto;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }

        .chart-placeholder {
          height: 100%;
          display: flex;
          align-items: flex-end;
          gap: 1rem;
          padding: 1rem;
          background: rgba(0,0,0,0.2);
          border-radius: 0.5rem;
        }

        .bar-mock {
          flex: 1;
          background: linear-gradient(to top, var(--primary), var(--accent));
          border-radius: 4px 4px 0 0;
        }

        .bar-mock:nth-child(1) { height: 60%; }
        .bar-mock:nth-child(2) { height: 40%; }
        .bar-mock:nth-child(3) { height: 90%; }
        .bar-mock:nth-child(4) { height: 55%; }
        .bar-mock:nth-child(5) { height: 75%; }
        .bar-mock:nth-child(6) { height: 65%; }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .activity-item {
          display: flex;
          gap: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border);
        }

        .activity-item:last-child {
          border-bottom: none;
        }

        .activity-avatar {
          width: 36px;
          height: 36px;
          background: var(--surface-light);
          border-radius: 50%;
        }

        .activity-info p {
          font-size: 0.875rem;
        }

        .activity-time {
          color: var(--text-muted);
          font-size: 0.75rem !important;
          margin-top: 2px;
        }

        .text-btn {
          background: none;
          color: var(--primary);
          font-weight: 600;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
};

export default SuperAdminDashboard;
