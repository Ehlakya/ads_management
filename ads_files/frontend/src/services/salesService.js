import api from './api';

const salesService = {
  getSales: async () => {
    const response = await api.get('/sales');
    return response.data;
  },
  createSale: async (saleData) => {
    const response = await api.post('/sales', saleData);
    return response.data;
  },
  updateSaleStatus: async (id, status) => {
    const response = await api.put(`/sales/${id}/status`, { status });
    return response.data;
  },
};

export default salesService;
