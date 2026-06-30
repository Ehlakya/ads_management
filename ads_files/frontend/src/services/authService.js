import api from './api';

const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  signup: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },
  loginTheatre: async (credentials) => {
    const response = await api.post('/auth/theatre/login', credentials);
    return response.data;
  },
  registerTheatre: async (userData) => {
    const response = await api.post('/auth/theatre/register', userData);
    return response.data;
  },
  // Theatre user request management
  getTheatreRequests: async () => {
    const response = await api.get('/users/theatre-requests');
    return response.data;
  },
  getTheatreRequestStatus: async (id) => {
    const response = await api.get(`/users/theatre-requests/${id}`);
    return response.data;
  },
  approveTheatreRequest: async (id) => {
    const response = await api.post(`/users/theatre-requests/${id}/approve`);
    return response.data;
  },
  rejectTheatreRequest: async (id, reason) => {
    const response = await api.post(`/users/theatre-requests/${id}/reject`, { reason });
    return response.data;
  },
};

export default authService;
