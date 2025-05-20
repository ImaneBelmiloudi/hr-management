import api from './api';

export const complaintService = {
  // Get all complaints for the employee
  getComplaints: async () => {
    return api.get('/api/complaints/employee');
  },

  // Create a new complaint
  createComplaint: async (complaintData) => {
    return api.post('/api/complaints', complaintData);
  },

  // Get a specific complaint by ID
  getComplaintById: async (id) => {
    return api.get(`/api/complaints/${id}`);
  },

  // Update a complaint
  updateComplaint: async (id, complaintData) => {
    return api.put(`/api/complaints/${id}`, complaintData);
  },

  // Delete a complaint
  deleteComplaint: async (id) => {
    return api.delete(`/api/complaints/${id}`);
  },
};
