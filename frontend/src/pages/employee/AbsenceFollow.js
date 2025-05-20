import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClipboardList, FaPlus, FaFileUpload, FaSearch, FaFileDownload, FaTimes, FaEye } from 'react-icons/fa';
import { employeeAbsenceJustificationService } from '../../services/employee-absence-justification.service';

const AbsenceFollow = () => {
  const [justifications, setJustifications] = useState([]);
  const [filteredJustifications, setFilteredJustifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedJustification, setSelectedJustification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    type: '',
    reason: '',
    document: null
  });

  // Fetch absence justifications
  useEffect(() => {
    const fetchJustifications = async () => {
      try {
        setLoading(true);
        const response = await employeeAbsenceJustificationService.getAbsenceJustifications();
        
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

  // Filter justifications based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredJustifications(justifications);
    } else {
      const filtered = justifications.filter(justification => 
        (justification.type && justification.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (justification.reason && justification.reason.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (justification.status && justification.status.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredJustifications(filtered);
    }
  }, [searchTerm, justifications]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle file input change
  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      document: e.target.files[0]
    });
  };

  // Toggle form visibility
  const toggleForm = () => {
    setIsFormVisible(!isFormVisible);
    if (!isFormVisible) {
      // Reset form when opening
      setFormData({
        start_date: '',
        end_date: '',
        type: '',
        reason: '',
        document: null
      });
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate dates
    if (!formData.start_date || !formData.end_date) {
      setError('Veuillez remplir les deux dates.');
      return;
    }
    if (!formData.type) {
      setError('Veuillez sélectionner le type d\'absence.');
      return;
    }
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);
    if (endDate < startDate) {
      setError('La date de fin ne peut pas être antérieure à la date de début.');
      return;
    }
    try {
      setLoading(true);
      // Calculate duration
      const duration = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
      // Create FormData for file upload with correct field names
      const formDataToSend = new FormData();
      formDataToSend.append('absence_date', formData.start_date);
      formDataToSend.append('duration', duration);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('reason', formData.reason);
      if (formData.document) {
        formDataToSend.append('document', formData.document);
      }
      // Debug: log formDataToSend values
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0]+ ': ' + pair[1]);
      }
      await employeeAbsenceJustificationService.createAbsenceJustification(formDataToSend);
      // Re-fetch justifications to ensure correct format and download links
      const response = await employeeAbsenceJustificationService.getAbsenceJustifications();
      const justificationsData = Array.isArray(response.data) ? response.data : 
        (response.data && Array.isArray(response.data.data)) ? response.data.data : [];
      setJustifications(justificationsData);
      setFilteredJustifications(justificationsData);
      // Reset form and hide it
      setFormData({
        start_date: '',
        end_date: '',
        type: '',
        reason: '',
        document: null
      });
      setIsFormVisible(false);
    } catch (err) {
      console.error('Error creating absence justification:', err);
      if (err.response) {
        console.error('Backend response data:', err.response.data);
        alert('Erreur 422: ' + JSON.stringify(err.response.data));
      }
      setError('Impossible de créer le justificatif d\'absence. Veuillez réessayer plus tard.');
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

  // Handle view justification details
  const handleViewDetails = (justification) => {
    setSelectedJustification(justification);
    setIsModalOpen(true);
  };

  // Delete justification
  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce justificatif ?')) return;
    try {
      setLoading(true);
      await employeeAbsenceJustificationService.deleteAbsenceJustification(id);
      setJustifications(justifications.filter(j => j.id !== id));
      setFilteredJustifications(filteredJustifications.filter(j => j.id !== id));
    } catch (err) {
      alert('Erreur lors de la suppression.');
    } finally {
      setLoading(false);
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Suivi des absences</h1>
        <button
          onClick={toggleForm}
          className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {isFormVisible ? 'Annuler' : (
            <>
              <FaPlus className="mr-2" />
              Nouveau justificatif
            </>
          )}
        </button>
      </div>

      {/* Form for adding absence justification */}
      {isFormVisible && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-medium text-gray-900">Nouveau justificatif d'absence</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Type Select */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type d'absence</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Sélectionner le type</option>
                  <option value="Maladie">Maladie</option>
                  <option value="Congé">Congé</option>
                  <option value="Autre">Autre</option>
                </select>
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
                    onChange={handleInputChange}
                    required
                    className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              {/* Document Upload */}
              <div>
                <label htmlFor="document" className="block text-sm font-medium text-gray-700">Document justificatif</label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <FaFileUpload className="text-gray-400" />
                  </div>
                  <input
                    type="file"
                    id="document"
                    name="document"
                    onChange={handleFileChange}
                    className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Formats acceptés: PDF, JPG, PNG (max 5MB)</p>
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
                  placeholder="Veuillez expliquer la raison de votre absence"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Chargement...' : 'Soumettre le justificatif'}
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

      {/* Justifications List */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-medium text-gray-900">Historique des justificatifs</h2>
        
        {filteredJustifications.length === 0 ? (
          <p className="text-gray-500">Aucun justificatif d'absence trouvé.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">PÉRIODE</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">RAISON</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">DOCUMENT</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">STATUT</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">DATE DE SOUMISSION</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredJustifications.map((justification) => (
                  <tr key={justification.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{justification.type || 'N/A'}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {justification.absence_date
                        ? (() => {
                            const start = new Date(justification.absence_date);
                            const end = new Date(start);
                            end.setDate(start.getDate() + (justification.duration ? justification.duration - 1 : 0));
                            return `${formatDate(start)} - ${formatDate(end)}`;
                          })()
                        : 'N/A - N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                        {justification.reason || 'N/A'}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {justification.document_url ? (
                        <button
                          onClick={() => handleDownload(justification.document_url)}
                          className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <FaFileDownload className="mr-1" />
                          <span>Télécharger</span>
                        </button>
                      ) : (
                        'Aucun document'
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeColor(justification.status)}`}>
                        {getStatusText(justification.status)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {formatDate(justification.created_at)}
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
                          <button
                            onClick={() => handleDelete(justification.id)}
                            className="rounded p-1 text-red-600 hover:bg-red-100"
                            title="Supprimer"
                          >
                            <FaTimes />
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
      
      {/* Modal for viewing justification details */}
      {isModalOpen && selectedJustification && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
            <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 w-full text-center sm:mt-0 sm:text-left">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Détails du justificatif d'absence</h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Type d'absence</h4>
                        <p className="text-sm text-gray-900">{selectedJustification.type || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Date</h4>
                        <p className="text-sm text-gray-900">{formatDate(selectedJustification.absence_date)}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Durée</h4>
                        <p className="text-sm text-gray-900">{selectedJustification.duration} jour(s)</p>
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
                      {selectedJustification.document_url && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Document</h4>
                          <button
                            onClick={() => handleDownload(selectedJustification.document_url)}
                            className="mt-1 inline-flex items-center rounded-md border border-transparent bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200"
                          >
                            <FaFileDownload className="mr-2" />
                            Télécharger
                          </button>
                        </div>
                      )}
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AbsenceFollow;
