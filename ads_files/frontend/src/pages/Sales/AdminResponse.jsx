import React, { useEffect, useState } from 'react';
import { ShieldCheck, Clock, XCircle, Building2, Megaphone, DollarSign, MessageSquare, CheckCircle } from 'lucide-react';
import salesService from '../../services/salesService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import authService from '../../services/authService';
import quotationService from '../../services/quotationService';

const AdminResponse = () => {
  const { user } = useAuth();
  const [myRequests, setMyRequests] = useState([]);
  const [quotationRequests, setQuotationRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      if (user.role === 'theatre_user') {
        const [regResponse, quoteResponse] = await Promise.all([
          authService.getTheatreRequestStatus(user.id),
          quotationService.getMyRequests()
        ]);
        
        setMyRequests(regResponse.data ? [regResponse.data] : []);
        setQuotationRequests(quoteResponse.data || []);
        return;
      }

      const response = await salesService.getSales();
      const filtered = response.data.filter(req => req.agent_id === user.id);
      setMyRequests(filtered);
    } catch (error) {
      toast.error('Failed to load response data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-response-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Admin Response Hub</h1>
          <p className="page-subtitle">
            {user.role === 'theatre_user'
              ? 'View all admin decisions related to your submitted theatre requests.'
              : 'Track the authorization status of your submitted sales requests.'}
          </p>
        </div>
      </header>

      <div className="responses-grid">
        {isLoading ? (
          <div className="loading-state">Loading your requests...</div>
        ) : (myRequests.length > 0 || quotationRequests.length > 0) ? (
          <>
            {/* Theatre Registration Requests */}
            {myRequests.map((req) => {
              const status = req.status;
              const cardClass = status === 'accepted' ? 'approved' : status;

              return (
                <div key={`reg-${req.id}`} className={`response-card glass-card ${cardClass}`}>
                  <div className="card-badge">
                    {status === 'accepted' ? <ShieldCheck size={20} /> : status === 'rejected' ? <XCircle size={20} /> : <Clock size={20} />}
                    <span>THEATRE REGISTRATION: {status.toUpperCase()}</span>
                  </div>
                  
                  <div className="card-body">
                    <div className="campaign-box">
                      <Building2 size={16} />
                      <h4>{req.theatre_name}</h4>
                    </div>
                    <div className="info-row">
                      <MessageSquare size={16} className="text-muted" />
                      <span>Theatre registration request</span>
                    </div>
                    <div className="info-row">
                      <Clock size={16} className="text-muted" />
                      <span>Submitted: {new Date(req.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                    </div>
                  </div>

                  <div className="admin-feedback">
                    <div className="feedback-header">
                      <MessageSquare size={14} />
                      <span>Official Response</span>
                    </div>
                    <p>
                      {status === 'accepted'
                        ? 'Your theatre registration request has been accepted by the admin.'
                        : status === 'rejected'
                        ? 'Your theatre registration request has been rejected by the admin.'
                        : 'Your theatre registration request is currently under review.'}
                    </p>
                    {req.rejection_reason && (
                      <div className="reason-box">
                        <span className="reason-label">Reason</span>
                        <p>{req.rejection_reason}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="card-footer">
                    <span>{req.approved_at ? `Approved on ${new Date(req.approved_at).toLocaleDateString()}` : `Submitted on ${new Date(req.created_at).toLocaleDateString()}`}</span>
                  </div>
                </div>
              );
            })}

            {/* Ad Quotation Requests */}
            {quotationRequests.map((req) => {
              const status = req.admin_response || 'pending';
              const cardClass = status === 'accepted' ? 'approved' : status === 'rejected' ? 'rejected' : 'pending';

              return (
                <div key={`quote-${req.id}`} className={`response-card glass-card ${cardClass}`}>
                  <div className="card-badge">
                    {status === 'accepted' ? <CheckCircle size={20} /> : status === 'rejected' ? <XCircle size={20} /> : <Clock size={20} />}
                    <span>CAMPAIGN REQUEST: {status.toUpperCase()}</span>
                  </div>
                  
                  <div className="card-body">
                    <div className="campaign-box">
                      <Megaphone size={16} />
                      <h4>{req.Ad?.title || 'Ad Campaign'}</h4>
                    </div>
                    <div className="info-row">
                      <Building2 size={16} className="text-muted" />
                      <span>{req.Ad?.client || 'N/A'}</span>
                    </div>
                    <div className="info-row">
                      <DollarSign size={16} className="text-muted" />
                      <span className="amount">{req.amount ? `$${Number(req.amount).toLocaleString()}` : 'Price Pending'}</span>
                    </div>
                  </div>

                  <div className="admin-feedback">
                    <div className="feedback-header">
                      <MessageSquare size={14} />
                      <span>Admin Response</span>
                    </div>
                    <p>
                      {req.theatre_screen_decision === 'accepted' && req.admin_suggested_screen
                        ? `You have accepted the suggestion to move this campaign to Screen ${req.admin_suggested_screen}.`
                        : req.theatre_screen_decision === 'rejected'
                        ? `You declined the Admin's suggestion for a different screen.`
                        : status === 'accepted'
                        ? 'Your request for this campaign has been accepted. We will coordinate the activation soon.'
                        : status === 'rejected'
                        ? 'Unfortunately, your request for this campaign was not approved at this time.'
                        : 'Your message regarding this campaign is being reviewed by the administration.'}
                    </p>
                  </div>
                  
                  <div className="card-footer">
                    <span>{req.confirmed_at ? `Requested on ${new Date(req.confirmed_at).toLocaleDateString()}` : `Created on ${new Date(req.created_at).toLocaleDateString()}`}</span>
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <div className="empty-responses glass-card">
            <Clock size={48} className="text-muted" />
            <h3>No responses found</h3>
            <p>Admin decisions for your submitted requests will appear here once they are processed.</p>
          </div>
        )}
      </div>

      <style>{`
        .admin-response-page {
          animation: fadeIn 0.4s ease-out;
        }

        .responses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }

        .response-card {
          display: flex;
          flex-direction: column;
          padding: 0;
          overflow: hidden;
          border: 1px solid var(--border);
          transition: transform 0.2s ease;
        }

        .response-card:hover {
          transform: translateY(-5px);
        }

        .card-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          font-weight: 800;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
        }

        .response-card.approved .card-badge { background: rgba(16, 185, 129, 0.1); color: var(--success); }
        .response-card.rejected .card-badge { background: rgba(239, 68, 68, 0.1); color: var(--error); }
        .response-card.pending .card-badge { background: rgba(99, 102, 241, 0.1); color: var(--primary); }

        .card-body {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .campaign-box {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--primary);
        }

        .campaign-box h4 { font-size: 1.125rem; font-weight: 700; color: white; }

        .info-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--text-muted);
        }

        .info-row .amount {
          color: white;
          font-weight: 700;
          font-size: 1.25rem;
        }

        .admin-feedback {
          padding: 1.25rem 1.5rem;
          background: rgba(255,255,255,0.02);
          border-top: 1px solid var(--border);
          flex: 1;
        }

        .feedback-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
        }

        .admin-feedback p {
          font-size: 0.875rem;
          line-height: 1.6;
          color: var(--text-muted);
          font-style: italic;
        }

        .reason-box {
          margin-top: 1rem;
          padding: 1rem;
          border-radius: 0.75rem;
          background: rgba(255, 255, 255, 0.04);
        }

        .reason-label {
          display: inline-block;
          margin-bottom: 0.5rem;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--text);
        }

        .negotiation-alert {
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.2);
          padding: 1rem;
          border-radius: 8px;
          margin-top: 0.5rem;
          font-style: normal !important;
        }

        .negotiation-alert p {
          color: var(--text) !important;
          margin-bottom: 1rem !important;
          font-style: normal !important;
        }

        .negotiation-actions {
          display: flex;
          gap: 0.75rem;
        }

        .btn-accept-suggestion {
          background: var(--primary);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .btn-reject-suggestion {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .btn-reject-suggestion:hover {
          background: #ef4444;
          color: white;
        }

        .card-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid var(--border);
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .empty-responses {
          grid-column: 1 / -1;
          padding: 5rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }
      `}</style>
    </div>
  );
};

export default AdminResponse;
