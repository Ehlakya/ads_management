import api from './api';

const adsService = {
  getAds: async () => {
    const response = await api.get('/ads');
    return response.data;
  },
  createAd: async (adData) => {
    const isFormData = adData instanceof FormData;
    const response = await api.post('/ads', adData, {
      headers: {
        'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
      },
    });
    return response.data;
  },
  getAdById: async (id) => {
    const response = await api.get(`/ads/${id}`);
    return response.data;
  },
  updateAd: async (id, adData) => {
    const isFormData = adData instanceof FormData;
    const response = await api.put(`/ads/${id}`, adData, {
      headers: {
        'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
      },
    });
    return response.data;
  },
};

export default adsService;
