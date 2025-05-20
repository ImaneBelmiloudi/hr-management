import React, { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dashboard.service';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    pendingLeaveRequests: 0,
    pendingAbsenceJustifications: 0,
    pendingComplaints: 0
  });
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await dashboardService.getRhStats();
        
        if (response && response.data) {
          setStats({
            totalEmployees: response.data.stats?.totalEmployees || 0,
            activeEmployees: response.data.stats?.activeEmployees || 0,
            pendingLeaveRequests: response.data.stats?.pendingLeaves || 0,
            pendingAbsenceJustifications: 0,
            pendingComplaints: response.data.stats?.recentComplaints || 0
          });
          
          // Ensure recentEmployees is always an array
          const employeesData = Array.isArray(response.data.recentEmployees) 
            ? response.data.recentEmployees 
            : [];
          
          setRecentEmployees(employeesData);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Impossible de charger les données du tableau de bord. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Helper function to get employee initials
  const getInitials = (name) => {
    if (!name) return 'xx';
    return name
      .split(' ')
      .map(part => part[0]?.toLowerCase())
      .join('');
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <span className="text-sm font-medium text-gray-500">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error) {
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
      <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord RH</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-sm font-medium text-gray-500">Total Employés</h2>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalEmployees}</p>
        </div>
        
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-sm font-medium text-gray-500">Employés Actifs</h2>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.activeEmployees}</p>
        </div>
        
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-sm font-medium text-gray-500">Demandes de Congé</h2>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.pendingLeaveRequests}</p>
        </div>
        
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-sm font-medium text-gray-500">Justificatifs d'Absence</h2>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.pendingAbsenceJustifications}</p>
        </div>
        
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-sm font-medium text-gray-500">Réclamations</h2>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.pendingComplaints}</p>
        </div>
      </div>
      
      {/* Recent Employees */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-medium text-gray-900">Employés Récents</h2>
        
        {recentEmployees.length === 0 ? (
          <p className="text-gray-500">Aucun employé récent à afficher.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Employé</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Poste</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Grade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date d'embauche</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {recentEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                          <span className="text-sm font-medium text-blue-800">
                            {getInitials(employee.name)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{employee.name || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{employee.email || 'N/A'}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{employee.position || 'N/A'}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">Grade {employee.grade || 'N/A'}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {employee.hire_date ? new Date(employee.hire_date).toLocaleDateString('fr-FR') : 'N/A'}
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

export default Dashboard;
