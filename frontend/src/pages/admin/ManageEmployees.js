import React, { useState, useEffect } from 'react';
import { FaUserTie, FaEnvelope, FaLock, FaIdCard, FaTrash, FaEdit, FaPlus, FaSearch, FaBriefcase, FaGraduationCap, FaCalendarAlt } from 'react-icons/fa';
import { employeeService } from '../../services/api';

const ManageEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEmployeeId, setCurrentEmployeeId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    employee_id: '',
    position: '',
    grade: '',
    hire_date: ''
  });

  // Fonction pour sauvegarder les données des employés dans le stockage local
  const saveEmployeesToLocalStorage = (employees) => {
    try {
      localStorage.setItem('employees', JSON.stringify(employees));
      console.log('Employees saved to local storage:', employees);
    } catch (error) {
      console.error('Error saving employees to local storage:', error);
    }
  };

  // Fonction pour récupérer les données des employés du stockage local
  const getEmployeesFromLocalStorage = () => {
    try {
      const storedEmployees = localStorage.getItem('employees');
      if (storedEmployees) {
        return JSON.parse(storedEmployees);
      }
    } catch (error) {
      console.error('Error getting employees from local storage:', error);
    }
    return [];
  };

  // Fetch employees data
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await employeeService.getAll();
        
        // Ensure employees is always an array
        const employeesData = Array.isArray(response.data) ? response.data : 
                            (response.data && Array.isArray(response.data.data)) ? response.data.data : [];
        
        // Filter out admin and HR staff, only show regular employees
        const regularEmployees = employeesData.filter(emp => 
          emp.user && emp.user.role === 'employee'
        );
        
        // Format employee data to ensure consistent structure
        const formattedEmployees = regularEmployees.map(emp => ({
          id: emp.id,
          name: emp.name || (emp.user && emp.user.name) || 'N/A',
          email: emp.email || (emp.user && emp.user.email) || 'N/A',
          employee_id: emp.employee_id || (emp.id ? `EMP-${emp.id}` : 'N/A'),
          position: emp.position || 'Non spécifié',
          grade: emp.grade || 'N/A',
          hire_date: emp.hire_date || 'N/A',
          user: emp.user || { role: 'employee' }
        }));
        
        console.log('Formatted employees:', formattedEmployees);
        
        // Fusionner avec les données du stockage local pour préserver les grades
        const mergedEmployees = formattedEmployees.map(emp => {
          const storedEmployee = getEmployeesFromLocalStorage().find(stored => stored.id === emp.id);
          if (storedEmployee && storedEmployee.grade && storedEmployee.grade !== 'N/A') {
            console.log(`Using stored grade ${storedEmployee.grade} for employee ${emp.id}`);
            return { ...emp, grade: storedEmployee.grade };
          }
          return emp;
        });
        
        setEmployees(mergedEmployees);
        setFilteredEmployees(mergedEmployees);
        
        // Sauvegarder les données fusionnées dans le stockage local
        saveEmployeesToLocalStorage(mergedEmployees);
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError('Impossible de charger les données des employés. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Helper functions for employee data
  const getEmployeeName = (employee) => employee.name || (employee.user && employee.user.name) || 'N/A';
  const getEmployeeEmail = (employee) => employee.email || (employee.user && employee.user.email) || 'N/A';
  const getEmployeePosition = (employee) => employee.position || 'N/A';
  const getEmployeeGrade = (employee) => {
    // Vérifier toutes les sources possibles pour le grade
    let grade = 'N/A';
    
    if (employee.grade && employee.grade !== 'N/A') {
      grade = employee.grade;
    } else if (employee.employee_data && employee.employee_data.grade && employee.employee_data.grade !== 'N/A') {
      grade = employee.employee_data.grade;
    }
    
    // Vérifier si le grade est un nombre ou une chaîne
    if (grade !== 'N/A') {
      // S'assurer que c'est une chaîne pour l'affichage
      return grade.toString();
    }
    
    return grade;
  };

  // Filter employees based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter(employee => 
        getEmployeeName(employee).toLowerCase().includes(searchTerm.toLowerCase()) ||
        getEmployeeEmail(employee).toLowerCase().includes(searchTerm.toLowerCase()) ||
        getEmployeePosition(employee).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (employee.employee_id && employee.employee_id.toString().includes(searchTerm))
      );
      setFilteredEmployees(filtered);
    }
  }, [searchTerm, employees]);

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
      employee_id: '',
      position: '',
      grade: '',
      hire_date: ''
    });
    setIsEditing(false);
    setCurrentEmployeeId(null);
  };

  // Toggle form visibility
  const toggleForm = () => {
    setIsFormVisible(!isFormVisible);
    if (!isFormVisible) {
      resetForm();
    }
  };

  // Edit employee
  const handleEdit = (employee) => {
    setIsFormVisible(true);
    setIsEditing(true);
    setCurrentEmployeeId(employee.id);
    
    setFormData({
      name: getEmployeeName(employee),
      email: getEmployeeEmail(employee),
      password: '', // Don't populate password for security
      employee_id: employee.employee_id || '',
      position: employee.position || '',
      grade: employee.grade || '',
      hire_date: employee.hire_date || ''
    });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Prepare data for API based on Laravel expectations
      const gradeValue = formData.grade ? String(formData.grade) : null;
      const apiData = {
        name: formData.name,
        email: formData.email,
        role: 'employee',
        employee_id: formData.employee_id,
        position: formData.position,
        grade: gradeValue,
        hire_date: formData.hire_date,
        employee_data: {
          employee_id: formData.employee_id,
          position: formData.position,
          grade: gradeValue,
          hire_date: formData.hire_date
        }
      };
      
      console.log('Form data being sent to API:', apiData);
      
      // Only add password if it's provided
      if (formData.password && formData.password.trim() !== '') {
        apiData.password = formData.password;
      }
      
      let response;
      
      if (isEditing) {
        // Update existing employee
        response = await employeeService.update(currentEmployeeId, apiData);
        console.log('API response after update:', response.data);
        
        // Format the updated employee to match our expected structure
        const updatedData = {
          id: response.data.id || currentEmployeeId,
          name: response.data.name || (response.data.user && response.data.user.name) || apiData.name,
          email: response.data.email || (response.data.user && response.data.user.email) || apiData.email,
          employee_id: apiData.employee_id || response.data.employee_id || (response.data.id ? `EMP-${response.data.id}` : currentEmployeeId),
          position: apiData.position || response.data.position || 'Non spécifié',
          // Utiliser directement le grade du formulaire puisque c'est celui que l'utilisateur a sélectionné
          grade: formData.grade || apiData.grade || response.data.grade || 'N/A',
          hire_date: apiData.hire_date || response.data.hire_date || 'N/A',
          user: response.data.user || { role: 'employee', name: apiData.name, email: apiData.email },
          // Conserver les données originales pour débogage
          employee_data: response.data.employee_data || {
            grade: formData.grade || apiData.grade
          }
        };
        
        console.log('Updated employee data with grade:', updatedData.grade);
        
        // Update local state
        const updatedEmployees = employees.map(employee => 
          employee.id === currentEmployeeId ? { ...employee, ...updatedData } : employee
        );
        setEmployees(updatedEmployees);
        setFilteredEmployees(updatedEmployees.filter(emp => emp.user && emp.user.role === 'employee'));
        
        // Sauvegarder les données mises à jour dans le stockage local
        saveEmployeesToLocalStorage(updatedEmployees);
      } else {
        // Create new employee
        response = await employeeService.create(apiData);
        console.log('API response after create:', response.data);
        
        // Format the new employee to match our expected structure
        const newEmployee = {
          id: response.data.id,
          name: response.data.name || (response.data.user && response.data.user.name) || apiData.name,
          email: response.data.email || (response.data.user && response.data.user.email) || apiData.email,
          employee_id: apiData.employee_id || response.data.employee_id || (response.data.id ? `EMP-${response.data.id}` : 'N/A'),
          position: apiData.position || response.data.position || 'Non spécifié',
          // Utiliser directement le grade du formulaire puisque c'est celui que l'utilisateur a sélectionné
          grade: formData.grade || apiData.grade || response.data.grade || 'N/A',
          hire_date: apiData.hire_date || response.data.hire_date || 'N/A',
          user: response.data.user || { role: 'employee', name: apiData.name, email: apiData.email },
          // Conserver les données originales pour débogage
          employee_data: response.data.employee_data || {
            grade: formData.grade || apiData.grade
          }
        };
        
        console.log('New employee data with grade:', newEmployee.grade);
        
        // Update local state
        const updatedEmployees = [...employees, newEmployee];
        setEmployees(updatedEmployees);
        setFilteredEmployees(updatedEmployees.filter(emp => emp.user && emp.user.role === 'employee'));
        
        // Sauvegarder les données mises à jour dans le stockage local
        saveEmployeesToLocalStorage(updatedEmployees);
      }
      
      // Reset form and hide it
      resetForm();
      setIsFormVisible(false);
      
    } catch (err) {
      console.error('Error saving employee:', err);
      // Log more details about the error
      if (err.response && err.response.data) {
        console.error('Error details:', err.response.data);
      }
      
      setError('Impossible de sauvegarder les données. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };

  // Delete employee
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      try {
        setLoading(true);
        await employeeService.delete(id);
        
        // Update local state
        setEmployees(employees.filter(employee => employee.id !== id));
        
      } catch (err) {
        console.error('Error deleting employee:', err);
        setError('Impossible de supprimer l\'employé. Veuillez réessayer plus tard.');
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

  if (loading && employees.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <span className="text-sm font-medium text-gray-500">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error && employees.length === 0) {
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
        <h1 className="text-2xl font-bold text-gray-900">Gérer Employés</h1>
        <button
          onClick={toggleForm}
          className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {isFormVisible ? 'Annuler' : (
            <>
              <FaPlus className="mr-2" />
              Ajouter Employé
            </>
          )}
        </button>
      </div>

      {/* Form for adding/editing employees */}
      {isFormVisible && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-medium text-gray-900">
            {isEditing ? 'Modifier Employé' : 'Ajouter Employé'}
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
              
              {/* Position */}
              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700">Poste</label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <FaBriefcase className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    required
                    placeholder="Poste"
                    className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              {/* Grade */}
              <div>
                <label htmlFor="grade" className="block text-sm font-medium text-gray-700">Grade</label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <FaGraduationCap className="text-gray-400" />
                  </div>
                  <select
                    id="grade"
                    name="grade"
                    value={formData.grade}
                    onChange={handleInputChange}
                    required
                    className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner un grade</option>
                    <option value="1">Grade 1</option>
                    <option value="2">Grade 2</option>
                    <option value="3">Grade 3</option>
                    <option value="4">Grade 4</option>
                    <option value="5">Grade 5</option>
                  </select>
                </div>
              </div>
              
              {/* Hire Date */}
              <div>
                <label htmlFor="hire_date" className="block text-sm font-medium text-gray-700">Date d'embauche</label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <FaCalendarAlt className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="hire_date"
                    name="hire_date"
                    value={formData.hire_date}
                    onChange={handleInputChange}
                    required
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
          placeholder="Rechercher employés..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full rounded-full border border-gray-200 bg-white px-4 py-2 pl-10 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Employees List */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-medium text-gray-900">Employés</h2>
        
        {filteredEmployees.length === 0 ? (
          <p className="text-gray-500">Aucun employé trouvé.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Employé</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Poste</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Grade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date d'embauche</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                          <span className="text-sm font-medium text-blue-800">
                            {getInitials(getEmployeeName(employee))}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{getEmployeeName(employee)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{getEmployeeEmail(employee)}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{employee.employee_id || 'N/A'}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{getEmployeePosition(employee)}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {getEmployeeGrade(employee) !== 'N/A' ? (
                        <>Grade {getEmployeeGrade(employee)}</>
                      ) : 'N/A'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {employee.hire_date ? new Date(employee.hire_date).toLocaleDateString('fr-FR') : 'N/A'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(employee)}
                          className="rounded p-1 text-blue-600 hover:bg-blue-100"
                          title="Modifier"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(employee.id)}
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

export default ManageEmployees;
