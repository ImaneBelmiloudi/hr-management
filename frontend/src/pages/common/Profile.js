import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FiUser, 
  FiMail, 
  FiBriefcase, 
  FiGrid, 
  FiCalendar,
  FiEdit2,
  FiAlertCircle
} from 'react-icons/fi';
import { employeeService } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      if (user && user.role === 'employee') {
        try {
          setLoading(true);
          const response = await employeeService.getById(user.id);
          setEmployee(response.data);
        } catch (err) {
          console.error('Error fetching employee details:', err);
          setError('Unable to fetch employee information');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchEmployeeDetails();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="loading-spinner h-12 w-12"></div>
      </div>
    );
  }

  const renderRoleSpecificInfo = () => {
    switch (user.role) {
      case 'employee':
        return employee ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="card flex items-start space-x-4">
              <FiBriefcase className="mt-1 h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-500">Poste</p>
                <p className="mt-1 text-base font-medium text-gray-900">{employee.position}</p>
              </div>
            </div>
            
            <div className="card flex items-start space-x-4">
              <FiGrid className="mt-1 h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-500">Département</p>
                <p className="mt-1 text-base font-medium text-gray-900">{employee.department}</p>
              </div>
            </div>
            
            <div className="card flex items-start space-x-4">
              <FiCalendar className="mt-1 h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-500">Date d'embauche</p>
                <p className="mt-1 text-base font-medium text-gray-900">
                  {new Date(employee.hire_date).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="card flex items-center space-x-3 bg-yellow-50 border-yellow-200">
            <FiAlertCircle className="h-5 w-5 text-yellow-500" />
            <p className="text-sm text-yellow-700">Informations de l'employé non trouvées</p>
          </div>
        );
      case 'rh':
        return (
          <div className="card flex items-center space-x-3 bg-blue-50 border-blue-200">
            <FiBriefcase className="h-5 w-5 text-blue-500" />
            <div>
              <h3 className="font-medium text-blue-900">Ressources Humaines</h3>
              <p className="text-sm text-blue-700">Accès à tous les outils de gestion RH</p>
            </div>
          </div>
        );
      case 'admin':
        return (
          <div className="card flex items-center space-x-3 bg-purple-50 border-purple-200">
            <FiGrid className="h-5 w-5 text-purple-500" />
            <div>
              <h3 className="font-medium text-purple-900">Administrateur</h3>
              <p className="text-sm text-purple-700">Accès à toutes les fonctionnalités du système</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-br from-blue-500 to-blue-600">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="text-white">
            <h1 className="text-2xl font-bold">Mon Profil</h1>
            <p className="mt-1 text-blue-100">Gérez vos informations personnelles</p>
          </div>
          <button 
            className="btn mt-4 flex items-center space-x-2 bg-white/10 text-white hover:bg-white/20 focus:ring-white sm:mt-0"
            onClick={() => navigate('/settings')}
          >
            <FiEdit2 className="h-4 w-4" />
            <span>Modifier le profil</span>
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div className="card space-y-6">
        {error && (
          <div className="flex items-center space-x-3 rounded-lg bg-red-50 p-4 text-red-700">
            <FiAlertCircle className="h-5 w-5 text-red-500" />
            <p>{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* User photo */}
          <div className="flex flex-col items-center lg:w-48">
            <div className="relative">
              <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 ring-4 ring-white">
                <div className="flex h-full items-center justify-center">
                  <FiUser className="h-12 w-12 text-blue-500" />
                </div>
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                <span className="badge badge-blue capitalize">
                  {user.role === 'rh' ? 'HR' : user.role}
                </span>
              </div>
            </div>
          </div>

          {/* User info */}
          <div className="flex-1 space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex items-start space-x-4">
                <FiUser className="mt-1 h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Nom</p>
                  <p className="mt-1 text-base font-medium text-gray-900">{user.name}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <FiMail className="mt-1 h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="mt-1 text-base font-medium text-gray-900">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100"></div>

            {/* Role specific information */}
            {renderRoleSpecificInfo()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
