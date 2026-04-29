import React, { useEffect, useState } from 'react';
import { 
  Monitor, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Building2, 
  ArrowRight,
  AlertCircle,
  PlayCircle,
  X
} from 'lucide-react';
import quotationService from '../../services/quotationService';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [videoModal, setVideoModal] = useState({ isOpen: false, url: '' });
  const navigate = useNavigate();

  const fetchAdminRequests = async () => {
    try {
      const response = await quotationService.getMyRequests();
      // Filter: Only show requests that have an admin suggestion
      const filtered = (response.data || []).filter(req => req.admin_suggested_screen);
      setRequests(filtered);
    } catch (error) {
      toast.error('Failed to load admin requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminRequests();
  }, []);

  const handleDecision = async (id, decision) => {
    try {
      await quotationService.respondToScreenSuggestion(id, decision);
      toast.success(`Suggestion ${decision} successfully`);
      fetchAdminRequests();
    } catch (error) {
      toast.error('Failed to submit decision');
    }
  };

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

  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <span>Fetching administrative requests...</span>
      </div>
    );
  }

  return (
    <div className="admin-requests-page">
      <header className="page-header">
        <div className="header-content">
          <h1 className="page-title">Admin-Initiated Requests</h1>
          <p className="page-subtitle">Review and respond to screen change suggestions proposed by the administration.</p>
        </div>
      </header>

      {requests.length === 0 ? (
        <div className="empty-state glass-card">
          <div className="empty-icon-wrapper">
            <AlertCircle size={48} />
          </div>
          <h2>No Pending Requests</h2>
          <p>There are no active screen modification requests from the Admin at this time.</p>
        </div>
      ) : (
        <div className="requests-list">
          {requests.map((request) => (
            <div key={request.id} className="request-item glass-card">
              <div className="item-header">
                <div className="campaign-info">
                  <h3>{request.Ad?.title || 'Ad Campaign'}</h3>
                  <span className="ref-tag">REF-{String(request.id).padStart(4, '0')}</span>
                </div>
                <div className="item-actions">
                  {request.Ad?.video_url && (
                    <button 
                      onClick={() => setVideoModal({ isOpen: true, url: request.Ad.video_url })}
                      className="video-trigger"
                    >
                      <PlayCircle size={18} />
                      <span>Watch Ad</span>
                    </button>
                  )}
                  <button onClick={() => navigate(`/quotations/${request.ad_id}`)} className="details-link">
                    View Details
                  </button>
                </div>
              </div>

              <div className="negotiation-flow">
                <div className="flow-step">
                  <div className="step-label">Your Selection</div>
                  <div className="step-value">
                    <Monitor size={16} />
                    <span>Screen {JSON.parse(request.selected_screens || '[]')[0] || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="flow-arrow">
                  <ArrowRight size={24} />
                </div>

                <div className="flow-step suggested">
                  <div className="step-label">Admin's Proposal</div>
                  <div className="step-value highlight">
                    <Monitor size={16} />
                    <span>Screen {request.admin_suggested_screen}</span>
                  </div>
                </div>
              </div>

              <div className="status-footer">
                {request.theatre_screen_decision === 'pending' ? (
                  <div className="decision-actions">
                    <button onClick={() => handleDecision(request.id, 'accepted')} className="btn-accept">
                      <CheckCircle size={18} />
                      <span>Accept Change</span>
                    </button>
                    <button onClick={() => handleDecision(request.id, 'rejected')} className="btn-reject">
                      <XCircle size={18} />
                      <span>Decline Change</span>
                    </button>
                  </div>
                ) : (
                  <div className={`decision-badge ${request.theatre_screen_decision}`}>
                    {request.theatre_screen_decision === 'accepted' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    <span>You {request.theatre_screen_decision} this request</span>
                  </div>
                )}
                <div className="timestamp">
                  <Clock size={14} />
                  <span>Proposed {new Date(request.updatedAt || request.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
        .admin-requests-page {
          animation: fadeIn 0.4s ease-out;
        }

        .page-header {
          margin-bottom: 2.5rem;
        }

        .page-title {
          font-size: 2rem;
          font-weight: 800;
          color: white;
          margin-bottom: 0.5rem;
        }

        .page-subtitle {
          color: var(--text-muted);
          font-size: 1rem;
        }

        .empty-state {
          padding: 5rem 2rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        .empty-icon-wrapper {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(99, 102, 241, 0.1);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .empty-state h2 {
          font-size: 1.5rem;
          color: white;
          margin: 0;
        }

        .empty-state p {
          color: var(--text-muted);
          max-width: 400px;
        }

        .requests-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .request-item {
          padding: 1.5rem;
          border-radius: 1rem;
          transition: transform 0.2s ease;
        }

        .request-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }

        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          border-bottom: 1px solid var(--border);
          padding-bottom: 1rem;
        }

        .campaign-info h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
        }

        .ref-tag {
          font-size: 0.75rem;
          color: var(--primary);
          font-weight: 700;
          font-family: 'JetBrains Mono', monospace;
        }

        .item-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .video-trigger {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(99, 102, 241, 0.1);
          color: var(--primary);
          padding: 0.4rem 0.8rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          transition: all 0.2s;
        }

        .video-trigger:hover {
          background: var(--primary);
          color: white;
        }

        .details-link {
          font-size: 0.85rem;
          color: var(--text-muted);
          text-decoration: underline;
          background: none;
        }

        .negotiation-flow {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 3rem;
          margin-bottom: 2rem;
          background: rgba(0,0,0,0.2);
          padding: 2rem;
          border-radius: 12px;
        }

        .flow-step {
          text-align: center;
        }

        .step-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .step-value {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.25rem;
          font-weight: 800;
          color: white;
        }

        .step-value.highlight {
          color: var(--primary);
        }

        .flow-arrow {
          color: var(--text-muted);
          opacity: 0.5;
        }

        .status-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .decision-actions {
          display: flex;
          gap: 1rem;
        }

        .btn-accept, .btn-reject {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.25rem;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .btn-accept {
          background: var(--success);
          color: white;
        }

        .btn-reject {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .btn-accept:hover { transform: scale(1.05); }
        .btn-reject:hover { background: rgba(239, 68, 68, 0.2); }

        .decision-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 99px;
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: capitalize;
        }

        .decision-badge.accepted { background: rgba(34, 197, 94, 0.1); color: var(--success); }
        .decision-badge.rejected { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

        .timestamp {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--text-muted);
          font-size: 0.8rem;
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
        }

        .video-modal-content {
          position: relative;
          width: 90%;
          max-width: 1000px;
          background: #000;
          border-radius: 12px;
          overflow: hidden;
        }

        .close-modal-btn {
          position: absolute;
          top: -40px;
          right: 0;
          background: none;
          color: white;
          border: none;
          cursor: pointer;
        }

        .video-player-wrapper {
          width: 100%;
          aspect-ratio: 16 / 9;
        }

        .video-player-element {
          width: 100%;
          height: 100%;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AdminRequests;
