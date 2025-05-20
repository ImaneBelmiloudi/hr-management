import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClipboardList, FaPlus, FaTimes, FaSearch } from 'react-icons/fa';
import { employeeLeaveRequestService } from '../../services/employee-leave-request.service';

const LeaveRequest = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    type: '',
    start_date: '',
    end_date: '',
    reason: ''
  });

  // Fetch leave requests
  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        setLoading(true);
        const response = await employeeLeaveRequestService.getLeaveRequests();

        // Ensure leaveRequests is always an array
        const requestsData = Array.isArray(response.data) ? response.data :
          (response.data && Array.isArray(response.data.data)) ? response.data.data : [];

        setLeaveRequests(requestsData);
        setFilteredRequests(requestsData);
      } catch (err) {
        console.error('Error fetching leave requests:', err);
        setError('Impossible de charger les demandes de congé. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveRequests();
  }, []);

  // Filter leave requests based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredRequests(leaveRequests);
    } else {
      const filtered = leaveRequests.filter(request =>
        (request.type && request.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (request.reason && request.reason.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (request.status && request.status.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredRequests(filtered);
    }
  }, [searchTerm, leaveRequests]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Toggle form visibility
  const toggleForm = () => {
    setIsFormVisible(!isFormVisible);
    if (!isFormVisible) {
      // Reset form when opening
      setFormData({
        type: '',
        start_date: '',
        end_date: '',
        reason: ''
      });
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await employeeLeaveRequestService.createLeaveRequest({
        ...formData,
        type: formData.type
      });
      // Fetch the latest leave requests from backend
      const response = await employeeLeaveRequestService.getLeaveRequests();
      const requestsData = Array.isArray(response.data) ? response.data :
        (response.data && Array.isArray(response.data.data)) ? response.data.data : [];
      setLeaveRequests(requestsData);
      setFilteredRequests(requestsData);
      // Reset form and hide it
      setFormData({
        type: '',
        start_date: '',
        end_date: '',
        reason: ''
      });
      setIsFormVisible(false);
    } catch (err) {
      console.error('Error creating leave request:', err);
      setError('Impossible de créer la demande de congé. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };

  // Cancel leave request
  const handleCancel = async (id) => {
    console.log('Trying to cancel leave request with id:', id);
    if (window.confirm('Êtes-vous sûr de vouloir annuler cette demande de congé ?')) {
      try {
        setLoading(true);
        const res = await employeeLeaveRequestService.cancelLeaveRequest(id);
        console.log('API response:', res);
        // Update local state
        setLeaveRequests(leaveRequests.map(request =>
          request.id === id ? { ...request, status: 'cancelled' } : request
        ));
      } catch (err) {
        console.error('Error cancelling leave request:', err);
        setError('Impossible d\'annuler la demande. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Helper function to get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to get status text
  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'approved':
        return 'Approuvé';
      case 'rejected':
        return 'Rejeté';
      case 'cancelled':
        return 'Annulé';
      default:
        return 'Inconnu';
    }
  };

  if (loading && leaveRequests.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <span className="text-sm font-medium text-gray-500">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error && leaveRequests.length === 0) {
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
        <h1 className="text-2xl font-bold text-gray-900">Mes Congés</h1>
        <button
          onClick={toggleForm}
          className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {isFormVisible ? 'Annuler' : (
            <>
              <FaPlus className="mr-2" />
              Nouvelle demande
            </>
          )}
        </button>
      </div>

      {/* Form for adding leave request */}
      {isFormVisible && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-medium text-gray-900">Nouvelle demande de congé</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Type */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type de congé</label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <FaClipboardList className="text-gray-400" />
                  </div>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner un type</option>
                    <option value="annual">Congé annuel</option>
                    <option value="sick">Congé maladie</option>
                    <option value="personal">Congé personnel</option>
                    <option value="family">Congé familial</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
              </div>

              {/* Start Date */}
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">Date de début</label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <FaCalendarAlt className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="start_date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    required
                    className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* End Date */}
              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">Date de fin</label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <FaCalendarAlt className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="end_date"
                    name="end_date"
                    value={formData.end_date}
                    min={formData.start_date}
                    onChange={handleInputChange}
                    required
                    className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Reason */}
              <div className="md:col-span-2">
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Raison</label>
                <textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Veuillez expliquer la raison de votre demande de congé"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Chargement...' : 'Soumettre la demande'}
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
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full rounded-full border border-gray-200 bg-white px-4 py-2 pl-10 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Leave Requests List */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-medium text-gray-900">Historique des demandes</h2>

        {filteredRequests.length === 0 ? (
          <p className="text-gray-500">Aucune demande de congé trouvée.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Période</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Raison</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date de soumission</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredRequests.map((request, idx) => (
                  <tr key={request.id || idx}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{request.type || 'N/A'}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {formatDate(request.start_date)} - {formatDate(request.end_date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                        {request.reason || 'N/A'}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeColor(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {formatDate(request.created_at)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {request.status === 'pending' && (
                        <button
                          onClick={() => handleCancel(request.id)}
                          className="flex items-center rounded p-1 text-red-600 hover:bg-red-100"
                          title="Annuler"
                        >
                          <FaTimes className="mr-1" />
                          <span>Annuler</span>
                        </button>
                      )}
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

export default LeaveRequest;
