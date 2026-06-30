import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { 
  LayoutDashboard, 
  Users, 
  Megaphone, 
  FileText, 
  TrendingUp, 
  Settings,
  ShieldCheck,
  ClipboardList,
  MessageSquare,
  Building2,
  Bell,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard', roles: ['superadmin', 'admin', 'agent', 'theatre_user'] },
    { name: 'Ads Management', icon: <Megaphone size={20} />, path: '/ads', roles: ['superadmin', 'admin'] },
    { name: 'Quotations', icon: <FileText size={20} />, path: '/quotations', roles: ['superadmin', 'admin', 'agent', 'theatre_user'] },
    { name: 'Theatre Requests', icon: <Building2 size={20} />, path: '/theatre-requests', roles: ['superadmin', 'admin'] },
    { name: 'Theatre Responses', icon: <MessageSquare size={20} />, path: '/theatre-responses', roles: ['superadmin', 'admin'] },
    { name: 'Admin Requests', icon: <Bell size={20} />, path: '/admin-requests', roles: ['theatre_user'] },
    { name: 'Agent Responses', icon: <ClipboardList size={20} />, path: '/sales/requests', roles: ['superadmin', 'admin'] },
    { name: 'Admin Responses', icon: <MessageSquare size={20} />, path: '/sales/responses', roles: ['agent', 'theatre_user'] },
    { name: 'Users', icon: <Users size={20} />, path: '/users', roles: ['superadmin', 'admin'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <ShieldCheck size={32} className="logo-icon" />
        <span className="logo-text">AdManager</span>
        <button className="mobile-close-btn" onClick={onClose}>
          <X size={24} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {filteredItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => {
              if (window.innerWidth <= 1024) onClose();
            }}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>


      <style>{`
        .sidebar {
          width: 260px;
          height: 100vh;
          background: var(--surface);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 1.5rem 1rem;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 50;
        }

        .mobile-close-btn {
          display: none;
          background: none;
          color: var(--text-muted);
          padding: 0.5rem;
          margin-left: auto;
        }

        @media (max-width: 1024px) {
          .sidebar {
            position: fixed;
            left: 0;
            top: 0;
            transform: translateX(-100%);
          }
          
          .sidebar.open {
            transform: translateX(0);
          }

          .mobile-close-btn {
            display: flex;
          }
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0 0.5rem 2rem;
        }

        .logo-icon {
          color: var(--primary);
        }

        .logo-text {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          background: linear-gradient(135deg, #fff, #94a3b8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          color: var(--text-muted);
          transition: all 0.2s ease;
          font-weight: 500;
          text-decoration: none;
        }

        .nav-item:hover {
          color: var(--text);
          background: var(--glass);
        }

        .nav-item.active {
          color: white;
          background: var(--primary);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .sidebar-footer {
          margin-top: auto;
          padding-top: 1rem;
          border-top: 1px solid var(--border);
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
