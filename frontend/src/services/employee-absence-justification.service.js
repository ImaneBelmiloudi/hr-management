import api from './api';

const employeeAbsenceJustificationService = {
  getAbsenceJustifications: async () => {
    return api.get('/api/employee/absence-justifications');
  },

  getAbsenceJustificationById: async (id) => {
    return api.get(`/api/employee/absence-justifications/${id}`);
  },

  createAbsenceJustification: async (data) => {
    // If data is already FormData, send as is
    return api.post('/api/employee/absence-justifications', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  updateAbsenceJustification: async (id, data) => {
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

  deleteAbsenceJustification: async (id) => {
    return api.delete(`/api/employee/absence-justifications/${id}`);
  }
};

export { employeeAbsenceJustificationService };
export default employeeAbsenceJustificationService;
