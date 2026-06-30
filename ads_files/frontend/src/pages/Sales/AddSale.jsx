import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  DollarSign, 
  MapPin, 
  Send, 
  ArrowLeft,
  Megaphone,
  Briefcase
} from 'lucide-react';
import salesService from '../../services/salesService';
import adsService from '../../services/adsService';
import { toast } from 'react-hot-toast';

const AddSale = () => {
  const { adId } = useParams();
  const navigate = useNavigate();
  const [ad, setAd] = useState(null);
  const [formData, setFormData] = useState({
    theater_name: '',
    sale_amount: '',
    theater_address: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const response = await adsService.getAdById(adId);
        setAd(response.data);
      } catch (error) {
        toast.error('Could not find advertisement reference');
        navigate('/quotations');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAd();
  }, [adId, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await salesService.createSale({
        ad_id: adId,
        ...formData
      });
      toast.success('Sale record submitted successfully!');
      navigate('/quotations');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit sale record');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="loading-state">Loading...</div>;

  return (
    <div className="add-sale-container">
      <header className="page-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft size={18} />
          <span>Cancel</span>
        </button>
        <div>
          <h1 className="page-title">Submit Sales Record</h1>
          <p className="subtitle">Enter the finalized theater and sales information for this campaign.</p>
        </div>
      </header>

      <div className="campaign-context-bar glass-card">
        <div className="context-item">
          <Megaphone size={16} />
          <span>{ad?.title}</span>
        </div>
        <div className="context-divider"></div>
        <div className="context-item">
          <Briefcase size={16} />
          <span>{ad?.client}</span>
        </div>
      </div>

      <div className="form-card glass-card">
        <form onSubmit={handleSubmit} className="modern-form">
          <div className="input-group">
            <label>Theater Name</label>
            <div className="input-wrapper">
              <Building2 size={18} className="input-icon" />
              <input
                type="text"
                name="theater_name"
                placeholder="e.g. PVR Cinemas, IMAX"
                value={formData.theater_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Final Sale Amount ($)</label>
            <div className="input-wrapper">
              <DollarSign size={18} className="input-icon" />
              <input
                type="number"
                name="sale_amount"
                placeholder="e.g. 25000"
                value={formData.sale_amount}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Theater Address</label>
            <div className="input-wrapper">
              <MapPin size={18} className="input-icon" />
              <textarea
                name="theater_address"
                placeholder="Full address of the theater..."
                value={formData.theater_address}
                onChange={handleChange}
                required
                rows="3"
              />
            </div>
          </div>

          <button type="submit" className="btn-primary submit-btn" disabled={isSubmitting}>
            <Send size={18} />
            {isSubmitting ? 'Submitting...' : 'Register Sale Record'}
          </button>
        </form>
      </div>

      <style>{`
        .add-sale-container {
          max-width: 600px;
          margin: 0 auto;
          animation: slideIn 0.4s ease-out;
        }

        .campaign-context-bar {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1rem 1.5rem;
          margin-bottom: 2rem;
          background: rgba(99, 102, 241, 0.05);
          border: 1px dashed var(--primary);
        }

        .context-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text);
          font-weight: 600;
          font-size: 0.9rem;
        }

        .context-divider {
          width: 1px;
          height: 20px;
          background: var(--border);
        }

        .form-card {
          padding: 2.5rem;
        }

        .modern-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .input-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          top: 14px;
          color: var(--text-muted);
        }

        .input-wrapper input, .input-wrapper textarea {
          width: 100%;
          padding: 0.75rem 0.75rem 0.75rem 2.5rem;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 10px;
          color: var(--text);
          font-family: inherit;
        }

        .input-wrapper input:focus, .input-wrapper textarea:focus {
          border-color: var(--primary);
          outline: none;
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
        }

        .submit-btn {
          margin-top: 1rem;
          width: 100%;
          justify-content: center;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default AddSale;
