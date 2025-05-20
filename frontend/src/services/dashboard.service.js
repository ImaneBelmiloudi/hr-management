import api from './api';

// Dashboard services
export const dashboardService = {
  // Admin dashboard stats avec logs détaillés
  getAdminStats: async () => {
    try {
      console.log('Calling API for admin dashboard stats...');
      const response = await api.get('/api/admin/dashboard-stats');
      console.log('API response for admin stats:', response.data);
      return response;
    } catch (error) {
      console.error('Error in getAdminStats:', error);
      throw error;
    }
  },
  
  // RH dashboard stats
  getRhStats: () => api.get('/api/rh/dashboard-stats'),
  
  // Employee dashboard stats avec logs détaillés
  getEmployeeStats: async () => {
    try {
      console.log('Calling API for employee dashboard stats...');
      const response = await api.get('/api/employee/dashboard-stats');
      console.log('API response for employee stats:', response.data);
      return response;
    } catch (error) {
      console.error('Error in getEmployeeStats:', error);
      throw error;
    }
  }
};

export default dashboardService;
