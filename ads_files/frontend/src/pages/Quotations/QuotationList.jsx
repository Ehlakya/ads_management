import React, { useEffect, useState } from 'react';
import { FileText, Search, Filter, Edit2, Trash2, Megaphone, TrendingUp, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import quotationService from '../../services/quotationService';
import { toast } from 'react-hot-toast';

const QuotationList = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      const response = await quotationService.getQuotations();
      setData(response.data);
    } catch (error) {
      toast.error('Failed to fetch quotation ledger');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = data.filter(item => 
    item.ad_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.ad_client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id) => {
    if (window.confirm('Remove this entry from your view?')) {
      setData(prev => prev.filter(item => item.id !== id));
      toast.success('Entry removed');
    }
  };

  return (
    <div className="quotations-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Quotations Ledger</h1>
          <p className="page-subtitle">Track financial proposals and campaign metrics in a unified view.</p>
        </div>
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

      <div className="glass-card table-container">
        {isLoading ? (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <span>Synchronizing data...</span>
          </div>
        ) : (
          <table className="modern-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Campaign Details</th>
                <th>Client Reference</th>
                <th>Status</th>
                <th>Financials</th>
                <th>Performance</th>
                <th style={{ textAlign: 'right' }}>View Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.id || `ad-${item.ad_id}`}>
                  <td className="ref-cell">
                    <span className="id-tag">#{String(item.ad_id).padStart(4, '0')}</span>
                  </td>
                  <td>
                    <div className="campaign-info">
                      <div className="campaign-icon">
                        <Megaphone size={16} />
                      </div>
                      <div className="campaign-text">
                        <span className="campaign-name">{item.ad_title}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="client-name" style={{ fontWeight: 500 }}>{item.ad_client}</span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusClass(item.ad_status)}`}>
                      {item.ad_status}
                    </span>
                  </td>
                  <td>
                    <div className="financial-info-stack">
                      <div className="info-row" title="Ad Budget">
                        <DollarSign size={12} className="text-muted" />
                        <span className="text-muted">{Number(item.ad_budget).toLocaleString()}</span>
                      </div>
                      {item.amount && (
                        <div className="info-row primary" title="Quote Amount">
                          <DollarSign size={14} />
                          <span>{Number(item.amount).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="performance-info">
                      <TrendingUp size={14} className="success-icon" />
                      <span>{Number(item.ad_impressions || 0).toLocaleString()}</span>
                    </div>
                  </td>
                  <td>
                    <div className="action-group" style={{ justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => navigate(`/quotations/${item.ad_id}`)} 
                        className="btn-secondary-sm"
                        style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                      >
                        View Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan="7" className="empty-row">
                    <div className="empty-content">
                      <FileText size={48} className="empty-icon" />
                      <h3>No matching records</h3>
                      <p>Adjust your search or link new ads to quotations.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <style>{`
        .quotations-page {
          animation: fadeIn 0.4s ease-out;
        }

        .financial-info-stack {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .info-row {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
        }

        .info-row.primary {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text);
        }

        .performance-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
        }

        .success-icon { color: var(--success); }

        .id-tag {
          font-family: 'JetBrains Mono', monospace;
          background: rgba(255,255,255,0.05);
          padding: 2px 6px;
          border-radius: 4px;
          color: var(--text-muted);
          font-size: 0.75rem;
        }

        .action-group {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
        }

        .action-btn {
          width: 34px;
          height: 34px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text-muted);
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: var(--surface-light);
          color: var(--text);
        }
      `}</style>
    </div>
  );
};

const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'accepted': 
    case 'active': 
      return 'badge-success';
    case 'pending': 
    case 'draft':
      return 'badge-warning';
    case 'rejected': 
    case 'ended':
      return 'badge-error';
    case 'pending_quote': 
      return 'badge-info';
    default: 
      return 'badge-info';
  }
};

export default QuotationList;
