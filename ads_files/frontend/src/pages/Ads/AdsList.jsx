import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, Megaphone, TrendingUp, DollarSign, PlayCircle, X, Eye, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import adsService from '../../services/adsService';
import { toast } from 'react-hot-toast';

const AdsList = () => {
  const [ads, setAds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [videoModal, setVideoModal] = useState({ isOpen: false, url: '' });
  const [editingBudget, setEditingBudget] = useState(null);
  const [tempBudget, setTempBudget] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const response = await adsService.getAds();
      setAds(response.data);
    } catch (error) {
      toast.error('Failed to fetch advertisements');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id) => {
    // Confirm with user
    if (window.confirm('Are you sure you want to remove this campaign from the view? (This will not delete it from the server)')) {
      setAds(prevAds => prevAds.filter(ad => ad.id !== id));
      toast.success('Campaign removed from view');
    }
  };

  const filteredAds = ads.filter(ad => 
    ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ad.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRowClick = (ad) => {
    if (ad.video_url) {
      setVideoModal({ isOpen: true, url: ad.video_url });
    }
  };

  const closeVideoModal = (e) => {
    e.stopPropagation();
    setVideoModal({ isOpen: false, url: '' });
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

  const startEditingBudget = (e, ad) => {
    e.stopPropagation();
    setEditingBudget(ad.id);
    setTempBudget(ad.budget);
  };

  const handleBudgetChange = (e) => {
    setTempBudget(e.target.value);
  };

  const handleBudgetKeyDown = async (e, ad) => {
    if (e.key === 'Enter') {
      await saveBudget(ad);
    } else if (e.key === 'Escape') {
      setEditingBudget(null);
    }
  };

  const saveBudget = async (ad) => {
    if (tempBudget === ad.budget) {
      setEditingBudget(null);
      return;
    }
    try {
      await adsService.updateAd(ad.id, { budget: tempBudget });
      setAds(ads.map(a => a.id === ad.id ? { ...a, budget: tempBudget } : a));
      toast.success('Budget updated successfully');
    } catch (error) {
      toast.error('Failed to update budget');
    } finally {
      setEditingBudget(null);
    }
  };

  return (
    <div className="ads-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Ads Portfolio</h1>
          <p className="page-subtitle">A comprehensive overview of your advertising campaigns.</p>
        </div>
        <button onClick={() => navigate('/ads/create')} className="btn-primary">
          <Plus size={20} />
          <span>New Campaign</span>
        </button>
      </header>

      <div className="table-controls-row">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search campaigns or clients..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-actions">
          <button className="icon-btn-secondary">
            <Filter size={18} />
            <span>Filter</span>
          </button>
        </div>
      </div>

      <div className="ads-grid-container">
        {isLoading ? (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <span>Synchronizing data...</span>
          </div>
        ) : (
          <div className="ads-grid">
            {filteredAds.map((ad) => (
              <div 
                key={ad.id} 
                className="ad-card"
                onClick={() => handleRowClick(ad)}
              >
                <div className="ad-card-thumbnail">
                  {/* Status Tag Overlay */}
                  <div className={`ad-status-tag ${getStatusClass(ad.status)}`}>
                    {ad.status}
                  </div>
                  
                  {/* HD Asset Label */}
                  <div className="ad-hd-label">HD AD ASSET</div>
                  
                  {/* Play Icon Overlay */}
                  <div className="ad-play-overlay">
                    <PlayCircle size={32} />
                  </div>
                  
                  {/* Placeholder for video thumbnail - using generic gradient/icon if no image exists */}
                  <div className="thumbnail-placeholder">
                    {ad.video_url ? <Video size={48} className="thumbnail-icon" /> : <Megaphone size={48} className="thumbnail-icon" />}
                  </div>
                </div>
                
                <div className="ad-card-content">
                  <h3 className="ad-card-title">{ad.title}</h3>
                  <p className="ad-card-desc">Client: {ad.client}</p>
                  
                  <div className="ad-card-details">
                    <div 
                      className="ad-card-price" 
                      onClick={(e) => startEditingBudget(e, ad)}
                      title="Click to edit budget"
                      style={{ cursor: 'text' }}
                    >
                      <DollarSign size={16} />
                      {editingBudget === ad.id ? (
                        <input
                          type="number"
                          value={tempBudget}
                          onChange={handleBudgetChange}
                          onKeyDown={(e) => handleBudgetKeyDown(e, ad)}
                          onBlur={() => saveBudget(ad)}
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                          className="inline-budget-input"
                        />
                      ) : (
                        <span>{Number(ad.budget).toLocaleString()}</span>
                      )}
                    </div>
                    <div className="ad-card-date">
                      {new Date(ad.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                <div className="ad-card-actions">
                  <button 
                    className="card-btn btn-view"
                    onClick={(e) => { e.stopPropagation(); handleRowClick(ad); }}
                  >
                    <Eye size={16} /> View
                  </button>
                  <button 
                    className="card-btn btn-edit"
                    onClick={(e) => { e.stopPropagation(); navigate(`/ads/edit/${ad.id}`); }}
                  >
                    <Edit2 size={16} /> Edit
                  </button>
                  <button 
                    className="card-btn btn-delete"
                    onClick={(e) => { e.stopPropagation(); handleDelete(ad.id); }}
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            ))}
            
            {filteredAds.length === 0 && (
              <div className="empty-state-container">
                <div className="empty-content">
                  <Megaphone size={48} className="empty-icon" />
                  <h3>No results found</h3>
                  <p>Try adjusting your search terms or create a new campaign.</p>
                </div>
              </div>
            )}
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
        .ads-page {
          animation: fadeIn 0.4s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .table-controls-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .search-wrapper {
          position: relative;
          flex: 1;
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

        .icon-btn-secondary {
          background: var(--surface);
          border: 1px solid var(--border);
          color: var(--text);
          padding: 0.75rem 1.25rem;
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .loading-overlay {
          padding: 5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          color: var(--text-muted);
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid rgba(99, 102, 241, 0.2);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .ads-grid-container {
          width: 100%;
        }

        .ads-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .ad-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s ease;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          position: relative;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }

        .ad-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
          border-color: rgba(99, 102, 241, 0.5);
        }

        .ad-card-thumbnail {
          position: relative;
          height: 180px;
          background: linear-gradient(135deg, #1e1e2f, #12121c);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .thumbnail-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          color: rgba(255, 255, 255, 0.1);
        }

        .ad-status-tag {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          z-index: 2;
          box-shadow: 0 2px 10px rgba(0,0,0,0.5);
        }

        .ad-status-tag.badge-success { background: rgba(16, 185, 129, 0.9); color: #fff; }
        .ad-status-tag.badge-error { background: rgba(239, 68, 68, 0.9); color: #fff; }
        .ad-status-tag.badge-warning { background: rgba(245, 158, 11, 0.9); color: #fff; }
        .ad-status-tag.badge-info { background: rgba(59, 130, 246, 0.9); color: #fff; }

        .ad-hd-label {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(0, 0, 0, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(4px);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.5px;
          color: #fff;
          z-index: 2;
        }

        .ad-play-overlay {
          position: absolute;
          right: 16px;
          bottom: 16px;
          width: 48px;
          height: 48px;
          background: rgba(99, 102, 241, 0.9);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.6);
          opacity: 0.9;
          transition: all 0.2s ease;
          z-index: 2;
        }

        .ad-card:hover .ad-play-overlay {
          transform: scale(1.1);
          opacity: 1;
        }

        .ad-card-content {
          padding: 1.5rem;
          flex: 1;
        }

        .ad-card-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 0.5rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ad-card-desc {
          font-size: 0.875rem;
          color: var(--text-muted);
          margin-bottom: 1.25rem;
        }

        .ad-card-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .ad-card-price {
          display: flex;
          align-items: center;
          color: #eab308; /* Highlighted yellow */
          font-weight: 800;
          font-size: 1.1rem;
          text-shadow: 0 2px 10px rgba(234, 179, 8, 0.2);
          transition: transform 0.2s;
        }

        .ad-card-price:hover {
          transform: scale(1.05);
        }

        .inline-budget-input {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid #eab308;
          color: #eab308;
          font-weight: 800;
          font-size: 1.1rem;
          width: 80px;
          border-radius: 4px;
          padding: 2px 4px;
          outline: none;
        }
        
        /* Remove arrows from number input */
        .inline-budget-input::-webkit-outer-spin-button,
        .inline-budget-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .inline-budget-input[type=number] {
          -moz-appearance: textfield;
        }

        .ad-card-date {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-style: italic;
        }

        .ad-card-actions {
          display: flex;
          border-top: 1px solid var(--border);
          background: rgba(0,0,0,0.2);
        }

        .card-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1rem 0;
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .card-btn:not(:last-child) {
          border-right: 1px solid var(--border);
        }

        .card-btn:hover {
          background: rgba(255,255,255,0.05);
          color: var(--text);
        }

        .btn-view:hover { color: var(--primary); }
        .btn-edit:hover { color: var(--info); }
        .btn-delete:hover { color: var(--error); background: rgba(239, 68, 68, 0.1); }

        .empty-state-container {
          grid-column: 1 / -1;
          padding: 5rem 0;
          display: flex;
          justify-content: center;
          background: var(--surface);
          border-radius: 16px;
          border: 1px dashed var(--border);
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

        @media (max-width: 640px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .btn-primary {
            width: 100%;
          }
          .search-wrapper {
            max-width: 100%;
          }
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

export default AdsList;
