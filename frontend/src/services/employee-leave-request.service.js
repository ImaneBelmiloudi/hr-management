import api from './api';

const employeeLeaveRequestService = {
  getLeaveRequests: async () => {
    return api.get('/api/leave-requests', { params: { employee: true } });
  },

  getLeaveRequestById: async (id) => {
    return api.get(`/api/leave-requests/${id}`);
  },

  createLeaveRequest: async (data) => {
    return api.post('/api/leave-requests', data);
  },

  updateLeaveRequest: async (id, data) => {
    return api.put(`/api/leave-requests/${id}`, data);
  },

  cancelLeaveRequest: async (id) => {
    return api.delete(`/api/leave-requests/${id}`);
  }
};

export { employeeLeaveRequestService };
export default employeeLeaveRequestService;
