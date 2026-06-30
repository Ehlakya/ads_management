import React, { useEffect, useState } from 'react';
import { UserPlus, Search, Shield, User as UserIcon, Trash2, ShieldCheck, Mail, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import userService from '../../services/userService';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const UserList = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await userService.getUsers();
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="users-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Team Management</h1>
          <p className="page-subtitle">
            {currentUser?.role === 'superadmin' 
              ? 'Comprehensive overview of all administrators and operational agents.' 
              : 'Direct oversight of your active team of agents.'}
          </p>
        </div>
        <div className="header-actions">
          {currentUser?.role === 'superadmin' ? (
            <button onClick={() => navigate('/users/create-admin')} className="btn-primary">
              <UserPlus size={18} />
              <span>Create Admin</span>
            </button>
          ) : (
            <button onClick={() => navigate('/users/create-agent')} className="btn-primary">
              <UserPlus size={18} />
              <span>Create Agent</span>
            </button>
          )}
        </div>
      </header>

      <div className="table-controls-row">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by name or username..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-card table-container">
        {isLoading ? (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <span>Loading user directory...</span>
          </div>
        ) : (
          <table className="modern-table">
            <thead>
              <tr>
                <th>Identity</th>
                <th>Username</th>
                <th>Role & Permissions</th>
                <th>Registration Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-identity">
                      <div className={`avatar-box ${user.role}`}>
                        {user.name[0].toUpperCase()}
                      </div>
                      <div className="identity-text">
                        <span className="full-name">{user.name}</span>
                        <span className="user-id">#{String(user.id).padStart(4, '0')}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="username-cell">
                      <Mail size={14} className="text-muted" />
                      <span>{user.username}</span>
                    </div>
                  </td>
                  <td>
                    <div className={`role-badge-modern ${user.role}`}>
                      {getRoleIcon(user.role)}
                      <span>{user.role}</span>
                    </div>
                  </td>
                  <td>
                    <div className="date-cell">
                      <Calendar size={14} className="text-muted" />
                      <span>{new Date(user.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                    </div>
                  </td>
                  <td>
                    <div className="action-group">
                      <button className="action-btn delete" title="Revoke Access">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="empty-row">
                    <div className="empty-content">
                      <UserIcon size={48} className="empty-icon" />
                      <h3>No team members found</h3>
                      <p>Your search didn't match any users in the directory.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <style>{`
        .users-page {
          animation: fadeIn 0.4s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .user-identity {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .avatar-box {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.125rem;
          color: white;
          border: 1px solid var(--glass-border);
        }

        .avatar-box.superadmin { background: linear-gradient(135deg, #6366f1, #8b5cf6); }
        .avatar-box.admin { background: linear-gradient(135deg, #ec4899, #f43f5e); }
        .avatar-box.agent { background: linear-gradient(135deg, #10b981, #059669); }

        .identity-text {
          display: flex;
          flex-direction: column;
        }

        .full-name {
          font-weight: 600;
          color: var(--text);
        }

        .user-id {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-family: monospace;
        }

        .username-cell, .date-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-muted);
        }

        .role-badge-modern {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.375rem 0.875rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.025em;
          border: 1px solid transparent;
        }

        .role-badge-modern.superadmin { 
          background: rgba(99, 102, 241, 0.1); 
          color: #818cf8; 
          border-color: rgba(99, 102, 241, 0.2);
        }
        .role-badge-modern.admin { 
          background: rgba(236, 72, 153, 0.1); 
          color: #f472b6; 
          border-color: rgba(236, 72, 153, 0.2);
        }
        .role-badge-modern.agent { 
          background: rgba(16, 185, 129, 0.1); 
          color: #34d399; 
          border-color: rgba(16, 185, 129, 0.2);
        }

        .table-controls-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .search-wrapper {
          position: relative;
          width: 100%;
          max-width: 400px;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .search-input {
          padding-left: 2.75rem;
          background: var(--surface);
        }
      `}</style>
    </div>
  );
};

const getRoleIcon = (role) => {
  switch (role) {
    case 'superadmin': return <ShieldCheck size={14} />;
    case 'admin': return <Shield size={14} />;
    default: return <UserIcon size={14} />;
  }
};

export default UserList;
