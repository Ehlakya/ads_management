import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Megaphone, 
  DollarSign, 
  Briefcase, 
  Activity, 
  Calendar, 
  ArrowLeft,
  Shield,
  Hash,
  Eye,
  Video,
  PlayCircle,
  X
} from 'lucide-react';
import adsService from '../../services/adsService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const AdDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ad, setAd] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  useEffect(() => {
    const fetchAdDetails = async () => {
      try {
        const response = await adsService.getAdById(id);
        setAd(response.data);
      } catch (error) {
        toast.error('Failed to load advertisement details');
        navigate('/ads');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdDetails();
  }, [id, navigate]);

  const handleOkClick = () => {
    navigate(`/sales/add/${id}`);
  };

  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <span>Retrieving advertisement data...</span>
      </div>
    );
  }

  if (!ad) return null;

  const closeVideoModal = () => setIsVideoModalOpen(false);

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

  return (
    <div className="ad-details-container">
      <header className="details-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
        <h1 className="page-title">Ad Specifications</h1>
      </header>

      <div className="details-card-view">
        <div className="square-card glass-card">
          <div className="card-identity">
            <div className="card-icon-box">
              <Shield size={28} />
            </div>
            <div className="card-titles">
              <h3>Campaign Profile</h3>
              <p>Detailed view of advertisement parameters</p>
            </div>
          </div>

          <ul className="point-wise-list">
            <li>
              <div className="list-icon"><Megaphone size={18} /></div>
              <div className="list-content">
                <label>Ad Name</label>
                <span>{ad.title}</span>
              </div>
            </li>
            <li>
              <div className="list-icon"><Briefcase size={18} /></div>
              <div className="list-content">
                <label>Client</label>
                <span>{ad.client}</span>
              </div>
            </li>
            <li>
              <div className="list-icon"><DollarSign size={18} /></div>
              <div className="list-content">
                <label>Price / Budget</label>
                <span className="price-text">${Number(ad.budget).toLocaleString()}</span>
              </div>
            </li>
            <li>
              <div className="list-icon"><Activity size={18} /></div>
              <div className="list-content">
                <label>Status</label>
                <span className={`badge ${getStatusClass(ad.status)}`}>{ad.status}</span>
              </div>
            </li>
            <li>
              <div className="list-icon"><Eye size={18} /></div>
              <div className="list-content">
                <label>Impressions</label>
                <span>{Number(ad.impressions).toLocaleString()}</span>
              </div>
            </li>
            <li>
              <div className="list-icon"><Hash size={18} /></div>
              <div className="list-content">
                <label>Reference ID</label>
                <span className="ref-id">AD-{String(ad.id).padStart(4, '0')}</span>
              </div>
            </li>
            <li>
              <div className="list-icon"><Video size={18} /></div>
              <div className="list-content">
                <label>Video Link</label>
                {ad.video_url ? (
                  <button 
                    onClick={() => setIsVideoModalOpen(true)}
                    className="video-play-btn"
                  >
                    <PlayCircle size={16} />
                    {ad.video_url.startsWith('/uploads') ? 'Play Uploaded Video' : 'Play External Video'}
                  </button>
                ) : (
                  <span className="not-provided">Not provided</span>
                )}
              </div>
            </li>
            <li>
              <div className="list-icon"><Calendar size={18} /></div>
              <div className="list-content">
                <label>Registered Date</label>
                <span>{new Date(ad.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
              </div>
            </li>
          </ul>

          <div className="card-footer">
            {user?.role === 'agent' ? (
              <button onClick={handleOkClick} className="btn-primary ok-btn">
                OK
              </button>
            ) : (
              <p>Verification system: Active</p>
            )}
          </div>
        </div>
      </div>

      {isVideoModalOpen && (
        <div className="video-modal-overlay" onClick={closeVideoModal}>
          <div className="video-modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={closeVideoModal}>
              <X size={24} />
            </button>
            <div className="video-player-wrapper">
              {renderVideoPlayer(ad.video_url)}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .ad-details-container {
          max-width: 600px;
          margin: 0 auto;
          animation: slideUp 0.4s ease-out;
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
          font-weight: 500;
        }

        .back-btn:hover { color: var(--text); }

        .details-card-view {
          display: flex;
          justify-content: center;
        }

        .square-card {
          width: 100%;
          aspect-ratio: 1 / 1.1; /* Slightly taller than a perfect square to fit all info */
          padding: 3rem;
          display: flex;
          flex-direction: column;
          border: 1px solid var(--glass-border);
        }

        .card-identity {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border);
        }

        .card-icon-box {
          width: 60px;
          height: 60px;
          background: var(--primary);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 8px 16px rgba(99, 102, 241, 0.3);
        }

        .card-titles h3 {
          font-size: 1.5rem;
          font-weight: 800;
          color: white;
          margin-bottom: 0.25rem;
        }

        .card-titles p {
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .point-wise-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          flex: 1;
        }

        .point-wise-list li {
          display: flex;
          align-items: flex-start;
          gap: 1.25rem;
        }

        .list-icon {
          color: var(--primary);
          margin-top: 2px;
          opacity: 0.8;
        }

        .list-content {
          display: flex;
          flex-direction: column;
        }

        .list-content label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 0.05em;
          margin-bottom: 2px;
        }

        .list-content span {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text);
        }

        .price-text {
          color: var(--success) !important;
          font-family: 'Inter', sans-serif;
        }

        .ref-id {
          font-family: monospace;
          color: var(--text-muted) !important;
        }

        .video-play-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
          font-weight: 600;
          color: var(--primary);
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.2);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          width: fit-content;
          margin-top: 0.25rem;
        }

        .video-play-btn:hover {
          background: rgba(99, 102, 241, 0.2);
          transform: translateY(-1px);
        }

        .not-provided {
          font-size: 1rem;
          color: var(--text-muted) !important;
          font-style: italic;
          font-weight: 400 !important;
        }

        .card-footer {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border);
          text-align: center;
        }

        .card-footer p {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-style: italic;
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

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
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

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
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
          .square-card {
            aspect-ratio: auto;
            padding: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'active': return 'badge-success';
    case 'pending': return 'badge-warning';
    case 'draft': return 'badge-info';
    case 'ended': return 'badge-error';
    default: return 'badge-info';
  }
};

export default AdDetails;
