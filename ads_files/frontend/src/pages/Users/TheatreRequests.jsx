import React, { useEffect, useState } from 'react';
import { Search, CheckCircle, XCircle, Clock, Building2, Mail, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import authService from '../../services/authService';

const TheatreRequests = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await authService.getTheatreRequests();
      setRequests(response.data);
    } catch (error) {
      toast.error('Failed to fetch theatre requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setIsProcessing(true);
    try {
      await authService.approveTheatreRequest(id);
      toast.success('Theatre request approved successfully');
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    setIsProcessing(true);
    try {
      await authService.rejectTheatreRequest(selectedRequest.id, rejectReason);
      toast.success('Theatre request rejected successfully');
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject request');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredRequests = requests.filter((request) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      request.theatre_name.toLowerCase().includes(search) ||
      request.username.toLowerCase().includes(search) ||
      request.email.toLowerCase().includes(search) ||
      request.theatre_address.toLowerCase().includes(search);

    const matchesFilter = statusFilter === 'all' || request.status === statusFilter;

    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <div className="status-badge pending"><Clock size={14} /> Pending</div>;
      case 'accepted':
        return <div className="status-badge accepted"><CheckCircle size={14} /> Approved</div>;
      case 'rejected':
        return <div className="status-badge rejected"><XCircle size={14} /> Rejected</div>;
      default:
        return null;
    }
  };

  const getDetailSteps = (request) => [
    { label: 'Username', value: `@${request.username}`, icon: <CheckCircle size={16} /> },
    { label: 'Email', value: request.email, icon: <Mail size={16} /> },
    { label: 'Theatre Name', value: request.theatre_name, icon: <Building2 size={16} /> },
    { label: 'Theatre Address', value: request.theatre_address, icon: <MapPin size={16} /> },
  ];

  return (
    <div className="theatre-requests-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Theatre Registration Requests</h1>
          <p className="page-subtitle">Review each theatre user in order and approve or reject the request quickly.</p>
        </div>
      </header>

      <div className="filters-row">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by theatre name, username, email or address..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-buttons">
          <button className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`} onClick={() => setStatusFilter('all')}>
            All
          </button>
          <button className={`filter-btn ${statusFilter === 'pending' ? 'active' : ''}`} onClick={() => setStatusFilter('pending')}>
            Pending
          </button>
          <button className={`filter-btn ${statusFilter === 'accepted' ? 'active' : ''}`} onClick={() => setStatusFilter('accepted')}>
            Approved
          </button>
          <button className={`filter-btn ${statusFilter === 'rejected' ? 'active' : ''}`} onClick={() => setStatusFilter('rejected')}>
            Rejected
          </button>
        </div>
      </div>

      <div className="requests-section">
        {isLoading ? (
          <div className="glass-card loading-overlay">
            <div className="spinner"></div>
            <span>Loading theatre requests...</span>
          </div>
        ) : filteredRequests.length > 0 ? (
          <div className="request-cards">
            {filteredRequests.map((request) => (
              <article key={request.id} className="glass-card request-card">
                <div className="request-card-header">
                  <div className="theatre-info">
                    <div className="theatre-avatar">
                      {request.theatre_name[0].toUpperCase()}
                    </div>
                    <div className="theatre-details">
                      <span className="theatre-name">{request.theatre_name}</span>
                      <span className="request-meta">Review the theatre details below before taking action.</span>
                    </div>
                  </div>

                  <div className="header-actions">
                    {getStatusBadge(request.status)}

                    {request.status === 'pending' && (
                      <div className="top-actions">
                        <button
                          className="top-action-btn approve"
                          onClick={() => handleApprove(request.id)}
                          disabled={isProcessing}
                        >
                          <CheckCircle size={16} />
                          <span>Accept</span>
                        </button>
                        <button
                          className="top-action-btn reject"
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowRejectModal(true);
                          }}
                          disabled={isProcessing}
                        >
                          <XCircle size={16} />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="request-steps">
                  {getDetailSteps(request).map((field, index) => (
                    <div key={field.label} className="detail-step">
                      <div className="step-number">{index + 1}</div>
                      <div className="step-icon">{field.icon}</div>
                      <div className="step-content">
                        <span className="step-label">{field.label}</span>
                        <span className="step-value">{field.value}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {request.status === 'rejected' && request.rejection_reason && (
                  <div className="response-note rejected-note">
                    <span className="note-label">Rejection Reason</span>
                    <p>{request.rejection_reason}</p>
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="glass-card empty-content">
            <Building2 size={48} className="empty-icon" />
            <h3>No theatre requests found</h3>
            <p>Your search didn't match any theatre registration requests.</p>
          </div>
        )}
      </div>

      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Reject Theatre Request</h2>
            <p>Theatre: <strong>{selectedRequest?.theatre_name}</strong></p>

            <div className="form-group">
              <label>Rejection Reason (Optional)</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Provide a reason for rejection..."
                rows="4"
                className="modal-textarea"
              />
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowRejectModal(false)} disabled={isProcessing}>
                Cancel
              </button>
              <button className="btn-danger" onClick={handleReject} disabled={isProcessing}>
                {isProcessing ? 'Processing...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .theatre-requests-page {
          animation: fadeIn 0.4s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .filters-row {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          align-items: center;
        }

        .search-wrapper {
          position: relative;
          flex: 1;
          min-width: 300px;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .search-input {
          width: 100%;
          padding-left: 2.75rem;
          background: var(--surface);
          border: 1px solid var(--glass-border);
          border-radius: 0.5rem;
          color: var(--text);
          padding: 0.75rem 1rem 0.75rem 2.75rem;
          font-size: 0.95rem;
        }

        .search-input::placeholder {
          color: var(--text-muted);
        }

        .filter-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 0.5rem 1rem;
          background: var(--surface);
          border: 1px solid var(--glass-border);
          border-radius: 0.5rem;
          color: var(--text-muted);
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .filter-btn:hover {
          color: var(--text);
          border-color: var(--accent);
        }

        .filter-btn.active {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }

        .requests-section {
          min-height: 240px;
        }

        .request-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
          gap: 1.5rem;
        }

        .request-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .request-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          flex-wrap: wrap;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--glass-border);
        }

        .theatre-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .theatre-avatar {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.2rem;
          color: white;
          background: linear-gradient(135deg, #f43f5e, #ec4899);
          border: 1px solid var(--glass-border);
          flex-shrink: 0;
        }

        .theatre-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .theatre-name {
          font-weight: 700;
          color: var(--text);
          font-size: 1.05rem;
        }

        .request-meta {
          font-size: 0.82rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .status-badge {
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

        .status-badge.pending {
          background: rgba(245, 158, 11, 0.1);
          color: #fbbf24;
          border-color: rgba(245, 158, 11, 0.2);
        }

        .status-badge.accepted {
          background: rgba(16, 185, 129, 0.1);
          color: #34d399;
          border-color: rgba(16, 185, 129, 0.2);
        }

        .status-badge.rejected {
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
          border-color: rgba(239, 68, 68, 0.2);
        }

        .top-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .top-action-btn {
          height: 40px;
          padding: 0 1rem;
          border-radius: 8px;
          border: 1px solid var(--glass-border);
          background: var(--surface);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .top-action-btn.approve {
          background: rgba(16, 185, 129, 0.12);
          color: #34d399;
          border-color: rgba(16, 185, 129, 0.25);
        }

        .top-action-btn.approve:hover:not(:disabled) {
          border-color: #34d399;
          background: rgba(16, 185, 129, 0.18);
        }

        .top-action-btn.reject {
          background: rgba(239, 68, 68, 0.12);
          color: #f87171;
          border-color: rgba(239, 68, 68, 0.25);
        }

        .top-action-btn.reject:hover:not(:disabled) {
          border-color: #f87171;
          background: rgba(239, 68, 68, 0.18);
        }

        .top-action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .request-steps {
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
        }

        .detail-step {
          display: flex;
          align-items: flex-start;
          padding: 0.9rem 1rem;
          border: 1px solid var(--glass-border);
          border-radius: 0.875rem;
          background: rgba(255, 255, 255, 0.02);
        }

        .step-number {
          width: 28px;
          height: 28px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(99, 102, 241, 0.14);
          color: var(--accent);
          font-size: 0.8rem;
          font-weight: 700;
          flex-shrink: 0;
          margin-right: 0.75rem;
        }

        .step-icon {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.04);
          color: var(--text-muted);
          flex-shrink: 0;
          margin-right: 0.75rem;
        }

        .step-content {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          min-width: 0;
          flex: 1;
        }

        .step-label {
          color: var(--text-muted);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .step-value {
          color: var(--text);
          font-size: 0.95rem;
          line-height: 1.45;
          word-break: break-word;
        }

        .response-note {
          padding: 1rem;
          border-radius: 0.875rem;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .note-label {
          display: inline-block;
          margin-bottom: 0.5rem;
          color: #f87171;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .response-note p {
          margin: 0;
          color: var(--text-muted);
          line-height: 1.6;
        }

        .loading-overlay {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          min-height: 220px;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid var(--glass-border);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: var(--surface);
          border-radius: 1rem;
          padding: 2rem;
          max-width: 500px;
          width: 90%;
          border: 1px solid var(--glass-border);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .modal-content h2 {
          margin-bottom: 1rem;
          color: var(--text);
        }

        .modal-content p {
          color: var(--text-muted);
          margin-bottom: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          color: var(--text);
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .modal-textarea {
          width: 100%;
          padding: 0.75rem;
          background: var(--surface-light);
          border: 1px solid var(--glass-border);
          border-radius: 0.5rem;
          color: var(--text);
          font-family: inherit;
          resize: vertical;
        }

        .modal-textarea::placeholder {
          color: var(--text-muted);
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .btn-secondary {
          padding: 0.75rem 1.5rem;
          background: var(--surface-light);
          border: 1px solid var(--glass-border);
          border-radius: 0.5rem;
          color: var(--text);
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .btn-secondary:hover:not(:disabled) {
          background: var(--surface-light);
          border-color: var(--accent);
        }

        .btn-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-danger {
          padding: 0.75rem 1.5rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid #f87171;
          border-radius: 0.5rem;
          color: #f87171;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .btn-danger:hover:not(:disabled) {
          background: #ef4444;
          color: white;
          border-color: #ef4444;
        }

        .btn-danger:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .empty-content {
          text-align: center;
          padding: 3rem 1rem;
        }

        .empty-icon {
          color: var(--text-muted);
          margin-bottom: 1rem;
        }

        .empty-content h3 {
          color: var(--text);
          margin-bottom: 0.5rem;
        }

        .empty-content p {
          color: var(--text-muted);
        }

        @media (max-width: 640px) {
          .request-card-header {
            flex-direction: column;
          }

          .header-actions {
            width: 100%;
            justify-content: flex-start;
          }

          .top-actions {
            width: 100%;
          }

          .top-action-btn {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default TheatreRequests;
