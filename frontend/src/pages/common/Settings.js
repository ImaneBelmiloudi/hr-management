import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FiSettings, 
  FiSave, 
  FiEdit2, 
  FiX, 
  FiAlertCircle, 
  FiCheckCircle,
  FiUser,
  FiMail,
  FiBriefcase
} from 'react-icons/fi';
import { userService } from '../../services/api';

const Settings = () => {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // Update profile info
      await userService.updateProfile({
        name: formData.name,
        email: formData.email
      });
      user.name = formData.name;
      user.email = formData.email;
      // If password fields are filled, update password
      if (formData.oldPassword && formData.newPassword && formData.confirmPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('Les nouveaux mots de passe ne correspondent pas.');
        }
        await userService.changePassword({
          old_password: formData.oldPassword,
          new_password: formData.newPassword,
          new_password_confirmation: formData.confirmPassword
        });
      }
      setSuccess('Vos informations ont été mises à jour avec succès.');
      setIsEditing(false);
      setFormData(f => ({ ...f, oldPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Une erreur est survenue lors de la mise à jour de votre profil.');
    } finally {
      setLoading(false);
    }
  };

  const toggleEditMode = () => {
    if (isEditing) {
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
    setIsEditing(!isEditing);
    setError(null);
    setSuccess(null);
  };

  const getRoleLabel = () => {
    switch (user.role) {
      case 'rh':
        return 'Human Resources';
      case 'admin':
        return 'Administrator';
      default:
        return 'Employee';
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* En-tête */}
      <div className="card bg-gradient-to-br from-blue-500 to-blue-600">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="text-white">
            <h1 className="text-2xl font-bold">Paramètres du compte</h1>
            <p className="mt-1 text-blue-100">Gérez les préférences de votre compte</p>
          </div>
          <button 
            onClick={toggleEditMode}
            className={`btn mt-4 flex items-center space-x-2 sm:mt-0 ${
              isEditing 
                ? 'bg-white/10 text-white hover:bg-white/20' 
                : 'bg-white text-blue-600 hover:bg-blue-50'
            }`}
          >
            {isEditing ? (
              <>
                <FiX className="h-4 w-4" />
                <span>Annuler</span>
              </>
            ) : (
              <>
                <FiEdit2 className="h-4 w-4" />
                <span>Modifier le profil</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="card space-y-6">
        {/* Notifications */}
        {error && (
          <div className="flex items-center space-x-3 rounded-lg bg-red-50 p-4 text-red-700">
            <FiAlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
            <p className="flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              <FiX className="h-5 w-5" />
            </button>
          </div>
        )}
        
        {success && (
          <div className="flex items-center space-x-3 rounded-lg bg-green-50 p-4 text-green-700">
            <FiCheckCircle className="h-5 w-5 flex-shrink-0 text-green-500" />
            <p className="flex-1">{success}</p>
            <button onClick={() => setSuccess(null)} className="text-green-500 hover:text-green-700">
              <FiX className="h-5 w-5" />
            </button>
          </div>
        )}

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FiSettings className="h-6 w-6 text-blue-500" />
              <h2 className="text-lg font-medium text-gray-900">Informations du compte</h2>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Nom d'utilisateur</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <FiUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    name="name"
                    value={isEditing ? formData.name : user.name} 
                    onChange={handleChange}
                    readOnly={!isEditing}
                    disabled={loading}
                    className={`input pl-10 ${
                      isEditing ? 'bg-white' : 'bg-gray-50'
                    }`}
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <FiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input 
                    type="email" 
                    name="email"
                    value={isEditing ? formData.email : user.email} 
                    onChange={handleChange}
                    readOnly={!isEditing}
                    disabled={loading}
                    className={`input pl-10 ${
                      isEditing ? 'bg-white' : 'bg-gray-50'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Password change section */}
            {isEditing && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Changer le mot de passe</label>
                <div className="grid gap-4 sm:grid-cols-3">
                  <input
                    type="password"
                    name="oldPassword"
                    placeholder="Ancien mot de passe"
                    className="input"
                    value={formData.oldPassword}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="Nouveau mot de passe"
                    className="input"
                    value={formData.newPassword}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirmer le mot de passe"
                    className="input"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                <p className="mt-1.5 text-xs text-gray-500">Laissez les champs de mot de passe vides si vous ne souhaitez pas changer votre mot de passe.</p>
              </div>
            )}
            
            {isEditing && (
              <div className="flex justify-end pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn btn-primary flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner h-4 w-4"></div>
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <>
                      <FiSave className="h-4 w-4" />
                      <span>Enregistrer les modifications</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
