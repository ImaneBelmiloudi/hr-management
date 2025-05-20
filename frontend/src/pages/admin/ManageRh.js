import React, { useState, useEffect } from 'react';
import { FaUserTie, FaEnvelope, FaLock, FaIdCard, FaTrash, FaEdit, FaPlus, FaSearch } from 'react-icons/fa';
import { hrStaffService } from '../../services/api';

const ManageRh = () => {
  const [rhStaff, setRhStaff] = useState([]);
  const [filteredRhStaff, setFilteredRhStaff] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRhId, setCurrentRhId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    employee_id: ''
  });

  // Fetch RH staff data
  useEffect(() => {
    const fetchRhStaff = async () => {
      try {
        setLoading(true);
        const response = await hrStaffService.getAll();
        
        // Ensure rhStaff is always an array
        const rhStaffData = Array.isArray(response.data) ? response.data : 
                          (response.data && Array.isArray(response.data.data)) ? response.data.data : [];
        
        // Map the data to ensure we have the correct structure
        const formattedData = rhStaffData.map(staff => {
          // Handle both direct properties and nested user properties
          return {
            id: staff.id,
            name: staff.name || (staff.user && staff.user.name) || 'N/A',
            email: staff.email || (staff.user && staff.user.email) || 'N/A',
            employee_id: staff.employee_id || staff.id || 'N/A',
            user: staff.user || null
          };
        });
        
        setRhStaff(formattedData);
        setFilteredRhStaff(formattedData);
      } catch (err) {
        console.error('Error fetching RH staff:', err);
        setError('Impossible de charger les données du personnel RH. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchRhStaff();
  }, []);

  // Filter RH staff based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredRhStaff(rhStaff);
    } else {
      const filtered = rhStaff.filter(staff => 
        (staff.name && staff.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (staff.email && staff.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (staff.employee_id && staff.employee_id.toString().includes(searchTerm))
      );
      setFilteredRhStaff(filtered);
    }
  }, [searchTerm, rhStaff]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      employee_id: ''
    });
    setIsEditing(false);
    setCurrentRhId(null);
  };

  // Toggle form visibility
  const toggleForm = () => {
    setIsFormVisible(!isFormVisible);
    if (!isFormVisible) {
      resetForm();
    }
  };

  // Edit RH staff member
  const handleEdit = (staff) => {
    setIsFormVisible(true);
    setIsEditing(true);
    setCurrentRhId(staff.id);
    setFormData({
      name: staff.name || '',
      email: staff.email || '',
      password: '', // Don't populate password for security
      employee_id: staff.employee_id || ''
    });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Prepare data for API
      const apiData = {
        name: formData.name,
        email: formData.email,
        role: 'rh', // Ensure role is set to 'rh'
        employee_id: formData.employee_id
      };
      
      // Only add password if it's provided
      if (formData.password && formData.password.trim() !== '') {
        apiData.password = formData.password;
      }
      
      // We've already handled the password above
      
      let response;
      
      if (isEditing) {
        // Update existing RH staff
        response = await hrStaffService.update(currentRhId, apiData);
        
        // Format the updated staff member to match our expected structure
        const updatedData = {
          id: response.data.id || currentRhId,
          name: response.data.name || (response.data.user && response.data.user.name) || apiData.name,
          email: response.data.email || (response.data.user && response.data.user.email) || apiData.email,
          employee_id: apiData.employee_id || response.data.employee_id || response.data.id || currentRhId,
          user: response.data.user || null
        };
        
        // Update local state
        const updatedRhStaff = rhStaff.map(staff => 
          staff.id === currentRhId ? { ...staff, ...updatedData } : staff
        );
        setRhStaff(updatedRhStaff);
        setFilteredRhStaff(updatedRhStaff.filter(staff => 
          searchTerm.trim() === '' || 
          (staff.name && staff.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (staff.email && staff.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (staff.employee_id && staff.employee_id.toString().includes(searchTerm))
        ));
      } else {
        // Create new RH staff
        response = await hrStaffService.create(apiData);
        
        // Format the new staff member to match our expected structure
        const newStaffMember = {
          id: response.data.id,
          name: response.data.name || (response.data.user && response.data.user.name) || apiData.name,
          email: response.data.email || (response.data.user && response.data.user.email) || apiData.email,
          employee_id: apiData.employee_id || response.data.employee_id || response.data.id,
          user: response.data.user || null
        };
        
        // Update local state
        setRhStaff([...rhStaff, newStaffMember]);
        setFilteredRhStaff([...filteredRhStaff, newStaffMember]);
      }
      
      // Reset form and hide it
      resetForm();
      setIsFormVisible(false);
      
    } catch (err) {
      console.error('Error saving RH staff:', err);
      setError('Impossible de sauvegarder les données. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };

  // Delete RH staff member
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce membre du personnel RH ?')) {
      try {
        setLoading(true);
        await hrStaffService.delete(id);
        
        // Update local state
        setRhStaff(rhStaff.filter(staff => staff.id !== id));
        
      } catch (err) {
        console.error('Error deleting RH staff:', err);
        setError('Impossible de supprimer le membre du personnel RH. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Helper function to get initials
  const getInitials = (name) => {
    if (!name) return 'xx';
    return name
      .split(' ')
      .map(part => part[0]?.toLowerCase())
      .join('');
  };

  if (loading && rhStaff.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <span className="text-sm font-medium text-gray-500">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error && rhStaff.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="rounded-lg bg-red-50 p-4 text-red-800">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gérer Personnel RH</h1>
        <button
          onClick={toggleForm}
          className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {isFormVisible ? 'Annuler' : (
            <>
              <FaPlus className="mr-2" />
              Ajouter Personnel RH
            </>
          )}
        </button>
      </div>

      {/* Form for adding/editing RH staff */}
      {isFormVisible && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-medium text-gray-900">
            {isEditing ? 'Modifier Personnel RH' : 'Ajouter Personnel RH'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom Complet</label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <FaUserTie className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Nom complet"
                    className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="email@example.com"
                    className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mot de passe {isEditing && '(laisser vide pour ne pas changer)'}
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!isEditing}
                    placeholder={isEditing ? "••••••••" : "Mot de passe"}
                    className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              {/* Employee ID */}
              <div>
                <label htmlFor="employee_id" className="block text-sm font-medium text-gray-700">ID Employé</label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <FaIdCard className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="employee_id"
                    name="employee_id"
                    value={formData.employee_id}
                    onChange={handleInputChange}
                    required
                    placeholder="ID Employé"
                    className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={toggleForm}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Chargement...' : (isEditing ? 'Mettre à jour' : 'Ajouter')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <FaSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Rechercher personnel RH..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full rounded-full border border-gray-200 bg-white px-4 py-2 pl-10 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* RH Staff List */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-medium text-gray-900">Personnel RH</h2>
        
        {filteredRhStaff.length === 0 ? (
          <p className="text-gray-500">Aucun personnel RH trouvé.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr key="header-row">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Personnel</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">ID Employé</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredRhStaff.map((staff) => (
                  <tr key={staff.id}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                          <span className="text-sm font-medium text-blue-800">
                            {getInitials(staff.name)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{staff.name || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{staff.email || 'N/A'}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{staff.employee_id || 'N/A'}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(staff)}
                          className="rounded p-1 text-blue-600 hover:bg-blue-100"
                          title="Modifier"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(staff.id)}
                          className="rounded p-1 text-red-600 hover:bg-red-100"
                          title="Supprimer"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageRh;
