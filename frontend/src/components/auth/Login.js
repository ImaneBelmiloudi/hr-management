import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiArrowLeft, FiShield, FiMail, FiLock, FiUserPlus, FiUserCheck, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleBack = () => {
    setSelectedRole(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      {/* Background with subtle pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-70"></div>
      
      <div className="relative z-10 w-full max-w-4xl px-4 py-8 sm:px-0">
        {/* Back to Home Link */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors">
            <FiArrowLeft className="mr-2" />
            Retour à l'accueil
          </Link>
        </div>
        
        {selectedRole ? (
          <LoginForm role={selectedRole} onBack={handleBack} />
        ) : (
          <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
            {/* Card Header */}
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-700">
              <h2 className="text-xl font-bold text-white text-center">Bienvenue sur GRH System</h2>
              <p className="mt-2 text-blue-100 text-center">Sélectionnez votre rôle pour continuer</p>
            </div>

            {/* Role Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">
              <RoleCard
                role="Admin"
                icon={<FiShield />}
                description="Gestion complète du système"
                onClick={() => handleRoleSelect('Admin')}
                gradient="from-blue-600 to-blue-700"
              />
              <RoleCard
                role="RH"
                icon={<FiUserPlus />}
                description="Gestion des ressources humaines"
                onClick={() => handleRoleSelect('RH')}
                gradient="from-blue-600 to-blue-700"
              />
              <RoleCard
                role="Employee"
                icon={<FiUser />}
                description="Accès employé"
                onClick={() => handleRoleSelect('Employee')}
                gradient="from-blue-600 to-blue-700"
              />
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-center text-sm text-gray-500">
              <p>© {new Date().getFullYear()} HR Management System. Tous droits réservés.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

const RoleCard = ({ role, icon, description, onClick, gradient }) => (
  <div
    onClick={onClick}
    className={`bg-gradient-to-br ${gradient} rounded-xl p-6 text-white shadow-sm hover:shadow-md transform transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] cursor-pointer`}
  >
    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
      {React.cloneElement(icon, { className: 'h-8 w-8' })}
    </div>
    <h3 className="text-xl font-semibold text-center">{role}</h3>
    <p className="text-white/80 text-sm mt-2 text-center">{description}</p>
  </div>
);

const LoginForm = ({ role, onBack }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validate inputs
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Veuillez entrer un email valide.');
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      setIsLoading(false);
      return;
    }

    try {
      // Authenticate with the API
      const user = await login({ email, password });
      
      // Set success message
      setSuccess(`Connexion réussie en tant que ${role} ! Redirection...`);

      // Redirect based on role
      setTimeout(() => {
        if (role === 'Admin') {
          navigate('/admin/dashboard');
        } else if (role === 'RH') {
          navigate('/rh/dashboard');
        } else if (role === 'Employee') {
          navigate('/employee/dashboard');
        }
      }, 1000);
    } catch (error) {
      setError(error.message || 'Une erreur est survenue lors de la connexion.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
      {/* Card Header */}
      <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-700 flex items-center">
        <button
          onClick={onBack}
          className="text-white hover:text-blue-100 transition-colors"
        >
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <div className="ml-4">
          <h2 className="text-xl font-bold text-white">Espace {role}</h2>
          <p className="text-sm text-blue-100">Connectez-vous pour accéder au tableau de bord</p>
        </div>
      </div>

      {/* Login Form */}
      <div className="p-6">
        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50"
                placeholder={role === 'Admin' ? 'admin@example.com' : role === 'RH' ? 'rh@example.com' : 'employee@example.com'}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50"
                placeholder="••••••••"
              />
              <div 
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
              </div>
            </div>
          </div>

          {/* Spacer for consistent form spacing */}
          <div className="h-2"></div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 flex justify-center items-center disabled:opacity-70"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            {isLoading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>
      </div>
      
      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} HR Management System. Tous droits réservés.</p>
      </div>
    </div>
  );
};

export default Login;