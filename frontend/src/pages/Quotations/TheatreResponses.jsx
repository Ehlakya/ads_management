import React, { useEffect, useState } from 'react';
import {
  Building2,
  Mail,
  MapPin,
  DollarSign,
  Calendar,
  PlayCircle,
  X,
  CheckCircle,
  XCircle,
  MessageSquare,
  User,
  Monitor,
  AlertCircle
} from 'lucide-react';
import quotationService from '../../services/quotationService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const TheatreResponses = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
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
    const fetchTheatreRequests = async () => {
      try {
        const response = await quotationService.getTheatreRequests();
        // Filter: Show only requests with negotiation/suggestions (responses to admin actions)
        const respondedRequests = (response.data || []).filter(req => req.admin_suggested_screen);
        setRequests(respondedRequests);
      } catch (error) {
        toast.error('Failed to load theatre responses');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTheatreRequests();
  }, []);

  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <span>Loading theatre responses...</span>
      </div>
    );
  }

  return (
    <div className="theatre-requests-container">
      <header className="page-header">
        <h1 className="page-title">Theatre Assignment Decisions</h1>
        <p className="page-subtitle">Track theatre owner responses to suggested screen changes and final assignments</p>
      </header>

      {requests.length === 0 ? (
        <div className="empty-state">
          <MessageSquare size={48} />
          <h2>No Negotiation Responses Yet</h2>
          <p>Theatre owner decisions on screen suggestions will appear here</p>
        </div>
      ) : (
        <div className="requests-grid">
          {requests.map((request) => (
            <div key={request.id} className="request-card glass-card">
              <div className="card-header">
                <div className="request-title-block">
                  <div className="request-title">
                    <h3>{request.ad?.title || 'Ad Campaign'}</h3>
                    <span className="request-id">REQ-{String(request.id).padStart(4, '0')}</span>
                  </div>
                  <div className="request-meta-line">
                    <span>Negotiated {new Date(request.admin_response_at).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}</span>
                    {getDecisionBadge(request)}
                  </div>
                </div>

                <div className="header-actions">
                  {request.ad?.video_url && (
                    <button 
                      onClick={() => setVideoModal({ isOpen: true, url: request.ad.video_url })}
                      className="video-btn"
                      title="Watch campaign video"
                    >
                      <PlayCircle size={18} />
                    </button>
                  )}
                </div>
              </div>

              <div className="card-content">
                <div className="negotiation-status-box">
                  <div className="status-header">
                    <Monitor size={16} />
                    <h4>Screen Assignment Negotiation</h4>
                  </div>
                  <div className="negotiation-details">
                    <div className="screen-comparison">
                      <div className="screen-pick">
                        <label>Original Pick</label>
                        <span className="screen-num">Screen {JSON.parse(request.selected_screens || '[]')[0] || 'N/A'}</span>
                      </div>
                      <div className="arrow-icon">→</div>
                      <div className="screen-pick suggested">
                        <label>Admin Suggestion</label>
                        <span className="screen-num">Screen {request.admin_suggested_screen}</span>
                      </div>
                    </div>
                    <div className={`decision-banner ${request.theatre_screen_decision}`}>
                       <AlertCircle size={14} />
                       <span>Theatre Owner Decision: <strong>{request.theatre_screen_decision?.toUpperCase()}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="detail-grid">
                  <DetailItem icon={<Building2 size={16} />} label="Theatre" value={request.theatre_user?.theatre_name || 'N/A'} />
                  <DetailItem icon={<User size={16} />} label="Owner" value={`@${request.theatre_user?.username || 'N/A'}`} />
                  <DetailItem icon={<DollarSign size={16} />} label="Campaign Budget" value={`$${Number(request.ad?.budget).toLocaleString()}`} accent />
                  <DetailItem icon={<Monitor size={16} />} label="Final Active Screen" value={`Screen ${request.selected_screens ? JSON.parse(request.selected_screens)[0] : 'N/A'}`} />
                </div>

                <div className="section message-section">
                  <h4>Initial Theatre Message</h4>
                  <div className="message-box">
                    <MessageSquare size={16} />
                    <p>{request.theatre_message || 'No initial message provided.'}</p>
                  </div>
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
        .theatre-requests-container {
          padding: 2rem;
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
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
          color: var(--text-muted);
          background: var(--surface);
          border-radius: 12px;
          border: 1px solid var(--border);
        }

        .empty-state h2 {
          font-size: 1.5rem;
          color: white;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }

        .requests-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 1.5rem;
        }

        .request-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          border-bottom: 1px solid var(--border);
          padding-bottom: 1rem;
        }

        .request-title-block {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .request-title h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.25rem;
        }

        .request-id {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
        }

        .request-meta-line {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--text-muted);
          font-size: 0.8rem;
        }

        .negotiation-status-box {
          background: rgba(99, 102, 241, 0.05);
          border-radius: 12px;
          padding: 1.25rem;
          border: 1px solid rgba(99, 102, 241, 0.1);
          margin-bottom: 0.5rem;
        }

        .status-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          color: var(--primary);
        }

        .status-header h4 {
          margin: 0;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .screen-comparison {
          display: flex;
          align-items: center;
          justify-content: space-around;
          margin-bottom: 1.25rem;
          background: rgba(0,0,0,0.2);
          padding: 0.75rem;
          border-radius: 8px;
        }

        .screen-pick {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .screen-pick label {
          font-size: 0.65rem;
          text-transform: uppercase;
          color: var(--text-muted);
          font-weight: 700;
        }

        .screen-pick .screen-num {
          font-weight: 800;
          color: white;
          font-size: 1rem;
        }

        .screen-pick.suggested .screen-num {
          color: var(--primary);
        }

        .arrow-icon {
          color: var(--text-muted);
          font-weight: 800;
        }

        .decision-banner {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1rem;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .decision-banner.pending { background: rgba(255,193,7,0.1); color: #ffc107; }
        .decision-banner.accepted { background: rgba(34,197,94,0.1); color: var(--success); }
        .decision-banner.rejected { background: rgba(239,68,68,0.1); color: #ef4444; }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .info-item {
          display: flex;
          gap: 0.6rem;
          padding: 0.75rem;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border);
          border-radius: 8px;
        }

        .info-item svg { color: var(--primary); }

        .info-text label {
          font-size: 0.65rem;
          color: var(--text-muted);
          text-transform: uppercase;
          display: block;
        }

        .info-text span { font-size: 0.85rem; color: white; font-weight: 500; }

        .amount { color: var(--success) !important; font-weight: 700 !important; }

        .message-section h4 {
          font-size: 0.8rem;
          color: var(--primary);
          text-transform: uppercase;
          margin-bottom: 0.5rem;
        }

        .message-box {
          display: flex;
          gap: 0.75rem;
          padding: 0.85rem;
          background: rgba(255,255,255,0.03);
          border-radius: 8px;
          border: 1px solid var(--border);
        }

        .message-box p { margin: 0; font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; }

        .response-badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.75rem;
          background: rgba(99, 102, 241, 0.1);
          color: var(--primary);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .response-badge.accepted { background: rgba(34,197,94,0.1); color: var(--success); border-color: rgba(34,197,94,0.2); }
        .response-badge.rejected { background: rgba(239,68,68,0.1); color: #ef4444; border-color: rgba(239,68,68,0.2); }

        .video-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border);
          color: white;
          padding: 0.4rem;
          border-radius: 6px;
          cursor: pointer;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

const DetailItem = ({ icon, label, value, accent = false }) => (
  <div className="info-item">
    {icon}
    <div className="info-text">
      <label>{label}</label>
      <span className={accent ? 'amount' : ''}>{value}</span>
    </div>
  </div>
);

const getDecisionBadge = (request) => {
  const status = request.theatre_screen_decision;
  if (status === 'accepted') return <div className="response-badge accepted">Suggestion Accepted</div>;
  if (status === 'rejected') return <div className="response-badge rejected">Suggestion Declined</div>;
  return <div className="response-badge">Decision Pending</div>;
};

export default TheatreResponses;
