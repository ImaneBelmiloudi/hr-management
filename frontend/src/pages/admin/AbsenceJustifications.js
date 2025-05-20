import React, { useState, useEffect } from 'react';
import { FaSearch, FaCheck, FaTimes, FaEye, FaFileDownload } from 'react-icons/fa';
import api from '../../services/api';

const AbsenceJustifications = () => {
  const [justifications, setJustifications] = useState([]);
  const [filteredJustifications, setFilteredJustifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJustification, setSelectedJustification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Status filter
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch absence justifications
  useEffect(() => {
    const fetchJustifications = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/absence-justifications');
        
        // Ensure justifications is always an array
        const justificationsData = Array.isArray(response.data) ? response.data : 
                                 (response.data && Array.isArray(response.data.data)) ? response.data.data : [];
        
        setJustifications(justificationsData);
        setFilteredJustifications(justificationsData);
      } catch (err) {
        console.error('Error fetching absence justifications:', err);
        setError('Impossible de charger les justificatifs d\'absence. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchJustifications();
  }, []);

  // Filter justifications based on search term and status
  useEffect(() => {
    let filtered = justifications;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(justification => justification.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(justification => 
        (justification.employee && justification.employee.name && 
         justification.employee.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (justification.reason && justification.reason.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (justification.type && justification.type.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredJustifications(filtered);
  }, [searchTerm, statusFilter, justifications]);

  // Handle view justification details
  const handleViewDetails = (justification) => {
    setSelectedJustification(justification);
    setIsModalOpen(true);
  };

  // Handle approve justification
  const handleApprove = async (id) => {
    try {
      setLoading(true);
      await api.post(`/api/absence-justifications/${id}/status`, {
        status: 'approved'
      });
      
      // Update local state
      setJustifications(justifications.map(justification => 
        justification.id === id ? { ...justification, status: 'approved' } : justification
      ));
      
      // Close modal if open
      if (isModalOpen && selectedJustification && selectedJustification.id === id) {
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error('Error approving absence justification:', err);
      setError('Impossible d\'approuver le justificatif. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };

  // Handle reject justification
  const handleReject = async (id) => {
    try {
      setLoading(true);
      await api.post(`/api/absence-justifications/${id}/status`, {
        status: 'rejected',
        rejection_reason: 'Justification rejected by Admin' // Default rejection reason
      });
      
      // Update local state
      setJustifications(justifications.map(justification => 
        justification.id === id ? { ...justification, status: 'rejected' } : justification
      ));
      
      // Close modal if open
      if (isModalOpen && selectedJustification && selectedJustification.id === id) {
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error('Error rejecting absence justification:', err);
      setError('Impossible de rejeter le justificatif. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };

  // Handle download document
  const handleDownload = async (documentUrl) => {
    if (!documentUrl) {
      alert('Aucun document disponible pour téléchargement.');
      return;
    }
    
    try {
      window.open(documentUrl, '_blank');
    } catch (err) {
      console.error('Error downloading document:', err);
      alert('Impossible de télécharger le document. Veuillez réessayer plus tard.');
    }
  };

  // Helper function to get employee name
  const getEmployeeName = (justification) => {
    return justification.employee?.user?.name || 'N/A';
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
      case 'approved':
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
      case 'approved':
        return 'Approuvé';
      case 'rejected':
        return 'Rejeté';
      default:
        return 'Inconnu';
    }
  };

  if (loading && justifications.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <span className="text-sm font-medium text-gray-500">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error && justifications.length === 0) {
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
      <h1 className="text-2xl font-bold text-gray-900">Justificatifs d'Absence</h1>

      {/* Filters */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
        {/* Search */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher justificatifs..."
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
            <option value="approved">Approuvé</option>
            <option value="rejected">Rejeté</option>
          </select>
        </div>
      </div>

      {/* Justifications List */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-medium text-gray-900">Justificatifs d'Absence</h2>
        
        {filteredJustifications.length === 0 ? (
          <p className="text-gray-500">Aucun justificatif d'absence trouvé.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Employé</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date de début</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date de fin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredJustifications.map((justification) => (
                  <tr key={justification.id}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                          <span className="text-sm font-medium text-blue-800">
                            {getInitials(getEmployeeName(justification))}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{getEmployeeName(justification)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{justification.type || 'N/A'}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{formatDate(justification.start_date || justification.absence_start_date)}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{formatDate(justification.end_date || justification.absence_end_date)}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeColor(justification.status)}`}>
                        {getStatusText(justification.status)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetails(justification)}
                          className="rounded p-1 text-blue-600 hover:bg-blue-100"
                          title="Voir détails"
                        >
                          <FaEye />
                        </button>
                        
                        {justification.document_url && (
                          <button
                            onClick={() => handleDownload(justification.document_url)}
                            className="rounded p-1 text-blue-600 hover:bg-blue-100"
                            title="Télécharger document"
                          >
                            <FaFileDownload />
                          </button>
                        )}
                        
                        {justification.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(justification.id)}
                              className="rounded p-1 text-green-600 hover:bg-green-100"
                              title="Approuver"
                            >
                              <FaCheck />
                            </button>
                            <button
                              onClick={() => handleReject(justification.id)}
                              className="rounded p-1 text-red-600 hover:bg-red-100"
                              title="Rejeter"
                            >
                              <FaTimes />
                            </button>
                          </>
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

      {/* Modal for justification details */}
      {isModalOpen && selectedJustification && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>

            <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 w-full text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Détails du justificatif d'absence</h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Employé</h4>
                        <p className="text-sm text-gray-900">{getEmployeeName(selectedJustification)}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Type d'absence</h4>
                        <p className="text-sm text-gray-900">{selectedJustification.type || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Période</h4>
                        <p className="text-sm text-gray-900">
                          Du {formatDate(selectedJustification.start_date)} au {formatDate(selectedJustification.end_date)}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Raison</h4>
                        <p className="text-sm text-gray-900">{selectedJustification.reason || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Statut</h4>
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeColor(selectedJustification.status)}`}>
                          {getStatusText(selectedJustification.status)}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Document</h4>
                        {selectedJustification.document_url ? (
                          <button
                            onClick={() => handleDownload(selectedJustification.document_url)}
                            className="mt-1 flex items-center text-sm text-blue-600 hover:text-blue-800"
                          >
                            <FaFileDownload className="mr-1" />
                            Télécharger le document
                          </button>
                        ) : (
                          <p className="text-sm text-gray-900">Aucun document fourni</p>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Date de soumission</h4>
                        <p className="text-sm text-gray-900">{formatDate(selectedJustification.created_at)}</p>
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
                
                {selectedJustification.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleApprove(selectedJustification.id)}
                      className="ml-3 inline-flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Approuver
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(selectedJustification.id)}
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

export default AbsenceJustifications;
