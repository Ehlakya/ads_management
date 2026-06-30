import api from './api';

const userService = {
  createAdmin: async (adminData) => {
    const response = await api.post('/users/create-admin', adminData);
    return response.data;
  },
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  createAgent: async (agentData) => {
    const response = await api.post('/users/create-agent', agentData);
    return response.data;
  },
};

export default userService;
