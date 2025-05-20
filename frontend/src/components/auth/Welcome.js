import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiShield, FiBarChart2, FiClock, FiAward, FiPieChart } from 'react-icons/fi';

const Welcome = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header - Modern Clean Style */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">HR Management</h1>
            <Link
              to="/login"
              className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 shadow-sm hover:shadow"
            >
              <span>Se connecter</span>
              <FiArrowRight className="h-4 w-4 ml-1.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Clean and Minimal */}
      <section className="relative bg-gradient-to-r from-blue-50 to-indigo-50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row">
            {/* Left column - Text content */}
            <div className="lg:w-1/2 lg:pr-12">
              <div className="max-w-xl">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                  Gérez efficacement vos <span className="text-blue-600">ressources humaines</span>
                </h2>
                <p className="mt-4 text-lg text-gray-600">
                  Une solution complète pour optimiser vos processus RH, analyser vos données et améliorer la satisfaction de vos employés.
                </p>
                <div className="mt-8">
                  <Link
                    to="/login"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition duration-200"
                  >
                    Commencer maintenant
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Right column - Card */}
            <div className="lg:w-1/2 mt-10 lg:mt-0">
              <div className="flex justify-end">
                <div className="bg-white rounded-xl shadow-xl overflow-hidden max-w-md w-full transform hover:-translate-y-1 transition duration-300">
                  <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                  <div className="p-6">
                    <div className="flex items-center justify-center h-48 mb-4 bg-blue-50 rounded-lg">
                      <FiPieChart className="w-24 h-24 text-blue-500 opacity-80" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 text-center">Tableau de Bord Analytique</h3>
                    <p className="mt-2 text-gray-500 text-center">Gérez vos ressources humaines avec des données en temps réel</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Clean Grid Layout */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Fonctionnalités principales
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl">
              Notre système offre tout ce dont vous avez besoin pour une gestion RH efficace
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<FiShield />}
              title="Administration Sécurisée"
              description="Contrôle total sur le système avec une gestion sécurisée des accès"
              color="bg-blue-600"
            />
            <FeatureCard
              icon={<FiBarChart2 />}
              title="Analytique Avancée"
              description="Accédez à des insights détaillés sur vos ressources humaines"
              color="bg-indigo-600"
            />
            <FeatureCard
              icon={<FiClock />}
              title="Gestion du Temps"
              description="Suivez facilement les présences, congés et absences de façon centralisée"
              color="bg-blue-600"
            />
          </div>
        </div>
      </section>

      {/* Benefits Section - Clean Cards */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-gray-900 text-center sm:text-3xl">
            Les avantages de notre solution
          </h3>
          
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <BenefitCard
              icon={<FiAward />}
              title="Interface Intuitive"
              description="Navigation fluide et efficace pour tous les utilisateurs"
            />
            <BenefitCard
              icon={<FiBarChart2 />}
              title="Gestion Centralisée"
              description="Toutes vos données RH au même endroit"
            />
            <BenefitCard
              icon={<FiClock />}
              title="Processus Automatisés"
              description="Réduction des tâches manuelles et élimination des erreurs"
            />
            <BenefitCard
              icon={<FiPieChart />}
              title="Analyses en Temps Réel"
              description="Tableaux de bord et rapports dynamiques"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} HR Management System. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, color }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
    <div className="p-6">
      <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4`}>
        {React.cloneElement(icon, { className: 'h-6 w-6' })}
      </div>
      <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  </div>
);

const BenefitCard = ({ icon, title, description }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-300">
    <div className="text-blue-500 mb-4">
      {React.cloneElement(icon, { className: 'h-8 w-8' })}
    </div>
    <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
    <p className="mt-2 text-gray-600 text-sm">{description}</p>
  </div>
);

export default Welcome;