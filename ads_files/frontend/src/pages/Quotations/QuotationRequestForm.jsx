import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, FileText, MessageSquare, Monitor } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import quotationService from '../../services/quotationService';

const QuotationRequestForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quotation, setQuotation] = useState(null);
  const [description, setDescription] = useState('');
  const [selectedScreens, setSelectedScreens] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuotationDetails = async () => {
      try {
        const response = await quotationService.getQuotations();
        const found = response.data.find((item) => item.ad_id === Number(id));

        if (!found) {
          toast.error('Ad campaign not found');
          navigate('/quotations');
          return;
        }

        setQuotation(found);
        setDescription(found.theatre_message || '');
        setSelectedScreens(found.selected_screens || []);
      } catch (error) {
        toast.error('Failed to load campaign details');
        navigate('/quotations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuotationDetails();
  }, [id, navigate]);

  const selectScreen = (screenNum) => {
    setSelectedScreens([screenNum]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!quotation) {
      toast.error('Campaign details not found');
      return;
    }

    if (selectedScreens.length === 0) {
      toast.error('Please select a screen');
      return;
    }

    setIsSubmitting(true);
    try {
      // If quotation.id is null, it means no quotation record exists yet.
      // The backend confirmQuotation is updated to handle this using the ID in URL as adId.
      const targetId = quotation.id || id;
      await quotationService.confirmQuotation(targetId, user?.id, description.trim(), selectedScreens);
      toast.success('Request sent to Admin successfully');
      navigate('/quotations');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send request to Admin');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <span>Loading request form...</span>
      </div>
    );
  }

  if (!quotation) return null;

  return (
    <div className="request-form-page">
      <header className="page-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft size={18} />
          <span>Back to Quotation</span>
        </button>
        <h1 className="page-title">Send Request to Admin</h1>
      </header>

      <div className="glass-card request-form-card">
        <div className="assignment-prompt">
          <Monitor size={18} />
          <p><strong>Screen Selection:</strong> Please choose the specific screen where this advertisement will be displayed.</p>
        </div>

        <div className="request-summary">
          <div className="summary-item">
            <FileText size={18} />
            <div>
              <span className="summary-label">Quotation</span>
              <strong>{quotation.ad_title}</strong>
            </div>
          </div>
          <div className="summary-item">
            <CheckCircle size={18} />
            <div>
              <span className="summary-label">Quoted Amount</span>
              <strong>{quotation.amount ? `$${Number(quotation.amount).toLocaleString()}` : 'N/A'}</strong>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="request-form">
          <div className="form-group">
            <label className="section-label">
              <Monitor size={16} />
              <span>Available Screens</span>
            </label>
            <p className="field-hint">Choose one screen for this advertisement campaign.</p>
            <div className="screens-selection-grid">
              {[1, 2, 3, 4, 5].map(num => (
                <div 
                  key={num} 
                  className={`screen-option ${selectedScreens.includes(num) ? 'selected' : ''}`}
                  onClick={() => selectScreen(num)}
                >
                  <div className="screen-checkbox radio">
                    {selectedScreens.includes(num) && <div className="radio-inner" />}
                  </div>
                  <span className="screen-name">Screen {num}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">
              <MessageSquare size={16} />
              <span>Description / Message to Admin</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write the request or message you want to send to the Admin..."
              rows="6"
              className="description-textarea"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate(-1)} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .assignment-prompt {
          background: rgba(99, 102, 241, 0.1);
          border-bottom: 1px solid rgba(99, 102, 241, 0.2);
          padding: 1.25rem 2rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          color: var(--primary);
        }

        .assignment-prompt p {
          margin: 0;
          font-size: 0.95rem;
          color: var(--text);
        }

        .assignment-prompt strong {
          color: var(--primary);
        }

        .request-form-page {
          max-width: 820px;
          margin: 0 auto;
          animation: fadeIn 0.3s ease-out;
        }

        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-muted);
          background: none;
        }

        .request-form-card {
          padding: 2rem;
        }

        .request-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .summary-item {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
          padding: 1rem;
          border: 1px solid var(--glass-border);
          border-radius: 0.875rem;
          background: rgba(255,255,255,0.03);
        }

        .summary-item svg {
          color: var(--primary);
          margin-top: 0.1rem;
        }

        .summary-item div {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .summary-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .request-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          font-weight: 600;
          color: var(--text);
        }

        .description-textarea {
          width: 100%;
          padding: 1rem;
          min-height: 180px;
          border-radius: 0.875rem;
          border: 1px solid var(--glass-border);
          background: var(--surface-light);
          color: var(--text);
          font-family: inherit;
          resize: vertical;
        }
        
        .field-hint {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 1rem;
          margin-left: 2rem;
        }

        .screens-selection-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .screen-option {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border: 1px solid var(--glass-border);
          border-radius: 10px;
          background: rgba(255,255,255,0.03);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .screen-option:hover {
          background: rgba(255,255,255,0.07);
          border-color: var(--primary);
        }

        .screen-option.selected {
          background: rgba(99, 102, 241, 0.1);
          border-color: var(--primary);
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.1);
        }

        .screen-checkbox {
          width: 20px;
          height: 20px;
          border-radius: 4px;
          border: 2px solid var(--glass-border);
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.2);
          color: var(--primary);
        }

        .screen-checkbox.radio {
          border-radius: 50%;
        }

        .radio-inner {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--primary);
          box-shadow: 0 0 8px var(--primary);
        }

        .screen-option.selected .screen-checkbox {
          border-color: var(--primary);
          background: rgba(99, 102, 241, 0.2);
        }

        .screen-name {
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--text);
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
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

        .spinner {
          width: 36px;
          height: 36px;
          border: 3px solid var(--glass-border);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default QuotationRequestForm;
