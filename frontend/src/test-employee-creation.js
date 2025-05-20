// Script de test pour la création d'employé
const axios = require('axios');

// Configuration de base
const API_URL = 'http://localhost:8000';

// Données de test pour un nouvel employé
const employeeData = {
  name: 'Test Utilisateur',
  email: 'test@example.com',
  password: 'password123',
  position: 'Développeur',
  department: 'Informatique',
  employee_id: `EMP-${Date.now().toString().slice(-6)}`,
  hire_date: new Date().toISOString().split('T')[0],
  leave_balance: 20,
  role: 'employee',
  status: 'active'
};

console.log('Données envoyées au backend:', employeeData);

// Fonction pour tester la création d'un employé
async function testCreateEmployee() {
  try {
    const response = await axios.post(`${API_URL}/api/employees`, employeeData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('Réponse du serveur:', response.data);
    console.log('Employé créé avec succès!');
  } catch (error) {
    console.error('Erreur lors de la création de l\'employé:');
    
    if (error.response) {
      // Le serveur a répondu avec un code d'erreur
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Data:', error.response.data);
      
      // Afficher les erreurs de validation en détail
      if (error.response.data && error.response.data.errors) {
        console.error('\nErreurs de validation:');
        Object.entries(error.response.data.errors).forEach(([field, messages]) => {
          console.error(`- ${field}: ${messages.join(', ')}`);
        });
      }
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      console.error('Aucune réponse reçue:', error.request);
    } else {
      // Une erreur s'est produite lors de la configuration de la requête
      console.error('Erreur de configuration:', error.message);
    }
  }
}

// Exécuter le test
testCreateEmployee();
