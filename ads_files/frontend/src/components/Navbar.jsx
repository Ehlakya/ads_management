import { LogOut, Bell, User, Search, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="menu-toggle-btn" onClick={onToggleSidebar}>
          <Menu size={24} />
        </button>
        <div className="search-container">
          <Search size={20} className="search-icon" />
          <input type="text" placeholder="Search..." className="search-input" />
        </div>
      </div>

      <div className="nav-actions">
        <button className="icon-btn bell-btn">
          <Bell size={20} />
        </button>
        
        <div className="user-profile">
          <div className="user-info">
            <span className="user-name">{user?.name || 'Admin'}</span>
            <span className="user-role">{user?.role?.replace('_', ' ') || 'Super Admin'}</span>
          </div>
          <div className="avatar">
            {user?.name?.[0] || 'A'}
          </div>
        </div>

        <button onClick={logout} className="logout-btn">
          <LogOut size={20} />
          <span className="logout-text">Logout</span>
        </button>
      </div>

      <style>{`
        .navbar {
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          z-index: 30;
        }

        .navbar-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .menu-toggle-btn {
          display: none;
          background: none;
          color: var(--text);
          padding: 8px;
          border-radius: 8px;
        }

        .search-container {
          position: relative;
          width: 300px;
          transition: all 0.3s ease;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .search-input {
          padding-left: 40px;
          background: var(--background);
          border: 1px solid var(--border);
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .icon-btn {
          background: none;
          color: var(--text-muted);
          padding: 8px;
          border-radius: 8px;
        }

        .icon-btn:hover {
          color: var(--text);
          background: var(--glass);
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 4px 0 4px 12px;
          border-left: 1px solid var(--border);
        }

        .user-info {
          display: flex;
          flex-direction: column;
          text-align: right;
        }

        .user-name {
          font-weight: 600;
          font-size: 0.875rem;
          white-space: nowrap;
        }

        .user-role {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: capitalize;
        }

        .avatar {
          width: 38px;
          height: 38px;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
          flex-shrink: 0;
        }

        .logout-btn {
          background: none;
          color: var(--error);
          padding: 8px 12px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        @media (max-width: 1024px) {
          .menu-toggle-btn {
            display: flex;
          }
          .navbar {
            padding: 0 1rem;
          }
        }

        @media (max-width: 768px) {
          .search-container {
            width: 40px;
            overflow: hidden;
          }
          .search-container:focus-within {
            position: absolute;
            left: 1rem;
            right: 1rem;
            width: calc(100% - 2rem);
            background: var(--surface);
            z-index: 40;
          }
          .user-info {
            display: none;
          }
          .user-profile {
            border-left: none;
            padding-left: 0;
          }
          .logout-text {
            display: none;
          }
          .bell-btn {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
