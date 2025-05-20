import React, { useState, useEffect } from 'react';
import { FaSearch, FaCheck, FaTimes, FaEye, FaComment } from 'react-icons/fa';
import api from '../../services/api';

const ComplaintReviews = () => {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [responseText, setResponseText] = useState('');

  // Status filter
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch complaints
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/complaints');
        
        // Ensure complaints is always an array
        const complaintsData = Array.isArray(response.data) ? response.data : 
                             (response.data && Array.isArray(response.data.data)) ? response.data.data : [];
        
        setComplaints(complaintsData);
        setFilteredComplaints(complaintsData);
      } catch (err) {
        console.error('Error fetching complaints:', err);
        setError('Impossible de charger les réclamations. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  // Filter complaints based on search term and status
  useEffect(() => {
    let filtered = complaints;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(complaint => complaint.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(complaint => 
        (complaint.employee && complaint.employee.name && 
         complaint.employee.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (complaint.subject && complaint.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (complaint.description && complaint.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredComplaints(filtered);
  }, [searchTerm, statusFilter, complaints]);

  // Handle view complaint details
  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setResponseText(complaint.resolution_details || '');
    setIsModalOpen(true);
  };

  // Handle resolve complaint
  const handleResolve = async (id, response) => {
    if (!response.trim()) {
      alert('Veuillez fournir une réponse avant de résoudre la réclamation.');
      return;
    }
    try {
      setLoading(true);
      await api.post(`/api/complaints/${id}/status`, {
        status: 'resolved',
        resolution_details: response
      });
      setComplaints(complaints.map(complaint => 
        complaint.id === id ? { ...complaint, status: 'resolved', resolution_details: response } : complaint
      ));
      if (isModalOpen && selectedComplaint && selectedComplaint.id === id) {
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error('Error resolving complaint:', err);
      setError('Impossible de résoudre la réclamation. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };

  // Handle reject complaint
  const handleReject = async (id) => {
    try {
      setLoading(true);
      await api.post(`/api/complaints/${id}/status`, {
        status: 'rejected',
        resolution_details: 'Réclamation rejetée'
      });
      setComplaints(complaints.map(complaint => 
        complaint.id === id ? { ...complaint, status: 'rejected' } : complaint
      ));
      if (isModalOpen && selectedComplaint && selectedComplaint.id === id) {
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error('Error rejecting complaint:', err);
      setError('Impossible de rejeter la réclamation. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get employee name
  const getEmployeeName = (complaint) => {
    return complaint.employee_name || 'N/A';
  };

  // Helper function to get initials
  const getInitials = (name) => {
    if (!name || name === 'N/A') return 'xx';
    return name
      .split(' ')
      .map(part => part[0]?.toLowerCase())
      .join('');
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
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to get status text
  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'resolved':
        return 'Résolu';
      case 'rejected':
        return 'Rejeté';
      default:
        return 'Inconnu';
    }
  };

  if (loading && complaints.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <span className="text-sm font-medium text-gray-500">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error && complaints.length === 0) {
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
      <h1 className="text-2xl font-bold text-gray-900">Réclamations</h1>

      {/* Filters */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
        {/* Search */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher réclamations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-full border border-gray-200 bg-white px-4 py-2 pl-10 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        
        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="resolved">Résolu</option>
            <option value="rejected">Rejeté</option>
          </select>
        </div>
      </div>

      {/* Complaints List */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-medium text-gray-900">Réclamations</h2>
        
        {filteredComplaints.length === 0 ? (
          <p className="text-gray-500">Aucune réclamation trouvée.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Employé</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Sujet</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date de soumission</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredComplaints.map((complaint) => (
                  <tr key={complaint.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                            <span className="text-sm font-medium text-gray-600">
                              {getInitials(getEmployeeName(complaint))}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{getEmployeeName(complaint)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{complaint.subject || 'N/A'}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{formatDate(complaint.created_at)}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeColor(complaint.status)}`}>
                        {getStatusText(complaint.status)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetails(complaint)}
                          className="rounded p-1 text-blue-600 hover:bg-blue-100"
                          title="Voir détails"
                        >
                          <FaEye />
                        </button>
                        
                        {complaint.status === 'pending' && (
                          <button
                            onClick={() => handleViewDetails(complaint)}
                            className="rounded p-1 text-blue-600 hover:bg-blue-100"
                            title="Répondre"
                          >
                            <FaComment />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for complaint details and response */}
      {isModalOpen && selectedComplaint && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>

            <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 w-full text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Détails de la réclamation</h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Employé</h4>
                        <p className="text-sm text-gray-900">{getEmployeeName(selectedComplaint)}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Sujet</h4>
                        <p className="text-sm text-gray-900">{selectedComplaint.subject || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Description</h4>
                        <p className="text-sm text-gray-900">{selectedComplaint.description || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Date de soumission</h4>
                        <p className="text-sm text-gray-900">{formatDate(selectedComplaint.created_at)}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Statut</h4>
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeColor(selectedComplaint.status)}`}>
                          {getStatusText(selectedComplaint.status)}
                        </span>
                      </div>
                      
                      {/* Response section */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          {selectedComplaint.status !== 'pending' ? 'Réponse' : 'Votre réponse'}
                        </h4>
                        {selectedComplaint.status === 'pending' ? (
                          <textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            placeholder="Saisissez votre réponse ici..."
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            rows={4}
                          />
                        ) : (
                          <p className="text-sm text-gray-900">{selectedComplaint.resolution_details || 'Aucune réponse fournie'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Fermer
                </button>
                
                {selectedComplaint.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleResolve(selectedComplaint.id, responseText)}
                      className="ml-3 inline-flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Résoudre
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(selectedComplaint.id)}
                      className="ml-3 inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Rejeter
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintReviews;
