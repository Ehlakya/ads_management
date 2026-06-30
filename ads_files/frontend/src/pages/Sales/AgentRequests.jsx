import React, { useEffect, useState } from 'react';
import { ClipboardList, Search, CheckCircle, XCircle, Building2, MapPin, DollarSign, User } from 'lucide-react';
import salesService from '../../services/salesService';
import { toast } from 'react-hot-toast';

const AgentRequests = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await salesService.getSales();
      // Filter only pending requests for this view, or show all with status?
      // User said "When the admin clicks it, the details provided here should be displayed"
      // I'll show all and highlight pending.
      setRequests(response.data);
    } catch (error) {
      toast.error('Failed to load agent requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await salesService.updateSaleStatus(id, status);
      toast.success(`Request ${status} successfully`);
      fetchRequests();
    } catch (error) {
      toast.error('Action failed');
    }
  };

  const filteredRequests = requests.filter(req => 
    req.theater_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.agent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.ad_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="agent-requests-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Agent Sales Requests</h1>
          <p className="page-subtitle">Review and authorize sales records submitted by operational agents.</p>
        </div>
      </header>

      <div className="table-controls-row">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by theater, agent, or campaign..." 
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
            <span>Scanning for pending authorizations...</span>
          </div>
        ) : (
          <table className="modern-table">
            <thead>
              <tr>
                <th>Theater & Agent</th>
                <th>Campaign Context</th>
                <th>Financials</th>
                <th>Location Details</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Authorization</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => (
                <tr key={req.id}>
                  <td>
                    <div className="theater-agent-cell">
                      <div className="theater-name">{req.theater_name}</div>
                      <div className="agent-tag">
                        <User size={12} />
                        <span>{req.agent_name}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="ad-context-cell">
                      <span className="ad-title">{req.ad_title}</span>
                    </div>
                  </td>
                  <td>
                    <div className="amount-cell">
                      <DollarSign size={14} className="text-success" />
                      <span>{Number(req.sale_amount).toLocaleString()}</span>
                    </div>
                  </td>
                  <td>
                    <div className="address-cell" title={req.theater_address}>
                      <MapPin size={14} />
                      <span className="truncate">{req.theater_address}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getStatusClass(req.status)}`}>
                      {req.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-group" style={{ justifyContent: 'flex-end' }}>
                      {req.status === 'pending' ? (
                        <>
                          <button 
                            onClick={() => handleStatusUpdate(req.id, 'approved')} 
                            className="action-btn approve"
                            title="Approve Request"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(req.id, 'rejected')} 
                            className="action-btn reject"
                            title="Reject Request"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      ) : (
                        <span className="processed-label">Processed</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-row">
                    <div className="empty-content">
                      <ClipboardList size={48} className="empty-icon" />
                      <h3>No requests found</h3>
                      <p>Agent submissions awaiting approval will appear here.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <style>{`
        .agent-requests-page {
          animation: fadeIn 0.4s ease-out;
        }

        .theater-agent-cell {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .theater-name {
          font-weight: 700;
          color: var(--text);
        }

        .agent-tag {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .ad-context-cell .ad-title {
          font-weight: 600;
          color: var(--primary);
        }

        .amount-cell {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-weight: 800;
          color: var(--text);
        }

        .address-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-muted);
          font-size: 0.875rem;
          max-width: 200px;
        }

        .truncate {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .processed-label {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--text-muted);
          opacity: 0.6;
        }

        .action-btn.approve {
          color: var(--success);
          background: rgba(16, 185, 129, 0.1);
          border-color: rgba(16, 185, 129, 0.2);
        }

        .action-btn.approve:hover {
          background: var(--success);
          color: white;
        }

        .action-btn.reject {
          color: var(--error);
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.2);
        }

        .action-btn.reject:hover {
          background: var(--error);
          color: white;
        }
      `}</style>
    </div>
  );
};

const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'approved': return 'badge-success';
    case 'pending': return 'badge-warning';
    case 'rejected': return 'badge-error';
    default: return 'badge-info';
  }
};

export default AgentRequests;
