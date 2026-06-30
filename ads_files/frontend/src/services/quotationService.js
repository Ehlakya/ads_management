import api from './api';

const quotationService = {
  getQuotations: async () => {
    const response = await api.get('/quotations');
    return response.data;
  },
  createQuotation: async (quotationData) => {
    const response = await api.post('/quotations', quotationData);
    return response.data;
  },
  confirmQuotation: async (quotationId, theatreUserId, description, selectedScreens) => {
    const response = await api.post(`/quotations/${quotationId}/confirm`, { 
      theatreUserId, 
      description,
      selected_screens: selectedScreens 
    });
    return response.data;
  },
  getTheatreRequests: async () => {
    const response = await api.get('/quotations/requests/theatre');
    return response.data;
  },
  respondToTheatreRequest: async (quotationId, response, suggestedScreen = null) => {
    const apiResponse = await api.put(`/quotations/${quotationId}/respond`, { response, suggestedScreen });
    return apiResponse.data;
  },
  respondToScreenSuggestion: async (quotationId, decision) => {
    const response = await api.post(`/quotations/${quotationId}/screen-decision`, { decision });
    return response.data;
  },
  getMyRequests: async () => {
    const response = await api.get('/quotations/my-requests');
    return response.data;
  },
};

export default quotationService;
