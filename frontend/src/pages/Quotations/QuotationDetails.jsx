import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  DollarSign, 
  Megaphone, 
  Clock, 
  CheckCircle, 
  ArrowLeft,
  Briefcase,
  Shield,
  PlayCircle,
  XCircle,
  Monitor,
  X
} from 'lucide-react';
import quotationService from '../../services/quotationService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const QuotationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quotation, setQuotation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [videoModal, setVideoModal] = useState({ isOpen: false, url: '' });

  const renderVideoPlayer = (url) => {
    if (!url) return null;
    if (url.startsWith('/uploads')) {
      return <video src={`http://localhost:5000${url}`} controls autoPlay className="video-player-element" />;
    } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      if (url.includes('v=')) videoId = url.split('v=')[1].split('&')[0];
      else if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1].split('?')[0];
      
      if (videoId) {
        return <iframe src={`https://www.youtube.com/embed/${videoId}?autoplay=1`} allow="autoplay; encrypted-media" allowFullScreen className="video-player-element"></iframe>;
      }
    }
    return <video src={url} controls autoPlay className="video-player-element" />;
  };

  const closeVideoModal = (e) => {
    if (e) e.stopPropagation();
    setVideoModal({ isOpen: false, url: '' });
  };

  useEffect(() => {
    // Note: Since I haven't implemented getQuotationById in the service yet, 
    // I'll fetch all and find the one. Ideally we should have a specific endpoint.
    const fetchQuotationDetails = async () => {
      try {
        const response = await quotationService.getQuotations();
        const found = response.data.find(q => q.ad_id === parseInt(id));
        if (found) {
          setQuotation(found);
        } else {
          toast.error('Ad information not found');
          navigate('/quotations');
        }
      } catch (error) {
        toast.error('Failed to load details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuotationDetails();
  }, [id, navigate]);

  const handleOkClick = async () => {
    if (!quotation) {
      toast.error('Details not loaded');
      return;
    }
    if (user?.role === 'agent') {
      navigate(`/sales/add/${quotation.ad_id}`);
    } else {
      navigate(`/quotations/${id}/request`);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <span>Retrieving quotation ledger entry...</span>
      </div>
    );
  }

  if (!quotation) return null;

  return (
    <div className="quotation-details-container">
      <header className="details-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft size={18} />
          <span>Back to Ledger</span>
        </button>
        <h1 className="page-title">Financial Proposal Details</h1>
      </header>

      <div className="details-card glass-card">
        <div className="card-top">
          <div className="proposal-id">
            <label>Quotation Reference</label>
            <h2>QTN-{quotation.id ? String(quotation.id).padStart(3, '0') : 'PENDING'}</h2>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {quotation.video_url && (
              <button 
                onClick={() => setVideoModal({ isOpen: true, url: quotation.video_url })}
                className="btn-primary"
                style={{ padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '8px', fontSize: '0.85rem' }}
              >
                <PlayCircle size={16} /> Watch Video
              </button>
            )}
            <div className={`status-pill ${quotation.status || 'pending_quote'}`}>
              {quotation.status || 'pending_quote'}
            </div>
          </div>
        </div>

        <div className="detail-sections">
          <div className="detail-group">
            <div className="group-header">
              <Megaphone size={18} />
              <h3>Advertisement Context</h3>
            </div>
            <div className="group-content">
              <div className="data-row">
                <label>Campaign Title</label>
                <span>{quotation.ad_title}</span>
              </div>
              <div className="data-row">
                <label>Client Reference</label>
                <span>{quotation.ad_client}</span>
              </div>
              {quotation.selected_screens && (
                <div className="data-row">
                  <label>Assigned Screens</label>
                  <div className="screens-tags">
                    {quotation.selected_screens.map(num => (
                      <span key={num} className="screen-tag">
                        <Monitor size={12} />
                        Screen {num}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="detail-group">
            <div className="group-header">
              <DollarSign size={18} />
              <h3>Financial Commitment</h3>
            </div>
            <div className="group-content">
              <div className="data-row">
                <label>Quoted Amount</label>
                <span className="amount-text">{quotation.amount ? `$${Number(quotation.amount).toLocaleString()}` : 'Not yet quoted'}</span>
              </div>
              <div className="data-row">
                <label>Campaign Budget</label>
                <span className="budget-text">${Number(quotation.ad_budget).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="detail-group full-width">
            <div className="group-header">
              <Clock size={18} />
              <h3>Submission Details</h3>
            </div>
            <div className="group-content">
              <div className="data-row">
                <label>Date Registered</label>
                <span>{quotation.created_at ? new Date(quotation.created_at).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' }) : 'Pending Creation'}</span>
              </div>
              <div className="data-row">
                <label>Special Instructions / Notes</label>
                <p className="notes-text">{quotation.notes || (quotation.id ? 'No specific notes attached to this quotation.' : 'Quotation details will appear here once generated.')}</p>
              </div>
            </div>
          </div>

          {quotation.admin_response && (
            <div className={`detail-group full-width admin-response ${quotation.admin_response}`}>
              <div className="group-header">
                {quotation.admin_response === 'accepted' ? (
                  <>
                    <CheckCircle size={18} className="response-icon" />
                    <h3>Admin Response: Accepted</h3>
                  </>
                ) : (
                  <>
                    <XCircle size={18} className="response-icon" />
                    <h3>Admin Response: Rejected</h3>
                  </>
                )}
              </div>
              <div className="group-content">
                <div className="data-row">
                  <label>Decision Made On</label>
                  <span>{quotation.admin_response_at ? new Date(quotation.admin_response_at).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' }) : 'Recently'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {(user?.role === 'theatre_user' || user?.role === 'agent') && quotation.status !== 'confirmed' && (
          <div className="card-actions">
            <button 
              onClick={handleOkClick} 
              className="btn-primary ok-btn"
              disabled={isConfirming}
            >
              {isConfirming ? (
                <>
                  <div className="spinner-small" style={{ width: '16px', height: '16px' }}></div>
                  <span>Confirming...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  <span>OK</span>
                </>
              )}
            </button>
          </div>
        )}

        {user?.role === 'theatre_user' && quotation.admin_suggested_screen && quotation.theatre_screen_decision === 'pending' && (
          <div className="negotiation-card">
            <div className="negotiation-header">
              <Monitor size={20} />
              <h3>Admin Suggested a Screen Change</h3>
            </div>
            <p className="negotiation-text">
              The administrator has suggested changing your assigned screen to <strong>Screen {quotation.admin_suggested_screen}</strong>. 
              Please review and accept or reject this suggestion.
            </p>
            <div className="negotiation-actions">
              <button 
                className="btn-accept-suggestion"
                onClick={async () => {
                  try {
                    await quotationService.respondToScreenSuggestion(quotation.id, 'accepted');
                    toast.success('Screen suggestion accepted');
                    window.location.reload();
                  } catch (error) {
                    toast.error('Failed to accept suggestion');
                  }
                }}
              >
                <CheckCircle size={18} />
                <span>Accept Suggestion</span>
              </button>
              <button 
                className="btn-reject-suggestion"
                onClick={async () => {
                  try {
                    await quotationService.respondToScreenSuggestion(quotation.id, 'rejected');
                    toast.success('Screen suggestion rejected');
                    window.location.reload();
                  } catch (error) {
                    toast.error('Failed to reject suggestion');
                  }
                }}
              >
                <XCircle size={18} />
                <span>Reject Suggestion</span>
              </button>
            </div>
          </div>
        )}

        {quotation.theatre_screen_decision !== 'pending' && quotation.admin_suggested_screen && (
          <div className={`decision-notice ${quotation.theatre_screen_decision}`}>
            <Shield size={18} />
            <span>
              You have <strong>{quotation.theatre_screen_decision}</strong> the admin's suggestion for Screen {quotation.admin_suggested_screen}.
            </span>
          </div>
        )}
      </div>

      {videoModal.isOpen && (
        <div className="video-modal-overlay" onClick={closeVideoModal}>
          <div className="video-modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={closeVideoModal}>
              <X size={24} />
            </button>
            <div className="video-player-wrapper">
              {renderVideoPlayer(videoModal.url)}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .quotation-details-container {
          max-width: 800px;
          margin: 0 auto;
          animation: fadeIn 0.4s ease-out;
        }

        .details-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          color: var(--text-muted);
        }

        .details-card {
          padding: 3rem;
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }

        @media (max-width: 640px) {
          .details-card {
            padding: 1.5rem;
            gap: 1.5rem;
          }
          .details-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid var(--border);
          padding-bottom: 1.5rem;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .proposal-id label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }

        .proposal-id h2 {
          font-size: 1.75rem;
          font-weight: 800;
          color: white;
        }

        .status-pill {
          padding: 0.5rem 1.25rem;
          border-radius: 99px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background: rgba(99, 102, 241, 0.1);
          color: var(--primary);
          border: 1px solid rgba(99, 102, 241, 0.2);
        }

        .detail-sections {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2.5rem;
        }

        .full-width { grid-column: 1 / -1; }

        .group-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--primary);
          margin-bottom: 1.25rem;
        }

        .group-header h3 {
          font-size: 1rem;
          font-weight: 700;
          color: white;
        }

        .group-content {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .data-row {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .data-row label {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .data-row span {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text);
        }

        .screens-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.25rem;
        }

        .screen-tag {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(99, 102, 241, 0.1);
          color: var(--primary);
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          border: 1px solid rgba(99, 102, 241, 0.2);
        }

        .amount-text { color: var(--success) !important; font-size: 1.25rem !important; }

        .notes-text {
          color: var(--text-muted);
          line-height: 1.6;
          font-style: italic;
        }

        .detail-group.admin-response {
          padding: 1.5rem;
          border-radius: 8px;
        }

        .detail-group.admin-response.accepted {
          background: rgba(34, 197, 94, 0.05);
          border: 1px solid rgba(34, 197, 94, 0.2);
        }

        .detail-group.admin-response.rejected {
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .detail-group.admin-response .group-header {
          margin-bottom: 1rem;
        }

        .detail-group.admin-response.accepted .group-header {
          color: var(--success);
        }

        .detail-group.admin-response.accepted .group-header h3 {
          color: var(--success);
        }

        .detail-group.admin-response.rejected .group-header {
          color: #ef4444;
        }

        .detail-group.admin-response.rejected .group-header h3 {
          color: #ef4444;
        }

        .response-icon {
          width: 20px;
          height: 20px;
        }

        .card-actions {
          margin-top: 1rem;
          display: flex;
          justify-content: center;
        }

        .ok-btn {
          padding: 1rem 3rem;
          font-size: 1rem;
          border-radius: 12px;
        }

        .loading-state {
          height: 60vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          color: var(--text-muted);
        }

        .negotiation-card {
          margin-top: 1rem;
          background: rgba(99, 102, 241, 0.05);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 12px;
          padding: 1.5rem;
          animation: slideUp 0.4s ease-out;
        }

        .negotiation-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--primary);
          margin-bottom: 1rem;
        }

        .negotiation-header h3 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 700;
          color: white;
        }

        .negotiation-text {
          color: var(--text-muted);
          font-size: 0.95rem;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .negotiation-actions {
          display: flex;
          gap: 1rem;
        }

        .btn-accept-suggestion,
        .btn-reject-suggestion {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-accept-suggestion {
          background: var(--success);
          color: white;
          border: none;
        }

        .btn-accept-suggestion:hover {
          opacity: 0.9;
          transform: translateY(-2px);
        }

        .btn-reject-suggestion {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .btn-reject-suggestion:hover {
          background: rgba(239, 68, 68, 0.2);
          transform: translateY(-2px);
        }

        .decision-notice {
          margin-top: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          border-radius: 10px;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .decision-notice.accepted {
          background: rgba(34, 197, 94, 0.1);
          color: var(--success);
          border: 1px solid rgba(34, 197, 94, 0.2);
        }

        .decision-notice.rejected {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .video-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease-out;
        }

        .video-modal-content {
          position: relative;
          width: 90%;
          max-width: 1000px;
          background: #000;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .close-modal-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(0, 0, 0, 0.5);
          color: white;
          border: none;
          cursor: pointer;
          opacity: 0.7;
          transition: opacity 0.2s;
          z-index: 10;
          padding: 8px;
          border-radius: 50%;
          display: flex;
        }

        .close-modal-btn:hover {
          opacity: 1;
          background: rgba(0, 0, 0, 0.8);
        }

        .video-player-wrapper {
          width: 100%;
          aspect-ratio: 16 / 9;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #111;
        }

        .video-player-element {
          width: 100%;
          height: 100%;
          border: none;
          outline: none;
        }

        @media (max-width: 640px) {
          .detail-sections { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default QuotationDetails;
