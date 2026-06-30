import React, { useState, useEffect } from 'react';
import { Megaphone, DollarSign, Briefcase, Activity, ArrowLeft, Save, Video, Upload } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import adsService from '../../services/adsService';
import { toast } from 'react-hot-toast';

const EditAd = () => {
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    budget: '',
    quoted_amount: '',
    status: 'active',
    video_url: '',
  });
  const [videoFile, setVideoFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetchAdDetails();
  }, [id]);

  const fetchAdDetails = async () => {
    try {
      const response = await adsService.getAdById(id);
      const ad = response.data;
      setFormData({
        title: ad.title,
        client: ad.client,
        budget: ad.budget,
        quoted_amount: ad.Quotations && ad.Quotations.length > 0 ? ad.Quotations[0].amount : '',
        status: ad.status,
        video_url: ad.video_url || '',
      });
    } catch (error) {
      toast.error('Failed to load advertisement details');
      navigate('/ads');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setVideoFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      if (videoFile) {
        const data = new FormData();
        data.append('title', formData.title);
        data.append('client', formData.client);
        data.append('budget', formData.budget);
        data.append('status', formData.status);
        if (formData.video_url) data.append('video_url', formData.video_url);
        if (formData.quoted_amount) data.append('quoted_amount', formData.quoted_amount);
        data.append('video_file', videoFile);
        await adsService.updateAd(id, data);
      } else {
        await adsService.updateAd(id, formData);
      }
      toast.success('Advertisement updated successfully!');
      navigate('/ads');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update advertisement');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <span>Retrieving campaign data...</span>
      </div>
    );
  }

  return (
    <div className="create-ad-container">
      <header className="page-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft size={20} />
          <span>Back to Portfolio</span>
        </button>
        <div>
          <h1 className="page-title">Edit Advertisement</h1>
          <p className="subtitle">Modify the details of your campaign and save changes.</p>
        </div>
      </header>

      <div className="form-wrapper glass-card">
        <div className="form-icon">
          <Megaphone size={32} />
        </div>

        <form onSubmit={handleSubmit} className="ad-form">
          <div className="form-grid">
            <div className="input-group">
              <label>Ad Title</label>
              <div className="input-wrapper">
                <Megaphone size={18} className="input-icon" />
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Summer Sale 2024"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Client Name</label>
              <div className="input-wrapper">
                <Briefcase size={18} className="input-icon" />
                <input
                  type="text"
                  name="client"
                  placeholder="e.g. Nike, Apple, etc."
                  value={formData.client}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Budget ($)</label>
              <div className="input-wrapper">
                <DollarSign size={18} className="input-icon" />
                <input
                  type="number"
                  name="budget"
                  placeholder="e.g. 5000"
                  value={formData.budget}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Quoted Amount ($) (Optional)</label>
              <div className="input-wrapper">
                <DollarSign size={18} className="input-icon" style={{ color: 'var(--success)' }} />
                <input
                  type="number"
                  name="quoted_amount"
                  placeholder="e.g. 5500"
                  value={formData.quoted_amount}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Campaign Status</label>
              <div className="input-wrapper">
                <Activity size={18} className="input-icon" />
                <select name="status" value={formData.status} onChange={handleChange}>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="draft">Draft</option>
                  <option value="ended">Ended</option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <label>Video Link (Optional)</label>
              <div className="input-wrapper">
                <Video size={18} className="input-icon" />
                <input
                  type="url"
                  name="video_url"
                  placeholder="e.g. https://youtube.com/..."
                  value={formData.video_url}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Or Upload Video File (Optional)</label>
              <div className="input-wrapper">
                <Upload size={18} className="input-icon" />
                <input
                  type="file"
                  name="video_file"
                  accept="video/*"
                  onChange={handleFileChange}
                  style={{ paddingLeft: '40px', paddingTop: '8px' }}
                />
              </div>
            </div>
          </div>

          <div className="form-footer-info">
            <p>Changes will be reflected immediately across all tracking dashboards.</p>
          </div>

          <button type="submit" className="btn-primary submit-btn" disabled={isUpdating}>
            <Save size={18} />
            {isUpdating ? 'Saving Changes...' : 'Update Advertisement'}
          </button>
        </form>
      </div>

      <style>{`
        .create-ad-container {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          animation: slideUp 0.4s ease-out;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 60vh;
          gap: 1rem;
          color: var(--text-muted);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .back-btn {
          background: none;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-muted);
          margin-bottom: 1rem;
        }

        .back-btn:hover {
          color: var(--text);
        }

        .form-wrapper {
          padding: 3rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .form-icon {
          width: 64px;
          height: 64px;
          background: var(--glass);
          border-radius: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
          margin-bottom: 2rem;
          border: 1px solid var(--border);
        }

        .ad-form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .input-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-muted);
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .input-wrapper input, .input-wrapper select {
          padding-left: 40px;
        }

        .form-footer-info {
          background: rgba(99, 102, 241, 0.05);
          border: 1px solid rgba(99, 102, 241, 0.1);
          padding: 1rem;
          border-radius: 0.5rem;
          text-align: center;
        }

        .form-footer-info p {
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .submit-btn {
          width: 100%;
          justify-content: center;
        }

        @media (max-width: 640px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default EditAd;
