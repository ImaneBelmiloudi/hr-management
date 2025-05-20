import React, { useState, useEffect } from 'react';
import { FaExclamationCircle, FaPlus, FaSearch, FaEye, FaTimes } from 'react-icons/fa';
import { complaintService } from '../../services/complaint.service';

const Complaint = () => {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    subject: '',
    description: ''
  });

  // Fetch complaints
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const response = await complaintService.getComplaints();
        
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

  // Filter complaints based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredComplaints(complaints);
    } else {
      const filtered = complaints.filter(complaint => 
        (complaint.subject && complaint.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (complaint.description && complaint.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (complaint.status && complaint.status.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredComplaints(filtered);
    }
  }, [searchTerm, complaints]);

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
        subject: '',
        description: ''
      });
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await complaintService.createComplaint(formData);
      // Re-fetch complaints to ensure correct format
      const response = await complaintService.getComplaints();
      const complaintsData = Array.isArray(response.data) ? response.data : 
        (response.data && Array.isArray(response.data.data)) ? response.data.data : [];
      setComplaints(complaintsData);
      setFilteredComplaints(complaintsData);
      // Reset form and hide it
      setFormData({
        subject: '',
        description: ''
      });
      setIsFormVisible(false);
    } catch (err) {
      console.error('Error creating complaint:', err);
      setError('Impossible de créer la réclamation. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };

  // View complaint details
  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setIsModalOpen(true);
  };

  // Delete complaint
  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment annuler cette réclamation ?')) return;
    try {
      setLoading(true);
      await complaintService.deleteComplaint(id);
      setComplaints(complaints.filter(c => c.id !== id));
      setFilteredComplaints(filteredComplaints.filter(c => c.id !== id));
    } catch (err) {
      alert('Erreur lors de l\'annulation.');
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Mes Réclamations</h1>
        <button
          onClick={toggleForm}
          className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {isFormVisible ? 'Annuler' : (
            <>
              <FaPlus className="mr-2" />
              Nouvelle réclamation
            </>
          )}
        </button>
      </div>

      {/* Form for adding complaint */}
      {isFormVisible && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-medium text-gray-900">Nouvelle réclamation</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Sujet</label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <FaExclamationCircle className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  placeholder="Sujet de votre réclamation"
                  className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
                placeholder="Décrivez votre réclamation en détail"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Chargement...' : 'Soumettre la réclamation'}
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

      {/* Complaints List */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-medium text-gray-900">Historique des réclamations</h2>
        
        {filteredComplaints.length === 0 ? (
          <p className="text-gray-500">Aucune réclamation trouvée.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Sujet</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date de soumission</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredComplaints.map((complaint) => (
                  <tr key={complaint.id}>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                        {complaint.subject || 'N/A'}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeColor(complaint.status)}`}>
                        {getStatusText(complaint.status)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {formatDate(complaint.created_at)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleViewDetails(complaint)}
                          className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <FaEye className="mr-1" />
                          <span>Voir détails</span>
                        </button>
                        {complaint.status === 'pending' && (
                          <button
                            onClick={() => handleDelete(complaint.id)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-800"
                          >
                            <FaTimes />
                            Annuler
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

      {/* Modal for complaint details */}
      {isModalOpen && selectedComplaint && (
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
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Détails de la réclamation</h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Sujet</h4>
                        <p className="text-sm text-gray-900">{selectedComplaint.subject || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Description</h4>
                        <p className="text-sm text-gray-900 whitespace-pre-line">{selectedComplaint.description && selectedComplaint.description.trim() !== '' ? selectedComplaint.description : 'Aucune description fournie'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Statut</h4>
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeColor(selectedComplaint.status)}`}>
                          {getStatusText(selectedComplaint.status)}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Date de soumission</h4>
                        <p className="text-sm text-gray-900">{formatDate(selectedComplaint.created_at)}</p>
                      </div>
                      
                      {/* Response from admin/HR */}
                      {(selectedComplaint.status === 'resolved' || selectedComplaint.status === 'rejected') && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Réponse</h4>
                          <p className="text-sm text-gray-900">{selectedComplaint.resolution_details || 'Aucune réponse fournie'}</p>
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

export default Complaint;
