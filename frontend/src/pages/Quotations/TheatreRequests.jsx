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
  Monitor
} from 'lucide-react';
import quotationService from '../../services/quotationService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const TheatreRequests = () => {
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

  const [negotiatingId, setNegotiatingId] = useState(null);
  const [suggestedScreen, setSuggestedScreen] = useState(1);

  const handleRespond = async (requestId, response) => {
    setProcessingId(requestId);
    try {
      await quotationService.respondToTheatreRequest(requestId, response);
      
      // Update the request in the local state
      setRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, admin_response: response, admin_response_at: new Date() }
            : req
        )
      );
      
      toast.success(`Quotation ${response} successfully`);
    } catch (error) {
      toast.error(`Failed to ${response} quotation`);
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleNegotiate = async (requestId) => {
    setProcessingId(requestId);
    try {
      await quotationService.respondToTheatreRequest(requestId, 'negotiate', suggestedScreen);
      setRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, admin_suggested_screen: suggestedScreen, theatre_screen_decision: 'pending' }
            : req
        )
      );
      toast.success(`Screen suggestion sent to theatre owner`);
      setNegotiatingId(null);
    } catch (error) {
      toast.error('Failed to send screen suggestion');
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    const fetchTheatreRequests = async () => {
      try {
        const response = await quotationService.getTheatreRequests();
        // Filter: Show only initial requests (where no screen suggestion has been made yet)
        const initialRequests = (response.data || []).filter(req => !req.admin_suggested_screen);
        setRequests(initialRequests);
        if (initialRequests.length === 0 && response.data.length > 0) {
           // If there are requests but all are negotiated, show empty for this page
        }
      } catch (error) {
        toast.error('Failed to load theatre requests');
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
        <span>Loading theatre requests...</span>
      </div>
    );
  }

  return (
    <div className="theatre-requests-container">
      <header className="page-header">
        <h1 className="page-title">Theatre Campaign Requests</h1>
        <p className="page-subtitle">Review initial advertisement assignments and feedback from theatre owners</p>
      </header>

      {requests.length === 0 ? (
        <div className="empty-state">
          <Building2 size={48} />
          <h2>No Theatre Requests Yet</h2>
          <p>Theatre venues will appear here once they confirm quotations</p>
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
                    <span>Submitted {new Date(request.confirmed_at).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}</span>
                    {getResponseBadge(request)}
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

                  {!request.admin_response && (
                    <div className="top-actions">
                      {negotiatingId === request.id ? (
                        <div className="negotiation-form">
                          <select 
                            value={suggestedScreen} 
                            onChange={(e) => setSuggestedScreen(Number(e.target.value))}
                            className="screen-select"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                              <option key={num} value={num}>Screen {num}</option>
                            ))}
                          </select>
                          <button 
                            className="btn-send-suggestion"
                            onClick={() => handleNegotiate(request.id)}
                            disabled={processingId === request.id}
                          >
                            Send
                          </button>
                          <button 
                            className="btn-cancel-negotiation"
                            onClick={() => setNegotiatingId(null)}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button 
                            className="btn-negotiate"
                            onClick={() => {
                              setNegotiatingId(request.id);
                              setSuggestedScreen(1);
                            }}
                            title="Suggest different screen"
                          >
                            <Monitor size={18} />
                            <span>Suggest Screen</span>
                          </button>
                          <button 
                            className="btn-accept"
                            onClick={() => handleRespond(request.id, 'accepted')}
                            disabled={processingId === request.id}
                          >
                            {processingId === request.id ? (
                              <div className="spinner-small"></div>
                            ) : (
                              <>
                                <CheckCircle size={16} />
                                <span>Accept</span>
                              </>
                            )}
                          </button>
                          <button 
                            className="btn-reject"
                            onClick={() => handleRespond(request.id, 'rejected')}
                            disabled={processingId === request.id}
                          >
                            <XCircle size={16} />
                            <span>Reject</span>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="card-content">
                <div className="detail-grid">
                  <DetailItem icon={<User size={16} />} label="Username" value={`@${request.theatre_user?.username || 'N/A'}`} />
                  <DetailItem icon={<Mail size={16} />} label="Email" value={request.theatre_user?.email || 'N/A'} />
                  <DetailItem icon={<Building2 size={16} />} label="Theatre Name" value={request.theatre_user?.theatre_name || 'N/A'} />
                  <DetailItem icon={<MapPin size={16} />} label="Theatre Address" value={request.theatre_user?.theatre_address || 'N/A'} />
                  <DetailItem icon={<DollarSign size={16} />} label="Quoted Amount" value={`$${Number(request.amount).toLocaleString()}`} accent />
                  <DetailItem icon={<Building2 size={16} />} label="Client" value={request.ad?.client || 'N/A'} />
                  {request.selected_screens && (
                    <DetailItem 
                      icon={<Monitor size={16} />} 
                      label="Assigned Screens" 
                      value={request.selected_screens.map(s => `Screen ${s}`).join(', ')} 
                    />
                  )}
                </div>

                <div className="section message-section">
                  <h4>Theatre Owner Message</h4>
                  <div className="message-box">
                    <MessageSquare size={16} />
                    <p>{request.theatre_message || 'No message provided by the theatre owner.'}</p>
                  </div>
                </div>

                {request.notes && (
                  <div className="section notes-section">
                    <h4>Quotation Notes</h4>
                    <p className="notes-text">{request.notes}</p>
                  </div>
                )}

                {request.admin_response && (
                  <div className={`section response-section ${request.admin_response}`}>
                    <h4>Admin Response</h4>
                    <div className="response-info">
                      {request.admin_response === 'accepted' ? (
                        <>
                          <CheckCircle size={20} className="response-icon accepted" />
                          <div className="response-text">
                            <span className="response-status accepted">Accepted</span>
                            {request.admin_response_at && (
                              <span className="response-date">
                                on {new Date(request.admin_response_at).toLocaleString(undefined, {
                                  dateStyle: 'medium',
                                  timeStyle: 'short'
                                })}
                              </span>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <XCircle size={20} className="response-icon rejected" />
                          <div className="response-text">
                            <span className="response-status rejected">Rejected</span>
                            {request.admin_response_at && (
                              <span className="response-date">
                                on {new Date(request.admin_response_at).toLocaleString(undefined, {
                                  dateStyle: 'medium',
                                  timeStyle: 'short'
                                })}
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
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
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .request-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }

        .request-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 30px rgba(99, 102, 241, 0.1);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          border-bottom: 1px solid var(--border);
          padding-bottom: 1rem;
          flex-wrap: wrap;
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
          letter-spacing: 0.05em;
        }

        .request-meta-line {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          color: var(--text-muted);
          font-size: 0.8rem;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-left: auto;
        }

        .top-actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .video-btn {
          background: rgba(99, 102, 241, 0.1);
          color: var(--primary);
          border: 1px solid rgba(99, 102, 241, 0.2);
          padding: 0.5rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .video-btn:hover {
          background: rgba(99, 102, 241, 0.2);
          color: var(--primary);
        }

        .card-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 0.85rem;
        }

        .section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .section h4 {
          font-size: 0.85rem;
          color: var(--primary);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }

        .info-item {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
          color: var(--text-muted);
          padding: 0.9rem 1rem;
          border: 1px solid var(--border);
          border-radius: 0.85rem;
          background: rgba(255,255,255,0.02);
        }

        .info-item svg {
          flex-shrink: 0;
          margin-top: 2px;
          color: var(--primary);
        }

        .info-text {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .info-text label {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
        }

        .info-text span {
          font-size: 0.95rem;
          color: var(--text);
          line-height: 1.4;
        }

        .amount {
          color: var(--success) !important;
          font-size: 1.1rem !important;
          font-weight: 700 !important;
        }

        .message-section {
          margin-top: 0.25rem;
        }

        .message-box {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
          padding: 1rem;
          border-radius: 0.85rem;
          background: rgba(99, 102, 241, 0.06);
          border: 1px solid rgba(99, 102, 241, 0.15);
        }

        .message-box svg {
          color: var(--primary);
          flex-shrink: 0;
          margin-top: 0.15rem;
        }

        .message-box p {
          margin: 0;
          color: var(--text);
          line-height: 1.6;
          white-space: pre-wrap;
        }

        .notes-section {
          background: rgba(99, 102, 241, 0.05);
          padding: 1rem;
          border-radius: 8px;
          border-left: 3px solid var(--primary);
        }

        .notes-text {
          color: var(--text);
          font-size: 0.9rem;
          line-height: 1.5;
          margin: 0;
        }

        .response-section {
          padding: 1rem;
          border-radius: 8px;
          border-left: 3px solid var(--border);
        }

        .response-section.accepted {
          background: rgba(34, 197, 94, 0.05);
          border-left-color: var(--success);
        }

        .response-section.rejected {
          background: rgba(239, 68, 68, 0.05);
          border-left-color: #ef4444;
        }

        .response-info {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .response-icon {
          flex-shrink: 0;
          width: 20px;
          height: 20px;
        }

        .response-icon.accepted {
          color: var(--success);
        }

        .response-icon.rejected {
          color: #ef4444;
        }

        .response-text {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .response-status {
          font-size: 0.95rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .response-status.accepted {
          color: var(--success);
        }

        .response-status.rejected {
          color: #ef4444;
        }

        .response-date {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .negotiation-form {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: rgba(99, 102, 241, 0.08);
          padding: 0.5rem 0.8rem;
          border-radius: 10px;
          border: 1px solid rgba(99, 102, 241, 0.2);
          animation: slideInRight 0.3s ease-out;
        }

        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .screen-select {
          background: #0a0a0a;
          border: 1px solid var(--border);
          color: white;
          padding: 0.4rem 0.6rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          outline: none;
          cursor: pointer;
        }

        .screen-select:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
        }

        .btn-send-suggestion {
          background: var(--primary);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-send-suggestion:hover {
          background: #4f46e5;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .btn-cancel-negotiation {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.45rem;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .btn-cancel-negotiation:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.2);
        }

        .btn-negotiate {
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.2);
          color: var(--primary);
          padding: 0.75rem 1rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          transition: all 0.2s;
          cursor: pointer;
        }

        .btn-negotiate:hover {
          background: var(--primary);
          color: white;
        }

        .btn-accept,
        .btn-reject {
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          border: 1px solid transparent;
        }

        .btn-accept {
          background: rgba(34, 197, 94, 0.1);
          color: var(--success);
          border: 1px solid rgba(34, 197, 94, 0.3);
        }

        .btn-accept:hover:not(:disabled) {
          background: rgba(34, 197, 94, 0.2);
          border-color: var(--success);
        }

        .btn-reject {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .btn-reject:hover:not(:disabled) {
          background: rgba(239, 68, 68, 0.2);
          border-color: #ef4444;
        }

        .btn-accept:disabled,
        .btn-reject:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .response-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.55rem 0.9rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.8rem;
          text-transform: capitalize;
        }

        .response-badge {
          background: rgba(99, 102, 241, 0.1);
          color: var(--primary);
          border: 1px solid rgba(99, 102, 241, 0.2);
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
          top: -40px;
          right: 0;
          background: none;
          color: white;
          border: none;
          cursor: pointer;
          opacity: 0.7;
          transition: opacity 0.2s;
          z-index: 1001;
        }

        .close-modal-btn:hover {
          opacity: 1;
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

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .theatre-requests-container {
            padding: 1rem;
          }

          .requests-grid {
            grid-template-columns: 1fr;
          }

          .page-title {
            font-size: 1.5rem;
          }

          .header-actions {
            width: 100%;
            margin-left: 0;
          }
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

const getResponseBadge = (request) => {
  if (!request.admin_response) {
    return <div className="response-badge">Awaiting Admin Decision</div>;
  }

  return (
    <div className="response-badge">
      {request.admin_response === 'accepted' ? (
        <>
          <CheckCircle size={16} />
          <span>Accepted</span>
        </>
      ) : (
        <>
          <XCircle size={16} />
          <span>Rejected</span>
        </>
      )}
    </div>
  );
};

export default TheatreRequests;
