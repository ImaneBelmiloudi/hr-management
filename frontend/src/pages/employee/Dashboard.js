import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FaCalendarAlt, FaFileAlt, FaExclamationCircle } from 'react-icons/fa';
import { employeeAbsenceJustificationService } from '../../services/employee-absence-justification.service';
import api from '../../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pendingLeaves: 0,
    approvedLeaves: 0,
    pendingJustifications: 0,
    pendingComplaints: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentJustifications, setRecentJustifications] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/employee/dashboard-stats');
        console.log('Dashboard data response:', response.data);
        
        if (response && response.data) {
          setStats({
            pendingLeaves: response.data.stats.pendingLeaves || 0,
            approvedLeaves: response.data.stats.approvedLeaves || 0,
            pendingJustifications: response.data.stats.pendingAbsences || 0,
            pendingComplaints: response.data.stats.pendingComplaints || 0
          });
        }
        // Fetch recent absence justifications
        const justRes = await employeeAbsenceJustificationService.getAbsenceJustifications();
        const justData = Array.isArray(justRes.data) ? justRes.data : (justRes.data && Array.isArray(justRes.data.data)) ? justRes.data.data : [];
        setRecentJustifications(justData.slice(0, 5));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Impossible de charger les données du tableau de bord. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR');
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
      <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord Employé</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <FaCalendarAlt className="text-blue-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Congés en attente</h2>
              <p className="mt-1 text-xl font-semibold text-gray-900">{stats.pendingLeaves}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <FaCalendarAlt className="text-green-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Congés approuvés</h2>
              <p className="mt-1 text-xl font-semibold text-gray-900">{stats.approvedLeaves}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
              <FaFileAlt className="text-yellow-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Justificatifs en attente</h2>
              <p className="mt-1 text-xl font-semibold text-gray-900">{stats.pendingJustifications}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <FaExclamationCircle className="text-red-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Réclamations en attente</h2>
              <p className="mt-1 text-xl font-semibold text-gray-900">{stats.pendingComplaints}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Absence Justifications Table */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-medium text-gray-900">Mes 5 derniers justificatifs d'absence</h2>
        {recentJustifications.length === 0 ? (
          <p className="text-gray-500">Aucun justificatif d'absence trouvé.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">PÉRIODE</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Raison</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date de soumission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {recentJustifications.map((j) => (
                  <tr key={j.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{j.type || 'N/A'}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {j.absence_date
                        ? (() => {
                            const start = new Date(j.absence_date);
                            const end = new Date(start);
                            end.setDate(start.getDate() + (j.duration ? j.duration - 1 : 0));
                            return `${formatDate(start)} - ${formatDate(end)}`;
                          })()
                        : 'N/A - N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                        {j.reason || 'N/A'}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${j.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : j.status === 'approved' ? 'bg-green-100 text-green-800' : j.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                        {j.status === 'pending' ? 'En attente' : j.status === 'approved' ? 'Approuvé' : j.status === 'rejected' ? 'Rejeté' : 'Inconnu'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{formatDate(j.created_at)}</td>
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
