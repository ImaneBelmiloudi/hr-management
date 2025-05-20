import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Créer l'instance API avec les configurations nécessaires
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
});

// Add a request interceptor to include the auth token on each request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: (credentials) => api.post('/api/login', credentials),
  register: (userData) => api.post('/api/register', userData),
  logout: () => api.post('/api/logout'),
  getUser: () => api.get('/api/user'),
  updateProfile: (userData) => api.put('/api/user/profile', userData)
};

// User services
export const userService = {
  updateProfile: (userData) => api.put('/api/user/profile', userData),
  changePassword: (passwordData) => api.put('/api/user/password', passwordData)
};

// Employee services
export const employeeService = {
  getAll: () => api.get('/api/employees?role=employee'),
  getById: (id) => api.get(`/api/employees/${id}`),
  create: (data) => api.post('/api/employees', data),
  update: (id, data) => api.put(`/api/employees/${id}`, data),
  delete: (id) => api.delete(`/api/employees/${id}`)
};

// Leave Request services
export const leaveRequestService = {
  getAll: (params) => api.get('/api/leave-requests', { params }),
  getById: (id) => api.get(`/api/leave-requests/${id}`),
  create: (data) => api.post('/api/leave-requests', data),
  update: (id, data) => api.put(`/api/leave-requests/${id}`, data),
  updateStatus: (id, data) => api.post(`/api/leave-requests/${id}/status`, data),
  cancel: (id) => api.delete(`/api/leave-requests/${id}`)
};

// Employee Leave Request services
export const employeeLeaveRequestService = {
  getAll: (params) => api.get('/api/leave-requests', { params: { ...params, employee: true } }),
  getById: (id) => api.get(`/api/leave-requests/${id}`),
  create: (data) => api.post('/api/leave-requests', data),
  update: (id, data) => api.put(`/api/leave-requests/${id}`, data),
  cancel: (id) => api.delete(`/api/leave-requests/${id}`)
};

// Absence Justification services
export const absenceJustificationService = {
  getAll: (params) => api.get('/api/absence-justifications', { params }),
  getById: (id) => api.get(`/api/absence-justifications/${id}`),
  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });
    return api.post('/api/absence-justifications', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  update: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });
    return api.put(`/api/absence-justifications/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  updateStatus: (id, data) => api.post(`/api/absence-justifications/${id}/status`, data),
  delete: (id) => api.delete(`/api/absence-justifications/${id}`)
};

// Employee Absence Justification services
export const employeeAbsenceJustificationService = {
  getAll: (params) => api.get('/api/employee/absence-justifications', { params }),
  getById: (id) => api.get(`/api/employee/absence-justifications/${id}`),
  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });
    return api.post('/api/employee/absence-justifications', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  update: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });
    return api.put(`/api/employee/absence-justifications/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  delete: (id) => api.delete(`/api/employee/absence-justifications/${id}`)
};

// Complaint services
export const complaintService = {
  getAll: (params) => api.get('/api/complaints', { params }),
  getById: (id) => api.get(`/api/complaints/${id}`),
  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });
    return api.post('/api/complaints', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  update: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });
    return api.put(`/api/complaints/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  updateStatus: (id, data) => api.post(`/api/complaints/${id}/status`, data),
  delete: (id) => api.delete(`/api/complaints/${id}`)
};

// HR Staff services
export const hrStaffService = {
  getAll: () => api.get('/api/employees?role=rh'),
  getById: (id) => api.get(`/api/employees/${id}`),
  create: (data) => api.post('/api/employees', { ...data, role: 'rh' }),
  update: (id, data) => api.put(`/api/employees/${id}`, data),
  delete: (id) => api.delete(`/api/employees/${id}`)
};

export default api;
